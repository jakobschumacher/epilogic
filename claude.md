# Epilogic - Technical Documentation

## Architecture Overview

Epilogic is a client-side web application that converts DMN 1.3 (Decision Model and Notation) XML files into formatted Word documents. The application follows a modular architecture with clear separation of concerns.

### Core Principles

- **Client-side only**: All processing happens in the browser, no server communication
- **Privacy-first**: No data is transmitted to external servers or stored locally
- **Modular design**: Clean separation between validation, parsing, and generation
- **Test-driven**: Comprehensive unit tests for all core modules
- **Bundle optimization**: Minimal dependencies, optimized build output

## System Architecture

```
User Interface (HTML/CSS/JS)
         ↓
    main.js (Orchestration)
         ↓
    ┌────┴────┬─────────────┬──────────────┐
    ↓         ↓             ↓              ↓
validator.js  dmn-parser.js  word-generator.js
    ↓         ↓             ↓
DOMParser   XML DOM      docx library
```

## Module Documentation

### 1. validator.js

Handles all file and DMN validation logic.

**Functions:**
- `validateFileSize(file)`: Checks file size against 10MB limit
- `validateFileType(file)`: Validates file extension (.dmn or .xml)
- `validateXML(xmlContent)`: Parses and validates XML structure
- `validateDMNStructure(doc)`: Validates DMN-specific requirements
- `validateFile(file, xmlContent)`: Complete validation pipeline

**Validation Flow:**
1. File size check
2. File type validation
3. XML parsing
4. DMN structure validation
5. Metadata presence and completeness

**Error Handling:**
Returns `{valid: boolean, error?: string, doc?: Document}` for all validations.

### 2. dmn-parser.js

Extracts structured data from validated DMN XML documents.

**Functions:**
- `extractMetadata(doc)`: Extracts metadata from extensionElements
- `extractInputData(doc)`: Parses input data elements
- `extractDecisions(doc)`: Extracts decision elements and tables
- `parseDMN(doc)`: Complete parsing pipeline

**Data Structure:**
```javascript
{
  metadata: {
    krankheit: string,
    erreger: string,
    stand: string,
    version: string
  },
  inputData: [{
    id: string,
    name: string,
    label: string,
    documentation: string
  }],
  decisions: [{
    id: string,
    name: string,
    label: string,
    documentation: string,
    decisionTable: {
      inputs: [{id, label, expression}],
      outputs: [{id, label, name}],
      rules: [{inputEntries: [], outputEntries: []}]
    }
  }]
}
```

### 3. word-generator.js

Generates formatted Word documents using the docx library.

**Functions:**
- `generateWordDocument(dmnData)`: Creates Word document from parsed DMN data
- `downloadDocument(blob, filename)`: Triggers browser download

