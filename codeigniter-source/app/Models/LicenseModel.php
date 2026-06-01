<?php

namespace App\Models;

use CodeIgniter\Model;

class LicenseModel extends Model
{
    protected $table            = 'licenses';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'key_string',
        'status',
        'duration_type',
        'custom_days',
        'expires_at',
        'device_limit',
        'used_devices_count',
        'created_by_user_id',
        'notes'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules      = [
        'key_string'    => 'required|is_unique[licenses.key_string,id,{id}]',
        'duration_type' => 'required',
        'device_limit'  => 'required|integer',
        'created_by_user_id' => 'required|integer'
    ];
}
