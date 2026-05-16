gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────── */

/** Kill all ScrollTriggers tagged with a page key */
function killPageTriggers(pageKey) {
  ScrollTrigger.getAll()
    .filter(t => t.vars && t.vars._tblPage === pageKey)
    .forEach(t => t.kill());
}

/** Shorthand: fade + translateY from below */
function fadeUp(targets, opts = {}) {
  const els = gsap.utils.toArray(targets);
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y: opts.y ?? 30 });
  return gsap.to(els, {
    opacity: 1, y: 0,
    duration: opts.duration ?? 0.55,
    stagger: opts.stagger ?? 0,
    delay: opts.delay ?? 0,
    ease: opts.ease ?? 'power3.out',
    ...(opts.extra ?? {})
  });
}

/** ScrollTrigger wrapper — only fires once per visit */
function onScroll(trigger, pageKey, cb, start = 'top 85%') {
  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    _tblPage: pageKey,
    onEnter: cb
  });
}

/* ─────────────────────────────────────────────
   PATCH navigate() — hook animations per page
───────────────────────────────────────────── */
window.addEventListener('load', () => {

  // Animate the default active page on first load
  setTimeout(() => triggerPageAnim('home'), 200);
});

function triggerPageAnim(page) {
  switch (page) {
    case 'articles': animArticles(); break;
    case 'categories': animCategories(); break;
    case 'category-view': animCategoryView(); break;
    case 'about': animAbout(); break;
    case 'search': animSearch(); break;
    case 'article': animArticleDetail(); break;
    case 'adminlogin': animAdminLogin(); break;
    case 'dashboard': animDashboard(); break;
  }
}

/* ═══════════════════════════════════════════
   ARTICLES PAGE
═══════════════════════════════════════════ */
function animArticles() {
  killPageTriggers('articles');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Hero heading
  gsap.set('#panel-articles .hero-label', { opacity: 0, y: 20 });
  gsap.set('#panel-articles .hero-title', { opacity: 0, y: 40 });
  gsap.set('#panel-articles .hero-sub', { opacity: 0, y: 20 });

  tl.to('#panel-articles .hero-label', { opacity: 1, y: 0, duration: 0.4 })
    .to('#panel-articles .hero-title', { opacity: 1, y: 0, duration: 0.55 }, '-=0.25')
    .to('#panel-articles .hero-sub', { opacity: 1, y: 0, duration: 0.4 }, '-=0.3');

  // Featured cards
  const cards = gsap.utils.toArray('#articles-cards .card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.96 });
    tl.to(cards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)'
    }, '-=0.1');
  }

  // Filter tabs — bounce in
  const tabs = gsap.utils.toArray('.filter-tab');
  if (tabs.length) {
    gsap.set(tabs, { opacity: 0, y: 16, scale: 0.88 });
    tl.to(tabs, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.4, stagger: 0.06, ease: 'back.out(1.5)'
    }, '-=0.1');
  }

  // Archive section heading
  onScroll('.all-articles-section', 'articles', () => {
    fadeUp('.all-articles-section .section-eyebrow, .all-articles-section .section-title', {
      stagger: 0.08, duration: 0.4
    });
  });

  // Article list rows slide in
  onScroll('#articles-list', 'articles', () => {
    const rows = gsap.utils.toArray('#articles-list .article-list-item');
    gsap.set(rows, { opacity: 0, x: -28 });
    gsap.to(rows, {
      opacity: 1, x: 0,
      duration: 0.45, stagger: 0.07, ease: 'power2.out'
    });
  }, 'top 90%');
}

