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

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    openEmailClient(formData);
  });

  if (whatsappButton) {
    whatsappButton.addEventListener('click', () => {
      if (!contactForm.reportValidity()) {
        return;
      }

      const formData = new FormData(contactForm);
      openWhatsApp(formData);
    });
  }
}
