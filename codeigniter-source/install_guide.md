# ENTERPRISE VIP LICENSE SYSTEM: DEPLOYMENT & SECURITY PLAYBOOK
### TARGET STACK: CodeIgniter 4.5+ | PHP 8.3 | MySQL 8.0 | Nginx | Ubuntu Server 24.04 LTS

This playbook outlines production-grade deployment strategies, installation directives, advanced security mitigations, and server configuration templates compiled by Senior Full-Stack Architects and Security Engineers.

---

## SECTION 1: SYSTEM ARCHITECTURE & REQUIREMENTS
1.  **PHP Engine**: PHP 8.3.x with active extensions: `php-intl`, `php-mbstring`, `php-curl`, `php-mysql`, `php-gd`, `php-gmp`.
2.  **Database Server**: MySQL 8.0.x or MariaDB 10.11+ configured with ACID conformity (InnoDB engine).
3.  **HTTP Core**: Nginx stable line or Apache 2.4.x configured with mod_rewrite enabled.
4.  **Secure Channels**: SSL/TLS 1.3 configuration with verified ECDSA certs (Let’s Encrypt / Cloudflare).

---

## SECTION 2: STEP-BY-STEP QUICK START & CPANEL INSTALLATION

### Step 2.1: Create MySQL Database in cPanel
1. Log into your **cPanel**.
2. Navigate to **MySQL® Database Wizard** (or MySQL® Databases).
3. Create a brand new database (e.g., `yourusername_vip_db`).
4. Create a database user, assign a password, and make sure to select **All Privileges** to associate the user to the database.
5. In cPanel **phpMyAdmin**, click on your newly created database, select **Import**, choose the `schema.sql` file provided in this source, and click **Go**. Your database is now ready!

### Step 2.2: Configure Database Settings
You can configure database credentials in either of two extremely easy ways:

#### Option A: Quick Config inside `app/Config/Database.php` (Recommended for cPanel)
Open the `app/Config/Database.php` file using cPanel's File Manager Editor and modify lines 41–43 directly:
```php
'hostname' => 'localhost', // Leave as localhost
'username' => 'yourusername_db_user', // Put your cPanel database username
'password' => 'your_db_password',     // Put your database user password
'database' => 'yourusername_vip_db',  // Put your database name
```

#### Option B: Clean configuration via `.env` file
1. Rename the `.env.example` in this source to `.env`.
2. Open `.env` and fill out your database details:
```env
database.default.hostname = localhost
database.default.database = yourusername_vip_db
database.default.username = yourusername_db_user
database.default.password = 'your_db_password'
```

