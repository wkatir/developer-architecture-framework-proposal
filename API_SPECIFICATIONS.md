# DFAP Integration API - Complete Technical Specifications

## 📋 Executive Summary

The DFAP Integration API provides a comprehensive, enterprise-grade integration layer for Zoho One modules, specifically designed for Managed Service Provider (MSP) operations. This API enables seamless data flow between Zoho CRM, Desk, Projects, Books, People, and other modules while providing advanced analytics and business intelligence capabilities.

**Key Technical Features:**
- RESTful API design with OpenAPI 3.0 specification
- OAuth 2.0 + JWT authentication with scope-based access control
- Real-time webhook processing with guaranteed delivery
- Graph database analytics for complex relationship queries
- Horizontal scaling to 1,000+ concurrent users
- Multi-cloud deployment with Terraform infrastructure

**Base URL:** `https://api.dfap.com/api/v1`
**Authentication:** Bearer JWT + OAuth 2.0
**Content-Type:** `application/json`
**API Version:** `1.0.0`

---

## 🏗️ Architecture Overview

### System Architecture Decisions

The DFAP API employs several architectural patterns optimized for MSP business operations:

#### 1. Event-Driven Architecture
- **Asynchronous Processing:** Zoho webhooks trigger background jobs for non-blocking operations
- **Message Queues:** RabbitMQ ensures reliable event delivery with dead letter queues
- **Event Sourcing:** Complete audit trail of all business events for compliance

#### 2. Hybrid Data Strategy
- **PostgreSQL:** ACID-compliant transactional data (invoices, payments, projects)
- **Neo4j:** Complex relationship analysis (lead attribution, customer journeys)
- **Redis:** Real-time caching and session management

#### 3. Microservices Design
- **Domain Separation:** Independent services for CRM, support, billing, and analytics
- **API Gateway:** Centralized authentication, rate limiting, and request routing
- **Service Mesh:** Istio for inter-service communication and monitoring

### Performance Characteristics

| Metric | Target | Monitoring |
|--------|--------|------------|
| API Latency (p95) | < 200ms | Prometheus + Grafana |
| Throughput | 1,000+ req/sec | Load balancer metrics |
| Availability | 99.9% SLA | Uptime monitoring |
| Error Rate | < 0.1% | Error tracking |
| Webhook Processing | < 5 seconds | Queue depth monitoring |

---

## 🔐 Authentication & Security Architecture

### OAuth 2.0 Integration Strategy

The DFAP API implements a comprehensive OAuth 2.0 strategy for Zoho One integration:

```yaml
oauth_configuration:
  authorization_endpoint: "https://accounts.zoho.com/oauth/v2/auth"
  token_endpoint: "https://accounts.zoho.com/oauth/v2/token"
  refresh_endpoint: "https://accounts.zoho.com/oauth/v2/token"
  
  # Granular scopes for each Zoho module
  scopes:
    zoho_crm: "ZohoCRM.modules.ALL,ZohoCRM.users.READ,ZohoCRM.settings.READ"
    zoho_desk: "Desk.tickets.ALL,Desk.contacts.READ,Desk.agents.READ"
    zoho_projects: "ZohoProjects.projects.ALL,ZohoProjects.timesheets.READ"
    zoho_books: "ZohoBooks.invoices.ALL,ZohoBooks.contacts.READ,ZohoBooks.items.READ"
    zoho_people: "ZohoPeople.employee.READ,ZohoPeople.attendance.READ"
    zoho_expense: "ZohoExpense.expenses.ALL,ZohoExpense.reports.READ"
    zoho_campaigns: "ZohoCampaigns.campaigns.ALL,ZohoCampaigns.lists.READ"
    zoho_cliq: "ZohoCliq.channels.ALL,ZohoCliq.chats.READ"
    zoho_analytics: "ZohoAnalytics.data.READ,ZohoAnalytics.workspaces.READ"

# Internal API security scopes
security_scopes:
  webhook_processing: ["webhook:read", "webhook:write"]
  lead_management: ["crm:read", "crm:write", "desk:write"]
  project_operations: ["projects:read", "projects:write", "books:write"]
  financial_operations: ["books:read", "books:write", "expense:read"]
  analytics_access: ["analytics:read", "reports:read"]
  admin_operations: ["admin:read", "admin:write", "audit:read"]
```

