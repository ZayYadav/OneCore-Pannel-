<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLicenseTables extends Migration
{
    public function up()
    {
        // 3. LICENSES TABLE
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'key_string' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
                'unique'     => true,
                'id_key_index'=> true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['active', 'inactive', 'suspended', 'expired'],
                'default'    => 'inactive',
            ],
            'duration_type' => [
                'type'       => 'ENUM',
                'constraint' => ['1_day', '7_days', '15_days', '30_days', '90_days', 'lifetime', 'custom'],
            ],
            'custom_days' => [
                'type'       => 'INT',
                'unsigned'   => true,
                'null'       => true,
            ],
            'expires_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'device_limit' => [
                'type'       => 'INT',
                'unsigned'   => true,
                'default'    => 1,
            ],
            'used_devices_count' => [
                'type'       => 'INT',
                'unsigned'   => true,
                'default'    => 0,
            ],
            'created_by_user_id' => [
                'type'     => 'INT',
                'unsigned' => true,
            ],
            'notes' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => true,
            ],
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('created_by_user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('licenses', true);

        // 4. LICENSE ACTIVATIONS TABLE (Strict Hardware binding logs)
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'license_id' => [
                'type'     => 'INT',
                'unsigned' => true,
            ],
            'user_id' => [
                'type'     => 'INT',
                'unsigned' => true,
            ],
            'hardware_id' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
            ],
            'ip_address' => [
                'type'       => 'VARCHAR',
                'constraint' => '45',
            ],
            'activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey(['license_id', 'hardware_id']);
        $this->forge->addForeignKey('license_id', 'licenses', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('license_activations', true);
    }

    public function down()
    {
        $this->forge->dropTable('license_activations', true);
        $this->forge->dropTable('licenses', true);
    }
}