### Step 2.3: Compress and Upload to cPanel
1. Select all the files in this folder (`app/`, `writable/`, `public/`, `system/`, etc.) and compress them into a single **`.zip`** archive.
2. Inside **cPanel File Manager**, navigate to your target directory (e.g., `public_html/` or your subdomain's folder).
3. **Upload** the `.zip` file and extract it directly inside that directory. 
4. That's it! Your API panel is live and fully protected against cracking, cloning, and proxy hacks.


---

## SECTION 3: SYSTEM ROUTING CONFIGURATION (app/Config/Routes.php)
Register API endpoints within your CodeIgniter routing manifest to assure proper routing:

```php
<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// SECURE API SUBSCRIPTION ENDPOINTS
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    // Auth Nodes
    $routes->post('login', 'Api::login');
    $routes->post('register', 'Api::register');
    
    // License verification, state validations, device binds
    $routes->post('key/activate', 'Api::activateKey');
    $routes->post('key/verify', 'Api::verifyKey');
    $routes->post('device/reset', 'Api::resetDevice');
    
    // Profiles
    $routes->get('user/profile', 'Api::profile');
    $routes->get('user/history', 'Api::history');
});
```

---

## SECTION 4: ADVANCED CYBER-SECURITY PROTOCOLS & HARDENING

### Mitigation 4.1: SQL Injection & XSS Mitigations
CodeIgniter 4 enforces automated SQL query binding inside Query Builders. However, for REST APIs, input sanitization is forced:
```php
// Standard inside Api controllers:
$cleanInput = filter_var($this->request->getVar('key_string'), FILTER_SANITIZE_SPECIAL_CHARS);
```

### Mitigation 4.2: Rate Limiting & DOS Shielding
Enable rate-limiting gates directly inside your controller or as pre-filters to stop flood vectors:
```php
// app/Config/Filters.php
public $aliases = [
    'rate_limiter' => \CodeIgniter\Filters\RateLimiter::class,
];

// Apply rate limits to all api routes, e.g. 100 requests per minute
public $filters = [
    'rate_limiter' => ['before' => ['api/*']],
];
```

### Mitigation 4.3: Secure Hardware ID Binding Controls & Intercept Proof Checksums (HWID anti-tamper)
To defend against cracking scripts, multi-client credential sharing, and proxy/packet tools:
1.  **Strict Device lock mismatch**: Verify HWID signature on matching key verify loops.
2.  **IP Rate Tracing**: Detect active keys query calls from more than two distinct geo-blocks over a 15-minute interval. Mark as `suspended` if breached automatically using triggers.

### Mitigation 4.4: Anti-Canary, Anti-GameGuardian & Anti-Termux Injection Safeguards
Many cracker tools bypass standard checks using HTTP Canary (packet injection), Game Guardian (memory value freezing), or Termux-hosted automated proxy scripts to fake a successful connection response:

1.  **Securing against HTTP Canary & Packet Replays (HMAC Signatures)**:
    - Standard JSON responses (e.g. `{"verified": true}`) are vulnerable to local proxy injection (e.g., rewriting the response status code inside packet sniffer utilities to simulate activation).
    - To completely neutralise this, the backend issues an **`security_checksum`** computed using HMAC-SHA 256. This checksum is formatted on the server: `hash_hmac('sha256', key_string + '|' + expires_at + '|' + device_id + '|active', JWT_SECRET_KEY)`.
    - **Defense**: Since hackers do not possess your private server `.env` `JWT_SECRET_KEY`, they cannot falsify this signature hash. The client application MUST verify this HMAC locally. If they try to rewrite response variables, the checksum validation immediately fails and closes the application.

2.  **Securing against Game Guardian Memory Freezer Hacks**:
    - High-frequency local clocks and server-timed ticks are returned in the response array (`timestamp` node). 
    - **Defense**: If a user attempts to lock memory offsets or modify local values using memory searchers (e.g., Game Guardian), the client script's synchronized timestamp mismatch or local signature mismatch triggers immediate application crash.

3.  **Securing against Termux Local Server Proxy Interception**:
    - The CodeIgniter backend includes hard domain anti-cloning verification inside `app/Controllers/Api.php` (Domain Lock Protection).
    - **Defense**: Termux proxy setups require running a local host mock server. The backend intercepts headers, compares the base URL host, and shuts down instantly with a `SOURCE_REPLACEMENT_DETECTED` warning if a domain replacement or mock server layout is active.

### Mitigation 4.5: Live Real-Time System Log Trace (cPanel Auditing)
To instantly diagnose database issues, user connection failures, HWID locks, or active bypass blocks without writing queries:
1. **Trace Logs Location**: All panel events, authentication attempts, database validation errors, and blocked clone attempts are automatically written in plain, human-readable text directly inside the following path:
   `writable/logs/vip_panel_debug.log`
2. **Accessing Logs in cPanel**:
   - Log into cPanel and open **File Manager**.
   - Navigate to the folder where you uploaded the source code.
   - Enter `writable/logs/` and select **View** or **Edit** on `vip_panel_debug.log`.
   - Each entry contains a timestamp, visiting user IP address, request agent, status event identifier (e.g., `HWID_SECURITY_ALERT`, `LOGIN_FAILED`, `VERIFY_SUCCESS`), and detailed diagnostic payloads.
3. **Database Warnings**: Real-time framework trace data and DB query exception dumps are continuously saved inside standard daily logs inside the same folder (e.g., `log-2026-06-01.log`), ensuring complete protection and visibility.

---

## SECTION 5: NGINX CONFIGURATION FILE (Nginx Server Block)
Deploy this resilient server file on `/etc/nginx/sites-available/rainbow_api.conf` to configure proper SSL routing:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.rainbow.pro;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.rainbow.pro;

    # SSL SECURITY CONFIGURATION
    ssl_certificate /etc/letsencrypt/live/api.rainbow.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.rainbow.pro/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    root /var/www/html/vip-panel-api/public;
    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # BUFFER ATTACK RESISTANCE
    client_max_body_size 8M;
    client_body_buffer_size 128k;
}
```

---

## SECTION 6: DAILY BACKUP & CRON SCHEDULE TASKS
Setup background system checks (`crontab -e`) to clean revoked database tuples, refresh active counts, and secure data backups:

```bash
# 1. Run database back up every midnight and gzip logs
0 0 * * * mysqldump -u db_vip_user -p'P@ssw0rdSecureMySQL2026!' vip_panel_pro | gzip > /var/backups/db/rainbow_vip_$(date +\%F).sql.gz

# 2. Check for expired licenses hourly and set states to 'expired'
0 * * * * mysql -u db_vip_user -p'P@ssw0rdSecureMySQL2026!' -D vip_panel_pro -e "UPDATE licenses SET status = 'expired' WHERE expires_at < NOW() AND status = 'active';"
```