### JWT Token Structure & Claims

```json
{
  "sub": "user_id_12345",
  "iss": "dfap-api",
  "aud": "dfap-clients",
  "exp": 1735689600,
  "iat": 1704153600,
  "scope": ["crm:read", "projects:write", "analytics:read"],
  "roles": ["project_manager", "finance_user"],
  "tenant_id": "company_abc_123",
  "zoho_org_id": "12345678",
  "permissions": {
    "companies": ["read", "update"],
    "projects": ["read", "write", "delete"],
    "invoices": ["read"],
    "analytics": ["read"]
  },
  "rate_limit": {
    "requests_per_minute": 1000,
    "burst_capacity": 100
  }
}
```

### Security Headers & Middleware

```typescript
// Express.js security middleware configuration
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { verifyJWT, validateScopes } from './auth/middleware';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting by user and endpoint
const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => `${req.user?.id || req.ip}:${req.route?.path}`,
    standardHeaders: true,
    legacyHeaders: false,
  });

// Different limits for different endpoints
app.use('/api/v1/webhooks', createRateLimit(60000, 1000)); // 1000/min for webhooks
app.use('/api/v1/analytics', createRateLimit(60000, 100));  // 100/min for analytics
app.use('/api/v1', createRateLimit(60000, 500));            // 500/min general API
```

---

## 📡 Webhook Processing Architecture

### Advanced Webhook Handler

The webhook processing system handles high-volume, real-time events from Zoho modules with guaranteed processing and retry mechanisms.

#### **POST** `/webhooks/zoho/{module}`

Unified webhook endpoint supporting all Zoho One modules with advanced processing capabilities.

**Path Parameters:**
- `module` (required): Zoho module identifier
  - Allowed values: `crm|desk|projects|books|people|expense|campaigns|cliq|analytics`

**Headers:**
```http
Content-Type: application/json
X-Zoho-Signature: sha256=<hmac_signature>
X-Zoho-Module: crm
X-Zoho-Org-Id: 12345678
X-Correlation-ID: uuid-v4
User-Agent: Zoho-Webhook/1.0
```

**Request Body Schema:**
```json
{
  "event_type": "contact.created",
  "module": "crm",
  "timestamp": "2024-01-15T10:30:00Z",
  "org_id": "12345678",
  "webhook_id": "wh_abc123def456",
  "retry_count": 0,
  "data": {
    "id": "3652397000000523001",
    "entity_type": "Contact",
    "operation": "insert",
    "resource_uri": "/crm/v2/Contacts/3652397000000523001",
    "changed_fields": ["First_Name", "Email", "Phone"],
    "details": {
      "First_Name": "John",
      "Last_Name": "Doe", 
      "Email": "john.doe@example.com",
      "Phone": "+1-555-123-4567",
      "Account_Name": "Acme Corp",
      "Lead_Source": "Website",
      "Industry": "Technology",
      "Annual_Revenue": 2500000
    }
  },
  "blueprint_context": {
    "blueprint_id": "lead_onboarding_v1",
    "current_state": "lead_received",
    "previous_state": null,
    "trigger_conditions": {
      "lead_score": 85,
      "budget_confirmed": true,
      "decision_maker_contacted": true
    },
    "state_data": {
      "assigned_sales_rep": "emp_12345",
      "expected_close_date": "2024-02-15",
      "estimated_value": 45000
    }
  },
  "context": {
    "user_id": "user_789",
    "ip_address": "203.0.113.1",
    "user_agent": "Mozilla/5.0...",
    "session_id": "sess_abc123"
  }
}
```

