import React, { useState } from 'react';
import { ReferralToken, User } from '../types';
import { KeyRound, Shield, Users, CreditCard, Copy, CheckCircle, PlusCircle, Trash2, Globe, Sparkles, Send, ArrowUpRight, HelpCircle, Clock, Unlock, AlertTriangle, Coins, ChevronRight, Check } from 'lucide-react';

interface ReferralPanelProps {
  tokens: ReferralToken[];
  users: User[];
  sessionUser: { username: string; role: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user' };
  activeTenantOwnerId: string | null;
  onGenerateToken: (targetRole: 'owner' | 'admin' | 'reseller', maxUses: number, initialBalance?: number, panelDuration?: '1_month' | '2_months' | '3_months' | 'lifetime') => void;
  onDeleteToken: (id: string) => void;
  onTransferCredits: (recipientId: string, amount: number) => { success: boolean; message: string };
  currentUserBalance: number;
}

export default function ReferralPanel({
  tokens,
  users,
  sessionUser,
  activeTenantOwnerId,
  onGenerateToken,
  onDeleteToken,
  onTransferCredits,
  currentUserBalance
}: ReferralPanelProps) {
  const defaultTokenType = sessionUser.role === 'super_admin' ? 'owner' : (sessionUser.role === 'owner' ? 'admin' : 'reseller');
  const [tokenType, setTokenType] = useState<'owner' | 'admin' | 'reseller'>(defaultTokenType);
  const [maxUses, setMaxUses] = useState<string>('');
  const [startingBalance, setStartingBalance] = useState('100');
  const [panelDuration, setPanelDuration] = useState<'1_month' | '2_months' | '3_months' | 'lifetime'>('lifetime');
  const [transferAmount, setTransferAmount] = useState('100');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);

  // Filter possible recipient users based on hierarchy:
  // - Master (super_admin) can transfer credits to ANY user.
  // - Owner can transfer credits to their own scale Admins or Resellers.
  // - Admin can transfer credits to their own scale Resellers.
  const loggedInUserProfile = users.find(u => u.username === sessionUser.username);
  const currentOwnerId = loggedInUserProfile?.ownerId || '';

  const filterRecipients = () => {
    return users.filter(u => {
      if (u.username === sessionUser.username) return false; // cannot transfer to self

      if (sessionUser.role === 'super_admin') {
        // Master can adjust/top-up anyone except super_admins (or anyone)
        return u.role !== 'super_admin';
      }

      if (sessionUser.role === 'owner') {
        // Owner can transfer to Admins & Resellers that share their ownerId
        return u.ownerId === currentOwnerId && (u.role === 'admin' || u.role === 'reseller');
      }

      if (sessionUser.role === 'admin') {
        // Admin can transfer to Resellers that share their ownerId
        return u.ownerId === currentOwnerId && u.role === 'reseller';
      }

      return false;
    });
  };

  const recipients = filterRecipients();

