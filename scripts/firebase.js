import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, getDocs,
  doc, setDoc, deleteDoc, writeBatch,
  onSnapshot, orderBy, query
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/* ─────────────────────────────────────────────
   CONFIG — populated by build.js via env.js
───────────────────────────────────────────── */
const ENV = window.__TBL_ENV__ || {};
const CONFIG = {
  apiKey: ENV.FIREBASE_API_KEY || 'AIzaSyCl-Q5lcV4um3MAKUgK-w3Nja8-opix2hI',
  authDomain: ENV.FIREBASE_AUTH_DOMAIN || 'tbl-site-e6127.firebaseapp.com',
  projectId: ENV.FIREBASE_PROJECT_ID || 'tbl-site-e6127',
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET || 'tbl-site-e6127.firebasestorage.app',
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID || '286603863322',
  appId: ENV.FIREBASE_APP_ID || '1:286603863322:web:410c3fe278e3299dd078a3',
};

/* ─────────────────────────────────────────────
   GUARD — skip Firebase entirely if not configured
───────────────────────────────────────────── */
const FB_READY = !!CONFIG.apiKey && !!CONFIG.projectId;

if (!FB_READY) {
  console.info('TBL Firebase: No config — localStorage only.');
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
let db = null;
let auth = null;
let articlesCol = null;

if (FB_READY) {
  try {
    const app = initializeApp(CONFIG);
    db = getFirestore(app);
    auth = getAuth(app);
    articlesCol = collection(db, 'articles');
  } catch (e) {
    console.warn('TBL Firebase: init failed.', e);
  }
}

/* ─────────────────────────────────────────────
   FIRESTORE HELPERS
───────────────────────────────────────────── */
async function loadFromFirestore() {
  if (!FB_READY || !db) return null;
  try {
    const snapshot = await getDocs(query(articlesCol, orderBy('id', 'asc')));
    if (snapshot.empty) return null;
    return snapshot.docs.map(d => d.data());
  } catch (e) {
    console.warn('TBL Firebase: load failed.', e);
    return null;
  }
}

async function saveToFirestore(article) {
  if (!FB_READY || !db) return;
  try {
    await setDoc(doc(articlesCol, String(article.id)), article);
  } catch (e) {
    console.warn('TBL Firebase: save failed.', e);
  }
}

async function deleteFromFirestore(id) {
  if (!FB_READY || !db) return;
  try {
    await deleteDoc(doc(articlesCol, String(id)));
  } catch (e) {
    console.warn('TBL Firebase: delete failed.', e);
  }
}

async function seedFirestore(articles) {
  if (!FB_READY || !db) return;
  try {
    const batch = writeBatch(db);
    articles.forEach(a => batch.set(doc(articlesCol, String(a.id)), a));
    await batch.commit();
    console.info('TBL Firebase: seeded', articles.length, 'articles.');
  } catch (e) {
    console.warn('TBL Firebase: seed failed.', e);
  }
}

/* ─────────────────────────────────────────────
   REAL-TIME SYNC
───────────────────────────────────────────── */
function startLiveSync() {
  if (!FB_READY || !db) return;

  onSnapshot(query(articlesCol, orderBy('id', 'asc')), snapshot => {
    if (snapshot.empty) return;
    const fresh = snapshot.docs.map(d => d.data());
    if (JSON.stringify(fresh) === JSON.stringify(window.ARTICLES)) return;

    window.ARTICLES.length = 0;
    fresh.forEach(a => window.ARTICLES.push(a));
    try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }

    if (typeof buildDashboard === 'function' &&
      document.getElementById('panel-dashboard')?.classList.contains('active')) {
      buildDashboard();
      if (typeof showToast === 'function') showToast('🔄 Articles synced.');
    }
    if (typeof filterArticles === 'function' &&
      document.getElementById('panel-articles')?.classList.contains('active')) {
      filterArticles(window._articlesListFilter || 'all');
    }
    if (typeof initHome === 'function' &&
      document.getElementById('panel-home')?.classList.contains('active')) {
      initHome();
    }
  }, err => console.warn('TBL Firebase: live sync error.', err));
}

/* ─────────────────────────────────────────────
   LOADING OVERLAY
   BUG FIX — try/finally + 6-second hard timeout
───────────────────────────────────────────── */
let _overlayTimeout = null;