**Response Schema:**
```json
{
  "success": true,
  "webhook_id": "wh_1234567890",
  "processing_time_ms": 150,
  "correlation_id": "corr_abc123def456",
  "events_triggered": [
    "blueprint.state_transition",
    "notification.email_sent", 
    "desk.ticket_created",
    "analytics.lead_scored"
  ],
  "blueprints_executed": [
    {
      "blueprint_id": "lead_onboarding_v1",
      "execution_id": "exec_9876543210",
      "status": "running",
      "current_state": "review_pending",
      "next_state": "technical_evaluation",
      "estimated_completion": "2024-01-15T11:00:00Z",
      "actions_completed": [
        "crm.lead_scored",
        "desk.ticket_created",
        "people.sales_rep_assigned"
      ],
      "actions_pending": [
        "projects.technical_assessment",
        "books.quote_generation"
      ]
    }
  ],
  "data_updates": {
    "postgresql": {
      "tables_affected": ["companies", "contacts", "leads"],
      "records_created": 1,
      "records_updated": 2
    },
    "neo4j": {
      "nodes_created": 1,
      "relationships_created": 3,
      "properties_updated": 5
    }
  },
  "cache_invalidated": [
    "company_health_dashboard",
    "lead_pipeline_metrics"
  ]
}
```

### Webhook Processing Flow

```typescript
// Advanced webhook processing with error handling
@Controller('webhooks/zoho')
export class ZohoWebhookController {
  
  @Post(':module')
  @UseGuards(WebhookSignatureGuard)
  @UseInterceptors(CorrelationInterceptor, LoggingInterceptor)
  async handleWebhook(
    @Param('module') module: ZohoModule,
    @Body() payload: ZohoWebhookPayload,
    @Headers() headers: ZohoWebhookHeaders
  ): Promise<WebhookResponse> {
    
    const startTime = Date.now();
    const correlationId = headers['x-correlation-id'] || uuid();
    
    try {
      // 1. Validate webhook signature
      await this.webhookValidator.validateSignature(headers, payload);
      
      // 2. Deduplicate webhook (handle retries)
      const isDuplicate = await this.webhookDeduplicator.check(
        payload.webhook_id,
        payload.retry_count
      );
      
      if (isDuplicate) {
        return { success: true, message: 'Webhook already processed' };
      }
      
      // 3. Enqueue for async processing
      const job = await this.webhookQueue.add('process-webhook', {
        module,
        payload,
        correlationId,
        timestamp: new Date()
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50
      });
      
      // 4. Trigger immediate actions (if any)
      const immediateActions = await this.blueprintEngine.getImmediateActions(
        payload.blueprint_context
      );
      
      const executedActions = [];
      for (const action of immediateActions) {
        try {
          const result = await this.actionExecutor.execute(action, payload);
          executedActions.push(result);
        } catch (error) {
          this.logger.warn(`Immediate action failed: ${action.type}`, error);
        }
      }
      
      // 5. Return success response
      return {
        success: true,
        webhook_id: payload.webhook_id,
        processing_time_ms: Date.now() - startTime,
        correlation_id: correlationId,
        job_id: job.id,
        events_triggered: executedActions.map(a => a.event_type),
        status: 'queued_for_processing'
      };
      
    } catch (error) {
      this.logger.error('Webhook processing failed', error, { 
        correlationId, 
        module, 
        webhookId: payload.webhook_id 
      });
      
      throw new BadRequestException({
        error: 'webhook_processing_failed',
        message: error.message,
        correlation_id: correlationId,
        retry_after: 60 // seconds
      });
    }
  }
}
```

---

## 🎯 Lead Management & CRM Integration

### Advanced Lead Processing

#### **POST** `/api/v1/leads`

Create and process leads with automatic scoring, assignment, and blueprint triggering.

