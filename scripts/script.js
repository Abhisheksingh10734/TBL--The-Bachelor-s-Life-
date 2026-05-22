/* =================================================================
   TBL — script.js  (production-ready)
   All 7 bugs fixed:
   1. ARTICLES not on window              → window.ARTICLES = ARTICLES
   2. navigate used auth before auth init  → safe guard added
   3. isLoggedIn not on window            → window.isLoggedIn exposed
   4. deleteArticle used index not id     → fixed with findIndex
   5. resetArticlesToDefault missing defaults push → fixed
   6. onAuthStateChanged dead (commented) → handled in firebase.js
   7. toggleBookmark outside IIFE         → moved inside features.js
================================================================= */

import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from './firebase.js';

/* ─────────────────────────────────────────────
   DEFAULT ARTICLES
───────────────────────────────────────────── */
const DEFAULT_ARTICLES = [
  {
    id: 0, tag: 'Featured', category: 'cooking', date: 'May 3, 2026',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
    title: 'The Bachelor Kitchen',
    desc: 'Five meals you can cook in under 20 minutes.',
    deck: 'No culinary degree required. Fast, cheap, and actually taste good.',
    body: `<h2>Why You Need This</h2><p>Most bachelors survive on takeout or cereal until their wallet and waistline start complaining.</p><h2>1. Garlic Butter Pasta</h2><p>Boil pasta, melt butter, add minced garlic for 60 seconds, toss with parmesan. Done in <strong>12 minutes</strong>.</p><h2>2. Sheet Pan Chicken Thighs</h2><p>Season with olive oil, salt, paprika and garlic powder. Roast at 400°F for 35 minutes with any vegetables.</p><h2>3. Stir-Fry Rice</h2><p>Day-old rice, fried egg, soy sauce, sesame oil, any leftover meat or veg. Five minutes, one pan.</p><h2>4. Quesadillas</h2><p>Tortilla, cheese, protein, second tortilla. Medium heat, flip once. Faster than ordering food.</p><h2>5. Overnight Oats</h2><p>Oats, milk and peanut butter in a jar. Refrigerate overnight. Zero morning effort.</p>`
  },
  {
    id: 1, tag: 'Trending', category: 'style', date: 'Apr 28, 2026',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
    title: 'Style on a Budget',
    desc: 'Look sharp without breaking the bank.',
    deck: 'You do not need a big wardrobe. You need the right pieces.',
    body: `<h2>The Mindset Shift</h2><p>Stop buying cheap clothes often. Cost-per-wear is the only metric that matters.</p><h2>The Non-Negotiables</h2><ul><li><strong>Well-fitted chinos</strong> — navy or khaki</li><li><strong>Plain white and grey tees</strong></li><li><strong>A clean Oxford shirt</strong></li><li><strong>Dark jeans with no distressing</strong></li><li><strong>One navy blazer</strong></li></ul><h2>Where to Shop</h2><p>Uniqlo for basics. Thrift stores for blazers. End-of-season sales for everything else.</p>`
  },
  {
    id: 2, tag: 'Fitness', category: 'fitness', date: 'Apr 20, 2026',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop',
    title: 'Home Workout Plan',
    desc: 'No gym? No problem. Build muscle at home.',
    deck: 'A gym membership is optional. Discipline is not.',
    body: `<h2>The Foundation</h2><p>Push-ups, pull-ups, squats, lunges and planks cover every major muscle group.</p><h2>The Weekly Split</h2><ul><li><strong>Mon/Thu:</strong> Push</li><li><strong>Tue/Fri:</strong> Pull</li><li><strong>Wed/Sat:</strong> Legs + Core</li><li><strong>Sunday:</strong> Rest or a 30-minute walk</li></ul><h2>The One Rule</h2><p>Never miss two days in a row.</p>`
  },
  {
    id: 3, tag: 'Cooking', category: 'cooking', date: 'Apr 15, 2026',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
    title: 'Meal Prep Sundays',
    desc: 'How to prep a whole week of food in two hours.',
    deck: 'Two hours on Sunday buys you seven days of not thinking about food.',
    body: `<h2>The Core Formula</h2><p>One <strong>protein</strong>, one <strong>grain</strong>, two <strong>vegetables</strong>. Mix and match through the week.</p><h2>The Timeline</h2><p>Start rice first. Season and roast chicken and veg while it cooks. Boil eggs last. Active time: under 45 minutes.</p>`
  },
  {
    id: 4, tag: 'Finance', category: 'finance', date: 'Apr 8, 2026',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop',
    title: 'First Salary Guide',
    desc: 'What to do with your paycheck from day one.',
    deck: 'Your first salary feels like a lot. Then rent, food and subscriptions happen.',
    body: `<h2>The 50/30/20 Rule</h2><p><strong>50%</strong> needs, <strong>30%</strong> wants, <strong>20%</strong> savings. Adjust for your city.</p><h2>Automate Everything</h2><p>Set up a savings transfer on payday before you touch anything else.</p><h2>Kill Subscription Creep</h2><p>Cancel anything you haven't used in 30 days.</p>`
  },
  {
    id: 5, tag: 'Grooming', category: 'style', date: 'Apr 1, 2026',
    img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop',
    title: 'Skincare Simplified',
    desc: 'A five-minute routine that actually works.',
    deck: 'Three products, used consistently. That is the entire secret.',
    body: `<h2>The Three Products</h2><ul><li><strong>Cleanser</strong> — morning and night</li><li><strong>Moisturiser with SPF</strong> — morning</li><li><strong>Moisturiser without SPF</strong> — night</li></ul><h2>Total Daily Time: 3 minutes.</h2><p>Morning: cleanse + SPF moisturise. Night: cleanse + moisturise.</p>`
  },
  {
    id: 6, tag: 'Social', category: 'social', date: 'Mar 25, 2026',
    img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop',
    title: 'Hosting 101',
    desc: 'Throw a great get-together on a tight budget.',
    deck: 'Great hosting is about removing friction.',
    body: `<h2>Pre-Game Essentials</h2><p>Clean bathroom. Extra toilet paper. One candle. These three cost nothing.</p><h2>Drinks Over Food</h2><p>One spirit, mixer, beers, juice option. People make their own drinks — gives them something to do on arrival.</p><h2>The Playlist</h2><p>Make it before guests arrive. Background volume only.</p>`
  },
  {
    id: 7, tag: 'Fitness', category: 'fitness', date: 'Mar 18, 2026',
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop',
    title: 'Running for Beginners',
    desc: 'Go from couch to 5K with this simple plan.',
    deck: 'The cheapest and most effective cardio available.',
    body: `<h2>Week One</h2><p>Walk for 30 minutes. Do not run yet. Let your joints adapt.</p><h2>Weeks Two to Four</h2><p>Run 1 min, walk 2 min. Repeat 8 times. Three sessions per week. Add 30 seconds each week.</p><h2>The Only Gear You Need</h2><p>Properly fitted shoes. Get them at a running shop.</p>`
  },
  {
    id: 8, tag: 'Cooking', category: 'cooking', date: 'Mar 10, 2026',
    img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop',
    title: 'Knife Skills Crash Course',
    desc: 'Cut faster and safer with these basic techniques.',
    deck: 'A sharp knife and three techniques cover 90% of everything you cook.',
    body: `<h2>Get Your Knife Sharp</h2><p>A dull knife slips and cuts you. Use a honing steel before every session.</p><h2>The Claw Grip</h2><p>Curl fingertips under. Blade rests against knuckles. Practice until automatic.</p><h2>Three Cuts</h2><ul><li><strong>Chop</strong> — straight down</li><li><strong>Slice</strong> — forward and down</li><li><strong>Rock chop</strong> — tip stays on board, for herbs</li></ul>`
  },
  {
    id: 9, tag: 'Finance', category: 'finance', date: 'Mar 3, 2026',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    title: 'Emergency Fund Basics',
    desc: 'Why every bachelor needs three months of savings.',
    deck: 'Life will throw something at you. Have cash when it does.',
    body: `<h2>How Much</h2><p>Three months of <strong>essential expenses</strong> — rent, food, transport, utilities only.</p><h2>Where to Keep It</h2><p>A high-interest account slightly inconvenient to access. Friction is the goal.</p><h2>How to Build It</h2><p>Fixed transfer every payday. Even £20 a week becomes £1,000 in a year.</p>`
  },
  {
    id: 10, tag: 'Style', category: 'style', date: 'Feb 24, 2026',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    title: 'Capsule Wardrobe Guide',
    desc: 'Ten pieces that mix and match into fifty outfits.',
    deck: 'Fewer choices, better outcomes.',
    body: `<h2>The Ten Pieces</h2><ul><li>2 plain white tees, 1 grey tee</li><li>1 navy + 1 white Oxford shirt</li><li>1 navy + 1 khaki chinos</li><li>1 dark jeans</li><li>1 navy blazer</li><li>1 crewneck sweatshirt</li></ul><h2>Why It Works</h2><p>Every item pairs with every other. No statement pieces that only work one way.</p>`
  },
  {
    id: 11, tag: 'Social', category: 'social', date: 'Feb 15, 2026',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop',
    title: 'Reading the Room',
    desc: 'How to hold a conversation in any social situation.',
    deck: 'Social confidence is a skill set, not a personality trait.',
    body: `<h2>Ask, Do Not Perform</h2><p>Good conversation means being interested, not interesting. Ask questions, listen, ask follow-ups.</p><h2>Reading Energy</h2><p>Match the room's energy before trying to change it.</p>`
  },
  {
    id: 12, tag: 'Fitness', category: 'fitness', date: 'Feb 5, 2026',
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop',
    title: 'Sleep Like an Athlete',
    desc: 'Optimise your rest for better performance.',
    deck: 'The highest-leverage health habit that costs nothing.',
    body: `<h2>The Non-Negotiables</h2><ul><li>Same wake time every day</li><li>Dark room — blackout curtains</li><li>Cool temperature — 16–19°C</li></ul><h2>What Ruins Sleep</h2><p>Alcohol, caffeine after 2pm, screens within 90 minutes of bed.</p>`
  },
  {
    id: 13, tag: 'Cooking', category: 'cooking', date: 'Jan 28, 2026',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
    title: 'Coffee at Home',
    desc: 'Barista-level brews without the café price tag.',
    deck: 'The gap between café and home coffee is smaller than you think.',
    body: `<h2>Buy a Burr Grinder First</h2><p>Fresh-ground beans taste categorically different from pre-ground.</p><h2>Three Methods Worth Learning</h2><ul><li><strong>French press</strong> — easiest</li><li><strong>Pour over</strong> — cleaner cup</li><li><strong>AeroPress</strong> — fastest, most versatile</li></ul>`
  },
  {
    id: 14, tag: 'Finance', category: 'finance', date: 'Jan 20, 2026',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop',
    title: 'Renting vs Buying',
    desc: 'Break down the numbers before you sign anything.',
    deck: 'Renting is not throwing money away. Buying is not always building wealth.',
    body: `<h2>The Myth of Wasted Rent</h2><p>Rent pays for housing and transfers all maintenance, mortgage, and illiquidity risk to the landlord.</p><h2>Hidden Costs of Buying</h2><p>Stamp duty, solicitor fees, surveys, plus 1% of property value per year in maintenance.</p><h2>When Buying Makes Sense</h2><p>Staying 5–7 years minimum, stable income, proper deposit — all four conditions, not two or three.</p>`
  },
];

