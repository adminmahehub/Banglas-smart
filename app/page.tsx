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
  CreditPackage
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
  // Navigation: 'home' | 'login' | 'portal'
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'portal'>('home');

  // Active Role in Portal: 'reseller' or 'admin'
  const [portalRole, setPortalRole] = useState<'reseller' | 'admin'>('reseller');

  // Portal active tab
  const [portalTab, setPortalTab] = useState<'dashboard' | 'vpn' | 'customers' | 'resellers' | 'dns' | 'topup' | 'transactions' | 'settings'>('vpn');

  // (legacy mock state below is only used by the storefront demo)
  const [resellerTakaBalance, setResellerTakaBalance] = useState<number>(461.00); // ৳461.00 from client's video
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
    const ph = trialPhone.replace(/[\s()+-]/g, '');
    if (trialName.trim().length < 2) { setTrialErr('Please enter your name'); return; }
    if (!/^[1-9][0-9]{7,14}$/.test(ph)) { setTrialErr('Enter country code and number together, without +. Example: 966501234567 (Saudi), 8801712345678 (Bangladesh), 923001234567 (Pakistan)'); return; }
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
  const [activeSetupTab, setActiveSetupTab] = useState<'iphone' | 'android'>('iphone');
  const [resellerSalesSlider, setResellerSalesSlider] = useState<number>(50);
  const [site, setSite] = useState<Record<string, string>>({});
  const [notices, setNotices] = useState<{ id: string; kind: string; title: string; body: string }[]>([]);
  const [hiddenNotices, setHiddenNotices] = useState<string[]>([]);
  const price = Number(site.price_per_credit) || 200;
  const bnDigits = (n: number) => n.toLocaleString('en-US').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  const waBd = site.support_whatsapp_bd || '8801614082537';
  const waMy = site.support_whatsapp_my || '60173103546';
  const supportEmail = site.support_email || 'b2b@mahehub.com';
  const fbUrl = site.facebook_url || 'https://www.facebook.com/share/1DQkYhY8hY/?mibextid=wwXIfr';
  const tgUrl = site.telegram_url || 'https://t.me/+5v_WpMb2pjwwNDFl';
  useEffect(() => {
    supabase.rpc('public_site_settings').then(({ data }) => { if (data) setSite(data as Record<string, string>); });
    supabase.rpc('active_announcements').then(({ data }) => { if (Array.isArray(data)) setNotices(data as any); });
  }, []);

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
  const [b2bApiTab, setB2bApiTab] = useState<'dns'>('dns');

  // Dedicated Separate Server Settings (Client Audio Requirement: DNS & VPN must NEVER share the same server IP)
  const [liveDnsVpsIp, setLiveDnsVpsIp] = useState('103.145.118.24');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

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
      amountBdt: fastMonths * price,
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
      amountBdt: renewMonths * price,
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
                href={fbUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="MaheHub Official Facebook Page"
              >
                <Facebook className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </a>

              <a
                href={tgUrl}
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
                href={`https://wa.me/${waBd}?text=Hello%20MaheHub%20BD%20Support`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Bangladesh WhatsApp Support Desk"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>🇧🇩 +{waBd}</span>
              </a>

              <a
                href={`https://wa.me/${waMy}?text=Hello%20MaheHub%20Malaysia%20Support`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Malaysia WhatsApp Regional Desk"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>🇲🇾 +{waMy}</span>
              </a>

              <a
                href={`mailto:${supportEmail}`}
                className="px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600 text-purple-500 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="B2B Server Integration & API: b2b@mahehub.com"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>B2B / API</span>
              </a>

              <button
                onClick={() => setIsServerModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-600/10 hover:bg-cyan-500 text-cyan-500 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
                title="Server Pools: Clean DNS vs Isolated VPN"
              >
                <Server className="h-3.5 w-3.5" />
                <span>Server Pools</span>
              </button>
            </div>
          </div>

        </div>
      </header>
      {notices.filter((n) => !hiddenNotices.includes(n.id)).length > 0 && (
        <div className="mx-auto max-w-4xl space-y-2 px-4 pt-3">
          {notices.filter((n) => !hiddenNotices.includes(n.id)).map((n) => (
            <div key={n.id} className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${n.kind === 'offer' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
              <div><div className="font-black">{n.kind === 'offer' ? '🎁 ' : '📢 '}{n.title}</div>{n.body && <div className="mt-0.5 text-xs opacity-90 whitespace-pre-line">{n.body}</div>}</div>
              <button type="button" aria-label="Close" className="shrink-0 text-lg leading-none opacity-70" onClick={() => setHiddenNotices((h) => [...h, n.id])}>×</button>
            </div>
          ))}
        </div>
      )}

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                    type="tel" inputMode="tel" value={trialPhone} onChange={(e) => setTrialPhone(e.target.value)} placeholder="Country code + number, no + (966501234567)"
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
                    <a className="text-emerald-400 underline" target="_blank" rel="noreferrer" href={`https://wa.me/${waBd}?text=Hello%20MaheHub%2C%20I%20want%20a%20free%201-hour%20trial`}>Ask on WhatsApp</a>
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
                  <p className="text-xs text-slate-300">হোলসেল প্যাকেজ: <strong>১০ ক্রেডিট = ৳{bnDigits(10 * price)}</strong> (১ ক্রেডিট = ১ মাস DNS)</p>
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
                    <span className="text-slate-400 block text-[10px]">হোলসেল খরচ (৳{price} × {resellerSalesSlider}):</span>
                    <strong className="text-slate-200 font-mono text-sm">৳{(resellerSalesSlider * price).toLocaleString()}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0b1227] border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">রিটেল সেল (৳১,০০০ × {resellerSalesSlider}):</span>
                    <strong className="text-cyan-400 font-mono text-sm">৳{(resellerSalesSlider * 1000).toLocaleString()}</strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/40">
                    <span className="text-emerald-300 block text-[10px] font-bold">আপনার মাসিক নেট লাভ:</span>
                    <strong className="text-emerald-400 font-mono text-base font-black">
                      +৳{(resellerSalesSlider * (1000 - price)).toLocaleString()} BDT
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
                    href={`mailto:${supportEmail}?subject=B2B%20Server%20API%20Integration%20Request`}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Get API Key ({supportEmail})</span>
                  </a>

                  <a
                    href={`https://wa.me/${waBd}?text=Hello%20MaheHub%20I%20want%20to%20connect%20my%20website%20to%20your%20server%20via%20API`}
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

              {/* Interactive Multi-API Tabs & Simulator (Client Audio Requirement: Smart DNS API) */}
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
                  </div>
                </div>

                {/* Endpoint Info Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#030712] border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                    <span className="text-cyan-300 font-bold">
                      {b2bApiTab === 'dns' && 'https://api.mahehub.com/v1/dns/provision'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {b2bApiTab === 'dns' && 'Allocates Clean Residential BDIX DNS (Anti-Ban Pool)'}
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
                      +{waBd}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${waBd}?text=Hello%20MaheHub%20BD%20Support`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp BD</span>
                      </a>
                      <a
                        href={`tel:+${waBd}`}
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
                      +{waMy}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${waMy}?text=Hello%20MaheHub%20Malaysia%20Support`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp MY</span>
                      </a>
                      <a
                        href={`tel:+${waMy}`}
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
                        href={fbUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                        <span>Facebook</span>
                      </a>
                      <a
                        href={tgUrl}
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
                        href={fbUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Official Facebook Page"
                        className="h-8 w-8 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center border border-blue-500/20 transition-all shadow-sm"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                      <a
                        href={tgUrl}
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
                        href={`https://wa.me/${waBd}?text=Hello%20MaheHub%20BD%20Support`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Bangladesh (+880 1614-082537)"
                        className="h-8 w-8 rounded-lg bg-emerald-600/10 hover:bg-[#25D366] text-emerald-600 hover:text-white flex items-center justify-center border border-emerald-500/20 transition-all shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://wa.me/${waMy}?text=Hello%20MaheHub%20Malaysia%20Support`}
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
                        <a href={`https://wa.me/${waBd}`} className="font-mono font-bold hover:underline text-cyan-500">
                          +{waBd}
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
                        <a href={`https://wa.me/${waMy}`} className="font-mono font-bold hover:underline text-cyan-500">
                          +{waMy}
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
                        B2B &amp; API: <a href={`mailto:${supportEmail}`} className="hover:underline font-mono text-cyan-400 font-bold">{supportEmail}</a>
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

      {/* ========================================================================= */}
      {/* 3. VIEW: SUAUTH MASTER MANAGEMENT PORTAL (Reseller & Admin Modes) */}
      {/* ========================================================================= */}
      {currentView === 'portal' && (
        <ResellerPanel onLogout={() => setCurrentView('home')} onStorefront={() => setCurrentView('home')} />
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
                +{waBd}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${waBd}?text=Hello%20MaheHub%20BD%20Support`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp BD</span>
                </a>
                <a
                  href={`tel:+${waBd}`}
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
                +{waMy}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${waMy}?text=Hello%20MaheHub%20Malaysia%20Support`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>WhatsApp MY</span>
                </a>
                <a
                  href={`tel:+${waMy}`}
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
                  href={fbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  <span>Facebook</span>
                </a>
                <a
                  href={tgUrl}
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
                <a href={`mailto:${supportEmail}`} className="font-mono text-cyan-400 font-bold hover:underline">{supportEmail}</a>
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
