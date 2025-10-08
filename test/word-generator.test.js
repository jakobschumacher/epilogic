import { describe, it, expect } from 'vitest';
import { generateWordDocument } from '../src/word-generator.js';

describe('Word Generator', () => {
  describe('generateWordDocument', () => {
    it('should generate document with metadata', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Test Disease',
          erreger: 'Test Pathogen',
          stand: '2024-01-01',
          version: '1.0'
        },
        inputData: [],
        decisions: []
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate document with input data', async () => {
      const dmnData = {
        metadata: { krankheit: 'Test' },
        inputData: [
          { id: 'input1', name: 'Clinical', label: 'Clinical Criteria', documentation: 'Patient symptoms' }
        ],
        decisions: []
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate document with decisions and tables', async () => {
      const dmnData = {
        metadata: { krankheit: 'Test' },
        inputData: [],
        decisions: [
          {
            id: 'decision1',
            name: 'Classification',
            label: 'Case Classification',
            documentation: 'Classify the case',
            decisionTable: {
              inputs: [{ id: 'in1', label: 'Clinical Picture' }],
              outputs: [{ id: 'out1', label: 'Result' }],
              rules: [
                { inputEntries: ['confirmed'], outputEntries: ['A'] },
                { inputEntries: ['probable'], outputEntries: ['B'] }
              ]
            }
          }
        ]
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle minimal data', async () => {
      const dmnData = {
        metadata: {},
        inputData: [],
        decisions: []
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle decision without table', async () => {
      const dmnData = {
        metadata: { krankheit: 'Test' },
        inputData: [],
        decisions: [
          {
            id: 'decision1',
            name: 'Simple Decision',
            documentation: 'A simple decision',
            decisionTable: null
          }
        ]
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate valid Word document structure', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Hepatitis A',
          erreger: 'Hepatitis-A-Virus',
          stand: '2024-01-01',
          version: '2.0'
        },
        inputData: [
          {
            id: 'inp1',
            name: 'Clinical Criteria',
            label: 'Klinische Kriterien',
            documentation: 'Symptome und klinisches Bild'
          }
        ],
        decisions: [
          {
            id: 'dec1',
            name: 'Case Classification',
            label: 'Fallklassifikation',
            documentation: 'Klassifikation basierend auf klinischen und labordiagnostischen Kriterien',
            decisionTable: {
              inputs: [
                { id: 'i1', label: 'Klinisches Bild' },
                { id: 'i2', label: 'Labornachweis' }
              ],
              outputs: [
                { id: 'o1', label: 'Kategorie' }
              ],
              rules: [
                { inputEntries: ['erfüllt', 'erfüllt'], outputEntries: ['A'] },
                { inputEntries: ['erfüllt', 'nicht erfüllt'], outputEntries: ['B'] },
                { inputEntries: ['nicht erfüllt', 'erfüllt'], outputEntries: ['C'] }
              ]
            }
          }
        ]
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      // Should have reasonable size (at least a few KB for a document with content)
      expect(blob.size).toBeGreaterThan(5000);
    });
  });
});
