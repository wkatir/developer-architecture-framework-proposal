-- TODO: Add proper indexing strategy for performance
-- TODO: Implement data retention policies
-- TODO: Add audit trail tables

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  name TEXT,
  -- TODO: Add email, phone, address fields
  -- TODO: Add client status/lifecycle fields  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  client_id INT REFERENCES clients(id),
  name TEXT,
  status TEXT,
  -- TODO: Add project budget, timeline, priority fields
  -- TODO: Add project manager assignment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  project_id INT REFERENCES projects(id),
  amount NUMERIC(12,2),
  issued_at TIMESTAMPTZ,
  -- TODO: Add payment status, due date fields
  -- TODO: Add invoice line items table relationship
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TODO: Create indexes for foreign keys and search fields
-- CREATE INDEX idx_clients_zoho_id ON clients(zoho_id);
-- CREATE INDEX idx_projects_client_id ON projects(client_id);
-- CREATE INDEX idx_invoices_project_id ON invoices(project_id);

-- TODO: Add materialized views for common queries
-- TODO: Set up row-level security policies 