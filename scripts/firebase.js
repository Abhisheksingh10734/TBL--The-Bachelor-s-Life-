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
   YOUR CONFIG — paste from Firebase console
───────────────────────────────────────────── */
const ENV    = window.__TBL_ENV__ || {};
const CONFIG = {
  apiKey:            ENV.FIREBASE_API_KEY,
  authDomain:        ENV.FIREBASE_AUTH_DOMAIN,
  projectId:         ENV.FIREBASE_PROJECT_ID,
  storageBucket:     ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId:             ENV.FIREBASE_APP_ID,
  measurementId:     ENV.FIREBASE_MEASUREMENT_ID
};
 

/* ─────────────────────────────────────────────
   GUARD — if config is empty, skip Firebase
   and fall back to localStorage silently
───────────────────────────────────────────── */
const FB_READY = !!CONFIG.apiKey && !!CONFIG.projectId;

if (!FB_READY) {
    console.info('TBL Firebase: No config found — using localStorage fallback.');
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
let db = null;
let articlesCol = null;

let auth = null;

if (FB_READY) {
    const app = initializeApp(CONFIG);

    db = getFirestore(app);
    auth = getAuth(app);

    articlesCol = collection(db, 'articles');
}

/* ─────────────────────────────────────────────
   LOAD all articles from Firestore
   Returns array sorted by id ascending
───────────────────────────────────────────── */
async function loadFromFirestore() {
    if (!FB_READY) return null;
    try {
        const q = query(articlesCol, orderBy('id', 'asc'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;          // nothing in DB yet
        return snapshot.docs.map(d => d.data());
    } catch (e) {
        console.warn('TBL Firebase: load failed, using localStorage.', e);
        return null;
    }
}

/* ─────────────────────────────────────────────
   SAVE one article (create or update)
   Uses article.id as the document key
───────────────────────────────────────────── */
async function saveToFirestore(article) {
    if (!FB_READY || !db) return;
    try {
        const ref = doc(articlesCol, String(article.id));
        await setDoc(ref, article);
    } catch (e) {
        console.warn('TBL Firebase: save failed.', e);
    }
}

/* ─────────────────────────────────────────────
   DELETE one article
───────────────────────────────────────────── */
async function deleteFromFirestore(id) {
    if (!FB_READY || !db) return;
    try {
        await deleteDoc(doc(articlesCol, String(id)));
    } catch (e) {
        console.warn('TBL Firebase: delete failed.', e);
    }
}

/* ─────────────────────────────────────────────
   WRITE all 15 default articles to Firestore
   Called automatically if DB is empty
───────────────────────────────────────────── */
async function seedFirestore(articles) {
    if (!FB_READY || !db) return;
    try {
        const batch = writeBatch(db);
        articles.forEach(a => {
            const ref = doc(articlesCol, String(a.id));
            batch.set(ref, a);
        });
        await batch.commit();
        console.info('TBL Firebase: seeded', articles.length, 'default articles.');
    } catch (e) {
        console.warn('TBL Firebase: seed failed.', e);
    }
}

/* ─────────────────────────────────────────────
   REAL-TIME LISTENER
   Updates the live ARTICLES array whenever
   another device changes something in Firestore
───────────────────────────────────────────── */
function startLiveSync() {
    if (!FB_READY || !db) return;

    const q = query(articlesCol, orderBy('id', 'asc'));
    onSnapshot(q, snapshot => {
        if (snapshot.empty) return;

        const fresh = snapshot.docs.map(d => d.data());

        // Only update if something actually changed
        if (JSON.stringify(fresh) === JSON.stringify(window.ARTICLES)) return;

        // Sync live array
        window.ARTICLES.length = 0;
        fresh.forEach(a => window.ARTICLES.push(a));

        // Persist to localStorage as offline cache
        try {
            localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES));
        } catch (_) { }

        // Rebuild any open UI that shows articles
        if (typeof buildDashboard === 'function' &&
            document.getElementById('panel-dashboard')?.classList.contains('active')) {
            buildDashboard();
            showToast?.('🔄 Articles synced from cloud.');
        }
        if (typeof filterArticles === 'function' &&
            document.getElementById('panel-articles')?.classList.contains('active')) {
            filterArticles(window._articlesListFilter || 'all');
        }
        if (typeof initHome === 'function' &&
            document.getElementById('panel-home')?.classList.contains('active')) {
            initHome();
        }
    }, err => {
        console.warn('TBL Firebase: live sync error.', err);
    });
}

/* ─────────────────────────────────────────────
   PATCH script.js functions
   Waits for window.load so script.js has run
───────────────────────────────────────────── */
window.addEventListener('load', async () => {

    /* ── 1. Replace persistArticles with Firestore version ── */
    window.persistArticles = function () {
        // Always keep localStorage as offline cache
        try {
            localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES));
        } catch (_) { }
        // Fire-and-forget sync to Firestore — no need to await
        if (FB_READY) {
            window.ARTICLES.forEach(a => saveToFirestore(a));
        }
    };

    /* ── 2. Replace deleteArticle with Firestore version ── */
    const _origDelete = window.deleteArticle;
    window.deleteArticle = function (id) {
        const articleId = window.ARTICLES[id]?.id;        // capture before splice
        if (_origDelete) _origDelete(id);                  // does splice + reindex + buildDashboard
        if (FB_READY && articleId !== undefined) {
            deleteFromFirestore(articleId).then(() => {
                // After delete, rewrite all remaining docs with new IDs
                window.ARTICLES.forEach(a => saveToFirestore(a));
            });
        }
    };

    /* ── 3. Replace resetArticlesToDefault with Firestore version ── */
    const _origReset = window.resetArticlesToDefault;
    window.resetArticlesToDefault = function () {
        if (!confirm('Reset all articles to the 15 default articles? This cannot be undone.')) return;
        const defaults = window.DEFAULT_ARTICLES || [];
        window.ARTICLES.length = 0;
        defaults.forEach((a, i) => window.ARTICLES.push({ ...a, id: i }));
        // Save locally
        try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }
        // Overwrite Firestore
        if (FB_READY) seedFirestore(window.ARTICLES);
        if (typeof buildDashboard === 'function') buildDashboard();
        if (typeof showToast === 'function') showToast('✅ Articles reset to defaults.');
        if (typeof navigate === 'function') navigate('dashboard');
    };

    /* ── 4. Initial load from Firestore ── */
    if (FB_READY && window.ARTICLES) {
        showLoadingOverlay(true);

        const cloudArticles = await loadFromFirestore();

        if (cloudArticles && cloudArticles.length > 0) {
            // Cloud has data — use it
            window.ARTICLES.length = 0;
            cloudArticles.forEach(a => window.ARTICLES.push(a));
            try { localStorage.setItem('tbl_articles', JSON.stringify(window.ARTICLES)); } catch (_) { }
            console.info('TBL Firebase: loaded', cloudArticles.length, 'articles from cloud.');
        } else {
            // Cloud is empty — seed it with current articles (from localStorage or defaults)
            await seedFirestore(window.ARTICLES);
        }

        showLoadingOverlay(false);

        // Rebuild UI with fresh data
        if (typeof buildCards === 'function') {
            buildCards('home-cards', window.ARTICLES.slice(0, 3));
            buildCards('articles-cards', window.ARTICLES.slice(3, 7));
        }
        if (typeof initHome === 'function') initHome();
        if (typeof initArticlesPage === 'function') initArticlesPage();

        // Start listening for real-time changes from other devices
        startLiveSync();
    }
});

