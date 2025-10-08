# Project Requirements - Epilogic (DMN to Word Converter)

## Project Overview
A browser-based tool for converting DMN 1.3 (Decision Model and Notation) files to Word documents with specific formatting requirements.

## Core Requirements

### 1. Functional Requirements

#### Input
- Accept DMN 1.3 XML files
- Support file upload via:
  - Click to browse
  - Drag and drop
- Maximum file size: 10MB
- Supported formats: `.dmn`, `.xml`

#### Processing
- Parse DMN XML structure
- Extract metadata from `extensionElements`
- Extract input data elements
- Extract decisions and decision tables
- Map DMN structure to document sections

#### Output
- Generate `.docx` (Word) document
- Apply specific formatting (see Design Requirements)
- Download automatically to user's device

### 2. Technical Requirements

#### DMN Structure Requirements
The system expects DMN files with:

**Metadata (in extensionElements):**
```xml
<dmn:extensionElements>
  <rki:metadata>
    <rki:krankheit>Disease Name</rki:krankheit>
    <rki:erreger>Pathogen Name</rki:erreger>
    <rki:stand>Date</rki:stand>
    <rki:version>Version</rki:version>
  </rki:metadata>
</dmn:extensionElements>
```

**Input Data Elements:**
- Clinical criteria (symptoms, clinical picture)
- Laboratory methods (detection methods)
- Epidemiological factors (transmission, exposure)

**Decisions:**
- Clinical Picture decision
- Laboratory Diagnostics decision
- Epidemiological Confirmation decision
- Case Classification decision

### 3. Quality Requirements

#### Validation
- File size validation (max 10MB)
- File type validation (`.dmn`, `.xml`)
- DMN structure validation
- Metadata presence checks

#### Error Handling
- Specific error messages for different failure types:
  - Invalid file format
  - XML parsing errors
  - Missing required metadata
  - Library loading failures
- User-friendly error descriptions
- Debug logging to console

#### Performance
- Handle files up to 10MB
- Conversion should complete in < 5 seconds for typical files
- Bundle size: ~385KB (acceptable for web app)

### 4. User Experience Requirements

#### Interface
- Simple, clean design
- Professional appearance (government agency style)
- Drag-and-drop support
- Clear status messages
- Progress indication during conversion

#### Workflow
1. User uploads DMN file
2. File validation occurs (detailed information on the current action and errors should appear)
3. Conversion status shown
4. Word document downloads automatically
5. Success message displayed

#### Privacy
- All processing client-side
- No data transmission to servers


#### Typography
- Font family: Inter, system fonts fallback
- Professional, clean, readable
- Proper hierarchy with font sizes

#### Word Document Formatting
- Blue headings (`#0070C0`)
- Italic disease names
- Bold emphasis for key terms
- Proper indentation and spacing
- Tables for case categories
- Consistent paragraph spacing

### 6. Branding Requirements

#### Application Name
- Name: **Epilogic**
- Version: 1.2.0

#### Text Content
- Title: "Epilogic"
- Subtitle: "Transform decision notation models into formatted documents"
- Footer: "Epilogic v1.2.0"

#### No Official Branding
- **Do NOT use "RKI"** or any official organization names
- This is a private tool, not officially published
- Generic, professional appearance

#### Production Deployment
- GitHub Pages compatible
- Static file hosting
- CDN not required (self-contained bundle)
- HTTPS recommended but not required

### 9. Security Requirements

#### Input Validation
- File size limits enforced
- File type validation
- No code execution from DMN content
- XML entity expansion protection

#### Privacy
- No external network calls during conversion
- No analytics or tracking
- No data persistence (local storage not used)
- Client-side only processing

#### Test Data
- Valid DMN file with all sections
- DMN file with missing metadata
- DMN file with empty sections
- Large DMN file (~5MB)
- Oversized file (>10MB)
- Invalid XML file
- Non-DMN XML file

### 11. Documentation Requirements

#### User Documentation
- README.md with:
  - Project description
  - Installation instructions
  - Usage instructions
  - DMN structure requirements
  - Troubleshooting guide

#### Developer Documentation
- Architecture overview
- DMN mapping logic
- Word formatting rules
- Build instructions
- Deployment guide

#### Code Documentation
- JSDoc comments for public methods
- Clear variable and function names
- Inline comments for complex logic
- Examples in documentation

### 12. Non-Functional Requirements

#### Maintainability
- Clean code structure
- Separation of concerns
- No code duplication
- Modular design

#### Extensibility
- Easy to add new DMN sections
- Easy to modify Word formatting
- Easy to support additional metadata fields
- Easy to add new validation rules

#### Usability
- Intuitive interface
- Clear error messages
- No training required
- Accessible to non-technical users

## Success Criteria

1. ✅ User can upload DMN file easily
2. ✅ Conversion completes successfully
3. ✅ Word document downloads automatically
4. ✅ Document formatting matches requirements
5. ✅ Works offline after initial load
6. ✅ No data sent to servers
7. ✅ Professional appearance
8. ✅ Works on major browsers
9. ✅ Clear error messages
10. ✅ File size < 500KB (total bundle)

## Out of Scope

- Server-side conversion
- User authentication
- File storage/database
- Multi-file batch processing
- PDF export
- DMN editing capabilities
- Version control
- Collaboration features
- Cloud storage integration
