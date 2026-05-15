# PDF Export Spike

Phase 5E validates the first paid detailed-report export path before checkout starts. The goal is to make the report usable as a PDF artifact without adding payment, login, account storage, server storage, or a PDF-generation library yet.

## Decision

Current MVP direction: use a PDF-ready HTML document that users can save through the browser's print-to-PDF flow.

Why:
- It keeps the first paid SKU local-download oriented.
- It avoids sending birth data to a server only to render a file.
- It lets the product validate report structure, notices, and print layout before choosing a PDF library.
- It keeps checkout readiness separate from document-quality readiness.

Not yet decided:
- whether a later paid checkout flow should generate PDFs in-browser, server-side, or hybrid.
- whether to add a dedicated PDF library after print QA exposes real layout limitations.

## Export Requirements

The PDF-ready HTML must include:
- cover page with generated time, confidence, birth-time state, and export format.
- first-page scope and privacy notes.
- input summary with birth date, birth time state, sex label, and timezone.
- four-pillar summary.
- paid career and finance sections.
- monthly expansion with caution text.
- glossary.
- transparency appendix.
- footer notices.
- print guidance that tells users to use browser print and choose PDF save.

The filename must avoid birth data. Use a generated-date based filename such as `saju-lab-paid-report-YYYYMMDD.html` until a real PDF output exists.

## Manual QA Checklist

Use this checklist before treating the paid export as beta-ready:

- [ ] Open the paid detailed report preview on mobile width.
- [ ] Save the PDF-ready HTML.
- [ ] Open the saved HTML in Chrome or Edge.
- [ ] Use print preview and choose "Save as PDF".
- [ ] Confirm A4 portrait layout is readable.
- [ ] Confirm cover, table of contents, input summary, pillar summary, main sections, monthly timeline, glossary, and transparency appendix are present.
- [ ] Confirm first-page disclaimer and privacy/scope notes are visible.
- [ ] Confirm the filename does not include birth date, birth time, or sex.
- [ ] Confirm an unknown birth-time report still shows the lower confidence and missing-time caution.
- [ ] Confirm no live checkout, login, account-storage, or subscription language appears in the export.

## Failure Criteria

Do not open checkout work if any of these are true:
- required notices are missing from the printable document.
- birth data appears in the filename.
- print preview cuts off key sections, checklist rows, or monthly cautions.
- mobile preview hides the export scope or disclaimer.
- the export implies that payment increases prediction certainty.
- the export implies professional investment, medical, legal, or psychological advice.

## Next Decision

After this spike, choose one:

1. Continue with browser print-to-PDF as the MVP paid export path.
2. Add a PDF library spike if layout or file quality is not reliable enough.
3. Delay PDF work and draft privacy/refund/contact policy pages first.
