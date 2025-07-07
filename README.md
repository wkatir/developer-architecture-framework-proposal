# Developer Architecture Framework Proposal

This repo bundles:
- **LaTeX docs** (`main.tex` + `chapters/`) → `main.pdf`
- **Mermaid diagrams** (`diagrams/*.mmd`) → SVG
- **Reference assets** (`assets/`): Zoho hierarchy + assignment blueprints & specs
- **Prototype code** (`prototype/`): Node.js + Docker demonstration
- **Infrastructure code** (`infra/`): Terraform modules for cloud deployment

## Prerequisites
- LaTeX with `minted`, `pdfpages`, `geometry`, `hyperref`
- `latexmk`
- `mermaid-cli` (`npm install -g @mermaid-js/mermaid-cli`)
- Node.js ≥18, Docker & Docker Compose
- Terraform ≥1.0 (for infrastructure deployment)

## Quick Start

Follow these steps to build and run everything:

1. **Generate diagrams**
   ```bash
   make diagrams
   ```

2. **Build complete PDF report**
   ```bash
   make all
   ```

3. **Launch prototype stack**
   ```bash
   make prototype-up
   ```

4. **Smoke test with curl**
   ```bash
   # Test webhook endpoint
   curl -XPOST http://localhost:3000/zoho/webhook \
     -H 'Content-Type: application/json' \
     -d '{"event":"contact.created","data":{"id":"123"}}'
   
   # Test project query endpoint  
   curl http://localhost:3000/projects/123
   ```

## Cloud Infrastructure (General)

The `infra/` folder contains cloud-agnostic Terraform modules for deploying the DFAP framework to AWS, Azure, or GCP. The infrastructure follows security best practices with:

- **VPC Design**: Public subnets for load balancers, private subnets for applications and databases
- **Security Groups**: Least-privilege network access controls
- **Managed Services**: RDS PostgreSQL, managed message queues, secrets management
- **Monitoring**: CloudWatch/Azure Monitor integration with custom dashboards
- **High Availability**: Multi-AZ deployment with auto-scaling capabilities

### Infrastructure Deployment

```bash
# Initialize Terraform (one-time setup)
make infra-init

# Plan infrastructure changes
make infra-plan

# Deploy infrastructure
make infra-apply

# Clean up infrastructure (destructive!)
make infra-destroy
```

### Architecture Diagram

See `diagrams/cloud_architecture_general.svg` for the complete infrastructure layout showing:
- Internet → WAF → Load Balancer → Application tier
- Private subnets for PostgreSQL, Neo4j, RabbitMQ, and Secrets Manager
- Monitoring and backup services configuration

### Configuration

Key variables in `infra/variables.tf`:
- `allowed_cidrs`: Network access control (default: private RFC1918 ranges)
- `environment`: Deployment environment (dev/staging/prod)
- `aws_region`/`azure_region`/`gcp_region`: Cloud provider regions

The Terraform state should be stored remotely (S3, Azure Storage, or GCS) for team collaboration.