**Request Body:**
```json
{
  "lead_data": {
    "personal_info": {
      "first_name": "Jane",
      "last_name": "Smith", 
      "email": "jane.smith@company.com",
      "phone": "+1-555-123-4567",
      "mobile": "+1-555-987-6543",
      "preferred_contact_method": "email"
    },
    "company_info": {
      "company_name": "Tech Solutions Inc",
      "industry": "Software Development",
      "company_size": "medium",
      "annual_revenue": 5000000,
      "website": "https://techsolutions.com",
      "primary_domain": "techsolutions.com"
    },
    "role_info": {
      "job_title": "IT Director",
      "department": "Information Technology",
      "seniority_level": "senior",
      "decision_maker": true
    },
    "project_info": {
      "project_type": "cloud_migration",
      "estimated_budget": 50000,
      "timeline": "Q2 2024",
      "urgency": "high",
      "description": "Cloud migration project for 200+ user environment",
      "pain_points": [
        "Legacy infrastructure maintenance costs",
        "Security compliance requirements",
        "Remote work scalability issues"
      ],
      "requirements": {
        "services": ["cloud_migration", "data_backup", "security_audit"],
        "team_size": "50-100 employees",
        "compliance": ["SOC2", "HIPAA", "PCI"],
        "timeline_flexibility": "medium",
        "budget_flexibility": "low"
      }
    }
  },
  "campaign_attribution": {
    "campaign_id": "camp_123456",
    "utm_source": "google",
    "utm_medium": "cpc", 
    "utm_campaign": "cloud_services_q1",
    "utm_content": "migration_ad_v2",
    "utm_term": "cloud migration services",
    "referrer": "https://google.com/search",
    "landing_page": "/services/cloud-migration",
    "session_id": "sess_abc123"
  },
  "lead_scoring": {
    "auto_score": true,
    "scoring_model": "enterprise_v2",
    "manual_adjustments": {
      "industry_fit": 10,
      "budget_qualification": 15,
      "timeline_urgency": 5
    }
  },
  "blueprint_options": {
    "auto_trigger": true,
    "blueprint_id": "lead_onboarding_v1",
    "skip_qualification": false,
    "priority": "high",
    "custom_variables": {
      "lead_type": "inbound",
      "channel": "digital_marketing"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "lead": {
    "id": "lead_789012345",
    "zoho_lead_id": "3652397000000523001",
    "status": "new",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "scoring": {
    "total_score": 85,
    "score_breakdown": {
      "company_fit": 25,
      "budget_qualification": 20,
      "decision_maker": 15,
      "timeline_urgency": 10,
      "industry_experience": 15
    },
    "qualification_status": "qualified",
    "recommendations": [
      "High-priority lead - assign senior sales rep",
      "Schedule technical discovery call within 24 hours",
      "Prepare cloud migration assessment"
    ]
  },
  "blueprint_execution": {
    "blueprint_id": "lead_onboarding_v1",
    "execution_id": "exec_abc123def456",
    "status": "initiated",
    "current_state": "lead_received",
    "next_actions": [
      {
        "action": "desk.create_qualification_ticket",
        "estimated_completion": "2024-01-15T10:35:00Z",
        "assigned_to": "system"
      },
      {
        "action": "people.assign_sales_rep",
        "estimated_completion": "2024-01-15T10:45:00Z",
        "assigned_to": "sales_manager"
      },
      {
        "action": "cliq.notify_sales_channel",
        "estimated_completion": "2024-01-15T10:31:00Z",
        "assigned_to": "system"
      }
    ],
    "estimated_total_completion": "2024-01-20T17:00:00Z"
  },
  "automatic_actions": {
    "qualification_ticket": {
      "ticket_id": "tick_456789",
      "ticket_number": "SUP-2024-001523",
      "status": "created",
      "assigned_to": "emp_sales_01",
      "priority": "high"
    },
    "sales_assignment": {
      "assigned_sales_rep": {
        "employee_id": "emp_sales_01",
        "name": "Michael Johnson",
        "email": "michael.johnson@company.com",
        "specializations": ["cloud_migration", "enterprise_sales"]
      },
      "assignment_reason": "Best match for cloud migration expertise and enterprise segment"
    },
    "notifications": {
      "cliq_channel_notified": "sales-team-enterprise",
      "email_notifications": [
        {
          "recipient": "michael.johnson@company.com",
          "template": "new_qualified_lead",
          "status": "sent"
        }
      ],
      "slack_integration": {
        "channel": "#sales-alerts",
        "message_id": "slack_msg_123"
      }
    }
  },
  "data_synchronization": {
    "zoho_crm": {
      "lead_created": true,
      "lead_id": "3652397000000523001",
      "sync_status": "completed"
    },
    "internal_database": {
      "postgresql_record": "lead_789012345",
      "neo4j_node": "Lead:789012345",
      "relationships_created": [
        "Lead:789012345 -[GENERATED_BY]-> Campaign:123456",
        "Lead:789012345 -[ASSIGNED_TO]-> Employee:sales_01"
      ]
    }
  },
  "next_steps": {
    "immediate": [
      "Sales rep will contact within 2 hours",
      "Technical discovery call to be scheduled"
    ],
    "short_term": [
      "Prepare cloud migration assessment",
      "Review compliance requirements",
      "Generate initial project estimate"
    ],
    "follow_up_schedule": {
      "first_contact": "2024-01-15T12:30:00Z",
      "follow_up_1": "2024-01-16T09:00:00Z", 
      "follow_up_2": "2024-01-18T14:00:00Z"
    }
  }
}
```

