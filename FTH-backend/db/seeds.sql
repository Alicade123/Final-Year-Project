-- db/seeds.sql
INSERT INTO users(full_name, phone, email, password_hash, role)
VALUES
  ('Alice Clerk', '250788000111', 'alice@hub.local', crypt('ClerkPass123', gen_salt('bf')), 'CLERK'),
  ('Farmer John', '250788000222', 'john@farm.local', crypt('FarmerPass123', gen_salt('bf')), 'FARMER'),
  ('Buyer Hotel A', '250788000333', 'hotel@buyers.local', crypt('BuyerPass123', gen_salt('bf')), 'BUYER');

INSERT INTO hubs(name, location, manager_id)
SELECT 'Ruhango Central Hub', 'Ruhango Town', id FROM users WHERE phone = '250788000111' LIMIT 1;

-- Example lot (replace hub_id id by querying hubs)
-- You can get hub id: SELECT id FROM hubs LIMIT 1;
