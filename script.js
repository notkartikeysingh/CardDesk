/* CardDesk — frontend-only student ID replacement prototype.
   All application data is stored locally in the current browser. */
(() => {
  'use strict';

  const STORAGE_KEY = 'carddesk-demo-application-v1';
  const FEES = { standard: 500, urgent: 900 }; // Edit these sample amounts as needed.
  const STAGES = [
    { title: 'Submitted', detail: 'Application received', update: 'Your application has been submitted successfully.' },
    { title: 'Payment Verified', detail: 'Fee confirmation', update: 'Payment has been marked as verified. Your request is cleared for processing.' },
    { title: 'Printing', detail: 'Card is being prepared', update: 'Your replacement card is now in the printing queue.' },
    { title: 'Ready for Collection', detail: 'Collect from the admin office', update: 'Your new ID card is ready. Please visit the designated collection counter with your student details.' }
  ];

  const $ = (selector) => document.querySelector(selector);
  const form = $('#applicationForm');
  const reasonInputs = [...document.querySelectorAll('input[name="reason"]')];
  const speedInputs = [...document.querySelectorAll('input[name="speed"]')];
  const policeAck = $('#policeAck');
  const oldCardAck = $('#oldCardAck');
  let application = loadApplication();
  let toastTimer;

  function loadApplication() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Could not read saved CardDesk demo data:', error);
      return null;
    }
  }

  function saveApplication() {
    try {
      if (application) localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not save CardDesk demo data:', error);
      showToast('Browser storage is unavailable. Your current session may not persist.');
    }
  }

  function getSelectedReason() {
    return reasonInputs.find((input) => input.checked)?.value || '';
  }

  function getSelectedSpeed() {
    return speedInputs.find((input) => input.checked)?.value || 'standard';
  }

  function formatMoney(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }

  function updateFeeSummary() {
    const speed = getSelectedSpeed();
    const fee = FEES[speed];

    // Update all three amounts whenever the selected radio option changes.
    $('#summaryAmount').textContent = formatMoney(fee);
    $('#chargeAmount').textContent = formatMoney(fee);
    $('#totalAmount').textContent = formatMoney(fee);
    $('#summaryCaption').textContent = speed === 'urgent'
      ? 'Urgent 24-hour processing selected'
      : 'Standard reissue selected';

    // Keep the visual card state in sync with the actual radio selection.
    $('#standardOption').classList.toggle('selected', speed === 'standard');
    $('#urgentOption').classList.toggle('selected', speed === 'urgent');
  }

  function updateDocumentRequirements() {
    const reason = getSelectedReason();
    const policeRequired = reason === 'Lost';
    const oldCardRequired = reason === 'Damaged' || reason === 'Defaced';
    const policeRow = $('#policeDocument');
    const oldCardRow = $('#oldCardDocument');

    policeRow.classList.toggle('active-required', policeRequired);
    policeRow.classList.toggle('inactive', !policeRequired);
    oldCardRow.classList.toggle('active-required', oldCardRequired);
    oldCardRow.classList.toggle('inactive', !oldCardRequired);
    policeAck.disabled = !policeRequired;
    oldCardAck.disabled = !oldCardRequired;
    if (!policeRequired) policeAck.checked = false;
    if (!oldCardRequired) oldCardAck.checked = false;

    const hint = $('#documentHint');
    if (!reason) hint.textContent = 'Choose a reason above to see which document confirmation is required.';
    else if (policeRequired) hint.textContent = 'Required for a lost card: confirm that you have the police lost-report acknowledgement.';
    else hint.textContent = 'Required for a damaged or defaced card: confirm that you can submit the old card at collection.';
  }

  function makeApplicationId() {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `IDR-${year}-${random}`;
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'ST';
  }

  function updateDashboard() {
    const hasApp = Boolean(application);
    const steps = [...document.querySelectorAll('.timeline-step')];

    // Keep the four-stage pipeline visible even before the first submission.
    $('#emptyTracking').classList.toggle('hidden', hasApp);
    $('#trackerPerson').classList.toggle('hidden', !hasApp);
    $('#trackerBottom').classList.toggle('hidden', !hasApp);
    $('#demoDisclaimer').classList.toggle('hidden', !hasApp);
    $('#pipelineHint').classList.toggle('hidden', hasApp);

    $('#statStatus').textContent = hasApp ? STAGES[application.stage].title : 'Not started';
    $('#statSub').textContent = hasApp ? application.id : 'Your progress will appear here';
    $('#statusDot').style.background = hasApp ? '#78a990' : '#d2d9d7';
    $('#applicationId').textContent = hasApp ? application.id : 'Not generated';

    if (!hasApp) {
      steps.forEach((step, index) => {
        step.classList.remove('completed', 'current');
        step.classList.add('pending');
        step.querySelector('.timeline-node').textContent = String(index + 1);
      });
      return;
    }

    $('#trackerInitials').textContent = initials(application.fullName);
    $('#trackerName').textContent = application.fullName;
    $('#trackerRoll').textContent = application.roll;
    $('#trackerReason').textContent = application.reason;
    $('#currentStatus').textContent = STAGES[application.stage].title;
    $('#trackerUpdate').textContent = STAGES[application.stage].update;
    $('#advanceStatus').disabled = application.stage >= STAGES.length - 1;
    $('#advanceStatus').textContent = application.stage >= STAGES.length - 1 ? 'Completed ✓' : 'Advance demo status →';
    $('#advanceStatus').style.opacity = application.stage >= STAGES.length - 1 ? '.6' : '1';

    steps.forEach((step, index) => {
      step.classList.toggle('completed', index < application.stage);
      step.classList.toggle('current', index === application.stage);
      step.classList.toggle('pending', index > application.stage);
      const node = step.querySelector('.timeline-node');
      node.textContent = index < application.stage ? '✓' : String(index + 1);
    });
  }

  function validateDocuments(reason) {
    if (reason === 'Lost' && !policeAck.checked) return 'Please confirm the police lost-report acknowledgement before submitting.';
    if ((reason === 'Damaged' || reason === 'Defaced') && !oldCardAck.checked) return 'Please confirm that you can submit the old damaged / defaced card.';
    return '';
  }

  function clearError() {
    const box = $('#formError');
    box.textContent = '';
    box.classList.remove('visible');
  }

  function showError(message) {
    const box = $('#formError');
    box.textContent = message;
    box.classList.add('visible');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    if (!form.reportValidity()) return;
    const reason = getSelectedReason();
    const documentError = validateDocuments(reason);
    if (documentError) {
      showError(documentError);
      return;
    }

    const previousId = application?.id;
    application = {
      id: makeApplicationId(),
      roll: $('#roll').value.trim(),
      fullName: $('#fullName').value.trim(),
      branch: $('#branch').value,
      blood: $('#blood').value,
      reason,
      speed: getSelectedSpeed(),
      fee: FEES[getSelectedSpeed()],
      policeAck: reason === 'Lost' ? policeAck.checked : false,
      oldCardAck: reason !== 'Lost' ? oldCardAck.checked : false,
      stage: 0,
      createdAt: new Date().toISOString()
    };
    saveApplication();
    updateDashboard();
    showToast(previousId ? 'A new demo application has replaced the previous one.' : 'Application submitted. Your tracking ID is ready.');
    $('#tracking').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Listen for radio changes and card clicks so the entire option is selectable.
  speedInputs.forEach((input) => {
    input.addEventListener('change', updateFeeSummary);
  });
  document.querySelectorAll('.fee-option').forEach((option) => {
    option.addEventListener('click', () => {
      const radio = option.querySelector('input[name="speed"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        updateFeeSummary();
      }
    });
  });
  reasonInputs.forEach((input) => input.addEventListener('change', updateDocumentRequirements));

  $('#advanceStatus').addEventListener('click', () => {
    if (!application || application.stage >= STAGES.length - 1) return;
    application.stage += 1;
    application.updatedAt = new Date().toISOString();
    saveApplication();
    updateDashboard();
    showToast(`Demo status updated: ${STAGES[application.stage].title}.`);
  });

  $('#resetDemo').addEventListener('click', () => {
    application = null;
    saveApplication();
    updateDashboard();
    form.reset();
    clearError();
    updateFeeSummary();
    updateDocumentRequirements();
    showToast('Demo application cleared from this browser.');
    $('#application').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const dialog = $('#howDialog');
  $('#howItWorks').addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const sidebar = $('#sidebar');
  const menuToggle = $('#menuToggle');
  menuToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-link, .sidebar a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Restore a saved application in this browser after refresh.
  if (application && typeof application.stage !== 'number') application = null;
  updateFeeSummary();
  updateDocumentRequirements();
  updateDashboard();
})();
