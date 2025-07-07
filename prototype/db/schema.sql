-- =============================================================================
-- DFAP MSP Database Schema - PostgreSQL 15+
-- Comprehensive data model for Zoho One integrations and MSP business operations
-- =============================================================================

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================================================
-- CORE BUSINESS ENTITIES
-- =============================================================================

-- Companies/Organizations (MSP Clients)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_crm_id VARCHAR(50) UNIQUE,
  zoho_books_id VARCHAR(50) UNIQUE,
  
  -- Business Information
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50) CHECK (company_size IN ('small', 'medium', 'enterprise')),
  annual_revenue DECIMAL(15,2),
  
  -- Service Tier & Billing
  service_tier VARCHAR(50) DEFAULT 'basic' CHECK (service_tier IN ('basic', 'premium', 'enterprise')),
  billing_type VARCHAR(50) DEFAULT 'monthly' CHECK (billing_type IN ('hourly', 'monthly', 'project', 'retainer')),
  
  -- Contact Information
  primary_domain VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United States',
  
  -- Status & Lifecycle
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'suspended', 'churned')),
  onboarded_at TIMESTAMPTZ,
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Contacts (People within companies)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  zoho_crm_id VARCHAR(50) UNIQUE,
  zoho_desk_id VARCHAR(50) UNIQUE,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Professional Information
  job_title VARCHAR(150),
  department VARCHAR(100),
  role VARCHAR(100),
  seniority_level VARCHAR(50) CHECK (seniority_level IN ('junior', 'mid', 'senior', 'executive', 'c_level')),
  
  -- Contact Preferences
  primary_contact BOOLEAN DEFAULT FALSE,
  billing_contact BOOLEAN DEFAULT FALSE,
  technical_contact BOOLEAN DEFAULT FALSE,
  preferred_communication VARCHAR(50) DEFAULT 'email' CHECK (preferred_communication IN ('email', 'phone', 'slack', 'teams')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'bounced')),
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MARKETING & LEAD MANAGEMENT
-- =============================================================================

-- Marketing Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_campaigns_id VARCHAR(50) UNIQUE,
  zoho_marketing_id VARCHAR(50) UNIQUE,
  
  -- Campaign Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) CHECK (campaign_type IN ('email', 'social', 'ppc', 'content', 'webinar', 'referral')),
  
  -- Budget & Goals
  budget DECIMAL(12,2),
  target_leads INTEGER,
  target_revenue DECIMAL(15,2),
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status & Performance
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  leads_generated INTEGER DEFAULT 0,
  revenue_attributed DECIMAL(15,2) DEFAULT 0,
  
  -- Attribution & Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (Potential clients)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_crm_id VARCHAR(50) UNIQUE,
  campaign_id UUID REFERENCES campaigns(id),
  
  -- Lead Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  
  -- Lead Qualification
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_source VARCHAR(100),
  lead_status VARCHAR(50) DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost')),
  
  -- Business Information
  estimated_budget DECIMAL(12,2),
  project_timeline VARCHAR(100),
  pain_points TEXT,
  requirements TEXT,
  
  -- Assignment & Follow-up
  assigned_to UUID, -- Employee ID
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  
  -- Conversion
  converted_to_company_id UUID REFERENCES companies(id),
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(15,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROJECT MANAGEMENT
-- =============================================================================

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  zoho_projects_id VARCHAR(50) UNIQUE,
  
  -- Project Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(100) CHECK (project_type IN ('development', 'consulting', 'support', 'migration', 'training')),
  complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 5),
  
  -- Timeline & Budget
  start_date DATE,
  end_date DATE,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  budget DECIMAL(15,2),
  
  -- Financial Tracking
  hourly_rate DECIMAL(8,2),
  fixed_price DECIMAL(15,2),
  expenses_budget DECIMAL(12,2) DEFAULT 0,
  actual_expenses DECIMAL(12,2) DEFAULT 0,
  profit_margin DECIMAL(5,2),
  
  -- Status & Health
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  health_score INTEGER CHECK (health_score >= 1 AND health_score <= 5),
  risk_level VARCHAR(50) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Team Assignment
  project_manager_id UUID, -- Employee ID
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks within projects
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id),
  zoho_projects_task_id VARCHAR(50) UNIQUE,
  
  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Time Tracking
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2) DEFAULT 0,
  billable_hours DECIMAL(6,2) DEFAULT 0,
  
  -- Assignment & Status
  assigned_to UUID, -- Employee ID
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
  
  -- Dates
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPORT & TICKETING
-- =============================================================================

