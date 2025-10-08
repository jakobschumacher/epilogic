/**
 * Markdown generation utilities for DMN decision tables
 */

/**
 * Calculates column widths for proper alignment
 * @param {Array} headers - Column headers
 * @param {Array} rules - Table rows
 * @returns {Array} Width for each column
 */
function calculateColumnWidths(headers, rules) {
  const widths = headers.map(h => h.length);

  rules.forEach(rule => {
    const cells = [...rule.inputEntries, ...rule.outputEntries];
    cells.forEach((cell, i) => {
      if (i < widths.length) {
        widths[i] = Math.max(widths[i], cell.length);
      }
    });
  });

  return widths;
}

/**
 * Pads text to a specific width
 * @param {string} text - Text to pad
 * @param {number} width - Target width
 * @returns {string} Padded text
 */
function padCell(text, width) {
  return text + ' '.repeat(Math.max(0, width - text.length));
}

/**
 * Generates markdown table from decision table
 * @param {Object} decisionTable - Decision table data
 * @param {string} decisionName - Name of the decision
 * @returns {string} Markdown formatted table
 */
function generateDecisionTableMarkdown(decisionTable, decisionName) {
  if (!decisionTable) {
    return '';
  }

  const { inputs, outputs, rules } = decisionTable;

  let markdown = `## ${decisionName}\n\n`;

  // Create header row
  const headers = [
    ...inputs.map(input => input.label || input.id),
    ...outputs.map(output => output.label || output.name || output.id)
  ];

  // Calculate column widths
  const widths = calculateColumnWidths(headers, rules);

  // Create header row with padding
  markdown += '| ' + headers.map((h, i) => padCell(h, widths[i])).join(' | ') + ' |\n';
  markdown += '| ' + widths.map(w => '-'.repeat(w)).join(' | ') + ' |\n';

  // Create data rows with padding
  rules.forEach(rule => {
    const cells = [
      ...rule.inputEntries,
      ...rule.outputEntries
    ];
    markdown += '| ' + cells.map((c, i) => padCell(c, widths[i])).join(' | ') + ' |\n';
  });

  markdown += '\n';

  return markdown;
}

/**
 * Generates markdown document from DMN data showing all decision tables
 * @param {Object} dmnData - Parsed DMN data
 * @returns {string} Markdown formatted document
 */
export function generateMarkdownDocument(dmnData) {
  const { metadata, allDecisions } = dmnData;

  let markdown = '';

  // Title
  if (metadata.krankheit && metadata.erreger) {
    markdown += `# ${metadata.krankheit} (${metadata.erreger})\n\n`;
  }

  // Metadata
  if (metadata.stand) {
    markdown += `**Stand:** ${metadata.stand}  \n`;
  }
  if (metadata.version) {
    markdown += `**Version:** ${metadata.version}  \n`;
  }
  markdown += '\n';

  // Export all decision tables
  if (allDecisions && allDecisions.length > 0) {
    allDecisions.forEach(decision => {
      if (decision.decisionTable) {
        markdown += generateDecisionTableMarkdown(
          decision.decisionTable,
          decision.label || decision.name || 'Decision'
        );
      }
    });
  } else {
    // Fallback to just fallkategorien for backward compatibility
    const { fallkategorien } = dmnData;
    if (fallkategorien && fallkategorien.decisionTable) {
      markdown += generateDecisionTableMarkdown(
        fallkategorien.decisionTable,
        fallkategorien.label || fallkategorien.name || 'Fallklassifikation'
      );
    }
  }

  return markdown;
}

/**
 * Triggers download of markdown file
 * @param {string} markdown - Markdown content
 * @param {string} filename - Output filename
 */
export function downloadMarkdown(markdown, filename = 'document.md') {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
