(() => {
  const header = document.querySelector('.shell-header');
  if (!header) return;
  const menu = header.querySelector('.shell-menu-toggle');
  const nav = header.querySelector('.shell-navigation');
  const closeMenu = () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
  const syncHeader = () => {
    const compact = document.body.classList.contains('scrolled');
    document.body.classList.toggle('scrolled', window.scrollY > (compact ? 16 : 70));
  };
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });

  const existingContactTarget = document.querySelector('#contact');
  if (existingContactTarget && existingContactTarget.tagName.toLowerCase() !== 'dialog') {
    existingContactTarget.id = 'footer-contact';
  }

  if (!document.querySelector('.shell-contact-tab')) {
    const contactTab = document.createElement('button');
    contactTab.className = 'shell-contact-tab';
    contactTab.type = 'button';
    contactTab.setAttribute('data-contact-open', '');
    contactTab.setAttribute('aria-label', 'Contact XSEED Education');
    contactTab.innerHTML = '<span>Contact Us</span>';
    document.body.appendChild(contactTab);
  }

  if (!document.querySelector('.contact-modal')) {
    const contactDialog = document.createElement('dialog');
    contactDialog.className = 'contact-modal';
    contactDialog.id = 'contact';
    contactDialog.setAttribute('aria-labelledby', 'contact-title');
    contactDialog.innerHTML = `
      <div class="contact__content">
        <div class="contact__header">
          <h2 class="contact__title" id="contact-title">Contact Us</h2>
          <button class="contact__close" type="button" data-contact-close aria-label="Close contact form"></button>
        </div>
        <p class="contact__description">
          To know more, you may email us at <a href="mailto:contact@xseededucation.com">contact@xseededucation.com</a> or WhatsApp <a href="https://wa.me/6567320164">+65 6732 0164 (International)</a> or <a href="https://wa.me/919560300571">+91 95603 00571 (India)</a>. Or simply fill the form below.
        </p>

        <form class="contact__form">
          <div class="contact__grid">
            <label>
              <span>Name<span class="req" aria-hidden="true">*</span></span>
              <input name="name" type="text" autocomplete="name" placeholder="Enter your name" minlength="2" maxlength="100" required>
            </label>
            <label>
              <span>Mobile number<span class="req" aria-hidden="true">*</span></span>
              <span class="phone-field">
                <select name="country-code" aria-label="Country code">
                  <option value="+91" selected>+91</option>
                  <option value="+65">+65</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+971">+971</option>
                </select>
                <input name="mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="Mobile number" pattern="[0-9 ()-]{7,20}" title="Enter your mobile number" required>
              </span>
            </label>
            <label class="contact__email">
              <span>Email<span class="req" aria-hidden="true">*</span></span>
              <input name="email" type="email" autocomplete="email" placeholder="Enter your email" maxlength="254" required>
            </label>
            <label class="contact__interest">
              <span>Your interest</span>
              <textarea name="interest" placeholder="Tell us what you are interested in" maxlength="1000"></textarea>
            </label>
          </div>
          <button class="contact__submit" type="submit">Submit</button>
          <p class="contact__status" role="status" aria-live="polite" hidden></p>
        </form>
      </div>`;
    document.body.appendChild(contactDialog);
  }

  const loadPhoneLibrary = () => {
    if (window.libphonenumber || document.querySelector('script[data-libphonenumber-js]')) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.13.12/bundle/libphonenumber-max.js';
    script.defer = true;
    script.setAttribute('data-libphonenumber-js', '');
    document.head.appendChild(script);
  };

  const CONTACT_API_BASE =
    window.XSEED_CONTACT_API_BASE || 'https://showcase-api.xseededucation.com';
  const CONTACT_ENDPOINT = `${CONTACT_API_BASE}/api/v1/contact/submit`;
  const contactDialog = document.querySelector('#contact.contact-modal');
  const openContactButton = document.querySelector('[data-contact-open]');
  const closeContactButton = document.querySelector('[data-contact-close]');
  const contactForm = document.querySelector('.contact__form');
  const submitButton = contactForm.querySelector('.contact__submit');
  const statusEl = contactForm.querySelector('.contact__status');
  const nameInput = contactForm.elements.name;
  const mobileInput = contactForm.elements.mobile;
  const countryCodeSelect = contactForm.elements['country-code'];
  const emailInput = contactForm.elements.email;
  const interestInput = contactForm.elements.interest;

  const setStatus = (message, kind) => {
    statusEl.textContent = message || '';
    statusEl.hidden = !message;
    statusEl.classList.toggle('contact__status--error', kind === 'error');
    statusEl.classList.toggle('contact__status--success', kind === 'success');
  };

  const validateName = () => {
    const isTooShort = nameInput.value && nameInput.value.trim().length < 2;
    nameInput.setCustomValidity(isTooShort ? 'Enter at least 2 characters for your name.' : '');
  };

  const validateMobileNumber = () => {
    const localNumber = mobileInput.value.replace(/\D/g, '');

    if (!localNumber || !window.libphonenumber) {
      mobileInput.setCustomValidity('');
      return;
    }

    const phoneNumber = window.libphonenumber.parsePhoneNumberFromString(
      `${countryCodeSelect.value}${localNumber}`
    );
    const isValid = phoneNumber && phoneNumber.isValid();
    mobileInput.setCustomValidity(
      isValid ? '' : 'Enter a valid mobile number for the selected country code.'
    );
  };

  const validateEmail = () => {
    emailInput.setCustomValidity('');
    if (emailInput.value && emailInput.validity.typeMismatch) {
      emailInput.setCustomValidity('Enter a valid email address.');
    }
  };

  let contactScrollY = 0;
  const lockContactScroll = () => {
    contactScrollY = window.scrollY;
    document.documentElement.classList.add('contact-open');
    document.body.classList.add('contact-open');
    document.body.style.top = `-${contactScrollY}px`;
  };
  const unlockContactScroll = () => {
    document.documentElement.classList.remove('contact-open');
    document.body.classList.remove('contact-open');
    document.body.style.top = '';
    window.scrollTo(0, contactScrollY);
  };

  openContactButton.addEventListener('click', () => {
    loadPhoneLibrary();
    contactDialog.showModal();
    lockContactScroll();
  });
  closeContactButton.addEventListener('click', () => contactDialog.close());
  contactDialog.addEventListener('cancel', event => event.preventDefault());
  contactDialog.addEventListener('close', () => {
    unlockContactScroll();
  });

  const shakeDialog = () => {
    contactDialog.classList.remove('contact-modal--shake');
    void contactDialog.offsetWidth;
    contactDialog.classList.add('contact-modal--shake');
  };
  contactDialog.addEventListener('animationend', event => {
    if (event.animationName === 'contact-shake') {
      contactDialog.classList.remove('contact-modal--shake');
    }
  });
  contactDialog.addEventListener('click', event => {
    if (event.target === contactDialog) shakeDialog();
  });

  nameInput.addEventListener('input', validateName);
  mobileInput.addEventListener('input', validateMobileNumber);
  countryCodeSelect.addEventListener('change', validateMobileNumber);
  emailInput.addEventListener('input', validateEmail);

  let isSubmitting = false;
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();

    validateName();
    validateMobileNumber();
    validateEmail();

    if (isSubmitting) return;
    if (!contactForm.reportValidity()) return;

    const payload = {
      name: nameInput.value.trim(),
      country_code: countryCodeSelect.value,
      mobile: mobileInput.value.trim(),
      email: emailInput.value.trim(),
    };

    const interest = interestInput.value.trim();
    if (interest) payload.interest = interest;

    isSubmitting = true;
    submitButton.disabled = true;
    setStatus('Sending your message...', 'pending');

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Something went wrong. Please try again later.';
        try {
          const body = await response.json();
          if (body && body.message) message = body.message;
        } catch (_) {}
        throw new Error(message);
      }

      contactForm.reset();
      setStatus('Thanks - your message has been sent.', 'success');
      setTimeout(() => {
        contactDialog.close();
        setStatus('', null);
      }, 2000);
    } catch (error) {
      setStatus(
        error.message || 'Could not send your message. Please try again later.',
        'error'
      );
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });
})();
