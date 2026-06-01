<?php

namespace Config;

use CodeIgniter\Database\Config;

/**
 * Database Configuration
 *
 * This file is prepared specifically for EASY CPANEL DEPLOYMENTS.
 * You can set your credentials directly below, or load them from a .env file.
 */
class Database extends Config
{
    /**
     * The directory that holds the Migrations
     * and Seeds directories.
     */
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;

    /**
     * Lets you choose which connection group to
     * use if no other is specified.
     */
    public string $defaultGroup = 'default';

    /**
     * The default database connection.
     * 
     * 👉 FOR CPANEL EASY DEPLOYMENT:
     * Simply replace the username, password, and database variables below 
     * with your actual cPanel MySQL database details.
     */
    public array $default = [
        'DSN'      => '',
        'hostname' => 'localhost', // cPanel hosting normally uses 'localhost'
        'username' => 'parallax_onecorepanel',     // Put your MySQL database username here
        'password' => 'parallax_onecorepanel', // Put your MySQL database password here
        'database' => 'parallax_onecorepanel',     // Put your MySQL database name here
        'DBDriver' => 'MySQLi',
        'DBPrefix' => '',
        'pConnect' => false,
        'DBDebug'  => true,
        'charset'  => 'utf8mb4',
        'DBCollat' => 'utf8mb4_unicode_ci',
        'swapPre'  => '',
        'encrypt'  => false,
        'compress' => false,
        'strictOn' => false,
        'failover' => [],
        'port'     => 3306,
    ];

    /**
     * This connection is used if you run other databases.
     */
    public array $tests = [
        'DSN'         => '',
        'hostname'    => '127.0.0.1',
        'username'    => '',
        'password'    => '',
        'database'    => ':memory:',
        'DBDriver'    => 'SQLite3',
        'DBPrefix'    => '',
        'pConnect'    => false,
        'DBDebug'     => true,
        'charset'     => 'utf8',
        'DBCollat'    => '',
        'swapPre'     => '',
        'encrypt'     => false,
        'compress'    => false,
        'strictOn'    => false,
        'failover'    => [],
        'port'        => 3306,
        'foreignKeys' => true,
        'busyTimeout' => 1000,
    ];

    public function __construct()
    {
        parent::__construct();

        // Automatic fallback detection: Environment variables override hardcoded credentials if they exist
        $dbUsername = env('database.default.username') ?: getenv('database.default.username') ?: ($_ENV['database.default.username'] ?? null);
        if ($dbUsername) {
            $this->default['username'] = $dbUsername;
        }

        $dbPassword = env('database.default.password') ?: getenv('database.default.password') ?: ($_ENV['database.default.password'] ?? null);
        if ($dbPassword !== null) {
            $this->default['password'] = $dbPassword;
        }

        $dbDatabase = env('database.default.database') ?: getenv('database.default.database') ?: ($_ENV['database.default.database'] ?? null);
        if ($dbDatabase) {
            $this->default['database'] = $dbDatabase;
        }

        $dbHostname = env('database.default.hostname') ?: getenv('database.default.hostname') ?: ($_ENV['database.default.hostname'] ?? null);
        if ($dbHostname) {
            $this->default['hostname'] = $dbHostname;
        }
    }
}