---

## 📊 Analytics & Business Intelligence

### Advanced Graph Analytics

#### **GET** `/api/v1/analytics/revenue-attribution`

Comprehensive revenue attribution analysis using graph database queries.

**Query Parameters:**
```http
GET /api/v1/analytics/revenue-attribution?
  start_date=2024-01-01&
  end_date=2024-01-31&
  attribution_model=multi_touch&
  grouping=campaign,source&
  include_indirect=true&
  min_revenue=1000
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "query_execution_time_ms": 245,
    "total_records": 1247,
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "attribution_model": "multi_touch",
    "filters_applied": {
      "min_revenue": 1000,
      "include_indirect": true
    }
  },
  "summary": {
    "total_revenue": 1250000,
    "attributed_revenue": 1125000,
    "attribution_rate": 90.0,
    "campaigns_analyzed": 15,
    "leads_tracked": 324,
    "conversions": 47
  },
  "attribution_results": [
    {
      "campaign": {
        "id": "camp_123456",
        "name": "Q1 Cloud Migration Campaign",
        "type": "google_ads",
        "budget": 25000
      },
      "attribution": {
        "direct_revenue": 450000,
        "influenced_revenue": 125000,
        "total_attributed": 575000,
        "attribution_percentage": 51.1,
        "roi": 23.0
      },
      "funnel_metrics": {
        "leads_generated": 89,
        "qualified_leads": 34,
        "opportunities_created": 12,
        "closed_won": 8,
        "conversion_rate": 8.99
      },
      "revenue_journey": [
        {
          "lead_id": "lead_789",
          "lead_source": "google_ads",
          "lead_created": "2024-01-05T10:30:00Z",
          "qualification_date": "2024-01-06T14:20:00Z",
          "opportunity_value": 75000,
          "project_started": "2024-01-15T09:00:00Z",
          "revenue_generated": 75000,
          "project_status": "completed",
          "attribution_path": [
            "google_ads -> landing_page -> demo_request",
            "sales_call -> technical_review -> proposal",
            "negotiation -> contract_signed -> project_delivery"
          ]
        }
      ]
    }
  ],
  "insights": {
    "top_performing_campaigns": [
      {
        "campaign_name": "Q1 Cloud Migration Campaign",
        "roi": 23.0,
        "revenue": 575000
      }
    ],
    "optimization_recommendations": [
      "Increase budget for 'Q1 Cloud Migration Campaign' (highest ROI)",
      "Investigate low conversion rate in 'Social Media Lead Gen' campaign",
      "Consider A/B testing landing pages for 'Content Marketing' funnel"
    ],
    "attribution_gaps": {
      "unattributed_revenue": 125000,
      "possible_causes": [
        "Direct referrals without tracking",
        "Offline interactions",
        "Long sales cycles crossing date boundaries"
      ]
    }
  }
}
```

