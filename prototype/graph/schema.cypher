// =============================================================================
// DFAP MSP Graph Database Schema - Neo4j 5.x
// Advanced graph analytics for MSP business intelligence and relationship tracking
// Integrates with PostgreSQL transactional data for comprehensive insights
// =============================================================================

// === GRAPH DATABASE PERFORMANCE OPTIMIZATIONS ===

// Core entity constraints for data integrity
CREATE CONSTRAINT company_uuid_unique IF NOT EXISTS ON (c:Company) ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT contact_uuid_unique IF NOT EXISTS ON (ct:Contact) ASSERT ct.id IS UNIQUE;
CREATE CONSTRAINT lead_uuid_unique IF NOT EXISTS ON (l:Lead) ASSERT l.id IS UNIQUE;
CREATE CONSTRAINT project_uuid_unique IF NOT EXISTS ON (p:Project) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT ticket_uuid_unique IF NOT EXISTS ON (t:Ticket) ASSERT t.id IS UNIQUE;
CREATE CONSTRAINT invoice_uuid_unique IF NOT EXISTS ON (i:Invoice) ASSERT i.id IS UNIQUE;
CREATE CONSTRAINT task_uuid_unique IF NOT EXISTS ON (tk:Task) ASSERT tk.id IS UNIQUE;
CREATE CONSTRAINT employee_uuid_unique IF NOT EXISTS ON (e:Employee) ASSERT e.id IS UNIQUE;
CREATE CONSTRAINT campaign_uuid_unique IF NOT EXISTS ON (cp:Campaign) ASSERT cp.id IS UNIQUE;

// Performance indexes for complex traversals and analytics
CREATE INDEX company_status_idx IF NOT EXISTS FOR (c:Company) ON (c.status);
CREATE INDEX company_tier_idx IF NOT EXISTS FOR (c:Company) ON (c.service_tier);
CREATE INDEX project_status_idx IF NOT EXISTS FOR (p:Project) ON (p.status);
CREATE INDEX project_health_idx IF NOT EXISTS FOR (p:Project) ON (p.health_score, p.risk_level);
CREATE INDEX invoice_status_idx IF NOT EXISTS FOR (i:Invoice) ON (i.status);
CREATE INDEX invoice_amount_idx IF NOT EXISTS FOR (i:Invoice) ON (i.total_amount);
CREATE INDEX ticket_priority_idx IF NOT EXISTS FOR (t:Ticket) ON (t.priority, t.status);
CREATE INDEX ticket_sla_idx IF NOT EXISTS FOR (t:Ticket) ON (t.sla_breach);
CREATE INDEX lead_score_idx IF NOT EXISTS FOR (l:Lead) ON (l.lead_score);
CREATE INDEX lead_status_idx IF NOT EXISTS FOR (l:Lead) ON (l.lead_status);
CREATE INDEX campaign_performance_idx IF NOT EXISTS FOR (cp:Campaign) ON (cp.leads_generated, cp.revenue_attributed);

// Composite indexes for complex relationship queries
CREATE INDEX project_timeline_idx IF NOT EXISTS FOR (p:Project) ON (p.start_date, p.end_date);
CREATE INDEX invoice_payment_idx IF NOT EXISTS FOR (i:Invoice) ON (i.issue_date, i.due_date, p.paid_date);
CREATE INDEX ticket_resolution_idx IF NOT EXISTS FOR (t:Ticket) ON (t.created_at, t.resolved_at);

// === MSP BUSINESS INTELLIGENCE QUERIES ===

// =============================================================================
// QUERY 1: Revenue Attribution Analysis
// "¿Qué tickets derivaron en facturación este mes y cuánto generaron?"
// =============================================================================

MATCH (t:Ticket)-[:BELONGS_TO]->(p:Project)-[:GENERATES]->(i:Invoice)
WHERE i.issue_date >= date('2024-01-01') 
  AND i.issue_date < date('2024-02-01')
  AND i.status IN ['paid', 'sent']

