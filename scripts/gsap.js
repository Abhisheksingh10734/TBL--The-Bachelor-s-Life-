/* ─────────────────────────────────────────────
   TBL — GSAP HOME PAGE ANIMATIONS
   Runs only when the home panel is visible.
   Re-triggers correctly when user navigates away and back.
───────────────────────────────────────────── */

gsap.registerPlugin(ScrollTrigger);

/* ── Utility: kill all ScrollTriggers tied to home ── */
function killHomeTriggers() {
  ScrollTrigger.getAll().forEach(t => {
    if (t.vars && t.vars._tblHome) t.kill();
  });
}

/* ── Main init — called from script.js initHome() ── */
function initGsapHome() {
  killHomeTriggers();

  // Give the DOM a tick to settle after panel switch
  requestAnimationFrame(() => {
    animHero();
    animStatsBar();
    animCatPills();
    animFeaturedCards();
    animSpotlight();
    animEditorial();
    animQuote();
    animNewsletter();
  });
}

/* ─────────────────────────────────────────────
   1. HERO — staggered text + image stack entrance
───────────────────────────────────────────── */
function animHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // reset
  gsap.set('.hero-label', { opacity: 0, y: 20 });
  gsap.set('.hero-title', { opacity: 0, y: 40 });
  gsap.set('.hero-sub', { opacity: 0, y: 30 });
  gsap.set('.hero-cta-row button', { opacity: 0, y: 20 });
  gsap.set('.hero-img-back', { opacity: 0, x: 40, rotation: 3 });
  gsap.set('.hero-img-front', { opacity: 0, x: -30, y: 30 });
  gsap.set('.hero-img-badge', { opacity: 0, scale: 0.6 });

  tl
    .to('.hero-label', { opacity: 1, y: 0, duration: 0.5 })
    .to('.hero-title', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-cta-row button', {
      opacity: 1, y: 0, duration: 0.5,
      stagger: 0.12
    }, '-=0.3')
    .to('.hero-img-back', {
      opacity: 1, x: 0, rotation: 0, duration: 0.9, ease: 'power2.out'
    }, '-=0.6')
    .to('.hero-img-front', {
      opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.out'
    }, '-=0.6')
    .to('.hero-img-badge', {
      opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)'
    }, '-=0.3');
}

/* ─────────────────────────────────────────────
   2. STATS BAR — count-up numbers + fade in
───────────────────────────────────────────── */
function animStatsBar() {
  gsap.set('.sbar-item', { opacity: 0, y: 20 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.stats-bar',
    start: 'top 88%',
    once: true,
    onEnter() {
      gsap.to('.sbar-item', {
        opacity: 1, y: 0, duration: 0.5,
        stagger: 0.1, ease: 'power2.out'
      });

      // count-up for each value
      document.querySelectorAll('.sbar-value').forEach(el => {
        const raw = el.textContent.replace(/[^0-9.]/g, '');
        const suffix = el.textContent.replace(/[0-9.]/g, '');
        if (!raw) return;
        const target = parseFloat(raw);
        gsap.fromTo({ val: 0 },
          { val: 0 },
          {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate() {
              const v = this.targets()[0].val;
              el.textContent = (Number.isInteger(target)
                ? Math.round(v) : v.toFixed(1)) + suffix;
            }
          }
        );
      });
    }
  });
}

/* ─────────────────────────────────────────────
   3. CATEGORY PILLS — fan-in from bottom
───────────────────────────────────────────── */
function animCatPills() {
  gsap.set('.cat-pill', { opacity: 0, y: 30, scale: 0.92 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.cat-pill-grid',
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to('.cat-pill', {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)'
      });
    }
  });
}

/* ─────────────────────────────────────────────
   4. FEATURED CARDS — rise up with stagger
───────────────────────────────────────────── */
function animFeaturedCards() {
  const cards = document.querySelectorAll('#home-cards .card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 50 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '#home-cards',
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.6,
        stagger: 0.12, ease: 'power3.out'
      });
    }
  });
}

