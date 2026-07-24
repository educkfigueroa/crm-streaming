-- ============================================
-- Fix nombre_perfil: replace client UUIDs with actual client name/alias
-- ============================================

-- Update subscriptions where nombre_perfil looks like a UUID
-- and replace with the client's alias or nombre_completo
UPDATE subscriptions s
SET nombre_perfil = COALESCE(c.alias, c.nombre_completo)
FROM clients c
WHERE s.cliente_id = c.id
  AND s.nombre_perfil ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
