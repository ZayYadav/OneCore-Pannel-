import { User, Key, Reseller, Transaction, Ticket, SystemNotification, AuditLog, SystemSettings, TenantAnnouncement } from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr_1',
    username: 'Mexx',
    email: 'mexx@rainbow.pro',
    country: 'United States',
    deviceId: 'DEV-A83F-99D2-E412',
    lastLogin: '2026-05-31 20:30:15',
    status: 'active',
    balance: 999999999.00,
    role: 'super_admin',
    registrationDate: '2026-01-10 10:24:11',
    notes: 'Primary server deployment master account.'
  },
  {
    id: 'usr_2',
    username: 'apex_reseller',
    email: 'reseller_vip@gmail.com',
    country: 'Germany',
    deviceId: 'DEV-9988-F8E1-72B9',
    lastLogin: '2026-05-31 19:44:02',
    status: 'active',
    balance: 350.00,
    role: 'reseller',
    registrationDate: '2026-03-15 14:15:30',
    notes: 'Highly active reseller covering Western Europe.'
  },
  {
    id: 'usr_3',
    username: 'shadow_gamer',
    email: 'shadow@gmail.com',
    country: 'Brazil',
    deviceId: 'DEV-CC42-3B49-E810',
    lastLogin: '2026-05-31 18:12:44',
    status: 'active',
    balance: 15.00,
    role: 'user',
    registrationDate: '2026-05-01 22:11:59',
    notes: 'Premium cheat engine subscriber.'
  },
  {
    id: 'usr_4',
    username: 'bad_actor',
    email: 'spammer_99@outlook.com',
    country: 'Russia',
    deviceId: 'DEV-FFFF-0000-E3B2',
    lastLogin: '2026-05-28 04:02:10',
    status: 'banned',
    balance: 0.00,
    role: 'user',
    registrationDate: '2026-05-18 11:45:00',
    notes: 'Banned for attempting memory injections and API flood attacks.'
  },
  {
    id: 'usr_5',
    username: 'hyper_reseller',
    email: 'hyper_keys@proton.me',
    country: 'Singapore',
    deviceId: 'DEV-1122-3344-5566',
    lastLogin: '2026-05-31 20:01:10',
    status: 'active',
    balance: 1200.00,
    role: 'reseller',
    registrationDate: '2026-02-28 09:12:00',
    notes: 'Trusted reseller for Asian region.'
  }
];

export const initialKeys: Key[] = [
  {
    id: 'key_1',
    keyString: 'VIP-AA77-90C3-F90E',
    status: 'active',
    duration: '30_days',
    expiryDate: '2026-06-30 20:41:00',
    creationDate: '2026-05-31 11:32:00',
    deviceLimit: 1,
    usedDevices: ['DEV-CC42-3B49-E810'],
    notes: 'Granted during shadow_gamer subscription renew.',
    createdBy: 'apex_reseller'
  },
  {
    id: 'key_2',
    keyString: 'VIP-LIFETIME-GOLD-777',
    status: 'active',
    duration: 'lifetime',
    expiryDate: null,
    creationDate: '2026-05-12 10:00:00',
    deviceLimit: 3,
    usedDevices: ['DEV-A83F-99D2-E412', 'DEV-9988-F8E1-72B9'],
    notes: 'Super Admin master bypass key. Do not revoke.',
    createdBy: 'superadmin_vip'
  },
  {
    id: 'key_3',
    keyString: 'VIP-BETA-7DAY-8821',
    status: 'inactive',
    duration: '7_days',
    expiryDate: null,
    creationDate: '2026-05-31 18:00:00',
    deviceLimit: 1,
    usedDevices: [],
    notes: 'Pre-generated beta keys for promotion event.',
    createdBy: 'superadmin_vip'
  },
  {
    id: 'key_4',
    keyString: 'VIP-EXPIRED-USER-943',
    status: 'expired',
    duration: '1_day',
    expiryDate: '2026-05-30 14:00:00',
    creationDate: '2026-05-29 14:00:00',
    deviceLimit: 1,
    usedDevices: ['DEV-EE32-4412-ABC9'],
    notes: 'Trial license key expired.',
    createdBy: 'apex_reseller'
  },
  {
    id: 'key_5',
    keyString: 'VIP-SPND-VIOLATION-021',
    status: 'suspended',
    duration: '90_days',
    expiryDate: '2026-08-15 00:00:00',
    creationDate: '2026-05-17 11:00:00',
    deviceLimit: 2,
    usedDevices: ['DEV-FFFF-0000-E3B2'],
    notes: 'Suspended for multi-IP logins violating reseller agreement.',
    createdBy: 'hyper_reseller'
  }
];