  // Filter tokens list based on role:
  // - super_admin sees all tokens.
  // - owner sees tokens created by themselves or admins/resellers under their tenant
  // - admin sees tokens they created.
  const visibleTokens = tokens.filter(t => {
    if (sessionUser.role === 'super_admin') return true;
    if (sessionUser.role === 'owner') {
      return t.createdBy === sessionUser.username || t.ownerId === currentOwnerId;
    }
    return t.createdBy === sessionUser.username;
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUses = maxUses.trim() === '' ? 5 : parseInt(maxUses) || 5;
    onGenerateToken(tokenType, finalUses, parseFloat(startingBalance) || 0, panelDuration);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatus(null);
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      alert('Enter a valid non-zero top-up amount.');
      return;
    }
    if (!selectedRecipientId) {
      alert('Select the target recipient.');
      return;
    }

    const { success, message } = onTransferCredits(selectedRecipientId, amount);
    setTransferStatus(message);

    if (success) {
      setTransferAmount('100');
      setTimeout(() => setTransferStatus(null), 4000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Get current tenant link URL
  const getTenantLink = (ownerIdToUse: string) => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?owner=${ownerIdToUse}`;
  };

  const myOwnerId = loggedInUserProfile?.ownerId || (sessionUser.role === 'owner' ? loggedInUserProfile?.id : null);

  const handleCopyMyLink = () => {
    if (myOwnerId) {
      navigator.clipboard.writeText(getTenantLink(myOwnerId));
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div id="referrals-section" className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      
      {/* TENANT PATHWAYS LINK SELECTOR */}
      {sessionUser.role !== 'reseller' && sessionUser.role !== 'user' && (
        <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-purple-500/10 via-pink-400/25 to-purple-500/10" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Independent Tenant Gateway Links</span>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase mt-0.5">
                <Globe className="w-4 h-4 text-sky-400" />
                Isolated Brand Panels
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Every Owner operates an isolated portal view. Keys and licenses generated inside one Owner's portal namespace are strictly locked and will not authenticate inside any other Owner's panels or software client registers.
              </p>
            </div>
            {myOwnerId && (
              <button
                onClick={handleCopyMyLink}
                className="px-4 py-2 bg-[#17132a] hover:bg-[#201d3a] border border-white/[0.04] rounded-xl text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-1.5 select-none"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Copied my link!' : 'Copy Portal Link'}</span>
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.filter(u => u.role === 'owner').length === 0 ? (
              <div className="md:col-span-2 text-center py-4 bg-white/[0.01] rounded-xl border border-white/[0.03] text-xs text-slate-500">
                No custom tenant Owners registered yet in the pipeline.
              </div>
            ) : (
              users.filter(u => u.role === 'owner').map((ownerUser) => {
                const linkVal = getTenantLink(ownerUser.id);
                const isActive = activeTenantOwnerId === ownerUser.id;
                return (
                  <div 
                    key={ownerUser.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row justify-between md:items-center gap-3.5 ${
                      isActive 
                        ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/20' 
                        : 'bg-[#100c1e] border-white/[0.02] hover:border-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200">{ownerUser.username}'s Instance</span>
                        {isActive && (
                          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                            Currently Active View
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 truncate block mt-1 tracking-wider">
                        {linkVal}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(linkVal, ownerUser.id)}
                      className="px-3 py-1.5 bg-[#17132a] hover:bg-slate-900 border border-white/[0.04] rounded-lg text-[10px] text-slate-350 hover:text-purple-400 transition font-bold"
                    >
                      {copiedToken === ownerUser.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MAIN DUAL ROW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CRITICAL CONTROLS & GENERATOR */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* REFERRAL PASS GENERATOR */}
          <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-purple-500/10 via-pink-400/25 to-purple-500/10" />
            
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">Generate Invite Pass</h4>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Target Registration Role</label>
                <select
                  id="target-role-select"
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value as any)}
                  className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
                >
                  {sessionUser.role === 'super_admin' && (
                    <option value="owner">OWNER (Fractions & Tenant Networks)</option>
                  )}
                  {(sessionUser.role === 'super_admin' || sessionUser.role === 'owner') && (
                    <option value="admin">ADMIN (Franchise Regional Manager)</option>
                  )}
                  <option value="reseller">RESELLER (VIP Licensing Partner)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Max Usage Limit</label>
                  <input
                    id="max-uses-input"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 10"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-purple-550 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Starting Balance</label>
                  <div className="relative">
                    <input
                      id="starting-balance-input"
                      type="number"
                      min="0"
                      placeholder="Credits"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(e.target.value)}
                      className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-purple-550 font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Subscription Duration</label>
                <select
                  id="panel-duration-select"
                  value={panelDuration}
                  onChange={(e) => setPanelDuration(e.target.value as any)}
                  className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
                >
                  <option value="lifetime">Lifetime Franchise Lease</option>
                  <option value="1_month">1 Month Tenant Trial</option>
                  <option value="2_months">2 Months Panel Lease</option>
                  <option value="3_months">3 Months Scaled Lease</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl">
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#a855f7] shrink-0 mt-0.5" />
                  <span>
                    Creating this pass authorizes self-registration.
                    {sessionUser.role !== 'super_admin' && sessionUser.role !== 'owner' && (
                      <strong> Deducts initial credits from your wallet accordingly.</strong>
                    )}
                  </span>
                </p>
              </div>

              <button
                id="btn-referral-generate"
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Initialize Invite Pass</span>
              </button>
            </form>
          </div>

          {/* CREDIT TRANSFER & WALLET TOP-UP BLOCK */}
          <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden h-fit">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/25 to-emerald-500/10" />

            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">Downline Credit Matrix</h4>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="bg-[#100c1e] p-3 rounded-xl border border-white/[0.02] flex justify-between items-center text-xs">
                <span className="text-slate-500">Your Wallet Balance:</span>
                <span className="font-extrabold text-[#0ea5e9] font-mono select-all">
                  {sessionUser.role === 'super_admin' || sessionUser.role === 'owner' ? 'Unlimited Credits' : `${currentUserBalance.toFixed(2)} Credits`}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Select Downline Target</label>
                <select
                  id="transfer-recipient-select"
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="">-- Choose Recipient user --</option>
                  {recipients.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.username} ({r.role.toUpperCase()}) — Balance: {r.role === 'super_admin' || r.role === 'owner' ? 'Unlimited' : `${r.balance.toFixed(2)} Credits`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Credits top up amount (Credits)</label>
                <input
                  id="transfer-amount-input"
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                />
              </div>

              <button
                id="btn-referral-transfer"
                type="submit"
                disabled={recipients.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:hover:bg-emerald-600"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Validate Balance Transfer</span>
              </button>

              {recipients.length === 0 && (
                <p className="text-[10px] text-slate-500 text-center italic mt-1 bg-white/[0.01] p-2 rounded-lg">
                  No active sub-admins or resellers exist inside your isolated owner namespace to fund.
                </p>
              )}

              {transferStatus && (
                <div className="p-2.5 bg-emerald-950/20 text-emerald-400 rounded-xl border border-emerald-900/10 text-center text-[11px] font-bold">
                  {transferStatus}
                </div>
              )}
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: LIST OF CODES & POWER BOUNDARIES RULES */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* ACTIVE INVITE CODES */}
          <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-sky-500/10 via-sky-400/25 to-sky-500/10" />

            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest font-sans">Active Invitation Passes</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-full uppercase tracking-wider">
                {visibleTokens.length} total keys
              </span>
            </div>

            {visibleTokens.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
                <HelpCircle className="w-9 h-9 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase">No active invite codes</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">Use the generator form on the left to issue new tokens for downline admins or resellers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleTokens.map((t) => {
                  const inviteLink = `${window.location.origin}${window.location.pathname}?code=${t.token}`;
                  const isTokenCopied = copiedToken === t.id;
                  const isLinkCopied = copiedToken === t.id + '_link';
                  const usagePercentage = Math.min(100, (t.usedCount / t.maxUses) * 100);

                  return (
                    <div 
                      key={t.id} 
                      className="p-4 bg-[#100c1e] border border-white/[0.02] hover:border-white/[0.06] rounded-2xl transition space-y-3.5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-black text-slate-100 font-mono select-all bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-xl">
                            {t.token}
                          </code>
                          <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest rounded-md uppercase border ${
                            t.targetRole === 'owner' 
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                              : t.targetRole === 'admin'
                                ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20'
                                : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          }`}>
                            {t.targetRole}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(t.token, t.id)}
                            title="Copy Pass Code"
                            className="p-1.5 bg-[#17132a] hover:bg-[#201d3a] rounded-lg text-slate-400 hover:text-white border border-white/[0.02] transition flex items-center gap-1 text-[10px]"
                          >
                            {isTokenCopied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isTokenCopied ? 'Copied!' : 'Code'}</span>
                          </button>

                          <button
                            onClick={() => copyToClipboard(inviteLink, t.id + '_link')}
                            title="Copy Prefilled Invitation Link"
                            className="p-1.5 bg-[#17132a] hover:bg-[#201d3a] rounded-lg text-slate-400 hover:text-white border border-white/[0.02] transition flex items-center gap-1 text-[10px]"
                          >
                            {isLinkCopied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Globe className="w-3.5 h-3.5" />}
                            <span>{isLinkCopied ? 'Link Copied!' : 'Invite Link'}</span>
                          </button>

                          <button
                            onClick={() => onDeleteToken(t.id)}
                            title="Revoke and Delete Pass"
                            className="p-1.5 bg-red-950/20 hover:bg-red-900 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* USAGE AND BALANCES METADATA */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Assigned Wallet</span>
                          <span className="font-extrabold text-slate-300 font-mono flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-emerald-400" />
                            {t.initialBalance || 0} Credits
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Lease Expiry</span>
                          <span className="font-extrabold text-slate-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#bd93f9]" />
                            {t.panelDuration === 'lifetime' ? 'Lifetime Unlimited' : t.panelDuration ? t.panelDuration.replace('_', ' ') : 'Lifetime'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Created By</span>
                          <span className="font-semibold text-slate-450 tracking-wide">
                            {t.createdBy} ({t.creatorRole === 'super_admin' ? 'Master' : t.creatorRole})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Created On</span>
                          <span className="font-mono text-slate-450 text-[10px]">
                            {t.creationDate.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* PROGRESS FOR PASS USAGE LIST */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-455 tracking-wide">
                          <span>Usage Activations</span>
                          <span className="font-mono font-black">{t.usedCount} of {t.maxUses} registered ({Math.round(usagePercentage)}%)</span>
                        </div>
                        <div className="w-full bg-[#17132a] h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              usagePercentage >= 100 
                                ? 'bg-red-500' 
                                : t.targetRole === 'owner' 
                                  ? 'bg-purple-500' 
                                  : t.targetRole === 'admin'
                                    ? 'bg-[#0ea5e9]'
                                    : 'bg-pink-500'
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* HIERARCHICAL TIER POWERS & LIMITS DECK */}
          <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/25 to-emerald-500/10" />

            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">Hierarchy Powers & Limits Deck</h4>
            </div>

            <div className="space-y-4">
              {/* RANK SPECIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BRAND OWNER SPEC */}
                <div className="p-4 bg-[#100c1e] border border-white/[0.02] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#c084fc] flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Tenant Owner
                    </span>
                    <span className="text-[9px] bg-purple-500/10 border border-purple-550/25 text-purple-400 px-1.5 py-0.2 rounded uppercase font-black font-mono">Tier 1</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Operates an isolated white-label panel portal. Created exclusively by the Master Admin.
                  </p>
                  <div className="space-y-1 pt-1.5 border-t border-white/[0.04] text-[10px] text-slate-450 font-sans">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Issue Admin & Reseller Invite Passes</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Publish Tenant Broadcast Alerts</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Infinite Wallet Credits Allocation</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span className="text-slate-500">Restricted to their isolated tenant user base</span>
                    </div>
                  </div>
                </div>

                {/* FRANCHISE ADMIN SPEC */}
                <div className="p-4 bg-[#100c1e] border border-white/[0.02] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#60a5fa] flex items-center gap-1.5 uppercase">
                      <Shield className="w-3.5 h-3.5 text-sky-400" />
                      Regional Admin
                    </span>
                    <span className="text-[9px] bg-sky-500/10 border border-sky-550/25 text-sky-450 px-1.5 py-0.2 rounded uppercase font-black font-mono">Tier 2</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    General manager level assigned directly under a specific Tenant Owner's franchise.
                  </p>
                  <div className="space-y-1 pt-1.5 border-t border-white/[0.04] text-[10px] text-slate-450 font-sans">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Issue Reseller Pass Registrations</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Generate VIP keys & top up credits</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Bound by balance limits assigned by Owner</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span className="text-slate-500">Cannot issue Owner or Admin passes</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* LOWER AND MASTER RANKS FOOTNOTES */}
              <div className="p-4 bg-[#100c1e]/50 border border-white/[0.02] rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-[10.5px]">
                <div className="space-y-1">
                  <span className="font-extrabold text-[#f472b6] block uppercase tracking-wide text-[10px]">
                    Lower Tier: Reseller Partner & Subs
                  </span>
                  <p className="text-[11px] text-slate-400 max-w-md font-sans">
                    A ground Reseller is authorized only to generate VIP Subscription Keys (1-day, lifetime, etc.) for direct subscribers. They are restricted from creating sub-accounts, top up credits to others outside, or issuing any invite codes.
                  </p>
                </div>
                <div className="bg-[#bd93f9]/5 border border-[#bd93f9]/20 p-2.5 rounded-xl font-mono text-[9px] text-[#bd93f9] uppercase font-black tracking-widest text-center shrink-0">
                  Resellers bound strictly<br/>by active wallet balances
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
