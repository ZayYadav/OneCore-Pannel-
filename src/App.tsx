import React, { useState, useEffect } from 'react';
import {
  initialUsers,
  initialKeys,
  initialTransactions,
  initialTickets,
  initialNotifications,
  initialAuditLogs,
  initialSettings,
  initialAnnouncements
} from './data/initialData';
import { User, Key, Transaction, Ticket, SystemNotification, AuditLog, SystemSettings, ReferralToken, TenantAnnouncement } from './types';

// Import modular layouts
import AuthSystem from './components/AuthSystem';
import UserManagement from './components/UserManagement';
import KeyGenerator from './components/KeyGenerator';
import WalletSystem from './components/WalletSystem';
import SupportSystem from './components/SupportSystem';
import SettingsPanel from './components/SettingsPanel';
import ReferralPanel from './components/ReferralPanel';
import ApiIntegrationHub from './components/ApiIntegrationHub';
import SourceConnector from './components/SourceConnector';

// Import design icons
import {
  ShieldAlert,
  Users,
  KeyRound,
  DollarSign,
  Smartphone,
  Server,
  Activity,
  Menu,
  X,
  Sparkles,
  LogOut,
  Bell,
  Code,
  LayoutDashboard,
  Wallet,
  MessageSquare,
  Lock,
  Globe,
  Plus,
  ArrowUpRight,
  CreditCard,
  Shield,
  CheckCircle,
  Megaphone,
  Settings as SettingsIcon
} from 'lucide-react';

