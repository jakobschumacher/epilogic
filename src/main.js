/**
 * Main UI orchestration
 */

import { validateFile } from './validator.js';
import { parseDMN } from './dmn-parser.js';
import { generateWordDocument, downloadDocument } from './word-generator.js';

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const statusArea = document.getElementById('statusArea');
const statusIcon = document.getElementById('statusIcon');
const statusMessage = document.getElementById('statusMessage');

// SVG icons
const successIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
`;

const errorIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
`;

const infoIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
`;

const spinnerIcon = `<div class="spinner"></div>`;

/**
 * Shows status message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 */
function showStatus(message, type = 'info') {
  statusArea.style.display = 'block';
  statusArea.className = `status-area ${type}`;
  statusMessage.textContent = message;

  // Set appropriate icon
  switch (type) {
    case 'success':
      statusIcon.innerHTML = successIcon;
      break;
    case 'error':
      statusIcon.innerHTML = errorIcon;
      break;
    case 'loading':
      statusIcon.innerHTML = spinnerIcon;
      statusArea.className = 'status-area info';
      break;
    default:
      statusIcon.innerHTML = infoIcon;
  }
}

/**
 * Hides status message
 */
function hideStatus() {
  statusArea.style.display = 'none';
}

/**
 * Processes uploaded file
 * @param {File} file - The uploaded file
 */
async function processFile(file) {
  console.log('Processing file:', file.name);

  try {
    // Show validation status
    showStatus('Validating file...', 'loading');

    // Read file content
    const fileContent = await file.text();

    // Validate file
    const validation = validateFile(file, fileContent);
    if (!validation.valid) {
      showStatus(`Validation failed: ${validation.error}`, 'error');
      console.error('Validation error:', validation.error);
      return;
    }

    // Show parsing status
    showStatus('Parsing DMN structure...', 'loading');

    // Parse DMN
    const dmnData = parseDMN(validation.doc);
    console.log('Parsed DMN data:', dmnData);

    // Show generation status
    showStatus('Generating Word document...', 'loading');

    // Generate Word document
    const blob = await generateWordDocument(dmnData);

    // Generate filename from metadata
    const disease = dmnData.metadata.krankheit || 'document';
    const sanitizedName = disease.replace(/[^a-z0-9äöüß]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}.docx`;

    // Download document
    downloadDocument(blob, filename);

    // Show success
    showStatus(`Successfully generated ${filename}`, 'success');
    console.log('Document generated successfully');

  } catch (error) {
    console.error('Processing error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  }
}

/**
 * Handles file selection
 * @param {File} file - The selected file
 */
function handleFileSelect(file) {
  if (!file) {
    return;
  }

  processFile(file);
}

// Event listeners
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFileSelect(file);
});

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');

  const file = e.dataTransfer.files[0];
  handleFileSelect(file);
});

// Prevent default drag and drop behavior on the whole page
document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
});

console.log('Epilogic initialized');