### Customer Health Scoring

#### **GET** `/api/v1/analytics/customer-health/{company_id}`

Advanced customer health analysis combining support, financial, and project metrics.

**Response:**
```json
{
  "success": true,
  "company": {
    "id": "comp_123456",
    "name": "Acme Corporation",
    "service_tier": "enterprise",
    "account_manager": "John Smith"
  },
  "health_score": {
    "overall_score": 7.8,
    "previous_score": 8.2,
    "trend": "declining",
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "score_breakdown": {
    "support_health": {
      "score": 6.5,
      "weight": 30,
      "metrics": {
        "tickets_last_30d": 15,
        "avg_resolution_time": 18.5,
        "sla_breaches": 2,
        "satisfaction_score": 4.2,
        "escalation_rate": 13.3
      }
    },
    "financial_health": {
      "score": 8.5,
      "weight": 35,
      "metrics": {
        "payment_timeliness": 92.3,
        "outstanding_balance": 5200,
        "revenue_trend": "growing",
        "contract_value": 125000,
        "payment_delays": 1
      }
    },
    "project_health": {
      "score": 8.9,
      "weight": 25,
      "metrics": {
        "active_projects": 3,
        "on_time_delivery": 89.7,
        "budget_adherence": 95.4,
        "scope_changes": 2,
        "client_satisfaction": 4.6
      }
    },
    "engagement_health": {
      "score": 7.2,
      "weight": 10,
      "metrics": {
        "communication_frequency": "weekly",
        "response_time": 4.2,
        "meeting_attendance": 85.7,
        "feature_adoption": 72.3
      }
    }
  },
  "risk_factors": [
    {
      "type": "support_issues",
      "severity": "medium",
      "description": "Increased ticket volume with SLA breaches",
      "impact": "Customer satisfaction declining",
      "recommendation": "Schedule proactive health check call"
    },
    {
      "type": "satisfaction_decline",
      "severity": "low",
      "description": "Support satisfaction dropped from 4.8 to 4.2",
      "impact": "Potential renewal risk",
      "recommendation": "Follow up on recent support cases"
    }
  ],
  "opportunities": [
    {
      "type": "upsell",
      "confidence": 85,
      "description": "Strong project delivery and financial health",
      "estimated_value": 50000,
      "recommendation": "Propose additional cloud services"
    }
  ],
  "action_items": [
    {
      "priority": "high",
      "action": "Schedule customer success review",
      "owner": "customer_success_manager",
      "due_date": "2024-01-20",
      "description": "Address support concerns and explore expansion opportunities"
    }
  ],
  "historical_trend": {
    "timeframe": "last_6_months",
    "data_points": [
      { "month": "2023-08", "score": 8.5 },
      { "month": "2023-09", "score": 8.7 },
      { "month": "2023-10", "score": 8.4 },
      { "month": "2023-11", "score": 8.1 },
      { "month": "2023-12", "score": 8.2 },
      { "month": "2024-01", "score": 7.8 }
    ]
  }
}
```

---

## ⚡ Error Handling & Status Codes

