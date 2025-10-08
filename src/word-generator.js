/**
 * Word document generation utilities
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
  Packer
} from 'docx';

const BLUE_COLOR = '0070C0'; // Blue color for headings

/**
 * Creates a heading paragraph
 * @param {string} text - Heading text
 * @param {HeadingLevel} level - Heading level
 * @returns {Paragraph}
 */
function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: {
      before: 240,
      after: 120,
    },
    style: 'Heading',
  });
}

/**
 * Creates a paragraph with optional formatting
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
      before: 120,
      after: 120,
    },
    ...options
  });
}

/**
 * Creates a decision table
 * @param {Object} decisionTable - Decision table data
 * @returns {Table}
 */
function createDecisionTable(decisionTable) {
  if (!decisionTable) {
    return null;
  }

  const { inputs, outputs, rules } = decisionTable;

  // Create header row
  const headerCells = [
    ...inputs.map(input => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: input.label, bold: true })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { fill: 'D3D3D3' }
    })),
    ...outputs.map(output => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: output.label, bold: true })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { fill: 'D3D3D3' }
    }))
  ];

  const headerRow = new TableRow({
    children: headerCells,
    tableHeader: true,
  });

  // Create data rows
  const dataRows = rules.map(rule => {
    const cells = [
      ...rule.inputEntries.map(entry => new TableCell({
        children: [new Paragraph(entry)],
      })),
      ...rule.outputEntries.map(entry => new TableCell({
        children: [new Paragraph(entry)],
      }))
    ];
    return new TableRow({ children: cells });
  });

  return new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}

/**
 * Generates Word document from DMN data
 * @param {Object} dmnData - Parsed DMN data
 * @returns {Promise<Blob>} Word document blob
 */
export async function generateWordDocument(dmnData) {
  const { metadata, inputData, decisions } = dmnData;

  const sections = [];

  // Title and metadata
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: metadata.krankheit || 'Untitled',
          bold: true,
          size: 32,
          color: BLUE_COLOR,
        })
      ],
      spacing: { before: 0, after: 240 }
    })
  );

  // Metadata section
  if (metadata.erreger) {
    sections.push(createParagraph([
      new TextRun({ text: 'Erreger: ', bold: true }),
      new TextRun({ text: metadata.erreger, italics: true })
    ]));
  }

  if (metadata.stand) {
    sections.push(createParagraph([
      new TextRun({ text: 'Stand: ', bold: true }),
      new TextRun(metadata.stand)
    ]));
  }

  if (metadata.version) {
    sections.push(createParagraph([
      new TextRun({ text: 'Version: ', bold: true }),
      new TextRun(metadata.version)
    ]));
  }

  // Input Data section
  if (inputData && inputData.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Eingabedaten', bold: true, color: BLUE_COLOR, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 }
      })
    );

    inputData.forEach(input => {
      sections.push(createParagraph([
        new TextRun({ text: input.label || input.name, bold: true })
      ]));

      if (input.documentation) {
        sections.push(createParagraph(input.documentation));
      }
    });
  }

  // Decisions section
  if (decisions && decisions.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Entscheidungen', bold: true, color: BLUE_COLOR, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 }
      })
    );

    decisions.forEach(decision => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: decision.label || decision.name, bold: true, color: BLUE_COLOR, size: 24 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 }
        })
      );

      if (decision.documentation) {
        sections.push(createParagraph(decision.documentation));
      }

      if (decision.decisionTable) {
        const table = createDecisionTable(decision.decisionTable);
        if (table) {
          sections.push(new Paragraph({ text: '' })); // Spacing before table
          sections.push(table);
          sections.push(new Paragraph({ text: '' })); // Spacing after table
        }
      }
    });
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
          id: 'Heading',
          name: 'Heading',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            color: BLUE_COLOR,
            bold: true,
          },
        },
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
