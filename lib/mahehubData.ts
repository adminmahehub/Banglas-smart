export interface ServiceItem {
  id: string;
  name: string;
  category: 'Network' | 'Travel' | 'Government' | 'Telecom';
  description: string;
  badge?: string;
  iconName: string;
  status: 'Active' | 'Available' | 'Popular';
  price: string;
}

export const MAHEHUB_SERVICES: ServiceItem[] = [
  {
    id: 'private-dns',
    name: 'Private DNS',
    category: 'Network',
    description: 'Native DNS configuration without requiring a dedicated VPN application. Unblock bKash, Nagad & Alaap.',
    badge: 'Zero App • 1-Device Lock',
    iconName: 'Radio',
    status: 'Popular',
    price: '$3.00 / mo'
  },
  {
    id: 'premium-vpn',
    name: 'Premium VPN',
    category: 'Network',
    description: 'High-speed encrypted WireGuard tunnels with downloadable configuration profiles.',
    badge: 'High Speed • 2 Devices',
    iconName: 'Shield',
    status: 'Active',
    price: '$5.00 / mo'
  },
  {
    id: 'proxy-service',
    name: 'Proxy Service',
    category: 'Network',
    description: 'Dedicated residential & datacenter SOCKS5/HTTP proxies for specialized automation & browsing.',
    badge: 'Clean BDIX IP',
    iconName: 'Server',
    status: 'Available',
    price: '$4.00 / mo'
  },
  {
    id: 'air-ticket',
    name: 'Air Ticket Booking',
    category: 'Travel',
    description: 'Domestic & international flight booking from Dhaka, Chittagong, Sylhet to Gulf, SEA & worldwide.',
    badge: 'IATA Agent Fare',
    iconName: 'Plane',
    status: 'Popular',
    price: 'Instant Quote'
  },
  {
    id: 'visa-services',
    name: 'Visa Services',
    category: 'Travel',
    description: 'Work, tourist, Umrah & business visa processing for Saudi Arabia, UAE, Malaysia, Qatar & Oman.',
    badge: 'Full Document Support',
    iconName: 'Passport',
    status: 'Active',
    price: 'From $45'
  },
  {
    id: 'nid-services',
    name: 'NID Services',
    category: 'Government',
    description: 'New NID application, smart card re-issue, data correction and online verification for expats.',
    badge: 'Official EC Portal',
    iconName: 'CreditCard',
    status: 'Active',
    price: 'Assisted Service'
  },
  {
    id: 'passport-services',
    name: 'Passport Services',
    category: 'Government',
    description: 'Bangladesh E-Passport new issuance, renewal support, police verification tracking & emergency renewal.',
    badge: 'DIP Tracking',
    iconName: 'FileText',
    status: 'Active',
    price: 'Assisted Service'
  },
  {
    id: 'birth-reg',
    name: 'Birth Registration',
    category: 'Government',
    description: 'Online birth certificate registration, English version correction and municipal digital record link.',
    badge: 'BDRIS Support',
    iconName: 'FileCheck',
    status: 'Available',
    price: 'Assisted Service'
  },
  {
    id: 'sim-roaming',
    name: 'Bangladesh SIM & Roaming',
    category: 'Telecom',
    description: 'Grameenphone, Banglalink, Robi & Teletalk international roaming activation, eSIM delivery & recharge.',
    badge: 'Global Delivery',
    iconName: 'Smartphone',
    status: 'Popular',
    price: 'From $10'
  }
];

export interface CustomerOrder {
  id: string;
  service: string;
  package: string;
  amount: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  orderStatus: 'Active' | 'Processing' | 'Completed' | 'Expiring Soon';
  date: string;
  expiry: string;
  invoiceId: string;
}

export const SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-MH-8921',
    service: 'Private DNS (Smart Expat)',
    package: '1-Month (1 Device Bound)',
    amount: '$3.00 (10 SAR)',
    paymentStatus: 'Paid',
    orderStatus: 'Active',
    date: '2026-09-29',
    expiry: '2026-10-29',
    invoiceId: 'INV-2026-0921'
  },
  {
    id: 'ORD-MH-8410',
    service: 'Premium WireGuard VPN',
    package: 'Monthly Dual-Device (2 Devices)',
    amount: '$5.00 (18 SAR)',
    paymentStatus: 'Paid',
    orderStatus: 'Active',
    date: '2026-09-20',
    expiry: '2026-10-20',
    invoiceId: 'INV-2026-0841'
  },
  {
    id: 'ORD-MH-7832',
    service: 'Saudi Umrah Visa Assistance',
    package: 'Express Processing + Insurance',
    amount: '$140.00 (525 SAR)',
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    date: '2026-09-10',
    expiry: 'N/A',
    invoiceId: 'INV-2026-0783'
  },
  {
    id: 'ORD-MH-7120',
    service: 'Bangladesh E-Passport Renewal',
    package: 'Embassy Appointment & Correction',
    amount: '$65.00 (245 SAR)',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    date: '2026-09-28',
    expiry: 'N/A',
    invoiceId: 'INV-2026-0712'
  }
];