/* ─────────────────────────────────────────────
   5. SPOTLIGHT CARD — slide in from left + image zoom
───────────────────────────────────────────── */
function animSpotlight() {
  gsap.set('.spotlight-card', { opacity: 0, x: -40 });
  gsap.set('.spotlight-img', { scale: 1.08 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.spotlight-card',
    start: 'top 82%',
    once: true,
    onEnter() {
      gsap.to('.spotlight-card', {
        opacity: 1, x: 0, duration: 0.8, ease: 'power3.out'
      });
      gsap.to('.spotlight-img', {
        scale: 1, duration: 1.2, ease: 'power2.out'
      });
      gsap.fromTo('.spotlight-badge',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo('.spotlight-body > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );
    }
  });
}

/* ─────────────────────────────────────────────
   6. EDITORIAL GRID — alternating left/right reveal
───────────────────────────────────────────── */
function animEditorial() {
  const items = document.querySelectorAll('.editorial-item');
  if (!items.length) return;

  items.forEach((item, i) => {
    gsap.set(item, { opacity: 0, x: i % 2 === 0 ? -25 : 25 });
  });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.editorial-grid',
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to('.editorial-item', {
        opacity: 1, x: 0, duration: 0.55,
        stagger: 0.07, ease: 'power2.out'
      });
    }
  });
}

