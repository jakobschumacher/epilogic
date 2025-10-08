# Epilogic - DMN to Word/Markdown Converter

## Project Overview

Epilogic is a browser-based tool that converts DMN 1.3 files into formatted Word documents and Markdown files following the RKI Falldefinitionen format. All processing happens client-side.

**Live Demo**: https://jakobschumacher.github.io/epilogic/

## Architecture

### Key Files

- **src/validator.js**: File validation (size, type, XML structure, DMN metadata)
- **src/dmn-parser.js**: Parses DMN XML, extracts metadata, decisions, and builds content dynamically
- **src/word-generator.js**: Generates Word documents with RKI formatting (blue headings, structured sections)
- **src/markdown-generator.js**: Generates Markdown with aligned decision tables
- **src/main.js**: UI orchestration, file upload handling, button states
- **src/styles.css**: Styling with button states (disabled/enabled)
- **index.html**: Main UI with upload area and action buttons

### Data Flow

1. User uploads DMN file
2. Validator checks: file size (10MB max), file type (.dmn/.xml), XML validity, metadata presence
3. Parser extracts:
   - Metadata (krankheit, erreger, stand, version)
   - All decisions with informationRequirements
   - Builds content from decision inputs dynamically
4. User chooses export format
5. Generator creates Word/Markdown document
6. Browser downloads file

## DMN Structure

### Required Metadata
Must be in `<extensionElements><metadata>`:
- krankheit
- erreger
- stand
- version

### Optional Elements
Parser looks for these by name attribute:
- klinisches_bild
- labordiagnostik
- epidemiologische_bestaetigung
- zusatzinformation
- referenzdefinition
- meldepflicht
- uebermittlung
- fallklassifikation

### Dynamic Content Building
Parser uses `informationRequirement` elements to dynamically build content from decision inputs instead of expecting pre-aggregated sections.

## Testing

All tests in `test/` directory:
- validator.test.js (16 tests)
- dmn-parser.test.js (9 tests)
- word-generator.test.js (5 tests)
- markdown-generator.test.js (4 tests)

Total: 34 tests, all passing.

Run with: `npm run test:run`

## Build & Deployment

- **Development**: `npm run dev`
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview**: `npm run preview`
- **Deployment**: Automatic via GitHub Actions on push to main

### GitHub Actions Workflow
`.github/workflows/deploy.yml` runs on push to main:
1. Installs dependencies
2. Runs all tests
3. Builds production bundle
4. Deploys to GitHub Pages

## Key Implementation Details

### Word Generator
- Blue headings: #0563C1
- Parses documentation for bullet points
- Bolds keywords: ODER, mindestens einer, etc.
- Creates fall categories (A-E)
- Legal references with § symbols

### Markdown Generator
- Exports ALL decision tables (not just fallklassifikation)
- Calculates column widths for proper alignment
- Pads cells for readable raw markdown

### UI/UX
- Buttons visible but disabled initially (greyed out)
- Enabled after successful file processing
- Unified button styling (blue outline, hover fill)
- Grid layout for alignment
- C# and Java buttons show "Not implemented yet" alert

## Bundle Size
- Total: ~348KB (98KB gzipped)
- Optimized with terser minification
- Base path: `./` for GitHub Pages compatibility

## Recent Changes

1. Added multi-format export (Word, Markdown, C#/Java placeholders)
2. Improved markdown with all tables and column alignment
3. Enhanced button UX with disabled states
4. Added GitHub Actions for automatic deployment
5. Updated "How it works" with DMN creation instructions and metadata requirements

## Development Notes

- ES modules throughout
- No external dependencies at runtime (all bundled)
- Client-side only (no server needed)
- Works offline after initial load
- Supports both `<documentation>` and `<description>` elements in DMN
- Handles `dmn:` namespace prefix
