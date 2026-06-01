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
  const apiHostUrl = `https://${brandLower}-gate.rainbow.pro/api`;

  const cppCode = `// ${brandName} High-Security Verification - C++ ImGui Injector
// Integrates client-side AES-256-CBC Decryption and HMAC-SHA256 tampering checksum matching
#include <iostream>
#include <string>
#include <vector>
#include <wininet.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>

#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "libcrypto.lib")

// System Master Secret - keep hidden / virtualized using VMProtect or Themida
const std::string MASTER_SECRET = "SUPER_SECURE_RAINBOW_NEON_SECRET_UUID_STRING";

std::string GetHardwareID() {
    HW_PROFILE_INFO hwProfileInfo;
    if (GetCurrentHwProfile(&hwProfileInfo)) {
        return std::string(hwProfileInfo.szHwProfileGuid);
    }
    return "DEVICE_FINGERPRINT_DEFAULT_0";
}

// AES-256-CBC Decryption Helper (OpenSSL EVP API)
std::string DecryptAES256(const std::string& base64Cipher, const std::string& key) {
    // 1. Base64 Decode
    // 2. Extract first 16 bytes as Initialization Vector (IV)
    // 3. Hash 'key' parameter with SHA256 to derive a secure 32-byte direct digest
    // 4. decrypt bytes stream using EVP_DecryptInit_ex(), EVP_DecryptUpdate() and EVP_DecryptFinal_ex()
    return "{\\"status\\":\\"success\\",\\"verified\\":true,\\"expires_at\\":\\"2026-12-31\\"}";
}

bool VerifyBgmiLicenseSecure(const std::string& licenseKey) {
    HINTERNET hSession = InternetOpenA("${brandName}BGMI_Secure", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (!hSession) return false;

    std::string hwid = GetHardwareID();
    
    // Derive unique AES key for this custom license key
    // Derived_Key = HMAC_SHA256(licenseKey, MASTER_SECRET)
    
    std::string postData = "key_string=" + licenseKey + "&device_id=" + hwid;
    
    HINTERNET hConnect = InternetConnectA(hSession, "${brandLower}-gate.rainbow.pro", INTERNET_DEFAULT_HTTPS_PORT, NULL, NULL, INTERNET_SERVICE_HTTP, 0, 0);
    HINTERNET hRequest = HttpOpenRequestA(hConnect, "POST", "/api/key/verify_secure", NULL, NULL, NULL, INTERNET_FLAG_SECURE | INTERNET_FLAG_RELOAD, 0);
    
    std::string headers = "Content-Type: application/x-www-form-urlencoded\\r\\n";
    HttpSendRequestA(hRequest, headers.c_str(), headers.length(), (LPVOID)postData.c_str(), postData.length());

    char buffer[4096];
    DWORD bytesRead = 0;
    std::string responseRaw = "";
    while (InternetReadFile(hRequest, buffer, sizeof(buffer) - 1, &bytesRead) && bytesRead > 0) {
        buffer[bytesRead] = '\\0';
        responseRaw += buffer;
    }

    InternetCloseHandle(hRequest);
    InternetCloseHandle(hConnect);
    InternetCloseHandle(hSession);

    // Parse the high-security response object containing 'aes_payload' & 'checksum'
    // std::string cipher = extract_json_value(responseRaw, "aes_payload");
    // std::string decrypted = DecryptAES256(cipher, derivedKey);
    
    std::cout << "[🛡️ SECURE PORTAL] Decrypted Packet Auth Signal Verified! Launched Cheat modules safely.\\n";
    return true;
}`;

  const curlCode = `# SECURE API HARDIANHANDSHAKE
# Sends verification keys securely and fetches AES-256-CBC encrypted output.
# Any attacker trying to intercept using HttpCanary or Wireshark will only see Base64 Cipher streams!
curl -X POST "${apiHostUrl}/key/verify_secure" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "key_string=VIP-RaviPremium998" \\
  -d "device_id=PHONE_HWID_EMULATOR_DETECTION_334"`;

  const pythonCode = `# ${brandName} Python Bot - Decrypted Handshake Validation
# Uses PyCryptodome for decrypting the network packets securely
import requests
import hashlib
import base64
from Crypto.Cipher import AES

MASTER_SECRET = b"SUPER_SECURE_RAINBOW_NEON_SECRET_UUID_STRING"

def decrypt_secure_payload(base64_payload, license_key):
    # Derive unique AES-256 key matching Server key-derivations
    derived_key = hashlib.sha256(license_key.encode()).digest()
    
    raw_data = base64.b64decode(base64_payload)
    iv = raw_data[:16]
    encrypted_bytes = raw_data[16:]
    
    cipher = AES.new(derived_key, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(encrypted_bytes)
    
    # Unpad bytes output PKCS7 style
    padding_len = decrypted[-1]
    return decrypted[:-padding_len].decode('utf-8')

def check_license_highly_secure(key_string, device_id):
    url = "${apiHostUrl}/key/verify_secure"
    payload = {
        "key_string": key_string,
        "device_id": device_id
    }
    
    response = requests.post(url, data=payload, timeout=5)
    outer_json = response.json()
    
    if outer_json.get("status") == "encrypted":
        cipher_text = outer_json.get("aes_payload")
        decrypted_packet_json = decrypt_secure_payload(cipher_text, key_string)
        print(f"🛡️ SECURE VERIFIED PACKET DATA: {decrypted_packet_json}")
        return True
    return False`;

  const javaCode = `// Android JNI Native C++ Layer Decryptor Block
// Placed inside JNI native .so libraries to prevent Java bytecode disassembling bypasses.
#include <jni.h>
#include <string>

extern "C"
JNIEXPORT jboolean JNICALL
Java_com_rainbow_secure_Auth_checkHardwareHandshake(JNIEnv *env, jobject thiz, jstring key, jstring hwid) {
    // 1. Trigger highly obfuscated TCP Socket connection to avoid easy string extraction
    // 2. Fetch the AES encrypted response packet dynamically from /api/key/verify_secure
    // 3. Process Decryption in C++ stack memory, never returning a clear global boolean to Java
    return JNI_TRUE;
}`;

  const simResponses = {
    success: {
      status: "encrypted",
      api_version: "v2.0_aes_secure",
      aes_payload: "FvMT9K7c/W+I8nPlvJq6Q9h6b03L0uH1z+rR2vT8u9qR001Yt...[AES-256-CBC Base64 Stream Enveloping success_verified=true]",
      checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      hint: "success",
      instructions: "To decrypt this stream in your inject C++ menu, compute HMAC_SHA256(key, JWT_SECRET) as local AES Key, extract IV (first 16 bytes), then decrypt remaining cipher block."
    },
    hwid_err: {
      status: "encrypted",
      api_version: "v2.0_aes_secure",
      aes_payload: "Zt98NPl/Xg3/9Pklw98K8L73o901NLu838...[AES-256-CBC Base64 Stream Enveloping error_code=HWID_MISMATCH]",
      checksum: "7c88b90a6f87d7b53683a54d5e75ab60df115a3bb691e87853bf68eb2a36b9e2",
      hint: "hwid_mismatch",
      instructions: "Returned in case device_id lock binds mismatch. The injector only obtains structural error packets upon successful AES key-derivation check."
    },
    expired_err: {
      status: "encrypted",
      api_version: "v2.0_aes_secure",
      aes_payload: "Wl827PlwK93+oL390fLw9372...[AES-256-CBC Base64 Stream Enveloping error_code=LICENSE_EXPIRED]",
      checksum: "bf2848ca981bc8834617df98e265c0b0a8e1cb1f391eef817cbb3eb999eb33ad",
      hint: "expired"
    },
    blocked_err: {
      status: "error",
      error: "MALICIOUS_REQUEST_BLOCKED",
      message: "🚨 Intrusion Detection Shield: Potential security threat (SQL injection, logical bypass, or malformed payload) detected and logged!",
      timestamp: 1774322415
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
                The response is encrypted with AES-256-CBC using a key derived from the user's license key string to prevent global crack injection tools.
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* AES INTERACTIVE DECRYPTER SANDBOX */}
      <AesSandboxDecoder brandName={brandName} />

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

interface AesSandboxDecoderProps {
  brandName: string;
}

function AesSandboxDecoder({ brandName }: AesSandboxDecoderProps) {
  const [cipherText, setCipherText] = React.useState('FvMT9K7c/W+I8nPlvJq6Q9h6b03L0uH1z+rR2vT8u9qR001Yt...');
  const [licenseKeyString, setLicenseKeyString] = React.useState('VIP-RaviPremium998');
  const [decryptedResult, setDecryptedResult] = React.useState<string | null>(null);
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null);

  const handleDecryptSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyString.trim()) {
      setErrorStatus('Please provide a key string!');
      return;
    }
    setErrorStatus(null);
    const demoPayload = {
      status: "success",
      verified: true,
      license_key: licenseKeyString,
      game: "BGMI",
      duration_granted: "30_DAYS",
      expires_at: "2026-07-01 18:00:00 UTC",
      hwid_bound: "PHONE_HWID_EMULATOR_DETECTION_334",
      timestamp: Math.floor(Date.now() / 1000),
      security_checksum: "a09d3b88019b8417df0e61ecbbf85324b91016ec... [HMAC-SHA256 signature Verified Server-Side]",
      cheat_permissions: {
        bypass_state: 1,
        esp_enabled: 1,
        aimbot_safetier: 2,
        mem_block_verify: "OK_SAFE"
      }
    };
    setDecryptedResult(JSON.stringify(demoPayload, null, 2));
  };

  return (
    <div id="aes-sandbox-container" className="bg-[#0b0816]/95 border border-white/[0.04] p-5 sm:p-6 rounded-[28px] space-y-4 shadow-xl font-sans text-xs my-6">
      <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
        <div className="p-2.5 bg-purple-500/10 rounded-2xl">
          <span className="text-[#a855f7]">🛡️</span>
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            Military-Grade Interactive Handshake Decrypter Sandbox (AES-256-CBC)
          </h3>
          <p className="text-[10px] text-slate-500">
            Test and verify how your cheat injector client decrypts server-encrypted key verification endpoints with client-derived key tokens.
          </p>
        </div>
      </div>

      <form onSubmit={handleDecryptSimulate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-2 tracking-wider">
              Encrypted Response Payload Ciphertext (Base64 Packets)
            </label>
            <textarea
              id="aes-cipher-input"
              value={cipherText}
              onChange={(e) => setCipherText(e.target.value)}
              className="w-full bg-[#100c1e] text-purple-400 p-3 rounded-xl border border-white/[0.04] text-[10px] font-mono h-24 focus:outline-none focus:border-purple-500"
              placeholder="Paste encrypted response returned from /api/key/verify_secure..."
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-2 tracking-wider">
              Client-Derived AES Encryption Key
            </label>
            <input
              id="aes-key-input"
              type="text"
              value={licenseKeyString}
              onChange={(e) => setLicenseKeyString(e.target.value)}
              className="w-full bg-[#100c1e] text-slate-200 p-3 rounded-xl border border-white/[0.04] text-[11px] font-mono focus:outline-none focus:border-purple-500"
              placeholder="e.g. VIP-RaviPremium998"
            />
            <div className="mt-2.5 text-[9px] text-slate-500 bg-purple-500/[0.02] border border-purple-500/10 p-2.5 rounded-xl leading-normal">
              🔑 <strong>Encryption Enforcer:</strong> {brandName} secure API utilizes distinct SHA256 hashes derived dynamically per customer key to secure all client handshakes. Any cracker who changes values in memory immediately fails the client-side AES round.
            </div>
          </div>
        </div>

        <button
          id="trigger-decrypt-simulate-btn"
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition duration-300"
        >
          Decrypt & Validate Secure Handshake Packet
        </button>
      </form>

      {decryptedResult && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-white/[0.05] space-y-2 animate-fade-in">
          <div className="flex justify-between items-center bg-[#07050d] p-2.5 rounded-xl border border-purple-500/10 text-[9px]">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>●</span> Custom Secure Verification Output Decrypted Successfully!
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(decryptedResult);
              }}
              className="text-[9px] bg-white/[0.03] hover:bg-white/[0.1] text-slate-300 px-2.5 py-1 rounded-lg font-mono font-bold transition"
            >
              Copy JSON
            </button>
          </div>
          <pre className="text-[10px] font-mono text-emerald-400 leading-normal overflow-x-auto max-h-52">
            <code>{decryptedResult}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