/* ─────────────────────────────────────────────
   7. QUOTE BANNER — typewriter-style reveal
───────────────────────────────────────────── */
function animQuote() {
  gsap.set('.quote-banner', { opacity: 0, y: 30 });
  gsap.set('.quote-mark', { opacity: 0, scale: 1.5, transformOrigin: 'left center' });
  gsap.set('.quote-text', { opacity: 0, y: 15 });
  gsap.set('.quote-author', { opacity: 0 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.quote-banner',
    start: 'top 88%',
    once: true,
    onEnter() {
      const tl = gsap.timeline({ ease: 'power2.out' });
      tl.to('.quote-banner', { opacity: 1, y: 0, duration: 0.6 })
        .to('.quote-mark', { opacity: 0.5, scale: 1, duration: 0.5 }, '-=0.3')
        .to('.quote-text', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
        .to('.quote-author', { opacity: 1, duration: 0.4 }, '-=0.1');
    }
  });
}

/* ─────────────────────────────────────────────
   8. NEWSLETTER — split slide-in
───────────────────────────────────────────── */
function animNewsletter() {
  gsap.set('.inl-left', { opacity: 0, x: -30 });
  gsap.set('.inl-right', { opacity: 0, x: 30 });

  ScrollTrigger.create({
    _tblHome: true,
    trigger: '.inline-newsletter',
    start: 'top 88%',
    once: true,
    onEnter() {
      gsap.to('.inl-left', { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' });
      gsap.to('.inl-right', { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    }
  });
}

/* ─────────────────────────────────────────────
   Hover micro-animations (one-time binding)
───────────────────────────────────────────── */
function initHoverAnimations() {
  // Cat pills — lift on hover
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('mouseenter', () =>
      gsap.to(pill, { y: -5, duration: 0.25, ease: 'power2.out' }));
    pill.addEventListener('mouseleave', () =>
      gsap.to(pill, { y: 0, duration: 0.25, ease: 'power2.out' }));
  });

  // Cards — subtle lift
  document.addEventListener('mouseover', e => {
    const card = e.target.closest('.card');
    if (card && !card._gsapBound) {
      card._gsapBound = true;
      card.addEventListener('mouseenter', () =>
        gsap.to(card, { y: -4, duration: 0.2, ease: 'power2.out' }));
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' }));
    }
  });

  // Hero CTA buttons — scale pulse
  document.querySelectorAll('.hero-btn-primary, .hero-btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', () =>
      gsap.to(btn, { scale: 1.04, duration: 0.2, ease: 'power1.out' }));
    btn.addEventListener('mouseleave', () =>
      gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' }));
  });
}

/* ─────────────────────────────────────────────
   Boot — wait for script.js to finish loading
   then hook into initHome
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  // Patch initHome so GSAP runs after it populates the grid
  const _origInitHome = typeof initHome === 'function' ? initHome : null;

  window.initHome = function () {
    if (_origInitHome) _origInitHome();
    // small delay so buildCards/innerHTML finishes rendering
    setTimeout(initGsapHome, 60);
  };

  // Run immediately if home is already active (first load)
  const homePanel = document.getElementById('panel-home');
  if (homePanel && homePanel.classList.contains('active')) {
    setTimeout(initGsapHome, 120);
  }

  initHoverAnimations();
});

/* ─────────────────────────────────────────────
   NAV ENTRANCE — runs once on first page load
───────────────────────────────────────────── */
function animNavEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // starting states
  gsap.set('nav', { y: -80, opacity: 0 });
  gsap.set('.logo', { opacity: 0, x: -20 });
  gsap.set('#desktop-menu a', { opacity: 0, y: -12 });
  gsap.set('.search-wrap', { opacity: 0, scaleX: 0.7, transformOrigin: 'right center' });
  gsap.set('#admin-nav-btn', { opacity: 0, x: 16 });
  gsap.set('.hamburger', { opacity: 0, scale: 0.7 });

  tl
    .to('nav', { y: 0, opacity: 1, duration: 0.55 })
    .to('.logo', { opacity: 1, x: 0, duration: 0.45 }, '-=0.3')
    .to('#desktop-menu a', {
      opacity: 1, y: 0, duration: 0.4,
      stagger: 0.07
    }, '-=0.25')
    .to('.search-wrap', { opacity: 1, scaleX: 1, duration: 0.45, ease: 'back.out(1.3)' }, '-=0.25')
    .to('#admin-nav-btn', { opacity: 1, x: 0, duration: 0.35 }, '-=0.3')
    .to('.hamburger', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, '-=0.35');
}

/* ─────────────────────────────────────────────
   SCROLL BEHAVIOR
   Nav shrinks + gets a blur backdrop on scroll
───────────────────────────────────────────── */
function initNavScroll() {
  let hidden = false;

  ScrollTrigger.create({
    start: 1,
    end: 99999,
    onUpdate(self) {
      const scrollY = self.scroll();
      const dir = self.direction; // 1 = down, -1 = up

      // ── Compact mode: shrink nav height + add blur ──
      if (scrollY > 60) {
        gsap.to('nav', {
          boxShadow: '0 2px 24px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(12px)',
          duration: 0.3, overwrite: 'auto'
        });
        gsap.to('.nav-inner', {
          height: 52,
          duration: 0.35, ease: 'power2.out', overwrite: 'auto'
        });
        gsap.to('.logo-mark img, .logo-mark', {
          height: 32, duration: 0.35, overwrite: 'auto'
        });
      } else {
        gsap.to('nav', {
          boxShadow: 'none',
          backdropFilter: 'none',
          duration: 0.3, overwrite: 'auto'
        });
        gsap.to('.nav-inner', {
          height: 64,
          duration: 0.35, ease: 'power2.out', overwrite: 'auto'
        });
        gsap.to('.logo-mark img, .logo-mark', {
          height: 40, duration: 0.35, overwrite: 'auto'
        });
      }

      // ── Hide on scroll down, reveal on scroll up ──
      if (scrollY > 120) {
        if (dir === 1 && !hidden) {
          gsap.to('nav', { y: -90, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
          hidden = true;
        } else if (dir === -1 && hidden) {
          gsap.to('nav', { y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
          hidden = false;
        }
      }

      lastScroll = scrollY;
    }
  });
}

/* ─────────────────────────────────────────────
   ACTIVE LINK — ink-blot underline on click
───────────────────────────────────────────── */
function initNavLinkAnim() {
  document.querySelectorAll('#desktop-menu a[data-page]').forEach(link => {
    link.addEventListener('click', () => {
      // ripple the clicked link
      gsap.fromTo(link,
        { scale: 0.93 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    });

    // hover: subtle lift
    link.addEventListener('mouseenter', () => {
      gsap.to(link, { y: -2, duration: 0.18, ease: 'power2.out' });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { y: 0, duration: 0.18, ease: 'power2.out' });
    });
  });
}

/* ─────────────────────────────────────────────
   SEARCH — expand animation on focus
───────────────────────────────────────────── */
function initSearchAnim() {
  const input = document.getElementById('desktop-search');
  const wrap  = document.querySelector('.search-wrap');
  if (!input || !wrap) return;

  // Capture the natural width once
  const baseWidth = wrap.getBoundingClientRect().width || 230;

  input.addEventListener('focus', () => {
    gsap.to(wrap, { width: baseWidth + 24, duration: 0.3, ease: 'power2.out' });
  });
  input.addEventListener('blur', () => {
    gsap.to(wrap, { width: baseWidth, duration: 0.25, ease: 'power2.in' });
  });
}

/* ─────────────────────────────────────────────
   ADMIN BUTTON — pulse on hover
───────────────────────────────────────────── */
function initAdminBtnAnim() {
  const btn = document.getElementById('admin-nav-btn');
  if (!btn) return;

  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, { scale: 1.06, duration: 0.2, ease: 'power1.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' });
  });
  btn.addEventListener('mousedown', () => {
    gsap.to(btn, { scale: 0.95, duration: 0.1 });
  });
  btn.addEventListener('mouseup', () => {
    gsap.to(btn, { scale: 1.04, duration: 0.15, ease: 'back.out(2)' });
  });
}

/* ─────────────────────────────────────────────
   HAMBURGER — morph animation on open/close
───────────────────────────────────────────── */
function initHamburgerAnim() {
  const btn = document.getElementById('hamburger');
  if (!btn) return;

  // Bounce the whole button when tapped
  btn.addEventListener('click', () => {
    gsap.fromTo(btn,
      { scale: 0.85, rotation: -8 },
      { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' }
    );
  });
}

/* ─────────────────────────────────────────────
   MOBILE MENU — smooth slide down with stagger
───────────────────────────────────────────── */
function initMobileMenuAnim() {
  // Patch the existing closeMobile / hamburger click to add GSAP
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const links = mobileMenu.querySelectorAll('a, .mobile-search');

  // Observe class changes on mobile-menu (set by existing JS)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'class') {
        if (mobileMenu.classList.contains('open')) {
          // stagger links in
          gsap.fromTo(links,
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.1 }
          );
        } else {
          gsap.to(links, { opacity: 0, x: -10, duration: 0.2, stagger: 0.03 });
        }
      }
    });
  });
  observer.observe(mobileMenu, { attributes: true });
}

