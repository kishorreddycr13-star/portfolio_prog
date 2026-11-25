/* ================================================================
   contact.js  |  Form Validation & Submission Feedback
   ================================================================ */
'use strict';

(function initContact() {
  const form   = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#f-name'),    err: form.querySelector('#err-name'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).' },
    email:   { el: form.querySelector('#f-email'),   err: form.querySelector('#err-email'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
    message: { el: form.querySelector('#f-message'), err: form.querySelector('#err-message'), validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
  };

  const statusBox = form.querySelector('#form-status');
  const submitBtn = form.querySelector('#form-submit');

  /* ---- validate single field ---- */
  function validateField(key) {
    const { el, err, validate } = fields[key];
    const msg = validate(el.value);
    err.textContent = msg;
    err.classList.toggle('show', !!msg);
    el.classList.toggle('error', !!msg);
    return !msg;
  }

  /* ---- live validation on blur ---- */
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(key);
    });
  });

  /* ---- show status ---- */
  function showStatus(type, icon, text) {
    statusBox.className = `form-status show ${type}`;
    statusBox.innerHTML = `<span aria-hidden="true">${icon}</span> ${text}`;
    statusBox.setAttribute('role', 'alert');
  }

  function hideStatus() {
    statusBox.className = 'form-status';
    statusBox.textContent = '';
    statusBox.removeAttribute('role');
  }

  /* ---- submit ---- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideStatus();

    const allValid = Object.keys(fields).map(validateField).every(Boolean);
    if (!allValid) {
      // Focus first error field
      const firstErrKey = Object.keys(fields).find(k => fields[k].el.classList.contains('error'));
      if (firstErrKey) fields[firstErrKey].el.focus();
      return;
    }

    /* ---- Simulate send (no backend configured) ----
       Replace this block with your real API call (e.g., Formspree, EmailJS,
       your own endpoint) when ready. Remove the warning notice from the HTML too.
    ---------------------------------------------------------------- */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1200)); // simulate network delay

    showStatus(
      'warning', '⚠️',
      '<strong>Demo mode:</strong> No backend is configured yet. ' +
      'Your message was <em>not</em> actually sent. ' +
      'Connect a service like Formspree or EmailJS to enable real submissions.'
    );

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    /* ---- End simulation block ---- */
  });

})();
