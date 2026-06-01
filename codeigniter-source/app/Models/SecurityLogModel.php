<?php

namespace App\Models;

use CodeIgniter\Model;

class SecurityLogModel extends Model
{
    protected $table            = 'security_logs';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields = [
        'user_id',
        'action',
        'category',
        'ip_address',
        'user_agent',
        'status'
    ];

    protected $useTimestamps = false;
}