function showLoadingOverlay(show) {
  let el = document.getElementById('tbl-fb-loader');

  if (!el && show) {
    el = document.createElement('div');
    el.id = 'tbl-fb-loader';
    el.style.cssText = `
      position:fixed; inset:0; background:rgba(10,10,10,0.85);
      z-index:99999; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:1rem;
    `;
    el.innerHTML = `
      <div style="width:40px;height:40px;border-radius:50%;
        border:3px solid rgba(255,255,255,0.1);border-top-color:#e31c1c;
        animation:tbl-spin 0.8s linear infinite;"></div>
      <p style="font-family:'Barlow',sans-serif;font-size:13px;
        font-weight:600;letter-spacing:.1em;text-transform:uppercase;
        color:#888;margin:0;">Loading articles…</p>
      <style>@keyframes tbl-spin{to{transform:rotate(360deg);}}</style>
    `;
    document.body.appendChild(el);

    /* Hard timeout — overlay ALWAYS closes after 6 s */
    _overlayTimeout = setTimeout(() => {
      console.warn('TBL Firebase: loader timeout — forcing close.');
      showLoadingOverlay(false);
    }, 6000);

  } else if (el && !show) {
    if (_overlayTimeout) { clearTimeout(_overlayTimeout); _overlayTimeout = null; }
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(() => el?.remove(), 320);
  }
}

/* ─────────────────────────────────────────────
   MAIN LOAD LISTENER
───────────────────────────────────────────── */
window.addEventListener('load', async () => {

  /* ── Patch 1: persistArticles ── */
  window.persistArticles = function () {
    try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }
    if (FB_READY) window.ARTICLES.forEach(a => saveToFirestore(a));
  };

  /* ── Patch 2: deleteArticle ── */
  const _origDelete = window.deleteArticle;
  window.deleteArticle = function (id) {
    const articleId = window.ARTICLES.find(a => a.id == id)?.id;
    if (_origDelete) _origDelete(id);
    if (FB_READY && articleId !== undefined) {
      deleteFromFirestore(articleId).then(() => {
        window.ARTICLES.forEach(a => saveToFirestore(a));
      });
    }
  };

  /* ── Patch 3: resetArticlesToDefault ── */
  window.resetArticlesToDefault = function () {
    if (!confirm('Reset all articles to defaults? This cannot be undone.')) return;
    const defaults = window.DEFAULT_ARTICLES || [];
    window.ARTICLES.length = 0;
    defaults.forEach((a, i) => window.ARTICLES.push({ ...a, id: i }));
    try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }
    if (FB_READY) seedFirestore(window.ARTICLES);
    if (typeof buildDashboard === 'function') buildDashboard();
    if (typeof showToast === 'function') showToast('✅ Articles reset to defaults.');
    if (typeof navigate === 'function') navigate('dashboard');
  };

  /* ── Auth state listener ── */
  if (auth) {
    onAuthStateChanged(auth, user => {
      window.isLoggedIn = !!user;
      if (typeof updateAdminBtn === 'function') updateAdminBtn();

      if (user) {
        // Reset the login button in case it's stuck on "Signing in…"
        const btn = document.getElementById('login-btn');
        if (btn) {
          btn.textContent = 'Sign In';
          btn.classList.remove('loading');
        }

        if (typeof buildDashboard === 'function') buildDashboard();

        // Only navigate if currently on the login page
        const loginPanel = document.getElementById('panel-adminlogin');
        if (loginPanel?.classList.contains('active')) {
          if (typeof navigate === 'function') navigate('dashboard');
        }
      }
    });
  }

  /* ── BUG FIX — skip Firestore load if not configured ── */
  if (!FB_READY || !window.ARTICLES) return;

  /* ── BUG FIX — try/finally so overlay ALWAYS closes ── */
  showLoadingOverlay(true);
  try {
    const cloudArticles = await loadFromFirestore();
    if (cloudArticles && cloudArticles.length > 0) {
      window.ARTICLES.length = 0;
      cloudArticles.forEach(a => window.ARTICLES.push(a));
      try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }
      console.info('TBL Firebase: loaded', cloudArticles.length, 'articles from cloud.');
    } else {
      await seedFirestore(window.ARTICLES);
    }
  } catch (e) {
    console.warn('TBL Firebase: initial load error — keeping localStorage data.', e);
  } finally {
    showLoadingOverlay(false);   /* always runs */
  }

  /* Rebuild UI with synced data */
  if (typeof buildCards === 'function') {
    buildCards('home-cards', window.ARTICLES.slice(0, 3));
    buildCards('articles-cards', window.ARTICLES.slice(3, 7));
  }
  if (typeof initHome === 'function') initHome();
  if (typeof initArticlesPage === 'function') initArticlesPage();

  startLiveSync();
});

/* ─────────────────────────────────────────────
   EXPORTS — used by script.js doLogin/doLogout
───────────────────────────────────────────── */
export { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut };

window._tblFirebase = { saveToFirestore, deleteFromFirestore, seedFirestore, FB_READY, auth };