/* ─────────────────────────────────────────────
   MENU INDICATOR — smooth spring on navigate
   (supplements the existing CSS transition)
───────────────────────────────────────────── */
function initIndicatorAnim() {
  // Patch moveIndicator to use GSAP spring instead of CSS transition
  const _origMove = typeof moveIndicator === 'function' ? moveIndicator : null;
  if (!_origMove) return;

  window.moveIndicator = function (page) {
    if (!page) {
      gsap.to('#indicator', { width: 0, duration: 0.3, ease: 'power2.in' });
      return;
    }
    const menu = document.getElementById('desktop-menu');
    const link = menu ? menu.querySelector('[data-page="' + page + '"]') : null;
    const ind = document.getElementById('indicator');
    if (!link || !ind) return;

    const mr = menu.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    const newLeft = lr.left - mr.left;
    const newWidth = lr.width;

    gsap.to(ind, {
      left: newLeft,
      width: newWidth,
      duration: 0.45,
      ease: 'elastic.out(1, 0.6)'
    });
  };
}

/* ─────────────────────────────────────────────
   LOGO — wobble on click (brand moment)
───────────────────────────────────────────── */
function initLogoAnim() {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  logo.addEventListener('click', () => {
    gsap.fromTo(logo,
      { rotation: -4, scale: 0.94 },
      { rotation: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
    );
  });

  logo.addEventListener('mouseenter', () => {
    gsap.to(logo, { scale: 1.04, duration: 0.2, ease: 'power1.out' });
  });
  logo.addEventListener('mouseleave', () => {
    gsap.to(logo, { scale: 1, duration: 0.2, ease: 'power1.out' });
  });
}

/* ─────────────────────────────────────────────
   BOOT — runs once DOM is ready
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  animNavEntrance();
  initNavScroll();
  initNavLinkAnim();
  initSearchAnim();
  initAdminBtnAnim();
  initHamburgerAnim();
  initMobileMenuAnim();
  initIndicatorAnim();
  initLogoAnim();

  const _origNavigate = typeof navigate === 'function' ? navigate : null;
  if (_origNavigate) {
    window.navigate = function (page, e) {
      _origNavigate(page, e);
      if (page === 'home') {
        setTimeout(() => {
          ScrollTrigger.refresh();
          initGsapHome();
        }, 80);
      }
    };
  }
});