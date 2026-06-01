import React, { useState } from 'react';
import { Key } from '../types';
import { Plus, ListFilter, Trash2, ShieldAlert, Sparkles, PlusCircle, CheckCircle, Clock, RefreshCw, KeyRound, Pencil, Copy, Check, Download, Share2 } from 'lucide-react';

interface KeyGeneratorProps {
  keys: Key[];
  onAddKey: (newKey: Key | Key[]) => void;
  onUpdateKeyStatus: (id: string, status: Key['status']) => void;
  onExtendKey: (id: string, days: number) => void;
  onResetDevice: (id: string) => void;
  onDeleteKey: (idOrIds: string | string[]) => void;
  onEditKey?: (id: string, updatedParams: Partial<Key>) => void;
  currentUserRole: string;
  currentUserBalance: number;
  onDeductBalance: (amount: number, reason: string) => boolean;
  viewMode?: 'generate' | 'catalog' | 'both';
  onHistoryClick?: () => void;
  currentUsername?: string;
}

export default function KeyGenerator({
  keys,
  onAddKey,
  onUpdateKeyStatus,
  onExtendKey,
  onResetDevice,
  onDeleteKey,
  onEditKey,
  currentUserRole,
  currentUserBalance,
  onDeductBalance,
  viewMode = 'both',
  onHistoryClick,
  currentUsername
}: KeyGeneratorProps) {
  const [durationType, setDurationType] = useState<Key['duration']>('30_days');
  const [customDays, setCustomDays] = useState('45');
  const [deviceLimit, setDeviceLimit] = useState<string>('');
  const [keyNotes, setKeyNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteAllConfirmInDropdown, setShowDeleteAllConfirmInDropdown] = useState(false);
  const [extendingKeyId, setExtendingKeyId] = useState<string | null>(null);

  const handleExportTxt = () => {
    if (filteredKeys.length === 0) {
      alert("No active keys in current filter view to export.");
      return;
    }
    const lines = filteredKeys.map((k) => {
      const devStr = k.deviceLimit >= 99999 ? 'Unlimited' : `${k.usedDevices.length}/${k.deviceLimit}`;
      return `Key: ${k.keyString} | Duration: ${k.duration.replace('_', ' ')} | Devices: ${devStr} | Status: ${k.status} | Expires: ${k.expiryDate || 'Never'}`;
    });
    const header = `==========================================================\n       DYNAMIC RAINBOW VIP SUBSCRIPTION LICENSE KEYS       \n==========================================================\nExport Date: ${new Date().toLocaleString()}\nFiltered Count: ${filteredKeys.length}\n----------------------------------------------------------\n\n`;
    const textData = header + lines.join('\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `VIP-KEYS-EXPORT-${new Date().toISOString().substring(0, 10)}.txt`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllFiltered = () => {
    const idsToDelete = filteredKeys.map(k => k.id);
    if (idsToDelete.length > 0) {
      onDeleteKey(idsToDelete);
    }
    setShowDeleteAllConfirm(false);
    setShowDeleteAllConfirmInDropdown(false);
  };
  
  // Custom Pattern & Bulk State
  const [useCustomPattern, setUseCustomPattern] = useState(false);
  const [customKeyText, setCustomKeyText] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState(1);

  // Editing state
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDeviceLimit, setEditDeviceLimit] = useState(1);
  const [editKeyString, setEditKeyString] = useState('');
  
  // Quick status highlight colors
  const statusColors = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    inactive: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    expired: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  // Helper cost function based on duration types for estimation display
  const getStandardLicenseCost = (type: Key['duration'], customVal: string, devLimit: number) => {
    const factor = devLimit >= 99999 ? 10 : devLimit;
    let base = 10;
    switch (type) {
      case '1_day': base = 10; break;
      case '7_days': base = 50; break;
      case '15_days': base = 300; break;
      case '30_days': base = 1000; break;
      case '90_days': base = 2500; break;
      case 'lifetime': base = 5000; break;
      case 'custom': 
         const parsed = parseInt(customVal) || 1;
         base = parsed * 15;
         break;
    }
    return base * factor;
  };

  // Helper cost function based on duration types
  const getLicenseCost = (type: Key['duration'], customVal: string, devLimit: number) => {
    const isLimited = currentUserRole === 'reseller' || currentUserRole === 'admin';
    if (!isLimited) return 0; // Super admin and Owner generate for free (Unlimited Credits)
    return getStandardLicenseCost(type, customVal, devLimit);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, bulkQuantity);
    const resolvedDeviceLimit = deviceLimit === '99999' ? 99999 : (parseInt(deviceLimit) || 1);
    const singleCost = getLicenseCost(durationType, customDays, resolvedDeviceLimit);
    const totalCost = singleCost * qty;

    const isLimited = currentUserRole === 'reseller' || currentUserRole === 'admin';
    if (isLimited && currentUserBalance < totalCost) {
      alert(`Insufficient funds. Generating these ${qty} keys requires ${totalCost.toFixed(2)} Credits but you only have ${currentUserBalance.toFixed(2)} Credits.`);
      return;
    }

    if (isLimited) {
      const success = onDeductBalance(totalCost, `${currentUserRole?.toUpperCase()} generated ${qty} license(s)`);
      if (!success) return;
    }

    const generatedKeys: Key[] = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Dynamic Helper for random sequence
    const generateRandomString = (len: number) => {
      const pool = 'abcdefghijklmnopqrstuvwxyz';
      return Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join('');
    };

    // Calculate expiry Date
    let expiryDate: string | null = null;
    let daysToAdd = 0;
    if (durationType !== 'lifetime') {
      switch (durationType) {
        case '1_day': daysToAdd = 1; break;
        case '7_days': daysToAdd = 7; break;
        case '15_days': daysToAdd = 15; break;
        case '30_days': daysToAdd = 30; break;
        case '90_days': daysToAdd = 90; break;
        case 'custom': daysToAdd = parseInt(customDays) || 30; break;
      }
      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      expiryDate = date.toISOString().replace('T', ' ').substring(0, 19);
    }

    // Loop for generating the requested number of keys
    for (let i = 0; i < qty; i++) {
      let keyString = '';
      if (useCustomPattern) {
        const baseText = customKeyText.trim() || 'Ravi';
        if (qty > 1) {
          keyString = `${baseText}-${i + 1}`;
        } else {
          keyString = baseText;
        }
      } else {
        // Random: Mex-chdkfkfk-3039 pattern
        const rawUser = currentUsername || 'Mex';
        const cleanUser = rawUser === 'Mexx' ? 'Mex' : rawUser;
        const randomString = generateRandomString(8);
        const randNum = Math.floor(1000 + Math.random() * 9000);
        keyString = `${cleanUser}-${randomString}-${randNum}`;
      }

      // Safeguard against duplicates
      let uniqueKeyString = keyString;
      let checkAttempts = 0;
      while (
        (keys.some(k => k.keyString === uniqueKeyString) || 
         generatedKeys.some(gk => gk.keyString === uniqueKeyString)) && 
        checkAttempts < 50
      ) {
        checkAttempts++;
        if (useCustomPattern) {
          uniqueKeyString = `${keyString}-${Math.floor(100 + Math.random() * 900)}`;
        } else {
          const rawUser = currentUsername || 'Mex';
          const cleanUser = rawUser === 'Mexx' ? 'Mex' : rawUser;
          const randomString = generateRandomString(8);
          const randNum = Math.floor(1000 + Math.random() * 9000);
          uniqueKeyString = `${cleanUser}-${randomString}-${randNum}`;
        }
      }

      const newKey: Key = {
        id: `key_${Date.now()}_${i}_${Math.random()}`,
        keyString: uniqueKeyString,
        status: 'inactive',
        duration: durationType,
        customDays: durationType === 'custom' ? parseInt(customDays) : undefined,
        expiryDate,
        creationDate: timestamp,
        deviceLimit: resolvedDeviceLimit,
        usedDevices: [],
        notes: keyNotes || `Generated license key ${useCustomPattern ? 'custom' : 'random'} via dashboard panel.`,
        createdBy: currentUsername || 'System'
      };
      generatedKeys.push(newKey);
    }

    onAddKey(generatedKeys);
    setKeyNotes('');
  };

  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.keyString.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          k.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCreditCost = (type: string) => {
    switch (type) {
      case '1_day': return 10;
      case '7_days': return 50;
      case '15_days': return 300;
      case '30_days': return 1000;
      case 'lifetime': return 5000;
      default: return 10;
    }
  };

  // Catalog List JSX Helper used in both generate and catalog views
  const renderCatalogList = (titleText = "Active Subscription Licenses") => {
    return (
      <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-purple-500/10 via-purple-500/25 to-purple-500/10" />

        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.03] mb-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            {titleText}
          </h3>

          {/* Filter and search control widgets */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <input
              id="catalog-search"
              type="text"
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#100c1e] text-slate-300 border border-white/[0.04] px-3.5 py-1.5 rounded-xl text-xs focus:outline-none placeholder-slate-600 w-36 md:w-48 font-sans font-medium"
            />

            <button
              id="btn-export-txt"
              onClick={handleExportTxt}
              type="button"
              className="bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="Export all currently filtered keys to a TXT file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TXT</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs Bar & Delete All in dropdown */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/[0.03] select-none">
          <div className="relative z-30">
            <button
              id="status-filter-dropdown-btn"
              type="button"
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowDeleteAllConfirmInDropdown(false);
              }}
              className="px-4 py-2 bg-[#090614] hover:bg-[#150e2b] rounded-2xl border border-white/[0.04] text-xs font-bold uppercase tracking-wide text-purple-400 hover:text-white transition flex items-center gap-2.5 shadow-inner active:scale-[0.98]"
            >
              <span>
                {statusFilter === 'all' && '📂 All Keys'}
                {statusFilter === 'active' && '⚡ Active Keys'}
                {statusFilter === 'expired' && '⏳ Expired Keys'}
                {statusFilter === 'inactive' && '🔑 Unused Keys'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono leading-none bg-[#130d2a] text-purple-300 border border-white/[0.01]">
                {statusFilter === 'all' && keys.length}
                {statusFilter === 'active' && keys.filter(k => k.status === 'active').length}
                {statusFilter === 'expired' && keys.filter(k => k.status === 'expired').length}
                {statusFilter === 'inactive' && keys.filter(k => k.status === 'inactive').length}
              </span>
              <span className="text-slate-500 font-normal text-[10px]">▼</span>
            </button>
 
            {/* Dropdown Options Popup Container */}
            {showFilterDropdown && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => {
                    setShowFilterDropdown(false);
                    setShowDeleteAllConfirmInDropdown(false);
                  }} 
                />
                
                <div className="absolute left-0 mt-2 w-56 bg-[#0d0a22] border border-[#211642] rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-fade-in divide-y divide-white/[0.02] border-t-[#8b5cf6]/20">
                  <div className="pb-1.5 px-2 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-[#a855f7] tracking-wider">Select Filter State</span>
                  </div>
                  
                  <div className="py-1.5 space-y-1">
                    {[
                      { id: 'all', label: '📂 All Keys', count: keys.length },
                      { id: 'active', label: '⚡ Active Keys', count: keys.filter(k => k.status === 'active').length },
                      { id: 'expired', label: '⏳ Expired Keys', count: keys.filter(k => k.status === 'expired').length },
                      { id: 'inactive', label: '🔑 Unused Keys', count: keys.filter(k => k.status === 'inactive').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(tab.id);
                          setShowFilterDropdown(false);
                          setShowDeleteAllConfirmInDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left rounded-xl text-xs font-bold uppercase transition flex items-center justify-between ${
                          statusFilter === tab.id
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                          statusFilter === tab.id ? 'bg-purple-500/20 text-purple-300' : 'bg-[#150f2b] text-slate-500'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Red delete all option placed right in the same dropdown options box */}
                  <div className="pt-1.5 space-y-1">
                    {showDeleteAllConfirmInDropdown ? (
                      <div className="p-2 bg-red-950/40 border border-red-500/20 rounded-xl space-y-2 animate-pulse">
                        <p className="text-[8.5px] font-extrabold uppercase text-red-400 leading-tight text-center">
                          Wipe all {filteredKeys.length} matching keys?
                        </p>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteAllFiltered();
                              setShowFilterDropdown(false);
                            }}
                            className="flex-1 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[9px] font-black uppercase transition text-center"
                          >
                            Wipe
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteAllConfirmInDropdown(false)}
                            className="flex-1 py-1 bg-[#17132a] text-slate-300 rounded-lg text-[9px] font-bold uppercase transition text-center"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={filteredKeys.length === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteAllConfirmInDropdown(true);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl text-xs font-bold uppercase transition flex items-center justify-between text-red-400 hover:bg-red-950/30 border border-red-500/10 disabled:opacity-30 disabled:pointer-events-none"
                        title="Delete all subscription keys matching current filter state"
                      >
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Wipe Catalog</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono leading-none bg-red-950/50 text-red-400">
                          {filteredKeys.length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Subscription Elements List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-12 bg-[#100c1e]/40 border border-dashed border-white/5 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No active keys match your catalog query.</p>
            </div>
          ) : (
            filteredKeys.map((key) => {
              return (
                <div
                  key={key.id}
                  id={`key-item-${key.id}`}
                  className="py-4 border-b border-white/[0.04] transition-all duration-300 relative group"
                >
                  <div className="flex flex-col w-full min-w-0 font-sans space-y-2.5">
                    
                    {/* Line 1: Key code name value, copy and share/message formatting buttons on the right */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-indigo-400 tracking-wider text-xs select-all bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/15 shadow-[0_0_12px_rgba(99,102,241,0.1)]">
                        {key.keyString}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(key.keyString);
                          setCopiedKeyId(key.id);
                          setTimeout(() => setCopiedKeyId(null), 1550);
                        }}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          copiedKeyId === key.id
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-[#150f33] border-white/[0.04] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20'
                        }`}
                        title="Copy Key Code"
                      >
                        {copiedKeyId === key.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {copiedKeyId === key.id && (
                        <span className="text-[9px] text-green-400 font-extrabold animate-pulse uppercase tracking-wider">Copied!</span>
                      )}
 
                      <button
                        type="button"
                        onClick={() => {
                          const formattedText = `🔥 *VIP PREMIUM LICENSE KEY* 🔥\n------------------------------------\n🔑 *Key Code:* \`${key.keyString}\`\n⏳ *Duration:* ${key.duration.replace('_', ' ').toUpperCase().replace('1_DAY', '2 HOURS').replace('7_DAYS', '24 HOURS').replace('15_DAYS', '7 DAYS').replace('30_DAYS', '30 DAYS')}\n⚡ *Game:* BGMI (Battlegrounds Mobile India) 🇮🇳\n🛡️ *Security:* Anti-Ban / Bypass Online\n------------------------------------\n*Thanks for choosing VIP Panel! Redeemed successfully!* 🚀`;
                          navigator.clipboard.writeText(formattedText);
                          setCopiedFormatId(key.id);
                          setTimeout(() => setCopiedFormatId(null), 1550);
                        }}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          copiedFormatId === key.id
                            ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                            : 'bg-[#150f33] border-white/[0.04] text-slate-400 hover:text-pink-400 hover:border-pink-500/25'
                        }`}
                        title="Copy WhatsApp/Telegram message"
                      >
                        {copiedFormatId === key.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {copiedFormatId === key.id && (
                        <span className="text-[9px] text-pink-450 font-extrabold animate-pulse uppercase tracking-wider">Format Copied!</span>
                      )}
                    </div>

                    {/* Line 2: Active status box, then expires date, then key type info tag */}
                    <div className="flex items-center gap-2 flex-wrap text-slate-400 text-[11px] font-sans">
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] uppercase font-bold tracking-widest ${statusColors[key.status]}`}>
                        {key.status === 'suspended' ? 'BLOCKED' : key.status}
                      </span>
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Expires On:</span>
                      <span className="text-slate-300 font-semibold bg-[#140f2f] px-2 py-0.5 rounded border border-white/[0.01]">
                        {key.expiryDate ? key.expiryDate.split(' ')[0] : 'Never (Lifetime)'}
                      </span>
                      <span className="text-[9px] text-purple-355 font-black tracking-widest uppercase bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 whitespace-nowrap ml-auto">
                        {key.duration.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Line 3: Creator info section + Delete/Trash option button */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.02]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Created By:</span>
                        <span className="text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/15 px-2 py-0.5 rounded text-[10px] font-bold">
                          {key.createdBy || 'System'}
                        </span>
                      </div>
                      <button
                        id={`delete-key-${key.id}`}
                        onClick={() => onDeleteKey(key.id)}
                        className="p-1.5 px-3 bg-red-950/15 hover:bg-red-950/50 text-red-400 rounded-xl border border-red-900/15 hover:border-red-500/30 transition-all duration-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                        title="Delete Key License code"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>

                    {/* Line 4 - Big Extend validity control action CTA block centered below */}
                    <div className="mt-2.5 relative w-full">
                      <button
                        id={`extend-key-trigger-${key.id}`}
                        type="button"
                        onClick={() => setExtendingKeyId(extendingKeyId === key.id ? null : key.id)}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border gap-1.5 transition-all text-center flex items-center justify-center ${
                          extendingKeyId === key.id
                            ? 'bg-purple-600 text-white border-purple-500/40 shadow-lg shadow-purple-500/20'
                            : 'bg-purple-950/20 text-purple-400 border-purple-900/10 hover:bg-purple-950/40'
                        }`}
                        title="Extend validity time of this license"
                      >
                        <span>Extend Key Validity Time ⏱️</span>
                        <span className="text-[8px]">▼</span>
                      </button>

                      {extendingKeyId === key.id && (
                        <>
                          {/* Overlay backdrop to close */}
                          <div 
                            className="fixed inset-0 z-45 bg-transparent" 
                            onClick={() => setExtendingKeyId(null)} 
                          />
                          
                          <div className="absolute left-0 mt-2 w-full bg-[#0d0a22] border border-[#211642] rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] p-3.5 z-50 animate-fade-in border-t-purple-500/20">
                            <div className="pb-2 px-1 border-b border-white/[0.03] mb-2 flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase text-[#a855f7] tracking-wider">Select Extension Duration</span>
                              <span className="text-[8px] text-slate-500 font-bold uppercase cursor-pointer" onClick={() => setExtendingKeyId(null)}>Close</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: '⏱️ 1 Hour', val: 1 / 24 },
                                { label: '⏱️ 5 Hours', val: 5 / 24 },
                                { label: '⏰ 12 Hours', val: 12 / 24 },
                                { label: '⚡ 24 Hours', val: 1 }
                              ].map(opt => (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => {
                                    onExtendKey(key.id, opt.val);
                                    setExtendingKeyId(null);
                                  }}
                                  className="px-2.5 py-2 text-center rounded-xl text-[10px] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.03] hover:border-purple-500/20 text-slate-300 hover:text-white font-black uppercase transition-all"
                                >
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    );
  };

  if (viewMode === 'generate') {
    return (
      <div id="screenshot-generator-root" className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-2">
        
        {/* Generator Form Block */}
        <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] relative overflow-hidden max-w-xl mx-auto w-full">
          {/* Accent light on top */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-purple-500/10 via-purple-500/25 to-purple-500/10" />

          {/* Header Row */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.03] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#0ea5e9]/70 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(14,165,233,0.3)]">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight uppercase">Generate Subscription Key</h3>
            </div>

            <button
              id="btn-switch-to-history"
              onClick={onHistoryClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17132a] text-slate-300 font-semibold border border-white/[0.04] rounded-xl text-xs hover:bg-[#201d3a] transition"
            >
              <ListFilter className="w-3.5 h-3.5 text-slate-400" />
              <span>Catalog History</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateKey} className="space-y-5">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Select Game Target</label>
              <div className="w-full bg-[#100c1e] text-emerald-400 border border-emerald-500/10 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  BGMI (Battlegrounds Mobile India ONLY)
                </span>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest uppercase">Locked</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Device Limit</label>
                <button
                  type="button"
                  onClick={() => setDeviceLimit(deviceLimit === '99999' ? '' : '99999')}
                  className={`text-[10px] px-2.5 py-1 rounded bg-[#17132a] hover:bg-[#201d3a] border transition font-bold ${
                    deviceLimit === '99999' ? 'text-green-400 border-green-500/20' : 'text-slate-400 border-white/[0.04]'
                  }`}
                >
                  {deviceLimit === '99999' ? '✓ Unlimited Active' : 'Set Unlimited'}
                </button>
              </div>
              {deviceLimit === '99999' ? (
                <div className="w-full bg-[#100c1e] text-green-400 border border-green-500/10 p-3.5 rounded-2xl text-xs font-black tracking-wide font-mono flex items-center justify-between">
                  <span>UNLIMITED DEVICES KEY</span>
                  <span className="text-[10px] text-slate-500 font-normal italic">(Unlimited Limit)</span>
                </div>
              ) : (
                <input
                  id="screenshot-devices-input"
                  type="text"
                  placeholder="e.g. 1"
                  value={deviceLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setDeviceLimit(val);
                    }
                  }}
                  className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3.5 rounded-2xl text-xs focus:outline-none focus:border-purple-500 font-semibold"
                />
              )}
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Duration (Hours / Period)</label>
              <select
                id="screenshot-duration-select"
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as any)}
                className="w-full bg-[#100c1e] text-slate-200 border border-white/[0.04] p-3.5 rounded-2xl text-xs focus:outline-none focus:border-purple-500 font-semibold cursor-pointer"
              >
                <option value="1_day">2 Hours — 10 Credits/Device</option>
                <option value="7_days">24 Hours — 50 Credits/Device</option>
                <option value="15_days">7 Days — 300 Credits/Device</option>
                <option value="30_days">30 Days — 1000 Credits/Device</option>
                <option value="lifetime">Lifetime — 5000 Credits/Device</option>
              </select>
            </div>

            {/* Custom key pattern check box and input */}
            <div className="flex flex-col gap-3 bg-[#100c1e] border border-white/[0.03] p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-3">
                <input
                  id="custom-key-checkbox"
                  type="checkbox"
                  checked={useCustomPattern}
                  onChange={(e) => setUseCustomPattern(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md border-white/5 bg-[#080512] text-purple-600 focus:ring-purple-500/40 cursor-pointer"
                />
                <label htmlFor="custom-key-checkbox" className="text-xs text-slate-400 font-bold cursor-pointer select-none">
                  Use Custom Key Pattern
                </label>
              </div>
              
              {useCustomPattern && (
                <div className="pt-2 border-t border-white/[0.02]">
                  <label className="block text-[9px] text-[#0ea5e9] font-bold uppercase tracking-wider mb-1.5">Custom Key String value (e.g., Ravi)</label>
                  <input
                    id="custom-key-text-input"
                    type="text"
                    placeholder="e.g., Ravi"
                    value={customKeyText}
                    onChange={(e) => setCustomKeyText(e.target.value)}
                    className="w-full bg-[#0c0819] text-slate-200 border border-[#1b0f35] px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#0ea5e9] font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {/* Price label row with calculated sum of custom device limits */}
            <div className="pt-3 pb-2 px-4 bg-[#100c1e] border border-white/[0.02] rounded-2xl flex justify-between items-center text-slate-300 font-sans shadow-inner">
              <div className="flex flex-col text-left col-span-2">
                <span className="text-[9px] text-[#0ea5e9] font-extrabold uppercase tracking-widest mb-0.5">Calculated Cost</span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {deviceLimit === '99999' ? 'Unlimited Devices (10x Base)' : `${deviceLimit || 1} Device(s)`} × {
                    durationType === '1_day' ? '10 (2 HOURS)' : 
                    durationType === '7_days' ? '50 (24 HOURS)' : 
                    durationType === '15_days' ? '300 (7 DAYS)' : 
                    durationType === '30_days' ? '1000 (30 DAYS)' : '5000 (LIFETIME)'
                  } Credits
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-emerald-400 font-mono tracking-tight">
                  {getStandardLicenseCost(durationType, customDays, deviceLimit === '99999' ? 99999 : (parseInt(deviceLimit) || 1))} Credits
                </span>
                {!(currentUserRole === 'reseller' || currentUserRole === 'admin') && (
                  <span className="text-[8px] text-yellow-500 font-bold tracking-wider uppercase bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 mt-1 scale-95 origin-right">
                    Free (Admin Mode)
                  </span>
                )}
              </div>
            </div>

            {/* Big Blue Button */}
            <div className="pt-1">
              <button
                id="screenshot-generate-btn"
                type="submit"
                className="w-full py-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.98] text-white rounded-2xl text-xs font-bold transition-all shadow-[0_8px_24px_rgba(14,165,233,0.3)] flex items-center justify-center gap-1.5"
              >
                <span>Generate VIP License String</span>
                <span>→</span>
              </button>
            </div>

          </form>
        </div>

        {/* Niche list show keys with edit, delete, block options dynamically */}
        <div className="w-full animate-fade-in">
          {renderCatalogList("Generated License Keys Directory")}
        </div>

      </div>
    );
  }

  if (viewMode === 'catalog') {
    return (
      <div id="screenshot-catalog-root" className="w-full max-w-4xl mx-auto py-2">
        {renderCatalogList("Active Subscription Licenses")}
      </div>
    );
  }

  return (
    <div id="key-generator-section" className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {renderCatalogList("Administrative Key matrix")}
    </div>
  );
}