/* ─────────────────────────────────────────────
   STORAGE
───────────────────────────────────────────── */
const STORAGE_KEY = 'tbl_articles';

function loadArticles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
      return DEFAULT_ARTICLES.map(a => ({ ...a }));
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
      return DEFAULT_ARTICLES.map(a => ({ ...a }));
    }
    return parsed;
  } catch {
    return DEFAULT_ARTICLES.map(a => ({ ...a }));
  }
}

const ARTICLES = loadArticles();

/* BUG FIX 1 — expose on window so features.js / firebase.js can reach it */
window.ARTICLES        = ARTICLES;
window.DEFAULT_ARTICLES = DEFAULT_ARTICLES;

function persistArticles() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ARTICLES)); } catch (e) {
    console.warn('TBL: persistArticles failed.', e);
  }
}

/* BUG FIX 5 — was missing the DEFAULT_ARTICLES push loop */
function resetArticlesToDefault() {
  if (!confirm('Reset all articles to the 15 default articles? This cannot be undone.')) return;
  ARTICLES.length = 0;
  DEFAULT_ARTICLES.forEach((a, i) => ARTICLES.push({ ...a, id: i }));
  persistArticles();
  if (typeof buildDashboard === 'function') buildDashboard();
  if (typeof showToast      === 'function') showToast('✅ Articles reset to defaults.');
  navigate('dashboard');
}

