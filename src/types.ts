export interface User {
  id: string;
  username: string;
  email: string;
  country: string;
  deviceId: string;
  lastLogin: string;
  status: 'active' | 'suspended' | 'banned';
  balance: number;
  role: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user';
  registrationDate: string;
  notes: string;
  ownerId?: string;
  parentId?: string;
  referralTokenUsed?: string;
  fullName?: string;
  panelExpiry?: string;
}

export interface Key {
  id: string; // Dynamic UUID
  keyString: string; // The generated license key format (e.g., VIP-XXXX-XXXX)
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  duration: '1_day' | '7_days' | '15_days' | '30_days' | '90_days' | 'lifetime' | 'custom';
  customDays?: number;
  expiryDate: string | null; // null if inactive/lifetime
  creationDate: string;
  deviceLimit: number;
  usedDevices: string[]; // List of registered device IDs
  notes: string;
  createdBy: string; // Username of creator (Admin/Reseller)
  ownerId?: string; // Limit key validity to specific Owner context
}

export interface Reseller {
  id: string;
  userId: string;
  username: string;
  creditWallet: number;
  commissionRate: number; // Percentage
  totalSales: number;
  revenueGenerated: number;
  keysCount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  timestamp: string;
  referenceId: string;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  title: string;
  category: 'license_issue' | 'api_error' | 'reseller_inquiry' | 'payment_issue' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'replied' | 'closed';
  messages: Array<{
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
    attachmentUrl?: string;
  }>;
  creationDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  toRole?: 'all' | 'reseller' | 'admin';
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  category: 'authentication' | 'key_management' | 'user_management' | 'wallet' | 'api' | 'security';
  ipAddress: string;
  device: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

export interface SystemSettings {
  siteName: string;
  brandName: string;
  maintenanceMode: boolean;
  securityLevel: 'high' | 'medium' | 'low';
  apiRateLimit: number; // req/min
  smtpHost: string;
  smtpEmail: string;
  enable2FA: boolean;
  rainbowIntensity: 'low' | 'medium' | 'high';
}

export interface ReferralToken {
  id: string;
  token: string;
  createdBy: string; // Username of creator
  creatorRole: 'super_admin' | 'owner' | 'admin';
  targetRole: 'owner' | 'admin' | 'reseller';
  ownerId?: string; // owner instance binding (if created by Owner or Admin)
  usedCount: number;
  maxUses: number;
  creationDate: string;
  initialBalance?: number;
  panelDuration?: '1_month' | '2_months' | '3_months' | 'lifetime';
}

export interface TenantAnnouncement {
  id: string;
  ownerId: string; // 'super_admin' or specific tenant ownerId e.g. 'owner_ravi'
  message: string;
  timestamp: string;
  author: string;
}
