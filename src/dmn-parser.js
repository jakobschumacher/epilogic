/**
 * DMN XML parsing utilities for RKI Falldefinitionen
 */

/**
 * Extracts metadata from DMN extensionElements
 * @param {Document} doc - The parsed XML document
 * @returns {Object} Metadata object
 */
export function extractMetadata(doc) {
  const metadata = {};

  const metadataElement = doc.querySelector('extensionElements metadata');
  if (!metadataElement) {
    return metadata;
  }

  // Extract all metadata fields
  const fields = ['krankheit', 'erreger', 'stand', 'version', 'inkubationszeit'];
  fields.forEach(field => {
    const element = metadataElement.querySelector(field);
    if (element) {
      metadata[field] = element.textContent.trim();
    }
  });

  return metadata;
}

/**
 * Extracts structured section content from inputData
 * Sections are identified by their name attribute
 * @param {Document} doc - The parsed XML document
 * @param {string} sectionName - Name of the section
 * @returns {Object|null} Section object with label and documentation
 */
function extractSection(doc, sectionName) {
  const element = doc.querySelector(`inputData[name="${sectionName}"]`);
  if (!element) {
    return null;
  }

  const label = element.getAttribute('label') || '';
  const docElement = element.querySelector('documentation');
  const documentation = docElement ? docElement.textContent.trim() : '';

  return {
    label,
    documentation
  };
}

/**
 * Extracts input data elements from DMN
 * @param {Document} doc - The parsed XML document
 * @returns {Array} Array of input data objects
 */
export function extractInputData(doc) {
  const inputDataElements = doc.querySelectorAll('inputData');
  const inputData = [];

  inputDataElements.forEach(element => {
    const id = element.getAttribute('id') || '';
    const name = element.getAttribute('name') || '';
    const label = element.getAttribute('label') || name;

    // Extract documentation if available
    const docElement = element.querySelector('documentation');
    const documentation = docElement ? docElement.textContent.trim() : '';

    inputData.push({
      id,
      name,
      label,
      documentation
    });
  });

  return inputData;
}

/**
 * Extracts decision table from a decision element
 * @param {Element} decisionElement - The decision element
 * @returns {Object|null} Decision table object or null
 */
function extractDecisionTable(decisionElement) {
  const decisionTable = decisionElement.querySelector('decisionTable');
  if (!decisionTable) {
    return null;
  }

  // Extract inputs
  const inputs = [];
  const inputElements = decisionTable.querySelectorAll('input');
  inputElements.forEach(input => {
    inputs.push({
      id: input.getAttribute('id') || '',
      label: input.getAttribute('label') || '',
      expression: input.querySelector('inputExpression')?.textContent?.trim() || ''
    });
  });

  // Extract outputs
  const outputs = [];
  const outputElements = decisionTable.querySelectorAll('output');
  outputElements.forEach(output => {
    outputs.push({
      id: output.getAttribute('id') || '',
      label: output.getAttribute('label') || '',
      name: output.getAttribute('name') || ''
    });
  });

  // Extract rules
  const rules = [];
  const ruleElements = decisionTable.querySelectorAll('rule');
  ruleElements.forEach(rule => {
    const inputEntries = [];
    const inputEntryElements = rule.querySelectorAll('inputEntry');
    inputEntryElements.forEach(entry => {
      inputEntries.push(entry.querySelector('text')?.textContent?.trim() || '');
    });

    const outputEntries = [];
    const outputEntryElements = rule.querySelectorAll('outputEntry');
    outputEntryElements.forEach(entry => {
      outputEntries.push(entry.querySelector('text')?.textContent?.trim() || '');
    });

    rules.push({
      inputEntries,
      outputEntries
    });
  });

  return {
    inputs,
    outputs,
    rules
  };
}

/**
 * Extracts decisions from DMN
 * @param {Document} doc - The parsed XML document
 * @returns {Array} Array of decision objects
 */
export function extractDecisions(doc) {
  const decisionElements = doc.querySelectorAll('decision');
  const decisions = [];

  decisionElements.forEach(element => {
    const id = element.getAttribute('id') || '';
    const name = element.getAttribute('name') || '';
    const label = element.getAttribute('label') || name;

    // Extract documentation
    const docElement = element.querySelector('documentation');
    const documentation = docElement ? docElement.textContent.trim() : '';

    // Extract decision table
    const decisionTable = extractDecisionTable(element);

    decisions.push({
      id,
      name,
      label,
      documentation,
      decisionTable
    });
  });

  return decisions;
}

/**
 * Parses complete DMN document for RKI Falldefinition
 * @param {Document} doc - The parsed XML document
 * @returns {Object} Complete DMN data structure
 */
export function parseDMN(doc) {
  return {
    metadata: extractMetadata(doc),
    klinischesBild: extractSection(doc, 'klinisches_bild'),
    labordiagnostik: extractSection(doc, 'labordiagnostik'),
    epidemiologie: extractSection(doc, 'epidemiologische_bestaetigung'),
    fallkategorien: extractDecisions(doc).find(d => d.name === 'fallklassifikation') || null,
    zusatzinfo: extractSection(doc, 'zusatzinformation'),
    referenzdefinition: extractSection(doc, 'referenzdefinition'),
    gesetzlicheGrundlage: {
      meldepflicht: extractSection(doc, 'meldepflicht'),
      uebermittlung: extractSection(doc, 'uebermittlung')
    }
  };
}
