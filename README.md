# Developer Architecture Framework Proposal

This repo bundles:
- **LaTeX docs** (`main.tex` + `chapters/`) → `main.pdf`
- **Mermaid diagrams** (`diagrams/*.mmd`) → SVG
- **Reference assets** (`assets/`): Zoho hierarchy + assignment blueprints & specs
- **Prototype code** (`prototype/`): Node.js + Docker demonstration

## Prerequisites
- LaTeX with `minted`, `pdfpages`, `geometry`, `hyperref`
- `latexmk`
- `mermaid-cli` (`npm install -g @mermaid-js/mermaid-cli`)
- Node.js ≥18, Docker & Docker Compose

## Build & Run

```bash
# Generate diagrams
make diagrams

# Compile full PDF report
make

# Launch prototype stack
make prototype-up
```

The single-command build & Docker setup shows you can deliver **docs, diagrams and working code** in one integrated monorepo. Good luck! 