/* ─────────────────────────────────────────────
   AUTH STATE
   BUG FIX 3 — isLoggedIn exposed on window so
   firebase.js onAuthStateChanged can update it
───────────────────────────────────────────── */
window.isLoggedIn = false;

/* local alias for internal use */
let isLoggedIn  = false;
let prevPage    = 'home';
let currentPage = 'home';

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function highlight(t, q) {
  if (!q) return esc(t);
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return esc(t).replace(re, '<mark>$1</mark>');
}
function doSearch(q) {
  const lq = q.toLowerCase();
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(lq) ||
    a.desc.toLowerCase().includes(lq)  ||
    a.tag.toLowerCase().includes(lq)   ||
    a.category.toLowerCase().includes(lq)
  );
}

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
const SPECIAL_PAGES = ['search', 'article', 'adminlogin', 'dashboard', 'category-view'];

function navigate(page, e) {
  if (e) e.preventDefault();
  /* BUG FIX 2 — was auth.currentUser which throws if auth is null */
  if (page === 'dashboard' && !isLoggedIn) { navigate('adminlogin'); return; }
  currentPage = page;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + page).classList.add('active');
  document.querySelectorAll('[data-page]').forEach(a =>
    a.classList.toggle('active', !SPECIAL_PAGES.includes(page) && a.dataset.page === page)
  );
  moveIndicator(SPECIAL_PAGES.includes(page) ? null : page);
}

function moveIndicator(page) {
  const ind = document.getElementById('indicator');
  if (!page) { ind.style.width = '0'; return; }
  const menu = document.getElementById('desktop-menu');
  const link = menu.querySelector('[data-page="' + page + '"]');
  if (!link) return;
  const mr = menu.getBoundingClientRect(), lr = link.getBoundingClientRect();
  ind.style.left  = (lr.left - mr.left) + 'px';
  ind.style.width = lr.width + 'px';
}

/* ─────────────────────────────────────────────
   CARDS
───────────────────────────────────────────── */
function cardHTML(a, highlightQuery) {
  const q     = highlightQuery || '';
  const thumb = a.img
    ? `<div class="card-thumb-wrap"><img class="card-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy"></div>`
    : '';
  return `<div class="card" onclick="openArticle(${a.id})">
    ${thumb}
    <div class="card-body">
      <p class="card-tag">${q ? highlight(a.tag,   q) : esc(a.tag)}</p>
      <p class="card-title">${q ? highlight(a.title, q) : esc(a.title)}</p>
      <p class="card-desc">${q ? highlight(a.desc,  q) : esc(a.desc)}</p>
    </div>
  </div>`;
}

function buildCards(containerId, items) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = items.map(a => cardHTML(a)).join('');
}

