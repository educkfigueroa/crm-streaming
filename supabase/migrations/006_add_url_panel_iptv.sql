ALTER TABLE accounts ADD COLUMN IF NOT EXISTS url_panel_iptv text;

COMMENT ON COLUMN accounts.url_panel_iptv IS 'URL del panel de administración IPTV';
