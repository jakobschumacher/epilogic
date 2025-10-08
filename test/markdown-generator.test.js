import { describe, it, expect } from 'vitest';
import { generateMarkdownDocument } from '../src/markdown-generator.js';

describe('Markdown Generator', () => {
  describe('generateMarkdownDocument', () => {
    it('should generate markdown with title and metadata', () => {
      const dmnData = {
        metadata: {
          krankheit: 'Campylobacter-Enteritis',
          erreger: 'Campylobacter spp., darmpathogen',
          stand: '01.09.2023',
          version: '2025'
        },
        fallkategorien: null
      };

      const markdown = generateMarkdownDocument(dmnData);

      expect(markdown).toContain('# Campylobacter-Enteritis');
      expect(markdown).toContain('Campylobacter spp., darmpathogen');
      expect(markdown).toContain('**Stand:** 01.09.2023');
      expect(markdown).toContain('**Version:** 2025');
    });

    it('should generate markdown with decision table', () => {
      const dmnData = {
        metadata: {
          krankheit: 'Test Disease',
          erreger: 'Test Pathogen'
        },
        fallkategorien: {
          name: 'Fallklassifikation',
          decisionTable: {
            inputs: [
              { id: 'in1', label: 'Klinisches Bild' },
              { id: 'in2', label: 'Labornachweis' }
            ],
            outputs: [
              { id: 'out1', label: 'Kategorie' }
            ],
            rules: [
              { inputEntries: ['erfüllt', 'erfüllt'], outputEntries: ['A'] },
              { inputEntries: ['erfüllt', 'nicht erfüllt'], outputEntries: ['B'] },
              { inputEntries: ['nicht erfüllt', 'erfüllt'], outputEntries: ['C'] }
            ]
          }
        }
      };

      const markdown = generateMarkdownDocument(dmnData);

      expect(markdown).toContain('## Fallklassifikation');
      expect(markdown).toContain('Klinisches Bild');
      expect(markdown).toContain('Labornachweis');
      expect(markdown).toContain('Kategorie');
      expect(markdown).toContain('erfüllt');
      expect(markdown).toContain('nicht erfüllt');
      expect(markdown).toContain('| A ');
      expect(markdown).toContain('| B ');
      expect(markdown).toContain('| C ');
    });

    it('should handle minimal data', () => {
      const dmnData = {
        metadata: {},
        fallkategorien: null
      };

      const markdown = generateMarkdownDocument(dmnData);

      expect(markdown).toBeDefined();
      expect(typeof markdown).toBe('string');
    });

    it('should generate valid markdown table format', () => {
      const dmnData = {
        metadata: {
          krankheit: 'Test',
          erreger: 'Test'
        },
        fallkategorien: {
          label: 'Test Decision',
          decisionTable: {
            inputs: [{ label: 'Input 1' }],
            outputs: [{ label: 'Output 1' }],
            rules: [
              { inputEntries: ['value1'], outputEntries: ['result1'] }
            ]
          }
        }
      };

      const markdown = generateMarkdownDocument(dmnData);

      // Check table structure
      const lines = markdown.split('\n');
      const tableStart = lines.findIndex(l => l.includes('| Input 1'));

      expect(tableStart).toBeGreaterThan(-1);
      expect(lines[tableStart + 1]).toContain('| ---');
      expect(lines[tableStart + 2]).toContain('| value1');
    });
  });
});
