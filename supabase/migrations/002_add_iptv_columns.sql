-- ============================================
-- CRM Streaming - Migración: Columnas IPTV
-- ============================================

-- Agregar columnas para IPTV Xtream Code
ALTER TABLE accounts ADD COLUMN servidor_xtream TEXT;
ALTER TABLE accounts ADD COLUMN url_server TEXT;
ALTER TABLE accounts ADD COLUMN usuario_xtream TEXT;

-- Hacer que correo y contraseña sean nullable (para IPTV)
ALTER TABLE accounts ALTER COLUMN correo DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN contraseña DROP NOT NULL;
