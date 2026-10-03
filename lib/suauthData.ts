export interface CustomerAccount {
  id: string;
  userId: string; // Mobile number e.g. 8801968117694 (Unique key)
  username: string;
  token: string;
  serviceType: 'Private DNS' | 'OpenVPN' | 'Combo (DNS + VPN)';
  platform: 'Android' | 'iOS (iPhone)' | 'Windows' | 'Router';
  dnsHostname: string;
  vpnProfileName: string;
  country: string;
  flag: string;
  priceBdt: number;
  durationMonths: number;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring' | 'Blocked' | 'Multi-Device Alert';
  deviceBinding: '1 Device Bound' | 'Unbound (Pending Next Device)' | 'Blocked (Device Violation)';
  deviceHardwareId: string;
  deviceModel: string;
  serverLocation: string;
}

export const INITIAL_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'CUST-001',
    userId: '8801968117694',
    username: 'hemayet_riyadh',
    token: 'TK-0p5tz0-8841',
    serviceType: 'Private DNS',
    platform: 'Android',
    dnsHostname: 'hemayet-4-0p5tz0.new2.mahehub.com',
    vpnProfileName: 'dhaka-core-01.ovpn',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    priceBdt: 1000,
    durationMonths: 1,
    startDate: '2026-09-29',
    expiryDate: '2026-10-29',
    status: 'Active',
    deviceBinding: '1 Device Bound',
    deviceHardwareId: 'HWID-SMSG-A54-88419',
    deviceModel: 'Samsung Galaxy A54 (Android 14)',
    serverLocation: 'Dhaka BDIX Core 1'
  },
  {
    id: 'CUST-002',
    userId: '8801711234567',
    username: 'farhana_ios',
    token: 'TK-k8m2a1-9012',
    serviceType: 'Private DNS',
    platform: 'iOS (iPhone)',
    dnsHostname: 'farhana-7-k8m2a1.new2.mahehub.com',
    vpnProfileName: 'dhaka-core-02.ovpn',
    country: 'Malaysia',
    flag: '🇲🇾',
    priceBdt: 2500,
    durationMonths: 3,
    startDate: '2026-09-25',
    expiryDate: '2026-12-25',
    status: 'Active',
    deviceBinding: '1 Device Bound',
    deviceHardwareId: 'HWID-APPL-IP15P-33120',
    deviceModel: 'iPhone 15 Pro (iOS 18.2)',
    serverLocation: 'Dhaka BDIX Core 2'
  },
  {
    id: 'CUST-003',
    userId: '8801829876543',
    username: 'tariq_dubai',
    token: 'TK-9q1xz4-7734',
    serviceType: 'OpenVPN',
    platform: 'Android',
    dnsHostname: 'tariq-2-9q1xz4.new2.mahehub.com',
    vpnProfileName: 'bd-ovpn-tariq.ovpn',
    country: 'UAE (Dubai)',
    flag: '🇦🇪',
    priceBdt: 1800,
    durationMonths: 2,
    startDate: '2026-09-28',
    expiryDate: '2026-11-28',
    status: 'Active',
    deviceBinding: '1 Device Bound',
    deviceHardwareId: 'HWID-XIAO-RN13-55912',
    deviceModel: 'Xiaomi Redmi Note 13',
    serverLocation: 'Dhaka Residential Gateway'
  },
  {
    id: 'CUST-004',
    userId: '8801644556677',
    username: 'kabir_expat',
    token: 'TK-3w9pa2-1144',
    serviceType: 'Private DNS',
    platform: 'iOS (iPhone)',
    dnsHostname: 'kabir-9-3w9pa2.new2.mahehub.com',
    vpnProfileName: 'dhaka-core-01.ovpn',
    country: 'Qatar (Doha)',
    flag: '🇶🇦',
    priceBdt: 1000,
    durationMonths: 1,
    startDate: '2026-09-02',
    expiryDate: '2026-10-02',
    status: 'Expiring',
    deviceBinding: 'Blocked (Device Violation)',
    deviceHardwareId: 'HWID-APPL-IP13-MULTI-ATTEMPT',
    deviceModel: 'iPhone 13 (Multi-Device Attempt)',
    serverLocation: 'Dhaka BDIX Core 1'
  }
];