// Include direct billable tickets (not part of projects)
OPTIONAL MATCH (t)-[:BILLABLE_TO]->(direct_invoice:Invoice)
WHERE direct_invoice.issue_date >= date('2024-01-01') 
  AND direct_invoice.issue_date < date('2024-02-01')
  AND direct_invoice.status IN ['paid', 'sent']

// Aggregate revenue by ticket and project context
WITH t, 
     COLLECT(DISTINCT i.total_amount) + COLLECT(DISTINCT direct_invoice.total_amount) as invoice_amounts,
     COLLECT(DISTINCT p.name) as project_names,
     COLLECT(DISTINCT i.invoice_number) + COLLECT(DISTINCT direct_invoice.invoice_number) as invoice_numbers

MATCH (t)-[:REPORTED_BY]->(c:Contact)-[:WORKS_FOR]->(company:Company)

RETURN 
  t.ticket_number as ticket_number,
  t.subject as ticket_subject,
  t.category as ticket_category,
  t.priority as ticket_priority,
  company.name as company_name,
  project_names,
  invoice_numbers,
  REDUCE(total = 0, amount IN invoice_amounts | total + amount) as total_revenue_generated,
  SIZE(invoice_amounts) as invoice_count,
  CASE 
    WHEN t.resolved_at IS NOT NULL 
    THEN duration.between(t.created_at, t.resolved_at).days 
    ELSE NULL 
  END as resolution_days
ORDER BY total_revenue_generated DESC
LIMIT 50;

// =============================================================================
// QUERY 2: Campaign Effectiveness and Lead Attribution
// "¿Qué campañas generaron más proyectos y cuál fue su ROI?"
// =============================================================================

MATCH (cp:Campaign)-[:GENERATES]->(l:Lead)
OPTIONAL MATCH (l)-[:CONVERTS_TO]->(company:Company)
OPTIONAL MATCH (l)-[:INITIATES]->(p:Project)
OPTIONAL MATCH (p)-[:GENERATES]->(i:Invoice)
WHERE i.status = 'paid'

WITH cp, l, company, p, 
     COLLECT(i.total_amount) as project_revenues,
     COUNT(DISTINCT p) as projects_initiated

// Calculate ROI metrics
WITH cp,
     COUNT(DISTINCT l) as total_leads,
     COUNT(DISTINCT company) as conversions,
     projects_initiated,
     REDUCE(total = 0, amount IN project_revenues | total + amount) as total_revenue,
     cp.budget as campaign_budget

RETURN 
  cp.name as campaign_name,
  cp.campaign_type as campaign_type,
  cp.budget as budget,
  total_leads,
  conversions,
  projects_initiated,
  total_revenue,
  ROUND((CASE WHEN total_leads > 0 THEN (conversions * 100.0) / total_leads ELSE 0 END), 2) as conversion_rate_percent,
  ROUND((CASE WHEN campaign_budget > 0 THEN (total_revenue / campaign_budget) ELSE 0 END), 2) as roi_ratio,
  ROUND((CASE WHEN conversions > 0 THEN campaign_budget / conversions ELSE 0 END), 2) as cost_per_acquisition,
  cp.utm_source as utm_source,
  cp.utm_medium as utm_medium,
  cp.status as campaign_status

ORDER BY roi_ratio DESC
LIMIT 20;

// =============================================================================
// QUERY 3: Customer Health and Churn Risk Analysis
// "¿Qué clientes están en riesgo de churn basado en actividad reciente?"
// =============================================================================

MATCH (company:Company)
WHERE company.status = 'active'

// Gather support metrics
OPTIONAL MATCH (company)<-[:WORKS_FOR]-(ct:Contact)<-[:REPORTED_BY]-(t:Ticket)
WHERE t.created_at >= datetime() - duration('P90D') // Last 90 days

// Gather project metrics
OPTIONAL MATCH (company)-[:SPONSORS]->(p:Project)
WHERE p.status IN ['active', 'completed'] 
  AND p.start_date >= date() - duration('P365D') // Last year

