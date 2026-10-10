#!/usr/bin/env bash
# WireGuard VPN server + provisioning API + usage/expiry sync (run as root on the Bangladesh VPS)
# Placeholders __TOKEN__ and __SYNC_URL__ are filled in by the wg-setup edge function.
# This script does NOT touch OpenVPN Access Server: WireGuard uses UDP 51820 and the API uses TCP 18444.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "Run this script as root"; exit 1; }
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y wireguard-tools python3 curl iptables
modprobe wireguard 2>/dev/null || true

WAN="$(ip -4 route show default | awk '{print $5; exit}')"
PUBIP="$(curl -4 -fsS --max-time 10 https://ifconfig.me 2>/dev/null || true)"
[ -n "$PUBIP" ] || PUBIP="$(ip -4 route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)"
umask 077
mkdir -p /etc/wireguard /var/lib/wg-api
[ -f /etc/wireguard/server.key ] || wg genkey > /etc/wireguard/server.key
wg pubkey < /etc/wireguard/server.key > /etc/wireguard/server.pub
echo -n "$PUBIP" > /etc/wg-api.endpoint
echo -n "__TOKEN__" > /etc/wg-api.token
chmod 600 /etc/wg-api.token

# Server interface only. Customer peers are added and removed live by the API (never written here).
cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = 10.80.0.1/22
ListenPort = 51820
PrivateKey = $(cat /etc/wireguard/server.key)
PostUp = iptables -t nat -C POSTROUTING -s 10.80.0.0/22 -o $WAN -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -s 10.80.0.0/22 -o $WAN -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.80.0.0/22 -o $WAN -j MASQUERADE 2>/dev/null || true
EOF
chmod 600 /etc/wireguard/wg0.conf
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-wg.conf
sysctl -w net.ipv4.ip_forward=1 >/dev/null
systemctl enable wg-quick@wg0 >/dev/null 2>&1
systemctl restart wg-quick@wg0

cat > /usr/local/bin/wg-api.py <<'PY'
#!/usr/bin/env python3
import ipaddress, json, os, re, subprocess, threading, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

os.umask(0o077)
TOKEN = open("/etc/wg-api.token").read().strip()
SYNC_URL = "__SYNC_URL__"
ENDPOINT = open("/etc/wg-api.endpoint").read().strip()
SERVER_PUB = open("/etc/wireguard/server.pub").read().strip()
DNS = "1.1.1.1, 8.8.8.8"
IFACE = "wg0"
NET = ipaddress.ip_network("10.80.0.0/22")
NAME = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
STATE = "/var/lib/wg-api/state.json"
PORT = 18444
LOCK = threading.RLock()


def sh(*a, inp=None):
    return subprocess.run(list(a), input=inp, capture_output=True, text=True, timeout=30)


def load():
    try:
        s = json.load(open(STATE))
    except Exception:
        s = {}
    for k, v in (("clients", {}), ("last", {}), ("pending", {}), ("active", [])):
        s.setdefault(k, v)
    return s


S = load()


def save():
    tmp = STATE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(S, f)
    os.replace(tmp, STATE)


def wan():
    p = sh("ip", "-4", "route", "show", "default").stdout.split()
    return p[p.index("dev") + 1] if "dev" in p else "eth0"


def ensure_nat():
    args = ["POSTROUTING", "-s", str(NET), "-o", wan(), "-j", "MASQUERADE"]
    if sh("iptables", "-t", "nat", "-C", *args).returncode != 0:
        sh("iptables", "-t", "nat", "-A", *args)


def peers_now():
    out = {}
    for line in sh("wg", "show", IFACE, "dump").stdout.splitlines()[1:]:
        p = line.split("\t")
        if len(p) >= 8:
            out[p[0]] = int(p[5]) + int(p[6])
    return out


def add_peer(c):
    sh("wg", "set", IFACE, "peer", c["pub"], "allowed-ips", c["ip"] + "/32")


def del_peer(pub):
    sh("wg", "set", IFACE, "peer", pub, "remove")


def alloc_ip():
    used = {c["ip"] for c in S["clients"].values()}
    for h in NET.hosts():
        ip = str(h)
        if ip != "10.80.0.1" and ip not in used:
            return ip
    return None


