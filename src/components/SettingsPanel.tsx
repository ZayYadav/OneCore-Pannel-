import React, { useState } from 'react';
import { SystemSettings, TenantAnnouncement } from '../types';
import { Settings, CheckCircle, Send, Trash2, Megaphone } from 'lucide-react';

interface SettingsPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => void;
  announcements: TenantAnnouncement[];
  onAddAnnouncement: (message: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  currentUser: { username: string; role: string; id: string; ownerId?: string };
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  announcements = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
  currentUser
}: SettingsPanelProps) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [brandName, setBrandName] = useState(settings.brandName || 'OneBox');
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);

  // Announcement compose state
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [annSuccessMsg, setAnnSuccessMsg] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      siteName,
      brandName,
      maintenanceMode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnMsg.trim()) return;
    if (onAddAnnouncement) {
      onAddAnnouncement(newAnnMsg);
      setNewAnnMsg('');
      setAnnSuccessMsg('📢 Announcement broadcasted successfully!');
      setTimeout(() => setAnnSuccessMsg(''), 4000);
    }
  };

  const isAllowedToPost = currentUser?.role === 'super_admin' || currentUser?.role === 'owner' || currentUser?.role === 'admin';

  // Use the pre-filtered announcements passed from the parent App component
  const filteredAnnouncements = announcements;

  return (
    <div id="settings-panel-section" className="space-y-6 font-sans">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-purple-500/10 gap-3">
        <div>
          <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-[#0ea5e9] bg-clip-text text-transparent uppercase tracking-tight">
            Central Environment Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system brand profiles, manage site parameters, and publish announcements within your tenant command hierarchy.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-emerald-400 rounded-xl text-xs font-semibold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Config Saved!
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto text-xs text-slate-300">
        
        {/* Core Global Branding settings - Match to standard panel cards (bg-[#0b0816]/95 border-white/[0.04]) */}
        <div className="bg-[#0b0816]/95 border border-white/[0.04] p-6 rounded-[28px] shadow-[0_24px_50px_rgba(3,1,10,0.8)] space-y-4 relative overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-white/[0.04] pb-3 uppercase tracking-wider">
            <Settings className="w-4 h-4 text-purple-400" />
            Corporate Brand Configuration
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2 tracking-wider">Change Panel Name (siteName)</label>
              <input
                id="site-title-input"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-[#100c1e] text-slate-200 p-2.5 rounded-xl border border-white/[0.04] focus:outline-none focus:border-purple-500 font-mono transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2 tracking-wider">Change Brand Name</label>
              <input
                id="brand-name-input"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-[#100c1e] text-slate-200 p-2.5 rounded-xl border border-white/[0.04] focus:outline-none focus:border-purple-500 font-mono transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2 flex justify-between tracking-wider">
                <span>System Maintenance State</span>
                <span className={maintenanceMode ? 'text-yellow-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {maintenanceMode ? 'STANDBY ENABLED' : 'ONLINE SYSTEM'}
                </span>
              </label>
              <button
                id="maintenance-toggle-btn"
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider border transition-all duration-300 ${
                  maintenanceMode
                    ? 'bg-yellow-950/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-950/40'
                    : 'bg-[#100c1e] text-slate-400 border-white/[0.04]'
                }`}
              >
                {maintenanceMode ? 'Shutdown Panel to Maintenance' : 'Toggle Maintenance Mode'}
              </button>
            </div>

            <div className="pt-2">
              <button
                id="save-global-settings-btn"
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white rounded-xl shadow-lg font-bold uppercase text-[10px] tracking-wider transition duration-300"
              >
                Apply Corporate Branding
              </button>
            </div>
          </form>
        </div>



      </div>
    </div>
  );
}