// Gather financial metrics
OPTIONAL MATCH (company)-[:RECEIVES]->(i:Invoice)
WHERE i.issue_date >= date() - duration('P90D')
  AND i.status IN ['paid', 'sent', 'overdue']

// Calculate advanced risk metrics
WITH company,
     COUNT(DISTINCT t) as ticket_count,
     COUNT(CASE WHEN t.priority IN ['high', 'critical'] THEN 1 END) as high_priority_tickets,
     COUNT(CASE WHEN t.status = 'open' THEN 1 END) as open_tickets,
     COUNT(CASE WHEN t.sla_breach = true THEN 1 END) as sla_breaches,
     AVG(CASE WHEN t.resolved_at IS NOT NULL 
         THEN duration.between(t.created_at, t.resolved_at).days 
         END) as avg_resolution_days,
     MAX(t.created_at) as last_ticket_date,
     
     COUNT(DISTINCT p) as recent_projects,
     AVG(p.health_score) as avg_project_health,
     COUNT(CASE WHEN p.risk_level IN ['high', 'critical'] THEN 1 END) as risky_projects,
     
     COUNT(DISTINCT i) as recent_invoices,
     SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as recent_revenue,
     SUM(CASE WHEN i.status = 'overdue' THEN i.total_amount ELSE 0 END) as overdue_amount,
     AVG(CASE WHEN i.paid_date IS NOT NULL 
         THEN duration.between(i.issue_date, i.paid_date).days 
         END) as avg_payment_days

RETURN 
  company.id as company_id,
  company.name as company_name,
  company.service_tier as service_tier,
  company.annual_revenue as annual_revenue,
  
  // Support health indicators
  ticket_count,
  high_priority_tickets,
  open_tickets,
  sla_breaches,
  ROUND(avg_resolution_days, 2) as avg_resolution_days,
  
  // Project health indicators
  recent_projects,
  ROUND(avg_project_health, 2) as avg_project_health,
  risky_projects,
  
  // Financial health indicators
  recent_invoices,
  recent_revenue,
  overdue_amount,
  ROUND(avg_payment_days, 2) as avg_payment_days,
  
  // Days since last engagement
  CASE 
    WHEN last_ticket_date IS NOT NULL 
    THEN duration.between(last_ticket_date, datetime()).days 
    ELSE 999 
  END as days_since_last_contact,
  
  // Comprehensive churn risk score
  CASE 
    WHEN sla_breaches > 3 OR overdue_amount > 10000 OR open_tickets > 5 THEN 'CRITICAL'
    WHEN (ticket_count > 10 AND avg_resolution_days > 5) OR risky_projects > 1 OR avg_payment_days > 45 THEN 'HIGH'
    WHEN high_priority_tickets > 3 OR recent_revenue = 0 OR avg_project_health < 3 THEN 'MEDIUM'
    WHEN ticket_count = 0 AND recent_projects = 0 AND recent_revenue = 0 THEN 'HIGH' // Silent churn
    ELSE 'LOW'
  END as churn_risk_level

ORDER BY 
  CASE 
    WHEN churn_risk_level = 'CRITICAL' THEN 1
    WHEN churn_risk_level = 'HIGH' THEN 2
    WHEN churn_risk_level = 'MEDIUM' THEN 3
    ELSE 4
  END,
  days_since_last_contact DESC

LIMIT 100;

// =============================================================================
// QUERY 4: Project Profitability and Resource Utilization
// "¿Cuáles son los proyectos más rentables y qué recursos utilizan?"
// =============================================================================

MATCH (p:Project)-[:ASSIGNED_TO]->(e:Employee)
OPTIONAL MATCH (p)-[:GENERATES]->(i:Invoice)
WHERE i.status = 'paid'
OPTIONAL MATCH (p)-[:CONTAINS]->(tk:Task)-[:TRACKS_TIME]->(te:TimeEntry)-[:LOGGED_BY]->(e)

WITH p, e,
     SUM(i.total_amount) as total_revenue,
     SUM(te.hours * te.cost_rate) as total_cost,
     SUM(te.hours) as total_hours,
     AVG(e.hourly_rate) as avg_team_rate

