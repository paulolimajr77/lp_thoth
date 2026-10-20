const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav?.classList.toggle('is-open', !isOpen);
  document.body.style.overflow = !isOpen ? 'hidden' : '';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => observer.observe(item));
}

const motionGroups = document.querySelectorAll(
  '.leak-list, .flow-rail, .outcome-grid, .comparison-cards, .fit-list, .implementation-steps, .plans-grid, .faq-list'
);

motionGroups.forEach((group) => {
  group.classList.add('motion-group');
  [...group.children].forEach((item, index) => {
    item.classList.add('motion-item');
    item.style.setProperty('--motion-index', index);
  });
});

if (reducedMotion || !('IntersectionObserver' in window)) {
  motionGroups.forEach((group) => group.classList.add('is-motion-visible'));
} else {
  const motionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-motion-visible');
      window.setTimeout(() => entry.target.classList.add('motion-settled'), 1100);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });

  motionGroups.forEach((group) => motionObserver.observe(group));
}

const faqItems = [...document.querySelectorAll('.faq-list details')];
const faqAnimate = (item, opening) => {
  const summary = item.querySelector('summary');
  const closed = summary.offsetHeight;
  if (item._faqAnim) item._faqAnim.cancel();
  const from = item.offsetHeight;
  if (opening) item.open = true;
  const to = opening ? closed + item.querySelector('p').offsetHeight + parseFloat(getComputedStyle(item.querySelector('p')).marginBottom) : closed;
  item.classList.toggle('is-opening', opening);
  if (reducedMotion) { item.open = opening; item.classList.remove('is-opening'); return; }
  item.style.overflow = 'hidden';
  item._faqAnim = item.animate({ height: [from + 'px', to + 'px'] }, { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
  item._faqAnim.onfinish = () => {
    item._faqAnim = null;
    item.open = opening;
    item.style.height = item.style.overflow = '';
    item.classList.remove('is-opening');
  };
  item._faqAnim.oncancel = () => { item._faqAnim = null; };
};
faqItems.forEach((item) => {
  item.querySelector('summary').addEventListener('click', (event) => {
    event.preventDefault();
    if (item.open && !item.classList.contains('is-opening')) { faqAnimate(item, false); return; }
    faqItems.forEach((other) => { if (other !== item && other.open) faqAnimate(other, false); });
    faqAnimate(item, true);
  });
});

const opportunityLane = document.querySelector('.opportunity-lane');
const opportunitySteps = [...document.querySelectorAll('.opportunity-lane li')];

if (opportunityLane && opportunitySteps.length && !reducedMotion) {
  const originalLabels = opportunitySteps.map((step) => step.querySelector('span')?.textContent || '');
  let currentStep = 0;

  const playOpportunityFlow = () => {
    opportunityLane.classList.toggle('is-finished', currentStep === opportunitySteps.length - 1);
    opportunitySteps.forEach((step, index) => {
      const marker = step.querySelector('span');
      const completed = index < currentStep;
      step.classList.toggle('is-complete', completed);
      step.classList.toggle('is-active', index === currentStep);
      if (marker) marker.textContent = completed ? '✓' : originalLabels[index];
    });

    const finalStep = currentStep === opportunitySteps.length - 1;
    window.setTimeout(() => {
      if (finalStep) {
        opportunitySteps.forEach((step, index) => {
          step.classList.add('is-complete');
          step.classList.remove('is-active');
          const marker = step.querySelector('span');
          if (marker) marker.textContent = '✓';
        });
        window.setTimeout(() => {
          opportunityLane.classList.remove('is-finished');
          currentStep = 0;
          playOpportunityFlow();
        }, 1800);
      } else {
        currentStep += 1;
        playOpportunityFlow();
      }
    }, finalStep ? 1200 : 1100);
  };

  window.setTimeout(playOpportunityFlow, 700);
}

const yearEl = document.querySelector('[data-year]'); if (yearEl) yearEl.textContent = new Date().getFullYear();

const guideDialog = document.getElementById('guideDialog');
if (guideDialog && typeof guideDialog.showModal === 'function') {
  document.querySelectorAll('[data-guide-open]').forEach((btn) => btn.addEventListener('click', () => guideDialog.showModal()));
  guideDialog.addEventListener('click', (event) => {
    if (event.target === guideDialog || event.target.closest('[data-guide-close]')) guideDialog.close();
  });
}

const zoomDialog = document.getElementById('zoomDialog');
if (zoomDialog && typeof zoomDialog.showModal === 'function') {
  const zoomImg = document.getElementById('zoomImg');
  const zoomCaption = document.getElementById('zoomCaption');
  const openZoom = (img) => {
    zoomImg.src = img.dataset.zoom;
    zoomImg.alt = img.alt;
    zoomCaption.textContent = img.alt;
    zoomDialog.showModal();
    zoomDialog.querySelector('.zoom-scroll').scrollTop = 0;
  };
  document.querySelectorAll('img[data-zoom]').forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Ampliar imagem: ' + img.alt);
    img.addEventListener('click', () => openZoom(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openZoom(img); }
    });
  });
  zoomDialog.addEventListener('click', (event) => {
    if (event.target === zoomDialog || event.target.closest('[data-zoom-close]')) zoomDialog.close();
  });
  zoomDialog.addEventListener('close', () => { zoomImg.removeAttribute('src'); });
}