/* ─────────────────────────────────────────────
   ARTICLE PAGE
───────────────────────────────────────────── */
function openArticle(id) {
  const a = ARTICLES.find(x => x.id == id);
  if (!a) return;
  prevPage = currentPage;

  const labels = {
    search:          'Back to Results',
    dashboard:       'Back to Dashboard',
    'category-view': 'Back to Category',
  };
  document.getElementById('back-label').textContent =
    labels[prevPage] || 'Back to ' + (prevPage.charAt(0).toUpperCase() + prevPage.slice(1));
  document.getElementById('back-btn').onclick = () => navigate(prevPage);

  document.getElementById('art-tag').textContent   = a.tag;
  document.getElementById('art-date').textContent  = a.date;
  document.getElementById('art-title').textContent = a.title;
  document.getElementById('art-deck').textContent  = a.deck;
  document.getElementById('art-body').innerHTML    = a.body;

  const heroImg = document.getElementById('art-hero-img');
  heroImg.src   = a.img || '';
  heroImg.alt   = a.title;
  heroImg.style.display = a.img ? 'block' : 'none';
  document.getElementById('art-img-tag-overlay').textContent  = a.tag;
  document.getElementById('art-img-date-overlay').textContent = a.date;

  const related = ARTICLES.filter(x => x.id !== a.id && x.category === a.category).slice(0, 4);
  document.getElementById('art-mini-list').innerHTML = related.map(r => `
    <div class="art-mini-item" onclick="openArticle(${r.id})">
      ${r.img ? `<img class="art-mini-thumb" src="${r.img}" alt="${esc(r.title)}" loading="lazy">` : ''}
      <div>
        <p class="art-mini-tag">${esc(r.tag)}</p>
        <p class="art-mini-title">${esc(r.title)}</p>
      </div>
    </div>`).join('');

  document.getElementById('related-cards').innerHTML = related.slice(0, 3).map(r => cardHTML(r)).join('');
  navigate('article');
  document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   SEARCH
───────────────────────────────────────────── */
function renderDropdown(results, q, containerId) {
  const dd = document.getElementById(containerId);
  if (!q.trim()) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
  dd.classList.add('open');
  if (!results.length) { dd.innerHTML = `<div class="search-empty">No results for "${esc(q)}"</div>`; return; }
  dd.innerHTML =
    `<div class="search-dropdown-header">${results.length} result${results.length !== 1 ? 's' : ''} — press Enter for all</div>` +
    results.slice(0, 5).map(a => `
      <div class="search-result-item" onclick="openArticle(${a.id});document.getElementById('desktop-dropdown').classList.remove('open')">
        ${a.img ? `<img class="result-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy">` : ''}
        <div>
          <p class="result-tag">${esc(a.tag)}</p>
          <p class="result-title">${highlight(a.title, q)}</p>
          <p class="result-desc">${highlight(a.desc,  q)}</p>
        </div>
      </div>`).join('');
}

function liveSearch(val)      { renderDropdown(doSearch(val), val, 'desktop-dropdown'); }
function liveSearchMobile(val) {
  const mr = document.getElementById('mobile-results');
  const results = doSearch(val);
  if (!val.trim()) { mr.classList.remove('open'); mr.innerHTML = ''; return; }
  mr.classList.add('open');
  if (!results.length) { mr.innerHTML = `<div class="search-empty">No results for "${esc(val)}"</div>`; return; }
  mr.innerHTML = results.slice(0, 5).map(a => `
    <div class="search-result-item" onclick="openArticle(${a.id});closeMobile()">
      ${a.img ? `<img class="result-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy">` : ''}
      <div>
        <p class="result-tag">${esc(a.tag)}</p>
        <p class="result-title">${highlight(a.title, val)}</p>
        <p class="result-desc">${highlight(a.desc,  val)}</p>
      </div>
    </div>`).join('');
}

function fullSearch(val) {
  const q = val.trim(); if (!q) return;
  document.getElementById('desktop-dropdown').classList.remove('open');
  document.getElementById('mobile-results').classList.remove('open');
  document.getElementById('desktop-search').value = q;
  const results = doSearch(q);
  document.getElementById('search-heading').textContent = `"${q}"`;
  document.getElementById('search-count').innerHTML = results.length
    ? `Found <strong>${results.length}</strong> article${results.length !== 1 ? 's' : ''}` : '';
  document.getElementById('search-results-grid').innerHTML = results.length
    ? results.map(a => cardHTML(a, q)).join('')
    : `<div class="no-results">No articles matched "${esc(q)}". Try a different keyword.</div>`;
  navigate('search');
}

/* ─────────────────────────────────────────────
   CATEGORY VIEW + PAGINATION
───────────────────────────────────────────── */
const CAT_META = {
  cooking: { icon: '🍳', label: 'Cooking & Food'  },
  fitness: { icon: '💪', label: 'Fitness'          },
  style:   { icon: '👔', label: 'Style & Grooming' },
  finance: { icon: '💰', label: 'Finance'          },
  social:  { icon: '🤝', label: 'Social Life'      },
};

const ARTICLES_PER_PAGE = 6;
let catCurrentPage      = 1;
let catCurrentSlug      = '';
let catFilteredArticles = [];

function openCategory(slug) {
  catCurrentSlug      = slug;
  catCurrentPage      = 1;
  catFilteredArticles = ARTICLES.filter(a => a.category === slug);
  const meta = CAT_META[slug] || { icon: '📄', label: slug };
  document.getElementById('cat-view-icon').textContent    = meta.icon;
  document.getElementById('cat-view-eyebrow').textContent = 'Category';
  document.getElementById('cat-view-title').textContent   = meta.label;
  document.getElementById('cat-view-count').textContent   =
    catFilteredArticles.length + ' article' + (catFilteredArticles.length !== 1 ? 's' : '');
  document.getElementById('cat-back-btn').onclick = () => navigate('categories');
  renderCatPage(1);
  navigate('category-view');
}

function renderCatPage(page) {
  catCurrentPage = page;
  const totalPages = Math.ceil(catFilteredArticles.length / ARTICLES_PER_PAGE);
  const start      = (page - 1) * ARTICLES_PER_PAGE;
  document.getElementById('cat-view-grid').innerHTML =
    catFilteredArticles.slice(start, start + ARTICLES_PER_PAGE).map(a => cardHTML(a)).join('');
  renderPagination('cat-pagination', page, totalPages, renderCatPage);
  document.getElementById('panel-category-view').scrollIntoView({ behavior: 'smooth' });
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  const fn = onPageChange.name;
  let html = '';
  html += `<button class="page-btn${currentPage === 1 ? ' disabled' : ''}" ${currentPage === 1 ? 'disabled' : `onclick="${fn}(${currentPage - 1})"`}>
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>`;
  getPageRange(currentPage, totalPages).forEach(p => {
    html += p === '…'
      ? `<span class="page-ellipsis">…</span>`
      : `<button class="page-btn${p === currentPage ? ' active' : ''}" onclick="${fn}(${p})">${p}</button>`;
  });
  html += `<button class="page-btn${currentPage === totalPages ? ' disabled' : ''}" ${currentPage === totalPages ? 'disabled' : `onclick="${fn}(${currentPage + 1})"`}>
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>`;
  html += `<span class="page-info">Page ${currentPage} of ${totalPages}</span>`;
  el.innerHTML = html;
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('…'); pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1); pages.push('…');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); pages.push('…');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('…'); pages.push(total);
  }
  return pages;
}