WHERE total_revenue IS NOT NULL AND total_revenue > 0

RETURN 
  p.name as project_name,
  p.project_type as project_type,
  p.status as project_status,
  p.complexity_score as complexity,
  total_revenue,
  total_cost,
  ROUND(total_revenue - total_cost, 2) as profit,
  ROUND(((total_revenue - total_cost) / total_revenue) * 100, 2) as profit_margin_percent,
  total_hours,
  ROUND(total_revenue / total_hours, 2) as revenue_per_hour,
  ROUND(avg_team_rate, 2) as avg_team_rate,
  COUNT(DISTINCT e) as team_size,
  
  // Efficiency metrics
  ROUND(total_hours / COUNT(DISTINCT e), 2) as avg_hours_per_team_member,
  CASE 
    WHEN p.estimated_hours IS NOT NULL AND p.estimated_hours > 0
    THEN ROUND((total_hours / p.estimated_hours) * 100, 2)
    ELSE NULL
  END as hours_vs_estimate_percent

ORDER BY profit_margin_percent DESC
LIMIT 30;

// =============================================================================
// QUERY 5: Employee Performance and Workload Analysis
// "¿Cómo está distribuida la carga de trabajo y quién es más productivo?"
// =============================================================================

MATCH (e:Employee)
WHERE e.status = 'active'

// Get time entries for the last 30 days
OPTIONAL MATCH (e)-[:LOGGED_TIME]->(te:TimeEntry)
WHERE te.date >= date() - duration('P30D')

// Get assigned work items
OPTIONAL MATCH (e)<-[:ASSIGNED_TO]-(tk:Task)
OPTIONAL MATCH (e)<-[:ASSIGNED_TO]-(t:Ticket)
OPTIONAL MATCH (e)<-[:MANAGED_BY]-(p:Project)

// Aggregate performance metrics
WITH e,
     SUM(te.hours) as total_hours_30d,
     SUM(CASE WHEN te.billable = true THEN te.hours ELSE 0 END) as billable_hours_30d,
     SUM(te.hours * te.hourly_rate) as revenue_generated_30d,
     
     COUNT(DISTINCT tk) as assigned_tasks,
     COUNT(CASE WHEN tk.status = 'completed' THEN 1 END) as completed_tasks,
     COUNT(CASE WHEN tk.due_date < date() AND tk.status != 'completed' THEN 1 END) as overdue_tasks,
     
     COUNT(DISTINCT t) as assigned_tickets,
     COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets,
     AVG(CASE WHEN t.resolved_at IS NOT NULL 
         THEN duration.between(t.created_at, t.resolved_at).hours 
         END) as avg_ticket_resolution_hours,
     
     COUNT(DISTINCT p) as managed_projects,
     AVG(p.health_score) as avg_project_health

RETURN 
  e.first_name + ' ' + e.last_name as employee_name,
  e.job_title as job_title,
  e.department as department,
  e.hourly_rate as hourly_rate,
  
  // Time and utilization metrics
  ROUND(total_hours_30d, 2) as total_hours_last_30d,
  ROUND(billable_hours_30d, 2) as billable_hours_last_30d,
  ROUND((billable_hours_30d / CASE WHEN total_hours_30d > 0 THEN total_hours_30d ELSE 1 END) * 100, 2) as billability_percent,
  ROUND(total_hours_30d / 22, 2) as avg_hours_per_day, // Assuming 22 working days
  
  // Revenue and productivity
  ROUND(revenue_generated_30d, 2) as revenue_generated_30d,
  ROUND(revenue_generated_30d / CASE WHEN total_hours_30d > 0 THEN total_hours_30d ELSE 1 END, 2) as revenue_per_hour,
  
  // Task and project management
  assigned_tasks,
  completed_tasks,
  overdue_tasks,
  ROUND((completed_tasks / CASE WHEN assigned_tasks > 0 THEN assigned_tasks ELSE 1 END) * 100, 2) as task_completion_rate,
  
  // Support performance
  assigned_tickets,
  resolved_tickets,
  ROUND(avg_ticket_resolution_hours, 2) as avg_ticket_resolution_hours,
  
  // Project management
  managed_projects,
  ROUND(avg_project_health, 2) as avg_project_health,
  
  // Overall performance score
  CASE 
    WHEN billability_percent > 80 AND task_completion_rate > 90 AND avg_project_health > 4 THEN 'EXCELLENT'
    WHEN billability_percent > 70 AND task_completion_rate > 80 AND avg_project_health > 3 THEN 'GOOD'
    WHEN billability_percent > 60 AND task_completion_rate > 70 THEN 'AVERAGE'
    ELSE 'NEEDS_IMPROVEMENT'
  END as performance_rating

