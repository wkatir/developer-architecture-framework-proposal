CREATE CONSTRAINT IF NOT EXISTS ON (c:Client) ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS ON (p:Project) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS ON (i:Invoice) ASSERT i.id IS UNIQUE;

// Relationships example:
// (c:Client)-[:OWNS {since: timestamp}]->(p:Project)
// (p:Project)-[:BILLED_BY {amount:float,date}]->(i:Invoice) 