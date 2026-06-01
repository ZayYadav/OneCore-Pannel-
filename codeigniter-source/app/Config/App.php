<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Standard CodeIgniter 4 Application Configuration
 *
 * Prepared specifically for flexible hosting structures like cPanel.
 */
class App extends BaseConfig
{
    /**
     * --------------------------------------------------------------------------
     * Base Site URL
     * --------------------------------------------------------------------------
     *
     * If you set this, your API will lock strictly to this domain.
     * If left as default, it will auto-detect the visiting domain and run fluidly.
     */
    public string $baseURL = 'placeholder_your_domain.com';

    /**
     * --------------------------------------------------------------------------
     * Index File
     * --------------------------------------------------------------------------
     */
    public string $indexPage = '';

    /**
     * --------------------------------------------------------------------------
     * URI Protocol
     * --------------------------------------------------------------------------
     */
    public string $uriProtocol = 'REQUEST_URI';

    /**
     * --------------------------------------------------------------------------
     * Default Locale
     * --------------------------------------------------------------------------
     */
    public string $defaultLocale = 'en';

    /**
     * --------------------------------------------------------------------------
     * Negotiate Locale
     * --------------------------------------------------------------------------
     */
    public bool $negotiateLocale = false;

    /**
     * --------------------------------------------------------------------------
     * Supported Locales
     * --------------------------------------------------------------------------
     */
    public array $supportedLocales = ['en'];

    /**
     * --------------------------------------------------------------------------
     * Application Timezone
     * --------------------------------------------------------------------------
     */
    public string $appTimezone = 'Asia/Kolkata'; // Default to Indian Standard Time

    /**
     * --------------------------------------------------------------------------
     * Session Variables
     * --------------------------------------------------------------------------
     */
    public string $sessionDriver            = 'CodeIgniter\Session\Handlers\FileHandler';
    public string $sessionCookieName        = 'ci_session';
    public int $sessionExpiration          = 7200;
    public string $sessionSavePath          = WRITEPATH . 'session';
    public bool $sessionMatchIP             = false;
    public int $sessionTimeToUpdate        = 300;
    public bool $sessionRegenerateDestroy  = false;

    /**
     * --------------------------------------------------------------------------
     * Cookie Variables
     * --------------------------------------------------------------------------
     */
    public string $cookiePrefix   = '';
    public string $cookieDomain   = '';
    public string $cookiePath     = '/';
    public bool $cookieSecure     = false;
    public bool $cookieHTTPOnly   = true;
    public string $cookieSameSite = 'Lax';

    /**
     * --------------------------------------------------------------------------
     * Secure Requests
     * --------------------------------------------------------------------------
     */
    public bool $forceGlobalSecureRequests = false;

    /**
     * --------------------------------------------------------------------------
     * Reverse Proxy IPs
     * --------------------------------------------------------------------------
     */
    public string|array $proxyIPs = '';

    public function __construct()
    {
        parent::__construct();

        // 🔗 AUTOMATIC URL & PORT DETECT
        // IfbaseURL is left as standard placeholder, detect dynamically to facilitate painless setups
        if (getenv('app.baseURL')) {
            $this->baseURL = getenv('app.baseURL');
        } elseif ($this->baseURL === 'placeholder_your_domain.com' || empty($this->baseURL)) {
            $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
            if (!empty($host)) {
                $this->baseURL = $protocol . $host . '/';
            }
        }
    }
}
