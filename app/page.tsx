'use client';

import React, { useState, useEffect } from 'react';
import { 
  CustomerAccount, 
  ResellerAgency, 
  TransactionRecord, 
  INITIAL_CUSTOMERS, 
  INITIAL_RESELLERS, 
  INITIAL_TRANSACTIONS,
  CREDIT_PACKAGES,
  VALID_COUPONS,
  CreditPackage,
  OpenVpnAccount,
  INITIAL_OPENVPN_ACCOUNTS
} from '../lib/suauthData';
import ResellerPanel from '../components/ResellerPanel';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wallet, 
  ArrowLeftRight, 
  Settings, 
  LogOut, 
  Radio, 
  Shield, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff, 
  PlusCircle, 
  UserPlus,
  Smartphone, 
  Apple, 
  Search, 
  X, 
  Menu, 
  Server, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Facebook, 
  Link as LinkIcon, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Globe2, 
  Zap, 
  RefreshCw, 
  Tag, 
  Percent, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  HelpCircle,
  Clock,
  Sun,
  Moon,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Send,
  Mail,
  Headphones,
  CreditCard,
  Building2,
  Globe,
  Video,
  Key
} from 'lucide-react';

interface StarTrail {
  radius: number;
  angle: number;
  speed: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
}

function StarVortexCanvas({ className = '' }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = typeof window !== 'undefined' ? window.innerWidth : 1200);
    let height = (canvas.height = typeof window !== 'undefined' ? window.innerHeight : 800);

    const colors = [
      '#ffffff',
      '#ffffff',
      '#f1f5f9',
      '#a5f3fc',
      '#bae6fd',
      '#38bdf8',
    ];

    const numTrails = 320;
    let trails: StarTrail[] = [];

    const initTrails = () => {
      trails = [];
      const maxRadius = Math.sqrt(width * width + height * height) * 0.85;
      for (let i = 0; i < numTrails; i++) {
        const radius = Math.pow(Math.random(), 0.75) * maxRadius + 20;
        trails.push({
          radius,
          angle: Math.random() * Math.PI * 2,
          speed: (0.0018 + (1 / Math.sqrt(radius)) * 0.045) * (0.8 + Math.random() * 0.5),
          length: 0.12 + Math.random() * 0.28,
          width: 1.2 + Math.random() * 2.2,
          alpha: 0.45 + Math.random() * 0.55,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initTrails();
    };

    window.addEventListener('resize', handleResize);
    initTrails();

    const render = () => {
      ctx.fillStyle = 'rgba(5, 9, 24, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.42;

      trails.forEach((trail) => {
        trail.angle += trail.speed;
        if (trail.angle > Math.PI * 2) {
          trail.angle -= Math.PI * 2;
        }

        const startAngle = trail.angle;
        const endAngle = trail.angle + trail.length;

        ctx.beginPath();
        ctx.arc(centerX, centerY, trail.radius, startAngle, endAngle, false);
        ctx.strokeStyle = trail.color;
        ctx.lineWidth = trail.width;
        ctx.globalAlpha = trail.alpha;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = trail.color;
        ctx.stroke();

        const headX = centerX + Math.cos(endAngle) * trail.radius;
        const headY = centerY + Math.sin(endAngle) * trail.radius;

        ctx.beginPath();
        ctx.arc(headX, headY, trail.width * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      const grad = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, width * 0.9);
      grad.addColorStop(0, 'rgba(5, 9, 24, 0.0)');
      grad.addColorStop(0.75, 'rgba(5, 9, 24, 0.35)');
      grad.addColorStop(1, 'rgba(3, 6, 16, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    ctx.fillStyle = '#050918';
    ctx.fillRect(0, 0, width, height);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

export default function MaheHubEnterpriseSystem() {
  // Navigation: 'home' | 'login' | 'portal' | 'user_import'
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'portal' | 'user_import'>('home');

  // Active Role in Portal: 'reseller' or 'admin'
  const [portalRole, setPortalRole] = useState<'reseller' | 'admin'>('reseller');

  // Portal active tab (defaults to vpn - OpenVPN Reseller Panel matching ovpns.online from video)
  const [portalTab, setPortalTab] = useState<'dashboard' | 'vpn' | 'customers' | 'resellers' | 'dns' | 'topup' | 'transactions' | 'settings'>('vpn');

  // OpenVPN Reseller Panel System (Matching ovpns.online shown in Client Video)
  const [openVpnAccounts, setOpenVpnAccounts] = useState<OpenVpnAccount[]>(INITIAL_OPENVPN_ACCOUNTS);
  const [resellerTakaBalance, setResellerTakaBalance] = useState<number>(461.00); // ৳461.00 from client's video
  const [vpnSearchQuery, setVpnSearchQuery] = useState('');
  
  // Create OpenVPN User Modal State
  const [isOpenVpnCreateOpen, setIsOpenVpnCreateOpen] = useState(false);
  const [newVpnUsername, setNewVpnUsername] = useState('');
  const [newVpnPassword, setNewVpnPassword] = useState('');
  const [newVpnServer, setNewVpnServer] = useState('bangladesh (only normal) (Migrated)');
  const [newVpnDays, setNewVpnDays] = useState(30);
  const [newVpnBandwidthType, setNewVpnBandwidthType] = useState<'Limited' | 'Unlimited'>('Limited');
  const [newVpnBandwidthGb, setNewVpnBandwidthGb] = useState(10);
  const [createVpnError, setCreateVpnError] = useState<string | null>(null);

  // Ready Account Slip Modal State ("Your VPN Account is Ready")
  const [vpnReadyAccount, setVpnReadyAccount] = useState<OpenVpnAccount | null>(null);

  // Renew Modal State
  const [renewVpnAccount, setRenewVpnAccount] = useState<OpenVpnAccount | null>(null);
  const [renewVpnDays, setRenewVpnDays] = useState(30);
  const [renewVpnBandwidthType, setRenewVpnBandwidthType] = useState<'Limited' | 'Unlimited'>('Limited');
  const [renewVpnBandwidthGb, setRenewVpnBandwidthGb] = useState(10);

  // Customer Import View State (matching minute 6:13 of video)
  const [importUserAccount, setImportUserAccount] = useState<OpenVpnAccount | null>(INITIAL_OPENVPN_ACCOUNTS[0]);
  const [isImportPasswordModalOpen, setIsImportPasswordModalOpen] = useState(false);
  const [inputImportPassword, setInputImportPassword] = useState('');
  const [importPasswordError, setImportPasswordError] = useState<string | null>(null);
  const [importConnectSuccess, setImportConnectSuccess] = useState(false);

  // Interactive Generator on Home Page
  const [homeGeneratorHost, setHomeGeneratorHost] = useState('user-8801968117.new2.mahehub.com');
  const [homeDownloaded, setHomeDownloaded] = useState(false);
  const [homeLink, setHomeLink] = useState('');
  const [trialName, setTrialName] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [trialBusy, setTrialBusy] = useState(false);
  const [trialErr, setTrialErr] = useState('');
  const [trialLink, setTrialLink] = useState('');
  const submitFreeTrial = async () => {
    setTrialErr('');
    const ph = trialPhone.replace(/[\s()-]/g, '');
    if (trialName.trim().length < 2) { setTrialErr('Please enter your name'); return; }
    if (!/^\+[1-9][0-9]{7,14}$/.test(ph)) { setTrialErr('Enter your WhatsApp number with country code, starting with + (example +966501234567)'); return; }
    setTrialBusy(true);
    const { data, error } = await supabase.rpc('public_free_trial', { p_name: trialName.trim(), p_phone: ph });
    setTrialBusy(false);
    if (error || !data?.token) { setTrialErr(error?.message || 'Could not create the trial. Please try again.'); return; }
    setTrialLink(`${window.location.origin}/c/?t=${data.token}`);
  };
  const [homeInfo, setHomeInfo] = useState<{ found: boolean; valid?: boolean; hostname?: string; phone_hint?: string; expiry_date?: string; days_left?: number } | null>(null);
  const [homeChecking, setHomeChecking] = useState(false);
  const DNS_PORTAL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssaqdsqopxclkplstpzj.supabase.co') + '/functions/v1/dns-portal';
  const homeToken = (() => {
    const v = homeLink.trim();
    if (!v) return '';
    try { const u = new URL(v); return u.searchParams.get('t') || ''; } catch { /* not a URL */ }
    const m = v.match(/[?&]t=([^&\s]+)/);
    return m ? decodeURIComponent(m[1]) : (/^[A-Za-z0-9_-]{8,}$/.test(v) ? v : '');
  })();
  useEffect(() => {
    setHomeInfo(null);
    if (!homeToken) { setHomeChecking(false); return; }
    setHomeChecking(true);
    const h = setTimeout(() => {
      fetch(`${DNS_PORTAL}?t=${encodeURIComponent(homeToken)}`)
        .then((r) => (r.ok ? r.json() : { found: false }))
        .then((d) => setHomeInfo(d))
        .catch(() => setHomeInfo({ found: false }))
        .finally(() => setHomeChecking(false));
    }, 500);
    return () => clearTimeout(h);
  }, [homeToken]);
  const [activeSetupTab, setActiveSetupTab] = useState<'iphone' | 'android' | 'openvpn'>('iphone');
  const [resellerSalesSlider, setResellerSalesSlider] = useState<number>(50);

  // Seller Login Form States
  const [loginEmail, setLoginEmail] = useState('admin@mahehub.com');
  const [loginPass, setLoginPass] = useState('password123');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Light / Dark Mode Theme System (Defaults to Dark mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Floating Global WhatsApp & Contact Drawer
  const [showFloatingSupport, setShowFloatingSupport] = useState(false);

  // B2B Server API Simulator States (Requested by Client in Audio)
  const [apiPhoneInput, setApiPhoneInput] = useState('+880 1731-03546');
  const [apiServiceSelected, setApiServiceSelected] = useState('Netflix 4K UHD Bypass');
  const [apiTestResponse, setApiTestResponse] = useState<string | null>(null);
  const [apiIsTesting, setApiIsTesting] = useState(false);
  const [b2bApiTab, setB2bApiTab] = useState<'dns' | 'openvpn' | 'combo'>('dns');

  // Dedicated Separate Server Settings (Client Audio Requirement: DNS & OpenVPN must NEVER share the same server IP)
  const [liveDnsVpsIp, setLiveDnsVpsIp] = useState('103.145.118.24');
  const [liveVpnVpsIp, setLiveVpnVpsIp] = useState('185.220.101.55');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [openVpnDownloadMode, setOpenVpnDownloadMode] = useState<'passwordless' | 'token'>('passwordless');

  // Toast Notification System (Replaces crashing window.alert in iframes)
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Main Reactive States
  const [customers, setCustomers] = useState<CustomerAccount[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [resellers, setResellers] = useState<ResellerAgency[]>(INITIAL_RESELLERS);
  
  // Reseller Credit Balance (Audio 8 requirement)
  const [activeResellerCredits, setActiveResellerCredits] = useState<number>(62); // 62 credits
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Referral link: ?ref=CODE opens the reseller sign-up screen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const c = (new URLSearchParams(window.location.search).get('ref') || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    if (!c) return;
    try { sessionStorage.setItem('mh_ref', c); } catch { /* ignore */ }
    setCurrentView('login');
  }, []);

  // Customer import link: ?view=user_import&user=NAME[&d=payload] opens the customer page directly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('view') !== 'user_import') return;
    const name = (q.get('user') || '').toLowerCase();
    let acc = INITIAL_OPENVPN_ACCOUNTS.find(a => a.username.toLowerCase() === name) || null;
    const d = q.get('d');
    if (d) {
      try {
        const p = JSON.parse(atob(decodeURIComponent(d)));
        acc = {
          id: 'LINK-' + p.u, username: p.u, password: '', server: p.s, serverHost: p.h,
          days: p.d, bandwidthType: p.t, bandwidthGb: p.g, usedMb: 0, totalPriceBdt: 0,
          startDate: '', expiryDate: p.e, status: 'active', importLink: window.location.href,
          multiServerFailover: ['103.145.118.24', '185.220.101.55', '45.148.12.80'],
        };
      } catch { /* ignore bad payload */ }
    }
    if (acc) { setImportUserAccount(acc); setCurrentView('user_import'); }
    // live data from Supabase (no password is ever returned)
    supabase.rpc('get_import_info', { p_username: name }).then(({ data }) => {
      const r: any = Array.isArray(data) ? data[0] : data;
      if (!r) return;
      setImportUserAccount({
        id: 'LIVE-' + r.username, username: r.username, password: '', server: r.server_tier === 'VIP' ? 'VIP Brilliant' : 'Normal Dhaka',
        serverHost: r.server_host, days: r.days, bandwidthType: r.bandwidth_type, bandwidthGb: r.bandwidth_gb, usedMb: Number(r.used_mb),
        totalPriceBdt: 0, startDate: '', expiryDate: new Date(r.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
        status: r.status, importLink: window.location.href, multiServerFailover: ['103.145.118.24', '185.220.101.55', '45.148.12.80'],
      });
      setCurrentView('user_import');
    });
  }, []);

  // Load persistent real-time data from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          const savedCust = localStorage.getItem('mahehub_customers_v3');
          if (savedCust) {
            const parsed = JSON.parse(savedCust);
            if (Array.isArray(parsed)) setCustomers(parsed);
          }
          const savedRes = localStorage.getItem('mahehub_resellers_v3');
          if (savedRes) {
            const parsed = JSON.parse(savedRes);
            if (Array.isArray(parsed)) setResellers(parsed);
          }
          const savedTrx = localStorage.getItem('mahehub_transactions_v3');
          if (savedTrx) {
            const parsed = JSON.parse(savedTrx);
            if (Array.isArray(parsed)) setTransactions(parsed);
          }
          const savedCredits = localStorage.getItem('mahehub_credits_v3');
          if (savedCredits !== null) {
            setActiveResellerCredits(Number(savedCredits));
          }
          const savedTheme = localStorage.getItem('mahehub_theme_mode_v2');
          if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
          } else {
            setTheme('light');
          }
        }
      } catch (e) {
        console.error('Storage load error:', e);
      } finally {
        setIsDataLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save persistent state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('mahehub_theme_mode_v2', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mahehub_customers_v3', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mahehub_resellers_v3', JSON.stringify(resellers));
    } catch (e) {
      console.error(e);
    }
  }, [resellers, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mahehub_transactions_v3', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('mahehub_credits_v3', String(activeResellerCredits));
    } catch (e) {
      console.error(e);
    }
  }, [activeResellerCredits, isDataLoaded]);

  // Clean Production Mode: Clears demo accounts
  const clearDemoCustomers = () => {
    setCustomers([]);
    setTransactions([]);
    showToast('Clean Production Mode Activated: All demo customer accounts cleared. You can now add real live subscribers.', 'info');
  };

  // Load sample demo data
  const loadSampleDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    showToast('Sample demo accounts re-loaded for demonstration.', 'info');
  };

  // Delete individual customer
  const handleDeleteCustomer = (customerId: string, phone: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    showToast(`Customer account (${phone}) successfully removed.`, 'info');
  };

  // Export real customer database as CSV
  const exportCustomersCsv = () => {
    try {
      const headers = 'ID,Phone Number,Platform,Service,Assigned Hostname,Status,Hardware Lock,Expiry Date,Country\n';
      const rows = customers.map(c => 
        `"${c.id}","${c.userId}","${c.platform}","${c.serviceType}","${c.dnsHostname}","${c.status}","${c.deviceHardwareId}","${c.expiryDate}","${c.country}"`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mahehub-customers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Customer database CSV exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to export CSV.', 'error');
    }
  };

  // Modals
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isFastCustomerOpen, setIsFastCustomerOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewTargetCustomer, setRenewTargetCustomer] = useState<CustomerAccount | null>(null);
  const [renewMonths, setRenewMonths] = useState<number>(1);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [viewCustomerDetails, setViewCustomerDetails] = useState<CustomerAccount | null>(null);
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fast Customer Creation Form (Phone Number Only - Audio 8 requirement)
  const [fastPhoneNumber, setFastPhoneNumber] = useState('');
  const [fastPlatform, setFastPlatform] = useState<'Android' | 'iOS (iPhone)'>('Android');
  const [fastMonths, setFastMonths] = useState<number>(1);
  const [fastError, setFastError] = useState<string | null>(null);

  // Buy Credits Form (Audio 8 requirement)
  const [selectedCreditPkg, setSelectedCreditPkg] = useState<CreditPackage>(CREDIT_PACKAGES[0]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [creditPaymentTrxId, setCreditPaymentTrxId] = useState('');
  const [creditPaymentGateway, setCreditPaymentGateway] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');

  // Safe Copy with fallback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyText = (text: string, key: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch {}
        document.body.removeChild(textArea);
      }
    } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Real Apple .mobileconfig Download Generator (DNS over TLS DoT - Exact match of iOS video)
  const downloadAppleProfile = (_hostname: string, userTitle: string) => {
    const DNS_HOST = 'dns.mahehub.com';
    const DNS_IP = '144.79.124.248';
    const safeTitle = (userTitle || 'user').replace(/[^a-z0-9]/gi, '_');
    const uuid1 = crypto.randomUUID().toUpperCase();
    const uuid2 = crypto.randomUUID().toUpperCase();
    const mobileconfigXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>DNSSettings</key>
            <dict>
                <key>DNSProtocol</key>
                <string>TLS</string>
                <key>ServerName</key>
                <string>${DNS_HOST}</string>
                <key>ServerAddresses</key>
                <array>
                    <string>${DNS_IP}</string>
                </array>
            </dict>
            <key>PayloadDescription</key>
            <string>MaheHub SmartDNS Secure DoT Profile for bKash &amp; Nagad Instant Login</string>
            <key>PayloadDisplayName</key>
            <string>MaheHub DNS (DoT)</string>
            <key>PayloadIdentifier</key>
            <string>com.mahehub.dns.${safeTitle}</string>
            <key>PayloadType</key>
            <string>com.apple.dnsSettings.managed</string>
            <key>PayloadUUID</key>
            <string>${uuid1}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Native iOS Zero-App encrypted DNS bypass for overseas Bangladeshis.</string>
    <key>PayloadDisplayName</key>
    <string>MaheHub DNS (DoT) - ${safeTitle}</string>
    <key>PayloadIdentifier</key>
    <string>com.mahehub.profile.${safeTitle}</string>
    <key>PayloadOrganization</key>
    <string>MaheHub Networks Bangladesh</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid2}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

    try {
      const blob = new Blob([mobileconfigXML], { type: 'application/x-apple-aspen-config' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mahehub-dns-${userTitle.replace(/[^a-z0-9]/gi, '_')}.mobileconfig`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      copyText('Downloaded', `ios-dl-${userTitle}`);
    } catch (e) {
      console.error('Failed to download Apple profile', e);
    }
  };

  // OpenVPN .ovpn Download with 1-Click Passwordless or Single-Token Mode (Voice Note 4)
  const downloadOvpnProfile = (userTitle: string, mode: 'passwordless' | 'token' = openVpnDownloadMode) => {
    try {
      const cleanUser = `user_${userTitle.replace(/[^0-9]/g, '').slice(-4) || 'exp'}`;
      const tokenPass = `mh_${userTitle.replace(/[^0-9]/g, '').slice(-4) || '8841'}`;

      let authSection = '';
      if (mode === 'passwordless') {
        authSection = `# ========================================================
# ⚡ 1-CLICK PASSWORDLESS DIRECT CONNECT (Client Voice Note)
# No username and No password dialog prompt in OpenVPN app!
# ========================================================
<auth-user-pass>
${cleanUser}
${tokenPass}
</auth-user-pass>`;
      } else {
        authSection = `# ========================================================
# 🔑 SINGLE-TOKEN PASSCODE MODE (Username embedded, enter passcode)
# ========================================================
auth-user-pass`;
      }

      const ovpnContent = `client
dev tun
proto udp
remote ${liveVpnVpsIp} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3

# ====================================================================
# ISOLATED OPENVPN TUNNEL POOL (Dhaka Core VPN-01)
# NOTE: Kept strictly separated from Smart DNS residential pool
# to eliminate banking channel IP block contamination (bKash/Nagad).
# ====================================================================
redirect-gateway def1
dhcp-option DNS 1.1.1.1
dhcp-option DNS 8.8.8.8

${authSection}

<ca>
-----BEGIN CERTIFICATE-----
MIIB/zCCAaWgAwIBAgIUQZ5F0bXy4Gj01MAHEHUB_BDIX_ISOLATED_VPN_CA...
-----END CERTIFICATE-----
</ca>
`;

      const blob = new Blob([ovpnContent], { type: 'application/x-openvpn-profile' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MaheHub_${cleanUser}_${mode === 'passwordless' ? '1Click_Direct' : 'Token'}.ovpn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      copyText('Downloaded', `ovpn-dl-${userTitle}`);
      showToast(`OpenVPN Profile (${mode === 'passwordless' ? '⚡ 1-Click Direct Connect' : '🔑 Single-Token'}) Downloaded!`, 'success');
    } catch (e) {
      console.error('Failed to download OpenVPN profile', e);
    }
  };

  // OpenVPN Price Calculator matching ovpns.online video
  const calculateVpnPrice = (server: string, days: number, bwType: 'Limited' | 'Unlimited', gb: number) => {
    const isVip = server.toLowerCase().includes('vip') || server.toLowerCase().includes('brilliant');
    if (bwType === 'Unlimited') {
      const dailyRate = isVip ? 8 : 6;
      return days * dailyRate;
    } else {
      if (isVip) {
        return Math.round(days * 2.5 + gb * 1.875);
      } else {
        return Math.round(days * 1 + gb * 1);
      }
    }
  };

  // OpenVPN Create User (Matching Client Video minute 3:05 - 5:10)
  const handleCreateVpnUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateVpnError(null);

    const user = newVpnUsername.trim();
    const pass = newVpnPassword.trim();

    if (user.length < 8) {
      setCreateVpnError('Username must be at least 8 characters (min 8).');
      return;
    }

    if (pass.length < 6) {
      setCreateVpnError('Password must be at least 6 characters (min 6).');
      return;
    }

    const duplicate = openVpnAccounts.find(a => a.username.toLowerCase() === user.toLowerCase());
    if (duplicate) {
      setCreateVpnError(`Username "${user}" is already taken. Please choose another username.`);
      return;
    }

    const totalPrice = calculateVpnPrice(newVpnServer, newVpnDays, newVpnBandwidthType, newVpnBandwidthGb);
    if (resellerTakaBalance < totalPrice) {
      setCreateVpnError(`Insufficient Taka balance! Required ৳${totalPrice.toFixed(2)}, but your balance is ৳${resellerTakaBalance.toFixed(2)}.`);
      return;
    }

    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + newVpnDays);
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const expiryStr = `${exp.getDate()} ${months[exp.getMonth()]} ${exp.getFullYear()}`;

    const serverHost = newVpnServer.toLowerCase().includes('vip') ? 'vip.ovpn.ovh' : 'my.ovpn.ovh';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const linkPayload = typeof window !== 'undefined'
      ? encodeURIComponent(btoa(JSON.stringify({ u: user, s: newVpnServer, h: serverHost, d: newVpnDays, t: newVpnBandwidthType, g: newVpnBandwidthType === 'Unlimited' ? 0 : newVpnBandwidthGb, e: expiryStr })))
      : '';
    const importUrl = `${origin}/?view=user_import&user=${encodeURIComponent(user)}&d=${linkPayload}`;

    const newAccount: OpenVpnAccount = {
      id: `VPN-${Math.floor(100 + Math.random() * 900)}`,
      username: user,
      password: pass,
      server: newVpnServer,
      serverHost: serverHost,
      days: newVpnDays,
      bandwidthType: newVpnBandwidthType,
      bandwidthGb: newVpnBandwidthType === 'Unlimited' ? 0 : newVpnBandwidthGb,
      usedMb: 0,
      totalPriceBdt: totalPrice,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiryStr,
      status: 'active',
      importLink: importUrl,
      multiServerFailover: ['103.145.118.24', '185.220.101.55', '45.148.12.80']
    };

    setOpenVpnAccounts([newAccount, ...openVpnAccounts]);
    setResellerTakaBalance(prev => prev - totalPrice);
    setIsOpenVpnCreateOpen(false);
    setNewVpnUsername('');
    setNewVpnPassword('');
    setVpnReadyAccount(newAccount); // Immediately show "Your VPN Account is Ready" modal!
    showToast(`OpenVPN Account "${user}" Created! ৳${totalPrice} deducted.`, 'success');
  };

  // OpenVPN Renew User (Matching Client Video minute 1:34)
  const handleRenewVpnUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewVpnAccount) return;

    const renewPrice = calculateVpnPrice(renewVpnAccount.server, renewVpnDays, renewVpnBandwidthType, renewVpnBandwidthGb);
    if (resellerTakaBalance < renewPrice) {
      showToast(`Insufficient balance! Required ৳${renewPrice.toFixed(2)}, balance: ৳${resellerTakaBalance.toFixed(2)}`, 'error');
      return;
    }

    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + renewVpnDays);
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const expiryStr = `${exp.getDate()} ${months[exp.getMonth()]} ${exp.getFullYear()}`;

    setOpenVpnAccounts(prev => prev.map(acc => {
      if (acc.id === renewVpnAccount.id) {
        return {
          ...acc,
          days: acc.days + renewVpnDays,
          bandwidthGb: renewVpnBandwidthType === 'Unlimited' ? 0 : (acc.bandwidthGb + renewVpnBandwidthGb),
          bandwidthType: renewVpnBandwidthType,
          expiryDate: expiryStr,
          status: 'active'
        };
      }
      return acc;
    }));

    setResellerTakaBalance(prev => prev - renewPrice);
    showToast(`Account "${renewVpnAccount.username}" renewed for ${renewVpnDays} days! ৳${renewPrice} deducted.`, 'success');
    setRenewVpnAccount(null);
  };

  // FAST CUSTOMER CREATION (Phone Number Only - Audio 8 requirement)
  const handleFastCustomerCreation = (e: React.FormEvent) => {
    e.preventDefault();
    setFastError(null);

    const cleanPhone = fastPhoneNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setFastError('দয়া করে সঠিক মোবাইল নম্বর দিন (Please enter valid phone number).');
      return;
    }

    // Duplicate Check: Audio 8 requirement
    const duplicate = customers.find(c => c.userId === cleanPhone && c.status !== 'Blocked');
    if (duplicate) {
      setFastError(`এই নম্বরে ইতিমধ্যে অ্যাক্টিভ একাউন্ট রয়েছে (${duplicate.userId})! রিনিউ করতে নিচের Renew বাটন ব্যবহার করুন।`);
      return;
    }

    // Credits Check: 1 Month = 1 Credit
    const requiredCredits = fastMonths;
    if (activeResellerCredits < requiredCredits) {
      setFastError(`অপর্যাপ্ত ক্রেডিট! প্রয়োজন ${requiredCredits} ক্রেডিট, কিন্তু আপনার ব্যালেন্স আছে ${activeResellerCredits} ক্রেডিট। দয়া করে আগে ক্রেডিট রিচার্জ করুন।`);
      return;
    }

    // Auto-generate Token and Hostname
    const randToken = Math.random().toString(36).substring(2, 8);
    const shortPhone = cleanPhone.slice(-4);
    const hostname = `user-${shortPhone}-${randToken.slice(0, 4)}.new2.mahehub.com`;

    // Compute Dates
    const today = new Date();
    const expiry = new Date(today);
    expiry.setMonth(today.getMonth() + fastMonths);

    const newCust: CustomerAccount = {
      id: `CUST-00${customers.length + 1}`,
      userId: cleanPhone,
      username: `user_${shortPhone}`,
      token: `TK-${randToken}-${shortPhone}`,
      serviceType: 'Private DNS',
      platform: fastPlatform,
      dnsHostname: hostname,
      vpnProfileName: `bd-ovpn-${shortPhone}.ovpn`,
      country: 'Saudi Arabia',
      flag: '🇸🇦',
      priceBdt: fastMonths * 1000,
      durationMonths: fastMonths,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: 'Active',
      deviceBinding: '1 Device Bound',
      deviceHardwareId: `HWID-${fastPlatform === 'iOS (iPhone)' ? 'APPL' : 'ANDR'}-${shortPhone}-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceModel: fastPlatform === 'iOS (iPhone)' ? 'Apple iPhone (iOS)' : 'Android Smartphone',
      serverLocation: 'Dhaka BDIX Core 1'
    };

    // Deduct credits & update records
    setCustomers([newCust, ...customers]);
    setActiveResellerCredits(prev => prev - requiredCredits);

    const newTx: TransactionRecord = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      agencyOrUser: `Created: ${cleanPhone} (${fastMonths} Mo)`,
      type: 'Account Creation',
      gateway: 'Credits Deduction',
      amountBdt: fastMonths * 200,
      creditsChanged: -requiredCredits,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
      trxId: `SYS-${randToken.toUpperCase()}`
    };
    setTransactions([newTx, ...transactions]);

    setIsFastCustomerOpen(false);
    setFastPhoneNumber('');
    setViewCustomerDetails(newCust); // Immediately show slip!
  };

  // 1-CLICK RENEW SUBSCRIPTION (Audio 8 requirement)
  const handleRenewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewTargetCustomer) return;

    const requiredCredits = renewMonths;
    if (activeResellerCredits < requiredCredits) {
      showToast(`অপর্যাপ্ত ক্রেডিট! প্রয়োজন ${requiredCredits} ক্রেডিট, আপনার ব্যালেন্স ${activeResellerCredits} ক্রেডিট।`, 'error');
      return;
    }

    // Extend Expiry Date
    const currentExpiry = new Date(renewTargetCustomer.expiryDate);
    const newExpiryDate = new Date(currentExpiry > new Date() ? currentExpiry : new Date());
    newExpiryDate.setMonth(newExpiryDate.getMonth() + renewMonths);

    const updated = customers.map(c => {
      if (c.id === renewTargetCustomer.id) {
        return {
          ...c,
          status: 'Active' as const,
          durationMonths: c.durationMonths + renewMonths,
          expiryDate: newExpiryDate.toISOString().split('T')[0]
        };
      }
      return c;
    });

    setCustomers(updated);
    setActiveResellerCredits(prev => prev - requiredCredits);

    // Transaction
    const newTx: TransactionRecord = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      agencyOrUser: `Renewed: ${renewTargetCustomer.userId} (+${renewMonths} Mo)`,
      type: 'Renewal',
      gateway: 'Credits Deduction',
      amountBdt: renewMonths * 200,
      creditsChanged: -requiredCredits,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
      trxId: `RNW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    };
    setTransactions([newTx, ...transactions]);

    setIsRenewModalOpen(false);
    setViewCustomerDetails(updated.find(c => c.id === renewTargetCustomer.id) || null);
    showToast(`সফলভাবে ${renewTargetCustomer.userId} এর মেয়াদ ${renewMonths} মাস বাড়ানো হয়েছে! (-${requiredCredits} Credit)`, 'success');
  };

  // ADMIN-ONLY RESET/UNBIND DEVICE LOCK (Audio 6 & 8 requirement)
  const handleAdminResetDevice = (customerId: string) => {
    if (portalRole !== 'admin') {
      showToast('অননুমোদিত অ্যাক্সেস! শুধুমাত্র মাস্টার অ্যাডমিন (Admin) ডিভাইস আনবাইন্ড করতে পারবেন।', 'error');
      return;
    }

    const updated = customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          deviceBinding: 'Unbound (Pending Next Device)' as const,
          deviceHardwareId: 'PENDING_NEXT_PHONE_BIND',
          status: 'Active' as const
        };
      }
      return c;
    });

    setCustomers(updated);
    if (viewCustomerDetails && viewCustomerDetails.id === customerId) {
      setViewCustomerDetails(updated.find(c => c.id === customerId) || null);
    }
    showToast('ডিভাইস সফলভাবে আনবাইন্ড করা হয়েছে! কাস্টমার পরবর্তী ফোনে কানেক্ট করলেই সেটি স্বয়ংক্রিয়ভাবে লক হয়ে যাবে।', 'success');
  };

  // BUY CREDITS WITH COUPON (Audio 8 requirement)
  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, percent: VALID_COUPONS[code].discountPercent });
      showToast(`কুপন কোড ${code} সফলভাবে প্রয়োগ করা হয়েছে!`, 'success');
    } else {
      showToast('অবৈধ কোপন কোড! (টেস্ট করুন: VIP10, EID20, বা HEMAYET)', 'error');
    }
  };

  const calculateFinalPrice = () => {
    let price = selectedCreditPkg.priceBdt;
    if (appliedCoupon) {
      price = price - (price * appliedCoupon.percent) / 100;
    }
    return price;
  };

  const handleBuyCreditsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditPaymentTrxId) return;

    const finalAmount = calculateFinalPrice();
    setActiveResellerCredits(prev => prev + selectedCreditPkg.credits);

    const newTx: TransactionRecord = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      agencyOrUser: `Credit Purchase (${selectedCreditPkg.credits} Credits)`,
      type: 'Credit Purchase',
      gateway: creditPaymentGateway,
      amountBdt: finalAmount,
      creditsChanged: +selectedCreditPkg.credits,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
      trxId: creditPaymentTrxId.toUpperCase()
    };
    setTransactions([newTx, ...transactions]);

    setIsBuyCreditsOpen(false);
    setCreditPaymentTrxId('');
    setAppliedCoupon(null);
    setCouponCodeInput('');
    showToast(`অভিনন্দন! আপনার একাউন্টে +${selectedCreditPkg.credits} ক্রেডিট যোগ করা হয়েছে!`, 'success');
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return c.userId.includes(q) || c.dnsHostname.toLowerCase().includes(q) || c.token.toLowerCase().includes(q);
  });

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#070b18] text-slate-100 selection:bg-cyan-500 selection:text-black' : 'bg-slate-100 text-slate-900 selection:bg-cyan-400 selection:text-slate-900'
    }`}>
      
      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[9999] max-w-md w-full px-4 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-800 shadow-rose-950/60'
              : toastMessage.type === 'info'
              ? 'bg-blue-950/95 text-blue-200 border-blue-800 shadow-blue-950/60'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-800 shadow-emerald-950/60'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-cyan-300" />
              <span>{toastMessage.message}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white shrink-0 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. GLOBAL TOP BAR (Master Navigator: Home, SuAuth Login, Portal) */}
      {/* ========================================================================= */}
      <header className={`border-b px-4 py-3 sticky top-0 z-50 text-xs transition-colors duration-200 ${
        theme === 'dark' ? 'border-slate-800 bg-[#050814]/95 backdrop-blur-md' : 'border-slate-300 bg-white/95 text-slate-900 shadow-sm backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black text-xs shadow-md shrink-0">
                M
              </div>
              <div>
                <span className={`font-mono font-black uppercase tracking-wider text-xs block leading-tight ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-cyan-800'
                }`}>
                  MAHEHUB.COM
                </span>
                <span className={`text-[10px] block leading-none font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Smart DNS &amp; Residential VPN
                </span>
              </div>
            </div>

            {/* Light / Dark Mode Toggle Button (Prominent & Always Visible on Mobile) */}
            <button
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${
                theme === 'dark'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                  : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-slate-950 fill-slate-950" /> : <Moon className="h-4 w-4 text-white fill-white" />}
              <span>{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
            </button>
          </div>

          {/* Master View Mode Switcher */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className={`flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto ${
              theme === 'dark' ? 'bg-[#0f172f] border-slate-800' : 'bg-slate-100 border-slate-300 shadow-inner'
            }`}>
              <button
                onClick={() => setCurrentView('home')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                  currentView === 'home'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>🏠 Storefront</span>
              </button>

              <button
                onClick={() => setCurrentView('login')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                  currentView === 'login'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Seller Login</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('portal');
                  setPortalTab('dashboard');
                }}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 ${
                  currentView === 'portal'
                    ? 'bg-blue-600 text-white font-black shadow-md'
                    : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Portal Suite</span>
              </button>
            </div>

            {/* Direct Header Contacts from Client Screenshot */}
            <div className="hidden xl:flex items-center gap-2">
              <a
                href="https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="MaheHub Official Facebook Page"
              >
                <Facebook className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </a>

              <a
                href="https://t.me/+5v_WpMb2pjwwNDFl"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-sky-500/30 bg-sky-600/10 hover:bg-sky-500 text-sky-500 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="MaheHub Official Telegram"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href="https://www.tiktok.com/@maheinternationaltravels?_r=1&_t=ZS-9ABtGvkGcBJ"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-pink-500/30 bg-pink-600/10 hover:bg-pink-600 text-pink-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="TikTok Official Channel"
              >
                <Video className="h-3.5 w-3.5" />
                <span>TikTok</span>
              </a>

              <a
                href="https://youtube.com/@mdhemayetuddin-officialbd?si=rXjpWheCiAKcOWH-"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="YouTube Channel"
              >
                <Youtube className="h-3.5 w-3.5" />
                <span>YouTube</span>
              </a>

              <a
                href="https://wa.me/8801614082537?text=Hello%20MaheHub%20BD%20Support"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Bangladesh WhatsApp Support Desk"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>🇧🇩 +880 1614-082537</span>
              </a>

              <a
                href="https://wa.me/60173103546?text=Hello%20MaheHub%20Malaysia%20Support"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Malaysia WhatsApp Regional Desk"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>🇲🇾 +60 17-310 3546</span>
              </a>

              <a
                href="mailto:b2b@mahehub.com"
                className="px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600 text-purple-500 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="B2B Server Integration & API: b2b@mahehub.com"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>B2B / API</span>
              </a>

              <button
                onClick={() => setIsServerModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-600/10 hover:bg-cyan-500 text-cyan-500 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Server Pools: Clean DNS vs Isolated OpenVPN"
              >
                <Server className="h-3.5 w-3.5" />
                <span>Server Pools</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. VIEW: PUBLIC TELECOM STOREFRONT (Fast, Secure, Smart DNS) */}
      {/* ========================================================================= */}
      {currentView === 'home' && (
        <div className="space-y-16 pb-20 relative">

          {/* Floating Persistent Theme Toggle Button (Mobile & Desktop Visible) */}
          <div className="fixed bottom-6 left-6 z-50 animate-bounce duration-1000">
            <button
              onClick={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
              }}
              className={`px-4 py-2.5 rounded-2xl shadow-2xl border-2 font-black text-xs flex items-center gap-2 transition-all active:scale-90 ${
                theme === 'dark'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-white/80 shadow-amber-500/30'
                  : 'bg-indigo-900 hover:bg-indigo-800 text-white border-white/80 shadow-indigo-950/40'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-slate-950 fill-slate-950" /> : <Moon className="h-4 w-4 text-amber-300 fill-amber-300" />}
              <span>{theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}</span>
            </button>
          </div>

          {/* HERO SECTION with High-Tech Dhaka Network Backdrop */}
          <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
            <div 
              className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity ${
                theme === 'dark' ? 'opacity-30 mix-blend-screen' : 'opacity-10 mix-blend-multiply'
              }`}
              style={{ backgroundImage: `url('/images/telecom_hero_bg.jpg')` }}
            ></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8 text-center">
              
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono shadow-xl backdrop-blur-md ${
                theme === 'dark' ? 'bg-slate-900/80 border-cyan-500/40 text-cyan-300' : 'bg-white border-cyan-600 text-cyan-800 shadow-sm'
              }`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>BDIX 10G DEDICATED DHAKA CLUSTER • ONLINE (12ms PING)</span>
              </div>

              <div className="space-y-3 max-w-4xl mx-auto">
                <h1 className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Fast • Secure • Private <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                    Smart DNS Unblocker
                  </span>
                </h1>

                <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}>
                  সৌদি আরব, মালয়েশিয়া ও মধ্যপ্রাচ্য প্রবাসীদের জন্য কোনো ভিপিএন অ্যাপ ছাড়াই <strong>bKash, Nagad, Rocket, Upay, Alaap, Brilliant ও WhatsApp Calling</strong> সম্পূর্ণ দেশীয় স্পিডে ব্যবহার করুন।
                </p>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-4xl mx-auto pt-2">
                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-[#e2136e]/20 text-[#e2136e] font-black text-xs flex items-center justify-center shrink-0">
                    bK
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>bKash</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● 100% Unblock</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-[#f7931e]/20 text-[#f7931e] font-black text-xs flex items-center justify-center shrink-0">
                    NG
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Nagad</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● Instant Login</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-[#8b2787]/20 text-[#8b2787] font-black text-xs flex items-center justify-center shrink-0">
                    RK
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rocket</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● Active</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-[#005ba9]/20 text-[#38bdf8] font-black text-xs flex items-center justify-center shrink-0">
                    UP
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Upay BD</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● Active</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-500 font-black text-xs flex items-center justify-center shrink-0">
                    AL
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Alaap &amp; Brilliant</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● Clear Voice</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border backdrop-blur-sm flex items-center gap-2 transition-all ${
                  theme === 'dark' ? 'bg-[#0f172f]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="h-8 w-8 rounded-xl bg-[#25D366]/20 text-[#25D366] font-black text-xs flex items-center justify-center shrink-0">
                    WA
                  </div>
                  <div className="text-left text-xs">
                    <strong className={`block text-[11px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>WhatsApp Call</strong>
                    <span className="text-emerald-500 font-mono text-[9px] font-bold">● Gulf Unblocked</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <a
                  href="#generator-section"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  <span>Download iOS Profile</span>
                </a>

                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Create Account (1 Credit)</span>
                </button>
              </div>

            </div>
          </section>

          {/* INTERACTIVE GENERATOR CARD (Audio 6 & Screenshot 2) */}
          <section id="generator-section" className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className={`rounded-3xl p-6 sm:p-10 border shadow-2xl space-y-6 transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-[#0f172f] to-[#0a1022] border-slate-800'
                : 'bg-white border-slate-200 shadow-xl'
            }`}>
              
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border ${
                  theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                }`}>
                  Automated Mobile Profile Setup
                </span>
                <h2 className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  iOS &amp; Android Profile Downloader
                </h2>
                <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  আপনার রিসেলারের দেওয়া টোকেন হোস্টনেমটি বসিয়ে ১-ক্লিকে ডাউনলোড করুন
                </p>
              </div>

              <div className={`max-w-xl mx-auto p-6 rounded-2xl border space-y-4 ${
                theme === 'dark' ? 'bg-[#141e3d] border-blue-900/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className={`block text-xs font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Paste your personal link (from your reseller):
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={homeLink}
                    onChange={(e) => setHomeLink(e.target.value)}
                    placeholder="https://…/c/?t=…"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm font-mono focus:outline-none ${
                      theme === 'dark'
                        ? 'bg-[#0b1227] border border-slate-700 text-cyan-300 focus:border-cyan-400'
                        : 'bg-white border border-slate-300 text-cyan-900 focus:border-cyan-500 shadow-sm'
                    }`}
                  />
                </div>

                {!homeLink.trim() && (
                  <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                    Get your personal link from your reseller first. Without it your DNS cannot be activated, and the generic profile will not connect.
                  </p>
                )}
                {homeLink.trim() && homeChecking && <p className="text-[11px] text-slate-400">Checking your link…</p>}
                {homeLink.trim() && !homeChecking && homeInfo && !homeInfo.found && (
                  <p className="text-[11px] text-rose-400">This link is not valid. Please ask your reseller for a new one.</p>
                )}
                {homeInfo?.found && (
                  <div className={`rounded-xl px-3 py-2 text-[11px] ${homeInfo.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    Account •••• {homeInfo.phone_hint} · {homeInfo.valid ? `${homeInfo.days_left} day(s) left (expires ${homeInfo.expiry_date})` : 'not active, please contact your reseller to renew'}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    disabled={!homeInfo?.found || !homeInfo?.valid}
                    onClick={() => {
                      window.location.href = `${DNS_PORTAL}?t=${encodeURIComponent(homeToken)}&download=profile`;
                      setHomeDownloaded(true);
                      setTimeout(() => setHomeDownloaded(false), 3000);
                    }}
                    className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    <span>{homeDownloaded ? 'ডাউনলোড শুরু হয়েছে!' : 'iOS Profile (.mobileconfig)'}</span>
                  </button>

                  <button
                    disabled={!homeInfo?.found || !homeInfo?.valid || !homeInfo?.hostname}
                    onClick={() => copyText(homeInfo?.hostname || '', 'home-host-copy')}
                    className="py-3 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {copiedKey === 'home-host-copy' ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedKey === 'home-host-copy' ? 'Copied Hostname!' : 'Android Copy Host'}</span>
                  </button>

                  <button
                    onClick={() => downloadOvpnProfile('Client_BD')}
                    className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Shield className="h-4 w-4 text-amber-300" />
                    <span>Download OpenVPN (.ovpn)</span>
                  </button>
                </div>
              </div>

            </div>
            <div id="free-trial" className="max-w-xl mx-auto mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
              <div className="text-center">
                <div className="text-base font-black text-emerald-400">Free Trial (1 hour)</div>
                <p className="text-[11px] text-slate-400 mt-1">Test our service first. No payment, no package needed.</p>
              </div>

              {!trialLink ? (
                <>
                  <input
                    type="text" value={trialName} onChange={(e) => setTrialName(e.target.value)} placeholder="Your name"
                    className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none ${theme === 'dark' ? 'bg-[#0b1227] border border-slate-700 text-white focus:border-emerald-400' : 'bg-white border border-slate-300 text-slate-900 focus:border-emerald-500'}`}
                  />
                  <input
                    type="tel" inputMode="tel" value={trialPhone} onChange={(e) => setTrialPhone(e.target.value)} placeholder="WhatsApp number with country code (+966…)"
                    className={`w-full px-4 py-3 rounded-xl text-sm font-mono focus:outline-none ${theme === 'dark' ? 'bg-[#0b1227] border border-slate-700 text-white focus:border-emerald-400' : 'bg-white border border-slate-300 text-slate-900 focus:border-emerald-500'}`}
                  />
                  {trialErr && <p className="text-xs font-semibold text-rose-400">{trialErr}</p>}
                  <button
                    onClick={submitFreeTrial} disabled={trialBusy}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all disabled:opacity-50"
                  >
                    {trialBusy ? 'Please wait…' : 'Get my free trial'}
                  </button>
                  <p className="text-center text-[11px] text-slate-400">
                    Having trouble?{' '}
                    <a className="text-emerald-400 underline" target="_blank" rel="noreferrer" href="https://wa.me/8801614082537?text=Hello%20MaheHub%2C%20I%20want%20a%20free%201-hour%20trial">Ask on WhatsApp</a>
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-300">Your free trial is ready. It works for 1 hour.</div>
                  <a href={trialLink} className="block w-full text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm">Open my setup page</a>
                  <button onClick={() => copyText(trialLink, 'trial-link-copy')} className="w-full py-2.5 rounded-xl border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                    {copiedKey === 'trial-link-copy' ? 'Link copied!' : 'Copy my personal link (save it)'}
                  </button>
                </div>
              )}

              <div className={`rounded-xl p-3 text-[11px] leading-relaxed space-y-1 ${theme === 'dark' ? 'bg-black/20 text-slate-300' : 'bg-white/70 text-slate-700'}`}>
                <div className="font-black">How to connect</div>
                <div><b>iPhone:</b> open your setup page in Safari → Download Profile → Settings → “Profile Downloaded” → Install.</div>
                <div><b>Android:</b> Copy DNS Hostname → Settings → Network &amp; internet → Private DNS → paste the hostname and save.</div>
                <div>Then press <b>“Activate my IP”</b> once on the network you will use.</div>
                <div className="pt-1 text-amber-400 font-bold">Warning: the trial stops automatically after 1 hour. To keep using it, take a monthly package from your reseller or admin. / ট্রায়াল ১ ঘণ্টা পর নিজে থেকে বন্ধ হয়ে যাবে। চালিয়ে যেতে রিসেলার বা অ্যাডমিনের কাছ থেকে মাসিক প্যাকেজ নিন।</div>
              </div>
            </div>
          </section>

          {/* PACKAGE RATES */}
          <section id="rates-section" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 text-center">
            <div className="space-y-2 max-w-xl mx-auto">
              <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border ${
                theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                Expat Package Rates
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                আমাদের প্রিমিয়াম প্যাকেজ রেট
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
              <div className={`rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition-all ${
                theme === 'dark' ? 'bg-[#0f172f] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-2">
                  <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>১ মাস (1 Month)</span>
                  <div className="text-3xl font-black text-emerald-500 font-mono">৳১,০০০</div>
                  <span className={`text-[11px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>1 Device Locked • 100% Bypass</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  অর্ডার করুন
                </button>
              </div>

              <div className={`rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition-all ${
                theme === 'dark' ? 'bg-[#0f172f] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-2">
                  <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>২ মাস (2 Months)</span>
                  <div className="text-3xl font-black text-emerald-500 font-mono">৳১,৮০০</div>
                  <span className="text-[10px] text-amber-500 font-bold block">সেভ করুন ৳২০০!</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  অর্ডার করুন
                </button>
              </div>

              <div className={`rounded-3xl p-6 border-2 shadow-2xl flex flex-col justify-between space-y-4 relative ${
                theme === 'dark' ? 'bg-gradient-to-b from-[#16234b] to-[#0c142b] border-cyan-400/80' : 'bg-cyan-50/50 border-cyan-500 shadow-cyan-100'
              }`}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                  ★ সর্বাধিক জনপ্রিয়
                </div>
                <div className="space-y-2 pt-2">
                  <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-800'}`}>৩ মাস (3 Months)</span>
                  <div className={`text-3xl font-black font-mono ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>৳২,৫০০</div>
                  <span className="text-[10px] text-emerald-600 font-bold block">সেভ করুন ৳৫০০!</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg"
                >
                  অর্ডার করুন
                </button>
              </div>

              <div className="bg-[#0f172f] rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">৬ মাস (6 Months)</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">৳৪,৯০০</div>
                  <span className="text-[10px] text-amber-400 font-bold block">সেভ করুন ৳১,১০০!</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  অর্ডার করুন
                </button>
              </div>

              <div className="bg-[#0f172f] rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">১ বছর (1 Year)</span>
                  <div className="text-3xl font-black text-amber-400 font-mono">৳৯,৫০০</div>
                  <span className="text-[10px] text-emerald-400 font-bold block">বিশাল ছাড় ৳২,৫০০!</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('customers');
                    setIsFastCustomerOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
                >
                  অর্ডার করুন
                </button>
              </div>
            </div>
          </section>

          {/* SETUP GUIDES */}
          <section id="setup-section" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ১০ সেকেন্ডে সহজ সেটআপ গাইড
              </h2>
            </div>

            <div className="flex justify-center gap-2 p-1.5 bg-[#0f172f] rounded-2xl max-w-md mx-auto border border-slate-800">
              <button
                onClick={() => setActiveSetupTab('iphone')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSetupTab === 'iphone' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Apple className="h-4 w-4" />
                <span>iPhone (iOS)</span>
              </button>

              <button
                onClick={() => setActiveSetupTab('android')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSetupTab === 'android' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Android DoT</span>
              </button>

              <button
                onClick={() => setActiveSetupTab('openvpn')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSetupTab === 'openvpn' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>OpenVPN .ovpn</span>
              </button>
            </div>

            <div className="bg-[#0f172f] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
              {activeSetupTab === 'iphone' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Apple className="h-5 w-5 text-cyan-400" />
                    iPhone (Apple iOS 15–18+) Setup:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-cyan-400">ধাপ ১:</span>
                      <p>Safari ব্রাউজারে <strong>Download iOS Profile</strong> বাটনে চাপ দিন এবং <strong>Allow</strong> সিলেক্ট করুন।</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-cyan-400">ধাপ ২:</span>
                      <p>আইফোনের <strong>Settings</strong> ওপেন করলেই উপরে <strong>Profile Downloaded</strong> অপশন পাবেন।</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-cyan-400">ধাপ ৩:</span>
                      <p>উপরে ডানপাশে <strong>Install</strong> এ চাপ দিন। bKash ও Nagad ওপেন করে নিশ্চিন্তে ব্যবহার করুন!</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSetupTab === 'android' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-400" />
                    Android (Samsung, Xiaomi, Vivo, Oppo) Setup:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-emerald-400">ধাপ ১:</span>
                      <p>ফোনের <strong>Settings &gt; Connections &gt; More Connection Settings</strong> এ যান।</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-emerald-400">ধাপ ২:</span>
                      <p><strong>Private DNS</strong> এ ট্যাপ করে <strong>Private DNS provider hostname</strong> সিলেক্ট করুন।</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#141e3d] border border-slate-800 space-y-1">
                      <span className="font-mono font-bold text-emerald-400">ধাপ ৩:</span>
                      <p>আপনার পাওয়া হোস্টনেমটি পেস্ট করে <strong>Save</strong> করে দিন। কোনো অ্যাপের দরকার নেই!</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSetupTab === 'openvpn' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      OpenVPN Dedicated Bangladesh Residential Tunnel (Full VPN):
                    </h4>
                    <button
                      onClick={() => downloadOvpnProfile('MaheHub_Official')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg self-start sm:self-auto"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download mahehub-bd.ovpn</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141e3d] border border-blue-900/50 text-xs text-slate-300 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Smart DNS এবং OpenVPN এর মধ্যে পার্থক্য কী?</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>Smart DNS</strong> কোনো অ্যাপ ছাড়াই শুধুমাত্র bKash, Nagad, Rocket, Upay ও Calling Apps ব্যাকগ্রাউন্ডে আনব্লক করে রাখে। আর <strong>OpenVPN</strong> আপনার পুরো ডিভাইসের 100% ইন্টারনেটকে ঢাকার অরিজিনাল রেসিডেন্সিয়াল আইপিতে নিয়ে যায়—যাতে বাংলাদেশের সব ওয়েবসাইট, চরকি, হইচই ও BDIX কন্টেন্ট কোনো বাধা ছাড়াই চলে।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                      <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800">
                        <span className="font-mono font-bold text-blue-400 block mb-1">ধাপ ১ (Install App):</span>
                        <p className="text-slate-400">Google Play Store বা App Store থেকে <strong>OpenVPN Connect</strong> ইনস্টল করুন।</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800">
                        <span className="font-mono font-bold text-blue-400 block mb-1">ধাপ ২ (Import Profile):</span>
                        <p className="text-slate-400">উপরের বাটনে চাপ দিয়ে <code>mahehub-bd.ovpn</code> ফাইলটি ওপেন করে Import করুন।</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800">
                        <span className="font-mono font-bold text-blue-400 block mb-1">ধাপ ৩ (1-Tap Connect):</span>
                        <p className="text-slate-400">আপনার ইউজারনেম দিয়ে Connect চাপলেই পুরো ফোন বাংলাদেশ আইপিতে চলে যাবে!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RESELLER OPPORTUNITY */}
          <section id="reseller-section" className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-amber-950/40 via-[#181f3d] to-blue-950/40 rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                    Reseller Agency Network
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">রিসেলার বিজনেস শুরু করুন (MaheHub)</h3>
                  <p className="text-xs text-slate-300">হোলসেল প্যাকেজ: <strong>১০ ক্রেডিট = ৳২,০০০</strong> (১ ক্রেডিট = ১ মাস DNS)</p>
                </div>

                <button
                  onClick={() => setCurrentView('login')}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Lock className="h-4 w-4" />
                  <span>MaheHub Seller Login</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">মাসে সম্ভাব্য কাস্টমার সংখ্যা:</span>
                  <span className="text-amber-400 font-mono font-black text-lg">{resellerSalesSlider} জন ইউজার</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={resellerSalesSlider}
                  onChange={(e) => setResellerSalesSlider(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#0b1227] border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">হোলসেল খরচ (৳২০০ × {resellerSalesSlider}):</span>
                    <strong className="text-slate-200 font-mono text-sm">৳{(resellerSalesSlider * 200).toLocaleString()}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0b1227] border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">রিটেল সেল (৳১,০০০ × {resellerSalesSlider}):</span>
                    <strong className="text-cyan-400 font-mono text-sm">৳{(resellerSalesSlider * 1000).toLocaleString()}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/40">
                    <span className="text-emerald-300 block text-[10px] font-bold">আপনার মাসিক নেট লাভ:</span>
                    <strong className="text-emerald-400 font-mono text-base font-black">
                      +৳{(resellerSalesSlider * (1000 - 200)).toLocaleString()} BDT
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* B2B SERVER CONNECT & 1-CLICK CUSTOMER DELIVERY API (Client Audio Feature) */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className={`p-8 sm:p-10 rounded-3xl border transition-all ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-[#070e24] via-[#091538] to-[#050a1c] border-cyan-500/30 shadow-2xl shadow-cyan-950/20' 
                : 'bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white border-slate-200 shadow-xl'
            }`}>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-cyan-500/20">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      Enterprise B2B Architecture
                    </span>
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Connect Your Website or Server to MaheHub
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Any agency or reseller can connect their own website or server directly to our high-speed streaming servers through the API. With the 1-Click customer auto-delivery system, your users instantly receive their hostname and profile.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <a
                    href="mailto:b2b@mahehub.com?subject=B2B%20Server%20API%20Integration%20Request"
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Get API Key (b2b@mahehub.com)</span>
                  </a>

                  <a
                    href="https://wa.me/8801614082537?text=Hello%20MaheHub%20I%20want%20to%20connect%20my%20website%20to%20your%20server%20via%20API"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp B2B Desk</span>
                  </a>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className={`p-5 rounded-2xl border space-y-2 ${
                  theme === 'dark' ? 'bg-[#0a122e] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    1-Click Auto Delivery
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    As soon as a customer order comes in from your website, the MaheHub API allocates a unique Smart DNS hostname and delivers it to the customer instantly.
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 ${
                  theme === 'dark' ? 'bg-[#0a122e] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    <Server className="h-5 w-5" />
                  </div>
                  <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Whitelabel Server Bridge
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use your own custom domain or brand name while routing runs through MaheHub's residential high-speed Tier-4 backend.
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 ${
                  theme === 'dark' ? 'bg-[#0a122e] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Automated Anti-Abuse Lock
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hardware MAC binding and a simultaneous-connection limit make sure each DNS is used by one authorised user only.
                  </p>
                </div>
              </div>

              {/* Interactive Multi-API Tabs & Simulator (Client Audio Requirement: Separate DNS vs OpenVPN APIs) */}
              <div className={`p-6 rounded-2xl border space-y-5 ${
                theme === 'dark' ? 'bg-[#060c20] border-cyan-500/20' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                      Dedicated Developer API Suite
                    </span>
                    <h5 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Select Service API Endpoint (Separate or Combo):
                    </h5>
                  </div>
                  
                  {/* API Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
                    <button
                      onClick={() => {
                        setB2bApiTab('dns');
                        setApiTestResponse(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        b2bApiTab === 'dns'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🛡️ Smart DNS API
                    </button>
                    <button
                      onClick={() => {
                        setB2bApiTab('openvpn');
                        setApiTestResponse(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        b2bApiTab === 'openvpn'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚀 OpenVPN API
                    </button>
                    <button
                      onClick={() => {
                        setB2bApiTab('combo');
                        setApiTestResponse(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        b2bApiTab === 'combo'
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Combo API
                    </button>
                  </div>
                </div>

                {/* Endpoint Info Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#030712] border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                    <span className="text-cyan-300 font-bold">
                      {b2bApiTab === 'dns' && 'https://api.mahehub.com/v1/dns/provision'}
                      {b2bApiTab === 'openvpn' && 'https://api.mahehub.com/v1/openvpn/provision'}
                      {b2bApiTab === 'combo' && 'https://api.mahehub.com/v1/telecom/combo-provision'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {b2bApiTab === 'dns' && 'Allocates Clean Residential BDIX DNS (Anti-Ban Pool)'}
                    {b2bApiTab === 'openvpn' && 'Generates 1-Click Passwordless .ovpn (Isolated Tunnel)'}
                    {b2bApiTab === 'combo' && 'Provisions DNS + OpenVPN with Server Isolation'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Customer Phone Number
                    </label>
                    <input
                      type="text"
                      value={apiPhoneInput}
                      onChange={(e) => setApiPhoneInput(e.target.value)}
                      placeholder="+880 1731-03546"
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold border outline-none ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Service / Bypass Profile
                    </label>
                    <select
                      value={apiServiceSelected}
                      onChange={(e) => setApiServiceSelected(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border outline-none ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="bKash / Nagad Expat Banking">bKash / Nagad Expat Banking</option>
                      <option value="Netflix 4K UHD Bypass">Netflix 4K UHD Bypass</option>
                      <option value="YouTube Premium Family">YouTube Premium Family</option>
                      <option value="Disney+ Hotstar Residential">Disney+ Hotstar Residential</option>
                      <option value="Dedicated Static Residential IP">Dedicated Static Residential IP</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setApiIsTesting(true);
                        setTimeout(() => {
                          const cleanNum = apiPhoneInput.replace(/[^0-9]/g, '') || '880173103546';
                          const randTok = Math.random().toString(36).substring(2, 6);
                          
                          let payload: Record<string, unknown> = {};
                          if (b2bApiTab === 'dns') {
                            payload = {
                              status: "success",
                              code: 200,
                              api_channel: "SMART_DNS_DEDICATED_API",
                              delivery_id: `MHH-DNS-${Math.floor(100000 + Math.random() * 900000)}`,
                              customer_phone: apiPhoneInput,
                              service_name: apiServiceSelected,
                              assigned_hostname: `user-${cleanNum.slice(-6)}-${randTok}.new2.mahehub.com`,
                              server_architecture: "Anti-Ban Residential BDIX Pool (Isolated from VPN)",
                              primary_clean_ip: liveDnsVpsIp,
                              device_lock_policy: "STRICT_1_DEVICE_BINDING",
                              authorized_desk: "b2b@mahehub.com"
                            };
                          } else if (b2bApiTab === 'openvpn') {
                            payload = {
                              status: "success",
                              code: 200,
                              api_channel: "OPENVPN_DEDICATED_API",
                              delivery_id: `MHH-VPN-${Math.floor(100000 + Math.random() * 900000)}`,
                              customer_phone: apiPhoneInput,
                              auth_mode: "1_CLICK_PASSWORDLESS_DIRECT",
                              profile_download_url: `https://api.mahehub.com/v1/openvpn/download/ovpn_${cleanNum.slice(-4)}.ovpn`,
                              tunnel_server_ip: liveVpnVpsIp,
                              server_pool: "ISOLATED_TUNNEL_CORE_01",
                              ip_isolation_guarantee: "100% Isolated from Smart DNS Residential pool (Prevents banking block contamination)",
                              authorized_desk: "b2b@mahehub.com"
                            };
                          } else {
                            payload = {
                              status: "success",
                              code: 200,
                              api_channel: "UNIFIED_COMBO_API",
                              delivery_id: `MHH-CMB-${Math.floor(100000 + Math.random() * 900000)}`,
                              customer_phone: apiPhoneInput,
                              dns_service: {
                                hostname: `user-${cleanNum.slice(-6)}-${randTok}.new2.mahehub.com`,
                                clean_dns_ip: liveDnsVpsIp,
                                pool: "Anti-Ban Banking Clean"
                              },
                              openvpn_service: {
                                profile_url: `https://api.mahehub.com/v1/openvpn/download/ovpn_${cleanNum.slice(-4)}.ovpn`,
                                tunnel_ip: liveVpnVpsIp,
                                auth_mode: "1_CLICK_PASSWORDLESS"
                              },
                              device_binding: "ACTIVE (1 Device Limit)",
                              authorized_desk: "b2b@mahehub.com"
                            };
                          }
                          setApiTestResponse(JSON.stringify(payload, null, 2));
                          setApiIsTesting(false);
                          showToast(`${b2bApiTab.toUpperCase()} API Test Succeeded!`, 'success');
                        }, 400);
                      }}
                      disabled={apiIsTesting}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {apiIsTesting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      <span>{apiIsTesting ? 'Dispatching...' : `Test ${b2bApiTab.toUpperCase()} Delivery`}</span>
                    </button>
                  </div>
                </div>

                {apiTestResponse && (
                  <div className="space-y-2 pt-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 200 OK — Instant Response Payload:
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiTestResponse);
                          showToast('API Response copied to clipboard!', 'success');
                        }}
                        className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] font-mono"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className={`p-4 rounded-xl text-[11px] font-mono overflow-x-auto border leading-relaxed ${
                      theme === 'dark' ? 'bg-[#020510] border-slate-800 text-cyan-300' : 'bg-white border-slate-300 text-cyan-900'
                    }`}>
                      {apiTestResponse}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* PROFESSIONAL ENTERPRISE FOOTER & GLOBAL CONTACT HUB */}
          {/* ========================================================================= */}
          <footer className={`border-t transition-colors duration-200 mt-20 pt-16 pb-28 ${
            theme === 'dark' 
              ? 'border-slate-800 bg-[#040714] text-slate-300' 
              : 'border-slate-300 bg-white text-slate-700 shadow-inner'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              {/* 1. TOP HIGHLIGHT CALL-TO-ACTION CARDS (Real Contact Numbers from Client Screenshot) */}
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-slate-900/90 via-[#0a1128] to-slate-900/90 border-cyan-500/30 shadow-2xl shadow-cyan-950/20' 
                  : 'bg-slate-50 border-slate-200 shadow-xl shadow-slate-200/50'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Bangladesh Desk */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    theme === 'dark' ? 'bg-[#080e22] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🇧🇩</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Bangladesh Support Desk
                          </h4>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-slate-400">Primary Billing, Setup &amp; 24/7 Helpline</p>
                      </div>
                    </div>
                    <div className="font-mono text-base font-black text-emerald-500 mb-3">
                      +880 1614-082537 <span className="text-xs text-slate-400 font-normal">(01614-082537)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://wa.me/8801614082537?text=Hello%20MaheHub%20BD%20Support"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp BD</span>
                      </a>
                      <a
                        href="tel:+8801614082537"
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Malaysia Desk */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    theme === 'dark' ? 'bg-[#080e22] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🇲🇾</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Malaysia Regional Desk
                          </h4>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-slate-400">Reseller Accounts &amp; International Desk</p>
                      </div>
                    </div>
                    <div className="font-mono text-base font-black text-emerald-500 mb-3">
                      +60 17-310 3546 <span className="text-xs text-slate-400 font-normal">(017-3103546)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://wa.me/60173103546?text=Hello%20MaheHub%20Malaysia%20Support"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp MY</span>
                      </a>
                      <a
                        href="tel:+60173103546"
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          theme === 'dark' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Social Channels Connection Hub */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    theme === 'dark' ? 'bg-[#080e22] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Facebook className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`font-black text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          Official Social Networks
                        </h4>
                        <p className="text-[11px] text-slate-400">Daily Updates, Guides &amp; Community</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href="https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                        <span>Facebook</span>
                      </a>
                      <a
                        href="https://t.me/+5v_WpMb2pjwwNDFl"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Telegram</span>
                      </a>
                      <a
                        href="https://www.tiktok.com/@maheinternationaltravels?_r=1&_t=ZS-9ABtGvkGcBJ"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow-sm active:scale-95"
                      >
                        <Video className="h-3.5 w-3.5 text-pink-400" />
                        <span>TikTok</span>
                      </a>
                      <a
                        href="https://youtube.com/@mdhemayetuddin-officialbd?si=rXjpWheCiAKcOWH-"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Youtube className="h-3.5 w-3.5" />
                        <span>YouTube</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. MAIN 5-COLUMN FOOTER NAVIGATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pt-4">
                
                {/* Col 1: Brand & Mission */}
                <div className="space-y-4 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black text-xs shadow-md">
                      M
                    </div>
                    <span className={`font-mono font-black uppercase tracking-wider text-base ${
                      theme === 'dark' ? 'text-cyan-400' : 'text-cyan-800'
                    }`}>
                      MAHEHUB.COM
                    </span>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-slate-400">
                    The leading telecommunication Smart DNS routing network and residential OTT streaming infrastructure designed for high-volume resellers and digital agencies.
                  </p>

                  {/* Live Network Status */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                    theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-500">All Systems Operational</span>
                    <span className="text-slate-400">· 99.98% SLA</span>
                  </div>

                  {/* Social Media Link Icons */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Follow &amp; Connect:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href="https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noreferrer"
                        title="Official Facebook Page"
                        className="h-8 w-8 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center border border-blue-500/20 transition-all shadow-sm"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                      <a
                        href="https://t.me/+5v_WpMb2pjwwNDFl"
                        target="_blank"
                        rel="noreferrer"
                        title="Official Telegram Channel"
                        className="h-8 w-8 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white flex items-center justify-center border border-sky-500/20 transition-all shadow-sm"
                      >
                        <Send className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.tiktok.com/@maheinternationaltravels?_r=1&_t=ZS-9ABtGvkGcBJ"
                        target="_blank"
                        rel="noreferrer"
                        title="Official TikTok Profile"
                        className="h-8 w-8 rounded-lg bg-slate-900/40 hover:bg-black text-pink-400 hover:text-white flex items-center justify-center border border-slate-700/50 transition-all shadow-sm"
                      >
                        <Video className="h-4 w-4" />
                      </a>
                      <a
                        href="https://youtube.com/@mdhemayetuddin-officialbd?si=rXjpWheCiAKcOWH-"
                        target="_blank"
                        rel="noreferrer"
                        title="Official YouTube Channel"
                        className="h-8 w-8 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border border-red-500/20 transition-all shadow-sm"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                      <a
                        href="https://wa.me/8801614082537?text=Hello%20MaheHub%20BD%20Support"
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Bangladesh (+880 1614-082537)"
                        className="h-8 w-8 rounded-lg bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white flex items-center justify-center border border-emerald-500/20 transition-all shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href="https://wa.me/60173103546?text=Hello%20MaheHub%20Malaysia%20Support"
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Malaysia (+60 17-310 3546)"
                        className="h-8 w-8 rounded-lg bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white flex items-center justify-center border border-emerald-500/20 transition-all shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href="https://linkedin.com/company/mahehub"
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn Corporate Page"
                        className="h-8 w-8 rounded-lg bg-blue-700/10 hover:bg-blue-700 text-blue-700 hover:text-white flex items-center justify-center border border-blue-700/20 transition-all shadow-sm"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Col 2: Global Desks & Direct Support */}
                <div className="space-y-3">
                  <h5 className={`font-black text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Global Help Desks
                  </h5>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-500">
                        <span>🇧🇩</span> Bangladesh Support
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Tel / WhatsApp:{' '}
                        <a href="https://wa.me/8801614082537" className="font-mono font-bold hover:underline text-cyan-500">
                          +880 1614-082537
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-500">Local: 01614082537 (24/7 Live)</div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-500">
                        <span>🇲🇾</span> Malaysia Desk
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Tel / WhatsApp:{' '}
                        <a href="https://wa.me/60173103546" className="font-mono font-bold hover:underline text-cyan-500">
                          +60 17-310 3546
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-500">Regional: 0173103546 (09:00-23:00 MYT)</div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="font-bold flex items-center gap-1.5 text-blue-500">
                        <Mail className="h-3 w-3" /> Official Contacts
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Admin: <a href="mailto:admin@mahehub.com" className="hover:underline font-mono text-cyan-400 font-bold">admin@mahehub.com</a>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        B2B &amp; API: <a href="mailto:b2b@mahehub.com" className="hover:underline font-mono text-cyan-400 font-bold">b2b@mahehub.com</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 3: Reseller Solutions */}
                <div className="space-y-3">
                  <h5 className={`font-black text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Reseller Solutions
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Netflix 4K UHD Household Bypass</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>YouTube Premium &amp; Family</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Disney+ Hotstar Residential IP</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Amazon Prime Video Smart DNS</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Spotify Premium Master Accounts</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Dedicated Static Residential IPs</span>
                    </li>
                  </ul>
                </div>

                {/* Col 4: Platform Navigation */}
                <div className="space-y-3">
                  <h5 className={`font-black text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Reseller Portal
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('login')}>
                      <ChevronRight className="h-3 w-3 text-amber-500" />
                      <span className="font-bold text-amber-500">Reseller Portal Login &rarr;</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('portal'); setPortalTab('topup'); }}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Instant Credit Packages</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('portal'); setPortalTab('dns'); }}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>DNS Configuration Guides</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('portal'); setPortalTab('resellers'); }}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Sub-Reseller Management</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('portal'); setPortalTab('transactions'); }}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Billing &amp; Invoices</span>
                    </li>
                    <li className="hover:text-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                      <ChevronRight className="h-3 w-3 text-cyan-500" />
                      <span>Reseller Profit Calculator</span>
                    </li>
                  </ul>
                </div>

                {/* Col 5: Trust & Security */}
                <div className="space-y-3">
                  <h5 className={`font-black text-xs uppercase tracking-wider ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Trust &amp; Security
                  </h5>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>256-Bit SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-cyan-500 shrink-0" />
                      <span>Zero-Log Residential Tunneling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Instant Automated Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>24h Replacement Warranty</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-purple-500 shrink-0" />
                      <span>Global Edge CDN Nodes</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. ACCEPTED PAYMENT METHODS ROW */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
                theme === 'dark' ? 'bg-[#080d20] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-cyan-500" />
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Accepted Payment Gateways:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center text-[11px] font-semibold">
                  <span className="px-2.5 py-1 rounded-md bg-pink-500/10 text-pink-500 border border-pink-500/20">bKash (Personal/Agent)</span>
                  <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">Nagad</span>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">Rocket</span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Malaysia FPX &amp; TNG</span>
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">Bank Wire / Transfer</span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">USDT (TRC20/BEP20)</span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">Visa / Mastercard</span>
                </div>
              </div>

              {/* 4. COPYRIGHT & LEGAL DISCLAIMER */}
              <div className="pt-6 border-t border-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <div>
                  © 2026 <strong className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>MaheHub Networks Ltd</strong>. All rights reserved. Registered Enterprise Reseller Infrastructure.
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <span className="hover:text-cyan-500 cursor-pointer" onClick={() => showToast('Terms of Service: Standard B2B Reseller License.', 'info')}>Terms of Service</span>
                  <span>·</span>
                  <span className="hover:text-cyan-500 cursor-pointer" onClick={() => showToast('Privacy Policy: Strict zero-log telemetry on user DNS traffic.', 'info')}>Privacy Policy</span>
                  <span>·</span>
                  <span className="hover:text-cyan-500 cursor-pointer" onClick={() => showToast('Refund Policy: Unused wallet balance is 100% refundable within 24h.', 'info')}>Refund Policy</span>
                  <span>·</span>
                  <span className="hover:text-cyan-500 cursor-pointer" onClick={() => showToast('Service SLA: 99.98% Guaranteed Uptime for Enterprise Proxies.', 'info')}>SLA Guarantee</span>
                </div>
              </div>

            </div>
          </footer>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: MAHEHUB SELLER LOGIN (Animated Cosmic Vortex Screen) */}
      {/* ========================================================================= */}
      {currentView === 'login' && (
        <ResellerPanel onLogout={() => setCurrentView('home')} onStorefront={() => setCurrentView('home')} />
      )}
      {false && (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#070c1c] overflow-hidden">
          {/* Animated Swirling Star Trail Vortex Canvas (White moving lines as requested) */}
          <StarVortexCanvas className="z-0" />

          <button
            onClick={() => setCurrentView('home')}
            className="absolute top-6 left-6 z-20 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs backdrop-blur border border-white/20 transition-all flex items-center gap-1.5 shadow-xl"
          >
            <span>&larr; Back to Home</span>
          </button>

          <div className="relative z-10 w-full max-w-sm space-y-6 text-center text-white animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white">
                  <Shield className="h-6 w-6 text-cyan-300" />
                </div>
                <span className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                  MaheHub
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium">MaheHub Reseller &amp; Admin Portal</p>
            </div>

            <div className="space-y-3.5">
              <input
                type="text"
                placeholder="Username or Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-slate-300 text-sm focus:outline-none focus:border-white/70 shadow-lg"
              />

              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-slate-300 text-sm focus:outline-none focus:border-white/70 shadow-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                onClick={() => {
                  setCurrentView('portal');
                  setPortalTab('dashboard');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#ffb09c] hover:bg-[#ffa088] text-slate-900 font-black text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95"
              >
                SIGN IN
              </button>

              <div className="flex items-center justify-between text-xs text-slate-300 px-1 pt-1 font-medium">
                <button 
                  onClick={() => showToast('Password reset link sent to your registered email.', 'info')}
                  className="hover:underline"
                >
                  Forgot Password?
                </button>

                <button 
                  onClick={() => {
                    setCurrentView('portal');
                    setPortalTab('resellers');
                    setIsBuyCreditsOpen(true);
                  }}
                  className="hover:underline font-bold text-white"
                >
                  SignUP as Reseller
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: SUAUTH MASTER MANAGEMENT PORTAL (Reseller & Admin Modes) */}
      {/* ========================================================================= */}
      {currentView === 'portal' && (
        <ResellerPanel onLogout={() => setCurrentView('home')} onStorefront={() => setCurrentView('home')} />
      )}
      {false && (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col md:flex-row relative">
          
          {/* Floating Red Notice Tab */}
          <div 
            onClick={() => setIsNoticeOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-4 px-2 rounded-l-2xl shadow-2xl cursor-pointer flex flex-col items-center gap-2 border-y border-l border-rose-400/50 transition-transform hover:-translate-x-1"
            style={{ writingMode: 'vertical-rl' }}
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              ⚠️ গুরুত্বপূর্ণ নোটিশ (Notice)
            </span>
          </div>

          {/* Sidebar */}
          <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#11182f] border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg border border-indigo-400/40">
                    <Radio className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-tight text-white block leading-none">MAHEHUB</span>
                    <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">NETWORKS • DNS &amp; VPN</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Role Toggle (Reseller vs Master Admin) */}
              <div className="p-1 bg-[#0b1227] rounded-xl border border-slate-800 flex text-xs font-bold">
                <button
                  onClick={() => setPortalRole('reseller')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    portalRole === 'reseller' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Reseller
                </button>
                <button
                  onClick={() => setPortalRole('admin')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    portalRole === 'admin' ? 'bg-rose-600 text-white font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Master Admin
                </button>
              </div>

              {/* Reseller Credit Counter Widget (Audio 8 requirement) */}
              <div className="p-3.5 rounded-2xl bg-[#1a2342] border border-blue-900/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Available Credits</span>
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {activeResellerCredits}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Credits</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800">
                  <span className="text-slate-400">1 Credit = 1 Month</span>
                  <button 
                    onClick={() => setIsBuyCreditsOpen(true)}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    + Buy Credits
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 text-xs font-semibold text-slate-300">
                <button
                  onClick={() => { setPortalTab('dashboard'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'dashboard' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => { setPortalTab('customers'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'customers' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    {customers.length}
                  </span>
                </button>

                <button
                  onClick={() => { setPortalTab('resellers'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'resellers' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Resellers (Credit Hub)</span>
                </button>

                <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Network Nodes
                </div>

                <button
                  onClick={() => { setPortalTab('dns'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'dns' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Radio className="h-4 w-4 text-emerald-400" />
                    <span>SmartDNS Server</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                </button>

                <button
                  onClick={() => { setPortalTab('vpn'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'vpn' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <span>OpenVPN Server</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-mono">.ovpn</span>
                </button>

                <div className="pt-2 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Finance &amp; Audit
                </div>

                <button
                  onClick={() => { setPortalTab('topup'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'topup' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>Buy Credits (কোপন)</span>
                </button>

                <button
                  onClick={() => { setPortalTab('transactions'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'transactions' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Transactions</span>
                </button>

                <button
                  onClick={() => { setPortalTab('settings'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    portalTab === 'settings' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings &amp; Failover</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <button 
                onClick={() => setCurrentView('home')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-semibold text-[11px]"
              >
                <span>🏠 Return to Storefront</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Screen */}
          <div className="flex-1 min-h-screen bg-[#0b1021] flex flex-col">
            
            <header className="h-16 bg-[#11182f]/80 backdrop-blur border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden text-slate-300 hover:text-white p-1.5"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
                  <span className="text-cyan-400 uppercase tracking-tight">MAHEHUB</span> / 
                  <span className="text-amber-400 font-black">
                    {portalTab === 'dashboard' && 'Dashboard Overview'}
                    {portalTab === 'customers' && 'Customer Management & Search'}
                    {portalTab === 'resellers' && 'Reseller Agency Management'}
                    {portalTab === 'dns' && 'Private DNS Node (DoT & iOS)'}
                    {portalTab === 'vpn' && 'OpenVPN Cluster (Dhaka Core)'}
                    {portalTab === 'topup' && 'Buy Credits & Coupon Discount'}
                    {portalTab === 'transactions' && 'Audit Transaction Logs'}
                    {portalTab === 'settings' && 'Server Cluster & Failover'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Fast Create Button (Phone Number Only - Audio 8 requirement) */}
                <button
                  onClick={() => setIsFastCustomerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Fast Create (Phone Only)</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300 font-mono">Role: {portalRole.toUpperCase()}</span>
                </div>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {portalTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-[#141d38] p-5 rounded-3xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>Reseller Credits</span>
                        <Coins className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {activeResellerCredits} Credits
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{activeResellerCredits} Accounts Capacity</span>
                        <button onClick={() => setIsBuyCreditsOpen(true)} className="text-cyan-400 font-bold hover:underline">
                          + Buy More
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#141d38] p-5 rounded-3xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>Total Customers</span>
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {customers.length} Users
                      </div>
                      <span className="text-blue-400 text-[11px] font-medium">100% 1-Device Bound</span>
                    </div>

                    <div className="bg-[#141d38] p-5 rounded-3xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>Active Resellers</span>
                        <UserCheck className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {resellers.length} Agencies
                      </div>
                      <span className="text-emerald-400 text-[11px] font-medium">KSA, Malaysia, UAE</span>
                    </div>

                    <div className="bg-[#141d38] p-5 rounded-3xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>SmartDNS &amp; VPN Nodes</span>
                        <Server className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-5 w-5" /> 100% ONLINE
                      </div>
                      <span className="text-slate-400 text-[11px]">Zero IP-block decoupling</span>
                    </div>

                  </div>

                  {/* Fast Action Card (Audio 8 requirement) */}
                  <div className="bg-gradient-to-r from-blue-950/60 via-[#141d38] to-indigo-950/60 p-6 rounded-3xl border border-blue-900/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">Fast Customer Issuance (মোবাইল নম্বর দিয়ে একাউন্ট তৈরি)</h3>
                        <p className="text-xs text-slate-300">
                          শুধু কাস্টমারের মোবাইল নম্বর দিন এবং ১ ক্লিকে হোসটনেম ও স্লিপ তৈরি করুন (১ ক্রেডিট কাটা হবে)
                        </p>
                      </div>

                      <button
                        onClick={() => setIsFastCustomerOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 shrink-0"
                      >
                        + Create Customer Now
                      </button>
                    </div>
                  </div>

                  {/* Customer Quick Search & List */}
                  <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white">Recent Customer Accounts</h3>
                        <p className="text-xs text-slate-400">Search by phone number to renew or inspect</p>
                      </div>

                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search phone number..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-[#11182f] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-56"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#11182f] text-slate-400 uppercase text-[10px] font-bold border-y border-slate-800">
                          <tr>
                            <th className="py-3 px-3">Phone Number</th>
                            <th className="py-3 px-3">Platform</th>
                            <th className="py-3 px-3">Assigned Hostname</th>
                            <th className="py-3 px-3">Expiry Date</th>
                            <th className="py-3 px-3">Device Lock</th>
                            <th className="py-3 px-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-medium">
                          {filteredCustomers.slice(0, 4).map(cust => (
                            <tr key={cust.id} className="hover:bg-slate-800/40">
                              <td className="py-3.5 px-3">
                                <span className="font-mono font-bold text-white block text-sm">{cust.userId}</span>
                                <span className="text-[10px] text-slate-400">{cust.country} {cust.flag}</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                                  {cust.platform}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-mono text-[11px] text-cyan-300">
                                {cust.dnsHostname}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="text-slate-300 font-mono block">{cust.expiryDate}</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cust.deviceBinding.includes('Blocked') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {cust.deviceBinding}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  {/* Renew Button (Audio 8 requirement) */}
                                  <button
                                    onClick={() => {
                                      setRenewTargetCustomer(cust);
                                      setIsRenewModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Renew</span>
                                  </button>

                                  {/* View Details */}
                                  <button
                                    onClick={() => setViewCustomerDetails(cust)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white font-bold text-[10px] border border-blue-500/30"
                                  >
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: CUSTOMERS (Search, Renew, Unbind, Live Real-Time Management) */}
              {portalTab === 'customers' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-lg font-bold text-white">Customer Database &amp; Search (রিয়েল-টাইম কাস্টমার ম্যানেজমেন্ট)</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live Real-Time Active ({customers.length} Subscribers)</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Search by phone number to issue renewal, unbind device, or export subscriber records.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search phone number or token..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-[#11182f] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-56 sm:w-64"
                        />
                      </div>

                      <button
                        onClick={() => setIsFastCustomerOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>+ Create Customer</span>
                      </button>

                      <button
                        onClick={exportCustomersCsv}
                        className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-blue-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                        title="Download CSV"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>

                      {/* Demo Data Management Switcher */}
                      {customers.length > 0 && customers.some(c => c.id.startsWith('CUST-00')) ? (
                        <button
                          onClick={clearDemoCustomers}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                          title="Switch to Clean Production Mode without demo data"
                        >
                          <span>🧹 Clear Demo Accounts</span>
                        </button>
                      ) : (
                        <button
                          onClick={loadSampleDemoData}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                          title="Load sample demo accounts"
                        >
                          <span>📥 Load Demo Sample</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#11182f] text-slate-400 uppercase text-[10px] font-bold border-y border-slate-800">
                        <tr>
                          <th className="py-3 px-3">Phone Number</th>
                          <th className="py-3 px-3">Platform</th>
                          <th className="py-3 px-3">Assigned Hostname</th>
                          <th className="py-3 px-3">Expiry Date</th>
                          <th className="py-3 px-3">Hardware Lock</th>
                          <th className="py-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-medium">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center space-y-3">
                              <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Users className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-white text-sm">Clean Live Production Mode Active</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                  No demo customer accounts found. Click &quot;+ Create Customer&quot; above to register your first real expat subscriber!
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-2 pt-2">
                                <button
                                  onClick={() => setIsFastCustomerOpen(true)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-md"
                                >
                                  + Create First Live Customer
                                </button>
                                <button
                                  onClick={loadSampleDemoData}
                                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                                >
                                  Load Demo Sample
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map(cust => (
                            <tr key={cust.id} className="hover:bg-slate-800/40">
                              <td className="py-3.5 px-3">
                                <span className="font-mono font-bold text-white block text-sm">{cust.userId}</span>
                                <span className="text-[10px] text-slate-400">{cust.country} {cust.flag}</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                                  {cust.platform}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-mono text-[11px] text-cyan-300">
                                {cust.dnsHostname}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="text-slate-300 font-mono block">{cust.expiryDate}</span>
                                <span className="text-[10px] text-slate-500">Auto-block after expiry</span>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cust.deviceBinding.includes('Blocked') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}>
                                    {cust.deviceBinding}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-mono">{cust.deviceHardwareId}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Renew Button (Audio 8 requirement) */}
                                  <button
                                    onClick={() => {
                                      setRenewTargetCustomer(cust);
                                      setIsRenewModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Renew</span>
                                  </button>

                                  {/* iOS Download or Android Copy */}
                                  {cust.platform === 'iOS (iPhone)' ? (
                                    <button
                                      onClick={() => downloadAppleProfile(cust.dnsHostname, cust.userId)}
                                      className="px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold flex items-center gap-1"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>iOS</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => copyText(cust.dnsHostname, `copy-h-${cust.id}`)}
                                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                                    >
                                      {copiedKey === `copy-h-${cust.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                      <span>Host</span>
                                    </button>
                                  )}

                                  {/* Admin Unbind Toggle (Audio 8 requirement: strictly Admin only) */}
                                  {portalRole === 'admin' && (
                                    <button
                                      onClick={() => handleAdminResetDevice(cust.id)}
                                      className="px-2 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/40 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-900"
                                      title="Master Admin Device Unbind"
                                    >
                                      <Unlock className="h-3 w-3" />
                                      <span>Unbind</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setViewCustomerDetails(cust)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                                  >
                                    Slip
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteCustomer(cust.id, cust.userId)}
                                    className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white text-[10px] font-bold border border-rose-800/40"
                                    title="Delete Customer Account"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RESELLERS & CREDIT PACKAGES (Audio 8 requirement) */}
              {portalTab === 'resellers' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Reseller Agencies &amp; Credit Balance</h2>
                      <p className="text-xs text-slate-400">1 Credit = 1 Month DNS. Minimum package: 10 Credits = ৳2,000</p>
                    </div>

                    <button
                      onClick={() => setIsBuyCreditsOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5"
                    >
                      <Coins className="h-4 w-4" />
                      <span>+ Purchase Credits with Coupon</span>
                    </button>
                  </div>

                  {/* Resellers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resellers.map(res => (
                      <div key={res.id} className="p-5 rounded-2xl bg-[#1b2649] border border-slate-800 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">{res.name}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">+{res.whatsappNumber}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            {res.status}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Credits Balance:</span>
                            <strong className="text-amber-400 font-mono text-base">{res.creditsBalance} Credits</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Issued Clients:</span>
                            <strong className="text-white font-mono text-base">{res.totalClients} Users</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Reseller Wallet:</span>
                          <span className="text-emerald-400 font-mono font-bold">৳{res.balanceBdt.toLocaleString()} BDT</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Available Credit Packages (Audio 8 requirement) */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white">Wholesale Credit Packages (হোলসেল ক্রেডিট রেট):</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {CREDIT_PACKAGES.map(pkg => (
                        <div 
                          key={pkg.id} 
                          onClick={() => {
                            setSelectedCreditPkg(pkg);
                            setIsBuyCreditsOpen(true);
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 ${
                            pkg.isPopular ? 'bg-gradient-to-b from-[#1b2a59] to-[#121c3b] border-cyan-400' : 'bg-[#11182f] border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{pkg.credits} Credits</span>
                            {pkg.isPopular && <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.5 rounded">POPULAR</span>}
                          </div>
                          <div className="text-xl font-black text-amber-400 font-mono">৳{pkg.priceBdt.toLocaleString()}</div>
                          <span className="text-[10px] text-slate-400 block mt-1">{pkg.discountTag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: PRIVATE DNS SERVER NODE */}
              {portalTab === 'dns' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Server Node A (Dedicated SmartDNS)</span>
                    <h2 className="text-xl font-black text-white mt-1">Dhaka BDIX Residential SmartDNS Cluster</h2>
                    <p className="text-xs text-slate-400">
                      Handles DoT (Port 853) &amp; DoH (Port 443). Isolated from VPN so its IP never gets blocked by telecom firewalls!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#11182f] border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block">Default Wildcard Hostname:</span>
                      <strong className="font-mono text-base text-emerald-400">*.new2.mahehub.com</strong>
                      <div className="text-xs text-slate-400 mt-1">
                        Node IP: 103.145.118.10 • Secondary IP: 103.145.118.11 • Protocol: DNS-over-TLS (DoT)
                      </div>
                    </div>

                    <button
                      onClick={() => downloadAppleProfile('user-8801968117.new2.mahehub.com', 'Demo_Exp')}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Test Download Apple .mobileconfig</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: OPENVPN RESELLER PANEL (Exact Match of ovpns.online & naxvpn.com from Client Video) */}
              {portalTab === 'vpn' && (
                <div className="space-y-6">
                  {/* Good evening banner & Stat Cards */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#171f3d] to-[#121933] p-6 rounded-3xl border border-indigo-500/30 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                          Good evening, hemayet
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400">
                        Here&apos;s what&apos;s happening with your OpenVPN panel today.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsOpenVpnCreateOpen(true);
                          setCreateVpnError(null);
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#6366F1] hover:bg-[#5254e0] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>+ Add User</span>
                      </button>

                      <button
                        onClick={() => {
                          if (openVpnAccounts.length > 0) {
                            setImportUserAccount(openVpnAccounts[0]);
                            setCurrentView('user_import');
                          }
                        }}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Preview Customer Import View"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Customer Link Demo</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Cards matching video */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#141d38] border border-slate-800 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">Your Users</span>
                        <div className="text-3xl font-black text-white font-mono">
                          {openVpnAccounts.length}
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#141d38] border border-slate-800 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">Servers (Failover Pool)</span>
                        <div className="text-3xl font-black text-emerald-400 font-mono">
                          2
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Server className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#141d38] border border-slate-800 flex items-center justify-between shadow-lg">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400">Taka Balance</span>
                        <div className="text-3xl font-black text-amber-400 font-mono">
                          ৳{resellerTakaBalance.toFixed(2)}
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Wallet className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* OpenVPN Users Table Container */}
                  <div className="bg-[#141d38] rounded-3xl border border-slate-800 p-6 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-white">Users</h3>
                        <p className="text-xs text-slate-400">
                          Active subscribers with bandwidth usage and auto-failover servers
                        </p>
                      </div>

                      {/* Search Users input matching video */}
                      <div className="flex items-center gap-2 max-w-sm w-full">
                        <div className="relative flex-1">
                          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={vpnSearchQuery}
                            onChange={(e) => setVpnSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          onClick={() => {}}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Table matching ovpns.online video */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                            <th className="pb-3 px-3">USERNAME</th>
                            <th className="pb-3 px-3">BANDWIDTH</th>
                            <th className="pb-3 px-3">VALIDITY</th>
                            <th className="pb-3 px-3">STATUS</th>
                            <th className="pb-3 px-3 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {openVpnAccounts
                            .filter(a => a.username.toLowerCase().includes(vpnSearchQuery.toLowerCase()))
                            .map((acc) => {
                              const isUnlimited = acc.bandwidthType === 'Unlimited';
                              const totalMb = isUnlimited ? 50000 : acc.bandwidthGb * 1024;
                              const pct = Math.min(100, Math.round((acc.usedMb / (totalMb || 1)) * 100));

                              return (
                                <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="py-4 px-3">
                                    <div className="font-bold text-white text-sm">{acc.username}</div>
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {acc.server.includes('vip') ? 'VIP Brilliant' : 'Normal Dhaka'} • {acc.serverHost}
                                    </span>
                                  </td>

                                  <td className="py-4 px-3 w-48">
                                    <div className="space-y-1">
                                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all ${
                                            isUnlimited 
                                              ? 'bg-emerald-500' 
                                              : pct > 80 ? 'bg-rose-500' : 'bg-indigo-500'
                                          }`}
                                          style={{ width: `${isUnlimited ? 40 : Math.max(5, pct)}%` }}
                                        />
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-300">
                                        {isUnlimited ? (
                                          <span className="text-emerald-400 font-bold">{(acc.usedMb / 1024).toFixed(1)} GB / Unlimited</span>
                                        ) : (
                                          <span>{acc.usedMb.toFixed(1)} MB / {acc.bandwidthGb}.0 GB ({pct}%)</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-4 px-3 font-mono text-slate-300 text-[11px]">
                                    {acc.expiryDate}
                                  </td>

                                  <td className="py-4 px-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      acc.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : acc.status === 'expired'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}>
                                      {acc.status}
                                    </span>
                                  </td>

                                  <td className="py-4 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {/* Eye icon: view details slip */}
                                      <button
                                        onClick={() => setVpnReadyAccount(acc)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                                        title="View Account Slip"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>

                                      {/* Renew button matching video */}
                                      <button
                                        onClick={() => {
                                          setRenewVpnAccount(acc);
                                          setRenewVpnDays(30);
                                          setRenewVpnBandwidthType(acc.bandwidthType);
                                          setRenewVpnBandwidthGb(acc.bandwidthGb || 10);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all"
                                      >
                                        Renew
                                      </button>

                                      {/* Suspend button matching video */}
                                      <button
                                        onClick={() => {
                                          setOpenVpnAccounts(prev => prev.map(a => 
                                            a.id === acc.id ? { ...a, status: a.status === 'suspended' ? 'active' : 'suspended' } : a
                                          ));
                                          showToast(`Status updated for ${acc.username}`, 'info');
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                                      >
                                        {acc.status === 'suspended' ? 'Activate' : 'Suspend'}
                                      </button>

                                      {/* Delete button matching video */}
                                      <button
                                        onClick={() => {
                                          setOpenVpnAccounts(prev => prev.filter(a => a.id !== acc.id));
                                          showToast(`Account ${acc.username} deleted.`, 'info');
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination footer matching video */}
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                      <span>Showing 1-15 of {openVpnAccounts.length}</span>
                      <div className="flex items-center gap-1">
                        <button className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          1
                        </button>
                        <button className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold flex items-center justify-center text-xs">
                          2
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BUY CREDITS & TOP UP (Audio 8 requirement) */}
              {portalTab === 'topup' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Reseller Credit Deposit</span>
                    <h2 className="text-lg font-bold text-white mt-1">Purchase Reseller Credits (ক্রেডিট কিনুন)</h2>
                    <p className="text-xs text-slate-400">Use bKash, Nagad or Rocket to deposit credits into your reseller wallet</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#e2136e]/10 border border-[#e2136e]/30 space-y-2">
                      <span className="text-xs font-bold text-[#e2136e] block uppercase">bKash Merchant / Personal</span>
                      <div className="font-mono text-base font-bold text-white">01614-082537</div>
                      <span className="text-[10px] text-slate-400">Send Money / Payment</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#f7931e]/10 border border-[#f7931e]/30 space-y-2">
                      <span className="text-xs font-bold text-[#f7931e] block uppercase">Nagad Merchant</span>
                      <div className="font-mono text-base font-bold text-white">01711-234567</div>
                      <span className="text-[10px] text-slate-400">Cash-In / Send Money</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#8b2787]/10 border border-[#8b2787]/30 space-y-2">
                      <span className="text-xs font-bold text-[#8b2787] block uppercase">Rocket Personal</span>
                      <div className="font-mono text-base font-bold text-white">01829-876543-9</div>
                      <span className="text-[10px] text-slate-400">DBBL Mobile Banking</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsBuyCreditsOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl"
                  >
                    + Open Credit Purchase Dialog (কোপন ও পেমেন্ট সাবমিট)
                  </button>
                </div>
              )}

              {/* TAB 7: TRANSACTIONS AUDIT */}
              {portalTab === 'transactions' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-5">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Audit Transaction Logs (ক্রেডিট ও পেমেন্ট হিস্ট্রি)</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#11182f] text-slate-400 uppercase text-[10px] font-bold border-y border-slate-800">
                        <tr>
                          <th className="py-3 px-3">Transaction ID</th>
                          <th className="py-3 px-3">Description</th>
                          <th className="py-3 px-3">Method</th>
                          <th className="py-3 px-3">Credits Impact</th>
                          <th className="py-3 px-3">Amount (BDT)</th>
                          <th className="py-3 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/40">
                            <td className="py-3.5 px-3 font-mono font-bold text-blue-400">{tx.id}</td>
                            <td className="py-3.5 px-3 text-white">{tx.agencyOrUser}</td>
                            <td className="py-3.5 px-3">{tx.gateway}</td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                tx.creditsChanged > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {tx.creditsChanged > 0 ? `+${tx.creditsChanged}` : tx.creditsChanged} Credits
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                              ৳{tx.amountBdt} BDT
                            </td>
                            <td className="py-3.5 px-3 text-slate-400">{tx.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: SETTINGS & FAILOVER */}
              {portalTab === 'settings' && (
                <div className="bg-[#141d38] p-6 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white">Cluster Configuration &amp; Failover</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-5 rounded-2xl bg-[#11182f] border border-slate-800 space-y-2">
                      <span className="font-bold text-emerald-400 block text-sm">Server A (DNS Server IP)</span>
                      <label className="text-slate-400 block text-[11px]">Clean BDIX Residential IP:</label>
                      <input type="text" defaultValue="103.145.118.10" className="w-full bg-[#1b2649] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>

                    <div className="p-5 rounded-2xl bg-[#11182f] border border-slate-800 space-y-2">
                      <span className="font-bold text-cyan-400 block text-sm">Server B (VPN Gateway IP)</span>
                      <label className="text-slate-400 block text-[11px]">OpenVPN Gateway IP:</label>
                      <input type="text" defaultValue="103.145.118.15" className="w-full bg-[#1b2649] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>

          {/* ========================================================================= */}
          {/* MODALS: FAST CREATE, RENEW, BUY CREDITS, DETAILS */}
          {/* ========================================================================= */}

          {/* 1. FAST CUSTOMER CREATION MODAL (Audio 8 requirement: Phone Number Only) */}
          {isFastCustomerOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141d38] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Cost: {fastMonths} Credit ({fastMonths} Month)
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">Fast Create Customer (ফোন নম্বর দিয়ে)</h3>
                  </div>
                  <button onClick={() => setIsFastCustomerOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                {fastError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{fastError}</span>
                  </div>
                )}

                <form onSubmit={handleFastCustomerCreation} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Customer Phone Number (ইউনিক মোবাইল নম্বর):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8801968117694 or 0501234567"
                      value={fastPhoneNumber}
                      onChange={(e) => setFastPhoneNumber(e.target.value)}
                      className="w-full bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      *একটি মোবাইল নম্বরে একটি মাত্র DNS একটিভ থাকবে।
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Device Platform:</label>
                      <select
                        value={fastPlatform}
                        onChange={(e) => setFastPlatform(e.target.value as any)}
                        className="w-full bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="Android">Android (DoT Host)</option>
                        <option value="iOS (iPhone)">iOS (iPhone .mobileconfig)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Package Validity:</label>
                      <select
                        value={fastMonths}
                        onChange={(e) => setFastMonths(parseInt(e.target.value))}
                        className="w-full bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        <option value={1}>১ মাস (1 Credit)</option>
                        <option value={2}>২ মাস (2 Credits)</option>
                        <option value={3}>৩ মাস (3 Credits)</option>
                        <option value={6}>৬ মাস (6 Credits)</option>
                        <option value={12}>১ বছর (12 Credits)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Reseller Credits:</span>
                      <strong className="text-amber-400 font-mono">{activeResellerCredits} Credits</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Credits Deducted:</span>
                      <strong className="text-rose-400 font-mono">-{fastMonths} Credit</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-400">Remaining After Creation:</span>
                      <span className="text-emerald-400 font-mono font-bold">{activeResellerCredits - fastMonths} Credits</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsFastCustomerOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black"
                    >
                      Issue DNS &amp; Get Slip
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 2. RENEW SUBSCRIPTION MODAL (Audio 8 requirement) */}
          {isRenewModalOpen && renewTargetCustomer && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141d38] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      1 Credit = 1 Month
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">Renew Subscription (মেয়াদ বৃদ্ধি)</h3>
                  </div>
                  <button onClick={() => setIsRenewModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleRenewAccount} className="space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block">Customer Account:</span>
                    <strong className="text-white font-mono text-sm block">{renewTargetCustomer.userId}</strong>
                    <span className="text-cyan-300 font-mono text-[11px] block">{renewTargetCustomer.dnsHostname}</span>
                    <span className="text-slate-400 text-[10px] block pt-1">Current Expiry: <strong>{renewTargetCustomer.expiryDate}</strong></span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Select Renewal Extension (কত মাস রিনিউ করতে চান):
                    </label>
                    <select
                      value={renewMonths}
                      onChange={(e) => setRenewMonths(parseInt(e.target.value))}
                      className="w-full bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                    >
                      <option value={1}>+ ১ মাস (Deduct 1 Credit)</option>
                      <option value={2}>+ ২ মাস (Deduct 2 Credits)</option>
                      <option value={3}>+ ৩ মাস (Deduct 3 Credits)</option>
                      <option value={6}>+ ৬ মাস (Deduct 6 Credits)</option>
                      <option value={12}>+ ১ বছর (Deduct 12 Credits)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Reseller Credits:</span>
                      <strong className="text-amber-400 font-mono">{activeResellerCredits} Credits</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Credits Deducted:</span>
                      <strong className="text-rose-400 font-mono">-{renewMonths} Credit</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsRenewModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                    >
                      Confirm Renewal (-{renewMonths} Credit)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. BUY CREDITS WITH COUPON CODE MODAL (Audio 8 requirement) */}
          {isBuyCreditsOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141d38] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Reseller Wholesale Deposit
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">Purchase Credits &amp; Apply Coupon</h3>
                  </div>
                  <button onClick={() => setIsBuyCreditsOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleBuyCreditsSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Select Credit Package:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CREDIT_PACKAGES.map(pkg => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedCreditPkg(pkg)}
                          className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                            selectedCreditPkg.id === pkg.id ? 'bg-[#1b2a59] border-cyan-400 shadow-md' : 'bg-[#11182f] border-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold text-white block">{pkg.credits} Credits</span>
                          <span className="text-sm font-black text-amber-400 font-mono">৳{pkg.priceBdt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon Code Section (Audio 8 requirement) */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Coupon Code / Promo (কোপন কোড):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. VIP10, EID20"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="flex-1 bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                        ✓ {appliedCoupon.code} applied! {appliedCoupon.percent}% discount granted.
                      </span>
                    )}
                  </div>

                  {/* Gateway & TrxID */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Payment Gateway:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCreditPaymentGateway(g)}
                          className={`py-2 rounded-xl border font-bold text-xs ${
                            creditPaymentGateway === g ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-black' : 'bg-[#11182f] border-slate-700 text-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Payment TrxID:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BK9A88721XZ"
                      value={creditPaymentTrxId}
                      onChange={(e) => setCreditPaymentTrxId(e.target.value)}
                      className="w-full bg-[#11182f] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1227] border border-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Total Payable Amount:</span>
                    <strong className="text-emerald-400 font-mono text-base">৳{calculateFinalPrice().toLocaleString()} BDT</strong>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsBuyCreditsOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
                    >
                      Deposit +{selectedCreditPkg.credits} Credits
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 4. CUSTOMER DETAILS & WHATSAPP SLIP MODAL */}
          {viewCustomerDetails && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141d38] border border-blue-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Customer: {viewCustomerDetails.userId}</h3>
                    <span className="text-[10px] text-cyan-400">Private DNS Credentials &amp; Slip</span>
                  </div>
                  <button onClick={() => setViewCustomerDetails(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#11182f] border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono text-white font-bold">{viewCustomerDetails.username}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Token ID:</span>
                      <span className="font-mono text-amber-400 font-bold">{viewCustomerDetails.token}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Private Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white">
                          {showDetailPassword ? `mh_pass_${viewCustomerDetails.userId.slice(-4)}` : '••••••••••••'}
                        </span>
                        <button 
                          onClick={() => setShowDetailPassword(!showDetailPassword)}
                          className="text-slate-400 hover:text-white"
                        >
                          {showDetailPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                      <span className="text-slate-400">Assigned Hostname:</span>
                      <span className="font-mono text-emerald-400 font-bold text-[11px] break-all">
                        {viewCustomerDetails.dnsHostname}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                      <span className="text-slate-400">Device Hardware Lock:</span>
                      <span className="font-mono text-cyan-300 text-[10px]">
                        {viewCustomerDetails.deviceHardwareId}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          🛡️ DNS Clean Pool (Anti-Ban):
                        </span>
                        <span className="font-mono text-slate-300">{liveDnsVpsIp}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-purple-400 font-bold flex items-center gap-1">
                          🚀 OpenVPN Tunnel (Isolated Pool):
                        </span>
                        <span className="font-mono text-slate-300">{liveVpnVpsIp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile & Config Downloads */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Client Connection Configs (1-Click Delivery):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyText(viewCustomerDetails.dnsHostname, 'slip-host')}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 text-[11px]"
                      >
                        {copiedKey === 'slip-host' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === 'slip-host' ? 'Copied Host!' : 'Android Copy Host'}</span>
                      </button>

                      <button
                        onClick={() => downloadAppleProfile(viewCustomerDetails.dnsHostname, viewCustomerDetails.userId)}
                        className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 text-[11px]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download iOS Profile</span>
                      </button>
                    </div>

                    {/* OpenVPN Dual Mode Download (Voice Note 4) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => downloadOvpnProfile(viewCustomerDetails.userId, 'passwordless')}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black flex items-center justify-center gap-1.5 text-[11px] shadow-lg active:scale-95"
                        title="Direct connect with no username and no password prompt"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>⚡ 1-Click OpenVPN</span>
                      </button>

                      <button
                        onClick={() => downloadOvpnProfile(viewCustomerDetails.userId, 'token')}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold flex items-center justify-center gap-1.5 text-[11px]"
                        title="Username embedded, enter 6-digit passcode only"
                      >
                        <Key className="h-3.5 w-3.5" />
                        <span>🔑 Single-Token VPN</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Delivery Slip in Bengali */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      WhatsApp Delivery Slip (কাস্টমারকে পাঠানোর স্লিপ):
                    </span>
                    <div className="p-3.5 rounded-2xl bg-[#0b1021] border border-slate-800 font-sans text-[11px] text-slate-300 whitespace-pre-wrap select-all leading-relaxed">
{`🧾 ইউজার আইডি: ${viewCustomerDetails.userId}
🌐 হোস্টনেম:
${viewCustomerDetails.dnsHostname}
📅 শুরু: ${viewCustomerDetails.startDate} 12:00
⏳ শেষ: ${viewCustomerDetails.expiryDate} 12:00
📌 স্ট্যাটাস: ${viewCustomerDetails.status}

📢 DNS ব্যবহারের গুরুত্বপূর্ণ নির্দেশনা:
🔷 একটি DNS শুধুমাত্র ১টি ডিভাইসে ব্যবহার করা যাবে।
🔷 অতিরিক্ত কোনো ডিভাইসে ব্যবহার করার চেষ্টা করলে DNS স্বয়ংক্রিয়ভাবে ব্লক হয়ে যাবে।`}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        const slipText = `🧾 ইউজার আইডি: ${viewCustomerDetails.userId}\n🌐 হোস্টনেম:\n${viewCustomerDetails.dnsHostname}\n📅 শুরু: ${viewCustomerDetails.startDate} 12:00\n⏳ শেষ: ${viewCustomerDetails.expiryDate} 12:00\n📌 স্ট্যাটাস: ${viewCustomerDetails.status}\n\n📢 DNS ব্যবহারের গুরুত্বপূর্ণ নির্দেশনা:\n🔷 একটি DNS শুধুমাত্র ১টি ডিভাইসে ব্যবহার করা যাবে।\n🔷 অতিরিক্ত কোনো ডিভাইসে ব্যবহার করার চেষ্টা করলে DNS স্বয়ংক্রিয়ভাবে ব্লক হয়ে যাবে।`;
                        copyText(slipText, 'copy-full-slip');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5"
                    >
                      {copiedKey === 'copy-full-slip' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'copy-full-slip' ? 'Slip Copied!' : 'Copy WhatsApp Slip'}</span>
                    </button>

                    {/* Admin Device Unbind Button (Audio 8 requirement) */}
                    {portalRole === 'admin' && (
                      <button
                        onClick={() => handleAdminResetDevice(viewCustomerDetails.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold"
                      >
                        Admin Unbind
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. IMPORTANT NOTICE MODAL (গুরুত্বপূর্ণ নোটিশ) */}
          {isNoticeOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141d38] border border-rose-500/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-black text-rose-400">গুরুত্বপূর্ণ নোটিশ (Important Notice)</h3>
                  <button onClick={() => setIsNoticeOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 space-y-2">
                    <p className="font-bold text-sm text-white">📢 DNS ব্যবহারের অত্যন্ত গুরুত্বপূর্ণ নীতিমালা:</p>
                    <p>১. প্রতিটি DNS হোস্টনেম বা প্রোফাইল <strong>শুধুমাত্র ১টি ডিভাইসে</strong> ব্যবহারের জন্য অনুমোদিত।</p>
                    <p>২. একসাথে দুইটি ডিভাইসে একই DNS চালু করার চেষ্টা করলে সিস্টেম স্বয়ংক্রিয়ভাবে উক্ত DNS সাময়িক ব্লক করে দেবে।</p>
                    <p>৩. কাস্টমার যদি ফোন পরিবর্তন করতে চান, তবে শুধুমাত্র <strong>মাস্টার অ্যাডমিন</strong> এর অনুমতিতে আনবাইন্ড করা যাবে।</p>
                  </div>

                  <button
                    onClick={() => setIsNoticeOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    আমি বুঝতে পেরেছি (I Understand)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. SERVER INFRASTRUCTURE & IP CONFIGURATION MODAL (Voice Note 4) */}
          {isServerModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111936] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl text-white animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Server Infrastructure &amp; IP Segregation</h3>
                      <span className="text-[10px] text-cyan-400 font-mono">BDIX Dhaka Core Isolation Architecture</span>
                    </div>
                  </div>
                  <button onClick={() => setIsServerModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                {/* Important Technical Notice */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Real Phone Testing &amp; Live Server Link:</span>
                  </div>
                  <p>
                    جب آپ اپنے اصلی موبائل فون میں DNS داخل کرتے ہیں تو فون تبھی کام کرے گا جب آپ کا <strong>لائیو BDIX سرور IP</strong> اس پورٹل میں کنیکٹ ہو۔ اگر سرور لائیو نہ ہو تو موبائل انٹرنیٹ رک جائے گا۔
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Pool 1: Dedicated Smart DNS Clean Pool */}
                  <div className="p-4 rounded-2xl bg-[#090f24] border border-emerald-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        🛡️ Dedicated Smart DNS Pool (Anti-Ban Residential):
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Zero Banking Ban
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Used strictly for bKash, Nagad, Rocket, Upay &amp; Alaap. OpenVPN traffic is strictly prohibited from touching this pool.
                    </p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={liveDnsVpsIp}
                        onChange={(e) => setLiveDnsVpsIp(e.target.value)}
                        placeholder="e.g. 103.145.118.24"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs outline-none"
                      />
                      <button
                        onClick={() => showToast('Smart DNS Clean IP Pool Saved!', 'success')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Save DNS IP
                      </button>
                    </div>
                  </div>

                  {/* Pool 2: Dedicated OpenVPN Tunnel Pool */}
                  <div className="p-4 rounded-2xl bg-[#090f24] border border-purple-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold flex items-center gap-1.5">
                        🚀 Dedicated OpenVPN Tunnel Pool (Isolated Server):
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        100% Isolated
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      All high-bandwidth VPN sessions route through this separate cluster. If a banking app blocks this VPN IP, your Smart DNS users remain 100% unaffected.
                    </p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={liveVpnVpsIp}
                        onChange={(e) => setLiveVpnVpsIp(e.target.value)}
                        placeholder="e.g. 185.220.101.55"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-purple-300 font-mono text-xs outline-none"
                      />
                      <button
                        onClick={() => showToast('OpenVPN Isolated Tunnel IP Saved!', 'success')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                      >
                        Save VPN IP
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsServerModalOpen(false);
                      showToast('Server Configuration Active &amp; Synced!', 'success');
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                  >
                    Confirm &amp; Apply Infrastructure
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: CUSTOMER SELF-SERVICE OPENVPN IMPORT (Exact match of video min 6:13) */}
      {/* ========================================================================= */}
      {currentView === 'user_import' && importUserAccount && (
        <div className="min-h-screen bg-[#f3f4f8] text-slate-900 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            {/* Top Bar Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <button
                onClick={() => setCurrentView('portal')}
                className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
              >
                &larr; Back to Reseller Portal
              </button>
              <span className="font-mono text-slate-400 text-[11px]">ovpns.online</span>
            </div>

            {/* Logo and Username Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs">
                <Shield className="h-4 w-4" />
                <span>OPEN VPN SECURE PORTAL</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{importUserAccount.username}</h2>
              <div className="text-xs text-slate-500 font-medium">
                {importUserAccount.server} • <span className="font-mono text-indigo-600">{importUserAccount.serverHost}</span>
              </div>
              <div className="text-xs text-emerald-600 font-bold">
                📅 Expires {importUserAccount.expiryDate}
              </div>
            </div>

            {/* Data Usage Progress Bar matching video */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">DATA USAGE</span>
                <span className="font-mono font-bold text-slate-700">
                  {importUserAccount.bandwidthType === 'Unlimited' 
                    ? 'Unlimited Bandwidth'
                    : `${importUserAccount.usedMb.toFixed(1)} MB / ${importUserAccount.bandwidthGb}.0 GB (${Math.min(100, Math.round((importUserAccount.usedMb / ((importUserAccount.bandwidthGb * 1024) || 1)) * 100))}%)`
                  }
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  style={{ 
                    width: importUserAccount.bandwidthType === 'Unlimited' 
                      ? '35%' 
                      : `${Math.max(5, Math.min(100, (importUserAccount.usedMb / ((importUserAccount.bandwidthGb * 1024) || 1)) * 100))}%` 
                  }}
                />
              </div>
            </div>

            {/* Config Action Buttons matching video */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CONFIG</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadOvpnProfile(importUserAccount.username, 'passwordless')}
                  className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .ovpn</span>
                </button>

                <button
                  onClick={() => {
                    setIsImportPasswordModalOpen(true);
                    setInputImportPassword('');
                    setImportPasswordError(null);
                  }}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-300 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Key className="h-4 w-4" />
                  <span>Import to App</span>
                </button>
              </div>
            </div>

            {/* Get The App buttons matching video */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GET THE APP</span>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=net.openvpn.openvpn"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Android (Play Store)</span>
                </a>
                <a
                  href="https://apps.apple.com/us/app/openvpn-connect/id590379981"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>iOS (App Store)</span>
                </a>
              </div>
            </div>

            {/* Multi-server failover badge */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Multi-Server Failover Active: Auto-reconnects if an IP is blocked.</span>
            </div>

            <div className="text-center text-[10px] text-slate-400 font-medium">
              Powered by MaheHub OpenVPN Networks • BDIX Dhaka Core
            </div>
          </div>
        </div>
      )}

      {/* OPEN VPN CREATE USER MODAL (Exact match of video min 3:05 - 5:00) */}
      {isOpenVpnCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Create User</h3>
              <button onClick={() => setIsOpenVpnCreateOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateVpnUser} className="space-y-4 text-xs">
              {createVpnError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
                  {createVpnError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Username (min 8)
                  </label>
                  <input
                    type="text"
                    value={newVpnUsername}
                    onChange={(e) => setNewVpnUsername(e.target.value)}
                    placeholder="e.g. Mobarok2"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Password (min 6)
                  </label>
                  <input
                    type="text"
                    value={newVpnPassword}
                    onChange={(e) => setNewVpnPassword(e.target.value)}
                    placeholder="min 6 chars"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Server
                </label>
                <select
                  value={newVpnServer}
                  onChange={(e) => setNewVpnServer(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="bangladesh (only normal) (Migrated)">
                    bangladesh (only normal) (Migrated) (Dhaka)
                  </option>
                  <option value="vip server(Brilliant)">
                    vip server(Brilliant) (Dhaka)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newVpnDays}
                    onChange={(e) => setNewVpnDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Bandwidth
                  </label>
                  <select
                    value={newVpnBandwidthType}
                    onChange={(e) => setNewVpnBandwidthType(e.target.value as 'Limited' | 'Unlimited')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-indigo-600 bg-white"
                  >
                    <option value="Limited">Limited</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
              </div>

              {newVpnBandwidthType === 'Limited' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Add Bandwidth (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newVpnBandwidthGb}
                    onChange={(e) => setNewVpnBandwidthGb(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Total Calculation Display matching video */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total:</span>
                <span className="text-lg font-black text-indigo-700 font-mono">
                  ৳{calculateVpnPrice(newVpnServer, newVpnDays, newVpnBandwidthType, newVpnBandwidthGb)}.00
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenVpnCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md shadow-indigo-600/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YOUR VPN ACCOUNT IS READY MODAL (Exact match of video min 5:12 & screenshot) */}
      {vpnReadyAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Your VPN Account is Ready</h3>
              <button onClick={() => setVpnReadyAccount(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {/* USERNAME */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">USERNAME</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={vpnReadyAccount.username}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                  <button
                    onClick={() => copyText(vpnReadyAccount.username, 'vpn-user')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold border border-slate-200"
                  >
                    {copiedKey === 'vpn-user' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">PASSWORD</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={vpnReadyAccount.password}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                  <button
                    onClick={() => copyText(vpnReadyAccount.password, 'vpn-pass')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold border border-slate-200"
                  >
                    {copiedKey === 'vpn-pass' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* IMPORT LINK */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">IMPORT LINK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={vpnReadyAccount.importLink}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-mono text-[11px] truncate"
                  />
                  <button
                    onClick={() => copyText(vpnReadyAccount.importLink, 'vpn-link')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold border border-slate-200"
                  >
                    {copiedKey === 'vpn-link' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* COPY ALL PREVIEW matching video */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">COPY ALL</label>
                  <button
                    onClick={() => {
                      const fullSlip = `Your VPN Account is Ready\n\nUsername: ${vpnReadyAccount.username}\nPassword: ${vpnReadyAccount.password}\nServer: ${vpnReadyAccount.server} (${vpnReadyAccount.serverHost})\nBandwidth: ${vpnReadyAccount.bandwidthType === 'Unlimited' ? 'Unlimited' : `${vpnReadyAccount.bandwidthGb} GB`}\nExpire: ${vpnReadyAccount.expiryDate}\nImport Link: ${vpnReadyAccount.importLink}`;
                      copyText(fullSlip, 'vpn-all');
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500"
                  >
                    {copiedKey === 'vpn-all' ? 'Copied!' : 'Copy All'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap select-all leading-relaxed">
{`Your VPN Account is Ready

Username: ${vpnReadyAccount.username}
Password: ${vpnReadyAccount.password}
Server: ${vpnReadyAccount.server} (${vpnReadyAccount.serverHost})
Bandwidth: ${vpnReadyAccount.bandwidthType === 'Unlimited' ? 'Unlimited' : `${vpnReadyAccount.bandwidthGb} GB`}
Expire: ${vpnReadyAccount.expiryDate}
Import Link: ${vpnReadyAccount.importLink}`}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setImportUserAccount(vpnReadyAccount);
                    setCurrentView('user_import');
                    setVpnReadyAccount(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Customer Page</span>
                </button>

                <button
                  onClick={() => setVpnReadyAccount(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENEW USER MODAL (Exact match of video min 1:34) */}
      {renewVpnAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Renew User</h3>
              <button onClick={() => setRenewVpnAccount(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleRenewVpnUser} className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500">User: </span>
                <strong className="text-slate-900 font-mono">{renewVpnAccount.username}</strong>
              </div>

              <div>
                <span className="text-slate-500">Server: </span>
                <strong className="text-slate-900">{renewVpnAccount.server}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Days</label>
                  <input
                    type="number"
                    min="1"
                    value={renewVpnDays}
                    onChange={(e) => setRenewVpnDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Bandwidth</label>
                  <select
                    value={renewVpnBandwidthType}
                    onChange={(e) => setRenewVpnBandwidthType(e.target.value as 'Limited' | 'Unlimited')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                  >
                    <option value="Limited">Limited</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
              </div>

              {renewVpnBandwidthType === 'Limited' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Add Bandwidth (GB)</label>
                  <input
                    type="number"
                    min="1"
                    value={renewVpnBandwidthGb}
                    onChange={(e) => setRenewVpnBandwidthGb(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-600">Total:</span>
                <span className="text-base font-black text-indigo-700 font-mono">
                  ৳{calculateVpnPrice(renewVpnAccount.server, renewVpnDays, renewVpnBandwidthType, renewVpnBandwidthGb)}.00
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewVpnAccount(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Renew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER YOUR PASSWORD MODAL (Exact match of video min 6:34) */}
      {isImportPasswordModalOpen && importUserAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Enter your password</h3>
              <button onClick={() => setIsImportPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Enter your VPN password to continue and import profile to OpenVPN Connect app.
              </p>

              {importPasswordError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
                  {importPasswordError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">PASSWORD</label>
                <input
                  type="password"
                  placeholder="Your VPN password"
                  value={inputImportPassword}
                  onChange={(e) => setInputImportPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsImportPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (inputImportPassword.trim() === importUserAccount.password) {
                      downloadOvpnProfile(importUserAccount.username, 'passwordless');
                      setIsImportPasswordModalOpen(false);
                      setImportConnectSuccess(true);
                      showToast('Profile authenticated! Ready to import to OpenVPN.', 'success');
                    } else {
                      setImportPasswordError('Invalid password. Please check your credentials.');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING GLOBAL SUPPORT & CONTACT DRAWER (Visible Everywhere) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50">
        {showFloatingSupport && (
          <div className={`mb-3 w-80 max-w-[calc(100vw-2rem)] p-5 rounded-3xl border shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-5 ${
            theme === 'dark' 
              ? 'bg-[#0a0f24] border-slate-700 text-white shadow-cyan-950/40' 
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#25D366] to-emerald-600 flex items-center justify-center text-white shadow-md">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs">Direct Support Desks</h4>
                  <p className="text-[10px] text-slate-400">Instant WhatsApp &amp; Call</p>
                </div>
              </div>
              <button
                onClick={() => setShowFloatingSupport(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bangladesh Support Card */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              theme === 'dark' ? 'bg-[#0f1733] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <span>🇧🇩</span> Bangladesh Support
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-mono text-xs font-bold text-emerald-500">
                +880 1614-082537 <span className="text-[10px] text-slate-400 font-normal">(01614-082537)</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://wa.me/8801614082537?text=Hello%20MaheHub%20BD%20Support"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp BD</span>
                </a>
                <a
                  href="tel:+8801614082537"
                  className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 ${
                    theme === 'dark' ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Malaysia Support Card */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              theme === 'dark' ? 'bg-[#0f1733] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1.5">
                  <span>🇲🇾</span> Malaysia Desk
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-mono text-xs font-bold text-emerald-500">
                +60 17-310 3546 <span className="text-[10px] text-slate-400 font-normal">(017-3103546)</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://wa.me/60173103546?text=Hello%20MaheHub%20Malaysia%20Support"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp MY</span>
                </a>
                <a
                  href="tel:+60173103546"
                  className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 ${
                    theme === 'dark' ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Social Media Links in Drawer */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Official Channels:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://t.me/+5v_WpMb2pjwwNDFl"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram</span>
                </a>
                <a
                  href="https://www.tiktok.com/@maheinternationaltravels?_r=1&_t=ZS-9ABtGvkGcBJ"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-700 transition-all shadow"
                >
                  <Video className="h-3.5 w-3.5 text-pink-400" />
                  <span>TikTok</span>
                </a>
                <a
                  href="https://youtube.com/@mdhemayetuddin-officialbd?si=rXjpWheCiAKcOWH-"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Youtube className="h-3.5 w-3.5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            {/* Official Email Channels */}
            <div className={`p-2.5 rounded-2xl border text-[11px] space-y-1.5 ${
              theme === 'dark' ? 'bg-[#0f1733] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Admin Email:</span>
                <a href="mailto:admin@mahehub.com" className="font-mono text-cyan-400 font-bold hover:underline">admin@mahehub.com</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">B2B &amp; API Partner:</span>
                <a href="mailto:b2b@mahehub.com" className="font-mono text-cyan-400 font-bold hover:underline">b2b@mahehub.com</a>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowFloatingSupport(!showFloatingSupport)}
          className="h-12 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="Direct Support Desks (BD & MY) and Facebook"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </div>
          <span className="font-bold hidden sm:inline">Contact Help Desks</span>
        </button>
      </div>

    </div>
  );
}
