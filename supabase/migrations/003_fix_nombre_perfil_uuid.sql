-- ============================================
-- Fix UUID data in nombre_perfil and correo
-- ============================================

-- Fix subscriptions.nombre_perfil: replace client UUIDs with actual client name/alias
UPDATE subscriptions s
SET nombre_perfil = COALESCE(c.alias, c.nombre_completo)
FROM clients c
WHERE s.cliente_id = c.id
  AND s.nombre_perfil ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Fix accounts.correo: null out UUIDs (they were never valid emails)
UPDATE accounts
SET correo = NULL
WHERE correo ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
