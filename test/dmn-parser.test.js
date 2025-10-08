import { describe, it, expect } from 'vitest';
import {
  extractMetadata,
  extractInputData,
  extractDecisions,
  parseDMN
} from '../src/dmn-parser.js';

describe('DMN Parser', () => {
  describe('extractMetadata', () => {
    it('should extract all metadata fields', () => {
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
      const metadata = extractMetadata(doc);

      expect(metadata.krankheit).toBe('Test Disease');
      expect(metadata.erreger).toBe('Test Pathogen');
      expect(metadata.stand).toBe('2024-01-01');
      expect(metadata.version).toBe('1.0');
    });

    it('should return empty object when metadata is missing', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const metadata = extractMetadata(doc);

      expect(metadata).toEqual({});
    });

    it('should handle partial metadata', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <extensionElements>
            <metadata xmlns:rki="http://example.com/rki">
              <rki:krankheit>Test Disease</rki:krankheit>
            </metadata>
          </extensionElements>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const metadata = extractMetadata(doc);

      expect(metadata.krankheit).toBe('Test Disease');
      expect(metadata.erreger).toBeUndefined();
    });
  });

  describe('extractInputData', () => {
    it('should extract input data elements', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <inputData id="input1" name="Clinical Criteria" label="Clinical Signs">
            <documentation>Patient symptoms</documentation>
          </inputData>
          <inputData id="input2" name="Laboratory Methods">
          </inputData>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const inputData = extractInputData(doc);

      expect(inputData).toHaveLength(2);
      expect(inputData[0].id).toBe('input1');
      expect(inputData[0].name).toBe('Clinical Criteria');
      expect(inputData[0].label).toBe('Clinical Signs');
      expect(inputData[0].documentation).toBe('Patient symptoms');
      expect(inputData[1].id).toBe('input2');
      expect(inputData[1].label).toBe('Laboratory Methods');
    });

    it('should return empty array when no input data exists', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const inputData = extractInputData(doc);

      expect(inputData).toEqual([]);
    });
  });

  describe('extractDecisions', () => {
    it('should extract decision with decision table', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <decision id="decision1" name="Case Classification">
            <documentation>Classify the case</documentation>
            <decisionTable>
              <input id="input1" label="Clinical Picture">
                <inputExpression>clinicalPicture</inputExpression>
              </input>
              <output id="output1" label="Classification" name="classification"/>
              <rule>
                <inputEntry><text>"confirmed"</text></inputEntry>
                <outputEntry><text>"A"</text></outputEntry>
              </rule>
              <rule>
                <inputEntry><text>"probable"</text></inputEntry>
                <outputEntry><text>"B"</text></outputEntry>
              </rule>
            </decisionTable>
          </decision>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const decisions = extractDecisions(doc);

      expect(decisions).toHaveLength(1);
      expect(decisions[0].id).toBe('decision1');
      expect(decisions[0].name).toBe('Case Classification');
      expect(decisions[0].documentation).toBe('Classify the case');
      expect(decisions[0].decisionTable).toBeDefined();
      expect(decisions[0].decisionTable.inputs).toHaveLength(1);
      expect(decisions[0].decisionTable.outputs).toHaveLength(1);
      expect(decisions[0].decisionTable.rules).toHaveLength(2);
    });

    it('should handle decision without decision table', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
          <decision id="decision1" name="Simple Decision">
          </decision>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const decisions = extractDecisions(doc);

      expect(decisions).toHaveLength(1);
      expect(decisions[0].decisionTable).toBeNull();
    });

    it('should return empty array when no decisions exist', () => {
      const xml = `<?xml version="1.0"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd">
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const decisions = extractDecisions(doc);

      expect(decisions).toEqual([]);
    });
  });

  describe('parseDMN', () => {
    it('should parse complete DMN document', () => {
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
          <inputData id="input1" name="Clinical Criteria"/>
          <decision id="decision1" name="Case Classification">
            <decisionTable>
              <input id="in1" label="Clinical"/>
              <output id="out1" label="Result"/>
              <rule>
                <inputEntry><text>"yes"</text></inputEntry>
                <outputEntry><text>"confirmed"</text></outputEntry>
              </rule>
            </decisionTable>
          </decision>
        </definitions>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const result = parseDMN(doc);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.krankheit).toBe('Test Disease');
      expect(result.inputData).toHaveLength(1);
      expect(result.decisions).toHaveLength(1);
    });
  });
});