def conf(c):
    return (
        f"[Interface]\nPrivateKey = {c['priv']}\nAddress = {c['ip']}/32\nDNS = {DNS}\nMTU = 1380\n\n"
        f"[Peer]\nPublicKey = {SERVER_PUB}\nEndpoint = {ENDPOINT}:51820\n"
        f"AllowedIPs = 0.0.0.0/0, ::/0\nPersistentKeepalive = 25\n"
    )


def create(name):
    with LOCK:
        c = S["clients"].get(name)
        if not c:
            priv = sh("wg", "genkey").stdout.strip()
            pub = sh("wg", "pubkey", inp=priv + "\n").stdout.strip()
            ip = alloc_ip()
            if not (priv and pub and ip):
                return None
            c = {"priv": priv, "pub": pub, "ip": ip}
            S["clients"][name] = c
        add_peer(c)
        if name not in S["active"]:
            S["active"].append(name)
        save()
        return conf(c)


def revoke(name):
    with LOCK:
        c = S["clients"].pop(name, None)
        if c:
            del_peer(c["pub"])
            S["last"].pop(c["pub"], None)
        S["pending"].pop(name, None)
        if name in S["active"]:
            S["active"].remove(name)
        save()
    return True


def apply_peers(act):
    now = peers_now()
    by_pub = {c["pub"]: n for n, c in S["clients"].items()}
    for pub in list(now):
        n = by_pub.get(pub)
        if n is None or n not in act:
            del_peer(pub)
    for n in act:
        c = S["clients"].get(n)
        if c and c["pub"] not in now:
            add_peer(c)


class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        b = body if isinstance(body, bytes) else body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

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
        if self.path == "/create":
            text = create(name)
            if text is None:
                return self._send(500, '{"error":"could not create the profile"}')
            return self._send(200, text, "text/plain")
        if self.path == "/revoke":
            return self._send(200, json.dumps({"ok": revoke(name)}))
        self._send(404, '{"error":"not found"}')

    def log_message(self, *a):
        pass


def sync_loop():
    while True:
        try:
            ensure_nat()
            with LOCK:
                by_pub = {c["pub"]: n for n, c in S["clients"].items()}
                for pub, total in peers_now().items():
                    prev = S["last"].get(pub, 0)
                    d = total - prev if total >= prev else total
                    S["last"][pub] = total
                    n = by_pub.get(pub)
                    if n and d > 0:
                        S["pending"][n] = S["pending"].get(n, 0) + d
                usage = dict(S["pending"])
                save()
            req = urllib.request.Request(
                SYNC_URL, json.dumps({"usage": usage}).encode(),
                {"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json", "User-Agent": "wg-sync/1"})
            resp = json.load(urllib.request.urlopen(req, timeout=30))
            act = resp.get("active") if isinstance(resp, dict) else None
            if isinstance(act, list):
                act = [n for n in act if isinstance(n, str) and NAME.match(n)]
                with LOCK:
                    for n, v in usage.items():
                        if n in S["pending"]:
                            S["pending"][n] -= v
                            if S["pending"][n] <= 0:
                                del S["pending"][n]
                    S["active"] = act
                    apply_peers(set(act))
                    save()
        except Exception as e:
            print("sync error:", repr(e), flush=True)
        time.sleep(60)


try:
    with LOCK:
        ensure_nat()
        apply_peers(set(S["active"]))
except Exception as e:
    print("startup error:", repr(e), flush=True)
threading.Thread(target=sync_loop, daemon=True).start()
ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
PY
chmod +x /usr/local/bin/wg-api.py
cat > /etc/systemd/system/wg-api.service <<'UNIT'
[Unit]
Description=WireGuard provisioning API + sync
After=network.target wg-quick@wg0.service
Requires=wg-quick@wg0.service
[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/wg-api.py
Restart=always
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable wg-api >/dev/null 2>&1
systemctl restart wg-api
command -v firewall-cmd >/dev/null && { firewall-cmd --permanent --add-port=51820/udp --add-port=18444/tcp; firewall-cmd --reload; } || true
echo; echo "=== TAYYAR ==="
echo "WireGuard : udp/51820  (public key: $(cat /etc/wireguard/server.pub))"
echo "API URL   : http://$PUBIP:18444"
echo "Agar provider ka firewall hai to UDP 51820 aur TCP 18444 kholna zaroori hai."
