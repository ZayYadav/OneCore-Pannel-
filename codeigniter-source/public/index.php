<?php

/**
 * ====================================================================
 * RAINBOW VIP PANEL PRO - MAIN ENTRY POINT (index.php)
 * ====================================================================
 * This is the primary front controller of the licensing system backend.
 * All HTTP canary checks, verify pings, and hardware binding controls
 * are routed through this file.
 */

// Check PHP version compatibility (CodeIgniter 4 requires PHP 8.1+)
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
 * BOOTSTRAP THE APPLICATION
 *---------------------------------------------------------------
 * Load the paths config first, initialize the autoloader,
 * and load CodeIgniter kernel libraries.
 */

// Load our paths configuration
require FCPATH . '../app/Config/Paths.php';
$paths = new Config\Paths();

// Require vendor auto-loader if composer packages are used (optional fallback safety)
if (is_file(FCPATH . '../vendor/autoload.php')) {
    require_once FCPATH . '../vendor/autoload.php';
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
 * Load services and run the web engine.
 */
$app = Config\Services::codeigniter();
$app->initialize();
$app->run();
