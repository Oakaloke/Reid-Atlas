/* ============================================
   Reid Atlas — script.js
   ============================================ */

// ---- Navigation: scroll state + mobile toggle ----

const nav        = document.getElementById('nav');
const navToggle  = document.getElementById('navToggle');
const navMobile  = document.getElementById('navMobile');
const mobileLinks = document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta');

let lastY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 20);
  lastY = y;
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navMobile.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close mobile nav on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMobile.classList.contains('open')) {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ---- Smooth scroll for all anchor links ----

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---- Scroll reveal (Intersection Observer) ----

const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ---- Stats counter animation ----

const statNumbers = document.querySelectorAll('.stat-number[data-target]');

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
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

statNumbers.forEach(el => statsObserver.observe(el));

// ---- Hero orb parallax (mouse move) ----

const orbs = document.querySelectorAll('.orb');
let mouseX = 0, mouseY = 0;
let rafActive = false;

document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

  if (!rafActive) {
    rafActive = true;
    requestAnimationFrame(moveOrbs);
  }
}, { passive: true });

function moveOrbs() {
  orbs.forEach((orb, i) => {
    const depth = (i + 1) * 14;
    const x = mouseX * depth;
    const y = mouseY * depth;
    orb.style.setProperty('--px', `${x}px`);
    orb.style.setProperty('--py', `${y}px`);
  });
  rafActive = false;
}

// Apply CSS variable-based transform on top of the keyframe animation
// by compositing translate with a wrapper — done via CSS custom props
// We achieve this with a subtle additional translate instead
orbs.forEach(orb => {
  orb.style.willChange = 'transform';
});

// Simplified: just nudge transform directly with a small multiplier
document.addEventListener('mousemove', e => {
  const cx = (e.clientX / window.innerWidth  - 0.5);
  const cy = (e.clientY / window.innerHeight - 0.5);
  orbs.forEach((orb, i) => {
    const d = (i + 1) * 18;
    orb.style.marginLeft = `${cx * d}px`;
    orb.style.marginTop  = `${cy * d}px`;
  });
}, { passive: true });

// ---- Contact form ----

const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
const formSuccess = document.getElementById('formSuccess');

function validateField(input) {
  if (input.required && !input.value.trim()) {
    input.classList.add('error');
    return false;
  }
  if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    input.classList.add('error');
    return false;
  }
  input.classList.remove('error');
  return true;
}

// Live validation on blur
form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) validateField(el);
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  // Validate required fields
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(el => { if (!validateField(el)) valid = false; });
  if (!valid) return;

  // Loading state
  submitBtn.disabled = true;
  btnText.hidden = true;
  btnSpinner.hidden = false;

  // Simulate a short async delay (replace with real fetch() when backend ready)
  await new Promise(r => setTimeout(r, 1200));

  // Show success
  submitBtn.hidden = true;
  formSuccess.hidden = false;
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.disabled = true;
  });
});

// ---- Active nav link highlighting ----

const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.style.color = isActive
          ? 'var(--text-1)'
          : '';
      });
    }
  });
}, {
  rootMargin: `-${60}px 0px -60% 0px`,
  threshold: 0
});

sections.forEach(s => sectionObserver.observe(s));

// ---- Reduced motion: disable all animations ----

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition', '0s');
  document.documentElement.style.setProperty('--transition-slow', '0s');
  orbs.forEach(o => o.style.animation = 'none');
}