export const initialResellers: Reseller[] = [
  {
    id: 'res_1',
    userId: 'usr_2',
    username: 'apex_reseller',
    creditWallet: 350.00,
    commissionRate: 15,
    totalSales: 48,
    revenueGenerated: 1450.00,
    keysCount: 12
  },
  {
    id: 'res_2',
    userId: 'usr_5',
    username: 'hyper_reseller',
    creditWallet: 1200.00,
    commissionRate: 20,
    totalSales: 165,
    revenueGenerated: 4950.00,
    keysCount: 38
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_1',
    userId: 'usr_2',
    username: 'apex_reseller',
    type: 'debit',
    amount: 15.00,
    reason: 'Generated 30-Day Client Key string VIP-AA77-90C3-F90E',
    timestamp: '2026-05-31 11:32:00',
    referenceId: 'REF-KEYGEN-819A'
  },
  {
    id: 'tx_2',
    userId: 'usr_2',
    username: 'apex_reseller',
    type: 'credit',
    amount: 500.00,
    reason: 'Admin assigned credits through PayPal gateway',
    timestamp: '2026-05-30 09:15:00',
    referenceId: 'REF-PAYPAL-9F22'
  },
  {
    id: 'tx_3',
    userId: 'usr_5',
    username: 'hyper_reseller',
    type: 'debit',
    amount: 150.00,
    reason: 'Bulk Generated 10x 30-Day License Keys',
    timestamp: '2026-05-29 18:40:11',
    referenceId: 'REF-BULKGEN-5E12'
  },
  {
    id: 'tx_4',
    userId: 'usr_3',
    username: 'shadow_gamer',
    type: 'debit',
    amount: 15.00,
    reason: 'Purchased 30-Day Subscription (direct checkout)',
    timestamp: '2026-05-01 22:15:00',
    referenceId: 'REF-STRIPE-402E'
  },
  {
    id: 'tx_5',
    userId: 'usr_1',
    username: 'superadmin_vip',
    type: 'credit',
    amount: 10000.00,
    reason: 'Manual bank adjustment - reserves injection',
    timestamp: '2026-05-01 00:01:00',
    referenceId: 'REF-ADJUST-0001'
  }
];

