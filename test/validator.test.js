import { describe, it, expect } from 'vitest';
import {
  validateFileSize,
  validateFileType,
  validateXML,
  validateDMNStructure,
  validateFile
} from '../src/validator.js';

describe('Validator', () => {
  describe('validateFileSize', () => {
    it('should accept files under 10MB', () => {
      const file = new File(['test'], 'test.dmn', { type: 'text/xml' });
      const result = validateFileSize(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over 10MB', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.dmn', { type: 'text/xml' });
      const result = validateFileSize(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });
  });

  describe('validateFileType', () => {
    it('should accept .dmn files', () => {
      const file = new File(['test'], 'test.dmn', { type: 'text/xml' });
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should accept .xml files', () => {
      const file = new File(['test'], 'test.xml', { type: 'text/xml' });
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should reject other file types', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should be case insensitive', () => {
      const file = new File(['test'], 'test.DMN', { type: 'text/xml' });
      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateXML', () => {
    it('should accept valid XML', () => {
      const xml = '<?xml version="1.0"?><root><child>test</child></root>';
      const result = validateXML(xml);
      expect(result.valid).toBe(true);
      expect(result.doc).toBeDefined();
    });

    it('should reject invalid XML', () => {
      const xml = '<?xml version="1.0"?><root><unclosed>';
      const result = validateXML(xml);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid XML structure');
    });

    it('should reject malformed XML', () => {
      const xml = 'not xml at all';
      const result = validateXML(xml);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDMNStructure', () => {
    it('should accept valid DMN with all metadata', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <extensionElements>
            <metadata xmlns:rki="http://example.com/rki">
              <rki:krankheit>Test Disease</rki:krankheit>
              <rki:erreger>Test Pathogen</rki:erreger>
              <rki:stand>2024-01-01</rki:stand>
              <rki:version>1.0</rki:version>
            </metadata>
          </extensionElements>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const result = validateDMNStructure(doc);
      expect(result.valid).toBe(true);
    });

    it('should reject XML without definitions element', () => {
      const xml = '<?xml version="1.0"?><root></root>';
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const result = validateDMNStructure(doc);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing <definitions> root element');
    });

    it('should reject DMN without metadata', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const result = validateDMNStructure(doc);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required metadata');
    });

    it('should reject DMN with incomplete metadata', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <extensionElements>
            <metadata xmlns:rki="http://example.com/rki">
              <rki:krankheit>Test Disease</rki:krankheit>
              <rki:erreger>Test Pathogen</rki:erreger>
            </metadata>
          </extensionElements>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const result = validateDMNStructure(doc);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required metadata fields');
    });
  });

  describe('validateFile', () => {
    it('should validate complete valid file', () => {
      const xmlContent = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <extensionElements>
            <metadata xmlns:rki="http://example.com/rki">
              <rki:krankheit>Test Disease</rki:krankheit>
              <rki:erreger>Test Pathogen</rki:erreger>
              <rki:stand>2024-01-01</rki:stand>
              <rki:version>1.0</rki:version>
            </metadata>
          </extensionElements>
        </definitions>`;
      const file = new File([xmlContent], 'test.dmn', { type: 'text/xml' });
      const result = validateFile(file, xmlContent);
      expect(result.valid).toBe(true);
      expect(result.doc).toBeDefined();
    });

    it('should fail on file size validation', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.dmn', { type: 'text/xml' });
      const result = validateFile(file, largeContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should fail on file type validation', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file, 'test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });
});
