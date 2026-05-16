/* ─────────────────────────────────────────────
   NAV ENTRANCE — runs once on first page load
───────────────────────────────────────────── */
function animNavEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  gsap.set('nav',             { y: -80, opacity: 0 });
  gsap.set('.logo',           { opacity: 0, x: -20 });
  gsap.set('#desktop-menu a', { opacity: 0, y: -12 });
  gsap.set('.search-wrap',    { opacity: 0, scaleX: 0.7, transformOrigin: 'right center' });
  gsap.set('#admin-nav-btn',  { opacity: 0, x: 16 });
  gsap.set('.hamburger',      { opacity: 0, scale: 0.7 });

  // ← ADD: hide injected buttons immediately so they don't pop in
  // features.js injects these; set them hidden now, reveal at end of timeline
  gsap.set('#theme-toggle, #nav-reading-list-btn, #shortcuts-btn', { opacity: 0 });

  tl
    .to('nav',            { y: 0, opacity: 1, duration: 0.55 })
    .to('.logo',          { opacity: 1, x: 0, duration: 0.45 }, '-=0.3')
    .to('#desktop-menu a',{ opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, '-=0.25')
    .to('.search-wrap',   { opacity: 1, scaleX: 1, duration: 0.45, ease: 'back.out(1.3)' }, '-=0.25')
    .to('#admin-nav-btn', { opacity: 1, x: 0, duration: 0.35 }, '-=0.3')
    .to('.hamburger',     { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, '-=0.35')
    // ← ADD: fade injected buttons in at the very end
    .to('#theme-toggle, #nav-reading-list-btn, #shortcuts-btn', {
        opacity: 1, duration: 0.3, stagger: 0.06
      }, '-=0.2');
}
 
/* ─────────────────────────────────────────────
   SCROLL BEHAVIOR
   Nav shrinks + gets a blur backdrop on scroll
───────────────────────────────────────────── */
function initNavScroll() {  
  let hidden      = false;
 
  ScrollTrigger.create({
    start: 1,
    end: 99999,
    onUpdate(self) {
      const scrollY = self.scroll();
      const dir     = self.direction; // 1 = down, -1 = up
 
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
      gsap.to(link, { y: 0,  duration: 0.18, ease: 'power2.out' });
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
  const hamburger  = document.getElementById('hamburger');
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
    const ind  = document.getElementById('indicator');
    if (!link || !ind) return;
 
    const mr = menu.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    const newLeft  = lr.left - mr.left;
    const newWidth = lr.width;
 
    gsap.to(ind, {
      left:  newLeft,
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
      { rotation: 0,  scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
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
});