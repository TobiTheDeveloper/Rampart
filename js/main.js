(function () {
  'use strict';

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const quoteForm = document.getElementById('quote-form');
  const formSuccess = document.getElementById('form-success');
  const yearEl = document.getElementById('year');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Page load animations */
  window.addEventListener('load', function () {
    document.body.classList.add('loaded');
    initCounter();
  });

  /* Header scroll state */
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNav();
    updateParallax();
    updateProcessLine();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Parallax backgrounds */
  const parallaxSections = document.querySelectorAll('[data-parallax]');

  function updateParallax() {
    if (prefersReducedMotion) return;

    parallaxSections.forEach(function (section) {
      const rate = parseFloat(section.getAttribute('data-parallax')) || 0.2;
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewportH) return;

      const offset = (rect.top + rect.height * 0.5 - viewportH * 0.5) * rate;
      const media = section.querySelector('.section-bg-media');
      if (media) {
        media.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      }
    });
  }

  /* Process line progress */
  const processSteps = document.querySelector('.process-steps');

  function updateProcessLine() {
    if (!processSteps || prefersReducedMotion) return;

    const rect = processSteps.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const start = viewportH * 0.85;
    const end = viewportH * 0.35;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));

    processSteps.classList.add('line-animate');
    processSteps.style.setProperty('--line-progress', (progress * 100) + '%');
  }

  /* Stat counter */
  let counterStarted = false;

  function initCounter() {
    if (counterStarted || prefersReducedMotion) return;

    const statEl = document.querySelector('[data-count]');
    if (!statEl) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counterStarted = true;
          observer.disconnect();
          animateCounter(statEl);
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(statEl);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    el.classList.add('counting');

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.remove('counting');
      }
    }

    requestAnimationFrame(tick);
  }

  /* Mobile navigation */
  function closeNav() {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  function openNav() {
    nav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  navToggle.addEventListener('click', function () {
    const isOpen = nav.classList.contains('open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
    }
  });

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + header.offsetHeight + 80;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* Smooth anchor scrolling with offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: 'smooth' });
      history.pushState(null, '', targetId);
    });
  });

  /* Scroll reveal with stagger */
  const staggerSelectors = '.service-card, .why-card, .process-step, .industry-card, .visual-card';
  const staggerEls = document.querySelectorAll(staggerSelectors);
  const revealEls = document.querySelectorAll('.section-header');

  staggerEls.forEach(function (el) {
    el.classList.add('stagger-item');
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(function (child) {
        return child.matches(staggerSelectors);
      });
      const i = siblings.indexOf(el);
      if (i >= 0) {
        el.style.setProperty('--i', i);
      }
    }
  });

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
  });

  const animatedEls = document.querySelectorAll(staggerSelectors + ', .section-header');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedEls.forEach(function (el) {
      el.classList.add('visible');
    });

    const statEl = document.querySelector('[data-count]');
    if (statEl && !counterStarted) {
      const target = statEl.getAttribute('data-count');
      const suffix = statEl.getAttribute('data-suffix') || '';
      statEl.textContent = target + suffix;
    }
  }

  /* Form validation & submit */
  function validateField(field) {
    const value = field.value.trim();
    let valid = true;

    if (field.hasAttribute('required') && !value) {
      valid = false;
    }

    if (field.type === 'email' && value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (field.type === 'tel' && value) {
      valid = value.replace(/\D/g, '').length >= 10;
    }

    field.classList.toggle('error', !valid);
    return valid;
  }

  if (quoteForm) {
    const requiredFields = quoteForm.querySelectorAll('[required]');

    requiredFields.forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        const firstError = quoteForm.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
        return;
      }

      const formData = new FormData(quoteForm);
      const data = Object.fromEntries(formData.entries());

      console.info('Quote request:', data);

      quoteForm.querySelectorAll('input, select, textarea, button').forEach(function (el) {
        el.disabled = true;
      });

      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
})();
