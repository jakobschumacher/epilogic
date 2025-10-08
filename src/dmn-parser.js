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
  // Get all inputData elements and find by name attribute
  const inputDataElements = doc.querySelectorAll('inputData');
  let element = null;

  for (const el of inputDataElements) {
    if (el.getAttribute('name') === sectionName) {
      element = el;
      break;
    }
  }

  if (!element) {
    console.log(`Section not found: ${sectionName}`);
    return null;
  }

  const label = element.getAttribute('label') || '';
  const docElement = element.querySelector('documentation');
  const documentation = docElement ? docElement.textContent.trim() : '';

  console.log(`Found section ${sectionName}:`, { label, hasDoc: !!documentation });

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

    // Extract documentation (supports both <documentation> and <description>)
    let documentation = '';
    const docElement = element.querySelector('documentation');
    const descElement = element.querySelector('description');
    if (docElement) {
      documentation = docElement.textContent.trim();
    } else if (descElement) {
      documentation = descElement.textContent.trim();
    }

    // Extract information requirements (inputs to this decision)
    const informationRequirements = [];
    const reqElements = element.querySelectorAll('informationRequirement');
    reqElements.forEach(req => {
      const requiredInput = req.querySelector('requiredInput');
      const requiredDecision = req.querySelector('requiredDecision');
      if (requiredInput) {
        const href = requiredInput.getAttribute('href');
        if (href) {
          informationRequirements.push(href);
        }
      } else if (requiredDecision) {
        const href = requiredDecision.getAttribute('href');
        if (href) {
          informationRequirements.push(href);
        }
      }
    });

    // Extract decision table
    const decisionTable = extractDecisionTable(element);

    decisions.push({
      id,
      name,
      label,
      documentation,
      decisionTable,
      informationRequirements
    });
  });

  return decisions;
}

/**
 * Parses complete DMN document for RKI Falldefinition
 * Supports both documentation-based and decision-based formats
 * @param {Document} doc - The parsed XML document
 * @returns {Object} Complete DMN data structure
 */
export function parseDMN(doc) {
  console.log('parseDMN: Starting parse...');

  const metadata = extractMetadata(doc);
  const decisions = extractDecisions(doc);

  console.log(`Found ${decisions.length} decisions`);
  decisions.forEach(d => {
    console.log(`  Decision: name="${d.name}", hasTable=${!!d.decisionTable}, hasDoc=${!!d.documentation}`);
  });

  // Try to find decisions by name
  const clinicalDecision = decisions.find(d => d.name === 'Klinisches Bild' || d.name === 'clinical_picture');
  const labDecision = decisions.find(d => d.name === 'Labordiagnostischer Nachweis' || d.name === 'lab_evidence');
  const epiDecision = decisions.find(d => d.name === 'Epidemiologische Bestätigung' || d.name === 'epi_confirmation');
  const fallklassifikation = decisions.find(d =>
    d.name === 'fallklassifikation' ||
    d.name === 'campylobacter_classification' ||
    d.name.includes('bermittlungsdefinition')
  );

  // Build content from decisions and their inputs
  const klinischesBild = clinicalDecision ? {
    label: 'Klinisches Bild',
    documentation: buildKlinischesBildText(doc, clinicalDecision)
  } : extractSection(doc, 'klinisches_bild');

  const labordiagnostik = labDecision ? {
    label: 'Labordiagnostischer Nachweis',
    documentation: buildLabordiagnostikText(doc, labDecision)
  } : extractSection(doc, 'labordiagnostik');

  const epidemiologie = epiDecision ? {
    label: 'Epidemiologische Bestätigung',
    documentation: buildEpidemiologieText(doc, epiDecision)
  } : extractSection(doc, 'epidemiologische_bestaetigung');

  // Extract inkubationszeit from epi decision description if present
  if (epiDecision && epiDecision.documentation && epiDecision.documentation.includes('Inkubationszeit')) {
    metadata.inkubationszeit = epiDecision.documentation;
  }

  // Extract Zusatzinfo from lab decision description if present
  const zusatzinfo = labDecision && labDecision.documentation ? {
    label: 'Zusatzinformation',
    documentation: labDecision.documentation
  } : extractSection(doc, 'zusatzinformation');

  const result = {
    metadata,
    klinischesBild,
    labordiagnostik,
    epidemiologie,
    fallkategorien: fallklassifikation,
    zusatzinfo,
    referenzdefinition: extractSection(doc, 'referenzdefinition'),
    gesetzlicheGrundlage: {
      meldepflicht: extractSection(doc, 'meldepflicht'),
      uebermittlung: extractSection(doc, 'uebermittlung')
    },
    allDecisions: decisions
  };

  console.log('parseDMN: Complete. Summary:', {
    hasKlinischesBild: !!result.klinischesBild,
    hasLabordiagnostik: !!result.labordiagnostik,
    hasEpidemiologie: !!result.epidemiologie,
    hasFallkategorien: !!result.fallkategorien,
    hasZusatzinfo: !!result.zusatzinfo
  });

  return result;
}

