/**
 * Word document generation utilities for RKI Falldefinitionen
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Packer,
  UnderlineType
} from 'docx';

const BLUE_COLOR = '0563C1'; // RKI blue color for headings

/**
 * Creates a blue heading paragraph (RKI style)
 * @param {string} text - Heading text
 * @param {number} level - Heading level (1, 2, or 3)
 * @returns {Paragraph}
 */
function createBlueHeading(text, level = 1) {
  const sizes = { 1: 28, 2: 24, 3: 22 };
  const headingLevels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: BLUE_COLOR,
        size: sizes[level]
      })
    ],
    heading: headingLevels[level],
    spacing: {
      before: level === 1 ? 240 : 200,
      after: 100,
    }
  });
}

/**
 * Creates title paragraph (disease name in blue italic)
 * @param {string} krankheit - Disease name
 * @param {string} erreger - Pathogen name
 * @returns {Paragraph}
 */
function createTitle(krankheit, erreger) {
  return new Paragraph({
    children: [
      new TextRun({
        text: krankheit,
        bold: true,
        italics: true,
        color: BLUE_COLOR,
        size: 28
      }),
      new TextRun({
        text: ` (${erreger})`,
        italics: true,
        color: BLUE_COLOR,
        size: 28
      })
    ],
    heading: HeadingLevel.TITLE,
    spacing: {
      before: 0,
      after: 200,
    }
  });
}

/**
 * Creates a normal paragraph with optional formatting
 * @param {string|Array} content - Text content or array of TextRun objects
 * @param {Object} options - Formatting options
 * @returns {Paragraph}
 */
function createParagraph(content, options = {}) {
  const children = typeof content === 'string'
    ? [new TextRun(content)]
    : content;

  return new Paragraph({
    children,
    spacing: {
      before: 0,
      after: 120,
      line: 276, // 1.15 line spacing
    },
    ...options
  });
}

/**
 * Creates a bullet point paragraph
 * @param {string|Array} content - Text content or array of TextRun objects
 * @param {number} level - Bullet level (0 = dash, 1 = bullet)
 * @returns {Paragraph}
 */
function createBullet(content, level = 0) {
  const children = typeof content === 'string'
    ? [new TextRun(content)]
    : content;

  return new Paragraph({
    children,
    bullet: {
      level: level
    },
    spacing: {
      before: 0,
      after: 80,
      line: 276,
    }
  });
}

/**
 * Parses documentation text and creates formatted paragraphs
 * @param {string} text - Documentation text
 * @returns {Array<Paragraph>} Array of paragraphs
 */
function parseDocumentation(text) {
  const paragraphs = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  for (const line of lines) {
    // Check for bullet points starting with dash
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.substring(2).trim();
      paragraphs.push(createBullet(content, 0));
    }
    // Check for sub-bullets
    else if (line.match(/^\s+[-•]/)) {
      const content = line.replace(/^\s+[-•]\s*/, '').trim();
      paragraphs.push(createBullet(content, 1));
    }
    // Regular paragraph
    else {
      // Check for bold keywords
      const textRuns = [];
      const boldKeywords = ['ODER', 'mindestens einer', 'mindestens eines', 'mindestens eine', 'definiert als'];
      let currentText = line;

      boldKeywords.forEach(keyword => {
        if (currentText.includes(keyword)) {
          const parts = currentText.split(keyword);
          textRuns.push(new TextRun(parts[0]));
          textRuns.push(new TextRun({ text: keyword, bold: true }));
          currentText = parts.slice(1).join(keyword);
        }
      });

      if (textRuns.length === 0) {
        paragraphs.push(createParagraph(line));
      } else {
        textRuns.push(new TextRun(currentText));
        paragraphs.push(createParagraph(textRuns));
      }
    }
  }

  return paragraphs;
}

/**
 * Creates fall category sections (A, B, C, D, E)
 * @param {Object} fallkategorien - Fall classification decision
 * @returns {Array<Paragraph>} Array of paragraphs
 */
