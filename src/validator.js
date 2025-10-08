/**
 * File and DMN validation utilities
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.dmn', '.xml'];

/**
 * Validates file size
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileSize(file) {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 10MB`
    };
  }
  return { valid: true };
}

/**
 * Validates file type
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileType(file) {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a .dmn or .xml file`
    };
  }
  return { valid: true };
}

/**
 * Validates XML structure
 * @param {string} xmlContent - The XML content to validate
 * @returns {{valid: boolean, error?: string, doc?: Document}}
 */
export function validateXML(xmlContent) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        valid: false,
        error: 'Invalid XML structure: ' + parseError.textContent
      };
    }

    return { valid: true, doc };
  } catch (error) {
    return {
      valid: false,
      error: 'XML parsing failed: ' + error.message
    };
  }
}

/**
 * Validates DMN structure and required elements
 * @param {Document} doc - The parsed XML document
 * @returns {{valid: boolean, error?: string}}
 */
export function validateDMNStructure(doc) {
  // Check if it's a DMN document
  const dmnRoot = doc.querySelector('definitions');
  if (!dmnRoot) {
    return {
      valid: false,
      error: 'Not a valid DMN file: missing <definitions> root element'
    };
  }

  // Check for metadata
  const metadata = doc.querySelector('extensionElements metadata');
  if (!metadata) {
    return {
      valid: false,
      error: 'Missing required metadata in extensionElements'
    };
  }

  // Check for required metadata fields
  const requiredFields = ['krankheit', 'erreger', 'stand', 'version'];
  const missingFields = [];

  for (const field of requiredFields) {
    const element = metadata.querySelector(field);
    if (!element || !element.textContent.trim()) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required metadata fields: ${missingFields.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validates file completely
 * @param {File} file - The file to validate
 * @param {string} xmlContent - The XML content
 * @returns {{valid: boolean, error?: string, doc?: Document}}
 */
export function validateFile(file, xmlContent) {
  // File size validation
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // File type validation
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // XML validation
  const xmlValidation = validateXML(xmlContent);
  if (!xmlValidation.valid) {
    return xmlValidation;
  }

  // DMN structure validation
  const dmnValidation = validateDMNStructure(xmlValidation.doc);
  if (!dmnValidation.valid) {
    return dmnValidation;
  }

  return { valid: true, doc: xmlValidation.doc };
}
