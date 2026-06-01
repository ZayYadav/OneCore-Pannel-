<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Models\LicenseModel;
use App\Models\ActivationModel;
use App\Models\ApiLogModel;
use App\Models\SecurityLogModel;

class Api extends ResourceController
{
    protected $format = 'json';
    protected $userModel;
    protected $licenseModel;
    protected $activationModel;
    protected $apiLogModel;
    protected $securityLogModel;

    public function __construct()
    {
        $this->checkAntiCloneProtection();
        $this->userModel = new UserModel();
        $this->licenseModel = new LicenseModel();
        $this->activationModel = new ActivationModel();
        $this->apiLogModel = new ApiLogModel();
        $this->securityLogModel = new SecurityLogModel();
    }

    /**
     * ANTI-CLONE & DOMAIN-LOCK PROTECTION SHIELD
     * Automatically locks this entire backend service to your registered target domain name.
     * Prevents copying, cloning, or migrating the panel code to unauthorized hosting environments.
     */
    private function checkAntiCloneProtection()
    {
        // 1. Get the configured app baseURL from CodeIgniter config
        $appConfig = config('App');
        $configuredUrl = $appConfig->baseURL ?? '';
        
        // 2. Extract domain from the app baseURL
        $configuredHost = parse_url($configuredUrl, PHP_URL_HOST);
        if (empty($configuredHost)) {
            // Fallback if parsing fails
            $configuredHost = str_ireplace(['https://', 'http://'], '', $configuredUrl);
            $configuredHost = explode('/', $configuredHost)[0];
        }
        
        // 3. Get currently requested server host name
        $currentHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
        
        // Remove port number if any
        $currentHost = explode(':', $currentHost)[0];
        $configuredHost = explode(':', $configuredHost)[0];
        
        $currentClean = strtolower(trim($currentHost));
        $configuredClean = strtolower(trim($configuredHost));
        
        // 4. Bypass list for testing/local migration environments
        $bypassDomains = [
            'localhost',
            '127.0.0.1',
            '::1',
            '.run.app', // AI Studio Dev Preview environments
            'localhost:3000',
            'localhost:8080'
        ];
        
        $isBypassed = false;
        foreach ($bypassDomains as $domain) {
            if (empty($currentClean) || stripos($currentClean, $domain) !== false) {
                $isBypassed = true;
                break;
            }
        }
        
        // 5. If it is not bypassed, and the domain does not match, trigger absolute security lockdown!
        if (!$isBypassed && !empty($configuredClean) && $configuredClean !== 'placeholder_your_domain.com' && $currentClean !== $configuredClean) {
            $this->logToFile('SECURITY_ALERT', '🛡️ Clone Blocked: Unauthorized domain access attempted.', [
                'visited_domain' => $currentClean,
                'locked_domain' => $configuredClean
            ]);
            
            header('Content-Type: application/json; charset=UTF-8');
            header('Access-Control-Allow-Origin: *');
            http_response_code(403);
            
            echo json_encode([
                'status' => 'error',
                'error' => 'SOURCE_REPLACEMENT_DETECTED',
                'security_lockout' => true,
                'message' => '🛡️ Secure Anti-Clone Core: Unauthorized panel source domain detected! This panel source code is locked to its registered baseURL: ' . $configuredClean,
                'signature_verification_fail' => hash('sha256', $currentClean . '_unauthorized_clone_lockout_sign'),
                'developer_notice' => 'To run this code on this domain, configure your authorized domain inside the primary settings or .env config file.'
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    /**
     * CUSTOM EASY-TO-READ DEBUG LOGGER
     * Writes direct human-friendly trace logs to writable/logs/vip_panel_debug.log
     * so cPanel users can monitor database issues, active bypasses, and security alerts.
     */
    private function logToFile($status, $message, $extra = [])
    {
        try {
            $logDir = WRITEPATH . 'logs/';
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            $logFile = $logDir . 'vip_panel_debug.log';
            $timestamp = date('Y-m-d H:i:s');
            $ip = $this->request->getIPAddress();
            $userAgent = $this->request->getUserAgent()->getAgentString();
            $extraString = !empty($extra) ? ' | Details: ' . json_encode($extra, JSON_UNESCAPED_SLASHES) : '';
            $logLine = "[{$timestamp}] [IP: {$ip}] [AGENT: {$userAgent}] [{$status}] {$message}{$extraString}" . PHP_EOL;
            file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
        } catch (\Exception $e) {
            // Fail-safe to avoid blocking operation if log files are non-writable
        }
    }

    /**
     * API Log Tracker Helper
     */
    private function logRequest($user_id, $endpoint, $method, $payload, $response_code)
    {
        $ip = $this->request->getIPAddress();
        $agent = $this->request->getUserAgent()->getAgentString();
        $this->apiLogModel->insert([
            'user_id' => $user_id,
            'endpoint' => $endpoint,
            'request_method' => $method,
            'request_payload' => json_encode($payload),
            'response_code' => $response_code,
            'ip_address' => $ip,
            'user_agent' => $agent,
            'processed_in_ms' => mt_rand(4, 15) // Simulated execution speed
        ]);
    }

    /**
     * POST /api/login
     */
    public function login()
    {
        $rules = [
            'username' => 'required|min_length[3]',
            'password' => 'required',
            'device_id' => 'required'
        ];

        if (!$this->validate($rules)) {
            $this->logRequest(null, 'login', 'POST', $this->request->getPost(), 400);
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $username = $this->request->getVar('username');
        $password = $this->request->getVar('password');
        $deviceId = $this->request->getVar('device_id');

        $user = $this->userModel->where('username', $username)->first();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->logToFile('LOGIN_FAILED', "Authentication failed for user: {$username}");
            $this->securityLogModel->insert([
                'user_id' => $user ? $user['id'] : null,
                'action' => 'Invalid credentials login attempt via API',
                'category' => 'authentication',
                'ip_address' => $this->request->getIPAddress(),
                'user_agent' => $this->request->getUserAgent()->getAgentString(),
                'status' => 'failed'
            ]);
            $this->logRequest(null, 'login', 'POST', ['username' => $username], 401);
            return $this->failUnauthorized('Invalid username or password.');
        }

        if ($user['status'] !== 'active') {
            $this->logToFile('LOGIN_SUSPENDED', "Suspended account login attempt: {$username}");
            $this->logRequest($user['id'], 'login', 'POST', ['username' => $username], 403);
            return $this->failForbidden('Account is suspended or banned.');
        }

        // Binds device ID if not already matched/configured
        if (empty($user['device_id'])) {
            $this->userModel->update($user['id'], ['device_id' => $deviceId]);
            $this->logToFile('HWID_BIND', "Bound device ID dynamically to user {$username}: {$deviceId}");
        } elseif ($user['device_id'] !== $deviceId) {
            $this->logToFile('HWID_MISMATCH', "HWID verification mismatch for user {$username}. Got: {$deviceId}, Expected: {$user['device_id']}");
            $this->securityLogModel->insert([
                'user_id' => $user['id'],
                'action' => "HWID Lock Blocked API Login for device {$deviceId}",
                'category' => 'security',
                'ip_address' => $this->request->getIPAddress(),
                'status' => 'failed'
            ]);
            return $this->failForbidden('Device ID HWID mismatch. Reset lock requested.');
        }

        // Generate mock standard JWT Token (In real app, integrate Firebase/JWT)
        $token = bin2hex(random_bytes(32));
        $this->logToFile('LOGIN_SUCCESS', "User logged in successfully: {$username}");
        
        $this->userModel->update($user['id'], [
            'last_login_at' => date('Y-m-d H:i:s'),
            'last_login_ip' => $this->request->getIPAddress()
        ]);

        $response = [
            'status' => 'success',
            'message' => 'Authenticated successfully.',
            'access_token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'balance' => $user['balance'],
                'role' => $user['role_id']
            ]
        ];

        $this->logRequest($user['id'], 'login', 'POST', ['username' => $username], 200);
        return $this->respond($response);
    }

    /**
     * POST /api/register
     */
    public function register()
    {
        $rules = [
            'username' => 'required|min_length[3]|is_unique[users.username]',
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]',
            'device_id' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $userId = $this->userModel->insert([
            'username' => $this->request->getVar('username'),
            'email' => $this->request->getVar('email'),
            'password_hash' => password_hash($this->request->getVar('password'), PASSWORD_BCRYPT),
            'device_id' => $this->request->getVar('device_id'),
            'role_id' => 4, // Default User
            'balance' => 0.00,
            'status' => 'active'
        ]);

        $response = [
            'status' => 'success',
            'message' => 'User registered successfully through REST API.',
            'user_id' => $userId
        ];

        $this->logRequest($userId, 'register', 'POST', ['user' => $this->request->getVar('username')], 201);
        return $this->respondCreated($response);
    }

    /**
     * POST /api/key/activate
     */
    public function activateKey()
    {
        $rules = [
            'key_string' => 'required',
            'device_id' => 'required',
            'user_id' => 'required|integer'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $keyString = $this->request->getVar('key_string');
        $deviceId = $this->request->getVar('device_id');
        $userId = $this->request->getVar('user_id');

        $license = $this->licenseModel->where('key_string', $keyString)->first();

        if (!$license) {
            return $this->failNotFound('License VIP key code not found.');
        }

        if ($license['status'] === 'suspended') {
            return $this->failForbidden('This license key code has been suspended.');
        }

        if ($license['status'] === 'expired' || ($license['expires_at'] && strtotime($license['expires_at']) < time())) {
            $this->licenseModel->update($license['id'], ['status' => 'expired']);
            return $this->failForbidden('This VIP license has already expired.');
        }

        // Handle unused license activations
        if ($license['status'] === 'inactive') {
            $days = 0;
            switch ($license['duration_type']) {
                case '1_day': $days = 1; break;
                case '7_days': $days = 7; break;
                case '15_days': $days = 15; break;
                case '30_days': $days = 30; break;
                case '90_days': $days = 90; break;
                case 'custom': $days = (int)$license['custom_days']; break;
            }

            $expiresAt = ($license['duration_type'] === 'lifetime') ? null : date('Y-m-d H:i:s', strtotime("+{$days} days"));
            
            $this->licenseModel->update($license['id'], [
                'status' => 'active',
                'expires_at' => $expiresAt
            ]);
            $license['status'] = 'active';
            $license['expires_at'] = $expiresAt;
        }

        // Add device HWID registration lock entry
        $existing = $this->activationModel->where('license_id', $license['id'])->where('hardware_id', $deviceId)->first();
        if (!$existing) {
            if ($license['used_devices_count'] >= $license['device_limit']) {
                return $this->failForbidden('Device activation limit reached for this VIP license.');
            }

            $this->activationModel->insert([
                'license_id' => $license['id'],
                'user_id' => $userId,
                'hardware_id' => $deviceId,
                'ip_address' => $this->request->getIPAddress()
            ]);

            $this->licenseModel->update($license['id'], [
                'used_devices_count' => $license['used_devices_count'] + 1
            ]);
        }

        $response = [
            'status' => 'success',
            'message' => 'License VIP key activated and device HWID locked successfully.',
            'license_key' => $keyString,
            'duration' => $license['duration_type'],
            'expires_at' => $license['expires_at'] ?: 'N/A (Lifetime)',
            'hwid_locked' => $deviceId
        ];

        $this->logRequest($userId, 'key/activate', 'POST', ['license' => $keyString], 200);
        return $this->respond($response);
    }

    /**
     * POST /api/key/verify
     */
    public function verifyKey()
    {
        $rules = [
            'key_string' => 'required',
            'device_id' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $keyString = $this->request->getVar('key_string');
        $deviceId = $this->request->getVar('device_id');

        $license = $this->licenseModel->where('key_string', $keyString)->first();

        if (!$license) {
            $this->logToFile('VERIFY_FAILED', "License check failed: Key not found: {$keyString}", ['device_id' => $deviceId]);
            return $this->failNotFound('Invalid license key.');
        }

        if ($license['status'] !== 'active') {
            $this->logToFile('VERIFY_BLOCKED', "Blocked check for inactive key: {$keyString}. Status: {$license['status']}");
            return $this->failForbidden("License status is: {$license['status']}. Access denied.");
        }

        if ($license['expires_at'] && strtotime($license['expires_at']) < time()) {
            $this->licenseModel->update($license['id'], ['status' => 'expired']);
            $this->logToFile('VERIFY_EXPIRED', "License key automatically expired on check: {$keyString}");
            return $this->failForbidden('License key has expired.');
        }

        // Verify Device Lock (Strict security matching)
        $activation = $this->activationModel->where('license_id', $license['id'])->where('hardware_id', $deviceId)->first();
        if (!$activation) {
            $this->logToFile('HWID_SECURITY_ALERT', "HWID bypass attempt blocked for Key: {$keyString}. Device: {$deviceId}");
            $this->securityLogModel->insert([
                'user_id' => null,
                'action' => "Unauthorized HWID lock verification attempt code: {$keyString}",
                'category' => 'security',
                'ip_address' => $this->request->getIPAddress(),
                'status' => 'failed'
            ]);
            return $this->failForbidden('Device HWID does not match registered license lock.');
        }

        // Generate advanced cryptographically verified signature using HMAC-SHA256.
        // This seals the key parameters with the server's private JWT_SECRET_KEY.
        // Even if custom tools (like HTTP Canary or Packet Filters) try to intercept and modify
        // 'verified' to true or edit the response in memory (Game Guardian), the corresponding client
        // signature check will fail immediately as they cannot replicate the secret server signature key.
        $secret = env('JWT_SECRET_KEY', 'SUPER_SECURE_RAINBOW_NEON_SECRET_UUID_STRING');
        $payloadToSign = $keyString . '|' . ($license['expires_at'] ?: 'lifetime') . '|' . $deviceId . '|active';
        $antiTamperSignature = hash_hmac('sha256', $payloadToSign, $secret);

        $this->logToFile('VERIFY_SUCCESS', "API Key verification passed: {$keyString} for Device: {$deviceId}");

        $response = [
            'status' => 'success',
            'verified' => true,
            'license_info' => [
                'key' => $keyString,
                'expires_at' => $license['expires_at'] ?: 'N/A (Lifetime)',
                'device_limit' => $license['device_limit'],
                'activated_devices' => $license['used_devices_count']
            ],
            'security_checksum' => $antiTamperSignature,
            'timestamp' => time()
        ];

        $this->logRequest(null, 'key/verify', 'POST', ['key' => $keyString], 200);
        return $this->respond($response);
    }

    /**
     * POST /api/device/reset
     */
    public function resetDevice()
    {
        $rules = [
            'key_string' => 'required',
            'username' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $keyString = $this->request->getVar('key_string');
        $username = $this->request->getVar('username');

        $user = $this->userModel->where('username', $username)->first();
        $license = $this->licenseModel->where('key_string', $keyString)->first();

        if (!$user || !$license) {
            return $this->failNotFound('Invalid username profile or license key string.');
        }

        // Reset device binds (Delete all activations corresponding to key)
        $this->activationModel->where('license_id', $license['id'])->delete();
        $this->licenseModel->update($license['id'], ['used_devices_count' => 0]);

        $this->securityLogModel->insert([
            'user_id' => $user['id'],
            'action' => "HWID binds reset successfully for license {$keyString}",
            'category' => 'key_management',
            'ip_address' => $this->request->getIPAddress(),
            'status' => 'success'
        ]);

        return $this->respond([
            'status' => 'success',
            'message' => 'All lock binds reset. License HWID limit restored to 0.'
        ]);
    }
}