export const initialTickets: Ticket[] = [
  {
    id: 'tkt_1',
    userId: 'usr_3',
    username: 'shadow_gamer',
    title: 'Hardware ID Mismatch Error',
    category: 'license_issue',
    priority: 'high',
    status: 'replied',
    creationDate: '2026-05-31 14:10:00',
    messages: [
      {
        id: 'msg_1_1',
        sender: 'user',
        senderName: 'shadow_gamer',
        message: "Hello, I re-installed Windows 11 on my computer and now the cheat engine returns 'HWID_MISMATCH' code when checking my key. Can you please reset my device lock?",
        timestamp: '2026-05-31 14:10:00'
      },
      {
        id: 'msg_1_2',
        sender: 'admin',
        senderName: 'superadmin_vip',
        message: 'Hi shadow_gamer, I have audited your account and reset your registered HWID lock. Please restart the app client and log in again. Let us know if you experience further issues!',
        timestamp: '2026-05-31 14:25:00'
      }
    ]
  },
  {
    id: 'tkt_2',
    userId: 'usr_2',
    username: 'apex_reseller',
    title: 'Custom API Webhook Integration Request',
    category: 'api_error',
    priority: 'medium',
    status: 'open',
    creationDate: '2026-05-30 22:04:12',
    messages: [
      {
        id: 'msg_2_1',
        sender: 'user',
        senderName: 'apex_reseller',
        message: 'Would it be possible to add client registration webhooks to our accounts? I want to hook up Discord bots that alert me whenever someone activates a key generated by my reseller wallet.',
        timestamp: '2026-05-30 22:04:12'
      }
    ]
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'ntf_1',
    title: 'Database Cluster Maintenance Completed',
    message: 'The main cluster has been updated to MySQL 8.0.35. Global query speeds improved by 23%.',
    type: 'success',
    toRole: 'all',
    timestamp: '2026-05-31 12:00:00',
    read: false
  },
  {
    id: 'ntf_2',
    title: 'URGENT Security Patch: IP Whitelisting Update',
    message: 'To prevent API spoofing, all custom script servers must whitelist API gateway node IP in reseller settings.',
    type: 'danger',
    toRole: 'reseller',
    timestamp: '2026-05-30 15:45:00',
    read: false
  },
  {
    id: 'ntf_3',
    title: 'Reseller Commission Bump',
    message: 'Reseller tier 1 commission rate has been permanently increased from 12% to 15%. Keep selling!',
    type: 'success',
    toRole: 'reseller',
    timestamp: '2026-05-28 09:00:00',
    read: true
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    userId: 'usr_1',
    username: 'superadmin_vip',
    role: 'super_admin',
    action: 'Reset HWID lock for shadow_gamer',
    category: 'key_management',
    ipAddress: '159.203.8.44',
    device: 'Administrator Console (Chrome macOS)',
    timestamp: '2026-05-31 14:25:00',
    status: 'success'
  },
  {
    id: 'log_2',
    userId: 'usr_3',
    username: 'shadow_gamer',
    role: 'user',
    action: 'API Key Verification request made',
    category: 'api',
    ipAddress: '177.105.12.89',
    device: 'CS2_VIP_Loader_v4.2',
    timestamp: '2026-05-31 11:35:12',
    status: 'success'
  },
  {
    id: 'log_3',
    userId: 'usr_4',
    username: 'bad_actor',
    role: 'user',
    action: 'Multiple failed logins - brute force detected',
    category: 'security',
    ipAddress: '45.182.203.11',
    device: 'Python-urllib/3.10',
    timestamp: '2026-05-28 04:02:10',
    status: 'failed'
  },
  {
    id: 'log_4',
    userId: 'usr_2',
    username: 'apex_reseller',
    role: 'reseller',
    action: 'Generated key strings: VIP-AA77-90C3-F90E',
    category: 'key_management',
    ipAddress: '82.165.92.12',
    device: 'Reseller Portal Web App',
    timestamp: '2026-05-31 11:32:00',
    status: 'success'
  }
];

export const initialSettings: SystemSettings = {
  siteName: 'OneBox Panel',
  brandName: 'OneBox',
  maintenanceMode: false,
  securityLevel: 'high',
  apiRateLimit: 120,
  smtpHost: 'smtp.rainbow.pro',
  smtpEmail: 'noreply@rainbow.pro',
  enable2FA: true,
  rainbowIntensity: 'high'
};

export const initialAnnouncements: TenantAnnouncement[] = [
  {
    id: 'ann_1',
    ownerId: 'owner_ravi',
    message: '🚀 Welcome to Owner Ravi\'s Network! BGMI VIP inject update v3.5 is now fully active on server nodes. Instruct users to reset HWID if they changed smartphones.',
    timestamp: '2026-06-01 08:30:00',
    author: 'ravi_owner'
  },
  {
    id: 'ann_2',
    ownerId: 'super_admin',
    message: '🛡️ SYSTEM BROADCAST: All tenant nodes are instructed to verify that their secondary API endpoints are routing via tls_1.3. Happy selling!',
    timestamp: '2026-05-31 16:20:00',
    author: 'Mexx (Super Admin)'
  }
];
