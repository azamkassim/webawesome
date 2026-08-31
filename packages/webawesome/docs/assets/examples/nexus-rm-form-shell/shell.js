const form = document.querySelector('#visit-form');
const steps = [...document.querySelectorAll('.form-step')];
const backButton = document.querySelector('#back');
const nextButton = document.querySelector('#next');
const reviewButton = document.querySelector('#review');
const editButton = document.querySelector('#edit');
const clearButton = document.querySelector('#clear');
const progress = document.querySelector('#progress');
const progressLabel = document.querySelector('#progress-label');
const message = document.querySelector('#form-message');
const draft = document.querySelector('#draft');
const draftSummary = document.querySelector('#draft-summary');
const draftSignal = document.querySelector('#draft-signal');

let currentStep = 0;

function getControlValue(selector) {
  const control = document.querySelector(selector);
  return String(control?.value ?? '').trim();
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));

  steps.forEach((step, stepIndex) => {
    step.hidden = stepIndex !== currentStep;
  });

  backButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  reviewButton.hidden = currentStep !== steps.length - 1;
  progress.value = ((currentStep + 1) / steps.length) * 100;
  progressLabel.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  message.textContent = '';
  steps[currentStep].querySelector('wa-input, wa-select, wa-textarea, wa-radio-group')?.focus();
}

function validateCurrentStep() {
  const controls = [...steps[currentStep].querySelectorAll('[required]')];
  const invalidControl = controls.find(control => !control.checkValidity());

  if (!invalidControl) return true;

  invalidControl.reportValidity();
  invalidControl.focus();
  message.textContent = 'Complete the highlighted field before continuing.';
  return false;
}

function addSummaryItem(label, value) {
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value || 'Not recorded';
  draftSummary.append(term, description);
}

function prepareDraft() {
  const selectedEvidence = [...document.querySelectorAll('wa-checkbox[name="evidence"]')]
    .filter(item => item.checked)
    .map(item => item.textContent.trim())
    .join(', ');
  const signal = getControlValue('#risk-signal');
  const signalLabels = {
    stable: 'Stable',
    watch: 'Watch',
    escalate: 'Escalate',
  };

  draftSummary.replaceChildren();
  addSummaryItem('Reference', getControlValue('#reference'));
  addSummaryItem('Visit date', getControlValue('#visit-date'));
  addSummaryItem('Visit type', document.querySelector('#visit-type')?.displayLabel);
  addSummaryItem('Industry', document.querySelector('#industry')?.displayLabel);
  addSummaryItem('Direct observations', getControlValue('#observations'));
  addSummaryItem('Operating activity', getControlValue('#activity'));
  addSummaryItem('Evidence sighted', selectedEvidence);
  addSummaryItem('Preliminary signal', signalLabels[signal]);
  addSummaryItem('Recommended follow-up', getControlValue('#follow-up'));

  draftSignal.textContent = signalLabels[signal];
  draftSignal.variant = signal === 'escalate' ? 'danger' : signal === 'watch' ? 'warning' : 'success';
  form.hidden = true;
  draft.hidden = false;
  progress.value = 100;
  progressLabel.textContent = 'Draft ready for review';
  draft.focus();
  draft.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nextButton.addEventListener('click', () => {
  if (validateCurrentStep()) showStep(currentStep + 1);
});

backButton.addEventListener('click', () => showStep(currentStep - 1));

form.addEventListener('submit', event => {
  event.preventDefault();
  if (validateCurrentStep()) prepareDraft();
});

editButton.addEventListener('click', () => {
  draft.hidden = true;
  form.hidden = false;
  showStep(2);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

clearButton.addEventListener('click', () => {
  form.reset();
  draftSummary.replaceChildren();
  draft.hidden = true;
  form.hidden = false;
  showStep(0);
  message.textContent = 'Session cleared. No draft data was retained.';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

showStep(0);
