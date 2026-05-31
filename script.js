/* ============================================
   Reid Atlas — script.js
   ============================================ */

// ---- Navigation: scroll state + mobile toggle ----

const nav        = document.getElementById('nav');
const navToggle  = document.getElementById('navToggle');
const navMobile  = document.getElementById('navMobile');
const mobileLinks = document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.classList.toggle('open');
  navMobile.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navMobile.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMobile.classList.contains('open')) {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
});

// ---- Smooth scroll for anchor links ----

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  });
});

// ---- Scroll reveal ----

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Stats counter animation ----

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => statsObserver.observe(el));

// ---- Active nav link highlighting ----

const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text-1)' : '';
      });
    }
  });
}, {
  rootMargin: `-${68}px 0px -60% 0px`,
  threshold: 0
});

sections.forEach(s => sectionObserver.observe(s));

// ---- Subtle hero parallax on mouse move ----

const heroGlow = document.querySelector('.hero-glow');
let lastX = 0, lastY = 0, rafActive = false;

document.addEventListener('mousemove', e => {
  lastX = (e.clientX / window.innerWidth  - 0.5);
  lastY = (e.clientY / window.innerHeight - 0.5);
  if (!rafActive && heroGlow) {
    rafActive = true;
    requestAnimationFrame(() => {
      heroGlow.style.transform = `translate(${lastX * 30}px, ${lastY * 20}px)`;
      rafActive = false;
    });
  }
}, { passive: true });

// ---- Contact form ----

const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = submitBtn?.querySelector('.btn-text');
const btnSpinner  = submitBtn?.querySelector('.btn-spinner');
const formSuccess = document.getElementById('formSuccess');

function validateField(input) {
  const empty   = input.required && !input.value.trim();
  const badEmail = input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  input.classList.toggle('error', empty || badEmail);
  return !empty && !badEmail;
}

if (form) {
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('blur',  () => validateField(el));
    el.addEventListener('input', () => { if (el.classList.contains('error')) validateField(el); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(el => { if (!validateField(el)) valid = false; });
    if (!valid) return;

    submitBtn.disabled = true;
    btnText.hidden    = true;
    btnSpinner.hidden = false;

    await new Promise(r => setTimeout(r, 1200));

    submitBtn.hidden   = true;
    formSuccess.hidden = false;
    form.querySelectorAll('input, textarea, select').forEach(el => { el.disabled = true; });
  });
}