const demoVideo = document.getElementById('demoVideo');
const videoSound = document.getElementById('videoSound');
if (demoVideo && videoSound) {
  const canAuto = window.matchMedia('(min-width: 821px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userTookOver = false;
  if (canAuto && 'IntersectionObserver' in window) {
    demoVideo.preload = 'auto';
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (userTookOver) return;
        if (entry.isIntersecting) { demoVideo.play().catch(() => {}); } else { demoVideo.pause(); }
      });
    }, { threshold: 0.6 }).observe(demoVideo);
    videoSound.hidden = false;
  }
  videoSound.addEventListener('click', () => {
    userTookOver = true;
    demoVideo.muted = false;
    demoVideo.currentTime = 0;
    demoVideo.play().catch(() => {});
    videoSound.hidden = true;
  });
  demoVideo.addEventListener('volumechange', () => { if (!demoVideo.muted) videoSound.hidden = true; });
  demoVideo.addEventListener('play', () => { if (!canAuto) videoSound.hidden = true; });
}


/* menu de funcoes */
document.querySelectorAll('[data-drop]').forEach((drop) => {
  const btn = drop.querySelector('[data-drop-btn]');
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = drop.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('click', (event) => {
  document.querySelectorAll('[data-drop].is-open').forEach((drop) => {
    if (!drop.contains(event.target)) { drop.classList.remove('is-open'); drop.querySelector('[data-drop-btn]').setAttribute('aria-expanded', 'false'); }
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('[data-drop].is-open').forEach((drop) => drop.classList.remove('is-open'));
});

/* animacoes SVG: so rodam quando estao na tela */
const stages = document.querySelectorAll('[data-stage]');
if ('IntersectionObserver' in window) {
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-live', entry.isIntersecting));
  }, { threshold: 0.15 });
  stages.forEach((stage) => stageObserver.observe(stage));
} else {
  stages.forEach((stage) => stage.classList.add('is-live'));
}

/* video: ampliar */
const videoFrameEl = document.getElementById('videoFrame');
const videoEnlarge = document.getElementById('videoEnlarge');
if (videoFrameEl && videoEnlarge) {
  const setBig = (big) => {
    videoFrameEl.classList.toggle('is-big', big);
    document.body.classList.toggle('has-big-video', big);
    videoEnlarge.innerHTML = big ? '<span aria-hidden="true">✕</span> Fechar' : '<span aria-hidden="true">⤢</span> Ampliar';
    videoEnlarge.setAttribute('aria-label', big ? 'Fechar o vídeo ampliado' : 'Ampliar o vídeo');
  };
  videoEnlarge.addEventListener('click', () => setBig(!videoFrameEl.classList.contains('is-big')));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && videoFrameEl.classList.contains('is-big')) setBig(false); });
}