// window._tblFirebase.onAuthStateChanged(
//   window._tblFirebase.auth,
//   user => {

//     if (user) {

//       isLoggedIn = true;

//       updateAdminBtn();

//     } else {

//       isLoggedIn = false;

//       updateAdminBtn();
//     }
//   }
// );

/* ─────────────────────────────────────────────
   LOADING OVERLAY
   Shown during the initial cloud fetch
───────────────────────────────────────────── */
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
      <div style="
        width:40px; height:40px; border-radius:50%;
        border:3px solid rgba(255,255,255,0.1);
        border-top-color:#e31c1c;
        animation:tbl-spin 0.8s linear infinite;
      "></div>
      <p style="font-family:'Barlow',sans-serif;font-size:13px;
        font-weight:600;letter-spacing:.1em;text-transform:uppercase;
        color:#888;">Loading articles…</p>
      <style>
        @keyframes tbl-spin { to { transform:rotate(360deg); } }
      </style>
    `;
        document.body.appendChild(el);
    } else if (el && !show) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease';
        setTimeout(() => el?.remove(), 320);
    }
}

/* ─────────────────────────────────────────────
   EXPORT helpers so other scripts can use them
───────────────────────────────────────────── */
window._tblFirebase = { saveToFirestore, deleteFromFirestore, seedFirestore, FB_READY };

window._tblFirebase.auth = auth;
window._tblFirebase.signInWithEmailAndPassword = signInWithEmailAndPassword;
window._tblFirebase.onAuthStateChanged = onAuthStateChanged;
window._tblFirebase.signOut = signOut;

export {
  auth,
  db,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};