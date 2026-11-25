/* Freelancer Contract Generator — core logic (no DOM, no dependencies).
 * Shared by the browser tool (index.html) and the Node test suite.
 * Works in Node (module.exports) and in the browser (window.ContractGen).
 */
(function (root) {
  'use strict';

  var BLANK = '<span class="blank">________________</span>';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function val(values, key) {
    var v = values ? values[key] : undefined;
    if (v == null) return '';
    return String(v).trim();
  }

  // A filled value, HTML-escaped; an empty one renders as a visible blank line.
  function fill(values, key) {
    var v = val(values, key);
    return v ? escapeHtml(v) : BLANK;
  }

  function money(values) {
    var fee = val(values, 'fee');
    var currency = val(values, 'currency') || 'USD';
    return fee ? escapeHtml(currency + ' ' + fee) : BLANK;
  }

  function section(title, body) {
    return '<h2>' + title + '</h2><p>' + body + '</p>';
  }

  function clause(num, title, body) {
    return '<h2>' + num + '. ' + title + '</h2><p>' + body + '</p>';
  }

  var TEMPLATES = {
    'service-agreement': {
      id: 'service-agreement',
      name: 'Service Agreement',
      tagline: 'Freelancer ↔ client: what you will do, what it costs, when it is due.',
      fields: [
        { key: 'freelancerName', label: 'Freelancer name', required: true },
        { key: 'clientName', label: 'Client name', required: true },
        { key: 'services', label: 'Services / scope of work', type: 'textarea', required: true, placeholder: 'e.g. Design a 5-page website, logo and brand colours' },
        { key: 'startDate', label: 'Start date', type: 'date', required: true },
        { key: 'endDate', label: 'End date', type: 'date', placeholder: 'Leave blank for open-ended' },
        { key: 'fee', label: 'Total fee', required: true, placeholder: 'e.g. 1,500' },
        { key: 'currency', label: 'Currency', placeholder: 'USD' },
        { key: 'paymentTerms', label: 'Payment terms', type: 'textarea', placeholder: 'e.g. 50% upfront, 50% on delivery, within 14 days of invoice' },
        { key: 'governingLaw', label: 'Governing law / jurisdiction', placeholder: 'e.g. England and Wales' }
      ],
      render: function (v) {
        var end = val(v, 'endDate') ? fill(v, 'endDate') : 'until the Services are completed or this Agreement is terminated';
        return '' +
          '<h1>Freelance Service Agreement</h1>' +
          '<p class="meta">Between <strong>' + fill(v, 'freelancerName') + '</strong> (the "Freelancer") and <strong>' + fill(v, 'clientName') + '</strong> (the "Client").</p>' +
          clause(1, 'Services', 'The Freelancer will provide the following services: ' + fill(v, 'services') + '.') +
          clause(2, 'Term', 'This Agreement starts on ' + fill(v, 'startDate') + ' and continues ' + end + '.') +
          clause(3, 'Fees and Payment', 'The Client will pay the Freelancer a total fee of ' + money(v) + '. Payment terms: ' + fill(v, 'paymentTerms') + '. Late payments may pause further work until paid.') +
          clause(4, 'Changes', 'Work outside the scope above is a change request. The Freelancer will quote the extra cost and time in writing, and work starts only after the Client approves it in writing.') +
          clause(5, 'Ownership', 'On full payment, the Client owns the finished work delivered under this Agreement. The Freelancer keeps the right to show the work in a portfolio, unless the Client asks otherwise in writing.') +
          clause(6, 'Confidentiality', 'Each party will keep the other party\u2019s non-public information confidential and will not share it with anyone except as needed to perform this Agreement.') +
          clause(7, 'Termination', 'Either party may end this Agreement with 14 days\u2019 written notice. The Client pays for all work completed up to the end date.') +
          clause(8, 'Liability', 'Neither party is liable for indirect or consequential loss. The Freelancer\u2019s total liability under this Agreement is limited to the fees paid.') +
          clause(9, 'Governing Law', 'This Agreement is governed by the laws of ' + fill(v, 'governingLaw') + '.') +
          '<h2>Signatures</h2>' +
          '<div class="sig-grid"><div><p>Freelancer: ' + fill(v, 'freelancerName') + '</p><p class="sig-line">Signature / Date</p></div>' +
          '<div><p>Client: ' + fill(v, 'clientName') + '</p><p class="sig-line">Signature / Date</p></div></div>';
      }
    },

    'nda': {
      id: 'nda',
      name: 'Non-Disclosure Agreement (NDA)',
      tagline: 'Protect ideas and client info shared before — or during — a project.',
      fields: [
        { key: 'disclosingParty', label: 'Disclosing party', required: true, placeholder: 'Who is sharing the confidential info?' },
        { key: 'receivingParty', label: 'Receiving party', required: true, placeholder: 'Who is receiving it?' },
        { key: 'purpose', label: 'Purpose', type: 'textarea', required: true, placeholder: 'e.g. Discussing a website redesign project' },
        { key: 'effectiveDate', label: 'Effective date', type: 'date', required: true },
        { key: 'durationYears', label: 'Confidentiality lasts (years)', placeholder: '2' },
        { key: 'governingLaw', label: 'Governing law / jurisdiction', placeholder: 'e.g. England and Wales' }
      ],
      render: function (v) {
        var years = val(v, 'durationYears') || '2';
        return '' +
          '<h1>Non-Disclosure Agreement</h1>' +
          '<p class="meta">Between <strong>' + fill(v, 'disclosingParty') + '</strong> (the "Disclosing Party") and <strong>' + fill(v, 'receivingParty') + '</strong> (the "Receiving Party"), effective ' + fill(v, 'effectiveDate') + '.</p>' +
          clause(1, 'Purpose', 'The parties are sharing information to explore or carry out: ' + fill(v, 'purpose') + '.') +
          clause(2, 'Confidential Information', 'Confidential Information is any non-public information shared by the Disclosing Party, in any form, that is marked confidential or that a reasonable person would understand to be confidential.') +
          clause(3, 'Obligations', 'The Receiving Party will keep Confidential Information strictly confidential, will not disclose it to anyone except its own staff or advisers who need it for the Purpose and are bound by confidentiality, and will not use it for any purpose other than the Purpose.') +
          clause(4, 'Exclusions', 'This Agreement does not cover information that is or becomes public through no fault of the Receiving Party, was already known to the Receiving Party, or is independently developed without use of the Confidential Information.') +
          clause(5, 'Duration', 'The confidentiality obligations in this Agreement last for ' + escapeHtml(years) + ' years from the Effective Date.') +
          clause(6, 'No Other Rights', 'Sharing information under this Agreement grants no licence or ownership right, and creates no obligation to do business together.') +
          clause(7, 'Governing Law', 'This Agreement is governed by the laws of ' + fill(v, 'governingLaw') + '.') +
          '<h2>Signatures</h2>' +
          '<div class="sig-grid"><div><p>Disclosing Party: ' + fill(v, 'disclosingParty') + '</p><p class="sig-line">Signature / Date</p></div>' +
          '<div><p>Receiving Party: ' + fill(v, 'receivingParty') + '</p><p class="sig-line">Signature / Date</p></div></div>';
      }
    },

    'scope-of-work': {
      id: 'scope-of-work',
      name: 'Scope of Work (SOW)',
      tagline: 'The exact deliverables, milestones and price — attach it to any agreement.',
      fields: [
        { key: 'projectName', label: 'Project name', required: true },
        { key: 'clientName', label: 'Client name', required: true },
        { key: 'freelancerName', label: 'Freelancer name', required: true },
        { key: 'deliverables', label: 'Deliverables', type: 'textarea', required: true, placeholder: 'e.g. 1. Homepage design (Figma)\n2. 5-page responsive website\n3. Logo files (SVG + PNG)' },
        { key: 'milestones', label: 'Milestones / deadlines', type: 'textarea', placeholder: 'e.g. Draft by 10 Dec, final delivery by 20 Dec' },
        { key: 'fee', label: 'Total fee', required: true, placeholder: 'e.g. 1,500' },
        { key: 'currency', label: 'Currency', placeholder: 'USD' },
        { key: 'revisions', label: 'Revisions included', placeholder: 'e.g. 2 rounds of revisions' },
        { key: 'startDate', label: 'Start date', type: 'date' }
      ],
      render: function (v) {
        return '' +
          '<h1>Scope of Work</h1>' +
          '<p class="meta">Project: <strong>' + fill(v, 'projectName') + '</strong><br>Client: <strong>' + fill(v, 'clientName') + '</strong> &nbsp;·&nbsp; Freelancer: <strong>' + fill(v, 'freelancerName') + '</strong>' +
          (val(v, 'startDate') ? '<br>Start date: <strong>' + fill(v, 'startDate') + '</strong>' : '') + '</p>' +
          section('Deliverables', fill(v, 'deliverables')) +
          section('Milestones &amp; Deadlines', fill(v, 'milestones')) +
          section('Fee', 'Total fee: ' + money(v) + '.') +
          section('Revisions', fill(v, 'revisions')) +
          section('Acceptance', 'The Client reviews each deliverable within 7 days of delivery. If no feedback is given in that time, the deliverable is treated as accepted.') +
          section('Out of Scope', 'Anything not listed under Deliverables is out of scope and will be quoted separately in writing.') +
          '<h2>Agreed</h2>' +
          '<div class="sig-grid"><div><p>Freelancer: ' + fill(v, 'freelancerName') + '</p><p class="sig-line">Signature / Date</p></div>' +
          '<div><p>Client: ' + fill(v, 'clientName') + '</p><p class="sig-line">Signature / Date</p></div></div>';
      }
    }
  };

  function listTemplates() {
    return Object.keys(TEMPLATES).map(function (id) {
      var t = TEMPLATES[id];
      return { id: t.id, name: t.name, tagline: t.tagline };
    });
  }

  function getTemplate(id) {
    return TEMPLATES[id] || null;
  }

  // Returns the labels of required fields that are still empty.
  function validate(templateId, values) {
    var t = getTemplate(templateId);
    if (!t) return ['Unknown template'];
    return t.fields
      .filter(function (f) { return f.required && !val(values, f.key); })
      .map(function (f) { return f.label; });
  }

  function renderContract(templateId, values) {
    var t = getTemplate(templateId);
    if (!t) throw new Error('Unknown template: ' + templateId);
    return t.render(values || {});
  }

  // Full standalone HTML document used for printing / saving as PDF.
  // Contains only the filled contract — no app chrome.
  function renderPrintHtml(templateId, values) {
    var t = getTemplate(templateId);
    if (!t) throw new Error('Unknown template: ' + templateId);
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      '<title>' + escapeHtml(t.name) + ' — Freelancer Contract Generator</title>' +
      '<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;color:#111;line-height:1.6;padding:0 20px}' +
      'h1{font-size:24px;border-bottom:2px solid #111;padding-bottom:8px}h2{font-size:16px;margin-top:24px}' +
      '.sig-line{border-top:1px solid #999;margin-top:48px;padding-top:4px;color:#666}' +
      '.blank{color:#999}</style></head><body>' +
      renderContract(templateId, values) +
      '<p style="font-size:12px;color:#666;margin-top:40px">This is a general template, not legal advice and not a substitute for a lawyer.</p>' +
      '</body></html>';
  }

  // Plain-text version of a contract (for the Copy button).
  function renderText(templateId, values) {
    var html = renderContract(templateId, values);
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n').replace(/<\/h1>/gi, '\n\n').replace(/<\/h2>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\u2019/g, "'")
      .replace(/\n{3,}/g, '\n\n').trim();
  }

  var api = {
    BLANK: BLANK,
    listTemplates: listTemplates,
    getTemplate: getTemplate,
    validate: validate,
    renderContract: renderContract,
    renderPrintHtml: renderPrintHtml,
    renderText: renderText,
    escapeHtml: escapeHtml
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ContractGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
