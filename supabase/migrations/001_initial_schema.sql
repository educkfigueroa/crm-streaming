-- ============================================
-- CRM Streaming - Schema Inicial
-- ============================================

-- Tabla de cuentas (inventario de proveedores)
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plataforma TEXT NOT NULL,
  correo TEXT NOT NULL,
  contraseña TEXT NOT NULL,
  total_perfiles INTEGER NOT NULL DEFAULT 1,
  proveedor TEXT,
  precio_costo DECIMAL(10,2),
  fecha_vencimiento_proveedor DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  whatsapp TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  cuenta_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  nombre_perfil TEXT NOT NULL,
  pin_perfil TEXT,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  precio_cobrado DECIMAL(10,2),
  estado TEXT NOT NULL CHECK (estado IN ('Activo', 'Por Vencer', 'Vencido', 'Suspendido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Habilitar Row Level Security (RLS)
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas RLS (permitir todo autenticado)
-- ============================================

-- Accounts: permitir operaciones autenticadas
CREATE POLICY "Allow authenticated operations on accounts"
  ON accounts
  FOR ALL
  TO authenticated
  USING (true);

-- Clients: permitir operaciones autenticadas
CREATE POLICY "Allow authenticated operations on clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- Subscriptions: permitir operaciones autenticadas
CREATE POLICY "Allow authenticated operations on subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- Índices para mejorar rendimiento
-- ============================================
CREATE INDEX idx_subscriptions_cliente_id ON subscriptions(cliente_id);
CREATE INDEX idx_subscriptions_cuenta_id ON subscriptions(cuenta_id);
CREATE INDEX idx_subscriptions_estado ON subscriptions(estado);
CREATE INDEX idx_subscriptions_fecha_vencimiento ON subscriptions(fecha_vencimiento);
CREATE INDEX idx_accounts_plataforma ON accounts(plataforma);
