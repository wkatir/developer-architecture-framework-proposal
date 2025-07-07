CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  client_id INT REFERENCES clients(id),
  name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  zoho_id TEXT UNIQUE NOT NULL,
  project_id INT REFERENCES projects(id),
  amount NUMERIC(12,2),
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
); 