export interface ResellerAgency {
  id: string;
  name: string;
  whatsappNumber: string;
  creditsBalance: number; // 1 credit = 1 month DNS
  balanceBdt: number;
  totalClients: number;
  status: 'Active' | 'Low Credit';
  registeredDate: string;
}

export const INITIAL_RESELLERS: ResellerAgency[] = [
  {
    id: 'RES-01',
    name: 'Probashi Telecom Riyadh (Hemayet)',
    whatsappNumber: '8801614082537',
    creditsBalance: 62, // 62 months capability
    balanceBdt: 12400,
    totalClients: 154,
    status: 'Active',
    registeredDate: '2026-08-15'
  },
  {
    id: 'RES-02',
    name: 'Bangla Linkway Malaysia (KL)',
    whatsappNumber: '8801722998877',
    creditsBalance: 21,
    balanceBdt: 4200,
    totalClients: 68,
    status: 'Active',
    registeredDate: '2026-09-01'
  },
  {
    id: 'RES-03',
    name: 'Gulf Smart Telecom Dubai',
    whatsappNumber: '8801833445566',
    creditsBalance: 4,
    balanceBdt: 800,
    totalClients: 29,
    status: 'Low Credit',
    registeredDate: '2026-09-10'
  }
];

export interface CreditPackage {
  id: string;
  credits: number;
  priceBdt: number;
  discountTag: string;
  isPopular?: boolean;
}

// OpenVPN Account System (Exact replica of ovpns.online shown in Client Video)
export interface OpenVpnAccount {
  id: string;
  username: string;
  password: string;
  server: string;
  serverHost: string;
  days: number;
  bandwidthType: 'Limited' | 'Unlimited';
  bandwidthGb: number;
  usedMb: number;
  totalPriceBdt: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
  importLink: string;
  multiServerFailover: string[];
}

