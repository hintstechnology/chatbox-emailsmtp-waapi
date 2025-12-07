-- Chat System Database Schema
-- MySQL Database: chat_system

CREATE DATABASE IF NOT EXISTS `chat_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `chat_system`;

-- Table: sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `environment` VARCHAR(50) DEFAULT 'testing-mock',
  `assigned_admin` VARCHAR(255) NULL,
  `status` ENUM('active', 'finished') DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_session_id_unique` (`session_id`),
  KEY `sessions_status_index` (`status`),
  KEY `sessions_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(255) NOT NULL,
  `type` ENUM('user', 'admin', 'system') NOT NULL,
  `text` TEXT NOT NULL,
  `admin_name` VARCHAR(255) NULL,
  `admin_email` VARCHAR(255) NULL,
  `admin_avatar` VARCHAR(255) NULL,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_session_id_index` (`session_id`),
  KEY `messages_type_index` (`type`),
  KEY `messages_created_at_index` (`created_at`),
  CONSTRAINT `messages_session_id_foreign` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: email_recipients
CREATE TABLE IF NOT EXISTS `email_recipients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_recipients_email_unique` (`email`),
  KEY `email_recipients_is_active_index` (`is_active`),
  KEY `email_recipients_is_primary_index` (`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default email recipient
INSERT INTO `email_recipients` (`email`, `name`, `is_active`, `is_primary`, `created_at`, `updated_at`) 
VALUES ('chatbox@hintstechnology.com', 'Default Admin', 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = 'Default Admin', `is_active` = 1, `is_primary` = 1;