/**
 * Builds Klinisches Bild text from decision and its inputs
 */
function buildKlinischesBildText(doc, decision) {
  const inputRefs = decision.informationRequirements || [];
  const inputs = [];

  // Get inputs from information requirements
  inputRefs.forEach(ref => {
    const inputId = ref.replace('#', '');
    const inputElement = doc.querySelector(`inputData[id="${inputId}"]`);
    if (inputElement) {
      const name = inputElement.getAttribute('name');
      const desc = inputElement.querySelector('description');
      inputs.push({
        name,
        description: desc ? desc.textContent.trim() : ''
      });
    }
  });

  if (inputs.length === 0) {
    return 'Klinisches Bild einer akuten Erkrankung';
  }

  let text = `Klinisches Bild einer akuten Campylobacter-Enteritis, definiert als mindestens eines der folgenden Kriterien:\n`;
  inputs.forEach(input => {
    text += `- ${input.name}`;
    if (input.description) {
      text += ` (${input.description})`;
    }
    text += ',\n';
  });
  text = text.replace(/,\n$/, '\nODER krankheitsbedingter Tod.');

  return text;
}

/**
 * Builds Labordiagnostik text from decision and its inputs
 */
function buildLabordiagnostikText(doc, decision) {
  const inputRefs = decision.informationRequirements || [];
  const inputs = [];

  inputRefs.forEach(ref => {
    const inputId = ref.replace('#', '');
    const inputElement = doc.querySelector(`inputData[id="${inputId}"]`);
    if (inputElement) {
      const name = inputElement.getAttribute('name');
      const desc = inputElement.querySelector('description');
      inputs.push({
        name,
        description: desc ? desc.textContent.trim() : ''
      });
    }
  });

  if (inputs.length === 0) {
    return 'Positiver Befund mit labordiagnostischer Methode';
  }

  let text = `Positiver Befund mit mindestens einer der folgenden Methoden:\n[direkter Erregernachweis:]\n`;
  inputs.forEach(input => {
    text += `- ${input.name}`;
    if (input.description) {
      text += ` (${input.description})`;
    }
    text += ',\n';
  });

  return text.trim();
}

/**
 * Builds Epidemiologie text from decision and its inputs
 */
function buildEpidemiologieText(doc, decision) {
  const inputRefs = decision.informationRequirements || [];
  const inputs = [];

  inputRefs.forEach(ref => {
    const inputId = ref.replace('#', '');
    const inputElement = doc.querySelector(`inputData[id="${inputId}"]`);
    if (inputElement) {
      const name = inputElement.getAttribute('name');
      const desc = inputElement.querySelector('description');
      inputs.push({
        name,
        description: desc ? desc.textContent.trim() : ''
      });
    }
  });

  if (inputs.length === 0) {
    return 'Epidemiologische Bestätigung vorhanden';
  }

  let text = `Epidemiologische Bestätigung, definiert als mindestens einer der folgenden Nachweise unter Berücksichtigung der Inkubationszeit:\n`;
  inputs.forEach(input => {
    text += `• ${input.name}`;
    if (input.description) {
      text += ` (${input.description})`;
    }
    text += ',\n';
  });

  return text.trim();
}
