import { describe, it, expect } from 'vitest';
import { generateWordDocument } from '../src/word-generator.js';

describe('Word Generator - RKI Format', () => {
  describe('generateWordDocument', () => {
    it('should generate document with RKI metadata', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Campylobacter-Enteritis',
          erreger: 'Campylobacter spp., darmpathogen',
          stand: '01.09.2023',
          version: '2025',
          inkubationszeit: '1 - 10 Tage'
        },
        klinischesBild: null,
        labordiagnostik: null,
        epidemiologie: null,
        fallkategorien: null,
        zusatzinfo: null,
        referenzdefinition: null,
        gesetzlicheGrundlage: {}
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate document with klinisches bild section', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Test',
          erreger: 'Test Pathogen'
        },
        klinischesBild: {
          label: 'Klinisches Bild',
          documentation: 'Klinisches Bild einer akuten Erkrankung\n- Fieber\n- Durchfall'
        },
        labordiagnostik: null,
        epidemiologie: null,
        fallkategorien: null,
        zusatzinfo: null,
        referenzdefinition: null,
        gesetzlicheGrundlage: {}
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate document with fall kategorien', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Test',
          erreger: 'Test Pathogen'
        },
        klinischesBild: null,
        labordiagnostik: null,
        epidemiologie: null,
        fallkategorien: {
          name: 'fallklassifikation',
          decisionTable: {
            inputs: [],
            outputs: [],
            rules: [
              { inputEntries: [], outputEntries: ['A', 'Kategorie A Beschreibung'] },
              { inputEntries: [], outputEntries: ['B', 'Kategorie B Beschreibung'] }
            ]
          }
        },
        zusatzinfo: null,
        referenzdefinition: null,
        gesetzlicheGrundlage: {}
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate complete RKI Falldefinition document', async () => {
      const dmnData = {
        metadata: {
          krankheit: 'Campylobacter-Enteritis',
          erreger: 'Campylobacter spp., darmpathogen',
          stand: '01.09.2023',
          version: '2025',
          inkubationszeit: '1 - 10 Tage, gewöhnlich 2 - 5 Tage.'
        },
        klinischesBild: {
          label: 'Klinisches Bild',
          documentation: 'Klinisches Bild einer akuten Campylobacter-Enteritis, definiert als mindestens eines der drei folgenden Kriterien:\n- Bauchschmerzen,\n- Durchfall,\n- Fieber\nODER krankheitsbedingter Tod.'
        },
        labordiagnostik: {
          label: 'Labordiagnostischer Nachweis',
          documentation: 'Positiver Befund mit mindestens einer der drei folgenden Methoden:\n- Antigennachweis\n- Erregerisolierung\n- Nukleinsäurenachweis'
        },
        epidemiologie: {
          label: 'Epidemiologische Bestätigung',
          documentation: 'Epidemiologische Bestätigung durch Kontakt oder Exposition'
        },
        fallkategorien: {
          name: 'fallklassifikation',
          decisionTable: {
            inputs: [],
            outputs: [],
            rules: [
              { inputEntries: [], outputEntries: ['A', 'Entfällt.'] },
              { inputEntries: [], outputEntries: ['B', 'Klinisch-epidemiologisch bestätigte Erkrankung'] },
              { inputEntries: [], outputEntries: ['C', 'Klinisch-labordiagnostisch bestätigte Erkrankung'] },
              { inputEntries: [], outputEntries: ['D', 'Labordiagnostisch nachgewiesene Infektion'] },
              { inputEntries: [], outputEntries: ['E', 'Labordiagnostisch nachgewiesene Infektion bei unbekanntem klinischen Bild'] }
            ]
          }
        },
        zusatzinfo: {
          label: 'Zusatzinformation',
          documentation: '- Kultivierung anzustreben\n- Speziesbestimmung übermitteln'
        },
        referenzdefinition: {
          label: 'Referenzdefinition',
          documentation: 'Nur Kategorien B und C werden gezählt.'
        },
        gesetzlicheGrundlage: {
          meldepflicht: {
            label: 'Meldepflicht',
            documentation: 'Meldepflicht gemäß § 7 IfSG'
          },
          uebermittlung: {
            label: 'Übermittlung',
            documentation: 'Übermittlung gemäß § 11 IfSG'
          }
        }
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      // Should have reasonable size for complete document
      expect(blob.size).toBeGreaterThan(5000);
    });

    it('should handle minimal data without errors', async () => {
      const dmnData = {
        metadata: {},
        klinischesBild: null,
        labordiagnostik: null,
        epidemiologie: null,
        fallkategorien: null,
        zusatzinfo: null,
        referenzdefinition: null,
        gesetzlicheGrundlage: {}
      };

      const blob = await generateWordDocument(dmnData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