/* ─────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────── */
function closeMobile() {
  document.getElementById('mobile-menu').classList.remove('open');
  const btn = document.getElementById('hamburger');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

/* ─────────────────────────────────────────────
   ADMIN AUTH — uses Firebase Auth
───────────────────────────────────────────── */
function handleAdminNavClick() {
  navigate(isLoggedIn ? 'dashboard' : 'adminlogin');
}

function togglePw() {
  const inp = document.getElementById('login-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function doLogin() {
  const email    = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('err-password');
  errEl.textContent = '';
  errEl.classList.remove('visible');
  document.getElementById('login-btn').textContent = 'Signing in…';
  document.getElementById('login-btn').classList.add('loading');
  try {
    await signInWithEmailAndPassword(auth, email, password);
    /* onAuthStateChanged in firebase.js sets isLoggedIn & calls buildDashboard */
  } catch {
    document.getElementById('login-btn').textContent = 'Sign In';
    document.getElementById('login-btn').classList.remove('loading');
    errEl.textContent = 'Invalid email or password.';
    errEl.classList.add('visible');
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').classList.add('error');
  }
}

async function doLogout() {
  await signOut(auth);
  isLoggedIn        = false;
  window.isLoggedIn = false;
  updateAdminBtn();
  navigate('home');
}

function updateAdminBtn() {
  isLoggedIn        = window.isLoggedIn;   /* sync with firebase.js updates */
  const btn   = document.getElementById('admin-nav-btn');
  const mlink = document.getElementById('mobile-admin-link');
  if (isLoggedIn) {
    btn.textContent = 'Dashboard'; btn.classList.add('logged-in');
    mlink.textContent = 'Dashboard';
  } else {
    btn.textContent = 'Admin Login'; btn.classList.remove('logged-in');
    mlink.textContent = 'Admin Login';
  }
}

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────── */
function buildDashboard() {
  const tbl = document.getElementById('articles-table');
  if (!tbl) return;
  tbl.innerHTML = '<thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead><tbody>' +
    ARTICLES.map(a => `
      <tr>
        <td>${a.img
          ? `<img src="${a.img}" alt="${esc(a.title)}" style="width:56px;height:44px;object-fit:cover;border-radius:3px;">`
          : `<div style="width:56px;height:44px;background:#222;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:18px;">📷</div>`}</td>
        <td><strong>${esc(a.title)}</strong></td>
        <td><span class="tbl-tag">${esc(a.tag)}</span></td>
        <td class="tbl-date">${esc(a.date)}</td>
        <td><div class="tbl-actions">
          <button class="tbl-btn" onclick="openArticle(${a.id})">View</button>
          <button class="tbl-btn" onclick="openEditArticle(${a.id})">Edit</button>
          <button class="tbl-btn del" onclick="confirmDelete(${a.id})">Delete</button>
        </div></td>
      </tr>`).join('') + '</tbody>';
}

/* ─────────────────────────────────────────────
   MODALS
───────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openNewArticle() {
  document.getElementById('modal-title-text').textContent = 'New Article';
  document.getElementById('modal-article-id').value = '';
  ['modal-art-title','modal-art-desc','modal-art-deck','modal-art-body','modal-art-img']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('modal-art-tag').value      = 'Featured';
  document.getElementById('modal-art-category').value = 'cooking';
  const preview = document.getElementById('modal-thumb-preview');
  if (preview) { preview.src = ''; preview.classList.remove('visible'); }
  openModal('article-modal');
}

function openEditArticle(id) {
  const a = ARTICLES.find(x => x.id == id);
  if (!a) return;
  document.getElementById('modal-title-text').textContent = 'Edit Article';
  document.getElementById('modal-article-id').value       = id;
  document.getElementById('modal-art-title').value        = a.title;
  document.getElementById('modal-art-tag').value          = a.tag;
  document.getElementById('modal-art-category').value     = a.category;
  document.getElementById('modal-art-desc').value         = a.desc;
  document.getElementById('modal-art-deck').value         = a.deck  || '';
  document.getElementById('modal-art-body').value         = a.body  || '';
  document.getElementById('modal-art-img').value          = a.img   || '';
  previewThumb(a.img || '');
  openModal('article-modal');
}

function saveArticle() {
  const title = document.getElementById('modal-art-title').value.trim();
  if (!title) { document.getElementById('modal-art-title').focus(); return; }
  const editId = document.getElementById('modal-article-id').value;
  const data = {
    tag:      document.getElementById('modal-art-tag').value,
    category: document.getElementById('modal-art-category').value,
    title,
    desc:     document.getElementById('modal-art-desc').value.trim(),
    deck:     document.getElementById('modal-art-deck').value.trim(),
    body:     document.getElementById('modal-art-body').value.trim(),
    img:      document.getElementById('modal-art-img').value.trim(),
    date:     new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
  };
  if (editId !== '') {
    const idx = ARTICLES.findIndex(a => a.id == editId);
    if (idx !== -1) Object.assign(ARTICLES[idx], data);
    showToast('✅ Article updated.');
  } else {
    data.id = ARTICLES.length;
    ARTICLES.push(data);
    showToast('✅ Article published.');
  }
  persistArticles();
  closeModal('article-modal');
  buildDashboard();
}

function confirmDelete(id) {
  const a = ARTICLES.find(x => x.id == id);
  if (!a) return;
  document.getElementById('confirm-title').textContent = `Delete "${a.title}"?`;
  document.getElementById('confirm-msg').textContent   = 'This will permanently remove the article and cannot be undone.';
  document.getElementById('confirm-ok-btn').onclick    = () => { deleteArticle(id); closeModal('confirm-modal'); };
  openModal('confirm-modal');
}

/* BUG FIX 4 — use findIndex to correctly locate by id, not array index */
function deleteArticle(id) {
  const index = ARTICLES.findIndex(a => a.id == id);
  if (index === -1) return;
  ARTICLES.splice(index, 1);
  ARTICLES.forEach((a, i) => { a.id = i; });   /* reindex */
  persistArticles();
  buildDashboard();
  showToast('🗑️ Article deleted.');
}

function previewThumb(url) {
  const img = document.getElementById('modal-thumb-preview');
  if (!img) return;
  if (url && url.startsWith('http')) { img.src = url; img.classList.add('visible'); }
  else                               { img.src = '';  img.classList.remove('visible'); }
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────────
   NEWSLETTER (stub — real logic in IIFE below)
───────────────────────────────────────────── */
function subscribeNewsletter() {
  const inp = document.getElementById('newsletter-email');
  if (!inp.value.trim() || !inp.value.includes('@')) { inp.style.borderColor = 'var(--tbl-red)'; inp.focus(); return; }
  inp.style.borderColor = ''; inp.value = '';
  inp.placeholder = 'Thanks for subscribing!';
  setTimeout(() => { inp.placeholder = 'your@email.com'; }, 3000);
}

function subscribeHome() {
  const inp = document.getElementById('home-newsletter-email');
  if (!inp.value.trim() || !inp.value.includes('@')) { inp.style.borderColor = 'var(--tbl-red)'; inp.focus(); return; }
  inp.style.borderColor = ''; inp.value = '';
  inp.placeholder = "🎉 You're subscribed!";
  setTimeout(() => { inp.placeholder = 'your@email.com'; }, 3000);
}

/* ─────────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', function () {
  const isOpen = document.getElementById('mobile-menu').classList.toggle('open');
  this.classList.toggle('open', isOpen);
  this.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', e => {
  if (!document.getElementById('search-container').contains(e.target))
    document.getElementById('desktop-dropdown').classList.remove('open');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMobile();
    closeModal('article-modal');
    closeModal('confirm-modal');
    document.getElementById('desktop-dropdown').classList.remove('open');
  }
});

['article-modal','confirm-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function (e) {
    if (e.target === this) closeModal(id);
  });
});

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  buildCards('home-cards',     ARTICLES.slice(0, 3));
  buildCards('articles-cards', ARTICLES.slice(3, 7));

  const catItems = [
    { ...ARTICLES[0], tag:'01', title:'Cooking & Food', desc:'Recipes, meal prep, and kitchen essentials.',   _slug:'cooking' },
    { ...ARTICLES[2], tag:'02', title:'Fitness',         desc:'Workouts, nutrition, and recovery tips.',       _slug:'fitness' },
    { ...ARTICLES[1], tag:'03', title:'Style',           desc:'Fashion, grooming, and personal presentation.', _slug:'style'   },
    { ...ARTICLES[4], tag:'04', title:'Finance',         desc:'Budgeting, saving, and smart spending.',        _slug:'finance' },
    { ...ARTICLES[6], tag:'05', title:'Social Life',     desc:'Dating, friendships, and social confidence.',   _slug:'social'  },
  ];
  document.getElementById('cat-cards').innerHTML = catItems.map(a => `
    <div class="card cat-entry-card" onclick="openCategory('${a._slug}')">
      ${a.img ? `<div class="card-thumb-wrap"><img class="card-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy"></div>` : ''}
      <div class="card-body">
        <p class="card-tag">${esc(a.tag)}</p>
        <p class="card-title">${esc(a.title)}</p>
        <p class="card-desc">${esc(a.desc)}</p>
        <p class="cat-entry-arrow">Browse →</p>
      </div>
    </div>`).join('');

  initHome();
  moveIndicator('home');
  initArticlesPage();
});

window.addEventListener('resize', () => {
  moveIndicator(SPECIAL_PAGES.includes(currentPage) ? null : currentPage);
});

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
function initHome() {
  const el = document.getElementById('editorial-grid');
  if (!el) return;
  el.innerHTML = ARTICLES.slice(4, 10).map(a => `
    <div class="editorial-item" onclick="openArticle(${a.id})">
      ${a.img ? `<img class="editorial-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy">` : ''}
      <div class="editorial-body">
        <div class="editorial-meta">
          <span class="editorial-tag">${esc(a.tag)}</span>
          <span class="editorial-date">${esc(a.date)}</span>
        </div>
        <p class="editorial-title">${esc(a.title)}</p>
        <p class="editorial-desc">${esc(a.desc)}</p>
      </div>
    </div>`).join('');
}

/* ─────────────────────────────────────────────
   ARTICLES PAGE — filter + pagination
───────────────────────────────────────────── */
const ARTICLES_LIST_PER_PAGE = 5;
let articlesListPage     = 1;
let articlesListFilter   = 'all';
let articlesListFiltered = [];

function initArticlesPage() { filterArticles('all'); }

function filterArticles(slug) {
  articlesListFilter   = slug;
  articlesListPage     = 1;
  window._articlesListFilter = slug;
  articlesListFiltered = slug === 'all' ? [...ARTICLES] : ARTICLES.filter(a => a.category === slug);
  document.querySelectorAll('.filter-tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.filter === slug));
  const countEl = document.getElementById('articles-total-count');
  if (countEl) countEl.textContent =
    articlesListFiltered.length + ' article' + (articlesListFiltered.length !== 1 ? 's' : '');
  renderArticlesList(1);
}

function renderArticlesList(page) {
  articlesListPage = page;
  const totalPages = Math.ceil(articlesListFiltered.length / ARTICLES_LIST_PER_PAGE);
  const start      = (page - 1) * ARTICLES_LIST_PER_PAGE;
  const slice      = articlesListFiltered.slice(start, start + ARTICLES_LIST_PER_PAGE);
  document.getElementById('articles-list').innerHTML = slice.map(a => `
    <div class="article-list-item" onclick="openArticle(${a.id})">
      ${a.img ? `<img class="ali-thumb" src="${a.img}" alt="${esc(a.title)}" loading="lazy">`
               : `<div class="ali-thumb ali-thumb-placeholder">📄</div>`}
      <div class="ali-body">
        <div class="ali-meta">
          <span class="ali-tag">${esc(a.tag)}</span>
          <span class="ali-date">${esc(a.date)}</span>
        </div>
        <h3 class="ali-title">${esc(a.title)}</h3>
        <p class="ali-desc">${esc(a.desc)}</p>
      </div>
      <div class="ali-arrow">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>`).join('');
  renderPagination('articles-pagination', page, totalPages, renderArticlesList);
  const sec = document.querySelector('.all-articles-section');
  if (sec && page > 1) sec.scrollIntoView({ behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   NEWSLETTER IIFE
───────────────────────────────────────────── */
(function () {
  'use strict';
  const ENV    = window.__TBL_ENV__ || {};
  const CONFIG = {
    emailjs_public_key:    ENV.EMAILJS_PUBLIC_KEY,
    emailjs_service_id:    ENV.EMAILJS_SERVICE_ID,
    template_welcome:      ENV.EMAILJS_TEMPLATE_WELCOME,
    template_admin_notify: ENV.EMAILJS_TEMPLATE_ADMIN,
    admin_email:           ENV.EMAILJS_ADMIN_EMAIL,
    site_name:             ENV.SITE_NAME || "The Bachelor's Life",
  };

  const EMAILJS_READY = !!(CONFIG.emailjs_public_key && CONFIG.emailjs_service_id && CONFIG.template_welcome);

  if (EMAILJS_READY) {
    const s = document.createElement('script');
    s.src   = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => emailjs.init(CONFIG.emailjs_public_key);
    document.head.appendChild(s);
  }

  function getSubscribers() {
    try { return JSON.parse(localStorage.getItem('tbl_subscribers') || '[]'); } catch { return []; }
  }
  function saveSubscriber(email) {
    const list = getSubscribers();
    if (list.find(s => s.email === email)) return { duplicate: true };
    list.push({ email, date: new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) });
    localStorage.setItem('tbl_subscribers', JSON.stringify(list));
    return { duplicate: false, count: list.length };
  }
  function getSubscriberCount() { return getSubscribers().length; }
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }

  async function sendWelcomeEmail(email) {
    if (!EMAILJS_READY || typeof emailjs === 'undefined') return;
    await emailjs.send(CONFIG.emailjs_service_id, CONFIG.template_welcome,
      { to_email: email, to_name: email.split('@')[0], site_name: CONFIG.site_name });
  }
  async function sendAdminNotify(email, count) {
    if (!EMAILJS_READY || !CONFIG.template_admin_notify || !CONFIG.admin_email) return;
    await emailjs.send(CONFIG.emailjs_service_id, CONFIG.template_admin_notify,
      { subscriber_email: email, subscriber_count: count, admin_email: CONFIG.admin_email, site_name: CONFIG.site_name });
  }

  async function doSubscribe(email, inputEl, btnEl, wrapEl) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !validateEmail(trimmed)) { shakeInput(inputEl); showInputError(inputEl,'Please enter a valid email address.'); return; }
    if (getSubscribers().find(s => s.email === trimmed)) { shakeInput(inputEl); showInputError(inputEl,"You're already subscribed!"); return; }
    setLoading(btnEl, true);
    clearInputError(inputEl);
    try {
      const { count } = saveSubscriber(trimmed);
      sendWelcomeEmail(trimmed).catch(() => {});
      sendAdminNotify(trimmed, count).catch(() => {});
      setLoading(btnEl, false);
      showSuccess(inputEl, btnEl, wrapEl, trimmed);
      updateSubscriberCounts();
      if (typeof buildDashboard === 'function' && document.getElementById('panel-dashboard')?.classList.contains('active')) buildDashboard();
    } catch { setLoading(btnEl, false); showInputError(inputEl,'Something went wrong. Please try again.'); }
  }

  function shakeInput(inp) {
    if (typeof gsap !== 'undefined') gsap.fromTo(inp,{x:-8},{x:0,duration:0.4,ease:'elastic.out(1,0.3)'});
    inp.style.borderColor = '#e31c1c';
    setTimeout(() => { inp.style.borderColor = ''; }, 2000);
  }
  function showInputError(inp, msg) {
    clearInputError(inp);
    const err = document.createElement('p');
    err.className = 'nl-error-msg';
    err.textContent = msg;
    err.style.cssText = 'font-size:11px;color:#e31c1c;font-weight:600;letter-spacing:.04em;margin-top:6px;font-family:Barlow,sans-serif;';
    inp.parentElement.insertAdjacentElement('afterend', err);
    if (typeof gsap !== 'undefined') gsap.fromTo(err,{opacity:0,y:-6},{opacity:1,y:0,duration:0.3});
  }
  function clearInputError(inp) {
    inp.closest('.inl-form,.newsletter-form')?.parentElement?.querySelector('.nl-error-msg')?.remove();
    inp.parentElement?.parentElement?.querySelector('.nl-error-msg')?.remove();
  }
  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) { btn.dataset.orig = btn.textContent; btn.textContent = 'Subscribing…'; btn.disabled = true; btn.style.opacity = '0.7'; }
    else         { btn.textContent = btn.dataset.orig || 'Subscribe'; btn.disabled = false; btn.style.opacity = '1'; }
  }
  function showSuccess(inp, btn, wrap) {
    const parent = wrap || inp.closest('.inl-form,.newsletter-form');
    if (!parent) return;
    const success = document.createElement('div');
    success.style.cssText = 'display:flex;align-items:center;gap:10px;font-family:Barlow,sans-serif;';
    success.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:#e31c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <p style="font-size:13px;font-weight:700;color:#f5f5f5;letter-spacing:.04em;">You're in! 🎉</p>
        <p style="font-size:11px;color:#888;margin-top:2px;">First issue lands in your inbox soon.</p>
      </div>`;
    parent.replaceWith(success);
    if (typeof gsap !== 'undefined') gsap.fromTo(success,{opacity:0,y:10,scale:0.95},{opacity:1,y:0,scale:1,duration:0.5,ease:'back.out(1.5)'});
    launchConfetti(success);
  }
  function launchConfetti(anchor) {
    const rect   = anchor.getBoundingClientRect();
    const colors = ['#e31c1c','#ff6b6b','#fff','#ffcc00','#ff8c42'];
    for (let i = 0; i < 20; i++) {
      const dot  = document.createElement('span');
      const size = Math.random() * 7 + 4;
      dot.style.cssText = `position:fixed;border-radius:${Math.random()>.5?'50%':'2px'};width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};pointer-events:none;z-index:9999;left:${rect.left+rect.width*.3+Math.random()*rect.width*.4}px;top:${rect.top+rect.height*.5}px;`;
      document.body.appendChild(dot);
      if (typeof gsap !== 'undefined') gsap.to(dot,{x:(Math.random()-.5)*160,y:(Math.random()-1.2)*140,rotation:Math.random()*360,opacity:0,duration:.8+Math.random()*.6,ease:'power2.out',delay:Math.random()*.15,onComplete:()=>dot.remove()});
      else setTimeout(() => dot.remove(), 1200);
    }
  }
  function updateSubscriberCounts() {
    const total = 847 + getSubscriberCount();
    document.querySelectorAll('.sbar-value,.cstat-value,.stat-value').forEach(el => {
      if (el.textContent === '847' || el.textContent.includes('847')) el.textContent = total.toString();
    });
    document.querySelectorAll('.inl-note').forEach(el => {
      el.textContent = `Joining ${total} modern men already subscribed.`;
    });
  }
  function wireAllForms() {
    const fi = document.getElementById('newsletter-email');
    const fb = fi?.nextElementSibling;
    if (fi && fb) {
      window.subscribeNewsletter = () => doSubscribe(fi.value, fi, fb, fi.closest('.newsletter-form'));
      fi.addEventListener('keydown', e => { if (e.key === 'Enter') window.subscribeNewsletter(); });
    }
    const hi = document.getElementById('home-newsletter-email');
    const hb = hi?.nextElementSibling;
    if (hi && hb) {
      window.subscribeHome = () => doSubscribe(hi.value, hi, hb, hi.closest('.inl-form'));
      hi.addEventListener('keydown', e => { if (e.key === 'Enter') window.subscribeHome(); });
    }
  }
  function injectSubscriberSection() {
    const dash = document.getElementById('panel-dashboard');
    if (!dash || dash.querySelector('#subscriber-section')) return;
    const sec  = document.createElement('div');
    sec.id     = 'subscriber-section';
    sec.style.marginTop = '2.5rem';
    sec.innerHTML = `
      <div class="section-head" style="margin-bottom:1rem;">
        <p class="section-head-title">Subscribers</p>
        <button class="pill-btn" onclick="exportSubscribers()" style="background:none;border:1px solid rgba(255,255,255,.12);color:#888;font-size:11px;">↓ Export CSV</button>
      </div>
      <div id="subscriber-stats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.75rem;margin-bottom:1.5rem;"></div>
      <div style="overflow-x:auto;border-radius:6px;"><table class="articles-table" id="subscribers-table"></table></div>`;
    dash.appendChild(sec);
    renderSubscriberSection();
  }
  function renderSubscriberSection() {
    const list  = getSubscribers();
    const total = 847 + list.length;
    const statsEl = document.getElementById('subscriber-stats');
    if (statsEl) statsEl.innerHTML = [
      { label:'Total Subscribers', value: total },
      { label:'New (This Session)', value: list.length },
      { label:'Growth Rate', value: list.length > 0 ? `+${((list.length/847)*100).toFixed(1)}%` : '0%' },
    ].map(s => `<div class="stat-card" style="padding:1rem;"><p class="stat-value" style="font-size:26px;">${s.value}</p><p class="stat-label">${s.label}</p></div>`).join('');
    const tbl = document.getElementById('subscribers-table');
    if (!tbl) return;
    if (!list.length) { tbl.innerHTML = `<tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:#888;font-size:13px;">No new subscribers yet.</td></tr></tbody>`; return; }

    function escI(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    tbl.innerHTML = `<thead><tr><th>#</th><th>Email</th><th>Subscribed</th><th>Actions</th></tr></thead><tbody>${
      list.map((s,i) => `<tr><td style="color:#888;font-size:12px;">${i+1}</td><td><strong>${escI(s.email)}</strong></td><td class="tbl-date">${escI(s.date)}</td><td><div class="tbl-actions"><button class="tbl-btn del" onclick="removeSubscriber('${escI(s.email)}')">Remove</button></div></td></tr>`).join('')}</tbody>`;
    if (typeof gsap !== 'undefined') gsap.fromTo(tbl.querySelectorAll('tbody tr'),{opacity:0,x:-16},{opacity:1,x:0,duration:0.35,stagger:0.05,ease:'power2.out'});
  }
  window.removeSubscriber = function (email) {
    const list = getSubscribers().filter(s => s.email !== email);
    localStorage.setItem('tbl_subscribers', JSON.stringify(list));
    renderSubscriberSection();
    updateSubscriberCounts();
    if (typeof showToast === 'function') showToast('🗑️ Subscriber removed.');
  };
  window.exportSubscribers = function () {
    const list = getSubscribers();
    if (!list.length) { if (typeof showToast === 'function') showToast('No subscribers to export.'); return; }
    const csv  = 'Email,Date\n' + list.map(s => `${s.email},${s.date}`).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href:url, download:'tbl_subscribers.csv' });
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('✅ CSV exported.');
  };
  const _origBuild = window.buildDashboard;
  window.buildDashboard = function () {
    if (_origBuild) _origBuild();
    injectSubscriberSection();
    const subStat = document.querySelector('#panel-dashboard .stat-card:nth-child(3) .stat-value');
    if (subStat) subStat.textContent = (847 + getSubscriberCount()).toString();
  };
  window.addEventListener('load', () => {
    wireAllForms();
    updateSubscriberCounts();
    if (document.getElementById('panel-dashboard')?.classList.contains('active')) injectSubscriberSection();
  });
})();

