-- database/migrations/001_create_audit_logs.sql
CREATE DATABASE IF NOT EXISTS tenant_registry;
USE tenant_registry;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (tenant_id, created_at),
  INDEX (user_id)
);