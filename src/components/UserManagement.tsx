import React, { useState } from 'react';
import { User } from '../types';
import { Search, UserPlus, ShieldAlert, CheckCircle, Ban, Edit, Trash2, Globe, Plus, Minus, FileText } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUserStatus: (id: string, status: User['status']) => void;
  onAdjustBalance: (id: string, amount: number) => void;
  onDeleteUser: (id: string) => void;
  currentUserRole: string;
}

export default function UserManagement({
  users,
  onAddUser,
  onUpdateUserStatus,
  onAdjustBalance,
  onDeleteUser,
  currentUserRole
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // States for new user forms
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newRole, setNewRole] = useState<'super_admin' | 'owner' | 'admin' | 'reseller' | 'user'>('user');
  const [newBalance, setNewBalance] = useState('0.00');

  // Fast state adjustment
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [customAdjustInputs, setCustomAdjustInputs] = useState<Record<string, string>>({});

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) {
      alert('Username and Email are mandatory.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: newUsername,
      email: newEmail,
      country: newCountry,
      deviceId: '',
      lastLogin: 'N/A (Pending Activation)',
      status: 'active',
      balance: parseFloat(newBalance) || 0.00,
      role: newRole,
      registrationDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: 'Manually pre-registered subscriber account.'
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setNewUsername('');
    setNewEmail('');
    setNewBalance('0.00');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) || 
                          u.country.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div id="user-management-section" className="space-y-6">
      
      {/* Search and Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              id="user-search-input"
              type="text"
              placeholder="Search subscribers username, email, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            id="user-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 text-slate-400 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">All Role Tiers</option>
            <option value="super_admin">Super Admins</option>
            <option value="owner">Owners</option>
            <option value="admin">Administrators</option>
            <option value="reseller">Resellers</option>
            <option value="user">Subscribers (Users)</option>
          </select>
        </div>

        <button
          id="add-user-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:brightness-110 flex items-center gap-2 transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Subscriber Hub
        </button>
      </div>

      {/* Mobile Grid Cards List */}
      <div className="block md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No subscribers match your query.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-850 space-y-3.5 shadow-md">
              {/* Row 1: Profile & Status */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-slate-200 text-[10px]">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1 text-xs">
                      {user.username}
                      <span className={`px-1.5 py-0.2 text-[7px] font-bold rounded capitalize tracking-wider ${
                        user.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        user.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        user.role === 'reseller' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    {user.panelExpiry && (
                      <div className="text-[9px] text-indigo-400 font-semibold bg-[#805ad5]/5 border border-indigo-500/15 px-1.5 py-0.5 rounded-md mt-1 max-w-fit">
                        ⏱️ Panel Expires: {user.panelExpiry}
                      </div>
                    )}
                    <div className="text-slate-500 text-[10px] font-mono">{user.email}</div>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                  user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                  user.status === 'suspended' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                  'bg-red-500/10 text-red-500 border-red-500/30'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${
                    user.status === 'active' ? 'bg-green-400' :
                    user.status === 'suspended' ? 'bg-yellow-400' :
                    'bg-red-500'
                  }`} />
                  {user.status}
                </span>
              </div>

              {/* Row 2: Location and Hardware Lock */}
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 font-medium">Geo Node:</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <Globe className="w-3 h-3 text-slate-450" />
                    {user.country}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 font-medium">HWID Bind:</span>
                  <span className="font-mono text-slate-400 text-[10px] truncate max-w-[170px]" title={user.deviceId}>
                    {user.deviceId || 'Unregistered Node'}
                  </span>
                </div>
              </div>

              {/* Row 3: Wallet balance & dynamic controls */}
              <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800/40">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Balance</span>
                  <span className="font-bold text-[#0ea5e9] font-mono text-xs">
                    {user.role === 'super_admin' || user.role === 'owner' ? 'Unlimited' : `${user.balance.toFixed(2)} Credits`}
                  </span>
                </div>

                {/* Controls Action panel with fast presets */}
                <div className="flex flex-col gap-2 items-end">
                  {/* Balance loaders group */}
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                      <button
                        onClick={() => {
                          const val = parseFloat(customAdjustInputs[user.id] || adjustAmount);
                          if (!isNaN(val)) onAdjustBalance(user.id, -val);
                        }}
                        className="p-1 hover:text-white hover:bg-slate-900 rounded text-slate-500 font-bold"
                        title="Deduct balance"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        type="text"
                        value={customAdjustInputs[user.id] ?? adjustAmount}
                        onChange={(e) => setCustomAdjustInputs({
                          ...customAdjustInputs,
                          [user.id]: e.target.value
                        })}
                        className="w-10 bg-transparent text-center font-mono text-[10px] text-slate-300 border-none outline-none focus:ring-0 focus:border-none p-0 !border-0 font-bold"
                      />
                      <button
                        onClick={() => {
                          const val = parseFloat(customAdjustInputs[user.id] || adjustAmount);
                          if (!isNaN(val)) onAdjustBalance(user.id, val);
                        }}
                        className="p-1 hover:text-white hover:bg-slate-900 rounded text-slate-500 font-bold"
                        title="Add balance"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    {/* Preset load triggers */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => onAdjustBalance(user.id, 100)}
                        className="px-1 bg-[#10b981]/10 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/20 rounded text-[8px] font-mono font-bold"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustBalance(user.id, 500)}
                        className="px-1 bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-500 border border-yellow-500/20 rounded text-[8px] font-mono font-bold"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustBalance(user.id, 2000)}
                        className="px-1 bg-pink-500/10 hover:bg-pink-500/25 text-pink-500 border border-pink-500/20 rounded text-[8px] font-mono font-bold"
                      >
                        +2K
                      </button>
                    </div>
                  </div>

                  {/* Operational States row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* State switch */}
                    {user.status !== 'suspended' ? (
                      <button
                        onClick={() => onUpdateUserStatus(user.id, 'suspended')}
                        className="p-1 py-1.5 bg-slate-950 hover:bg-yellow-950/30 border border-slate-800 text-slate-400 hover:text-yellow-500 rounded-lg transition"
                        title="Suspend account"
                      >
                        <Ban className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateUserStatus(user.id, 'active')}
                        className="p-1 py-1.5 bg-green-950/20 hover:bg-green-950/60 border border-green-900/30 text-green-400 rounded-lg transition"
                        title="Re-activate account"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}

                    {user.status !== 'banned' ? (
                      <button
                        onClick={() => onUpdateUserStatus(user.id, 'banned')}
                        className="p-1 py-1.5 bg-slate-950 hover:bg-red-950/60 border border-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition"
                        title="BAN Profile"
                      >
                        <ShieldAlert className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateUserStatus(user.id, 'active')}
                        className="p-1 py-1.5 bg-slate-950 hover:bg-green-950/40 border border-slate-800 text-slate-400 hover:text-green-400 rounded-lg transition"
                        title="Revoke Ban"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1 py-1.5 bg-red-950/10 hover:bg-red-950/50 text-red-500 rounded-lg border border-red-900/30 transition hover:border-red-900"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grid List - Desktop View */}
      <div className="hidden md:block bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold tracking-wider text-[10px] uppercase">
                <th className="px-6 py-4">Subscriber Profile</th>
                <th className="px-6 py-4">Geo / Hardware Bind</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4 text-right">Moderator Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-950/20 transition-colors">
                  
                  {/* Account detail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/10">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-slate-200">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          {user.username}
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded capitalize tracking-wider ${
                            user.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            user.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]' :
                            user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            user.role === 'reseller' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                        {user.panelExpiry && (
                          <div className="mt-1">
                            <span className="text-[9px] bg-[#805ad5]/5 text-indigo-400 border border-[#805ad5]/15 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                              ⏱️ Panel Expires: {user.panelExpiry}
                            </span>
                          </div>
                        )}
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Geography and Locked Device */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {user.country}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-mono italic">
                        HWID BND: {user.deviceId || 'Unregistered Node'}
                      </span>
                    </div>
                  </td>

                  {/* wallet account */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0ea5e9] font-mono text-sm">
                      {user.role === 'super_admin' || user.role === 'owner' ? 'Unlimited' : `${user.balance.toFixed(2)} Credits`}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Wallet Balance</div>
                  </td>

                  {/* Status pills */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      user.status === 'suspended' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                      'bg-red-500/10 text-red-500 border-red-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'active' ? 'bg-green-400' :
                        user.status === 'suspended' ? 'bg-yellow-400' :
                        'bg-red-500'
                      }`} />
                      {user.status}
                    </span>
                  </td>

                  {/* Operations actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Credits quick 3 balance presets and custom input adjuster */}
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 shadow-sm">
                          <button
                            id={`deduct-credit-${user.id}`}
                            onClick={() => {
                              const val = parseFloat(customAdjustInputs[user.id] || adjustAmount);
                              if (!isNaN(val)) onAdjustBalance(user.id, -val);
                            }}
                            className="p-1 hover:text-white hover:bg-slate-900 rounded-lg text-slate-400 font-bold"
                            title="Deduct custom balance"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="text"
                            value={customAdjustInputs[user.id] ?? adjustAmount}
                            onChange={(e) => setCustomAdjustInputs({
                              ...customAdjustInputs,
                              [user.id]: e.target.value
                            })}
                            className="w-14 bg-transparent text-center font-mono text-xs text-slate-200 border-none outline-none focus:ring-0 focus:border-none p-0 !border-0 font-bold"
                            placeholder="Amount"
                          />
                          <button
                            id={`add-credit-${user.id}`}
                            onClick={() => {
                              const val = parseFloat(customAdjustInputs[user.id] || adjustAmount);
                              if (!isNaN(val)) onAdjustBalance(user.id, val);
                            }}
                            className="p-1 hover:text-white hover:bg-slate-900 rounded-lg text-slate-400 font-bold"
                            title="Add custom balance"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* 3 Fast Admin Balance Presets (+100, +500, +2000) */}
                        <div className="flex items-center gap-1 text-[9px] font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => onAdjustBalance(user.id, 100)}
                            className="px-1.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded transition"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustBalance(user.id, 500)}
                            className="px-1.5 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/20 rounded transition"
                          >
                            +500
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustBalance(user.id, 2000)}
                            className="px-1.5 py-0.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 rounded transition"
                          >
                            +2000
                          </button>
                        </div>
                      </div>

                      {/* State switch */}
                      {user.status !== 'suspended' ? (
                        <button
                          id={`suspend-user-${user.id}`}
                          onClick={() => onUpdateUserStatus(user.id, 'suspended')}
                          className="p-1.5 bg-slate-900 hover:bg-yellow-950/30 border border-slate-800 text-slate-400 hover:text-yellow-500 rounded-lg transition"
                          title="Suspend account"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`unban-user-${user.id}`}
                          onClick={() => onUpdateUserStatus(user.id, 'active')}
                          className="p-1.5 bg-green-950/20 hover:bg-green-950/60 border border-green-900/30 text-green-400 rounded-lg transition"
                          title="Re-activate account"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {user.status !== 'banned' ? (
                        <button
                          id={`ban-user-${user.id}`}
                          onClick={() => onUpdateUserStatus(user.id, 'banned')}
                          className="p-1.5 bg-slate-900 hover:bg-red-950/60 border border-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition"
                          title="BAN Profile"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`unban-block-${user.id}`}
                          onClick={() => onUpdateUserStatus(user.id, 'active')}
                          className="p-1.5 bg-slate-900 hover:bg-green-950/40 border border-slate-800 text-slate-400 hover:text-green-400 rounded-lg transition"
                          title="Revoke Ban"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        id={`delete-user-${user.id}`}
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 bg-red-950/10 hover:bg-red-950/50 text-red-500 rounded-lg border border-red-900/30 transition hover:border-red-900/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER SCREEN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h4 className="font-bold text-slate-200">Register Subscriber Segment</h4>
              <button
                id="close-add-user-modal-btn"
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Username</label>
                <input
                  id="new-user-username"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="shadow_cheats"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Email Address</label>
                <input
                  id="new-user-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="user@rainbow.pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Geography</label>
                  <input
                    id="new-user-country"
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Initial Balance (Credits)</label>
                  <input
                    id="new-user-balance"
                    type="text"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Security Role Tier</label>
                <select
                  id="new-user-role-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-400 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none"
                >
                  <option value="user">VIP Subscriber (Tier 4)</option>
                  <option value="reseller">Reseller Dealer (Tier 3)</option>
                  {(currentUserRole === 'super_admin' || currentUserRole === 'owner') && (
                    <option value="admin">System Admin (Tier 2)</option>
                  )}
                  {currentUserRole === 'super_admin' && (
                    <>
                      <option value="owner">Tenant Owner (Tier 1.5)</option>
                      <option value="super_admin">Super Master (Tier 1)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  id="cancel-add-user-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-slate-800 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-user-btn"
                  type="submit"
                  className="py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:brightness-110"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
