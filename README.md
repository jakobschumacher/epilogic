# Epilogic

Transform decision notation models (DMN 1.3) into formatted Word documents.

## Description

Epilogic is a browser-based tool that converts DMN (Decision Model and Notation) XML files into professionally formatted Word documents following the RKI Falldefinitionen format. All processing happens client-side - no data is sent to any server.

## Features

- Upload DMN 1.3 files via drag-and-drop or file browser
- Client-side validation and processing
- Automatic Word document generation in RKI Falldefinitionen format:
  - Blue headings (#0563C1)
  - Structured sections (Klinisches Bild, Labordiagnostischer Nachweis, etc.)
  - Fall categories (A, B, C, D, E)
  - Bold emphasis for key terms (ODER, mindestens einer)
  - Proper bullet points and formatting
  - Legal references (§ symbols)
- Works completely offline after initial load
- No data transmission to servers
- Maximum file size: 10MB

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests once
npm run test:run
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The production bundle will be created in the `dist/` directory and is optimized for deployment to static hosting services like GitHub Pages.

## Usage

1. Open the application in your browser
2. Upload a DMN 1.3 file by:
   - Dragging and dropping it onto the upload area
   - Clicking the upload area to browse for a file
3. The file will be validated and processed
4. A Word document will be automatically generated and downloaded

## DMN Structure Requirements

The tool expects DMN 1.3 files structured for RKI Falldefinitionen:

### Metadata (in extensionElements)

```xml
<dmn:extensionElements>
  <metadata>
    <rki:krankheit>Disease Name</rki:krankheit>
    <rki:erreger>Pathogen Name</rki:erreger>
    <rki:stand>Date</rki:stand>
    <rki:version>Version</rki:version>
    <rki:inkubationszeit>Incubation period</rki:inkubationszeit>
  </metadata>
</dmn:extensionElements>
```

### Required InputData Elements (by name attribute)

- `klinisches_bild` - Clinical picture
- `labordiagnostik` - Laboratory diagnostic evidence
- `epidemiologische_bestaetigung` - Epidemiological confirmation
- `zusatzinformation` - Additional information (optional)
- `referenzdefinition` - Reference definition
- `meldepflicht` - Reporting obligation
- `uebermittlung` - Transmission

### Required Decision Element

- `fallklassifikation` - Fall classification with decision table containing categories A-E

See `test-data/campylobacter.dmn` for a complete RKI-format example.

## Project Structure

```
/
├── src/
│   ├── validator.js        # File and DMN validation
│   ├── dmn-parser.js       # DMN XML parsing
│   ├── word-generator.js   # Word document generation
│   ├── main.js             # UI orchestration
│   └── styles.css          # Styling
├── test/
│   ├── validator.test.js
│   ├── dmn-parser.test.js
│   └── word-generator.test.js
├── test-data/
│   └── sample.dmn          # Example DMN file
├── index.html              # Main HTML
├── package.json
└── vite.config.js
```

## Technologies

- **Frontend**: Vanilla JavaScript (ES modules)
- **XML Parsing**: DOMParser (native browser API)
- **Word Generation**: docx library
- **Build Tool**: Vite
- **Testing**: Vitest with jsdom
- **Bundle Size**: ~356KB total (98KB gzipped)

## Troubleshooting

### Invalid file format
- Ensure the file has a `.dmn` or `.xml` extension
- Verify the file is valid XML

### Missing required metadata
- Check that all required metadata fields are present:
  - krankheit (disease)
  - erreger (pathogen)
  - stand (date)
  - version

### XML parsing errors
- Validate your DMN file structure
- Ensure proper XML namespaces are defined
- Check for unclosed tags or malformed XML

### File size exceeded
- Maximum file size is 10MB
- Large files may need to be optimized

## Development Environment

### Quick Start
```bash
resume
```

Or manually:
```bash
distrobox-enter 2025_10_08_js_Epilogic
```

### Rebuild Environment
```bash
curl -s https://raw.githubusercontent.com/jakobschumacher/distrobox_setup/main/bootstrap -o /tmp/bootstrap && bash /tmp/bootstrap
```

## License

ISC

## Version

1.2.0