### Comprehensive Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": "The 'email' field must be a valid email address",
    "correlation_id": "corr_abc123def456",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_987654321"
  },
  "validation_errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Must be a valid email address",
      "provided_value": "invalid-email"
    },
    {
      "field": "phone",
      "code": "REQUIRED_FIELD",
      "message": "Phone number is required for enterprise tier"
    }
  ],
  "retry_info": {
    "retryable": false,
    "retry_after": null,
    "max_retries": null
  },
  "help": {
    "documentation": "https://api.dfap.com/docs/errors/validation",
    "support_contact": "api-support@dfap.com"
  }
}
```

### HTTP Status Code Reference

| Status Code | Description | Use Case | Retry Strategy |
|------------|-------------|----------|----------------|
| 200 | OK | Successful GET request | N/A |
| 201 | Created | Resource created successfully | N/A |
| 202 | Accepted | Async operation initiated | Poll status endpoint |
| 400 | Bad Request | Invalid request format | Fix request, don't retry |
| 401 | Unauthorized | Invalid/missing authentication | Refresh token, retry |
| 403 | Forbidden | Insufficient permissions | Check scopes, don't retry |
| 404 | Not Found | Resource doesn't exist | Don't retry |
| 409 | Conflict | Resource already exists | Check existing resource |
| 422 | Unprocessable Entity | Valid format, invalid data | Fix data, don't retry |
| 429 | Too Many Requests | Rate limit exceeded | Exponential backoff |
| 500 | Internal Server Error | Server error | Retry with backoff |
| 502 | Bad Gateway | Upstream service error | Retry with backoff |
| 503 | Service Unavailable | Temporary unavailability | Retry with backoff |

---

## 🚀 Performance & Scalability

### API Performance Metrics

```yaml
performance_targets:
  latency:
    p50: "<100ms"
    p95: "<200ms" 
    p99: "<500ms"
  throughput:
    target: "1000 req/sec"
    burst: "2000 req/sec"
  availability:
    sla: "99.9%"
    monthly_downtime: "<43 minutes"
  
caching_strategy:
  redis_cache:
    ttl: "5 minutes"
    max_memory: "2GB"
    eviction_policy: "allkeys-lru"
  
  application_cache:
    company_data: "15 minutes"
    user_permissions: "30 minutes"
    analytics_queries: "1 hour"

rate_limiting:
  default: "500 req/min"
  premium: "1000 req/min"
  enterprise: "2000 req/min"
  burst_multiplier: 2
```

### Monitoring & Observability

```typescript
// Prometheus metrics collection
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const apiMetrics = {
  httpRequestsTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_tier']
  }),
  
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }),
  
  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
  }),
  
  queueDepth: new Gauge({
    name: 'queue_depth',
    help: 'Number of messages in processing queue',
    labelNames: ['queue_name']
  })
};
```

---

## 📚 SDK & Integration Examples

### TypeScript SDK Usage

```typescript
import { DFAPClient } from '@dfap/sdk';

const client = new DFAPClient({
  baseUrl: 'https://api.dfap.com/api/v1',
  apiKey: process.env.DFAP_API_KEY,
  timeout: 10000,
  retryConfig: {
    retries: 3,
    backoff: 'exponential'
  }
});

// Create a lead with automatic processing
const lead = await client.leads.create({
  leadData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    company: 'Acme Corp'
  },
  blueprintOptions: {
    autoTrigger: true,
    priority: 'high'
  }
});

// Monitor blueprint execution
const execution = await client.blueprints.getExecution(
  lead.blueprintExecution.executionId
);

console.log(`Blueprint status: ${execution.status}`);
```

### Python Integration Example

```python
import asyncio
from dfap_sdk import DFAPClient
from dfap_sdk.models import Lead, BlueprintOptions

async def process_leads():
    client = DFAPClient(
        api_key=os.getenv('DFAP_API_KEY'),
        base_url='https://api.dfap.com/api/v1'
    )
    
    # Batch lead processing
    leads = [
        Lead(first_name='John', last_name='Doe', email='john@example.com'),
        Lead(first_name='Jane', last_name='Smith', email='jane@example.com')
    ]
    
    results = await client.leads.create_batch(
        leads=leads,
        blueprint_options=BlueprintOptions(
            auto_trigger=True,
            priority='medium'
        )
    )
    
    for result in results:
        print(f"Lead {result.id} created with score {result.scoring.total_score}")

asyncio.run(process_leads())
```

---

## 🔧 Development & Testing

### API Testing Strategy

```typescript
// Jest integration test example
describe('Lead Creation API', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('should create lead and trigger blueprint', async () => {
    const leadData = {
      leadData: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      },
      blueprintOptions: {
        autoTrigger: true
      }
    };
    
    const response = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send(leadData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.lead.id).toBeDefined();
    expect(response.body.blueprintExecution.status).toBe('initiated');
  });
});
```

This comprehensive API specification provides the technical foundation for a scalable, enterprise-grade MSP integration platform with Zoho One. 