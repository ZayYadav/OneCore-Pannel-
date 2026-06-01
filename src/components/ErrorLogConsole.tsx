import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, FileText, AlertTriangle, Play, CheckCircle, RefreshCw, Trash2, Copy, Download, HelpCircle, Server, Key, Lock, Info } from 'lucide-react';

interface ErrorLogConsoleProps {
  onAddAuditLog?: (action: string, category: string, status: 'success' | 'failed' | 'warning') => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'DATABASE' | 'SECURITY' | 'JWT' | 'API' | 'CREDITS';
  message: string;
  details?: string;
  solution?: string;
}

export default function ErrorLogConsole({ onAddAuditLog }: ErrorLogConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 19),
      level: 'INFO',
      category: 'API',
      message: '⚙️ Secure Listener initialized on PORT 3000',
      details: 'Anti-clone core verified registered domain and baseline URL bindings successfully.'
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString().replace('T', ' ').substring(0, 19),
      level: 'WARNING',
      category: 'DATABASE',
      message: '⚠️ MySQL connection pool initialized with minor latency',
      details: 'Latency detected: 48ms during database initial handshake query pool.',
      solution: 'Ensure your DB_HOST setting inside .env is set to "localhost" or local Unix socket path instead of "127.0.0.1" if DNS lookup takes time.'
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000).toISOString().replace('T', ' ').substring(0, 19),
      level: 'ERROR',
      category: 'JWT',
      message: '❌ JWT_SECRET_KEY key derivation warning. Falling back to DEFAULT safe key string!',
      details: 'Warning: env("JWT_SECRET_KEY") is empty or not loaded. System used default SUPER_SECURE_RAINBOW_NEON_SECRET_UUID_STRING.',
      solution: 'Add JWT_SECRET_KEY = "your_secret_random_strong_key_here" in your .env file and RESTART your PHP/CodeIgniter node.',
    }
  ]);

  const [activeLevelFilter, setActiveLevelFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<string | null>('jwt');

  // Simulator helper
  const addLog = (level: LogEntry['level'], category: LogEntry['category'], message: string, details?: string, solution?: string) => {
    const newLog: LogEntry = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      level,
      category,
      message,
      details,
      solution
    };
    setLogs(prev => [newLog, ...prev]);

    if (onAddAuditLog) {
      const statusValue = level === 'INFO' ? 'success' : level === 'WARNING' ? 'warning' : 'failed';
      onAddAuditLog(`[Log Simulator] Triggered ${level} - ${message.substring(0, 30)}`, 'security', statusValue);
    }
  };

  const handleSimulateDBTimeout = () => {
    addLog(
      'CRITICAL',
      'DATABASE',
      '🚫 DB_CONNECTION_TIMEOUT: Exception during database connect pool initialization!',
      'mysqli::real_connect(): (HY000/2002): Connection refused. Host: "", User: "db_user_ravi"',
      '💡 SOLUTIONS: (1) Check .env database variables: database.default.hostname, database.default.username, database.default.password. (2) Ensure Database is actually active on the Server. (3) Double-check if DB Name matches phpMyAdmin exactly.'
    );
  };

  const handleSimulateJWTMismatch = () => {
    addLog(
      'ERROR',
      'JWT',
      '🔒 SIGNATURE_VERIFICATION_FAILED: Digital checksum validation mismatch on payload check!',
      'Computed SHA256 HMAC signature did not match client sent checksum code. Checksum mismatch indicates a potential bypass hack or mismatching JWT_SECRET_KEY.',
      '💡 SOLUTIONS: Make sure JWT_SECRET_KEY inside .env of the Backend Server is EXACTLY the same as MASTER_SECRET defined in the client C++ injector script. If you modify .env, you MUST restart your Server.'
    );
  };

  const handleSimulateHWIDBlock = () => {
    addLog(
      'WARNING',
      'SECURITY',
      '🛡️ HWID_SECURITY_ALERT: Hardware register collision blocked for Key string VIP-AA77-90C3-F90E!',
      'Active Hardware ID "DEV-9988-EAAA-CODE" does not match the originally registered device lock "DEV-8899-EBBB-1122"!',
      '💡 SOLUTIONS: Log into VIP Panel Pro, search for key "VIP-AA77-90C3-F90E", click on "HWID Wipe / Reset Lock" option. Once hardware fingerprint is cleared, user can register with new device ID.'
    );
  };

  const handleSimulateKeyExpire = () => {
    addLog(
      'ERROR',
      'API',
      '🚨 VERIFY_EXPIRED: Access request rejected for subscription Key string VIP-EXPIRED-USER-943!',
      'License validation check failed. Expiry Date "2026-05-31 18:20:00" has passed. Response code: 403 Forbidden.',
      '💡 SOLUTIONS: (1) Inform user to purchase renewal top-up key. (2) Admin can manually click "Extend Validation Period" inside Keys panel to top-up extra days.'
    );
  };

  const clearAllLogs = () => {
    setLogs([]);
  };

  const copyLogText = (log: LogEntry) => {
    const text = `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}\nDetails: ${log.details || 'None'}\nSolution: ${log.solution || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(log.id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllLogs = () => {
    if (logs.length === 0) return;
    const fullText = logs.map(log => `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message} - ${log.details || ''}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadLogFile = () => {
    if (logs.length === 0) return;
    const fullText = logs.map(log => `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}\nDetails: ${log.details || 'None'}\nSolution: ${log.solution || 'None'}\n-----------------------------------\n`).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vip_panel_debug_errors_${new Date().toISOString().substring(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    if (activeLevelFilter === 'ALL') return true;
    return log.level === activeLevelFilter;
  });

  return (
    <div id="error-log-console-view" className="w-full space-y-6 animate-fade-in font-sans">
      
      {/* Intro Header banner */}
      <div className="bg-gradient-to-r from-red-950/20 via-[#100918]/80 to-slate-950 border border-red-500/10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.05)]">
        <div className="flex gap-3.5 items-center">
          <span className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl animate-pulse">
            <TerminalIcon className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-[#bc95ff] bg-clip-text text-transparent uppercase tracking-tight">
              🚨 System Error Logger & Debugger
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
              Track database errors, failed key authentication pings, hardware mismatch warnings, and check configurations in real-time.
            </p>
          </div>
        </div>
        <div className="flex bg-[#0d0718] border border-white/[0.04] rounded-xl px-4 py-2 font-mono text-[10px] items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-slate-400 uppercase font-black uppercase">LOGS LISTENERS: ACTIVE</span>
        </div>
      </div>

      {/* QUICK TROUBLESHOOTING GUIDE & USER'S DIRECT ANSWERS */}
      <div className="bg-[#0b0816]/95 border border-white/[0.04] p-5 rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
        
        <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest border-b border-white/[0.04] pb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-pink-400" />
          💡 Configuration & Troubleshooting Guides (हिंदी / Hinglish)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-start">
          
          {/* Vertical Switcher Navigation List */}
          <div className="md:col-span-1 space-y-1 bg-[#06040d] p-1.5 rounded-2xl border border-white/[0.02]">
            <button
              onClick={() => setActiveFAQ('jwt')}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeFAQ === 'jwt' ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20' : 'text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>JWT Secret Key</span>
            </button>
            <button
              onClick={() => setActiveFAQ('expire')}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeFAQ === 'expire' ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20' : 'text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span>Expire Settings</span>
            </button>
            <button
              onClick={() => setActiveFAQ('env')}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeFAQ === 'env' ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20' : 'text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span>Env Configuration</span>
            </button>
          </div>

          {/* Guide Description Box */}
          <div className="md:col-span-3 bg-[#06040c]/80 border border-white/[0.03] p-4.5 rounded-2xl min-h-[140px] text-xs leading-relaxed font-semibold">
            {activeFAQ === 'jwt' && (
              <div className="space-y-3">
                <h4 className="text-slate-200 font-extrabold uppercase tracking-wide text-xs flex items-center gap-2 text-purple-400">
                  <span>❓ JWT_SECRET_KEY = "SUPER_SECURE_RAINBOW_NEON_SECRET_UUID_STRING" isme kya daale?</span>
                </h4>
                <p className="text-slate-300">
                  <strong className="text-white">JWT_SECRET_KEY</strong> aapke server ka ek <strong className="text-purple-400">Private Cryptographic Signature Key</strong> hai. Isme aap koi bhi secure, unpredictable aur random text string daal sakte hain (jaise aapka koi personal unique password ya complex UUID token string).
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/[0.03] font-mono text-[10.5px] text-slate-400 space-y-1">
                  <div>💡 <span className="text-pink-400">Kaam Kaise Karta Hai:</span> Jab app verifyKey request bhejti hai, tab server is custom key se ek response hash checksum banata hai (HMAC-SHA256).</div>
                  <div className="mt-1">🔑 <span className="text-sky-400">Kya Daal Sakte Hain:</span> Jaise: <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-black">MySecret_RainbowVIPPanel_19920392!</code></div>
                  <div className="mt-1">⚠️ <span className="text-red-400">Important:</span> Jo Key aap backend ke <code className="text-white">.env</code> me set karenge, wahi string C++ injector / Client side ke source code me set hona chahiye taki anti-bypass signals check successfully bypass blocks rok sakein.</div>
                </div>
              </div>
            )}

            {activeFAQ === 'expire' && (
              <div className="space-y-3">
                <h4 className="text-slate-200 font-extrabold uppercase tracking-wide text-xs flex items-center gap-2 text-yellow-400">
                  <span>❓ Expired setting kya hai aur usse kya hoga?</span>
                </h4>
                <p className="text-slate-300">
                  <strong className="text-white">Key Expiration Option</strong> har license key ke valid duration (jaise 1 Day, 7 Days, Month, ya Lifetime) ko check karne ke liye kaam karta hai:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold text-[11px] mt-1 text-slate-300">
                  <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="text-red-400 font-extrabold block">🚫 Check Pe Block:</span>
                    Jab bhi user game start karega ya key auth request bhejega, tab backend logic dynamic timestamp match karta hai. Agar key ki expiry date server time se choti hai, toh login turant <strong className="text-[#0ea5e9]">Access Rejected (403 Forbidden - Expired)</strong> ho jayega.
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="text-yellow-400 font-extrabold block">🔑 Automatic Auto-Audit:</span>
                    Expired status aate hi subscription invalid ho jayegi aur hardware registers wipe locks auto-re-open ho jayenge. Isse reseller ka waste of tokens ruk jata hai aur automatic key management dynamic ho jata hai.
                  </div>
                </div>
              </div>
            )}

            {activeFAQ === 'env' && (
              <div className="space-y-3">
                <h4 className="text-slate-200 font-extrabold uppercase tracking-wide text-xs flex items-center gap-3 text-sky-400">
                  <span>❓ Env me configuration set kiya hai fir kyun nahi chal raha?</span>
                </h4>
                <p className="text-slate-300">
                  CodeIgniter 4 ya normal dynamic servers me jab aap <strong className="text-white">.env</strong> file modify block karte hain, toh is troubleshooting checklist ka strictly follow karein:
                </p>
                <ul className="space-y-1 text-[11px] list-decimal pl-4.5 text-slate-400">
                  <li>
                    <strong className="text-slate-200">Server restart karein:</strong> VPS ya Local server settings change hone ke baad automatically load nahi hoti hain. Server ko <strong className="text-purple-400">Stop & Start (Restart dev server ya apache/nginx reload)</strong> zaroor karein.
                  </li>
                  <li>
                    <strong className="text-slate-200">Rename validation check:</strong> .env file ka naam solid aur exactly <strong className="text-emerald-400 font-mono">.env</strong> hona chahiye, galti se <strong className="text-red-400 font-mono">.env.txt</strong> ya <strong className="text-red-400 font-mono">env.example</strong> mat chhodiyega.
                  </li>
                  <li>
                    <strong className="text-slate-200">CodeIgniter CI_ENVIRONMENT check:</strong> .env me check karein kya <strong className="text-white">CI_ENVIRONMENT = development</strong> set hai? Isse errors details display honi shuru ho jati hain (taatparya errors transparent dikhte hain).
                  </li>
                  <li>
                    <strong className="text-slate-200">Database username/password correctly copy check:</strong> Database server configuration block match karna chahiye. phpMyAdmin ke exact values parameters matching ensure karein.
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CORE INTERACTIVE ERROR SIMULATION TERMINAL AND WORK AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Simulation controllers */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-[#0b0816]/95 border border-white/[0.04] p-5 rounded-3xl shadow-xl space-y-3">
            <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-white/[0.04] pb-2">
              🛠️ Error Generator Suite
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Click buttons to trigger real-world live errors in your log system to analyze payload stack trace.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulateDBTimeout}
                className="w-full py-2.5 px-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/35 text-red-400 rounded-xl text-[10.5px] font-bold uppercase transition flex items-center gap-2"
              >
                <Server className="w-4 h-4 shrink-0" />
                <span className="text-left font-sans">MySQL Connect Timeout</span>
              </button>

              <button
                onClick={handleSimulateJWTMismatch}
                className="w-full py-2.5 px-3 bg-pink-500/10 hover:bg-pink-500/15 border border-pink-500/20 hover:border-pink-500/35 text-pink-400 rounded-xl text-[10.5px] font-bold uppercase transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span className="text-left font-sans">Signature Validation Err</span>
              </button>

              <button
                onClick={handleSimulateHWIDBlock}
                className="w-full py-2.5 px-3 bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/20 hover:border-yellow-500/35 text-yellow-400 rounded-xl text-[10.5px] font-bold uppercase transition flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="text-left font-sans">HWID Registry Block</span>
              </button>

              <button
                onClick={handleSimulateKeyExpire}
                className="w-full py-2.5 px-3 bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 hover:border-sky-500/35 text-sky-400 rounded-xl text-[10.5px] font-bold uppercase transition flex items-center gap-2"
              >
                <Key className="w-4 h-4 shrink-0" />
                <span className="text-left font-sans">Verification Expired</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Log terminal output */}
        <div className="lg:col-span-3 bg-[#05030e]/98 border border-[#1b0d35]/70 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px] max-h-[500px]">
          {/* Top terminal headers */}
          <div className="flex justify-between items-center pb-3 border-b border-white/[0.04] mb-3 select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">SSH Connection Terminal Node: root@rainbow-panel</span>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-white/[0.03] select-none text-[8.5px] font-black uppercase">
              {(['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] as const).map(f => {
                const isActive = activeLevelFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveLevelFilter(f)}
                    className={`px-2 py-1 rounded transition-colors ${
                      isActive ? 'bg-purple-950 text-purple-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Console logs output */}
          <div className="flex-1 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-purple-950/50 pr-2 space-y-3 font-mono text-xs select-text">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 font-semibold gap-2 py-12">
                <FileText className="w-8 h-8 opacity-40 text-purple-400" />
                <div>
                  No system error events logged.
                  <span className="block text-[10px] text-slate-700 mt-1 uppercase">Click on simulator triggers to populate log traces</span>
                </div>
              </div>
            ) : (
              filteredLogs.map(log => {
                const isError = log.level === 'ERROR' || log.level === 'CRITICAL';
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border transition-all duration-200 ${
                      log.level === 'CRITICAL'
                        ? 'bg-red-950/20 border-red-500/20 text-red-300 hover:border-red-500/35'
                        : log.level === 'ERROR'
                        ? 'bg-pink-950/20 border-pink-500/15 text-pink-300 hover:border-pink-500/30'
                        : log.level === 'WARNING'
                        ? 'bg-yellow-950/15 border-yellow-500/15 text-yellow-300 hover:border-yellow-500/30'
                        : 'bg-slate-950/50 border-slate-900 text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-[10.5px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase tracking-wide ${
                          log.level === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                          log.level === 'ERROR' ? 'bg-pink-500/10 text-pink-400' :
                          log.level === 'WARNING' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-500 text-[9px]">{log.timestamp}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black">{log.category}</span>
                      </div>
                      
                      {/* Action buttons inside each log trace */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => copyLogText(log)}
                          title="Copy Event Trace"
                          className="p-1 hover:bg-white/5 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {copiedIndex === log.id ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 font-bold leading-relaxed">{log.message}</div>
                    {log.details && (
                      <div className="mt-1 pb-1 text-[11px] text-slate-400/90 whitespace-pre-line selection:bg-purple-900/30 leading-normal select-all font-mono">
                        {log.details}
                      </div>
                    )}
                    {log.solution && (
                      <div className="mt-2 pt-2 border-t border-white/[0.03]/50 text-[11px] text-emerald-400 font-semibold leading-normal">
                        {log.solution}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom terminal controls */}
          <div className="flex justify-between items-center pt-3 border-t border-white/[0.04] text-[10.5px] font-sans text-slate-400 select-none">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Server className="w-3.5 h-3.5 text-slate-600" />
              <span>Events: <strong className="font-mono text-slate-400">{filteredLogs.length} traced log blocks</strong></span>
            </div>

            <div className="flex gap-2">
              {logs.length > 0 && (
                <>
                  <button
                    onClick={copyAllLogs}
                    className="px-3 py-1.5 bg-[#0f0c24] hover:bg-white/[0.03] border border-white/[0.05] text-slate-300 hover:text-white rounded-lg transition duration-200 uppercase font-black tracking-wider text-[9px] flex items-center gap-1"
                  >
                    {copiedAll ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAll ? 'Copied' : 'Copy stream'}</span>
                  </button>

                  <button
                    onClick={downloadLogFile}
                    className="px-3 py-1.5 bg-[#0f0c24] hover:bg-white/[0.03] border border-white/[0.05] text-slate-300 hover:text-white rounded-lg transition duration-200 uppercase font-black tracking-wider text-[9px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export log</span>
                  </button>

                  <button
                    onClick={clearAllLogs}
                    className="px-3 py-1.5 bg-red-950/15 hover:bg-red-950/25 border border-red-900/20 text-red-400 rounded-lg transition duration-200 uppercase font-black tracking-wider text-[9px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