ORDER BY revenue_per_hour DESC
LIMIT 50;

// =============================================================================
// ADVANCED GRAPH ANALYTICS - RELATIONSHIP STRENGTH ANALYSIS
// =============================================================================

// Customer Relationship Strength Score
MATCH (company:Company)-[rel]-(entity)
WITH company, 
     COUNT(DISTINCT rel) as total_relationships,
     SIZE([r IN COLLECT(rel) WHERE type(r) IN ['RECEIVES', 'SPONSORS']]) as financial_relationships,
     SIZE([r IN COLLECT(rel) WHERE type(r) = 'SUBMITS']) as support_relationships,
     SIZE([r IN COLLECT(rel) WHERE type(r) = 'HAS']) as contact_relationships

RETURN 
  company.name as company_name,
  total_relationships,
  financial_relationships,
  support_relationships, 
  contact_relationships,
  ROUND((financial_relationships * 0.4 + support_relationships * 0.3 + contact_relationships * 0.3), 2) as relationship_strength_score

ORDER BY relationship_strength_score DESC
LIMIT 25;

// =============================================================================
// DATA INTEGRATION PROCEDURES (PostgreSQL <-> Neo4j Sync)
// =============================================================================

// Procedure to sync companies from PostgreSQL to Neo4j
CREATE OR REPLACE PROCEDURE sync.companies_from_postgresql()
LANGUAGE sql
AS $$
  // This would be implemented as a data pipeline in production
  // Using tools like Apache Kafka, Debezium, or custom ETL
  
  MERGE (c:Company {id: $company_id})
  SET c.name = $name,
      c.service_tier = $service_tier,
      c.status = $status,
      c.annual_revenue = $annual_revenue,
      c.last_sync = datetime()
$$;

// =============================================================================
// SAMPLE DATA FOR TESTING (Development Environment Only)
// =============================================================================

// Create sample company network
CREATE (acme:Company {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Acme Corp',
  service_tier: 'enterprise',
  status: 'active',
  annual_revenue: 2500000
});

CREATE (globodyne:Company {
  id: '22222222-2222-2222-2222-222222222222', 
  name: 'Globodyne Systems',
  service_tier: 'premium',
  status: 'active',
  annual_revenue: 850000
});

CREATE (john_doe:Employee {
  id: '33333333-3333-3333-3333-333333333333',
  name: 'John Doe',
  job_title: 'Senior Developer',
  hourly_rate: 85.00,
  department: 'Development'
});

CREATE (web_redesign:Project {
  id: '44444444-4444-4444-4444-444444444444',
  name: 'Website Redesign',
  status: 'active',
  budget: 45000,
  health_score: 4
});

// Create relationships
CREATE (acme)-[:SPONSORS]->(web_redesign);
CREATE (web_redesign)-[:MANAGED_BY]->(john_doe);

// =============================================================================
// MONITORING AND MAINTENANCE QUERIES
// =============================================================================

// Query to check graph database health and statistics
CALL db.stats.retrieve('GRAPH COUNTS') YIELD section, data
RETURN section, data;

// Query to identify performance bottlenecks
CALL db.indexes() YIELD name, state, populationPercent
WHERE state <> 'ONLINE' OR populationPercent < 100.0
RETURN name, state, populationPercent; 