-- Production Database Setup Script for Dashboard Uskup Surabaya
-- PostgreSQL Migration Script

-- Enable UUID extension (for Prisma cuid compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database (run this as superuser)
-- CREATE DATABASE dashboard_uskup;
-- CREATE USER dashboard_user WITH PASSWORD 'your-secure-password';
-- GRANT ALL PRIVILEGES ON DATABASE dashboard_uskup TO dashboard_user;

-- Create schema (if needed)
-- CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone to Indonesia
SET timezone TO 'Asia/Jakarta';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_agenda_created_by ON "Agenda"(createdBy);
CREATE INDEX IF NOT EXISTS idx_agenda_tanggal ON "Agenda"(tanggal);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON "Task"(createdBy);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON "Task"(status);
CREATE INDEX IF NOT EXISTS idx_tasks_penanggung_jawab ON "Task"(penanggungJawab);
CREATE INDEX IF NOT EXISTS idx_notulensi_created_by ON "Notulensi"(createdBy);
CREATE INDEX IF NOT EXISTS idx_notulensi_status ON "Notulensi"(status);
CREATE INDEX IF NOT EXISTS idx_surat_created_by ON "Surat"(createdBy);
CREATE INDEX IF NOT EXISTS idx_surat_status ON "Surat"(status);
CREATE INDEX IF NOT EXISTS idx_decisions_created_by ON "Decision"(createdBy);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON "Decision"(status);
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON "Notification"(userId);
CREATE INDEX IF NOT EXISTS idx_notification_status ON "Notification"(status);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "Account"(userId);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "Session"(userId);

-- Performance optimization: Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agenda_today ON "Agenda"(tanggal) WHERE tanggal = CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_tasks_active ON "Task"(status) WHERE status != 'Selesai';
CREATE INDEX IF NOT EXISTS idx_notulensi_pending ON "Notulensi"(status) WHERE status IN ('Draft', 'Menunggu Approve');

-- Maintenance: Create function for regular cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM "Session" 
  WHERE expires < NOW() - INTERVAL '1 day';
  
  DELETE FROM "VerificationToken" 
  WHERE expires < NOW();
  
  RAISE NOTICE 'Cleaned up expired sessions and verification tokens at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule regular cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- Create views for common queries
CREATE OR REPLACE VIEW active_tasks_summary AS
SELECT 
  status,
  COUNT(*) as count,
  AVG(progress) as avg_progress
FROM "Task"
WHERE status != 'Selesai'
GROUP BY status;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM "Agenda" WHERE tanggal = CURRENT_DATE) as agenda_today,
  (SELECT COUNT(*) FROM "Task" WHERE status != 'Selesai') as tasks_active,
  (SELECT COUNT(*) FROM "Notulensi" WHERE status = 'Disetujui' AND DATE_TRUNC('month', tanggal) = DATE_TRUNC('month', CURRENT_DATE)) as notulensi_bulan_ini,
  (SELECT COUNT(*) FROM "Imam" WHERE status = 'Aktif') as imam_aktif,
  (SELECT COUNT(*) FROM "Decision" WHERE status != 'Selesai') as decisions_aktif;

-- Grant permissions (for production user)
-- GRANT USAGE ON SCHEMA public TO dashboard_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dashboard_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dashboard_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dashboard_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dashboard_user;