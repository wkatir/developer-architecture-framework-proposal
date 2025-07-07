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
# 5) Convenience targets
.PHONY: all clean
all: diagrams $(REPORT)

clean:
	latexmk -C
	rm -f $(SVG)
	cd prototype && rm -rf node_modules 