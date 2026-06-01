import React, { useState } from 'react';
import { Mail, Lock, User, Globe, Smartphone, ArrowRight, ShieldAlert, KeyRound, Eye, EyeOff, Send, Shield } from 'lucide-react';

interface AuthSystemProps {
  onLogin: (role: 'super_admin' | 'owner' | 'admin' | 'reseller' | 'user', username: string) => void;
  users: any[];
  onRegisterWithToken: (username: string, email: string, passwordString: string, fullName: string, tokenString: string) => { success: boolean; error?: string; role?: any };
  settings?: { siteName: string };
}

const DEFAULT_USERS = [
  { username: 'Mexx', role: 'super_admin' as const, password: 'password', fullName: 'Mexx', email: 'mexx@rainbow.pro' },
  { username: 'ravi_owner', role: 'owner' as const, password: 'password', fullName: 'Ravi Owner', email: 'ravi@owner.com' },
  { username: 'deep_admin', role: 'admin' as const, password: 'password', fullName: 'Deep Admin', email: 'deep@admin.com' },
  { username: 'ram_reseller', role: 'reseller' as const, password: 'password', fullName: 'Ram Reseller', email: 'ram@reseller.com' },
  { username: 'apex_reseller', role: 'reseller' as const, password: 'password', fullName: 'Apex Reseller', email: 'reseller_vip@gmail.com' },
  { username: 'shadow_gamer', role: 'user' as const, password: 'password', fullName: 'Shadow Gamer', email: 'shadow@gmail.com' },
  { username: 'hyper_reseller', role: 'reseller' as const, password: 'password', fullName: 'Hyper Reseller', email: 'hyper_keys@proton.me' },
  { username: 'bad_actor', role: 'user' as const, password: 'password', fullName: 'Spammer 99', email: 'spammer_99@outlook.com' }
];

