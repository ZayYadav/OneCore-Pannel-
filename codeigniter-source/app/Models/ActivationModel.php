<?php

namespace App\Models;

use CodeIgniter\Model;

class ActivationModel extends Model
{
    protected $table            = 'license_activations';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $protectFields    = true;
    protected $allowedFields    = [
        'license_id',
        'user_id',
        'hardware_id',
        'ip_address',
        'activated_at'
    ];

    protected $useTimestamps = false; // Custom datetime used
}
