(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     FEATURE 1 — READING TIME ESTIMATOR
     Shows "X min read" on every article card + detail page
  ═══════════════════════════════════════════════════════════ */
  function calcReadTime(text) {
    const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function patchCardHTMLForReadTime() {
    const _orig = window.cardHTML;
    if (!_orig) return;
    window.cardHTML = function (a, highlightQuery) {
      let html = _orig(a, highlightQuery);
      const mins = calcReadTime(a.body || a.desc || '');
      // inject read-time badge into .card-body after .card-desc
      html = html.replace(
        /<\/div>\s*<\/div>\s*$/,
        `<p class="card-read-time">⏱ ${mins} min read</p></div></div>`
      );
      return html;
    };
  }

  function addReadTimeToArticle(a) {
    const mins = calcReadTime(a.body || '');
    const existing = document.getElementById('art-read-time');
    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.id = 'art-read-time';
    badge.className = 'art-read-time-badge';
    badge.textContent = `⏱ ${mins} min read`;
    const meta = document.querySelector('.article-meta');
    if (meta) meta.appendChild(badge);
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 2 — IN-ARTICLE READING PROGRESS BAR
     A thin red bar grows at the top of the article as you scroll
  ═══════════════════════════════════════════════════════════ */
  let artProgressBar = null;

  function initArticleProgress() {
    if (!artProgressBar) {
      artProgressBar = document.createElement('div');
      artProgressBar.id = 'art-progress-bar';
      artProgressBar.style.cssText = `
        position: fixed; top: 64px; left: 0; height: 3px;
        background: #e31c1c; width: 0%; z-index: 999;
        pointer-events: none; transition: width 0.1s linear;
        box-shadow: 0 0 8px rgba(227,28,28,0.6);
      `;
      document.body.appendChild(artProgressBar);
    }
    artProgressBar.style.display = 'block';
    artProgressBar.style.width = '0%';

    function updateProgress() {
      if (!document.getElementById('panel-article')?.classList.contains('active')) {
        artProgressBar.style.display = 'none';
        return;
      }
      const body = document.getElementById('art-body');
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height;
      const done = Math.min(Math.max(-rect.top, 0), total);
      const pct = total > 0 ? (done / total) * 100 : 0;
      artProgressBar.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  function hideArticleProgress() {
    if (artProgressBar) {
      artProgressBar.style.display = 'none';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 3 — BOOKMARKS / READING LIST
     Users can save articles with a ♥ button
  ═══════════════════════════════════════════════════════════ */
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem('tbl_bookmarks') || '[]'); }
    catch { return []; }
  }

  function isBookmarked(id) {
    return getBookmarks().includes(Number(id));
  }

  function toggleBookmark(id) {
    let list = getBookmarks();
    id = Number(id);
    if (list.includes(id)) {
      list = list.filter(x => x !== id);
      showToastSafe('Removed from Reading List');
    } else {
      list.push(id);
      showToastSafe('✅ Saved to Reading List!');
    }
    localStorage.setItem('tbl_bookmarks', JSON.stringify(list));
    updateBookmarkButtons(id);
    updateReadingListBadge();
  }

  function updateBookmarkButtons(id) {
    document.querySelectorAll(`.bookmark-btn[data-id="${id}"]`).forEach(btn => {
      const saved = isBookmarked(id);
      btn.classList.toggle('saved', saved);
      btn.title = saved ? 'Remove from Reading List' : 'Save to Reading List';
      btn.querySelector('.bm-icon').textContent = saved ? '♥' : '♡';
    });
  }

  function updateReadingListBadge() {
    const count = getBookmarks().length;
    document.querySelectorAll('.reading-list-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  function makeBookmarkBtn(articleId) {
    const saved = isBookmarked(articleId);
    const btn = document.createElement('button');
    btn.className = `bookmark-btn${saved ? ' saved' : ''}`;
    btn.dataset.id = articleId;
    btn.title = saved ? 'Remove from Reading List' : 'Save to Reading List';
    btn.innerHTML = `<span class="bm-icon">${saved ? '♥' : '♡'}</span> <span class="bm-label">Save</span>`;
    btn.onclick = e => { e.stopPropagation(); toggleBookmark(articleId); };
    return btn;
  }

  function injectBookmarkIntoArticle(a) {
    const existing = document.getElementById('art-bookmark-btn');
    if (existing) existing.remove();
    const btn = makeBookmarkBtn(a.id);
    btn.id = 'art-bookmark-btn';
    const meta = document.querySelector('.article-meta');
    if (meta) meta.appendChild(btn);
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 4 — READING LIST PANEL
     A slide-in drawer showing all bookmarked articles
  ═══════════════════════════════════════════════════════════ */
  function createReadingListDrawer() {
    if (document.getElementById('reading-list-drawer')) return;

    const overlay = document.createElement('div');
    overlay.id = 'rl-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.6);
      z-index:5000; display:none; backdrop-filter:blur(4px);
    `;
    overlay.onclick = closeReadingList;

    const drawer = document.createElement('div');
    drawer.id = 'reading-list-drawer';
    drawer.style.cssText = `
      position:fixed; top:0; right:-420px; width:380px; max-width:90vw;
      height:100vh; background:#141414; border-left:1px solid rgba(255,255,255,0.08);
      z-index:5001; overflow-y:auto; transition:right 0.4s cubic-bezier(0.4,0,0.2,1);
      padding:2rem 1.5rem;
    `;
    drawer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;">
        <div>
          <p style="font-size:11px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#e31c1c;margin-bottom:.3rem;">Your List</p>
          <h2 style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.05em;color:#f5f5f5;">Reading List</h2>
        </div>
        <button onclick="closeReadingList()" style="
          background:none;border:1px solid rgba(255,255,255,0.1);color:#888;
          width:34px;height:34px;border-radius:4px;font-size:18px;cursor:pointer;
        ">✕</button>
      </div>
      <div id="rl-content"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  window.openReadingList = function () {
    createReadingListDrawer();
    const drawer = document.getElementById('reading-list-drawer');
    const overlay = document.getElementById('rl-overlay');
    const list = getBookmarks();
    const content = document.getElementById('rl-content');

    if (!list.length) {
      content.innerHTML = `
        <div style="text-align:center;padding:3rem 0;color:#888;">
          <p style="font-size:36px;margin-bottom:1rem;">📚</p>
          <p style="font-size:14px;font-weight:600;color:#f5f5f5;margin-bottom:.5rem;">Nothing saved yet</p>
          <p style="font-size:12px;">Click the ♡ button on any article to save it here.</p>
        </div>`;
    } else {
      const articles = (window.ARTICLES || []).filter(a => list.includes(a.id));
      content.innerHTML = articles.map(a => `
        <div class="rl-item" onclick="closeReadingList();openArticle(${a.id})">
          ${a.img ? `<img src="${a.img}" alt="${a.title}" style="width:72px;height:54px;object-fit:cover;border-radius:4px;flex-shrink:0;">` : ''}
          <div style="flex:1;min-width:0;">
            <p style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#e31c1c;margin-bottom:.3rem;">${a.tag}</p>
            <p style="font-size:13px;font-weight:600;color:#f5f5f5;line-height:1.4;">${a.title}</p>
            <p style="font-size:11px;color:#888;margin-top:.25rem;">⏱ ${calcReadTime(a.body || '')} min read</p>
          </div>
          <button onclick="event.stopPropagation();toggleBookmark(${a.id})" 
            style="background:none;border:none;color:#e31c1c;font-size:16px;cursor:pointer;flex-shrink:0;">♥</button>
        </div>
      `).join('');
    }

    overlay.style.display = 'block';
    setTimeout(() => { drawer.style.right = '0'; }, 10);
  };

  window.closeReadingList = function () {
    const drawer = document.getElementById('reading-list-drawer');
    const overlay = document.getElementById('rl-overlay');
    if (drawer) drawer.style.right = '-420px';
    if (overlay) setTimeout(() => { overlay.style.display = 'none'; }, 400);
  };

  /* ═══════════════════════════════════════════════════════════
     FEATURE 5 — SHARE ARTICLE BUTTONS
     Copy link / Twitter / WhatsApp
  ═══════════════════════════════════════════════════════════ */
  function injectShareButtons(a) {
    const existing = document.getElementById('art-share-row');
    if (existing) existing.remove();

    const row = document.createElement('div');
    row.id = 'art-share-row';
    row.className = 'art-share-row';
    row.innerHTML = `
      <span class="share-label">Share:</span>
      <button class="share-btn" id="share-copy"   title="Copy link">🔗 Copy Link</button>
      <button class="share-btn" id="share-twitter" title="Share on X">𝕏 Post</button>
      <button class="share-btn" id="share-whatsapp" title="Share on WhatsApp">💬 WhatsApp</button>
    `;

    const divider = document.querySelector('.article-divider');
    if (divider) divider.insertAdjacentElement('afterend', row);

    const url = `${location.href}#article-${a.id}`;
    const text = `"${a.title}" — ${a.deck}`;

    document.getElementById('share-copy').onclick = () => {
      navigator.clipboard.writeText(url).then(() => showToastSafe('🔗 Link copied!'));
    };
    document.getElementById('share-twitter').onclick = () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };
    document.getElementById('share-whatsapp').onclick = () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    };
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 6 — ARTICLE VIEW COUNTER
     Tracks how many times each article has been opened
  ═══════════════════════════════════════════════════════════ */
  function getViews() {
    try { return JSON.parse(localStorage.getItem('tbl_views') || '{}'); }
    catch { return {}; }
  }

  function incrementView(id) {
    const views = getViews();
    views[id] = (views[id] || 0) + 1;
    localStorage.setItem('tbl_views', JSON.stringify(views));
    return views[id];
  }

  function addViewCountToArticle(a) {
    const count = incrementView(a.id);
    const existing = document.getElementById('art-view-count');
    if (existing) existing.remove();
    const el = document.createElement('span');
    el.id = 'art-view-count';
    el.className = 'art-view-count';
    el.textContent = `👁 ${count} view${count !== 1 ? 's' : ''}`;
    const meta = document.querySelector('.article-meta');
    if (meta) meta.appendChild(el);
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 7 — BACK TO TOP BUTTON
  ═══════════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.title = 'Back to top';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof gsap !== 'undefined') {
      btn.addEventListener('mouseenter', () =>
        gsap.to(btn, { y: -3, duration: 0.2, ease: 'power2.out' }));
      btn.addEventListener('mouseleave', () =>
        gsap.to(btn, { y: 0, duration: 0.2, ease: 'power2.out' }));
    }
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 8 — KEYBOARD SHORTCUTS
  ═══════════════════════════════════════════════════════════ */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Don't trigger inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          document.getElementById('desktop-search')?.focus();
          break;
        case 'Escape':
          if (typeof closeReadingList === 'function') closeReadingList();
          break;
        case 'h':
          if (!e.ctrlKey && !e.metaKey) navigate('home');
          break;
        case 'a':
          if (!e.ctrlKey && !e.metaKey) navigate('articles');
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) navigate('categories');
          break;
        case 'b':
          if (!e.ctrlKey && !e.metaKey) openReadingList();
          break;
        case 'ArrowLeft':
          if (document.getElementById('panel-article')?.classList.contains('active')) {
            const backBtn = document.getElementById('back-btn');
            if (backBtn) backBtn.click();
          }
          break;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 9 — KEYBOARD SHORTCUT HINT TOOLTIP
  ═══════════════════════════════════════════════════════════ */
  function showShortcutsHelp() {
    let box = document.getElementById('shortcuts-help');
    if (box) { box.remove(); return; }

    box = document.createElement('div');
    box.id = 'shortcuts-help';
    box.innerHTML = `
      <div class="sh-header">
        <p class="sh-title">Keyboard Shortcuts</p>
        <button onclick="document.getElementById('shortcuts-help').remove()">✕</button>
      </div>
      <div class="sh-grid">
        <span class="sh-key">/</span><span>Focus search</span>
        <span class="sh-key">H</span><span>Go Home</span>
        <span class="sh-key">A</span><span>Articles</span>
        <span class="sh-key">C</span><span>Categories</span>
        <span class="sh-key">B</span><span>Reading List</span>
        <span class="sh-key">←</span><span>Go back (in article)</span>
        <span class="sh-key">Esc</span><span>Close panels</span>
      </div>
    `;
    document.body.appendChild(box);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(box, { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' });
    }
  }
  window.showShortcutsHelp = showShortcutsHelp;

  /* ═══════════════════════════════════════════════════════════
     FEATURE 10 — DARK MODE / LIGHT MODE TOGGLE
  ═══════════════════════════════════════════════════════════ */
  function initThemeToggle() {
    const saved = localStorage.getItem('tbl_theme') || 'dark';
    applyTheme(saved);

    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.title = 'Toggle theme';
    btn.innerHTML = saved === 'dark' ? '☀️' : '🌙';
    document.querySelector('.nav-inner')?.insertBefore(
      btn, document.getElementById('admin-nav-btn')
    );

    btn.onclick = () => {
      const current = localStorage.getItem('tbl_theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      localStorage.setItem('tbl_theme', next);

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(btn, { rotation: -30, scale: 0.8 },
          { rotation: 0, scale: 1, duration: 0.4, ease: 'back.out(1.8)' });
      }
    };
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.style.setProperty('--tbl-bg', '#f5f5f0');
      document.documentElement.style.setProperty('--tbl-surface', '#ffffff');
      document.documentElement.style.setProperty('--tbl-white', '#1a1a1a');
      document.documentElement.style.setProperty('--tbl-muted', '#666666');
      document.documentElement.style.setProperty('--tbl-border', 'rgba(0,0,0,0.1)');
      document.documentElement.style.setProperty('--tbl-bg-inv', '#0a0a0a');
      document.body.style.background = '#f5f5f0';
    } else {
      document.documentElement.style.setProperty('--tbl-bg', '#0a0a0a');
      document.documentElement.style.setProperty('--tbl-surface', '#141414');
      document.documentElement.style.setProperty('--tbl-white', '#f5f5f5');
      document.documentElement.style.setProperty('--tbl-muted', '#888888');
      document.documentElement.style.setProperty('--tbl-border', 'rgba(255,255,255,0.08)');
      document.body.style.background = '#0a0a0a';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 11 — READING LIST BUTTON IN NAV
  ═══════════════════════════════════════════════════════════ */
  function injectNavReadingListBtn() {
    const existing = document.getElementById('nav-reading-list-btn');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'nav-reading-list-btn';
    btn.title = 'Reading List (B)';
    btn.style.cssText = `
      background:none; border:1px solid rgba(255,255,255,0.08);
      color:#888; font-family:'Barlow',sans-serif; font-size:12px;
      font-weight:600; letter-spacing:.06em; text-transform:uppercase;
      padding:6px 12px; border-radius:4px; cursor:pointer;
      transition:color .2s,border-color .2s; white-space:nowrap;
      display:flex; align-items:center; gap:6px; flex-shrink:0;
    `;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      Saved
      <span class="reading-list-badge" style="
        background:#e31c1c; color:#fff; font-size:9px; font-weight:700;
        border-radius:10px; padding:1px 5px; display:none; align-items:center;
      ">0</span>
    `;
    btn.onclick = openReadingList;

    const adminBtn = document.getElementById('admin-nav-btn');
    if (adminBtn) adminBtn.parentElement.insertBefore(btn, adminBtn);

    btn.addEventListener('mouseenter', () => {
      btn.style.color = '#f5f5f5'; btn.style.borderColor = '#888';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = '#888'; btn.style.borderColor = 'rgba(255,255,255,0.08)';
    });

    updateReadingListBadge();
  }

  /* ═══════════════════════════════════════════════════════════
     FEATURE 12 — SHORTCUTS HELP BUTTON IN NAV
  ═══════════════════════════════════════════════════════════ */
  function injectShortcutsBtn() {
    const btn = document.createElement('button');
    btn.id = 'shortcuts-btn';
    btn.title = 'Keyboard shortcuts';
    btn.style.cssText = `
      background:none; border:1px solid rgba(255,255,255,0.08);
      color:#888; width:34px; height:34px; border-radius:4px;
      cursor:pointer; font-size:14px; flex-shrink:0; display:flex;
      align-items:center; justify-content:center;
      transition:color .2s,border-color .2s;
    `;
    btn.innerHTML = `⌨`;
    btn.onclick = showShortcutsHelp;

    const adminBtn = document.getElementById('admin-nav-btn');
    if (adminBtn) adminBtn.parentElement.insertBefore(btn, adminBtn);

    btn.addEventListener('mouseenter', () => {
      btn.style.color = '#f5f5f5'; btn.style.borderColor = '#888';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = '#888'; btn.style.borderColor = 'rgba(255,255,255,0.08)';
    });
  }

  /* ═══════════════════════════════════════════════════════════
     PATCH openArticle — inject all article extras
  ═══════════════════════════════════════════════════════════ */
  function patchOpenArticle() {
    const _orig = window.openArticle;
    if (!_orig) return;
    window.openArticle = function (id) {
      _orig(id);
      const a = (window.ARTICLES || [])[id];
      if (!a) return;
      setTimeout(() => {
        addReadTimeToArticle(a);
        addViewCountToArticle(a);
        injectBookmarkIntoArticle(a);
        injectShareButtons(a);
        initArticleProgress();
      }, 80);
    };
  }

  /* ── Hide progress bar when leaving article ── */
  function patchNavigateForProgress() {
    const _orig = window.navigate;
    if (!_orig) return;
    window.navigate = function (page, e) {
      _orig(page, e);
      if (page !== 'article') hideArticleProgress();
    };
  }

  /* ═══════════════════════════════════════════════════════════
     SAFE TOAST (works even before showToast is patched)
  ═══════════════════════════════════════════════════════════ */
  function showToastSafe(msg) {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      const t = document.getElementById('toast');
      if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener('load', () => {
    patchCardHTMLForReadTime();
    patchOpenArticle();
    patchNavigateForProgress();
    initBackToTop();
    initKeyboardShortcuts();
    injectNavReadingListBtn();
    injectShortcutsBtn();
    initThemeToggle();
    updateReadingListBadge();
  });

})();

window.toggleBookmark = toggleBookmark;