export default function App() {
  // Session States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ username: string; role: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user' }>({
    username: 'Mexx',
    role: 'super_admin'
  });

  const [activeTenantOwnerId, setActiveTenantOwnerId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ownerParam = params.get('owner');
    if (ownerParam) {
      setActiveTenantOwnerId(ownerParam);
    }
  }, []);

  // DB States
  const [users, setUsers] = useState<User[]>(() => {
    return [
      ...initialUsers,
      {
        id: 'owner_ravi',
        username: 'ravi_owner',
        email: 'ravi@owner.com',
        country: 'India',
        deviceId: '',
        lastLogin: '2026-05-31 21:00:00',
        status: 'active' as const,
        balance: 10000.00,
        role: 'owner' as const,
        registrationDate: '2026-05-01 10:00:00',
        notes: 'Top-Level Owner registered under Master Panel',
        ownerId: 'owner_ravi'
      },
      {
        id: 'user_admin_deep',
        username: 'deep_admin',
        email: 'deep@admin.com',
        country: 'India',
        deviceId: 'DEV-8899-EBBB-1122',
        lastLogin: '2026-05-31 21:20:00',
        status: 'active' as const,
        balance: 5000.00,
        role: 'admin' as const,
        registrationDate: '2026-05-10 12:00:00',
        notes: 'Regional System Admin in ravi_owner network',
        ownerId: 'owner_ravi',
        parentId: 'ravi_owner'
      },
      {
        id: 'user_reseller_ram',
        username: 'ram_reseller',
        email: 'ram@reseller.com',
        country: 'India',
        deviceId: 'DEV-AA22-EE44-1188',
        lastLogin: '2026-05-31 21:30:00',
        status: 'active' as const,
        balance: 2000.00,
        role: 'reseller' as const,
        registrationDate: '2026-05-15 15:40:00',
        notes: 'Key Reseller under deep_admin network',
        ownerId: 'owner_ravi',
        parentId: 'deep_admin'
      }
    ];
  });
  const [keys, setKeys] = useState<Key[]>(initialKeys);

  const [referralTokens, setReferralTokens] = useState<ReferralToken[]>([
    {
      id: 'tok_1',
      token: '6ysJiM',
      createdBy: 'Mexx',
      creatorRole: 'super_admin',
      targetRole: 'owner',
      usedCount: 0,
      maxUses: 10,
      creationDate: '2026-05-31 10:00:00'
    },
    {
      id: 'tok_2',
      token: 'RAVI_ADMIN_TOKEN',
      createdBy: 'ravi_owner',
      creatorRole: 'owner',
      targetRole: 'admin',
      ownerId: 'owner_ravi',
      usedCount: 0,
      maxUses: 10,
      creationDate: '2026-05-31 12:00:00'
    },
    {
      id: 'tok_3',
      token: 'DEEP_RESELLER_TOKEN',
      createdBy: 'deep_admin',
      creatorRole: 'admin',
      targetRole: 'reseller',
      ownerId: 'owner_ravi',
      usedCount: 0,
      maxUses: 15,
      creationDate: '2026-05-31 14:00:00'
    }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [announcements, setAnnouncements] = useState<TenantAnnouncement[]>(initialAnnouncements);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('readAnnouncementIds');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markAnnouncementAsRead = (id: string) => {
    const updated = [...readAnnouncementIds, id];
    setReadAnnouncementIds(updated);
    try {
      localStorage.setItem('readAnnouncementIds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAnnouncement = (message: string) => {
    const prof = users.find(u => u.username === sessionUser.username);
    const creatorOwnerId = prof?.ownerId || (prof?.role === 'owner' ? prof?.id : null) || activeTenantOwnerId || 'super_admin';
    
    const newAnn: TenantAnnouncement = {
      id: `ann_${Date.now()}`,
      ownerId: creatorOwnerId,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: sessionUser.username
    };
    setAnnouncements([newAnn, ...announcements]);
    triggerSecurityLog(`Broadcasted custom announcement notice: ${message.substring(0, 48)}`, 'security', 'success');
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
    triggerSecurityLog(`Deleted custom announcement notice with reference id ${id}`, 'security', 'warning');
  };

  // BGMILive Push Announcement builder states
  const [pushUpdateTitle, setPushUpdateTitle] = useState('');
  const [pushUpdateMessage, setPushUpdateMessage] = useState('');
  const [pushUpdateType, setPushUpdateType] = useState<'info' | 'success' | 'warning' | 'danger'>('success');

  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushUpdateTitle.trim() || !pushUpdateMessage.trim()) return;
    const newAlert: SystemNotification = {
      id: `ntf_${Date.now()}`,
      title: pushUpdateTitle,
      message: pushUpdateMessage,
      type: pushUpdateType,
      toRole: 'all',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false
    };
    setNotifications([newAlert, ...notifications]);
    setPushUpdateTitle('');
    setPushUpdateMessage('');
    triggerSecurityLog(`Published Security/Status Update Feed: ${pushUpdateTitle}`, 'security', 'success');
  };

  // Layout states
  const [activeTab, setActiveTab] = useState('referrals');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [userFullNameInput, setUserFullNameInput] = useState('');
  const [isConnectMode, setIsConnectMode] = useState(false);

  useEffect(() => {
    const foundProf = users.find(u => u.username === sessionUser.username);
    if (foundProf) {
      setUserFullNameInput(foundProf.fullName || foundProf.username || '');
    } else {
      setUserFullNameInput(sessionUser.username || '');
    }
  }, [sessionUser.username, users]);

  useEffect(() => {
    const checkPath = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const isConnect = pathname.endsWith('/connect') || pathname.includes('/connect') || searchParams.get('connect') === 'true' || searchParams.get('tab') === 'connect';
      setIsConnectMode(isConnect);
    };
    checkPath();
    const interval = setInterval(checkPath, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

  // Computations and metrics for live gauges
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeKeys: 0,
    expiredKeys: 0,
    netRevenue: 0,
    onlineCount: 0
  });

  useEffect(() => {
    // Recalculate within useEffect using the same logic to prevent reference re-triggers
    const activeU = users.find(u => u.username === sessionUser.username);
    const sOwnerId = activeU?.ownerId || (activeU?.role === 'owner' ? activeU?.id : null);
    const contextOwnerId = sOwnerId || activeTenantOwnerId;

    const myFilteredUsers = users.filter(u => {
      if (sessionUser.role === 'super_admin') {
        return activeTenantOwnerId ? u.ownerId === activeTenantOwnerId : true;
      }
      return u.ownerId === contextOwnerId;
    });

    const myFilteredKeys = keys.filter(k => {
      if (sessionUser.role === 'super_admin') {
        return activeTenantOwnerId ? k.ownerId === activeTenantOwnerId : true;
      }
      return k.ownerId === contextOwnerId;
    });

    const totalUsersCount = myFilteredUsers.length;
    const activeKeysCount = myFilteredKeys.filter(k => k.status === 'active').length;
    const expiredKeysCount = myFilteredKeys.filter(k => k.status === 'expired').length;
    const netRevenue = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, current) => sum + current.amount, 0);
    const onlineCount = myFilteredUsers.filter(u => u.status === 'active').length;

    setMetrics({
      totalUsers: totalUsersCount,
      activeKeys: activeKeysCount,
      expiredKeys: expiredKeysCount,
      netRevenue,
      onlineCount
    });
  }, [users, keys, transactions, sessionUser.username, sessionUser.role, activeTenantOwnerId]);

  // Auth operations triggers
  const handleLogin = (role: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user', username: string) => {
    setSessionUser({ username, role });
    setIsAuthenticated(true);
    
    // Add login log entry
    triggerSecurityLog(
      `Successful login: ${username} (${role})`,
      'authentication',
      'success'
    );
  };

  const handleLogout = () => {
    triggerSecurityLog(`Logged out: ${sessionUser.username}`, 'authentication', 'success');
    setIsAuthenticated(false);
  };

  const handleRegisterWithToken = (username: string, email: string, passwordString: string, fullName: string, tokenString: string): { success: boolean; error?: string; role?: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user' } => {
    const foundToken = referralTokens.find(t => t.token.toUpperCase() === tokenString.toUpperCase());
    if (!foundToken) {
      return { success: false, error: 'Incorrect Referral Code. Please ask your Admin/Owner for an active invitation code!' };
    }

    if (foundToken.usedCount >= foundToken.maxUses) {
      return { success: false, error: 'This Referral Code has already reached its maximum usage limit!' };
    }

    // Check duplicate username inside users state
    const duplicate = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (duplicate) {
      return { success: false, error: 'This username is already taken by a workspace node.' };
    }

    // Capture creator/parent profile
    const creatorUser = users.find(u => u.username === foundToken.createdBy);
    const creatorOwnerId = foundToken.ownerId || (creatorUser?.role === 'owner' ? creatorUser?.id : undefined);

    // Calculate role and ownerId
    const targetRole = foundToken.targetRole;
    const newUserId = `usr_${Date.now()}`;
    // If we are creating an owner, they are their own tenant context! Otherwise, they inherit context ownerId
    const assignedOwnerId = targetRole === 'owner' ? `owner_${newUserId}` : creatorOwnerId;

    let computedPanelExpiry = 'Never (Lifetime)';
    if (foundToken.panelDuration && foundToken.panelDuration !== 'lifetime') {
      const now = new Date();
      let monthsToAdd = 1;
      if (foundToken.panelDuration === '2_months') monthsToAdd = 2;
      else if (foundToken.panelDuration === '3_months') monthsToAdd = 3;
      now.setMonth(now.getMonth() + monthsToAdd);
      computedPanelExpiry = now.toISOString().replace('T', ' ').substring(0, 19);
    }

    const newUser: User = {
      id: newUserId,
      username,
      email,
      country: 'India',
      deviceId: '',
      lastLogin: 'N/A',
      status: 'active',
      balance: foundToken.initialBalance || 0.00,
      role: targetRole,
      registrationDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: `Self-registered via invitation token ${tokenString} issued by ${foundToken.createdBy}`,
      parentId: creatorUser?.id || '',
      ownerId: assignedOwnerId,
      referralTokenUsed: tokenString,
      panelExpiry: computedPanelExpiry
    };

    // Increment used count on the token
    setReferralTokens(referralTokens.map(t => t.token.toUpperCase() === tokenString.toUpperCase() ? { ...t, usedCount: t.usedCount + 1 } : t));
    setUsers(prev => [newUser, ...prev]);

    // Track in Security Audit Logs
    triggerSecurityLog(
      `Referral Registration: ${username} signed up as ${targetRole} via code ${tokenString}`,
      'authentication',
      'success'
    );

    return { success: true, role: targetRole };
  };

  const handleGenerateToken = (targetRole: 'owner' | 'admin' | 'reseller', maxUses: number, initialBalance: number = 0, panelDuration?: '1_month' | '2_months' | '3_months' | 'lifetime') => {
    const activeProfile = users.find(u => u.username === sessionUser.username);
    const creatorOwnerId = activeProfile?.ownerId || (activeProfile?.role === 'owner' ? activeProfile?.id : undefined);

    // Enforce role creation constraints:
    // Super admins can create referrals for anyone
    // Owners can create referrals for admins and resellers
    // Admins can create referrals for resellers
    const isAllowed = 
      sessionUser.role === 'super_admin' || 
      (sessionUser.role === 'owner' && (targetRole === 'admin' || targetRole === 'reseller')) ||
      (sessionUser.role === 'admin' && targetRole === 'reseller');

    if (!isAllowed) {
      alert(`Violation of Tier Limits: As a ${sessionUser.role.replace('_', ' ')}, you are not authorized to generate a referral code for ${targetRole.replace('_', ' ')}.`);
      return;
    }

    const totalCost = initialBalance * maxUses;
    const isUnlimited = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';

    if (!isUnlimited && activeProfile && activeProfile.balance < totalCost) {
      alert(`Insufficient balance. Creating this referral token requires ${totalCost.toFixed(2)} Credits but you only have ${activeProfile.balance.toFixed(2)} Credits.`);
      return;
    }

    if (!isUnlimited && activeProfile && totalCost > 0) {
      const success = handleDeductWallet(totalCost, `Generated referral code backed by initial registration balance: ${initialBalance} (x${maxUses} uses)`);
      if (!success) {
        alert("Wallet deduction failed. Referral token creation cancelled.");
        return;
      }
    }

    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newToken: ReferralToken = {
      id: `tok_${Date.now()}`,
      token: randomCode,
      createdBy: sessionUser.username,
      creatorRole: sessionUser.role as any,
      targetRole,
      ownerId: creatorOwnerId,
      usedCount: 0,
      maxUses,
      creationDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      initialBalance: initialBalance,
      panelDuration: panelDuration || 'lifetime'
    };

    setReferralTokens([newToken, ...referralTokens]);
    triggerSecurityLog(`Generated referral token code ${randomCode} for target role ${targetRole} with ${initialBalance} credits backing, valid for ${panelDuration || 'lifetime'}`, 'security', 'success');
  };

  const handleDeleteToken = (id: string) => {
    setReferralTokens(referralTokens.filter(t => t.id !== id));
    triggerSecurityLog(`Revoked active referral token registrar code`, 'security', 'warning');
  };

  const handleTransferCredits = (recipientId: string, amount: number): { success: boolean; message: string } => {
    const activeProfile = users.find(u => u.username === sessionUser.username);
    if (!activeProfile && sessionUser.role !== 'super_admin') {
      return { success: false, message: 'Current session has expired.' };
    }

    const isUnlimited = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';

    if (!isUnlimited && activeProfile && activeProfile.balance < amount) {
      return { success: false, message: `Insufficient credits. You only have ${activeProfile.balance.toFixed(2)} Credits.` };
    }

    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) {
      return { success: false, message: 'Target recipient user not found.' };
    }

    // Deduct credits from sender if not Unlimited
    if (!isUnlimited) {
      setUsers(users.map(u => {
        if (u.username === sessionUser.username) {
          return { ...u, balance: Number((u.balance - amount).toFixed(2)) };
        }
        if (u.id === recipientId) {
          return { ...u, balance: Number((u.balance + amount).toFixed(2)) };
        }
        return u;
      }));
    } else {
      // Unlimited Admin (owner / super_admin) transfers credits from thin air (infinite/new top up)
      setUsers(users.map(u => {
        if (u.id === recipientId) {
          return { ...u, balance: Number((u.balance + amount).toFixed(2)) };
        }
        return u;
      }));
    }

    // Capture dynamic double-entry ledger transactions list
    const referenceId = `REF-TOPUP-${Date.now().toString().substring(10)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: recipient.id,
      username: recipient.username,
      type: 'credit',
      amount,
      reason: `Direct Balance Transfer Top Up from Superior operator ${sessionUser.username}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId
    };

    setTransactions([newTx, ...transactions]);
    triggerSecurityLog(`Successfully topped up downline user ${recipient.username} by ${amount} Credits`, 'wallet', 'success');
    return { success: true, message: `Successfully credited ${amount.toFixed(2)} Credits to ${recipient.username}.` };
  };

  // State Mutations functions
  const handleAddUser = (newU: User) => {
    const activeProfile = users.find(u => u.username === sessionUser.username);
    const isUnlimited = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';
    const amountToDeduct = newU.balance || 0;

    if (!isUnlimited && activeProfile && activeProfile.balance < amountToDeduct) {
       alert(`Insufficient funds in your wallet. Setting a starting balance of ${amountToDeduct.toFixed(2)} Credits requires you to have equal or greater balance. You only have ${activeProfile.balance.toFixed(2)} Credits.`);
       return;
    }

    if (!isUnlimited && amountToDeduct > 0) {
       // Deduct from creator
       const success = handleDeductWallet(amountToDeduct, `Pre-allocated starting balance to child profile ${newU.username}`);
       if (!success) {
         alert("Could not deduct credit balance. Action aborted.");
         return;
       }
    }

    const enrichedUser: User = {
      ...newU,
      ownerId: newU.ownerId || currentContextOwnerId,
      parentId: newU.parentId || activeProfile?.id
    };
    setUsers([enrichedUser, ...users]);
    triggerSecurityLog(`Registered user profile: ${enrichedUser.username}`, 'user_management', 'success');
  };

  const handleUpdateUserStatus = (id: string, status: User['status']) => {
    setUsers(users.map(u => u.id === id ? { ...u, status } : u));
    const u = users.find(x => x.id === id);
    if (u) {
      triggerSecurityLog(
        `Admin adjusted status of ${u.username} to ${status}`,
        'user_management',
        status === 'active' ? 'success' : 'failed'
      );
    }
  };

  const handleAdjustUserBalance = (id: string, amount: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, balance: Math.max(0, u.balance + amount) } : u));
    const targetUser = users.find(u => u.id === id);
    if (targetUser) {
      const type = amount >= 0 ? 'credit' : 'debit';
      const referenceId = `REF-ADJUST-${Date.now().toString().substring(10)}`;
      
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: targetUser.id,
        username: targetUser.username,
        type,
        amount: Math.abs(amount),
        reason: `${amount >= 0 ? 'Assigned' : 'Deducted'} credit line adjustment`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        referenceId
      };

      setTransactions([newTx, ...transactions]);
      triggerSecurityLog(`Adjusted balance for ${targetUser.username} by ${amount} Credits`, 'wallet', 'success');
    }
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target) {
      setUsers(users.filter(u => u.id !== id));
      triggerSecurityLog(`Deleted user account: ${target.username}`, 'user_management', 'success');
    }
  };

  // Key operations triggers
  const handleAddKey = (newK: Key | Key[]) => {
    if (Array.isArray(newK)) {
      setKeys(prev => [...newK, ...prev]);
      newK.forEach(k => {
        triggerSecurityLog(`Generated Subscription key string: ${k.keyString}`, 'key_management', 'success');
      });
    } else {
      setKeys(prev => [newK, ...prev]);
      triggerSecurityLog(`Generated Subscription key string: ${newK.keyString}`, 'key_management', 'success');
    }
  };

  const handleEditKey = (id: string, updatedParams: Partial<Key>) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, ...updatedParams } : k));
    const target = keys.find(x => x.id === id);
    if (target) {
      triggerSecurityLog(`Modified license string ${target.keyString} config values`, 'key_management', 'success');
    }
  };

  const handleUpdateKeyStatus = (id: string, status: Key['status']) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status } : k));
    const key = keys.find(x => x.id === id);
    if (key) {
      triggerSecurityLog(
        `Adjusted VIP key status: ${key.keyString} to ${status}`,
        'key_management',
        status === 'active' ? 'success' : 'warning'
      );
    }
  };

  const handleExtendKey = (id: string, days: number) => {
    setKeys(keys.map(k => {
      if (k.id === id) {
        // If current key has expired, start from now, otherwise extend from current expiration date
        const now = new Date();
        let currentExpiry = k.expiryDate ? new Date(k.expiryDate) : now;
        if (currentExpiry < now) {
          currentExpiry = now;
        }
        currentExpiry.setTime(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
        return {
          ...k,
          expiryDate: currentExpiry.toISOString().replace('T', ' ').substring(0, 19),
          status: 'active' as const
        };
      }
      return k;
    }));
    const key = keys.find(x => x.id === id);
    if (key) {
      const displayHours = days < 1 ? `${Math.round(days * 24)} hours` : `${days} days`;
      triggerSecurityLog(`Extended key validation: ${key.keyString} by +${displayHours}`, 'key_management', 'success');
    }
  };

  const handleResetDevice = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, usedDevices: [] } : k));
    const key = keys.find(x => x.id === id);
    if (key) {
      triggerSecurityLog(`Wiped Hardware register locks for key: ${key.keyString}`, 'key_management', 'success');
    }
  };

  const handleDeleteKey = (idOrIds: string | string[]) => {
    if (Array.isArray(idOrIds)) {
      setKeys(prev => prev.filter(k => !idOrIds.includes(k.id)));
      triggerSecurityLog(`Deleted ${idOrIds.length} subscription keys in bulk`, 'key_management', 'warning');
    } else {
      const key = keys.find(x => x.id === idOrIds);
      if (key) {
        setKeys(prev => prev.filter(k => k.id !== idOrIds));
        triggerSecurityLog(`Deleted key register element: ${key.keyString}`, 'key_management', 'success');
      }
    }
  };

  // Wallet deposit / deduct triggered from perspective of Session user
  const handleDepositWallet = (amount: number, reason: string) => {
    // Current user in state is matched
    const referenceId = `REF-GATE-${Date.now().toString().substring(10)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: 'usr_1', // System user identifier
      username: sessionUser.username,
      type: 'credit',
      amount,
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId
    };

    setTransactions([newTx, ...transactions]);
    
    // Increment balance only if not unlimited
    const isUnlimited = sessionUser.role === 'super_admin' || sessionUser.role === 'owner';
    if (!isUnlimited) {
      setUsers(users.map(u => u.username === sessionUser.username ? { ...u, balance: u.balance + amount } : u));
    }
    triggerSecurityLog(`Deposited ${amount} to wallet Credits. Reason: ${reason}`, 'wallet', 'success');
  };

  const handleDeductWallet = (amount: number, reason: string): boolean => {
    const activeProfile = users.find(u => u.username === sessionUser.username);
    if (!activeProfile) return false;

    const isUnlimited = activeProfile.role === 'super_admin' || activeProfile.role === 'owner';
    if (!isUnlimited && activeProfile.balance < amount) return false;

    const referenceId = `REF-GEN-${Date.now().toString().substring(10)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: activeProfile.id,
      username: sessionUser.username,
      type: 'debit',
      amount,
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      referenceId
    };

    setTransactions([newTx, ...transactions]);
    if (!isUnlimited) {
      setUsers(users.map(u => u.username === sessionUser.username ? { ...u, balance: Math.max(0, u.balance - amount) } : u));
    }
    triggerSecurityLog(`Charged wallet balance automatically ${amount} Credits`, 'wallet', 'success');
    return true;
  };

  // Ticket manipulations triggers
  const handleAddTicketMessage = (tId: string, payload: { sender: 'user' | 'admin'; message: string }) => {
    setTickets(tickets.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          status: payload.sender === 'admin' ? 'replied' as const : 'open' as const,
          messages: [
            ...t.messages,
            {
              id: `msg_${Date.now()}`,
              sender: payload.sender,
              senderName: payload.sender === 'admin' ? sessionUser.username : t.username,
              message: payload.message,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleOpenTicket = (t: Ticket) => {
    setTickets([t, ...tickets]);
    triggerSecurityLog(`Opened dynamic tech support ticket thread: ${t.title}`, 'support', 'success' as any);
  };

  const handleCloseTicket = (tId: string) => {
    setTickets(tickets.map(t => t.id === tId ? { ...t, status: 'closed' as const } : t));
    triggerSecurityLog(`Closed ticket thread: ${tId}`, 'support', 'success' as any);
  };

  // Helper security logging builder
  const triggerSecurityLog = (action: string, category: string, status: 'success' | 'failed' | 'warning' = 'success') => {
    const newEntry: AuditLog = {
      id: `log_${Date.now()}`,
      userId: sessionUser.username,
      username: sessionUser.username,
      role: sessionUser.role,
      action,
      category: category as any,
      ipAddress: '159.203.8.44',
      device: 'Dashboard Portal Console',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status
    };

    setLogs([newEntry, ...logs]);
  };

  const handleActiveSessionsToggle = (collapsed: boolean) => {
    setIsSidebarOpen(!collapsed);
  };

  // User profile matching balance representation
  const activeProfile = users.find(u => u.username === sessionUser.username);
  const userBalance = activeProfile ? activeProfile.balance : 0.00;
  const sessionOwnerId = activeProfile?.ownerId || (activeProfile?.role === 'owner' ? activeProfile?.id : null);

  // Computed Context Owner: Priority is session user's ownerId, fallback to activeTenantOwnerId from URL search query
  const currentContextOwnerId = sessionOwnerId || activeTenantOwnerId;

  // Announcements filtering:
  // - master admin (super_admin) posts -> everyone can see.
  // - owner posts -> their team can see (i.e. those with matching currentContextOwnerId or ownerId).
  // - admin posts -> their resellers / team can see (i.e. parentId === admin.id or shared ownerId with target role reseller/user).
  const activeTenantAnnouncements = announcements.filter(ann => {
    const authorProf = users.find(u => u.username === ann.author);
    const authorRole = ann.authorRole || authorProf?.role || (ann.ownerId === 'super_admin' ? 'super_admin' : 'owner');
    const authorId = ann.authorId || authorProf?.id || '';

    // 1. Super admin posts are visible to all users
    if (ann.ownerId === 'super_admin' || authorRole === 'super_admin') {
      return true;
    }

    // 2. Owner posts are visible to their specific franchise/tenant team
    if (authorRole === 'owner') {
      return currentContextOwnerId === ann.ownerId || currentContextOwnerId === authorId;
    }

    // 3. Admin posts are visible to their child accounts (e.g. resellers under that admin) or self
    if (authorRole === 'admin') {
      if (activeProfile) {
        return activeProfile.id === authorId || activeProfile.parentId === authorId;
      }
    }

    // Default fallback
    return ann.ownerId === currentContextOwnerId;
  });

  const firstUnreadAnnouncement = activeTenantAnnouncements.find(ann => !readAnnouncementIds.includes(ann.id));

  // Filtered keys:
  // - super_admin (Master) sees ALL keys (if no Tenant URL is selected) or filters by Tenant URL if one is set.
  // - Other ranks can only see Keys belonging to their Context Owner!
  const filteredKeysForView = keys.filter(k => {
    if (sessionUser.role === 'super_admin') {
      return activeTenantOwnerId ? k.ownerId === activeTenantOwnerId : true;
    }
    // For other roles (owner, admin, reseller), bind strictly to their session owner context
    return k.ownerId === currentContextOwnerId;
  });

  // Filtered users:
  // - super_admin sees everyone, or filters by Tenant URL if set.
  // - owner / admin / reseller only see accounts belonging to the same ownerId!
  const filteredUsersForView = users.filter(u => {
    if (sessionUser.role === 'super_admin') {
      return activeTenantOwnerId ? u.ownerId === activeTenantOwnerId : true;
    }
    return u.ownerId === currentContextOwnerId;
  });

  if (isConnectMode) {
    return (
      <SourceConnector
        settings={settings}
        activeTenantOwnerId={activeTenantOwnerId}
        onClose={() => {
          setIsConnectMode(false);
          const url = new URL(window.location.href);
          url.pathname = '/';
          url.searchParams.delete('connect');
          if (url.searchParams.get('tab') === 'connect') {
            url.searchParams.delete('tab');
          }
          window.history.pushState({}, '', url.toString());
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#05050b]">
        {activeTenantOwnerId && (
          <div className="bg-[#0ea5e9]/10 border-b border-[#0ea5e9]/20 text-center py-2 text-xs text-sky-400 font-bold tracking-wide">
            🌐 Custom Brand Node Active: Operating inside Tenant Owner Portal ({activeTenantOwnerId})
          </div>
        )}
        <AuthSystem 
          onLogin={handleLogin} 
          users={users}
          onRegisterWithToken={handleRegisterWithToken}
          settings={settings}
        />
      </div>
    );
  }

  // Active theme borders or glows
  const intensityGlows = {
    low: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]',
    medium: 'shadow-[0_0_25px_-3px_rgba(168,85,247,0.3)]',
    high: 'shadow-[0_0_40px_-5px_rgba(168,85,247,0.5)] border-purple-500/25'
  };

  return (
    <div id="main-admin-layout" className="min-h-screen bg-[#030109] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      {/* POPUP ANNOUNCEMENT OVERLAY */}
      {firstUnreadAnnouncement && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0b0816] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden font-sans">
            <div className="absolute -left-16 -top-16 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 animate-bounce">
                <Megaphone className="w-6 h-6 animate-pulse" />
              </div>
              
              <div>
                <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-md text-[9px] font-black uppercase font-mono tracking-widest">
                  New Alert Broadcast
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 uppercase tracking-wide animate-pulse">
                  Urgent Network Announcement
                </h3>
                <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                  <span>Publisher: {firstUnreadAnnouncement.author === 'ravi_owner' ? 'Owner Ravi' : firstUnreadAnnouncement.author}</span>
                  <span>•</span>
                  <span>{firstUnreadAnnouncement.timestamp}</span>
                </div>
              </div>
              
              <div className="bg-[#100c1e] border border-white/[0.04] p-4 rounded-xl text-left max-h-[160px] overflow-y-auto">
                <p className="text-slate-200 text-xs font-semibold leading-relaxed whitespace-pre-line selection:bg-purple-900/30">
                  {firstUnreadAnnouncement.message}
                </p>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => markAnnouncementAsRead(firstUnreadAnnouncement.id)}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Read & Dismiss Note</span>
                  <span>✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background radial cosmic glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-purple-900/10 via-indigo-900/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-12 left-12 w-72 h-72 bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      
      {/* TOP HEADER BAR */}
      <header className="w-full h-16 bg-[#080512]/95 border-b border-[#1b0f35]/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between select-none shadow-md">
        
        {/* Left Side: Brand Logo */}
        <div 
          onClick={() => setActiveTab('generate')}
          className="flex items-center gap-2 px-1 cursor-pointer hover:opacity-90 transition-all shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#805ad5] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-white/10 shrink-0">
            <Shield className="w-4 h-4 text-white fill-white/10" />
          </div>
          <span className="text-xs md:text-sm font-black uppercase tracking-tight text-white font-sans flex items-center gap-1.5">
            {settings.siteName}
          </span>
        </div>

        {/* Middle: Horizontal Navigation Links */}
        <div className="hidden md:flex items-center gap-2.5 md:gap-4 shrink-0 font-sans">
          <button
            id="btn-header-keys"
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'keys' 
                ? 'bg-[#1b0f35]/80 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Keys</span>
          </button>

          <button
            id="btn-header-generate"
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'generate' 
                ? 'bg-[#1b0f35]/80 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>

          <button
            id="btn-header-support"
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tickets' 
                ? 'bg-[#1b0f35]/80 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support</span>
          </button>

          {sessionUser.role !== 'reseller' && (
            <button
              id="btn-header-referrals"
              onClick={() => setActiveTab('referrals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'referrals' 
                  ? 'bg-[#1b0f35]/80 text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Reseller Panel</span>
            </button>
          )}
        </div>

        {/* Right Side: Profile Dropdown Capsule */}
        <div className="relative shrink-0 font-sans">
          <button
            id="btn-profile-capsule"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 bg-[#0c0819] hover:bg-[#150e2b] border border-white/[0.04] pl-2.5 pr-3 py-1.5 rounded-full transition shadow-inner select-none active:scale-[0.98]"
          >
            <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-[10px] uppercase">
              {(activeProfile?.fullName || sessionUser.username).substring(0, 1)}
            </div>
            <span className="text-[11px] font-bold text-slate-200">{activeProfile?.fullName || sessionUser.username}</span>
            <span className="text-slate-500 text-[10px] font-light">▾</span>
          </button>

          {/* Expanded dropdown list */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0a0614] border border-[#1b0f35] rounded-2xl shadow-[0_12px_40px_rgba(3,1,10,0.9)] z-50 p-2 text-xs text-slate-300 animate-fade-in divide-y divide-white/[0.02]">
              
              {/* Profile Details Header */}
              <div className="p-3">
                <p className="font-bold text-slate-200 truncate">{activeProfile?.fullName || sessionUser.username}</p>
                <p className="text-[10px] text-slate-500 font-mono capitalize tracking-wide mt-0.5">{sessionUser.role.replace('_', ' ')} System</p>
              </div>

              {/* Action items list */}
              <div className="py-1">
                {/* Admin/Reseller option: Dashboard */}
                <button
                  id="dropdown-dashboard"
                  onClick={() => { setActiveTab('dashboard'); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-white/[0.03] hover:text-white transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Monitor Desk</span>
                </button>

                {/* Multi-role option: Subscriber list */}
                {(sessionUser.role === 'super_admin' || sessionUser.role === 'owner' || sessionUser.role === 'admin' || sessionUser.role === 'reseller') && (
                  <button
                    id="dropdown-subscribers"
                    onClick={() => { setActiveTab('users'); setShowUserDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-white/[0.03] hover:text-white transition"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Subscriber list</span>
                  </button>
                )}

                {/* Admin/Reseller option: Credit wallet */}
                {(sessionUser.role === 'super_admin' || sessionUser.role === 'reseller') && (
                  <button
                    id="dropdown-wallet"
                    onClick={() => { setActiveTab('wallet'); setShowUserDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-white/[0.03] hover:text-white transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Credit wall</span>
                  </button>
                )}

                {/* Support Chats panel */}
                <button
                  id="dropdown-tickets"
                  onClick={() => { setActiveTab('tickets'); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-white/[0.03] hover:text-white transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Support chats</span>
                </button>

                {/* Profile settings panel (Matches Screenshot-1) */}
                <button
                  id="dropdown-settings"
                  onClick={() => { setActiveTab('settings'); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl hover:bg-white/[0.03] hover:text-white transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Profile & Settings</span>
                </button>



                {/* Structure, Referrals, & Downlines Hub */}
                {(sessionUser.role === 'super_admin' || sessionUser.role === 'owner' || sessionUser.role === 'admin') && (
                  <button
                    id="dropdown-referrals"
                    onClick={() => { setActiveTab('referrals'); setShowUserDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 font-bold transition border border-purple-500/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Referrals & Credits</span>
                  </button>
                )}
              </div>

              {/* Log out option */}
              <div className="p-1">
                <button
                  id="dropdown-logout"
                  onClick={() => { handleLogout(); setShowUserDropdown(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </header>

      {/* CORE WORKSPACE WINDOW */}
      <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 py-6 md:p-8">
        
        {/* SUB HEADER BANNERS DYNAMICALLY SELECTION MATCHING PHOTO 1 & PHOTO 2 */}
        {activeTab === 'settings' ? (
          /* Profile Settings welcome banner representing Screenshot-1 "👋 Welcome Mexx" */
          <div id="welcome-sub-bar" className="w-full bg-[#130b24]/90 border border-[#23153d] px-6 py-3.5 rounded-2xl flex items-center justify-between text-slate-100 text-xs font-semibold select-none shadow-md mb-6 animate-fade-in font-sans">
            <div className="flex items-center gap-2">
              <span>👋 Welcome</span>
              <span className="text-purple-400 font-bold">{activeProfile?.fullName || sessionUser.username}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">
              {sessionUser.role.replace('_', ' ')} ACCREDITED
            </div>
          </div>
        ) : (
          /* License / Generate Saldo bar representing Screenshot-2 "💳 Total Saldo $999999999" */
          <div id="saldo-sub-bar" className="w-full bg-[#0a0614]/80 border border-white/[0.03] px-6 py-3.5 rounded-2xl flex items-center justify-between text-slate-200 text-xs font-semibold shadow-md mb-6 animate-fade-in font-sans">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-[#0ea5e9]" />
              <span>Total Saldo</span>
              <span className="text-[#0ea5e9] font-black font-mono">
                {sessionUser.role === 'super_admin' || sessionUser.role === 'owner' ? 'Unlimited Credits' : `${userBalance.toLocaleString()} Credits`}
              </span>
            </div>
            <div className="text-[9px] text-[#0ea5e9] uppercase font-bold tracking-widest bg-[#0ea5e9]/10 px-2.5 py-1 rounded-md border border-[#0ea5e9]/15">
              {settings.siteName.toUpperCase()} GATE ONLINE
            </div>
          </div>
        )}

        {/* ACTIVE TENANT BROADCAST ANNOUNCEMENTS ALERT BOARD */}
        {activeTenantAnnouncements.length > 0 && (
          <div className="w-full bg-gradient-to-r from-purple-950/20 via-[#12072b]/80 to-slate-950 border border-purple-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(168,85,247,0.1)] mb-6 animate-fade-in font-sans">
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl shrink-0 animate-pulse mt-0.5">
                <Megaphone className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-[10px] text-pink-400 uppercase font-black tracking-widest flex items-center gap-1.5 font-sans">
                  <span>Urgent Network Notice</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-ping"></span>
                </h4>
                <p className="text-slate-200 text-xs mt-1 leading-relaxed font-semibold max-w-4xl">
                  {activeTenantAnnouncements[0].message}
                </p>
                <div className="flex items-center gap-2 mt-1 px-1 py-0.5 bg-purple-500/5 border border-purple-500/10 rounded-md w-fit font-mono text-[9px] text-slate-400">
                  <span>Authorized Publisher: {activeTenantAnnouncements[0].author === 'ravi_owner' ? 'Owner Ravi' : activeTenantAnnouncements[0].author}</span>
                  <span>•</span>
                  <span>{activeTenantAnnouncements[0].timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE CONTENT SCROLL CANVAS */}
        <main className="flex-1 space-y-6 w-full pb-12">
          
          {/* TAB 1: DASHBOARD MONITOR PANEL */}
          {activeTab === 'dashboard' && (
            <div id="tab-content-dashboard" className="space-y-6">
              
              {/* Top Banner Greetings card */}
              <div className="relative overflow-hidden glass p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="absolute -right-24 -top-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div>
                  <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                    SYSTEM CONTROLS DESK
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Enterprise resource overview for license activation nodes, billing adjustments, and live API gateway checks logs.
                  </p>
                </div>

                <div className="glass bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs shadow-lg">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Firewall Security</div>
                  <div className="text-pink-500 font-bold mt-0.5" style={{ textShadow: '0 0 8px rgba(236,72,153,0.4)' }}>SHA256::TLS_1.3_STRICT</div>
                </div>
              </div>

              {/* CORE METRIC WIDGETS GAUGE CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                
                {/* 1. Total registered subscribers */}
                <div className="glass stat-card rainbow-border h-28 relative overflow-hidden justify-between p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Total Users</span>
                      <h4 className="text-2xl font-bold neon-text-blue font-mono mt-1">{metrics.totalUsers}</h4>
                    </div>
                    <Users className="w-5 h-5 text-blue-400 opacity-60 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-blue-400 mt-1">+12% from last month</div>
                </div>

                {/* 2. Active license activations */}
                <div className="glass stat-card rainbow-border h-28 relative overflow-hidden justify-between p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Active Keys</span>
                      <h4 className="text-2xl font-bold neon-text-purple font-mono mt-1">{metrics.activeKeys}</h4>
                    </div>
                    <KeyRound className="w-5 h-5 text-purple-400 opacity-60 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-purple-400 mt-1">23 expiring today</div>
                </div>

                {/* 3. Expired License items count */}
                <div className="glass stat-card rainbow-border h-28 relative overflow-hidden justify-between p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Expired licenses</span>
                      <h4 className="text-2xl font-bold text-white font-mono mt-1">{metrics.expiredKeys}</h4>
                    </div>
                    <ShieldAlert className="w-5 h-5 text-slate-400 opacity-60" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Average latency 1.2ms</div>
                </div>

                {/* 4. Total revenue scale calculated over gateway records */}
                <div className="glass stat-card rainbow-border h-28 relative overflow-hidden justify-between p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Total Revenue</span>
                      <h4 className="text-2xl font-bold neon-text-pink font-mono mt-1">${metrics.netRevenue.toFixed(2)}</h4>
                    </div>
                    <DollarSign className="w-5 h-5 text-pink-400 opacity-60" />
                  </div>
                  <div className="text-[10px] text-pink-400 mt-1">Live balance available</div>
                </div>

              </div>

              {/* MOD MENU UPDATES FEED & BROADCAST ENGINE */}
              <div id="bgmi-updates-broadcast" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual List Stream of live Alerts */}
                <div className={`glass p-6 shadow-xl space-y-4 ${sessionUser.role === 'super_admin' || sessionUser.role === 'owner' || sessionUser.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                      </span>
                      <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                        Mod Menu Updates Notification Feed
                      </h3>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-slate-400">
                      LIVE RADAR ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[352px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs font-sans">
                        No active security signals broadcasted yet today.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        let severityClass = "border-indigo-500/10 bg-indigo-500/[0.01] hover:bg-indigo-500/[0.03]";
                        let iconColor = "text-indigo-400";
                        let ringColor = "bg-indigo-400/10";
                        if (notif.type === 'success') {
                          severityClass = "border-[#10b981]/20 bg-[#10b981]/[0.01] hover:bg-[#10b981]/[0.03]";
                          iconColor = "text-[#10b981]";
                          ringColor = "bg-[#10b981]/10";
                        } else if (notif.type === 'warning') {
                          severityClass = "border-yellow-500/20 bg-yellow-500/[0.01] hover:bg-yellow-500/[0.03]";
                          iconColor = "text-yellow-400";
                          ringColor = "bg-yellow-500/10";
                        } else if (notif.type === 'danger') {
                          severityClass = "border-red-500/20 bg-red-400/[0.01] hover:bg-red-500/[0.03] animate-pulse-slow";
                          iconColor = "text-red-400";
                          ringColor = "bg-red-400/10";
                        }

                        return (
                          <div
                            key={notif.id}
                            className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${severityClass}`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${ringColor} ${iconColor}`}>
                              <Bell className="w-4 h-4" />
                            </div>
                            
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex justify-between items-center gap-4">
                                <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight truncate">
                                  {notif.title}
                                </h4>
                                <span className="text-[9px] text-slate-500 font-mono shrink-0 uppercase">
                                  {notif.timestamp.split(' ')[0]}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed break-words font-sans">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Broadcast Feed Form Box for hierarchy owners */}
                {(sessionUser.role === 'super_admin' || sessionUser.role === 'owner' || sessionUser.role === 'admin') && (
                  <div className="glass p-6 shadow-xl flex flex-col justify-between">
                    <form onSubmit={handlePublishUpdate} className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-purple-400" />
                          Transmit Update Signal
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Directly push notifications & status resets onto resellers panels.
                        </p>
                      </div>

                      <div className="space-y-3 font-sans">
                        {/* Title input */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alert Head</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. BGMI 3.4 Safe Mod Active"
                            value={pushUpdateTitle}
                            onChange={(e) => setPushUpdateTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>

                        {/* Dropdown severity */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Pulse Severity</label>
                          <select
                            value={pushUpdateType}
                            onChange={(e: any) => setPushUpdateType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 transition-colors"
                          >
                            <option value="success">🟢 Success (Safe Mode)</option>
                            <option value="info">🔵 Information (Updates)</option>
                            <option value="warning">🟡 Warning (In-Game Checks)</option>
                            <option value="danger">🔴 Danger (Do Not Play / Banwave)</option>
                          </select>
                        </div>

                        {/* Text Message */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Message Description</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tell resellers and custom owners what game version changes were updated..."
                            value={pushUpdateMessage}
                            onChange={(e) => setPushUpdateMessage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none font-sans"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase rounded-xl tracking-wider text-xs shadow-lg shadow-purple-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        Transmit Signal Now
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* LIVE SVGS CHARTS REPORT GAUGES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Chart 1: Daily subscription activations - Smooth Curve line chart built using SVG */}
                <div className="glass p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-pink-400" />
                      Daily key activations sequence metrics
                    </h3>

                    {/* SVG Line Graph */}
                    <div className="w-full h-44 relative glass bg-white/5 p-4 overflow-hidden">
                      <svg viewBox="0 0 100 35" className="w-full h-full stroke-pink-500 stroke-[0.8] fill-none overflow-visible">
                        <defs>
                          <linearGradient id="chart-pink-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid guides */}
                        <line x1="0" y1="5" x2="100" y2="5" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                        <line x1="0" y1="15" x2="100" y2="15" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.1" strokeDasharray="1" />
                        
                        {/* Shaded Area */}
                        <path d="M 0 35 L 0 25 Q 15 10 30 22 T 60 8 T 90 14 L 100 12 L 100 35 Z" fill="url(#chart-pink-grad)" stroke="none" />
                        
                        {/* Main line curve */}
                        <path d="M 0 25 Q 15 10 30 22 T 60 8 T 90 14 L 100 12" />

                        {/* Interactive dots representing key ticks */}
                        <circle cx="30" cy="22" r="1" fill="#ec4899" />
                        <circle cx="60" cy="8" r="1.2" fill="#fff" stroke="#ec4899" strokeWidth="0.5" />
                        <circle cx="90" cy="14" r="1" fill="#ec4899" />
                      </svg>
                      
                      <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-500 uppercase">PEAK: 42 ACTIVATIONS/HR</div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 mt-4">
                    <span>MAY 25</span>
                    <span>MAY 28</span>
                    <span>MAY 31 (TODAY)</span>
                  </div>
                </div>

                {/* Visual Chart 2: Hourly API Request Volume - Responsive SVG Bar chart with gradients */}
                <div className="glass p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-400" />
                      REST gateway verify requests volume
                    </h3>

                    {/* SVG Bar Graph */}
                    <div className="w-full h-44 relative glass bg-white/5 p-4 overflow-hidden">
                      <svg viewBox="0 0 100 35" className="w-full h-full fill-indigo-500 overflow-visible">
                        {/* Bar sequences */}
                        <rect x="5" y="15" width="4" height="20" rx="1" fill="#4f46e5" opacity="0.6" />
                        <rect x="15" y="8" width="4" height="27" rx="1" fill="#4f46e5" />
                        <rect x="25" y="20" width="4" height="15" rx="1" fill="#4f46e5" opacity="0.6" />
                        <rect x="35" y="12" width="4" height="23" rx="1" fill="#3b82f6" />
                        <rect x="45" y="5" width="4" height="30" rx="1" fill="#3b82f6" />
                        <rect x="55" y="18" width="4" height="17" rx="1" fill="#a855f7" />
                        <rect x="65" y="10" width="4" height="25" rx="1" fill="#a855f7" />
                        <rect x="75" y="4" width="4" height="31" rx="1" fill="#ec4899" />
                        <rect x="85" y="14" width="4" height="21" rx="1" fill="#ec4899" opacity="0.8" />
                        <rect x="95" y="22" width="4" height="13" rx="1" fill="#14b8a6" />
                      </svg>
                      
                      <div className="absolute top-2 right-4 text-[9px] font-mono text-slate-500 uppercase">Verify queries: 12,024 reqs/hr</div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 mt-4">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>20:00 (CURRENT)</span>
                  </div>
                </div>

              </div>

              {/* SECURITY AUDIT TIMELINE TABLE */}
              <div className="glass p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Security Audit Timeline & Device IP Locks
                  </h3>
                  <span className="text-[10px] text-slate-500 uppercase">GATEWAY THREAD LOGS ENHANCED</span>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{log.action}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                          <span>Operator: {log.username}</span>
                          <span>IP Source: {log.ipAddress}</span>
                          <span className="hidden sm:inline">Platform: {log.device}</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono self-start sm:self-auto shrink-0 uppercase">
                        {log.timestamp.split(' ')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SUBSCRIBERS LIST SCREEN */}
          {activeTab === 'users' && (
            <UserManagement
              users={filteredUsersForView}
              onAddUser={handleAddUser}
              onUpdateUserStatus={handleUpdateUserStatus}
              onAdjustBalance={handleAdjustUserBalance}
              onDeleteUser={handleDeleteUser}
              currentUserRole={sessionUser.role}
            />
          )}

          {/* TAB 3: VIP subscription GENERATORS MATRIX */}
          {activeTab === 'keys' && (
            <KeyGenerator
              keys={filteredKeysForView}
              onAddKey={handleAddKey}
              onUpdateKeyStatus={handleUpdateKeyStatus}
              onExtendKey={handleExtendKey}
              onResetDevice={handleResetDevice}
              onDeleteKey={handleDeleteKey}
              onEditKey={handleEditKey}
              currentUserRole={sessionUser.role}
              currentUserBalance={userBalance}
              onDeductBalance={handleDeductWallet}
              viewMode="catalog"
              currentUsername={sessionUser.username}
            />
          )}

          {activeTab === 'generate' && (
            <KeyGenerator
              keys={filteredKeysForView}
              onAddKey={handleAddKey}
              onUpdateKeyStatus={handleUpdateKeyStatus}
              onExtendKey={handleExtendKey}
              onResetDevice={handleResetDevice}
              onDeleteKey={handleDeleteKey}
              onEditKey={handleEditKey}
              currentUserRole={sessionUser.role}
              currentUserBalance={userBalance}
              onDeductBalance={handleDeductWallet}
              viewMode="generate"
              onHistoryClick={() => setActiveTab('keys')}
              currentUsername={sessionUser.username}
            />
          )}

          {/* TAB 8: HIERARCHICAL MANAGER, REFERRAL TOKENS AND TRANSFER TOP-UPS */}
          {activeTab === 'referrals' && sessionUser.role !== 'reseller' && (
            <ReferralPanel
              tokens={referralTokens}
              users={users}
              sessionUser={sessionUser}
              activeTenantOwnerId={activeTenantOwnerId}
              onGenerateToken={handleGenerateToken}
              onDeleteToken={handleDeleteToken}
              onTransferCredits={handleTransferCredits}
              currentUserBalance={userBalance}
            />
          )}

          {/* TAB 9: SECURE INTERACTIVE API GATEWAY DOCS */}
          {activeTab === 'api-docs' && (
            <ApiIntegrationHub settings={settings} />
          )}

          {/* TAB 4: WALLET TRANSACTIONS DIRECTORY */}
          {activeTab === 'wallet' && (
            <WalletSystem
              transactions={transactions}
              currentUserBalance={userBalance}
              onAddFunds={handleDepositWallet}
              onDeductFunds={handleDeductWallet}
            />
          )}

          {/* TAB 6: SUPPORT CHATS MULTI TICKET SYSTEM */}
          {activeTab === 'tickets' && (
            <SupportSystem
              tickets={tickets}
              onAddMessage={handleAddTicketMessage}
              onOpenTicket={handleOpenTicket}
              onCloseTicket={handleCloseTicket}
            />
          )}

          {/* TAB 7: ADMINISTRATIVE SITE SETTINGS AND ENV CONFIGS */}
          {activeTab === 'settings' && (
            <div className="w-full max-w-4xl mx-auto space-y-8 font-sans">
              
              {/* Screenshot 1 Block: Change Password and Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
                
                {/* Card 1: Change Password wrapped in a Dynamic Rainbow Neon Border */}
                <div className="p-[1.5px] bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 rounded-3xl shadow-[0_0_25px_rgba(139,92,246,0.25)] animate-fade-in hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] transition-all duration-350">
                  <div className="bg-[#0b0816]/98 rounded-[22px] overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 px-5 flex items-center gap-2 relative">
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                      <span className="text-sm relative z-10">🔐</span>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider relative z-10 font-sans">Change Password</h3>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {passwordSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold animate-pulse text-center">
                          🔒 Password updated successfully under Tenant Realm!
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">🔑 Current Password</label>
                        <input 
                          type="password" 
                          placeholder="Enter current password" 
                          defaultValue="••••••••"
                          className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">🆕 New Password</label>
                        <input 
                          type="password" 
                          placeholder="Enter new password" 
                          className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">✓ Confirm Password</label>
                        <input 
                          type="password" 
                          placeholder="Confirm new password" 
                          className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono focus:ring-1 focus:ring-purple-500/30 transition-all"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          setPasswordSuccess(true);
                          setTimeout(() => setPasswordSuccess(false), 3500);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,0.35)] flex items-center justify-center gap-1.5"
                      >
                        <span>Update Password</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2: Account Information wrapped in a Dynamic Rainbow Neon Border */}
                <div className="p-[1.5px] bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 rounded-3xl shadow-[0_0_25px_rgba(139,92,246,0.3)] animate-fade-in hover:shadow-[0_0_35px_rgba(139,92,246,0.45)] transition-all duration-350">
                  <div className="bg-[#0b0816]/98 rounded-[22px] overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 px-5 flex items-center gap-2 relative">
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                      <span className="text-sm relative z-10">👤</span>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider relative z-10 font-sans">Account Information</h3>
                    </div>
                    
                    <div className="p-6 space-y-5">
                      {profileSuccess && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold animate-pulse text-center">
                          ✨ Profile settings saved successfully!
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">📝 Full Name</label>
                        <input 
                          type="text" 
                          value={userFullNameInput}
                          onChange={(e) => setUserFullNameInput(e.target.value)}
                          className="w-full bg-[#100c1e] text-slate-200 border border-[#1b0f35] p-3.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-black focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          if (userFullNameInput.trim()) {
                            setUsers(users.map(u => u.username === sessionUser.username ? { ...u, fullName: userFullNameInput.trim() } : u));
                            setProfileSuccess(true);
                            triggerSecurityLog(`Updated account profile nickname to: ${userFullNameInput.trim()}`, 'user_management', 'success');
                            setTimeout(() => setProfileSuccess(false), 3500);
                          }
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,0.35)] flex items-center justify-center gap-1.5"
                      >
                        <span>Update Account</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Advanced toggle sets */}
              <div className="pt-4 border-t border-white/[0.02]">
                <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Enterprise Node Toggles</h4>
                <SettingsPanel
                  settings={settings}
                  onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })}
                  announcements={activeTenantAnnouncements}
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  currentUser={{ id: activeProfile?.id || '', username: sessionUser.username, role: sessionUser.role, ownerId: activeProfile?.ownerId }}
                />
              </div>

            </div>
          )}

        </main>

        {/* Mobile Bottom Navigation Dock */}
        <div className="md:hidden fixed bottom-4 inset-x-4 bg-[#0d0a22]/95 border border-[#211642] backdrop-blur-md rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] z-40 p-2 text-xs flex items-center justify-around">
          {[
            { id: 'generate', label: 'Generate', icon: Plus },
            { id: 'keys', label: 'Keys', icon: KeyRound },
            ...(sessionUser.role !== 'reseller' ? [{ id: 'referrals', label: 'Referrals', icon: Sparkles }] : []),
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
            { id: 'tickets', label: 'Support', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 focus:outline-none transition relative ${
                  isActive ? 'text-[#a855f7] font-extrabold' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-purple-400' : 'opacity-80'}`} />
                <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans leading-none">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-1 h-1 rounded-full bg-purple-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Horizontal footer signature */}
        <footer className="w-full text-center py-4 border-t border-white/[0.02]/5 mt-auto pb-16 md:pb-4">
          <p className="text-[10px] text-slate-600 tracking-wider uppercase font-medium">
            &copy; 2026 - {settings.siteName} - ADVANCED SEAMLESS GATEWAY
          </p>
        </footer>
      </div>

    </div>
  );
}