export const INITIAL_OPENVPN_ACCOUNTS: OpenVpnAccount[] = [
  {
    id: 'VPN-001',
    username: 'Mobarok2',
    password: 'Mobarok2',
    server: 'bangladesh (only normal) (Migrated)',
    serverHost: 'my.ovpn.ovh',
    days: 30,
    bandwidthType: 'Limited',
    bandwidthGb: 20,
    usedMb: 950.5,
    totalPriceBdt: 80,
    startDate: '2026-09-28',
    expiryDate: '28 OCTOBER 2026',
    status: 'active',
    importLink: '/?view=user_import&user=Mobarok2',
    multiServerFailover: ['103.145.118.24', '185.220.101.55', '45.148.12.80']
  },
  {
    id: 'VPN-002',
    username: 'babuvip1',
    password: 'babuvip1',
    server: 'vip server(Brilliant)',
    serverHost: 'vip.ovpn.ovh',
    days: 30,
    bandwidthType: 'Limited',
    bandwidthGb: 1,
    usedMb: 175.7,
    totalPriceBdt: 40,
    startDate: '2026-08-16',
    expiryDate: '16 SEPTEMBER 2026',
    status: 'expired',
    importLink: '/?view=user_import&user=babuvip1',
    multiServerFailover: ['103.150.84.10', '185.220.101.55']
  },
  {
    id: 'VPN-003',
    username: 'sojibislam1',
    password: 'sojib_pass99',
    server: 'bangladesh (only normal) (Migrated)',
    serverHost: 'my.ovpn.ovh',
    days: 30,
    bandwidthType: 'Limited',
    bandwidthGb: 10,
    usedMb: 632.0,
    totalPriceBdt: 40,
    startDate: '2026-09-11',
    expiryDate: '11 OCTOBER 2026',
    status: 'active',
    importLink: '/?view=user_import&user=sojibislam1',
    multiServerFailover: ['103.145.118.24', '45.148.12.80']
  },
  {
    id: 'VPN-004',
    username: 'saurav55',
    password: 'saurav_pass88',
    server: 'vip server(Brilliant)',
    serverHost: 'vip.ovpn.ovh',
    days: 30,
    bandwidthType: 'Limited',
    bandwidthGb: 5,
    usedMb: 3.0,
    totalPriceBdt: 50,
    startDate: '2026-09-07',
    expiryDate: '07 OCTOBER 2026',
    status: 'active',
    importLink: '/?view=user_import&user=saurav55',
    multiServerFailover: ['103.150.84.10', '185.220.101.55']
  },
  {
    id: 'VPN-005',
    username: 'Habib1234',
    password: 'habib_unlimited',
    server: 'vip server(Brilliant)',
    serverHost: 'vip.ovpn.ovh',
    days: 30,
    bandwidthType: 'Unlimited',
    bandwidthGb: 0,
    usedMb: 25200,
    totalPriceBdt: 240,
    startDate: '2026-09-10',
    expiryDate: '10 OCTOBER 2026',
    status: 'active',
    importLink: '/?view=user_import&user=Habib1234',
    multiServerFailover: ['103.150.84.10', '185.220.101.55', '45.148.12.80']
  },
  {
    id: 'VPN-006',
    username: 'jahangir123',
    password: 'jahangir_secret',
    server: 'bangladesh (only normal) (Migrated)',
    serverHost: 'my.ovpn.ovh',
    days: 30,
    bandwidthType: 'Limited',
    bandwidthGb: 1,
    usedMb: 14.7,
    totalPriceBdt: 40,
    startDate: '2026-07-13',
    expiryDate: '13 AUGUST 2026',
    status: 'expired',
    importLink: '/?view=user_import&user=jahangir123',
    multiServerFailover: ['103.145.118.24']
  }
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'PKG-10', credits: 10, priceBdt: 2000, discountTag: '৳200 / Credit (Standard)' },
  { id: 'PKG-25', credits: 25, priceBdt: 4500, discountTag: '৳180 / Credit (Save ৳500)', isPopular: true },
  { id: 'PKG-50', credits: 50, priceBdt: 8500, discountTag: '৳170 / Credit (Save ৳1,500)' },
  { id: 'PKG-100', credits: 100, priceBdt: 16000, discountTag: '৳160 / Credit (Save ৳4,000)' }
];

export const VALID_COUPONS: Record<string, { discountPercent: number; description: string }> = {
  'VIP10': { discountPercent: 10, description: 'VIP Reseller 10% Discount' },
  'EID20': { discountPercent: 20, description: 'Eid Festival 20% Special' },
  'HEMAYET': { discountPercent: 15, description: 'Hemayet Partner 15% Bonus' }
};

export interface TransactionRecord {
  id: string;
  agencyOrUser: string;
  type: 'Credit Purchase' | 'Account Creation' | 'Renewal' | 'Admin Adjustment';
  gateway: 'bKash' | 'Nagad' | 'Rocket' | 'Credits Deduction';
  amountBdt: number;
  creditsChanged: number;
  date: string;
  status: 'Completed' | 'Pending';
  trxId: string;
}

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-99120',
    agencyOrUser: 'Probashi Telecom Riyadh (Hemayet)',
    type: 'Credit Purchase',
    gateway: 'bKash',
    amountBdt: 2000,
    creditsChanged: +10,
    date: '2026-09-30 14:15',
    status: 'Completed',
    trxId: 'BK9A88721XZ'
  },
  {
    id: 'TXN-99119',
    agencyOrUser: 'Customer: 8801968117694',
    type: 'Account Creation',
    gateway: 'Credits Deduction',
    amountBdt: 200,
    creditsChanged: -1,
    date: '2026-09-29 11:49',
    status: 'Completed',
    trxId: 'SYS-DNS-01'
  },
  {
    id: 'TXN-99118',
    agencyOrUser: 'Customer: 8801711234567',
    type: 'Renewal',
    gateway: 'Credits Deduction',
    amountBdt: 600,
    creditsChanged: -3,
    date: '2026-09-28 09:30',
    status: 'Completed',
    trxId: 'SYS-RNW-03'
  }
];
