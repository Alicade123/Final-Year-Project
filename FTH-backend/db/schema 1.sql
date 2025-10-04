-- db/schema.sql
-- Run: psql -d farmers_hub -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMs
CREATE TYPE role_enum AS ENUM ('FARMER','CLERK','BUYER');
CREATE TYPE lot_status_enum AS ENUM ('AVAILABLE','RESERVED','SOLD','EXPIRED');
CREATE TYPE order_status_enum AS ENUM ('PENDING','PAID','FULFILLED','CANCELLED');
CREATE TYPE payment_status_enum AS ENUM ('INITIATED','SUCCESS','FAILED');
CREATE TYPE payout_status_enum AS ENUM ('PENDING','SENT','FAILED');
CREATE TYPE notification_type_enum AS ENUM ('DELIVERY','ORDER','PAYMENT','PAYOUT','GENERAL');
CREATE TYPE payment_method_enum AS ENUM ('MOBILE_MONEY','BANK_TRANSFER','CASH','ONLINE');

-- Users (farmers, clerks/managers, buyers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) UNIQUE,
  password_hash TEXT NOT NULL,
  role role_enum NOT NULL,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hubs (physical locations)
CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  location TEXT NOT NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory lots (each lot = a batch delivered by farmer to a hub)
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lot_code VARCHAR(50) UNIQUE,
  produce_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  quantity NUMERIC(14,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,        -- e.g., Kg, Ton, Bag
  price_per_unit NUMERIC(14,2) NOT NULL,
  status lot_status_enum NOT NULL DEFAULT 'AVAILABLE',
  posted_at TIMESTAMPTZ DEFAULT now(),
  expiry_date DATE,
  notes TEXT
);

-- Orders (buyers place orders at a hub)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  total_amount NUMERIC(14,2) NOT NULL,
  status order_status_enum NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order items: link order -> lots (one order can include many lots)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE RESTRICT,
  quantity NUMERIC(14,3) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL
);

-- Payments (buyer pays, system computes hub fee & farmer amount)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  hub_fee NUMERIC(14,2) NOT NULL,
  farmer_amount NUMERIC(14,2) NOT NULL,
  method payment_method_enum NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'INITIATED',
  provider_ref VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Payouts to farmers (one record per farmer per payment)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  status payout_status_enum NOT NULL DEFAULT 'PENDING',
  provider_ref VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_lots_hub ON lots(hub_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_payments_status ON payments(status);


-- =========================================================
--  EXTEND EXISTING TABLES
-- =========================================================

-- 1. Extend payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS system_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;

-- 2. Extend payouts table
ALTER TABLE payouts
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- =========================================================
--  CREATE NEW TABLES
-- =========================================================

-- 3. Account Transactions (ledger)
CREATE TABLE IF NOT EXISTS account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,              -- CREDIT, DEBIT
  amount DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50) NOT NULL,    -- PAYMENT, PAYOUT, REFUND, HUB_FEE, SYSTEM_FEE
  reference_id UUID,                      -- ID of related record
  description TEXT,
  balance_after DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 4. User Accounts (track balances)
CREATE TABLE IF NOT EXISTS user_accounts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  last_updated TIMESTAMP DEFAULT NOW()
);

-- 5. Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  receipt_data JSONB NOT NULL,   -- full receipt JSON
  pdf_url TEXT
);

-- =========================================================
--  INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_account_transactions_user_id ON account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_ref ON account_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_created_at ON account_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_accounts_balance ON user_accounts(balance);

-- =========================================================
--  TRIGGERS & FUNCTIONS
-- =========================================================

-- Trigger function to update user balance
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_accounts (user_id, balance, last_updated)
  VALUES (NEW.user_id, NEW.balance_after, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET balance = NEW.balance_after, last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on account_transactions
DROP TRIGGER IF EXISTS trg_update_user_balance ON account_transactions;

CREATE TRIGGER trg_update_user_balance
AFTER INSERT ON account_transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_balance();

-- =========================================================
--  VIEWS
-- =========================================================

-- Payment summary view
CREATE OR REPLACE VIEW v_payment_summary AS
SELECT 
  p.id,
  p.order_id,
  p.amount,
  p.system_fee,
  p.hub_fee,
  p.farmer_amount,
  p.method,
  p.status,
  p.created_at,
  o.buyer_id,
  h.id as hub_id,
  h.name as hub_name,
  COUNT(po.id) as payout_count,
  SUM(CASE WHEN po.status = 'PENDING' THEN 1 ELSE 0 END) as pending_payouts
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN hubs h ON o.hub_id = h.id
LEFT JOIN payouts po ON po.payment_id = p.id
GROUP BY p.id, o.buyer_id, h.id, h.name;

-- Farmer payout summary
CREATE OR REPLACE VIEW v_farmer_payouts AS
SELECT 
  po.id,
  po.farmer_id,
  u.full_name as farmer_name,
  u.phone as farmer_phone,
  po.amount,
  po.status,
  po.created_at,
  po.paid_at,
  p.order_id,
  o.hub_id,
  h.name as hub_name,
  p.method as payment_method
FROM payouts po
JOIN users u ON po.farmer_id = u.id
JOIN payments p ON po.payment_id = p.id
JOIN orders o ON p.order_id = o.id
JOIN hubs h ON o.hub_id = h.id;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;