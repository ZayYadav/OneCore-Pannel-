<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Log\Handlers\FileHandler;

/**
 * CodeIgniter 4 Logger Configuration
 * 
 * Auto-manages frame logs, warnings, database trace errors, and debug notices.
 * Saves directly to writable/logs/ folder so cPanel users can audit bugs instantly.
 */
class Logger extends BaseConfig
{
    /**
     * Log Threshold
     * --------------------------------------------------------------------------
     * 0 = Disables logging
     * 1 = Emergency, Alert, Critical
     * 2 = Action, Security
     * 3 = Warning, Errors
     * 4 = Debug, Info (Logs everything)
     */
    public int $threshold = 4;

    /**
     * Active log handles
     */
    public array $handlers = [
        'CodeIgniter\Log\Handlers\FileHandler' => [
            'handles' => [
                'critical',
                'emergency',
                'alert',
                'error',
                'warning',
                'debug',
                'info',
            ],
            // File extension
            'fileExtension' => 'log',
            // File permissions
            'filePermissions' => 0644,
            // The directory where logs are written
            'path' => WRITEPATH . 'logs/',
        ],
    ];
}
