const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const year = document.getElementById('year');
const contactForm = document.querySelector('.contact-form');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  });
}

const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--pointer-x', `${x}%`);
    hero.style.setProperty('--pointer-y', `${y}%`);
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const emailAddress = 'hababupapastathopolos@gmail.com';

const buildInquiry = (formData) => {
  return [
    `Safari inquiry from ${formData.get('name') || 'A traveler'}`,
    `Email: ${formData.get('email') || 'Not provided'}`,
    `Trip details: ${formData.get('message') || 'No details provided'}`,
  ].join('\n');
};

const openEmailClient = (formData) => {
  const subject = encodeURIComponent(`Safari inquiry from ${formData.get('name') || 'A traveler'}`);
  const body = encodeURIComponent(buildInquiry(formData));
  window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
};

const openWhatsApp = (formData) => {
  const inquiry = buildInquiry(formData);
  const whatsappUrl = new URL('https://wa.me/256757189850');
  whatsappUrl.searchParams.set('text', inquiry);
  window.open(whatsappUrl.href, '_blank', 'noopener');
};

if (contactForm) {
  const whatsappButton = contactForm.querySelector('[data-mode="whatsapp"]');
  const formNote = contactForm.querySelector('.form-note');

  const setFormNote = (message, isError = false) => {
    if (!formNote) {
      return;
    }

    formNote.textContent = message;
    formNote.style.color = isError ? '#f5c7c7' : '#dfe8d6';
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      setFormNote('Please complete all fields before sending your inquiry.', true);
      return;
    }

    const formData = Object.fromEntries(new FormData(contactForm).entries());

    try {
      setFormNote('Sending your inquiry...');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send your inquiry right now.');
      }

      setFormNote(result.message || 'Your inquiry was received.');
      contactForm.reset();
    } catch (error) {
      setFormNote(error.message || 'Something went wrong. Please try again.', true);
    }
  });

  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      if (!contactForm.reportValidity()) {
        setFormNote('Please complete all fields before continuing on WhatsApp.', true);
        return;
      }

      const formData = new FormData(contactForm);
      openWhatsApp(formData);
    });
  }
}