/* ─────────────────────────────────────────────
   GLOBAL EXPORTS — required for inline onclick
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  // Only activate accordion on mobile
  if (window.innerWidth > 768) return;
 
  document.querySelectorAll('.footer-col .footer-col-title').forEach(title => {
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
      const col = title.closest('.footer-col');
      const isOpen = col.classList.contains('open');
      // close all first
      document.querySelectorAll('.footer-col').forEach(c => c.classList.remove('open'));
      // toggle clicked
      if (!isOpen) col.classList.add('open');
    });
  });
});

window.navigate              = navigate;
window.openArticle           = openArticle;
window.openCategory          = openCategory;
window.renderCatPage         = renderCatPage;
window.renderArticlesList    = renderArticlesList;
window.filterArticles        = filterArticles;
window.handleAdminNavClick   = handleAdminNavClick;
window.togglePw              = togglePw;
window.doLogin               = doLogin;
window.doLogout              = doLogout;
window.updateAdminBtn        = updateAdminBtn;
window.openNewArticle        = openNewArticle;
window.openEditArticle       = openEditArticle;
window.saveArticle           = saveArticle;
window.confirmDelete         = confirmDelete;
window.deleteArticle         = deleteArticle;
window.previewThumb          = previewThumb;
window.liveSearch            = liveSearch;
window.liveSearchMobile      = liveSearchMobile;
window.fullSearch            = fullSearch;
window.subscribeNewsletter   = subscribeNewsletter;
window.subscribeHome         = subscribeHome;
window.closeMobile           = closeMobile;
window.showToast             = showToast;
window.buildDashboard        = buildDashboard;
window.buildCards            = buildCards;
window.cardHTML              = cardHTML;
window.initHome              = initHome;
window.initArticlesPage      = initArticlesPage;
window.resetArticlesToDefault = resetArticlesToDefault;
window.persistArticles       = persistArticles;