(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* =========================================================
     CONFIG
  ========================================================= */

  const CONFIG = {
    transitionDuration: 0.38,
    trailThrottle: 16,
    glitchSpeed: 35,
    typewriterDelay: 1100,
    typewriterSpeed: 26,
  };

  /* =========================================================
     STATE
  ========================================================= */

  let isTransitioning = false;
  let trailActive = false;
  let lastTrailSpawn = 0;

  const originalNavigate = window.navigate;

  /* =========================================================
     OVERLAY
  ========================================================= */

  const overlay = document.createElement('div');

  overlay.id = 'tbl-page-overlay';

  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #e31c1c;
    clip-path: polygon(0 0,0 0,0 100%,0 100%);
    pointer-events: none;
  `;

  document.body.appendChild(overlay);

  /* =========================================================
     HELPERS
  ========================================================= */

  function q(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function safeGsapSet(targets, props) {
    if (!targets || !targets.length) return;
    gsap.set(targets, props);
  }

  function destroyScrollTriggers() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  /* =========================================================
     PAGE TRANSITION
  ========================================================= */

  function runPageTransition(callback) {
    if (isTransitioning) return;

    isTransitioning = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning = false;
      }
    });

    tl.to(overlay, {
      clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)',
      duration: CONFIG.transitionDuration,
      ease: 'power3.inOut'
    });

    tl.call(() => {
      if (typeof callback === 'function') {
        callback();
      }
    });

    tl.to(overlay, {
      clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)',
      duration: CONFIG.transitionDuration,
      ease: 'power3.inOut'
    });
  }

  window.navigate = function (page, e) {
    if (e) e.preventDefault();

    runPageTransition(() => {

      if (typeof originalNavigate === 'function') {
        originalNavigate(page);
      }

      if (page === 'home') {
        setTimeout(() => {
          animateHomeHero();
        }, 350);
      }
    });
  };

  /* =========================================================
     MAGNETIC BUTTONS
  ========================================================= */

  function initMagneticButtons() {

    const selectors = [
      '.hero-btn-primary',
      '.hero-btn-secondary',
      '.section-link-btn',
      '.pill-btn',
      '#admin-nav-btn',
      '.creator-contact-btn',
      '.spotlight-read-btn',
      '.login-btn',
      '#login-btn',
      '.logout-btn'
    ].join(',');

    qa(selectors).forEach(btn => {

      if (btn.dataset.magneticBound) return;

      btn.dataset.magneticBound = 'true';

      btn.style.willChange = 'transform';

      btn.addEventListener('mousemove', e => {

        const rect = btn.getBoundingClientRect();

        const x =
          ((e.clientX - rect.left) / rect.width - 0.5) * 18;

        const y =
          ((e.clientY - rect.top) / rect.height - 0.5) * 10;

        gsap.to(btn, {
          x,
          y,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
      });

      btn.addEventListener('mouseleave', () => {

        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          overwrite: true
        });

      });

    });

  }

  /* =========================================================
     SPLIT TEXT
  ========================================================= */

  function splitText(selector, delay = 0) {

    qa(selector).forEach(el => {

      if (!el.dataset.originalHtml) {
        el.dataset.originalHtml = el.innerHTML;
      }

      el.innerHTML = el.dataset.originalHtml;

      const html = el.innerHTML;

      const words = html.split(/(\s+)/);

      el.innerHTML = words.map(word => {

        if (!word.trim()) return word;

        return `
          <span class="tbl-word" style="display:inline-block;overflow:hidden;">
            <span class="tbl-word-inner" style="display:inline-block;">
              ${word}
            </span>
          </span>
        `;

      }).join('');

      const inners = qa('.tbl-word-inner', el);

      safeGsapSet(inners, {
        y: '110%',
        opacity: 0
      });

      gsap.to(inners, {
        y: '0%',
        opacity: 1,
        duration: 0.65,
        stagger: 0.07,
        delay,
        ease: 'power4.out'
      });

    });

  }

  /* =========================================================
     PARALLAX
  ========================================================= */

  function initParallax() {

    const items = [
      { selector: '.hero-img-back', speed: 0.25 },
      { selector: '.hero-img-front', speed: 0.12 },
      { selector: '.spotlight-img', speed: 0.15 }
    ];

    items.forEach(item => {

      const el = q(item.selector);

      if (!el) return;

      gsap.to(el, {
        y: () => window.innerHeight * item.speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

    });

  }

  /* =========================================================
     CARD TILT
  ========================================================= */

  function bindTilt(el) {

    if (!el || el.dataset.tiltBound) return;

    el.dataset.tiltBound = 'true';

    el.style.transformStyle = 'preserve-3d';
    el.style.perspective = '600px';
    el.style.willChange = 'transform';

    el.addEventListener('mousemove', e => {

      const rect = el.getBoundingClientRect();

      const xp =
        (e.clientX - rect.left) / rect.width - 0.5;

      const yp =
        (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(el, {
        rotateY: xp * 12,
        rotateX: -yp * 8,
        scale: 1.025,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      const thumb = el.querySelector(
        '.card-thumb, .editorial-thumb'
      );

      if (thumb) {

        gsap.to(thumb, {
          x: xp * 6,
          y: yp * 4,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });

      }

    });

    el.addEventListener('mouseleave', () => {

      gsap.to(el, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1,0.5)'
      });

      const thumb = el.querySelector(
        '.card-thumb, .editorial-thumb'
      );

      if (thumb) {

        gsap.to(thumb, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });

      }

    });

  }

  function initCardTilt() {

    qa('.card, .editorial-item')
      .forEach(bindTilt);

    document.addEventListener('mouseover', e => {

      const el = e.target.closest(
        '.card, .editorial-item'
      );

      if (el) bindTilt(el);

    });

  }

  /* =========================================================
     GLITCH TEXT
  ========================================================= */

  function glitchText(selector, iterations = 4) {

    const el = q(selector);

    if (!el) return;

    const original = el.innerText;

    const chars = 'X#@!%&01';

    let count = 0;

    const id = setInterval(() => {

      el.innerText = original
        .split('')
        .map((char, i) => {

          if (i < count) return char;

          return chars[
            Math.floor(Math.random() * chars.length)
          ];

        })
        .join('');

      count++;

      if (count > original.length) {

        el.innerText = original;

        clearInterval(id);

      }

    }, CONFIG.glitchSpeed);

  }

  /* =========================================================
     TICKER
  ========================================================= */

  function initTickerBar() {

    const bar = q('.stats-bar-inner');

    if (!bar) return;

    const wrapper = bar.parentElement;

    if (wrapper.querySelector('.ticker-clone')) return;

    const clone = bar.cloneNode(true);

    clone.classList.add('ticker-clone');

    clone.setAttribute('aria-hidden', 'true');

    wrapper.appendChild(clone);

    wrapper.style.overflow = 'hidden';
    wrapper.style.display = 'flex';
    wrapper.style.whiteSpace = 'nowrap';

    [bar, clone].forEach(el => {
      el.style.flexShrink = '0';
      el.style.minWidth = '100%';
    });

    const tween = gsap.to([bar, clone], {
      xPercent: -100,
      duration: 22,
      ease: 'none',
      repeat: -1,
      modifiers: {
        xPercent: gsap.utils.unitize(x =>
          parseFloat(x) % 100
        )
      }
    });

    wrapper.addEventListener('mouseenter', () => {
      tween.pause();
    });

    wrapper.addEventListener('mouseleave', () => {
      tween.resume();
    });

  }

  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  function initScrollProgress() {

    if (q('#scroll-progress-bar')) return;

    const bar = document.createElement('div');

    bar.id = 'scroll-progress-bar';

    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: #e31c1c;
      z-index: 99999;
      pointer-events: none;
    `;

    document.body.appendChild(bar);

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: 0.1,

      onUpdate(self) {
        bar.style.width =
          `${self.progress * 100}%`;
      }
    });

  }

  /* =========================================================
     TRAIL EFFECT
  ========================================================= */

  function initTrailEffect() {

    const hero = q('.home-hero');

    if (!hero) return;

    hero.addEventListener('mouseenter', () => {
      trailActive = true;
    });

    hero.addEventListener('mouseleave', () => {
      trailActive = false;
    });

    document.addEventListener('mousemove', e => {

      if (!trailActive) return;

      const now = Date.now();

      if (now - lastTrailSpawn < CONFIG.trailThrottle) {
        return;
      }

      lastTrailSpawn = now;

      const spark = document.createElement('span');

      const size = Math.random() * 6 + 3;

      spark.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: #e31c1c;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
      `;

      document.body.appendChild(spark);

      gsap.to(spark, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',

        onComplete() {
          spark.remove();
        }
      });

    });

  }

  /* =========================================================
     SCROLL REVEALS
  ========================================================= */

  function initScrollReveal() {

    qa('.section-eyebrow').forEach(el => {

      gsap.set(el, {
        opacity: 0,
        x: -20
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,

        onEnter() {

          gsap.to(el, {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out'
          });

        }
      });

    });

    qa('.section-title').forEach(el => {

      gsap.set(el, {
        opacity: 0,
        y: 24
      });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,

        onEnter() {

          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out'
          });

        }
      });

    });

  }

  /* =========================================================
     COUNTERS
  ========================================================= */

  function initCounters() {

    qa('.stat-value, .cstat-value').forEach(el => {

      const raw =
        el.textContent.replace(/[^0-9.]/g, '');

      if (!raw) return;

      const target = parseFloat(raw);

      const suffix =
        el.textContent.replace(/[0-9.]/g, '');

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,

        onEnter() {

          const obj = { n: 0 };

          gsap.to(obj, {

            n: target,
            duration: 1.8,
            ease: 'power2.out',

            onUpdate() {

              el.textContent =
                (
                  Number.isInteger(target)
                    ? Math.round(obj.n)
                    : obj.n.toFixed(1)
                ) + suffix;

            }

          });

        }

      });

    });

  }

  /* =========================================================
     FLOAT LOOP
  ========================================================= */

  function initFloatLoop() {

    const card = q('.spotlight-card');

    if (!card) return;

    gsap.to(card, {
      y: -6,
      duration: 2.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

  }

  /* =========================================================
     TYPEWRITER
  ========================================================= */

  function typewriter(selector) {

    const el = q(selector);

    if (!el) return;

    const text = el.textContent.trim();

    el.textContent = '';

    let i = 0;

    setTimeout(() => {

      const id = setInterval(() => {

        el.textContent += text[i];

        i++;

        if (i >= text.length) {
          clearInterval(id);
        }

      }, CONFIG.typewriterSpeed);

    }, CONFIG.typewriterDelay);

  }

  /* =========================================================
     HERO
  ========================================================= */

  function animateHomeHero() {

    splitText('#panel-home .hero-title', 0.5);

    typewriter('#panel-home .hero-sub');

    setTimeout(() => {
      glitchText('#panel-home .hero-label');
    }, 300);

  }

  /* =========================================================
     INIT
  ========================================================= */

  function init() {

    // destroyScrollTriggers();

    initMagneticButtons();

    initParallax();

    initCardTilt();

    initTickerBar();

    initScrollProgress();

    initTrailEffect();

    initScrollReveal();

    initCounters();

    initFloatLoop();

    animateHomeHero();

    ScrollTrigger.refresh();

  }

  window.addEventListener('load', () => {

    setTimeout(() => {
      init();
    }, 120);

  });

})();