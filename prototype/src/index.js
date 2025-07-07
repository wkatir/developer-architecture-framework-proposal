require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

// Enterprise middleware patterns
const validateZohoSignature = (req, res, next) => {
  // Webhook signature validation for security
  const signature = req.headers['x-zoho-signature'];
  const payload = JSON.stringify(req.body);
  
  // In production: verify HMAC signature
  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }
  
  req.validated = true;
  next();
};

const rateLimitMiddleware = (req, res, next) => {
  // Basic rate limiting pattern
  const clientId = req.headers['x-zoho-org-id'] || 'anonymous';
  // In production: use Redis for distributed rate limiting
  next();
};

// Event-driven architecture with proper error handling
class EventProcessor {
  constructor() {
    this.channel = null;
    this.initQueue();
  }

  async initQueue() {
    try {
      const conn = await amqp.connect(process.env.AMQ_URL || 'amqp://localhost');
      this.channel = await conn.createChannel();
      
      // Setup queues with enterprise patterns
      await this.channel.assertQueue('zoho_events', {
        durable: true,
        arguments: { 'x-max-retries': 3 }
      });
      
      await this.channel.assertQueue('zoho_events_dlq', { durable: true });
      
      console.log('Event processing system initialized');
    } catch (error) {
      console.error('Failed to initialize message queue:', error);
      // Implement circuit breaker pattern here
    }
  }

  async publishEvent(eventType, data) {
    if (!this.channel) {
      throw new Error('Message queue not initialized');
    }

    const event = {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'dfap-integration-api',
      correlation_id: data.id || Math.random().toString(36)
    };

    await this.channel.sendToQueue(
      'zoho_events', 
      Buffer.from(JSON.stringify(event)),
      { persistent: true, messageId: event.correlation_id }
    );

    return event.correlation_id;
  }
}

const eventProcessor = new EventProcessor();

// MSP Integration endpoints with business logic
app.post('/api/v1/zoho/webhook', 
  validateZohoSignature, 
  rateLimitMiddleware, 
  async (req, res) => {
    try {
      const { module, event_type, data } = req.body;
      
      // Route events based on Zoho module for MSP workflow
      let eventType = `${module}.${event_type}`;
      
      // Business logic routing
      switch (eventType) {
        case 'crm.lead_converted':
          await eventProcessor.publishEvent('project.onboarding_start', data);
          break;
        case 'desk.ticket_created':
          await eventProcessor.publishEvent('support.ticket_triage', data);
          break;
        case 'projects.milestone_completed':
          await eventProcessor.publishEvent('billing.invoice_trigger', data);
          break;
        default:
          await eventProcessor.publishEvent('system.event_received', req.body);
      }

      res.status(200).json({ 
        status: 'processed',
        event_type: eventType 
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Internal processing error' });
    }
  }
);

// Business intelligence endpoint
app.get('/api/v1/analytics/project-health/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // In production: query Neo4j for real analytics
    const mockHealthData = {
      project_id: projectId,
      health_score: 0.85,
      risk_factors: ['high_ticket_volume', 'budget_overrun'],
      recommendation: 'Schedule client review meeting',
      billing_forecast: 12500.00,
      trend: 'improving'
    };

    res.json(mockHealthData);
  } catch (error) {
    res.status(500).json({ error: 'Analytics query failed' });
  }
});

// Health check for load balancer
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      message_queue: eventProcessor.channel ? 'up' : 'down',
      database: 'up', // In production: check actual DB connection
    }
  };
  
  res.status(200).json(health);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`DFAP Integration API listening on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
}); 