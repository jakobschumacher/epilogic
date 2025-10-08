# Epilogic

Transform DMN (Decision Model and Notation) 1.3 files into formatted Word documents following RKI Falldefinitionen format.

## Features

- Browser-based DMN to Word/Markdown converter
- Multiple export formats:
  - **Word**: Full RKI Falldefinition document with blue headings, structured sections, and fall categories
  - **Markdown**: All decision tables with aligned columns
  - **C# / Java**: Code generation (coming soon)
- Drag-and-drop file upload
- Client-side processing (no server, works offline)
- Maximum file size: 10MB

## Live Demo

https://jakobschumacher.github.io/epilogic/

## Usage

1. Create your DMN file with [https://demo.bpmn.io/dmn](https://demo.bpmn.io/dmn)
2. Add descriptions to your decision elements and input data
3. Upload your DMN 1.3 file
4. Choose export format (Word, Markdown, or C#/Java when available)

## DMN Structure Requirements

### Required Metadata (in extensionElements)
- `krankheit` - Disease name
- `erreger` - Pathogen name
- `stand` - Date
- `version` - Version number

### Optional Elements
- `inkubationszeit` - Incubation period
- `klinisches_bild` - Clinical picture
- `labordiagnostik` - Laboratory diagnostics
- `epidemiologische_bestaetigung` - Epidemiological confirmation
- `zusatzinformation` - Additional information
- `referenzdefinition` - Reference definition
- `meldepflicht` - Reporting obligation
- `uebermittlung` - Transmission
- `fallklassifikation` - Fall classification decision table

See `test-data/campylobacter_classification.dmn` for a complete example.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build
```

## Technologies

- Vanilla JavaScript (ES modules)
- Vite (build tool)
- docx library (Word generation)
- Vitest (testing)
- GitHub Actions (CI/CD)

## License

ISC

## Version

1.2.0
