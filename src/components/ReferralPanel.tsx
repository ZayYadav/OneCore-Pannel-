import React, { useState } from 'react';
import { ReferralToken, User } from '../types';
import { KeyRound, Shield, Users, CreditCard, Copy, CheckCircle, PlusCircle, Trash2, Globe, Sparkles, Send, ArrowUpRight, HelpCircle } from 'lucide-react';

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

      <div className="max-w-xl mx-auto">
        
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

    </div>
  );
}
