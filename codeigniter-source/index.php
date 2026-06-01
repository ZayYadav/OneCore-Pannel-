<?php

/**
 * ====================================================================
 * RAINBOW VIP PANEL PRO - ROOT ENTRY POINT FALLBACK (index.php)
 * ====================================================================
 * 💡 CPANEL DUAL-ROUTING COMPATIBILITY:
 * If your cPanel subdomain or virtual host points directly to this project's
 * root folder (instead of the "public/" subdirectory), this file will auto-execute.
 */

// Check PHP version compatibility
if (version_compare(PHP_VERSION, '8.1', '<')) {
    header('HTTP/1.1 503 Service Unavailable.', true, 503);
    echo 'Your PHP version must be 8.1 or higher to run CodeIgniter. Current version: ' . PHP_VERSION;
    exit(1);
}

// Path to the front controller (this directory)
define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);

// Ensure the current directory is pointing to the front controller's directory
if (function_exists('chdir')) {
    chdir(__DIR__);
}

/*
 *---------------------------------------------------------------
 * BOOTSTRAP THE APPLICATION WITH ROOT RESOLUTIONS
 *---------------------------------------------------------------
 */

// Load our paths configuration (No parent folder offset needed here!)
require FCPATH . 'app/Config/Paths.php';
$paths = new Config\Paths();

// Adjust the Paths instance dynamically for root-level execution
$paths->appDirectory = __DIR__ . '/app';
$paths->writableDirectory = __DIR__ . '/writable';

// Require vendor auto-loader if composer packages are used (optional fallback safety)
if (is_file(FCPATH . 'vendor/autoload.php')) {
    require_once FCPATH . 'vendor/autoload.php';
}

// Location of the framework bootstrap file.
$bootstrap = rtrim($paths->systemDirectory, '\\/ ') . DIRECTORY_SEPARATOR . 'bootstrap.php';

if (!is_file($bootstrap)) {
    header('HTTP/1.1 500 Internal Server Error.', true, 500);
    echo 'Your CodeIgniter system folder path lacks boot capabilities. Ensure "composer install" has run successfully.';
    exit(1);
}

require $bootstrap;

/*
 *---------------------------------------------------------------
 * LAUNCH THE APPLICATION
 *---------------------------------------------------------------
 */
$app = Config\Services::codeigniter();
$app->initialize();
$app->run();
