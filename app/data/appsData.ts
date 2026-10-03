export interface BangladeshiApp {
  id: string;
  name: string;
  category: 'Banking / MFS' | 'VoIP / Calling' | 'OTT / Entertainment' | 'Govt & Citizen';
  developer: string;
  description: string;
  expatBenefit: string;
  iconBg: string;
  iconColor: string;
  domains: string[];
  protocol: 'HTTPS' | 'VoIP / SIP UDP' | 'Hybrid';
  status: 'Operational' | 'Optimized' | 'Maintenance';
  bypassMethod: 'SmartDNS Selective Route' | 'DoH Direct Relay' | 'Residential IP Gateway';
  latencyDhakaMs: number;
}

export const BANGLADESHI_APPS: BangladeshiApp[] = [
  {
    id: 'bkash',
    name: 'bKash',
    category: 'Banking / MFS',
    developer: 'bKash Limited (BRAC Bank)',
    description: 'Bangladesh\'s largest MFS network. Blocked or restricted from foreign IP ranges.',
    expatBenefit: 'Send money to family, cash-out, pay utility bills, and receive remittance in BDT.',
    iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    iconColor: '#e2136e',
    domains: [
      'app.bkash.com',
      'api.bkash.com',
      'auth.bkash.com',
      'pg.bkash.com',
      'gw.bkash.com'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'SmartDNS Selective Route',
    latencyDhakaMs: 38
  },
  {
    id: 'nagad',
    name: 'Nagad',
    category: 'Banking / MFS',
    developer: 'Bangladesh Post Office (Nagad Ltd)',
    description: 'Post office backed digital financial service. Enforces strict Bangladesh geo-locking.',
    expatBenefit: 'Lowest cashout rate, government allowances, easy mobile recharge and merchant payment.',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    iconColor: '#f7931e',
    domains: [
      'api.nagad.com.bd',
      'app.nagad.com.bd',
      'auth.nagad.com.bd',
      'services.nagad.com.bd'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'Residential IP Gateway',
    latencyDhakaMs: 42
  },
  {
    id: 'rocket',
    name: 'DBBL Rocket',
    category: 'Banking / MFS',
    developer: 'Dutch-Bangla Bank PLC',
    description: 'First mobile banking service in Bangladesh. Requires clean BD IP for OTP and device binding.',
    expatBenefit: 'ATM cardless cashout, salary disbursements, direct link to DBBL core savings account.',
    iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    iconColor: '#8b2787',
    domains: [
      'rocket.dutchbanglabank.com',
      'mfs.dbbl.com.bd',
      'api.dbbl.com.bd',
      'app.rocket.dbbl'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'SmartDNS Selective Route',
    latencyDhakaMs: 44
  },
  {
    id: 'alaap',
    name: 'Alaap BTCL',
    category: 'VoIP / Calling',
    developer: 'Bangladesh Telecommunications Co. (BTCL)',
    description: 'Government VoIP service offering BD phone number (+88096...) to call BD landlines & mobiles for 35 paisa/min.',
    expatBenefit: 'Call family, relatives & banks in Bangladesh without international roaming rates. Crucial for expatriates.',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: '#00a651',
    domains: [
      'sip.btcl.com.bd',
      'alaap.btcl.com.bd',
      'auth.alaap.com.bd',
      'voip.btcl.gov.bd'
    ],
    protocol: 'VoIP / SIP UDP',
    status: 'Operational',
    bypassMethod: 'DoH Direct Relay',
    latencyDhakaMs: 32
  },
  {
    id: 'brilliant',
    name: 'Brilliant Connect',
    category: 'VoIP / Calling',
    developer: 'InterCloud Limited',
    description: 'Popular BD IP telephony app giving a dedicated +8809638 number. Geo-fenced outside Bangladesh.',
    expatBenefit: 'Make crystal clear HD calls to any mobile operator (Grameenphone, Banglalink, Robi, Teletalk) at ultra-low rates.',
    iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    iconColor: '#00adef',
    domains: [
      'app.brilliant.com.bd',
      'sip.brilliant.com.bd',
      'api.intercloud.com.bd',
      'connect.brilliant.com.bd'
    ],
    protocol: 'VoIP / SIP UDP',
    status: 'Operational',
    bypassMethod: 'DoH Direct Relay',
    latencyDhakaMs: 35
  },
  {
    id: 'cellfin',
    name: 'Cellfin (IBBL)',
    category: 'Banking / MFS',
    developer: 'Islami Bank Bangladesh PLC',
    description: 'Comprehensive digital banking app for remittance transfer, dual-currency cards, and mCash.',
    expatBenefit: 'Instant deposit of foreign remittance directly to IBBL account from Saudi, UAE, Malaysia.',
    iconBg: 'bg-green-500/10 text-green-500 border-green-500/20',
    iconColor: '#10b981',
    domains: [
      'cellfin.islamibankbd.com',
      'ibbl.com.bd',
      'api.cellfin.com'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'SmartDNS Selective Route',
    latencyDhakaMs: 40
  },
  {
    id: 'chorki',
    name: 'Chorki OTT',
    category: 'OTT / Entertainment',
    developer: 'Prothom Alo Media',
    description: 'Bangladeshi premium OTT platform. Many original dramas and films are restricted to BD catalog.',
    expatBenefit: 'Watch exclusive Bengali movies, web series, and live television streams without content blocks.',
    iconBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    iconColor: '#eab308',
    domains: [
      'api.chorki.com',
      'stream.chorki.com',
      'auth.chorki.com'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'SmartDNS Selective Route',
    latencyDhakaMs: 36
  },
  {
    id: 'nid_govt',
    name: 'Bangladesh NID & Passport',
    category: 'Govt & Citizen',
    developer: 'Bangladesh Election Commission & DIP',
    description: 'Official citizen portal for NID verification, smart card re-issue, and e-passport appointment.',
    expatBenefit: 'Overseas Bangladeshis can verify NID status and book emergency renewal services from abroad.',
    iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconColor: '#3b82f6',
    domains: [
      'services.nidw.gov.bd',
      'epassport.gov.bd',
      'bmet.gov.bd'
    ],
    protocol: 'HTTPS',
    status: 'Operational',
    bypassMethod: 'Residential IP Gateway',
    latencyDhakaMs: 46
  }
];

export interface HostingerConfig {
  rootDomain: string;
  subdomainPrefix: string;
  dnsZoneRecordType: 'A' | 'CNAME' | 'NS';
  nameservers: string[];
  backendDhakaEgressIp: string;
  status: 'Ready to bind' | 'Configured';
}

export const HOSTINGER_SETUP: HostingerConfig = {
  rootDomain: 'clientdomain.com (Hostinger)',
  subdomainPrefix: '*.new2.clientdomain.com',
  dnsZoneRecordType: 'A',
  nameservers: ['ns1.dns-parking.com', 'ns2.dns-parking.com'],
  backendDhakaEgressIp: '103.145.118.10',
  status: 'Ready to bind'
};

export interface ExpatCustomer {
  id: string;
  userId: string;
  tokenId: string;
  name: string;
  email: string;
  currentCountry: string;
  currentCity: string;
  flag: string;
  whitelistedIp: string;
  assignedDnsHostname: string;
  primaryDnsIp: string;
  secondaryDnsIp: string;
  dohEndpoint: string;
  startDate: string;
  endDate: string;
  accountType: 'Normal User' | 'Reseller Client';
  pricePaid: string;
  subscriptionPlan: 'Expat 1-Month (1-Device)';
  activeDevicesCount: number;
  maxDevices: number;
  deviceBindingStatus: 'Bound (1 Device Active)' | 'Unbound' | 'Blocked (Multi-device detected)';
  deviceModel: string;
  status: 'Active' | 'Pending IP Update' | 'Expired';
}

export const SAMPLE_CUSTOMERS: ExpatCustomer[] = [
  {
    id: 'cust-hemayet-01',
    userId: '8801968117694',
    tokenId: 'TK-0p5tz0-8841',
    name: 'Hemayet (Client Example)',
    email: 'hemayet.user@bijoybd.online',
    currentCountry: 'Saudi Arabia',
    currentCity: 'Riyadh',
    flag: '🇸🇦',
    whitelistedIp: '188.54.120.45',
    assignedDnsHostname: 'hemayet-4-0p5tz0.new2.bijoybd.online',
    primaryDnsIp: '103.145.118.10',
    secondaryDnsIp: '103.145.118.11',
    dohEndpoint: 'https://new2.bijoybd.online/dns-query?id=8801968117694',
    startDate: '2026-09-29 11:49',
    endDate: '2026-10-29 11:49',
    accountType: 'Normal User',
    pricePaid: '10 SAR ($2.66)',
    subscriptionPlan: 'Expat 1-Month (1-Device)',
    activeDevicesCount: 1,
    maxDevices: 1,
    deviceBindingStatus: 'Bound (1 Device Active)',
    deviceModel: 'Samsung Galaxy A54 (Android 14)',
    status: 'Active'
  },
  {
    id: 'usr-kl-9012',
    userId: '8801711234567',
    tokenId: 'TK-k8m2a1-9012',
    name: 'Farhana Akhtar',
    email: 'farhana.my@yahoo.com',
    currentCountry: 'Malaysia',
    currentCity: 'Kuala Lumpur',
    flag: '🇲🇾',
    whitelistedIp: '115.164.88.92',
    assignedDnsHostname: 'farhana-7-k8m2a1.new2.bijoybd.online',
    primaryDnsIp: '103.145.118.14',
    secondaryDnsIp: '103.145.118.15',
    dohEndpoint: 'https://new2.bijoybd.online/dns-query?id=8801711234567',
    startDate: '2026-09-25 14:20',
    endDate: '2026-10-25 14:20',
    accountType: 'Reseller Client',
    pricePaid: '5 SAR (Wholesale)',
    subscriptionPlan: 'Expat 1-Month (1-Device)',
    activeDevicesCount: 1,
    maxDevices: 1,
    deviceBindingStatus: 'Bound (1 Device Active)',
    deviceModel: 'iPhone 15 Pro (iOS 18.2)',
    status: 'Active'
  },
  {
    id: 'usr-khi-7734',
    userId: '8801829876543',
    tokenId: 'TK-9q1xz4-7734',
    name: 'Muhammad Tariq',
    email: 'tariq.pk@gmail.com',
    currentCountry: 'Pakistan',
    currentCity: 'Karachi',
    flag: '🇵🇰',
    whitelistedIp: '39.40.180.201',
    assignedDnsHostname: 'tariq-2-9q1xz4.new2.bijoybd.online',
    primaryDnsIp: '103.145.118.18',
    secondaryDnsIp: '103.145.118.19',
    dohEndpoint: 'https://new2.bijoybd.online/dns-query?id=8801829876543',
    startDate: '2026-09-28 09:15',
    endDate: '2026-10-28 09:15',
    accountType: 'Normal User',
    pricePaid: '800 PKR ($2.80)',
    subscriptionPlan: 'Expat 1-Month (1-Device)',
    activeDevicesCount: 1,
    maxDevices: 1,
    deviceBindingStatus: 'Bound (1 Device Active)',
    deviceModel: 'Xiaomi Redmi Note 13',
    status: 'Active'
  }
];

export interface ResellerAccount {
  id: string;
  agencyName: string;
  ownerName: string;
  balanceCredits: number;
  creditRateSAR: number;
  totalGenerated: number;
  totalRevenueSAR: number;
  profitMarginSAR: number;
}

export const SAMPLE_RESELLER: ResellerAccount = {
  id: 'reseller-riyadh-01',
  agencyName: 'Probashi Telecom Riyadh',
  ownerName: 'Hemayet Agency',
  balanceCredits: 42,
  creditRateSAR: 5,
  totalGenerated: 158,
  totalRevenueSAR: 1580,
  profitMarginSAR: 790
};

export interface RelayServer {
  id: string;
  name: string;
  location: string;
  country: string;
  ip: string;
  pingMs: number;
  uptime: string;
  loadPercent: number;
  type: 'Dhaka Core Relay' | 'Regional Edge PoP';
}

export const RELAY_SERVERS: RelayServer[] = [
  {
    id: 'dhaka-core-01',
    name: 'Dhaka BDIX Core 1 (Mohakhali)',
    location: 'Dhaka',
    country: 'Bangladesh 🇧🇩',
    ip: '103.145.118.10',
    pingMs: 14,
    uptime: '99.99%',
    loadPercent: 42,
    type: 'Dhaka Core Relay'
  },
  {
    id: 'dhaka-core-02',
    name: 'Dhaka Residential Gateway 2 (Uttara)',
    location: 'Dhaka',
    country: 'Bangladesh 🇧🇩',
    ip: '103.145.118.11',
    pingMs: 16,
    uptime: '99.98%',
    loadPercent: 48,
    type: 'Dhaka Core Relay'
  },
  {
    id: 'riyadh-edge-01',
    name: 'Riyadh ME Edge Relay',
    location: 'Riyadh',
    country: 'Saudi Arabia 🇸🇦',
    ip: '178.62.91.44',
    pingMs: 28,
    uptime: '100%',
    loadPercent: 35,
    type: 'Regional Edge PoP'
  },
  {
    id: 'kl-edge-01',
    name: 'Kuala Lumpur SEA Edge Relay',
    location: 'Kuala Lumpur',
    country: 'Malaysia 🇲🇾',
    ip: '128.199.202.12',
    pingMs: 31,
    uptime: '99.97%',
    loadPercent: 39,
    type: 'Regional Edge PoP'
  },
  {
    id: 'dubai-edge-01',
    name: 'Dubai Gulf Accelerator',
    location: 'Dubai',
    country: 'UAE 🇦🇪',
    ip: '159.65.14.88',
    pingMs: 25,
    uptime: '99.99%',
    loadPercent: 51,
    type: 'Regional Edge PoP'
  }
];

export function generateCustomerWhatsAppTemplate(customer: ExpatCustomer): string {
  return `🧾 ইউজার আইডি: ${customer.userId}
🌐 হোস্টনেম:
${customer.assignedDnsHostname}
📅 শুরু: ${customer.startDate}
⏳ শেষ: ${customer.endDate}
📌 স্ট্যাটাস: ${customer.status}

📢 DNS ব্যবহারের গুরুত্বপূর্ণ নির্দেশনা:
🔷 একটি DNS শুধুমাত্র ১টি ডিভাইসে ব্যবহার করা যাবে।
🔷 অতিরিক্ত কোনো ডিভাইসে ব্যবহার করার চেষ্টা করলে DNS স্বয়ংক্রিয়ভাবে ব্লক হয়ে যাবে।
🔷 নির্ধারিত সময়ের মধ্যে শুধুমাত্র অনুমোদিত ডিভাইসেই DNS ব্যবহার করুন।`;
}
