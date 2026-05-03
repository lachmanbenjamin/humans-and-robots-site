// ===== THEME TOGGLE =====
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = root.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

// ===== MOBILE NAV =====
(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const nav = document.getElementById('mobile-nav');
  const links = document.querySelectorAll('[data-mobile-link]');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.contains('is-open');
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';

    // Toggle hamburger to X
    toggle.innerHTML = isOpen
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>';
  });

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  });
})();

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== SCROLL REVEAL =====
// Content is visible by default. We only hide `.reveal` when the
// `js-reveal` class is on <html>, and we set that class here as
// progressive enhancement. If IO is unsupported, prefers-reduced-motion
// is on, or anything else goes wrong, we never hide the content.
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = typeof IntersectionObserver !== 'undefined';

  if (reduceMotion || !supportsIO) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // Mark anything already in the viewport as visible BEFORE we opt in
  // to the hidden-by-default state, so we never flash hidden content.
  var vh = window.innerHeight || document.documentElement.clientHeight;
  reveals.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) el.classList.add('is-visible');
  });

  // Opt in to the fade-in only after we know we'll drive it.
  document.documentElement.classList.add('js-reveal');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

  reveals.forEach(function (el) { observer.observe(el); });

  // Safety net: anything still hidden after 1.2s gets revealed. This
  // covers headless screenshot tools (which resize the viewport for
  // full-page capture without triggering scroll-driven IO promptly),
  // any IO regression, and unusual layout cases. Real users on a
  // normal scroll path will have hit each section via the IO long
  // before this fires.
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }, 1200);
})();

// ===== CONTACT FORM (Formspree) =====
(function () {
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var errorEl = document.getElementById('form-error');
  if (!form) return;

  // --- Inline validation ---
  function validateField(input) {
    var errorEl = document.getElementById(input.id + '-error');
    if (!errorEl) return true;
    var valid = true;
    var msg = '';

    if (input.required && !input.value.trim()) {
      valid = false;
      var label = input.closest('.form-group').querySelector('label').textContent;
      msg = 'Please enter your ' + label.toLowerCase();
    } else if (input.type === 'email' && input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      valid = false;
      msg = 'Please enter a valid email address';
    }

    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    errorEl.textContent = msg;
    errorEl.classList.toggle('is-visible', !valid);
    return valid;
  }

  // Validate on blur
  form.querySelectorAll('input[required], textarea[required], input[type="email"]').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate all fields
    var allValid = true;
    form.querySelectorAll('input:not([type="hidden"]):not([name="_gotcha"]), textarea').forEach(function (input) {
      if (!validateField(input)) allValid = false;
    });
    if (!allValid) return;

    var btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    // Hide any previous messages
    success.classList.remove('is-visible');
    if (errorEl) errorEl.classList.remove('is-visible');

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        btn.style.display = 'none';
        success.classList.add('is-visible');
        form.reset();
      } else {
        return response.json().then(function (json) {
          throw new Error(json.errors ? json.errors.map(function(e){ return e.message; }).join(', ') : 'Something went wrong.');
        });
      }
    }).catch(function (err) {
      btn.disabled = false;
      btn.textContent = 'Send Message';
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please email us directly at ben@humansnrobots.com';
        errorEl.classList.add('is-visible');
      }
    });
  });
})();

// ===== SIGNAL LIST / NEWSLETTER FORM (Formspree) =====
(function () {
  var form = document.getElementById('signal-form');
  if (!form) return;
  var success = document.getElementById('signal-success');
  var errorEl = document.getElementById('signal-error');
  var btn = form.querySelector('.signal-form__submit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (success) success.classList.remove('is-visible');
    if (errorEl) errorEl.classList.remove('is-visible');

    var email = form.querySelector('input[type="email"]');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.classList.add('is-visible');
      }
      email.focus();
      return;
    }

    var originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Joining…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        form.reset();
        btn.style.display = 'none';
        if (success) success.classList.add('is-visible');
      } else {
        return response.json().then(function (json) {
          throw new Error(json && json.errors ? json.errors.map(function(e){return e.message;}).join(', ') : 'Something went wrong.');
        });
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = originalLabel;
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please email ben@humansnrobots.com to subscribe.';
        errorEl.classList.add('is-visible');
      }
    });
  });
})();

// ===== MOBILE NAV FOCUS TRAP =====
(function () {
  var nav = document.getElementById('mobile-nav');
  var toggle = document.querySelector('[data-mobile-toggle]');
  if (!nav || !toggle) return;

  document.addEventListener('keydown', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      toggle.click();
      toggle.focus();
      return;
    }
    if (e.key !== 'Tab') return;

    var focusable = [toggle].concat(Array.from(nav.querySelectorAll('a, button')));
    focusable = focusable.filter(function (el) { return el.offsetParent !== null; });
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ===== HEADER SCROLL EFFECT =====
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var current = window.scrollY;
    if (current > 100) {
      header.style.boxShadow = 'var(--shadow-md)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastScroll = current;
  }, { passive: true });
})();
