<?php

namespace App\Models;

use CodeIgniter\Model;

class ApiLogModel extends Model
{
    protected $table            = 'api_logs';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'user_id',
        'endpoint',
        'request_method',
        'request_payload',
        'response_code',
        'ip_address',
        'user_agent',
        'processed_in_ms'
    ];

    protected $useTimestamps = false;
}
