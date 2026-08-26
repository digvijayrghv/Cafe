/* =========================================================
   BREW & BEAN — SHARED SITE SCRIPT
   One script for index.html, menu.html, about.html,
   gallery.html and contact.html.

   Every init function checks whether its target elements exist
   before doing anything, so this file is safe to load on every
   page even though not every page has every feature.

   Table of contents:
   1. Mobile navigation
   2. Scroll-reveal animation
   3. Gallery filtering
   4. Gallery lightbox
   5. Contact form validation
   6. Init
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();
  initGalleryFilters();
  initLightbox();
  initContactForm();
});


/* =========================================================
   1. Mobile Navigation
   ========================================================= */
function initMobileNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!header || !toggle || !navLinks) return;

  const openMenu = () => {
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const isOpen = () => header.classList.contains('is-open');

  // Toggle the menu when the hamburger button is clicked.
  toggle.addEventListener('click', () => {
    isOpen() ? closeMenu() : openMenu();
  });

  // Close the menu whenever a navigation link is clicked,
  // so the mobile menu never lingers over the next page/section.
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Keyboard accessibility: close the menu with Escape and
  // return focus to the toggle button so keyboard users aren't lost.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close the menu if the user clicks/taps outside of it.
  document.addEventListener('click', (event) => {
    if (!isOpen()) return;
    const clickedInsideHeader = header.contains(event.target);
    if (!clickedInsideHeader) closeMenu();
  });

  // If the viewport is resized up to desktop width while the
  // mobile menu is open, reset it so desktop nav isn't affected.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && isOpen()) closeMenu();
  });
}


/* =========================================================
   2. Scroll-Reveal Animation
   Elements with the ".reveal" class (and the pour-divider)
   fade/slide into place the first time they enter the viewport.
   ========================================================= */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll('.reveal, .pour-divider');
  if (!revealTargets.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback for very old browsers: just show everything.
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}


/* =========================================================
   3. Gallery Filtering (gallery.html)
   Uses the existing data-filter buttons and data-category
   gallery items already present in the markup.
   ========================================================= */
function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterButtons.length || !galleryItems.length) return;

  const applyFilter = (filterValue) => {
    galleryItems.forEach((item) => {
      const matches = filterValue === 'all' || item.dataset.category === filterValue;
      item.classList.toggle('is-hidden', !matches);
    });
  };

  filterButtons.forEach((button) => {
    // Reflect the current active state for assistive tech.
    button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');

    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      applyFilter(button.dataset.filter);
    });
  });
}


/* =========================================================
   4. Gallery Lightbox (gallery.html)
   Builds a single lightbox overlay and reuses it for whichever
   image was clicked. Gallery items are made keyboard-accessible
   here (tabindex/role/aria-label) since <figure> isn't natively
   interactive, without needing to edit the HTML files.
   ========================================================= */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  // Build the lightbox markup once and attach it to the page.
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');

  overlay.innerHTML = `
    <div class="lightbox-content">
      <button type="button" class="lightbox-close" aria-label="Close image viewer">&times;</button>
      <img class="lightbox-image" src="" alt="">
      <p class="lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  const lightboxImage = overlay.querySelector('.lightbox-image');
  const lightboxCaption = overlay.querySelector('.lightbox-caption');
  const closeButton = overlay.querySelector('.lightbox-close');

  let lastFocusedElement = null;

  const openLightbox = (item) => {
    const image = item.querySelector('img');
    if (!image) return;

    const captionEl = item.querySelector('.gallery-caption');

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    lightboxCaption.textContent = captionEl ? captionEl.textContent.trim() : '';

    lastFocusedElement = document.activeElement;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    closeButton.focus();
  };

  const closeLightbox = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  galleryItems.forEach((item) => {
    // Make each gallery item behave like a button for keyboard users.
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const captionEl = item.querySelector('.gallery-caption');
    const label = captionEl ? captionEl.textContent.trim() : 'View larger image';
    item.setAttribute('aria-label', `View larger image: ${label}`);

    item.addEventListener('click', () => openLightbox(item));

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  // Close via the visible close button.
  closeButton.addEventListener('click', closeLightbox);

  // Close by clicking anywhere outside the image/caption.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeLightbox();
  });

  // Close with the Escape key.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}


/* =========================================================
   5. Contact Form Validation (contact.html)
   Client-side only: nothing is sent, stored, or transmitted.
   The form is reset immediately after a successful "submit".
   ========================================================= */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const messageField = form.querySelector('#message');

  // Fields this form actually requires. Subject stays optional.
  const requiredFields = [nameField, emailField, messageField].filter(Boolean);
  if (!requiredFields.length) return;

  // A single, reusable success message region.
  let successBox = form.querySelector('.form-success');
  if (!successBox) {
    successBox = document.createElement('p');
    successBox.className = 'form-success';
    successBox.setAttribute('role', 'status');
    successBox.setAttribute('aria-live', 'polite');
    successBox.hidden = true;
    form.appendChild(successBox);
  }

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const setFieldError = (field, message) => {
    clearFieldError(field);

    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');

    const errorId = `${field.id}-error`;
    const errorEl = document.createElement('p');
    errorEl.className = 'field-error';
    errorEl.id = errorId;
    errorEl.textContent = message;

    field.setAttribute('aria-describedby', errorId);
    group.appendChild(errorEl);
  };

  const clearFieldError = (field) => {
    const group = field.closest('.form-group');
    if (!group) return;

    group.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    const existingError = group.querySelector('.field-error');
    if (existingError) existingError.remove();
  };

  const validateField = (field) => {
    const value = field.value.trim();

    if (field === nameField && !value) {
      setFieldError(field, 'Please enter your name.');
      return false;
    }

    if (field === emailField) {
      if (!value) {
        setFieldError(field, 'Please enter your email address.');
        return false;
      }
      if (!isValidEmail(value)) {
        setFieldError(field, 'Please enter a valid email address (e.g. name@example.com).');
        return false;
      }
    }

    if (field === messageField && !value) {
      setFieldError(field, 'Please enter a message.');
      return false;
    }

    clearFieldError(field);
    return true;
  };

  // Validate as the user leaves a field, and re-validate live
  // once an error has already been shown for that field.
  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successBox.hidden = true;

    const results = requiredFields.map(validateField);
    const isFormValid = results.every(Boolean);

    if (!isFormValid) {
      const firstInvalidField = requiredFields.find((field) => {
        const group = field.closest('.form-group');
        return group && group.classList.contains('has-error');
      });
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // Demo-only: nothing is sent anywhere. Reset immediately so
    // no user-entered data lingers in the form or in memory.
    form.reset();

    successBox.textContent =
      "Thanks! Your message has been received. This is a demo form, so no message was actually sent.";
    successBox.hidden = false;
  });
}