export interface SupportTicket {
  id: string;
  subject: string;
  service: string;
  department: 'Network & DNS' | 'Travel & Visa' | 'Govt Services' | 'Billing & Wallet';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdated: string;
  unreadReplies: number;
}

export const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-9902',
    subject: 'Need to reset Android device binding for new Samsung S24',
    service: 'Private DNS',
    department: 'Network & DNS',
    priority: 'High',
    status: 'In Progress',
    lastUpdated: '20 Mins ago',
    unreadReplies: 1
  },
  {
    id: 'TCK-9411',
    subject: 'Dhaka to Jeddah flight baggage allowance query',
    service: 'Air Ticket',
    department: 'Travel & Visa',
    priority: 'Medium',
    status: 'Resolved',
    lastUpdated: 'Yesterday',
    unreadReplies: 0
  }
];

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'Android Smartphone' | 'Apple iPhone' | 'Windows Laptop' | 'Router';
  ipAddress: string;
  location: string;
  lastActive: string;
  currentSession: boolean;
}

export const SAMPLE_DEVICES: ConnectedDevice[] = [
  {
    id: 'dev-01',
    name: 'Samsung Galaxy A54 (Android 14)',
    type: 'Android Smartphone',
    ipAddress: '188.54.120.45',
    location: 'Riyadh, Saudi Arabia 🇸🇦',
    lastActive: 'Just now',
    currentSession: true
  }
];

export interface ResellerCustomer {
  id: string;
  name: string;
  phone: string;
  service: 'Private DNS' | 'Premium VPN' | 'Combo';
  hostname: string;
  expiry: string;
  status: 'Active' | 'Expiring' | 'Suspended';
  costPrice: string;
  salePrice: string;
}

export const SAMPLE_RESELLER_CUSTOMERS: ResellerCustomer[] = [
  {
    id: 'rc-101',
    name: 'Tariqul Islam',
    phone: '8801614082537',
    service: 'Private DNS',
    hostname: 'hemayet-4-0p5tz0.new2.mahehub.com',
    expiry: '2026-10-29',
    status: 'Active',
    costPrice: '5 SAR',
    salePrice: '10 SAR'
  },
  {
    id: 'rc-102',
    name: 'Farhana Akhtar (KL)',
    phone: '8801711234567',
    service: 'Private DNS',
    hostname: 'farhana-7-k8m2a1.new2.mahehub.com',
    expiry: '2026-10-25',
    status: 'Active',
    costPrice: '5 SAR',
    salePrice: '12 SAR'
  },
  {
    id: 'rc-103',
    name: 'Muhammad Rahim',
    phone: '8801829876543',
    service: 'Premium VPN',
    hostname: 'vpn-khi-7734.node.mahehub.com',
    expiry: '2026-10-28',
    status: 'Active',
    costPrice: '8 SAR',
    salePrice: '18 SAR'
  },
  {
    id: 'rc-104',
    name: 'Kabir Hossain',
    phone: '8801644556677',
    service: 'Private DNS',
    hostname: 'kabir-9-x7y3z1.new2.mahehub.com',
    expiry: '2026-10-02',
    status: 'Expiring',
    costPrice: '5 SAR',
    salePrice: '10 SAR'
  }
];

export interface AdminMetrics {
  totalCustomers: number;
  totalResellers: number;
  activeServices: number;
  todayOrders: number;
  monthlyRevenue: string;
  pendingPayments: number;
  expiringServices: number;
  openTickets: number;
  cpuUsage: number;
  ramUsage: number;
  bandwidthUsage: string;
  activeSessions: number;
}

export const SAMPLE_ADMIN_METRICS: AdminMetrics = {
  totalCustomers: 2842,
  totalResellers: 147,
  activeServices: 3410,
  todayOrders: 54,
  monthlyRevenue: '$14,890 (55,837 SAR)',
  pendingPayments: 3,
  expiringServices: 18,
  openTickets: 5,
  cpuUsage: 28,
  ramUsage: 44,
  bandwidthUsage: '1.42 Gbps / 10 Gbps',
  activeSessions: 1894
};