/* ═══════════════════════════════════════════
   CATEGORIES PAGE
═══════════════════════════════════════════ */
function animCategories() {
  killPageTriggers('categories');

  // heading
  gsap.set('#panel-categories .hero-label', { opacity: 0, x: -20 });
  gsap.set('#panel-categories .hero-title', { opacity: 0, y: 40 });
  gsap.set('#panel-categories .hero-sub', { opacity: 0, y: 20 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('#panel-categories .hero-label', { opacity: 1, x: 0, duration: 0.4 })
    .to('#panel-categories .hero-title', { opacity: 1, y: 0, duration: 0.55 }, '-=0.25')
    .to('#panel-categories .hero-sub', { opacity: 1, y: 0, duration: 0.4 }, '-=0.3');

  // Category cards — drop in with spring
  const cards = gsap.utils.toArray('#cat-cards .card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 50, rotation: -2 });
    tl.to(cards, {
      opacity: 1, y: 0, rotation: 0,
      duration: 0.55, stagger: 0.09, ease: 'back.out(1.3)'
    }, '-=0.2');
  }
}

/* ═══════════════════════════════════════════
   CATEGORY VIEW PAGE
═══════════════════════════════════════════ */
function animCategoryView() {
  killPageTriggers('category-view');

  // Back button
  gsap.set('#cat-back-btn', { opacity: 0, x: -16 });
  gsap.to('#cat-back-btn', { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });

  // Icon + heading
  gsap.set('.cat-view-icon', { opacity: 0, scale: 0.5, rotation: -15 });
  gsap.set('#cat-view-eyebrow, #cat-view-title, .cat-view-count', { opacity: 0, x: -20 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
  tl.to('.cat-view-icon', { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' })
    .to('#cat-view-eyebrow', { opacity: 1, x: 0, duration: 0.35 }, '-=0.25')
    .to('#cat-view-title', { opacity: 1, x: 0, duration: 0.45 }, '-=0.25')
    .to('.cat-view-count', { opacity: 1, x: 0, duration: 0.3 }, '-=0.2');

  // Cards
  const cards = gsap.utils.toArray('#cat-view-grid .card');
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 36, scale: 0.95 });
    gsap.to(cards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.5, stagger: 0.08, ease: 'back.out(1.2)', delay: 0.35
    });
  }

  // Pagination
  gsap.set('#cat-pagination', { opacity: 0, y: 16 });
  gsap.to('#cat-pagination', { opacity: 1, y: 0, duration: 0.4, delay: 0.5 });
}

/* ═══════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════ */
function animAbout() {
  killPageTriggers('about');

  // Hero
  gsap.set('#panel-about .hero-label', { opacity: 0, y: 18 });
  gsap.set('#panel-about .hero-title', { opacity: 0, y: 40 });
  gsap.set('#panel-about .hero-sub', { opacity: 0, y: 20 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('#panel-about .hero-label', { opacity: 1, y: 0, duration: 0.4 })
    .to('#panel-about .hero-title', { opacity: 1, y: 0, duration: 0.55 }, '-=0.25')
    .to('#panel-about .hero-sub', { opacity: 1, y: 0, duration: 0.4 }, '-=0.3');

  // Top cards
  const topCards = gsap.utils.toArray('#panel-about > .card-grid .card');
  if (topCards.length) {
    gsap.set(topCards, { opacity: 0, y: 30 });
    tl.to(topCards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.15');
  }

  // Values section
  onScroll('.about-values', 'about', () => {
    fadeUp('.about-values-header .section-eyebrow', { duration: 0.35 });
    fadeUp('.about-values-header .section-title', { duration: 0.45, delay: 0.08 });
    fadeUp('.about-values-header .about-values-sub', { duration: 0.4, delay: 0.15 });

    const vCards = gsap.utils.toArray('.value-card');
    gsap.set(vCards, { opacity: 0, y: 40, scale: 0.94 });
    gsap.to(vCards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'back.out(1.2)'
    });
  });

  // Creator card
  onScroll('.creator-card', 'about', () => {
    gsap.set('.creator-card', { opacity: 0, y: 40 });
    gsap.set('.creator-left', { opacity: 0, x: -30 });
    gsap.set('.creator-right', { opacity: 0, x: 30 });
    gsap.set('.creator-avatar-ring', { rotation: 0, opacity: 0 });

    const tl2 = gsap.timeline({ ease: 'power3.out' });
    tl2.to('.creator-card', { opacity: 1, y: 0, duration: 0.5 })
      .to('.creator-left', { opacity: 1, x: 0, duration: 0.5 }, '-=0.35')
      .to('.creator-right', { opacity: 1, x: 0, duration: 0.5 }, '-=0.45')
      .to('.creator-avatar-ring', { opacity: 1, rotation: 360, duration: 1.2, ease: 'power1.out' }, '-=0.4')
      .fromTo('.creator-stats .creator-stat',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.1 }, '-=0.3')
      .fromTo('.creator-contact-btn',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2');
  }, 'top 82%');
}

/* ═══════════════════════════════════════════
   SEARCH RESULTS PAGE
═══════════════════════════════════════════ */
function animSearch() {
  killPageTriggers('search');

  gsap.set('#panel-search .hero-label', { opacity: 0, y: 16 });
  gsap.set('#search-heading', { opacity: 0, y: 30 });
  gsap.set('#search-count', { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('#panel-search .hero-label', { opacity: 1, y: 0, duration: 0.35 })
    .to('#search-heading', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
    .to('#search-count', { opacity: 1, duration: 0.35 }, '-=0.2');

  // Stagger result cards
  setTimeout(() => {
    const results = gsap.utils.toArray('#search-results-grid .card');
    if (results.length) {
      gsap.set(results, { opacity: 0, y: 28 });
      gsap.to(results, {
        opacity: 1, y: 0,
        duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.15
      });
    }
  }, 80);
}

/* ═══════════════════════════════════════════
   ARTICLE DETAIL PAGE
═══════════════════════════════════════════ */
function animArticleDetail() {
  killPageTriggers('article');

  // Back button
  gsap.set('#back-btn', { opacity: 0, x: -20 });
  gsap.to('#back-btn', { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });

  // Meta + title + deck
  gsap.set('.article-meta', { opacity: 0, y: 14 });
  gsap.set('#art-title', { opacity: 0, y: 36 });
  gsap.set('#art-deck', { opacity: 0, x: -16 });
  gsap.set('.article-divider', { scaleX: 0, transformOrigin: 'left center', opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.05 });
  tl.to('.article-meta', { opacity: 1, y: 0, duration: 0.4 })
    .to('#art-title', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
    .to('#art-deck', { opacity: 1, x: 0, duration: 0.5 }, '-=0.3')
    .to('.article-divider', { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '-=0.2')
    .fromTo('#art-body',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

  // Right panel — hero image + overlays
  gsap.set('.art-img-frame', { opacity: 0, x: 30 });
  gsap.set('.art-img-tag', { opacity: 0, x: -16 });
  gsap.set('.art-img-date', { opacity: 0, y: 10 });
  gsap.set('.art-side-rule', { scaleX: 0, transformOrigin: 'left center', opacity: 0 });
  gsap.set('#art-side-related', { opacity: 0, y: 20 });

  gsap.timeline({ delay: 0.25, defaults: { ease: 'power3.out' } })
    .to('.art-img-frame', { opacity: 1, x: 0, duration: 0.65, ease: 'back.out(1.1)' })
    .to('.art-img-tag', { opacity: 1, x: 0, duration: 0.4 }, '-=0.3')
    .to('.art-img-date', { opacity: 1, y: 0, duration: 0.35 }, '-=0.25')
    .to('.art-side-rule', { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.inOut' }, '-=0.2')
    .to('#art-side-related', { opacity: 1, y: 0, duration: 0.45 }, '-=0.2');

  // Mini related list stagger
  setTimeout(() => {
    const miniItems = gsap.utils.toArray('.art-mini-item');
    if (miniItems.length) {
      gsap.set(miniItems, { opacity: 0, x: 16 });
      gsap.to(miniItems, {
        opacity: 1, x: 0,
        duration: 0.4, stagger: 0.08, delay: 0.5, ease: 'power2.out'
      });
    }
  }, 100);

  // Related cards at bottom — scroll triggered
  onScroll('.related-section', 'article', () => {
    fadeUp('.related-label', { duration: 0.35 });
    const relCards = gsap.utils.toArray('#related-cards .card');
    gsap.set(relCards, { opacity: 0, y: 36, scale: 0.95 });
    gsap.to(relCards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.5, stagger: 0.1, delay: 0.1, ease: 'back.out(1.2)'
    });
  }, 'top 90%');

  // Article body headings — scroll reveal
  setTimeout(() => {
    gsap.utils.toArray('#art-body h2').forEach(h2 => {
      gsap.set(h2, { opacity: 0, x: -18 });
      onScroll(h2, 'article', () => {
        gsap.to(h2, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
      }, 'top 88%');
    });
  }, 150);
}

/* ═══════════════════════════════════════════
   ADMIN LOGIN PAGE
═══════════════════════════════════════════ */
function animAdminLogin() {
  // Card drop-in from above
  gsap.set('.login-card', { opacity: 0, y: -40, scale: 0.95 });
  gsap.to('.login-card', {
    opacity: 1, y: 0, scale: 1,
    duration: 0.65, ease: 'back.out(1.4)'
  });

  // Logo badge
  gsap.set('.login-logo', { opacity: 0, scale: 0.7 });
  gsap.to('.login-logo', {
    opacity: 1, scale: 1,
    duration: 0.45, delay: 0.3, ease: 'back.out(1.8)'
  });

  // Heading + sub
  gsap.set('.login-heading', { opacity: 0, y: 18 });
  gsap.set('.login-sub', { opacity: 0, y: 12 });
  gsap.to('.login-heading', { opacity: 1, y: 0, duration: 0.4, delay: 0.45 });
  gsap.to('.login-sub', { opacity: 1, y: 0, duration: 0.4, delay: 0.55 });

  // Form fields stagger
  const fields = gsap.utils.toArray('.login-card .form-group');
  gsap.set(fields, { opacity: 0, y: 20 });
  gsap.to(fields, {
    opacity: 1, y: 0,
    duration: 0.4, stagger: 0.1, delay: 0.6, ease: 'power2.out'
  });

  // Button pop
  gsap.set('#login-btn', { opacity: 0, scale: 0.88 });
  gsap.to('#login-btn', {
    opacity: 1, scale: 1,
    duration: 0.4, delay: 0.85, ease: 'back.out(1.5)'
  });

  gsap.set('.login-hint', { opacity: 0 });
  gsap.to('.login-hint', { opacity: 1, duration: 0.35, delay: 1 });

  // Input focus micro-animation
  // Inside animAdminLogin(), replace the forEach block with:
  document.querySelectorAll('.login-card .form-input').forEach(inp => {
    if (inp._gsapBound) return;   // ← guard: only bind once
    inp._gsapBound = true;
    inp.addEventListener('focus', () => {
      gsap.to(inp, { scale: 1.01, duration: 0.2, ease: 'power1.out' });
    });
    inp.addEventListener('blur', () => {
      gsap.to(inp, { scale: 1, duration: 0.2, ease: 'power1.out' });
    });
  });
}

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD PAGE
═══════════════════════════════════════════ */
function animDashboard() {
  killPageTriggers('dashboard');

  // Header
  gsap.set('.dashboard-title', { opacity: 0, x: -24 });
  gsap.set('.dashboard-user', { opacity: 0, x: 24 });
  gsap.to('.dashboard-title', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
  gsap.to('.dashboard-user', { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.08 });

  // Stat cards — drop in + count up
  const statCards = gsap.utils.toArray('.stat-card');
  gsap.set(statCards, { opacity: 0, y: 30, scale: 0.9 });
  gsap.to(statCards, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.5, stagger: 0.09, delay: 0.2, ease: 'back.out(1.3)',
    onComplete: countUpStats
  });

  // Section head + table
  gsap.set('.section-head', { opacity: 0, y: 20 });
  gsap.to('.section-head', { opacity: 1, y: 0, duration: 0.45, delay: 0.5 });

  setTimeout(() => {
    const rows = gsap.utils.toArray('#articles-table tbody tr');
    if (rows.length) {
      gsap.set(rows, { opacity: 0, x: -20 });
      gsap.to(rows, {
        opacity: 1, x: 0,
        duration: 0.4, stagger: 0.04, delay: 0.1, ease: 'power2.out'
      });
    }
  }, 600);
}

function countUpStats() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = el.textContent.replace(/[^0-9.k]/gi, '');
    const isK = el.textContent.toLowerCase().includes('k');
    const target = isK
      ? parseFloat(raw) * 1000
      : parseFloat(raw.replace('k', ''));
    if (isNaN(target)) return;

    gsap.fromTo({ n: 0 }, { n: 0 }, {
      n: target, duration: 1.6, ease: 'power2.out',
      onUpdate() {
        const v = Math.round(this.targets()[0].n);
        el.textContent = isK && v >= 1000
          ? (v / 1000).toFixed(0) + 'k'
          : v;
      }
    });
  });
}

/* ═══════════════════════════════════════════
   ARTICLE LIST ROW — re-animate on filter change
   Patch filterArticles + renderArticlesList
═══════════════════════════════════════════ */
window.addEventListener('load', () => {

  // Patch filterArticles to animate after render
  const _origFilter = typeof filterArticles === 'function' ? filterArticles : null;
  if (_origFilter) {
    window.filterArticles = function (slug) {
      _origFilter(slug);
      setTimeout(animArticleRows, 80);
    };
  }

  // Patch renderArticlesList (pagination) to animate rows
  const _origRender = typeof renderArticlesList === 'function' ? renderArticlesList : null;
  if (_origRender) {
    window.renderArticlesList = function (page) {
      _origRender(page);
      setTimeout(animArticleRows, 80);
    };
  }

  // Patch renderCatPage (category pagination)
  const _origCatPage = typeof renderCatPage === 'function' ? renderCatPage : null;
  if (_origCatPage) {
    window.renderCatPage = function (page) {
      _origCatPage(page);
      setTimeout(animCatPageCards, 80);
    };
  }

  // Patch openArticle to re-trigger detail anim
  const _origOpenArticle = typeof openArticle === 'function' ? openArticle : null;
  if (_origOpenArticle) {
    window.openArticle = function (id) {
      _origOpenArticle(id);
      setTimeout(animArticleDetail, 80);
    };
  }

  // Patch openCategory
  const _origOpenCat = typeof openCategory === 'function' ? openCategory : null;
  if (_origOpenCat) {
    window.openCategory = function (slug) {
      _origOpenCat(slug);
      setTimeout(animCategoryView, 80);
    };
  }

  // Patch buildDashboard to re-animate table
  const _origBuildDash = typeof buildDashboard === 'function' ? buildDashboard : null;
  if (_origBuildDash) {
    window.buildDashboard = function () {
      _origBuildDash();
      setTimeout(() => {
        const rows = gsap.utils.toArray('#articles-table tbody tr');
        if (rows.length) {
          gsap.set(rows, { opacity: 0, x: -20 });
          gsap.to(rows, {
            opacity: 1, x: 0,
            duration: 0.35, stagger: 0.04, ease: 'power2.out'
          });
        }
      }, 60);
    };
  }
});

function animArticleRows() {
  const rows = gsap.utils.toArray('#articles-list .article-list-item');
  if (!rows.length) return;
  gsap.set(rows, { opacity: 0, x: -22 });
  gsap.to(rows, {
    opacity: 1, x: 0,
    duration: 0.4, stagger: 0.055, ease: 'power2.out'
  });
}

function animCatPageCards() {
  const cards = gsap.utils.toArray('#cat-view-grid .card');
  if (!cards.length) return;
  gsap.set(cards, { opacity: 0, y: 28, scale: 0.95 });
  gsap.to(cards, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.45, stagger: 0.07, ease: 'back.out(1.2)'
  });
}

/* ═══════════════════════════════════════════
   MODAL ANIMATIONS — article edit + confirm delete
═══════════════════════════════════════════ */
const _origOpenModal = typeof openModal === 'function' ? openModal : null;
if (_origOpenModal) {
  window.openModal = function (id) {
    _origOpenModal(id);
    const box = document.querySelector(`#${id} .modal-box`);
    if (!box) return;
    gsap.fromTo(box,
      { opacity: 0, y: -24, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
    );
    // stagger form fields
    const fields = box.querySelectorAll('.form-group');
    if (fields.length) {
      gsap.fromTo(fields,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, delay: 0.15 }
      );
    }
  };
}

const _origCloseModal = typeof closeModal === 'function' ? closeModal : null;
if (_origCloseModal) {
  window.closeModal = function (id) {
    const box = document.querySelector(`#${id} .modal-box`);
    if (!box) { _origCloseModal(id); return; }
    gsap.to(box, {
      opacity: 0, y: -16, scale: 0.95,
      duration: 0.25, ease: 'power2.in',
      onComplete: () => _origCloseModal(id)
    });
  };
}

/* ═══════════════════════════════════════════
   TOAST ANIMATION
═══════════════════════════════════════════ */
const _origShowToast = typeof showToast === 'function' ? showToast : null;
if (_origShowToast) {
  window.showToast = function (msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    gsap.killTweensOf(t);
    gsap.fromTo(t,
      { y: 60, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }
    );
    setTimeout(() => {
      gsap.to(t, { y: 60, opacity: 0, duration: 0.35, ease: 'power2.in' });
    }, 2500);
  };
}