-- Support Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  zoho_desk_id VARCHAR(50) UNIQUE,
  
  -- Ticket Information
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  category VARCHAR(100) CHECK (category IN ('technical', 'billing', 'general', 'feature_request', 'bug')),
  subcategory VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Status & Assignment
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID, -- Employee ID
  
  -- SLA Tracking
  sla_breach BOOLEAN DEFAULT FALSE,
  first_response_at TIMESTAMPTZ,
  resolution_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Time Tracking
  time_spent_hours DECIMAL(6,2) DEFAULT 0,
  billable BOOLEAN DEFAULT FALSE,
  
  -- Customer Satisfaction
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FINANCIAL MANAGEMENT
-- =============================================================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  zoho_books_id VARCHAR(50) UNIQUE,
  
  -- Invoice Details
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_type VARCHAR(50) DEFAULT 'service' CHECK (invoice_type IN ('service', 'product', 'subscription', 'expense')),
  
  -- Financial Information
  subtotal DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Status & Payment
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  payment_method VARCHAR(100),
  payment_reference VARCHAR(255),
  
  -- Terms & Notes
  payment_terms VARCHAR(255),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  ticket_id UUID REFERENCES tickets(id),
  
  -- Item Details
  item_type VARCHAR(50) CHECK (item_type IN ('labor', 'expense', 'product', 'service')),
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  
  -- Time-based items
  hours DECIMAL(6,2),
  hourly_rate DECIMAL(8,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- HUMAN RESOURCES & TEAM MANAGEMENT
-- =============================================================================

-- Employees/Team Members
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zoho_people_id VARCHAR(50) UNIQUE,
  
  -- Personal Information
  employee_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Employment Details
  job_title VARCHAR(150) NOT NULL,
  department VARCHAR(100),
  team VARCHAR(100),
  employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
  
  -- Financial
  hourly_rate DECIMAL(8,2),
  salary DECIMAL(12,2),
  cost_per_hour DECIMAL(8,2), -- Including benefits
  
  -- Skills & Capacity
  skills JSONB,
  certifications JSONB,
  availability_percentage DECIMAL(5,2) DEFAULT 100,
  
  -- Status & Dates
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  hire_date DATE,
  termination_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  ticket_id UUID REFERENCES tickets(id),
  
  -- Time Information
  date DATE NOT NULL,
  hours DECIMAL(6,2) NOT NULL,
  description TEXT,
  
  -- Classification
  billable BOOLEAN DEFAULT TRUE,
  approved BOOLEAN DEFAULT FALSE,
  
  -- Rates
  hourly_rate DECIMAL(8,2),
  cost_rate DECIMAL(8,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ
);

-- =============================================================================
-- OPTIMIZATION: INDEXES FOR PERFORMANCE
-- =============================================================================

-- Primary entity indexes
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_service_tier ON companies(service_tier);
CREATE INDEX idx_companies_zoho_ids ON companies(zoho_crm_id, zoho_books_id);

CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_primary_contact ON contacts(company_id, primary_contact) WHERE primary_contact = TRUE;

CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_assignment ON leads(assigned_to, lead_status);

CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_health ON projects(health_score, risk_level);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignment ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status != 'completed';

CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority, status);
CREATE INDEX idx_tickets_sla ON tickets(sla_breach, resolution_due_at) WHERE sla_breach = TRUE;

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_dates ON invoices(issue_date, due_date);
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) WHERE status = 'sent';

CREATE INDEX idx_time_entries_employee ON time_entries(employee_id, date);
CREATE INDEX idx_time_entries_project ON time_entries(project_id, date);
CREATE INDEX idx_time_entries_billable ON time_entries(billable, approved) WHERE billable = TRUE;

-- =============================================================================
-- BUSINESS INTELLIGENCE VIEWS
-- =============================================================================

-- Company Health Score View
CREATE VIEW company_health_dashboard AS
SELECT 
  c.id,
  c.name,
  c.service_tier,
  
  -- Ticket Metrics
  COUNT(t.id) as total_tickets,
  COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
  COUNT(CASE WHEN t.priority = 'critical' THEN 1 END) as critical_tickets,
  AVG(CASE WHEN t.resolved_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600 
      END) as avg_resolution_hours,
  
  -- Financial Metrics
  COUNT(p.id) as active_projects,
  SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as paid_amount_ytd,
  SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN i.total_amount ELSE 0 END) as outstanding_amount,
  
  -- Health Indicators
  CASE 
    WHEN COUNT(CASE WHEN t.sla_breach = TRUE THEN 1 END) > 5 THEN 'critical'
    WHEN COUNT(CASE WHEN t.status = 'open' AND t.priority = 'high' THEN 1 END) > 3 THEN 'warning'
    WHEN SUM(CASE WHEN i.status = 'overdue' THEN i.total_amount ELSE 0 END) > 10000 THEN 'warning'
    ELSE 'healthy'
  END as health_status
  
FROM companies c
LEFT JOIN tickets t ON c.id = t.company_id AND t.created_at >= CURRENT_DATE - INTERVAL '90 days'
LEFT JOIN projects p ON c.id = p.company_id AND p.status = 'active'
LEFT JOIN invoices i ON c.id = i.company_id AND i.created_at >= CURRENT_DATE - INTERVAL '365 days'
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.service_tier;

-- =============================================================================
-- TRIGGERS FOR AUDIT & AUTOMATION
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =============================================================================

-- Sample company
INSERT INTO companies (name, industry, service_tier, status) 
VALUES ('Acme Corp', 'Technology', 'enterprise', 'active');

-- Sample employee  
INSERT INTO employees (first_name, last_name, email, job_title, hourly_rate) 
VALUES ('John', 'Doe', 'john.doe@company.com', 'Senior Developer', 85.00); 