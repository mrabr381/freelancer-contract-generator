/* Tests for the Freelancer Contract Generator core logic (contract.js).
 * Run with: node --test tests/  (no dependencies)
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const ContractGen = require('../contract.js');

const SERVICE_VALUES = {
  freelancerName: 'Aisha Khan',
  clientName: 'Bright Studio Ltd',
  services: 'Design a 5-page website and logo',
  startDate: '2026-12-01',
  endDate: '2027-01-15',
  fee: '1,500',
  currency: 'USD',
  paymentTerms: '50% upfront, 50% on delivery',
  governingLaw: 'England and Wales',
};

const NDA_VALUES = {
  disclosingParty: 'Bright Studio Ltd',
  receivingParty: 'Aisha Khan',
  purpose: 'Discussing a website redesign project',
  effectiveDate: '2026-11-25',
  durationYears: '3',
  governingLaw: 'England and Wales',
};

const SOW_VALUES = {
  projectName: 'Website Redesign',
  clientName: 'Bright Studio Ltd',
  freelancerName: 'Aisha Khan',
  deliverables: '1. Homepage design (Figma)\n2. 5-page responsive website',
  milestones: 'Draft by 10 Dec, final delivery by 20 Dec',
  fee: '2,000',
  currency: 'GBP',
  revisions: '2 rounds of revisions',
  startDate: '2026-12-01',
};

test('lists exactly the three templates', () => {
  const templates = ContractGen.listTemplates();
  assert.equal(templates.length, 3);
  assert.deepEqual(templates.map((t) => t.id),
    ['service-agreement', 'nda', 'scope-of-work']);
});

test('service agreement renders every filled value', () => {
  const html = ContractGen.renderContract('service-agreement', SERVICE_VALUES);
  for (const value of ['Aisha Khan', 'Bright Studio Ltd', 'Design a 5-page website and logo',
    '2026-12-01', '2027-01-15', 'USD 1,500', '50% upfront, 50% on delivery',
    'England and Wales']) {
    assert.ok(html.includes(value), `missing value in contract: ${value}`);
  }
  assert.ok(html.includes('Freelance Service Agreement'));
});

test('NDA renders every filled value, including the duration', () => {
  const html = ContractGen.renderContract('nda', NDA_VALUES);
  for (const value of ['Bright Studio Ltd', 'Aisha Khan',
    'Discussing a website redesign project', '2026-11-25', '3 years']) {
    assert.ok(html.includes(value), `missing value in NDA: ${value}`);
  }
});

test('scope of work renders every filled value', () => {
  const html = ContractGen.renderContract('scope-of-work', SOW_VALUES);
  for (const value of ['Website Redesign', 'Bright Studio Ltd', 'Aisha Khan',
    'Homepage design (Figma)', 'Draft by 10 Dec', 'GBP 2,000', '2 rounds of revisions']) {
    assert.ok(html.includes(value), `missing value in SOW: ${value}`);
  }
});

test('required-field validation reports exactly the missing fields', () => {
  assert.deepEqual(ContractGen.validate('service-agreement', {}),
    ['Freelancer name', 'Client name', 'Services / scope of work', 'Start date', 'Total fee']);
  assert.deepEqual(ContractGen.validate('service-agreement', SERVICE_VALUES), []);
  assert.deepEqual(ContractGen.validate('nda', { disclosingParty: 'X' }),
    ['Receiving party', 'Purpose', 'Effective date']);
  assert.deepEqual(ContractGen.validate('scope-of-work', SOW_VALUES), []);
});

test('validation treats whitespace-only values as missing', () => {
  const values = { ...SERVICE_VALUES, freelancerName: '   ' };
  assert.ok(ContractGen.validate('service-agreement', values).includes('Freelancer name'));
});

test('validation reports an unknown template instead of crashing', () => {
  assert.deepEqual(ContractGen.validate('not-a-template', {}), ['Unknown template']);
});

test('blank values render as a visible blank line, never "undefined" or empty', () => {
  const html = ContractGen.renderContract('service-agreement', {});
  assert.ok(!html.includes('undefined'), 'contract contains "undefined"');
  assert.ok(!html.includes('null'), 'contract contains "null"');
  assert.ok(html.includes('class="blank"'), 'blank fields should render a visible blank');
  // A partially filled contract shows the filled value and blanks for the rest.
  const partial = ContractGen.renderContract('nda', { disclosingParty: 'Bright Studio Ltd' });
  assert.ok(partial.includes('Bright Studio Ltd'));
  assert.ok(partial.includes('class="blank"'));
});

test('user input is HTML-escaped, not injected into the page', () => {
  const html = ContractGen.renderContract('service-agreement', {
    ...SERVICE_VALUES,
    clientName: '<script>alert("x")</script>',
  });
  assert.ok(!html.includes('<script>alert'), 'raw script tag leaked into contract');
  assert.ok(html.includes('&lt;script&gt;'));
});

test('print/PDF document includes every filled value', () => {
  const printHtml = ContractGen.renderPrintHtml('service-agreement', SERVICE_VALUES);
  for (const value of ['Aisha Khan', 'Bright Studio Ltd', 'Design a 5-page website and logo',
    'USD 1,500', '2026-12-01']) {
    assert.ok(printHtml.includes(value), `missing value in print document: ${value}`);
  }
  assert.ok(printHtml.includes('<!DOCTYPE html>'));
  assert.ok(printHtml.includes('not legal advice'), 'print doc must carry the disclaimer');
});

test('print document works for all three templates', () => {
  assert.ok(ContractGen.renderPrintHtml('nda', NDA_VALUES).includes('Discussing a website redesign project'));
  assert.ok(ContractGen.renderPrintHtml('scope-of-work', SOW_VALUES).includes('Website Redesign'));
});

test('rendering an unknown template throws a clear error', () => {
  assert.throws(() => ContractGen.renderContract('not-a-template', {}), /Unknown template/);
  assert.throws(() => ContractGen.renderPrintHtml('not-a-template', {}), /Unknown template/);
});

test('plain-text copy version includes the filled values without HTML', () => {
  const text = ContractGen.renderText('service-agreement', SERVICE_VALUES);
  assert.ok(!text.includes('<'), 'plain text should contain no tags');
  assert.ok(text.includes('Aisha Khan'));
  assert.ok(text.includes('USD 1,500'));
});
