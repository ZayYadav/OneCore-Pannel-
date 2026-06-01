<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateVipSchema extends Migration
{
    public function up()
    {
        // Disable foreign keys check during creation
        $this->db->enableForeignKeyChecks();

        // 1. CREATE ROLES TABLE
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
                'unique'     => true,
            ],
            'description' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => true,
            ],
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('roles', true);

        // Seed system default roles
        $db = \Config\Database::connect();
        $db->table('roles')->insertBatch([
            ['id' => 1, 'name' => 'super_admin', 'description' => 'Complete master privileges over subscribers, keys, and revenue settings.'],
            ['id' => 2, 'name' => 'admin', 'description' => 'Moderate privileges to generate single licenses and handle support logs.'],
            ['id' => 3, 'name' => 'reseller', 'description' => 'Assign credits to generate licenses under local digital wallet balance.'],
            ['id' => 4, 'name' => 'user', 'description' => 'Subscriber access with rights to request API authentication codes.']
        ]);

        // 2. CREATE USERS TABLE
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'username' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
                'unique'     => true,
            ],
            'email' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
                'unique'     => true,
            ],
            'password_hash' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
            ],
            'country' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
                'default'    => 'United States',
            ],
            'device_id' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => true,
            ],
            'last_login_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'last_login_ip' => [
                'type'       => 'VARCHAR',
                'constraint' => '45',
                'null'       => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['active', 'suspended', 'banned'],
                'default'    => 'active',
            ],
            'balance' => [
                'type'       => 'DECIMAL',
                'constraint' => '12,2',
                'default'    => '0.00',
            ],
            'role_id' => [
                'type'       => 'INT',
                'unsigned'   => true,
            ],
            'twofa_secret' => [
                'type'       => 'VARCHAR',
                'constraint' => '128',
                'null'       => true,
            ],
            'twofa_enabled' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'verified_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'otp_code' => [
                'type'       => 'VARCHAR',
                'constraint' => '10',
                'null'       => true,
            ],
            'otp_expires_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'notes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('role_id', 'roles', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('users', true);
    }

    public function down()
    {
        $this->forge->dropTable('users', true);
        $this->forge->dropTable('roles', true);
    }
}
