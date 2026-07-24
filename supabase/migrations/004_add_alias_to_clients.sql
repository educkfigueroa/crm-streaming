-- ============================================
-- Add alias column to clients table
-- ============================================

-- Add the missing alias column
ALTER TABLE clients ADD COLUMN alias TEXT;

-- Fix clients where nombre_completo contains a UUID
-- Set those to the client's ID as a placeholder (user should edit them)
UPDATE clients
SET nombre_completo = 'Cliente ' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE nombre_completo ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