function createFallkategorien(fallkategorien) {
  const paragraphs = [];

  if (!fallkategorien || !fallkategorien.decisionTable) {
    return paragraphs;
  }

  const { rules, outputs } = fallkategorien.decisionTable;

  // Map output entries to category labels
  const categories = {
    'A': 'Klinisch diagnostizierte Erkrankung',
    'B': 'Klinisch-epidemiologisch bestätigte Erkrankung',
    'C': 'Klinisch-labordiagnostisch bestätigte Erkrankung',
    'D': 'Labordiagnostisch nachgewiesene Infektion bei nicht erfülltem klinischen Bild',
    'E': 'Labordiagnostisch nachgewiesene Infektion bei unbekanntem klinischen Bild'
  };

  rules.forEach((rule, index) => {
    const categoryLetter = String.fromCharCode(65 + index); // A, B, C, D, E
    const categoryLabel = categories[categoryLetter] || rule.outputEntries[0] || '';

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${categoryLetter}. `, bold: true }),
          new TextRun({ text: categoryLabel, bold: true })
        ],
        spacing: { before: 120, after: 80 }
      })
    );

    // Add description if available
    if (rule.outputEntries.length > 1 && rule.outputEntries[1]) {
      paragraphs.push(createParagraph(rule.outputEntries[1]));
    }
  });

  return paragraphs;
}

/**
 * Generates Word document from DMN data in RKI Falldefinition format
 * @param {Object} dmnData - Parsed DMN data
 * @returns {Promise<Blob>} Word document blob
 */
export async function generateWordDocument(dmnData) {
  const {
    metadata,
    klinischesBild,
    labordiagnostik,
    epidemiologie,
    fallkategorien,
    zusatzinfo,
    referenzdefinition,
    gesetzlicheGrundlage
  } = dmnData;

  const sections = [];

  // Title
  if (metadata.krankheit && metadata.erreger) {
    sections.push(createTitle(metadata.krankheit, metadata.erreger));
  }

  // Klinisches Bild
  if (klinischesBild) {
    sections.push(createBlueHeading('Klinisches Bild', 1));
    sections.push(...parseDocumentation(klinischesBild.documentation || ''));
  }

  // Labordiagnostischer Nachweis
  if (labordiagnostik) {
    sections.push(createBlueHeading('Labordiagnostischer Nachweis', 1));
    sections.push(...parseDocumentation(labordiagnostik.documentation || ''));
  }

  // Zusatzinformation (if present, goes after Labordiagnostik)
  if (zusatzinfo && zusatzinfo.documentation) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Zusatzinformation', bold: true })],
        spacing: { before: 120, after: 80 }
      })
    );
    sections.push(...parseDocumentation(zusatzinfo.documentation));
  }

  // Epidemiologische Bestätigung
  if (epidemiologie) {
    sections.push(createBlueHeading('Epidemiologische Bestätigung', 1));
    sections.push(...parseDocumentation(epidemiologie.documentation || ''));

    // Add Inkubationszeit if available
    if (metadata.inkubationszeit) {
      sections.push(createParagraph([
        new TextRun({ text: 'Inkubationszeit ', italics: true }),
        new TextRun(metadata.inkubationszeit)
      ]));
    }
  }

  // Über die zuständige Landesbehörde an das RKI zu übermittelnder Fall
  sections.push(createBlueHeading('Über die zuständige Landesbehörde an das RKI zu übermittelnder Fall', 1));
  sections.push(...createFallkategorien(fallkategorien));

  // Referenzdefinition
  if (referenzdefinition && referenzdefinition.documentation) {
    sections.push(createBlueHeading('Referenzdefinition', 1));
    sections.push(...parseDocumentation(referenzdefinition.documentation));
  }

  // Gesetzliche Grundlage
  sections.push(createBlueHeading('Gesetzliche Grundlage', 1));

  if (gesetzlicheGrundlage.meldepflicht) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Meldepflicht', bold: true })],
        spacing: { before: 100, after: 80 }
      })
    );
    sections.push(...parseDocumentation(gesetzlicheGrundlage.meldepflicht.documentation || ''));
  }

  if (gesetzlicheGrundlage.uebermittlung) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Übermittlung', bold: true })],
        spacing: { before: 100, after: 80 }
      })
    );
    sections.push(...parseDocumentation(gesetzlicheGrundlage.uebermittlung.documentation || ''));
  }

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections,
    }],
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Calibri',
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 0,
              after: 120,
            }
          }
        }
      ],
    },
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Triggers download of Word document
 * @param {Blob} blob - Document blob
 * @param {string} filename - Output filename
 */
export function downloadDocument(blob, filename = 'document.docx') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
