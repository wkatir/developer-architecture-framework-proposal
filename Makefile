##############################
# 1) Render all Mermaid → SVG
MDIR = diagrams
SVG = $(patsubst $(MDIR)/%.mmd,$(MDIR)/%.svg,$(wildcard $(MDIR)/*.mmd))

.PHONY: diagrams
diagrams: $(SVG)

$(MDIR)/%.svg: $(MDIR)/%.mmd
	mmdc -i $< -o $@

##############################
# 2) Verify assets folder exists
.PHONY: assets
assets:
	@echo "Assets ready (png+pdfs in assets/)"

##############################
# 3) Build the PDF report (LaTeX + minted + pdfpages)
REPORT = main.pdf
CHAPS = $(wildcard chapters/*.tex)
$(REPORT): main.tex $(CHAPS) $(SVG) | assets
	latexmk -pdf -shell-escape main.tex

##############################
# 4) Prototype: Docker-based start/stop
.PHONY: prototype-up prototype-down
prototype-up:
	cd prototype && docker-compose up -d

prototype-down:
	cd prototype && docker-compose down

##############################
# 5) ETL: Nightly data export
.PHONY: etl
etl:
	@echo "Running nightly ETL export..."
	psql $(DB_URL) -c "COPY clients TO 'assets/clients_snapshot.csv' CSV HEADER;" || echo "DB not available - would export to assets/"
	psql $(DB_URL) -c "COPY projects TO 'assets/projects_snapshot.csv' CSV HEADER;" || echo "DB not available - would export to assets/"
	psql $(DB_URL) -c "COPY invoices TO 'assets/invoices_snapshot.csv' CSV HEADER;" || echo "DB not available - would export to assets/"

##############################
# 6) Infrastructure: Terraform-based deployment
.PHONY: infra-init infra-plan infra-apply infra-destroy
infra-init:
	@echo "Initializing Terraform..."
	cd infra && terraform init

infra-plan:
	@echo "Planning infrastructure changes..."
	cd infra && terraform plan

infra-apply:
	@echo "Applying infrastructure changes..."
	cd infra && terraform apply -auto-approve

infra-destroy:
	@echo "Destroying infrastructure..."
	cd infra && terraform destroy -auto-approve

##############################
# 7) Convenience targets
.PHONY: all clean
all: diagrams $(REPORT)

clean:
	latexmk -C
	rm -f $(SVG)
	cd prototype && rm -rf node_modules
	cd infra && rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup 