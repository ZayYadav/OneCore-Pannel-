<?php

namespace Config;

/**
 * PATHS CONFIGURATION
 *
 * This file is vital for bootstrapping the CodeIgniter 4 framework and letting the
 * application starter know where 'system', 'writable', and 'app' directories reside.
 * Perfect for standard cPanel uploads as well as local Composer.
 */
class Paths
{
    /**
     * System Directory
     * Points to standard vendor library directory.
     */
    public string $systemDirectory = __DIR__ . '/../../vendor/codeigniter4/framework/system';

    /**
     * Application Directory
     */
    public string $appDirectory = __DIR__ . '/..';

    /**
     * Writable Directory
     * Contains caches, sessions, logs, and trace logs.
     */
    public string $writableDirectory = __DIR__ . '/../../writable';

    /**
     * Tests Directory
     */
    public string $testsDirectory = __DIR__ . '/../../tests';

    /**
     * View Directory
     */
    public string $viewDirectory = __DIR__ . '/../Views';
}