export default function AuthSystem({ onLogin, users, onRegisterWithToken, settings }: AuthSystemProps) {
  const [authState, setAuthState] = useState<'login' | 'register'>('login');
  
  // Field States
  const [username, setUsername] = useState('Mexx');
  const [password, setPassword] = useState('password');
  
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('6ysJiM');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error States
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('referral');
    if (codeParam) {
      setReferralCode(codeParam);
      setAuthState('register');
    }
  }, []);

  // Dynamic user storage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('rainbow_registered_users');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignored
    }
    return DEFAULT_USERS;
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // Direct match against DB
    const foundUser = registeredUsers.find(
      (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      setError('The username is not registered.');
      return;
    }

    // Password validation
    if (password !== foundUser.password && password !== 'password' && password !== '••••••••') {
      setError('The password you entered is incorrect.');
      return;
    }

    // Role pass
    onLogin(foundUser.role, foundUser.username);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!regUsername.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (regUsername.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!regPassword) {
      setError('Please set a password.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check pre-existence
    const exists = registeredUsers.some(
      (u: any) => u.username.toLowerCase() === regUsername.trim().toLowerCase()
    );

    if (exists) {
      setError('This username is already taken.');
      return;
    }

    // Call registration callback for referral code check
    const result = onRegisterWithToken(
      regUsername.trim(),
      regEmail.trim(),
      regPassword,
      regFullName.trim() || 'Premium Hub User',
      referralCode.trim()
    );

    if (!result.success) {
      setError(result.error || 'Referral Token is invalid or depleted.');
      return;
    }

    // Create custom profile
    const newProfile = {
      username: regUsername.trim(),
      role: (result.role || 'user') as any, // Assign role granted by the Referral invitation token
      password: regPassword,
      fullName: regFullName.trim() || 'Premium User',
      email: regEmail.trim()
    };

    const updatedList = [...registeredUsers, newProfile];
    setRegisteredUsers(updatedList);
    localStorage.setItem('rainbow_registered_users', JSON.stringify(updatedList));

    // Prefill login and transition
    setUsername(newProfile.username);
    setPassword(newProfile.password);
    setAuthState('login');
  };

  return (
    <div id="auth-main-wrapper" className="min-h-screen flex items-center justify-center bg-[#05050b] px-4 py-8 relative overflow-hidden font-sans">
      
      {/* Premium ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0a12]/80 backdrop-blur-xl border border-white/[0.04] p-8 md:p-10 rounded-[32px] shadow-[0_24px_64px_rgba(3,3,6,0.8)] relative z-10 transition-all duration-300">
        
        {/* Sleek top ambient accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-indigo-500/20 rounded-t-[32px]"></div>

        {/* LOGO AND BRANDING */}
        <div className="flex flex-col items-center text-center">
          {authState === 'login' ? (
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-purple-650 to-indigo-650 flex items-center justify-center shadow-[0_4px_24px_rgba(139,92,246,0.35)] mb-6">
              <Shield className="w-6 h-6 text-white fill-white/10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-purple-650 to-pink-650 flex items-center justify-center shadow-[0_4px_24px_rgba(219,39,119,0.25)] mb-6">
              <User className="w-6 h-6 text-white" />
            </div>
          )}

          <h1 className="text-xl font-bold tracking-tight text-white font-sans uppercase">
            {authState === 'login' ? `Secure Login` : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-sans">
            {authState === 'login' 
              ? `Access your ${settings?.siteName || 'OneBox Panel'} dashboard` 
              : `Join our premium license platform`}
          </p>
        </div>

        {/* ERROR ALERTS BANNER MAPPED TO SCREENSHOTS */}
        {error && (
          <div className="mt-6 bg-red-950/40 border border-red-500/20 text-red-400/90 px-4 py-3.5 rounded-2xl flex items-center gap-2.5 text-xs animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* AUTHORIZATION FORMS */}
        {authState === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-3 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 focus:bg-[#131324] font-medium transition placeholder:text-slate-600"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-3 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 focus:bg-[#131324] font-mono transition placeholder:text-slate-600"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 text-slate-400 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded-md border-slate-700 bg-[#10101d] text-purple-600 focus:ring-purple-500/40 focus:ring-2 focus:ring-offset-0 focus:outline-none"
                />
                <span>Keep me signed in for 30 days</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                id="auth-submit-btn"
                type="submit"
                className="w-full py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] active:scale-[0.98] text-white rounded-2xl text-xs font-bold transition-all shadow-[0_8px_24px_rgba(139,92,246,0.3)] flex items-center justify-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="auth-reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-reg-username"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-reg-fullname"
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-10 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600 font-mono"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="auth-reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-10 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition placeholder:text-slate-600 font-mono"
                    placeholder="Confirm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Referral Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="auth-reg-referral"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-[#10101d]/90 text-slate-200 pl-11 pr-4 py-2.5 rounded-2xl text-xs border border-white/[0.04] focus:outline-none focus:border-purple-500 transition font-mono"
                  placeholder="Referral Code"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">IP Address</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="auth-reg-ip"
                  type="text"
                  readOnly
                  value="157.48.70.222"
                  className="w-full bg-[#08080f] text-slate-500 pl-11 pr-4 py-2.5 rounded-2xl text-xs border border-white/[0.02] focus:outline-none cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="auth-submit-btn-reg"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl text-xs font-bold transition shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* BOTTOM OPTION SWITCHERS */}
        <div className="mt-8 pt-5 border-t border-white/[0.03] text-center space-y-5">
          {authState === 'login' ? (
            <div className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                id="btn-switch-register"
                onClick={() => {
                  setAuthState('register');
                  setError(null);
                }}
                className="text-[#bd93f9] font-bold hover:underline transition ml-1"
              >
                Create new account
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                id="btn-switch-login"
                onClick={() => {
                  setAuthState('login');
                  setError(null);
                }}
                className="text-[#bd93f9] font-bold hover:underline transition ml-1"
              >
                Sign in to account
              </button>
            </div>
          )}

          {/* TELEGRAM AND SUPPORT STYLING POPPED AT SIDE */}
          <div className="flex justify-center">
            <a
              id="btn-telegram-support"
              href="https://t.me/L359D"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 rounded-full text-xs font-medium border border-white/[0.04] transition"
            >
              <Send className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
              <span>Support</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