**Document Formatting:**
- **Headings**: Blue color (#0070C0), bold
- **Disease names**: Italic formatting
- **Tables**: Gray headers, bordered cells
- **Spacing**: Consistent paragraph spacing (120-240pt)
- **Font**: Inter fallback to system fonts

**Structure:**
1. Title (disease name)
2. Metadata section (pathogen, date, version)
3. Input data section
4. Decisions section with tables

### 4. main.js

UI orchestration and event handling.

**Responsibilities:**
- File upload handling (click and drag-drop)
- User feedback (loading, success, error states)
- Processing pipeline orchestration
- Automatic download triggering

**Event Flow:**
1. User uploads file
2. Display validation status
3. Show parsing progress
4. Display generation status
5. Trigger download
6. Show success/error message

## DMN Mapping Logic

### Metadata Extraction
- Looks for `extensionElements > metadata` element
- Extracts `krankheit`, `erreger`, `stand`, `version` fields
- Uses namespace-agnostic selectors for compatibility

### Input Data Mapping
- Queries all `inputData` elements
- Extracts id, name, label attributes
- Retrieves documentation from child elements

### Decision Table Mapping
- Parses `decisionTable` elements within `decision` elements
- Maps inputs with expressions
- Maps outputs with labels and names
- Extracts rules with input/output entries

## Word Document Formatting Rules

### Typography
- **Primary color**: #0070C0 (blue)
- **Font family**: Inter, system fonts fallback
- **Heading sizes**: H1 (32pt), H2 (28pt), H3 (24pt)

### Document Structure
1. **Title Section**
   - Disease name in blue, bold, 32pt
   - 240pt spacing after

2. **Metadata Section**
   - "Erreger:" label bold, value italic
   - "Stand:" and "Version:" labels bold
   - 120pt spacing between items

3. **Input Data Section**
   - "Eingabedaten" heading in blue, 28pt
   - Each input as bold label
   - Documentation as regular text

4. **Decisions Section**
   - "Entscheidungen" heading in blue, 28pt
   - Each decision as blue heading, 24pt
   - Decision tables with:
     - Gray header row (D3D3D3)
     - Bold header text, centered
     - Bordered cells
     - 100% width

### Spacing Rules
- Before headings: 360pt (H1), 240pt (H2)
- After headings: 180pt (H1), 120pt (H2)
- Between paragraphs: 120pt
- Around tables: Empty paragraph for spacing

## Testing Strategy

### Unit Tests

**validator.test.js** (16 tests)
- File size validation (under/over limit)
- File type validation (dmn, xml, others)
- XML parsing (valid/invalid/malformed)
- DMN structure validation (complete/incomplete metadata)

**dmn-parser.test.js** (9 tests)
- Metadata extraction (complete/partial/missing)
- Input data extraction (with/without documentation)
- Decision extraction (with/without tables)
- Complete DMN parsing

**word-generator.test.js** (6 tests)
- Document generation with various data structures
- Blob type and size validation
- Table generation
- Minimal data handling

### Test Coverage
- All core functions have unit tests
- Edge cases covered (missing data, empty files, large files)
- Error scenarios tested
- Integration tested via manual QA

## Build Configuration

### Vite Configuration
```javascript
{
  base: './',                    // Relative paths for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,            // No sourcemaps in production
    minify: 'terser',            // Terser for better compression
    rollupOptions: {
      output: {
        manualChunks: undefined  // Single bundle for simplicity
      }
    }
  }
}
```

### Bundle Analysis
- **Total size**: ~356KB
- **Gzipped**: ~98KB
- **Main JS**: 347KB (340KB on disk)
- **CSS**: 2.9KB
- **HTML**: 2KB

### Dependencies
- **Production**: docx (9.5.1)
- **Development**: vite, vitest, jsdom, terser

## Deployment

### GitHub Pages Setup
1. Build: `npm run build`
2. Deploy `dist/` directory to gh-pages branch
3. Configure GitHub Pages to serve from gh-pages

### CDN-free Deployment
- All assets bundled in dist/
- No external dependencies at runtime
- Works completely offline after first load

### Browser Compatibility
- Modern browsers (ES modules support)
- Chrome, Firefox, Safari, Edge (latest versions)
- Requires JavaScript enabled
- File API and Blob support required

## Security Considerations

### Input Validation
- File size limited to 10MB
- File type restricted to .dmn and .xml
- XML entity expansion protection via DOMParser
- No code execution from DMN content

### Privacy
- No network requests during conversion
- No analytics or tracking
- No local storage usage
- No cookies

### XSS Protection
- Text content sanitized during Word generation
- No innerHTML usage in UI
- Safe DOM manipulation only

## Performance Optimization

### Bundle Size Optimization
- Tree-shaking enabled
- Terser minification
- Single chunk strategy
- No sourcemaps in production

### Runtime Performance
- Synchronous parsing (files < 10MB)
- Efficient DOM querying
- Minimal re-renders
- Direct blob download (no memory leaks)

### Target Performance
- Validation: < 100ms
- Parsing: < 500ms
- Generation: < 2s
- Total: < 5s for typical files

## Extension Points

### Adding New Metadata Fields
1. Update `extractMetadata()` in dmn-parser.js
2. Add to `requiredFields` in validator.js
3. Add formatting in word-generator.js

### Supporting New Decision Types
1. Add parser function in dmn-parser.js
2. Add formatting logic in word-generator.js
3. Add tests for new functionality

### Custom Word Formatting
1. Modify `createHeading()` or `createParagraph()` helpers
2. Adjust color constants
3. Update styles configuration

## Troubleshooting

### Common Issues

**Bundle size too large**
- Check docx version (major updates can increase size)
- Verify terser is installed
- Check for duplicate dependencies

**XML parsing fails**
- Ensure proper XML namespaces
- Check for malformed XML
- Verify DMN 1.3 compliance

**Word document formatting issues**
- Verify docx library version compatibility
- Check paragraph spacing values
- Validate color codes format

### Debug Mode
Enable console logging by checking browser DevTools:
- File validation logs
- Parsed DMN structure
- Generation status
- Error details

## Future Enhancements

### Potential Features
- PDF export option
- Batch file processing
- Custom formatting templates
- DMN validation against schema
- Support for DMN 1.4+
- Internationalization (i18n)

### Performance Improvements
- Web Worker for parsing
- Streaming for large files
- Progressive rendering
- Service Worker for offline

## Maintenance Notes

### Version Updates
- Test thoroughly with new docx versions
- Monitor bundle size changes
- Update browser compatibility matrix
- Review security advisories

### Code Quality
- Maintain > 80% test coverage
- Follow JSDoc conventions
- Keep modules under 200 lines
- Document breaking changes

## Project Statistics

- **Lines of Code**: ~1200 (excluding tests)
- **Test Coverage**: 31 passing tests
- **Bundle Size**: 356KB (98KB gzipped)
- **Dependencies**: 1 production, 4 development
- **Browser Support**: Modern browsers (ES2020+)
