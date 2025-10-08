/**
 * Markdown generation utilities for DMN decision tables
 */

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

  markdown += '| ' + headers.join(' | ') + ' |\n';
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

  // Create data rows
  rules.forEach(rule => {
    const cells = [
      ...rule.inputEntries,
      ...rule.outputEntries
    ];
    markdown += '| ' + cells.join(' | ') + ' |\n';
  });

  markdown += '\n';

  return markdown;
}

/**
 * Generates markdown document from DMN data showing only decision tables
 * @param {Object} dmnData - Parsed DMN data
 * @returns {string} Markdown formatted document
 */
export function generateMarkdownDocument(dmnData) {
  const { metadata, fallkategorien } = dmnData;

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

  // Fallklassifikation decision table
  if (fallkategorien && fallkategorien.decisionTable) {
    markdown += generateDecisionTableMarkdown(
      fallkategorien.decisionTable,
      fallkategorien.label || fallkategorien.name || 'Fallklassifikation'
    );
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
