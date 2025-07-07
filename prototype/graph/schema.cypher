// Graph Schema & Business Intelligence Queries
// Demonstrates enterprise-level graph analytics architecture

// === CONSTRAINTS & INDEXES ===
CREATE CONSTRAINT client_id_unique IF NOT EXISTS ON (c:Client) ASSERT c.zoho_id IS UNIQUE;
CREATE CONSTRAINT project_id_unique IF NOT EXISTS ON (p:Project) ASSERT p.zoho_id IS UNIQUE;
CREATE CONSTRAINT invoice_id_unique IF NOT EXISTS ON (i:Invoice) ASSERT i.zoho_id IS UNIQUE;
CREATE CONSTRAINT ticket_id_unique IF NOT EXISTS ON (t:Ticket) ASSERT t.zoho_id IS UNIQUE;

// Performance indexes for common traversals
CREATE INDEX project_status_idx IF NOT EXISTS FOR (p:Project) ON (p.status);
CREATE INDEX invoice_amount_idx IF NOT EXISTS FOR (i:Invoice) ON (i.amount);

// === SAMPLE DATA MODEL ===
// Relationship patterns that demonstrate MSP business logic:
// (c:Client)-[:HAS_PROJECT {since: date}]->(p:Project)
// (p:Project)-[:GENERATES {amount: float, date: date}]->(i:Invoice)
// (c:Client)-[:OPENS {priority: string, created: datetime}]->(t:Ticket)
// (t:Ticket)-[:BELONGS_TO {category: string}]->(p:Project)

// === BUSINESS INTELLIGENCE QUERIES ===

// Query 1: Project Health Analysis (Risk Assessment)
// Identifies projects at risk based on ticket volume vs billing
MATCH (c:Client)-[:HAS_PROJECT]->(p:Project)
MATCH (p)-[:GENERATES]->(i:Invoice)
OPTIONAL MATCH (c)-[:OPENS]->(t:Ticket)-[:BELONGS_TO]->(p)
WITH p, c, 
     sum(i.amount) as total_revenue,
     count(t) as ticket_count,
     avg(i.amount) as avg_invoice
WHERE total_revenue > 0
RETURN p.name as project_name,
       c.name as client_name,
       total_revenue,
       ticket_count,
       CASE 
         WHEN ticket_count > 10 AND total_revenue < 5000 THEN 'HIGH_RISK'
         WHEN ticket_count > 5 AND total_revenue < 10000 THEN 'MEDIUM_RISK'
         ELSE 'LOW_RISK'
       END as risk_level
ORDER BY ticket_count DESC, total_revenue ASC;

// Query 2: Client Revenue Attribution (Marketing ROI)
// Traces which campaigns generated the most valuable projects
MATCH (camp:Campaign)-[:GENERATED]->(lead:Lead)
MATCH (lead)-[:BECOMES]->(c:Client)
MATCH (c)-[:HAS_PROJECT]->(p:Project)-[:GENERATES]->(i:Invoice)
WITH camp, sum(i.amount) as campaign_revenue, count(DISTINCT c) as clients_acquired
WHERE campaign_revenue > 1000
RETURN camp.name as campaign_name,
       campaign_revenue,
       clients_acquired,
       round(campaign_revenue / clients_acquired) as revenue_per_client
ORDER BY campaign_revenue DESC;

// Query 3: Service Capacity Planning
// Identifies bottlenecks in service delivery
MATCH (u:User)-[:ASSIGNED_TO]->(p:Project)
MATCH (p)-[:HAS_TICKET]->(t:Ticket)
WHERE t.status IN ['OPEN', 'IN_PROGRESS']
WITH u, count(t) as open_tickets, count(DISTINCT p) as active_projects
RETURN u.name as engineer_name,
       active_projects,
       open_tickets,
       round(open_tickets * 1.0 / active_projects, 2) as tickets_per_project
ORDER BY tickets_per_project DESC; 