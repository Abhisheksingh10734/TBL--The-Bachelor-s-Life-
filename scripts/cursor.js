(function () {
  'use strict';

  /* ── Build DOM elements ── */
  const ring = document.createElement('div');
  const dot = document.createElement('div');
  const label = document.createElement('div');

  ring.className = 'tbl-cursor-ring hidden';
  dot.className = 'tbl-cursor-dot hidden';
  label.className = 'tbl-cursor-label';

  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.body.appendChild(label);
  document.documentElement.classList.add('tbl-cursor-active');

  /* ── State ── */
  let mouseX = -200, mouseY = -200;   // real mouse position
  let ringX = -200, ringY = -200;   // lagged ring position
  let raf;

  /* ── GSAP-style lerp loop for the ring ── */
  const LERP = 0.14; // 0 = no lag, 1 = instant

  function loop() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;

    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    label.style.transform = `translate(${mouseX + 18}px, ${mouseY - 6}px)`;

    raf = requestAnimationFrame(loop);
  }

  let loopStarted = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    ring.classList.remove('hidden');
    dot.classList.remove('hidden');
    if (!loopStarted) {          // ← start loop only once, on first move
      loopStarted = true;
      ringX = mouseX;            // ← snap ring to cursor position immediately
      ringY = mouseY;            //    prevents it sliding in from (-200,-200)
      loop();
    }
  });

  /* ── Track mouse position ── */
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    ring.classList.remove('hidden');
    dot.classList.remove('hidden');
  });

  document.addEventListener('mouseleave', () => {
    ring.classList.add('hidden');
    dot.classList.add('hidden');
    label.classList.remove('visible');
  });

  document.addEventListener('mouseenter', () => {
    ring.classList.remove('hidden');
    dot.classList.remove('hidden');
  });

  /* ── Click flash ── */
  document.addEventListener('mousedown', () => {
    ring.classList.add('click');
    dot.classList.add('click');
  });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('click');
    dot.classList.remove('click');
  });

  /* ── Hover detection — what is the cursor over? ── */
  const HOVER_SELECTORS = [
    'a', 'button', '[onclick]', '.card', '.cat-pill',
    '.filter-tab', '.editorial-item', '.article-list-item',
    '.art-mini-item', '.search-result-item', '.value-card',
    '.spotlight-card', '.tbl-btn', '.page-btn:not(.disabled)',
    '.creator-contact-btn', '.social-btn', '.creator-social-btn',
    '.logo', '.back-btn', '.admin-link', '.logout-btn',
    '.footer-col a', '.hamburger'
  ].join(', ');

  const TEXT_SELECTORS = 'input, textarea, [contenteditable]';

  /* Map element → cursor label text */
  function getCursorLabel(el) {
    if (!el) return '';
    const tag = el.tagName.toLowerCase();
    const type = el.type ? el.type.toLowerCase() : '';

    if (el.matches('.card, .spotlight-card, .editorial-item, .art-mini-item'))
      return 'Read';
    if (el.matches('.cat-pill, .filter-tab'))
      return 'Browse';
    if (el.matches('.article-list-item'))
      return 'Open';
    if (el.matches('.search-result-item'))
      return 'View';
    if (el.matches('.page-btn'))
      return '';
    if (el.matches('.back-btn'))
      return 'Back';
    if (el.matches('.logo'))
      return 'Home';
    if (el.matches('#admin-nav-btn'))
      return el.textContent.trim();
    if (el.matches('.logout-btn'))
      return 'Logout';
    if (el.matches('.social-btn, .creator-social-btn'))
      return 'Follow';
    if (el.matches('.hamburger'))
      return 'Menu';
    if (tag === 'button' && el.textContent.includes('Search'))
      return 'Search';
    if (tag === 'button' && el.textContent.includes('Subscribe'))
      return 'Subscribe';

    return '';
  }

  let currentState = 'default';

  document.addEventListener('mouseover', e => {
    const el = e.target.closest(HOVER_SELECTORS);
    const tx = e.target.closest(TEXT_SELECTORS);

    if (tx) {
      // text cursor mode
      if (currentState !== 'text') {
        currentState = 'text';
        ring.classList.remove('hover', 'click');
        dot.classList.remove('hover', 'click');
        ring.classList.add('text');
        dot.classList.add('text');
        label.textContent = '';
        label.classList.remove('visible');
      }
    } else if (el) {
      // hover mode
      if (currentState !== 'hover') {
        currentState = 'hover';
        ring.classList.remove('text', 'click');
        dot.classList.remove('text', 'click');
        ring.classList.add('hover');
        dot.classList.add('hover');
      }
      const lbl = getCursorLabel(el);
      if (lbl) {
        label.textContent = lbl;
        label.classList.add('visible');
      } else {
        label.classList.remove('visible');
      }
    } else {
      // default mode
      if (currentState !== 'default') {
        currentState = 'default';
        ring.classList.remove('hover', 'text', 'click');
        dot.classList.remove('hover', 'text', 'click');
        label.classList.remove('visible');
      }
    }
  });

  /* ── Disable on touch devices ── */
  window.addEventListener('touchstart', () => {
    ring.style.display = 'none';
    dot.style.display = 'none';
    label.style.display = 'none';
    cancelAnimationFrame(raf);
  }, { once: true });

})();

