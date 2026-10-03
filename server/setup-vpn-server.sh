#!/usr/bin/env bash
# OpenVPN auto-install + provisioning API + usage/expiry sync (run as root)
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run this script as root"; exit 1; }
cd /root
curl -fsSLO https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh
chmod +x openvpn-install.sh
if ! systemctl is-active --quiet openvpn-server@server; then
  ./openvpn-install.sh install --client firstclient
fi
echo -n "__TOKEN__" > /etc/vpn-api.token; chmod 600 /etc/vpn-api.token
cat > /usr/local/bin/vpn-api.py <<'PY'
#!/usr/bin/env python3
import json, os, re, subprocess, threading, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
TOKEN = open("/etc/vpn-api.token").read().strip()
SYNC_URL = "__SYNC_URL__"
NAME = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
SCRIPT = "/root/openvpn-install.sh"
INDEX = "/etc/openvpn/server/easy-rsa/pki/index.txt"
STATUS = "/var/log/openvpn/status.log"
STATE = "/var/lib/vpn-sync.json"
PORT = 18443
LOCK = threading.Lock()

def run(*a):
    with LOCK:
        return subprocess.run([SCRIPT, *a], capture_output=True, text=True, timeout=120)

def cert_state(name):
    try:
        for line in open(INDEX):
            if line.rstrip().endswith("/CN=" + name):
                return "valid" if line[0] == "V" else "revoked"
    except OSError:
        pass
    return "none"

def revoke(name):
    if cert_state(name) == "valid":
        run("client", "revoke", name, "--force")
    p = f"/root/ovpn/{name}.ovpn"
    if os.path.exists(p):
        os.remove(p)
    return cert_state(name) != "valid"

class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        b = body if isinstance(body, bytes) else body.encode()
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_POST(self):
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            return self._send(401, '{"error":"unauthorized"}')
        try:
            d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except Exception:
            return self._send(400, '{"error":"bad json"}')
        name = str(d.get("name", ""))
        if not NAME.match(name):
            return self._send(400, '{"error":"invalid name"}')
        os.makedirs("/root/ovpn", mode=0o700, exist_ok=True)
        path = f"/root/ovpn/{name}.ovpn"
        if self.path == "/create":
            if not os.path.exists(path):
                if cert_state(name) != "none":
                    return self._send(409, '{"error":"certificate already exists"}')
                r = run("client", "add", name, "--cert-days", str(int(d.get("days", 30)) + 1), "--output", path)
                if r.returncode or not os.path.exists(path):
                    return self._send(500, json.dumps({"error": (r.stderr or r.stdout)[-300:]}))
            return self._send(200, open(path, "rb").read(), "application/x-openvpn-profile")
        if self.path == "/revoke":
            ok = revoke(name)
            return self._send(200 if ok else 500, json.dumps({"ok": ok}))
        self._send(404, '{"error":"not found"}')
    def log_message(self, *a):
        pass

def parse_status():
    out, sec = [], False
    try:
        lines = open(STATUS).read().splitlines()
    except OSError:
        return out
    for l in lines:
        p = l.split(",")
        try:
            if l.startswith("CLIENT_LIST,"):
                out.append((p[1], p[2], int(p[5]) + int(p[6]), p[7]))
            elif l.startswith("Common Name,"):
                sec = True
            elif l.startswith(("ROUTING TABLE", "GLOBAL STATS")):
                sec = False
            elif sec and len(p) >= 5:
                out.append((p[0], p[1], int(p[2]) + int(p[3]), p[4]))
        except (IndexError, ValueError):
            pass
    return out

def sync_loop():
    try:
        s = json.load(open(STATE))
    except Exception:
        s = {"seen": {}, "pending": {}, "revoked": []}
    while True:
        try:
            seen = {}
            for cn, addr, total, since in parse_status():
                k = f"{cn}|{addr}|{since}"
                prev = s["seen"].get(k, 0)
                d = total - prev if total >= prev else total
                if d > 0:
                    s["pending"][cn] = s["pending"].get(cn, 0) + d
                seen[k] = total
            s["seen"] = seen
            req = urllib.request.Request(
                SYNC_URL, json.dumps({"usage": s["pending"], "revoked": s["revoked"]}).encode(),
                {"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json", "User-Agent": "vpn-sync/1"})
            resp = json.load(urllib.request.urlopen(req, timeout=30))
            s["pending"] = {}
            s["revoked"] = [n for n in resp.get("revoke", []) if NAME.match(n) and revoke(n)]
        except Exception as e:
            print("sync error:", repr(e), flush=True)
        try:
            with open(STATE, "w") as f:
                json.dump(s, f)
        except Exception as e:
            print("state error:", repr(e), flush=True)
        time.sleep(60)

threading.Thread(target=sync_loop, daemon=True).start()
ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
PY
chmod +x /usr/local/bin/vpn-api.py
cat > /etc/systemd/system/vpn-api.service <<'UNIT'
[Unit]
Description=VPN provisioning API + sync
After=network.target openvpn-server@server.service
[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/vpn-api.py
Restart=always
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable vpn-api
systemctl restart vpn-api
command -v firewall-cmd >/dev/null && { firewall-cmd --permanent --add-port=18443/tcp; firewall-cmd --reload; } || true
echo; echo "=== TAYYAR ==="
echo "API URL : http://$(curl -s ifconfig.me):18443"
