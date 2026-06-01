-- ====================================================
-- DYNAMIC RAINBOW VIP PANEL PRO - PRODUCTION DATABASE SCHEMA
-- TARGET SYSTEM: MySQL 8.0+ / MariaDB 10.6+
-- DESIGNED BY: Senior Cyber Security & DevOps Engineer
-- ====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES TABLE
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS TABLE (With robust indexes & tracking fields)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'United States',
  `device_id` VARCHAR(255) DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `status` ENUM('active', 'suspended', 'banned') DEFAULT 'active',
  `balance` DECIMAL(12, 2) NOT NULL DEFAULT '0.00',
  `role_id` INT UNSIGNED NOT NULL,
  `twofa_secret` VARCHAR(128) DEFAULT NULL,
  `twofa_enabled` TINYINT(1) DEFAULT 0,
  `verified_at` TIMESTAMP NULL,
  `otp_code` VARCHAR(10) DEFAULT NULL,
  `otp_expires_at` TIMESTAMP NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_status` (`status`),
  KEY `idx_device_id` (`device_id`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. INTERACTIVE LICENSE / KEYS TABLE (Contains activation keys)
DROP TABLE IF EXISTS `licenses`;
CREATE TABLE `licenses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key_string` VARCHAR(100) NOT NULL UNIQUE,
  `status` ENUM('active', 'inactive', 'suspended', 'expired') DEFAULT 'inactive',
  `duration_type` ENUM('1_day', '7_days', '15_days', '30_days', '90_days', 'lifetime', 'custom') NOT NULL,
  `custom_days` INT UNSIGNED DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `device_limit` INT UNSIGNED DEFAULT 1,
  `used_devices_count` INT UNSIGNED DEFAULT 0,
  `created_by_user_id` INT UNSIGNED NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_key_string` (`key_string`),
  KEY `idx_status_expires` (`status`, `expires_at`),
  CONSTRAINT `fk_licenses_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LICENSE ACTIVATIONS TABLE (HWIDS logs)
DROP TABLE IF EXISTS `license_activations`;
CREATE TABLE `license_activations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `license_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `hardware_id` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `activated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_license_hardware` (`license_id`, `hardware_id`),
  CONSTRAINT `fk_activations_license` FOREIGN KEY (`license_id`) REFERENCES `licenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_activations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. RESELLERS TABLE
DROP TABLE IF EXISTS `reseller_profiles`;
CREATE TABLE `reseller_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `credit_wallet` DECIMAL(12, 2) NOT NULL DEFAULT '0.00',
  `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT '10.00',
  `total_keys_generated` INT UNSIGNED DEFAULT 0,
  `total_sales_count` INT UNSIGNED DEFAULT 0,
  `revenue_generated` DECIMAL(12, 2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_resellers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. WALLET TRANSACTIONS TABLE (Double ledger transaction records)
DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `type` ENUM('credit', 'debit') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `reference_id` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_transaction` (`user_id`, `type`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REST API TOKENS TABLE
DROP TABLE IF EXISTS `api_tokens`;
CREATE TABLE `api_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `scope` VARCHAR(100) DEFAULT 'read_write',
  `is_revoked` TINYINT(1) DEFAULT 0,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. REST API LOGS TABLE
DROP TABLE IF EXISTS `api_logs`;
CREATE TABLE `api_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `endpoint` VARCHAR(255) NOT NULL,
  `request_method` VARCHAR(10) NOT NULL,
  `request_payload` TEXT DEFAULT NULL,
  `response_code` INT NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `processed_in_ms` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_endpoint` (`endpoint`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SECURITY AUDIT LOGS TABLE
DROP TABLE IF EXISTS `security_logs`;
CREATE TABLE `security_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(255) NOT NULL,
  `category` ENUM('authentication', 'key_management', 'user_management', 'wallet', 'api', 'security') NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('success', 'failed', 'warning') DEFAULT 'success',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_security_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SYSTEM ACTIVITY LOGS TABLE
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. SUPPORT TICKETS TABLE (Dual tier system)
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` ENUM('license_issue', 'api_error', 'reseller_inquiry', 'payment_issue', 'general') DEFAULT 'general',
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `status` ENUM('open', 'replied', 'closed') DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. SUPPORT TICKET MESSAGES
DROP TABLE IF EXISTS `ticket_messages`;
CREATE TABLE `ticket_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` INT UNSIGNED NOT NULL,
  `sender_user_id` INT UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `attachment_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. SYSTEM SETTINGS TABLE (Key-Value parameters catalog)
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  `group` VARCHAR(50) DEFAULT 'general',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. IP BLACKLIST TABLE (To block brute forcing / API flooding)
DROP TABLE IF EXISTS `ip_blacklist`;
CREATE TABLE `ip_blacklist` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_address` VARCHAR(45) NOT NULL UNIQUE,
  `reason` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================
-- SEED DATA & ROLES INITIALIZATION
-- ====================================================
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'super_admin', 'Complete master privileges over subscribers, keys, and revenue settings.'),
(2, 'admin', 'Moderate privileges to generate single licenses and handle support logs.'),
(3, 'reseller', 'Assign credits to generate licenses under local digital wallet balance.'),
(4, 'user', 'Subscriber access with rights to request API authentication codes.');

INSERT INTO `settings` (`key`, `value`, `group`) VALUES
('site_name', 'DYNAMIC RAINBOW VIP PANEL PRO', 'general'),
('site_logo', '', 'general'),
('maintenance_mode', '0', 'general'),
('security_level', 'high', 'security'),
('api_rate_limit', '120', 'api'),
('smtp_host', 'smtp.rainbow.pro', 'smtp'),
('smtp_user', 'noreply@rainbow.pro', 'smtp'),
('smtp_pass', 'P@ssw0rdSecureSMTP2026', 'smtp'),
('twofa_required', '1', 'security'),
('whitelisted_ips', '', 'security');
