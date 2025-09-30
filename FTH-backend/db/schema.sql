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
