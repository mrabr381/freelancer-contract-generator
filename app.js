/* Freelancer Contract Generator — DOM glue. Core logic lives in contract.js. */
(function () {
  'use strict';

  var state = {
    templateId: 'service-agreement',
    values: {}
  };

  var pickerEl = document.getElementById('template-picker');
  var formEl = document.getElementById('contract-form');
  var previewEl = document.getElementById('preview');
  var previewNameEl = document.getElementById('preview-template-name');
  var errorEl = document.getElementById('validation-error');

  function buildPicker() {
    pickerEl.innerHTML = '';
    ContractGen.listTemplates().forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'template-btn' + (t.id === state.templateId ? ' active' : '');
      btn.dataset.templateId = t.id;
      btn.innerHTML = '<strong></strong><small></small>';
      btn.querySelector('strong').textContent = t.name;
      btn.querySelector('small').textContent = t.tagline;
      btn.addEventListener('click', function () {
        state.templateId = t.id;
        state.values = {};
        errorEl.classList.remove('show');
        buildPicker();
        buildForm();
        render();
      });
      pickerEl.appendChild(btn);
    });
  }

  function buildForm() {
    var template = ContractGen.getTemplate(state.templateId);
    formEl.innerHTML = '';
    template.fields.forEach(function (f) {
      var wrap = document.createElement('div');
      wrap.className = 'field';

      var label = document.createElement('label');
      label.htmlFor = 'field-' + f.key;
      label.textContent = f.label + (f.required ? ' ' : '');
      if (f.required) {
        var req = document.createElement('span');
        req.className = 'req';
        req.textContent = '*';
        label.appendChild(req);
      }
      wrap.appendChild(label);

      var input = f.type === 'textarea'
        ? document.createElement('textarea')
        : document.createElement('input');
      input.id = 'field-' + f.key;
      input.name = f.key;
      if (f.type && f.type !== 'textarea') input.type = f.type;
      if (f.placeholder) input.placeholder = f.placeholder;
      input.value = state.values[f.key] || '';
      input.addEventListener('input', function () {
        state.values[f.key] = input.value;
        render();
      });
      wrap.appendChild(input);
      formEl.appendChild(wrap);
    });
  }

  function render() {
    var template = ContractGen.getTemplate(state.templateId);
    previewNameEl.textContent = template.name;
    previewEl.innerHTML = ContractGen.renderContract(state.templateId, state.values);
  }

  document.getElementById('btn-print').addEventListener('click', function () {
    var missing = ContractGen.validate(state.templateId, state.values);
    if (missing.length) {
      errorEl.textContent = 'Fill in the required fields before downloading: ' + missing.join(', ') + '.';
      errorEl.classList.add('show');
      var template = ContractGen.getTemplate(state.templateId);
      var firstMissing = template.fields.find(function (f) { return missing.indexOf(f.label) !== -1; });
      if (firstMissing) {
        var first = document.getElementById('field-' + firstMissing.key);
        if (first) first.focus();
      }
      return;
    }
    errorEl.classList.remove('show');
    window.print();
  });

  document.getElementById('btn-copy').addEventListener('click', function (e) {
    var text = ContractGen.renderText(state.templateId, state.values);
    var done = function () { e.target.textContent = 'Copied!'; setTimeout(function () { e.target.textContent = 'Copy text'; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  document.getElementById('btn-clear').addEventListener('click', function () {
    state.values = {};
    errorEl.classList.remove('show');
    buildForm();
    render();
  });

  buildPicker();
  buildForm();
  render();
})();
