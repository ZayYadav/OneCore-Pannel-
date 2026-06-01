import React, { useState } from 'react';
import { Code, Terminal, Play, Check, Copy, HelpCircle, Layers, ShieldCheck, Heart } from 'lucide-react';

interface ApiIntegrationHubProps {
  settings?: {
    siteName: string;
    brandName: string;
  };
}

export default function ApiIntegrationHub({ settings }: ApiIntegrationHubProps) {
  const [activeLang, setActiveLang] = useState<'cpp' | 'curl' | 'python' | 'java'>('cpp');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSimResponse, setActiveSimResponse] = useState<'success' | 'hwid_err' | 'expired_err' | 'blocked_err'>('success');
  const [copiedSimJson, setCopiedSimJson] = useState(false);

  const brandName = settings?.brandName || 'OneBox';
  const brandLower = brandName.toLowerCase();
  const apiHostUrl = `https://${brandLower}-gate.rainbow.pro/api/v1`;

  const cppCode = `// ${brandName} Panel BGMI Security Integration - C++ / ImGui Injector
#include <iostream>
#include <string>
#include <wininet.h>
#pragma comment(lib, "wininet.lib")

std::string GetHardwareID() {
    // Basic unique device HWID collector
    HW_PROFILE_INFO hwProfileInfo;
    if (GetCurrentHwProfile(&hwProfileInfo)) {
        return std::string(hwProfileInfo.szHwProfileGuid);
    }
    return "UNKNOWN_DEVICE_NODES_99";
}

bool VerifyBgmiLicense(const std::string& licenseKey) {
    HINTERNET hSession = InternetOpenA("${brandName}BGMI", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (!hSession) return false;

    std::string hwid = GetHardwareID();
    std::string url = "${apiHostUrl}/verify?key=" + licenseKey + "&hwid=" + hwid + "&game=BGMI";

    HINTERNET hConnect = InternetOpenUrlA(hSession, url.c_str(), NULL, 0, INTERNET_FLAG_RELOAD, 0);
    if (!hConnect) {
        InternetCloseHandle(hSession);
        return false;
    }

    char buffer[2048];
    DWORD bytesRead = 0;
    std::string responseJson = "";

    while (InternetReadFile(hConnect, buffer, sizeof(buffer) - 1, &bytesRead) && bytesRead > 0) {
        buffer[bytesRead] = '\\0';
        responseJson += buffer;
    }

    InternetCloseHandle(hConnect);
    InternetCloseHandle(hSession);

    // Simple JSON parse check for status success
    if (responseJson.find("\\"status\\": \\"success\\"") != std::string::npos) {
        std::cout << "[${brandName} Security] Verification Active! Launching BGMI Cheat Menu...\\n";
        return true;
    } else {
        std::cout << "[${brandName} Security] Handshake Error: " << responseJson << "\\n";
        return false;
    }
}`;

  const curlCode = `# Authenticate key and hardware fingerprint instantly
curl -X POST "${apiHostUrl}/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "license_key": "VIP- ravi_owner_XXXXXX",
    "hwid": "DEV-8899-EBBB-1122",
    "game": "BGMI"
  }'`;

  const pythonCode = `# ${brandName} Panel Bot or Server-Side validation script
import requests
import hashlib
import platform

def get_device_guid():
    # Gather device properties for high-precision hashing
    device_str = f"{platform.node()}-{platform.processor()}-{platform.machine()}"
    return hashlib.sha256(device_str.encode()).hexdigest()[:24].upper()

def check_license(key: str):
    payload = {
        "license_key": key,
        "hwid": get_device_guid(),
        "game": "BGMI"
    }
    try:
        response = requests.post("${apiHostUrl}/verify", json=payload, timeout=5)
        res_data = response.json()
        if res_data.get("status") == "success":
            print(f"✔️ Key verified successfully! Expiring on: {res_data.get('expiry_date')}")
            return True
        else:
            print(f"❌ Error: {res_data.get('message')}")
            return False
    except Exception as e:
        print(f"⚠️ Gateway Server connection failed: {e}")
        return False`;

  const javaCode = `// Android Native JNI / Cheat Overlay Service
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

public class ${brandName}BGMIAuthenticator {
    public static boolean checkLicenseStatus(String key, String androidDeviceID) {
        try {
            URL url = new URL("${apiHostUrl}/verify");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String requestBody = "{\\"license_key\\":\\"" + key + "\\", \\"hwid\\":\\"" + androidDeviceID + "\\", \\"game\\":\\"BGMI\\"}";

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = requestBody.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            if (code == 200) {
                Scanner scanner = new Scanner(conn.getInputStream());
                String response = scanner.useDelimiter("\\\\A").next();
                scanner.close();

                if (response.contains("\\"status\\":\\"" + "success" + "\\"")) {
                    // Inject mods safely
                    return true;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}`;

  const simResponses = {
    success: {
      status: "success",
      message: "License key authenticated successfully",
      game: "BGMI",
      duration_granted: "24_HOURS",
      expiry_date: "2026-06-02 18:00:00 UTC",
      time_remaining_seconds: 86400,
      hwid_bound: "DEV-8899-EBBB-1122",
      security_level: "TLS_1.3_STRICT_ENFORCED",
      cheat_permissions: {
        aimbot: true,
        esp_lines: true,
        bullet_track: true,
        memory_safe: true
      }
    },
    hwid_err: {
      status: "error",
      code: "HWID_MISMATCH",
      message: `Security breach: This license key is already bound to a different hardware ID. Contact owner_ravi to reset HWID.`,
      system_guidelines: `Please tap 'Reset HWID' button in your Reseller ${brandName} portal dashboard to unlock current bindings.`
    },
    expired_err: {
      status: "error",
      code: "LICENSE_EXPIRED",
      message: "Access Denied: The requested VIP license code (VIP- ravi_owner_XXXXXX) expired on 2026-05-31.",
      renewal_portal: `https://ais-pre-zzzlpvayoxsvkqeregsxfr-470491496334.asia-southeast1.run.app`
    },
    blocked_err: {
      status: "error",
      code: "LICENSE_BLOCKED",
      message: "Critical: This key has been blacklisted of chargebacks or toxic reseller behavior.",
      security_level: "FORCE_TERMINATION_SIGNAL"
    }
  };

  const getActiveCode = () => {
    switch (activeLang) {
      case 'cpp': return cppCode;
      case 'curl': return curlCode;
      case 'python': return pythonCode;
      case 'java': return javaCode;
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyResponseToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(simResponses[activeSimResponse], null, 2));
    setCopiedSimJson(true);
    setTimeout(() => setCopiedSimJson(false), 2000);
  };

  return (
    <div id="api-integration-hub" className="space-y-6 font-sans">
      
      {/* Title & Introduction banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-slate-950 border border-purple-500/10 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            BGMI Integration Gateway API
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Learn how to hook {brandName} License Codes directly into your C++ Injector, ImGui Mod Menu, Android JNI, or external cheat overlays. Rest assured, everything is engineered server-side to guarantee client key security.
          </p>
        </div>
        
        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-bold uppercase rounded-lg tracking-wider">
          REST API v1.2 Secure Gateway
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* PANEL A: Code snippet Selector */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0ea5e9]" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Cheat / menu Integration Code</h3>
            </div>
            
            <button
              onClick={copyCodeToClipboard}
              className="text-slate-400 hover:text-white bg-[#100c1e] hover:bg-[#1a1435] border border-white/[0.03] px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1.5 active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          {/* Languages Selector Row */}
          <div className="px-4 py-2.5 bg-[#0a0614]/80 border-b border-slate-800/60 flex flex-wrap gap-1.5 text-[11px] font-bold">
            <button
              onClick={() => setActiveLang('cpp')}
              className={`px-3 py-1.5 rounded-lg transition ${activeLang === 'cpp' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
            >
              C++ (ImGui Menu / Injector)
            </button>
            <button
              onClick={() => setActiveLang('java')}
              className={`px-3 py-1.5 rounded-lg transition ${activeLang === 'java' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
            >
              Java (Android Mod App)
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1.5 rounded-lg transition ${activeLang === 'python' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
            >
              Python (Automation Bot)
            </button>
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1.5 rounded-lg transition ${activeLang === 'curl' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
            >
              HTTP Curl
            </button>
          </div>

          {/* Code Viewer Box */}
          <div className="p-4 bg-slate-950 overflow-x-auto border-b border-slate-800/40">
            <pre className="text-[10px] font-mono text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto selection:bg-purple-900/30 selection:text-purple-300">
              <code>{getActiveCode()}</code>
            </pre>
          </div>

          {/* Quick Info Footer */}
          <div className="p-4 bg-slate-950/40 text-[10px] text-slate-500 space-y-2">
            <div className="flex items-start gap-1.5">
              <span className="text-[#0ea5e9]">ℹ️</span>
              <p>
                <strong>Security Guard Note:</strong> Always obfuscate your production C++ client strings before compiling to prevent memory tracing or key bypass cracks. Protect your cheat endpoints securely!
              </p>
            </div>
          </div>
        </div>

        {/* PANEL B: Live API Response Viewer */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">API Response json structure</h3>
            </div>
            
            <button
              onClick={copyResponseToClipboard}
              className="text-slate-400 hover:text-white bg-[#100c1e] hover:bg-[#1a1435] border border-white/[0.03] px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1.5 active:scale-95"
            >
              {copiedSimJson ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSimJson ? "Copied!" : "Copy JSON"}</span>
            </button>
          </div>

          {/* Simulator response status switcher */}
          <div className="px-4 py-2.5 bg-[#0a0614]/80 border-b border-slate-800/60 flex flex-wrap gap-1.5 text-[10px] font-mono font-bold">
            <button
              onClick={() => setActiveSimResponse('success')}
              className={`px-3 py-1.5 rounded-lg border transition ${activeSimResponse === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              🟢 200 OK (Success)
            </button>
            <button
              onClick={() => setActiveSimResponse('hwid_err')}
              className={`px-3 py-1.5 rounded-lg border transition ${activeSimResponse === 'hwid_err' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              🟡 403 (HWID Mismatch)
            </button>
            <button
              onClick={() => setActiveSimResponse('expired_err')}
              className={`px-3 py-1.5 rounded-lg border transition ${activeSimResponse === 'expired_err' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              🔴 410 (Key Expired)
            </button>
            <button
              onClick={() => setActiveSimResponse('blocked_err')}
              className={`px-3 py-1.5 rounded-lg border transition ${activeSimResponse === 'blocked_err' ? 'bg-rose-500/15 text-rose-500 border-rose-500/20' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              🔥 401 (Key Blocked)
            </button>
          </div>

          {/* JSON Display Screen */}
          <div className="p-4 bg-slate-950 flex-1 overflow-x-auto min-h-[300px]">
            <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed selection:bg-emerald-950 selection:text-emerald-300">
              <code>{JSON.stringify(simResponses[activeSimResponse], null, 2)}</code>
            </pre>
          </div>

          {/* Explanation Banner */}
          <div className="p-4 bg-slate-950/40 text-[10px] border-t border-slate-800/40 text-slate-400 space-y-1.5 font-sans">
            <h4 className="font-bold text-slate-300 uppercase text-[9px] tracking-wider">How to interpret response:</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 font-sans">
              <li>
                Check the top-level <code className="text-emerald-500 font-mono">status == "success"</code> element before granting mod cheat menu access.
              </li>
              <li>
                In case of <code className="text-red-400 font-mono">HWID_MISMATCH</code>, stop user access and notify them to contact your resellers for safe reset triggers.
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions FAQ footer board */}
      <div className="p-6 bg-[#080512]/90 border border-slate-800/40 rounded-2xl shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          API Integration Frequently Asked Questions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3 bg-slate-900/40 border border-white/[0.01] rounded-xl">
            <h4 className="font-bold text-slate-300">Q: How can we bind or lock HWID?</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              When a customer triggers your program for the first time, your cheat program extracts their signature and sends it as the <code className="text-slate-400">hwid</code> param. If the panel database column is null, {brandName} registers and locks that hardware ID instantly to their key!
            </p>
          </div>
          
          <div className="space-y-1 p-3 bg-slate-900/40 border border-white/[0.01] rounded-xl">
            <h4 className="font-bold text-slate-300">Q: Can resellers trigger HWID Reset?</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Yes, absolutely! Within their "Keys" panel segment, as a reseller or admin, they can press the "Reset HWID" button to instantly wipe the current device signature, allowing the customer to register on a new phone.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
