const DEFAULT_SETTINGS = {
  instagramBlockAll: false,
  instagramMessagesOnly: true,
  instagramBlockReels: true,
  instagramBlockStories: true,
  instagramBlockExplore: true,
  instagramBlockFeed: true,
  instagramBlockSearch: true,
  instagramRedirectHomeToInbox: true,
  youtubeBlockAll: false,
  youtubeHideThumbnails: true,
  youtubeBlockShorts: true,
  youtubeSearchOnlyHome: false,
  tiktokBlockAll: false
};

const SITE = detectSite();
const STYLE_ID = "focus-shield-style";
const OVERLAY_ID = "focus-shield-overlay";
const OVERLAY_TITLE_ID = "focus-shield-overlay-title";
const OVERLAY_BODY_ID = "focus-shield-overlay-body";
const YOUTUBE_HOME_NOTE_ID = "focus-shield-youtube-home-note";
const HIDDEN_ATTR = "data-focus-shield-hidden";
const INBOX_PATH = "/direct/inbox/";
const YOUTUBE_HOME_PATH = "/";
const WINDOW_NAVIGATION_EVENTS = [
  "popstate",
  "hashchange",
  "pageshow"
];
const DOCUMENT_NAVIGATION_EVENTS = {
  youtube: [
    "yt-navigate-finish",
    "yt-page-data-updated"
  ]
};

const INSTAGRAM_ALLOWED_PREFIXES = [
  "/direct",
  "/accounts/login",
  "/challenge",
  "/session"
];

const INSTAGRAM_SELECTORS = {
  main: "main, [role='main']",
  feedArticles: "article",
  storyTray: "div[data-pagelet='story_tray'], section main canvas + div, [aria-label*='Stories']",
  searchInputs: "input[aria-label='Search input'], input[placeholder='Search']",
  navLinks: {
    reels: "a[href*='/reels/']",
    explore: "a[href='/explore/'], a[href^='/explore/']",
    search: "a[href='/explore/'], a[href^='/explore/']"
  }
};

const YOUTUBE_SELECTORS = {
  appShell: [
    "ytd-app",
    "ytm-app"
  ].join(", "),
  homeFeed: [
    "ytd-browse[page-subtype='home']",
    "ytd-rich-grid-renderer",
    "ytd-two-column-browse-results-renderer",
    "#contents.ytd-rich-grid-renderer"
  ].join(", "),
  sidebars: [
    "ytd-guide-renderer",
    "ytd-mini-guide-renderer",
    "#guide",
    "#mini-guide"
  ].join(", "),
  thumbnails: [
    "ytd-thumbnail",
    "a#thumbnail",
    "yt-image-banner-view-model",
    "ytd-playlist-thumbnail",
    ".yt-lockup-view-model-wiz__content-image",
    "yt-thumbnail-view-model",
    "ytd-hero-playlist-thumbnail"
  ].join(", "),
  shortsLinks: [
    "a[href='/shorts']",
    "a[href^='/shorts/']",
    "a[href='/feed/shorts']",
    "a[href^='/feed/shorts']",
    "a[href*='://www.youtube.com/shorts/']",
    "a[href*='://m.youtube.com/shorts/']",
    "a[href*='://www.youtube.com/feed/shorts']",
    "a[href*='://m.youtube.com/feed/shorts']",
    "a[title='Shorts']",
    "a[aria-label='Shorts']"
  ].join(", "),
  shortsShelves: [
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-shorts",
    "ytm-shorts-lockup-view-model"
  ].join(", ")
};

let settings = { ...DEFAULT_SETTINGS };
let observerStarted = false;
let navigationHooksStarted = false;
let redirectScheduled = false;
let lastRedirectTarget = "";
let applyQueued = false;
let activeStorageArea = "sync";

function matchesHostname(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function getCurrentOriginPath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalizedPath}`;
}

function detectSite() {
  const host = window.location.hostname;

  if (matchesHostname(host, "instagram.com")) {
    return "instagram";
  }

  if (matchesHostname(host, "youtube.com")) {
    return "youtube";
  }

  if (matchesHostname(host, "tiktok.com")) {
    return "tiktok";
  }

  return "other";
}

function getStorageArea(areaName = activeStorageArea) {
  return chrome.storage?.[areaName] ?? null;
}

function callStorage(areaName, method, ...args) {
  const area = getStorageArea(areaName);

  if (!area || typeof area[method] !== "function") {
    return Promise.reject(new Error(`Storage area ${areaName} is unavailable.`));
  }

  return new Promise((resolve, reject) => {
    area[method](...args, (result) => {
      const error = chrome.runtime?.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(result);
    });
  });
}

async function detectStorageArea() {
  for (const areaName of ["sync", "local"]) {
    try {
      await callStorage(areaName, "get", {});
      activeStorageArea = areaName;
      return areaName;
    } catch (error) {
      continue;
    }
  }

  throw new Error("No Chrome storage area is available.");
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [${HIDDEN_ATTR}="true"] {
      display: none !important;
    }

    body.focus-shield-hide-instagram main,
    body.focus-shield-hide-instagram section main,
    body.focus-shield-hide-instagram article {
      visibility: hidden !important;
    }

    body.focus-shield-youtube-thumbnails-off ytd-thumbnail,
    body.focus-shield-youtube-thumbnails-off a#thumbnail,
    body.focus-shield-youtube-thumbnails-off yt-image-banner-view-model,
    body.focus-shield-youtube-thumbnails-off ytd-playlist-thumbnail,
    body.focus-shield-youtube-thumbnails-off .yt-lockup-view-model-wiz__content-image,
    body.focus-shield-youtube-thumbnails-off yt-thumbnail-view-model,
    body.focus-shield-youtube-thumbnails-off ytd-hero-playlist-thumbnail {
      display: none !important;
    }

    body.focus-shield-youtube-thumbnails-off ytd-video-renderer,
    body.focus-shield-youtube-thumbnails-off ytd-grid-video-renderer,
    body.focus-shield-youtube-thumbnails-off ytd-rich-item-renderer,
    body.focus-shield-youtube-thumbnails-off ytd-compact-video-renderer,
    body.focus-shield-youtube-thumbnails-off ytd-playlist-renderer,
    body.focus-shield-youtube-thumbnails-off ytd-radio-renderer {
      display: block !important;
      margin-left: 0 !important;
      padding-left: 0 !important;
      min-height: auto !important;
    }

    body.focus-shield-youtube-thumbnails-off ytd-rich-grid-media,
    body.focus-shield-youtube-thumbnails-off #dismissible.ytd-rich-grid-media,
    body.focus-shield-youtube-thumbnails-off #details {
      display: block !important;
    }

    body.focus-shield-youtube-search-only ytd-browse[page-subtype='home'],
    body.focus-shield-youtube-search-only ytd-rich-grid-renderer,
    body.focus-shield-youtube-search-only ytd-two-column-browse-results-renderer,
    body.focus-shield-youtube-search-only #contents.ytd-rich-grid-renderer,
    body.focus-shield-youtube-search-only ytd-guide-renderer,
    body.focus-shield-youtube-search-only ytd-mini-guide-renderer,
    body.focus-shield-youtube-search-only #guide,
    body.focus-shield-youtube-search-only #mini-guide {
      display: none !important;
    }

    #${OVERLAY_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at top left, rgba(255, 214, 153, 0.55), transparent 36%),
        linear-gradient(135deg, #fff8ee 0%, #fff 48%, #f4f6fb 100%);
      color: #111827;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #${OVERLAY_ID}[hidden] {
      display: none !important;
    }

    #${OVERLAY_ID} .focus-shield-card {
      max-width: 480px;
      width: 100%;
      padding: 28px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 22px 50px rgba(17, 24, 39, 0.14);
      border: 1px solid rgba(17, 24, 39, 0.08);
      text-align: center;
    }

    #${OVERLAY_ID} .focus-shield-eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 0 12px;
      margin-bottom: 14px;
      border-radius: 999px;
      background: rgba(17, 24, 39, 0.06);
      color: #4338ca;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    #${OVERLAY_ID} h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.1;
    }

    #${OVERLAY_ID} p {
      margin: 0 0 18px;
      font-size: 15px;
      line-height: 1.5;
      color: #374151;
    }

    #${OVERLAY_ID} .focus-shield-detail,
    #${OVERLAY_ID} .focus-shield-note {
      font-size: 14px;
    }

    #${OVERLAY_ID} .focus-shield-detail {
      margin-bottom: 14px;
      color: #4b5563;
    }

    #${OVERLAY_ID} .focus-shield-note {
      margin-bottom: 0;
      color: #6b7280;
    }

    #${OVERLAY_ID} .focus-shield-actions {
      margin: 22px 0 18px;
    }

    #${OVERLAY_ID} a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      background: #111827;
      color: white;
      text-decoration: none;
      font-weight: 700;
    }

    #${YOUTUBE_HOME_NOTE_ID} {
      position: fixed;
      top: 92px;
      left: 50%;
      z-index: 2147483646;
      width: min(460px, calc(100vw - 32px));
      padding: 18px 20px;
      border: 1px solid rgba(17, 24, 39, 0.08);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 20px 44px rgba(17, 24, 39, 0.14);
      transform: translateX(-50%);
      color: #111827;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    #${YOUTUBE_HOME_NOTE_ID}[hidden] {
      display: none !important;
    }

    #${YOUTUBE_HOME_NOTE_ID} .focus-shield-inline-eyebrow {
      margin: 0 0 8px;
      color: #4338ca;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    #${YOUTUBE_HOME_NOTE_ID} h2 {
      margin: 0 0 8px;
      font-size: 22px;
      line-height: 1.15;
      letter-spacing: -0.03em;
    }

    #${YOUTUBE_HOME_NOTE_ID} p {
      margin: 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.5;
    }
  `;

  document.documentElement.appendChild(style);
}

function hideElements(selector) {
  document.querySelectorAll(selector).forEach((node) => {
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN_ATTR, "true");
  });
}

function resetHiddenElements() {
  document.querySelectorAll(`[${HIDDEN_ATTR}='true']`).forEach((node) => {
    node.style.removeProperty("display");
    node.removeAttribute(HIDDEN_ATTR);
  });
}

function ensureOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-live", "assertive");
    overlay.tabIndex = -1;
    overlay.hidden = true;
    document.documentElement.appendChild(overlay);
  }

  return overlay;
}

function ensureYouTubeHomeNote() {
  let note = document.getElementById(YOUTUBE_HOME_NOTE_ID);

  if (!note) {
    note = document.createElement("div");
    note.id = YOUTUBE_HOME_NOTE_ID;
    note.setAttribute("role", "status");
    note.setAttribute("aria-live", "polite");
    note.hidden = true;
    document.documentElement.appendChild(note);
  }

  return note;
}

function showYouTubeHomeNote() {
  const note = ensureYouTubeHomeNote();
  note.innerHTML = `
    <p class="focus-shield-inline-eyebrow">Fokus</p>
    <h2>Accueil YouTube calme</h2>
    <p>Les recommandations sont masqu\u00E9es ici. Utilise la barre de recherche pour ouvrir uniquement ce dont tu as besoin.</p>
  `;
  note.hidden = false;
}

function hideYouTubeHomeNote() {
  const note = ensureYouTubeHomeNote();
  note.hidden = true;
  note.innerHTML = "";
}

function renderOverlay({ title, body, detail, note, ctaHref, ctaLabel }) {
  const overlay = ensureOverlay();
  const linkMarkup = ctaHref && ctaLabel
    ? `<a href="${ctaHref}">${ctaLabel}</a>`
    : "";

  overlay.innerHTML = `
    <div class="focus-shield-card">
      <p class="focus-shield-eyebrow">Fokus</p>
      <h1 id="${OVERLAY_TITLE_ID}">${title}</h1>
      <p id="${OVERLAY_BODY_ID}">${body}</p>
      ${detail ? `<p class="focus-shield-detail">${detail}</p>` : ""}
      ${linkMarkup ? `<div class="focus-shield-actions">${linkMarkup}</div>` : ""}
      ${note ? `<p class="focus-shield-note">${note}</p>` : ""}
    </div>
  `;
  overlay.setAttribute("aria-labelledby", OVERLAY_TITLE_ID);
  overlay.setAttribute("aria-describedby", OVERLAY_BODY_ID);
  overlay.hidden = false;

  requestAnimationFrame(() => {
    const primaryAction = overlay.querySelector("a");

    if (primaryAction instanceof HTMLElement) {
      primaryAction.focus();
      return;
    }

    overlay.focus();
  });
}

function hideOverlay() {
  const overlay = ensureOverlay();
  overlay.hidden = true;
  overlay.innerHTML = "";
}

function queueApplyAll() {
  if (applyQueued) {
    return;
  }

  applyQueued = true;
  requestAnimationFrame(() => {
    applyQueued = false;
    applyAll();
  });
}

function pathAllowedInInstagramMessagesOnly(path) {
  return INSTAGRAM_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isYouTubeShortsPath(path) {
  return path === "/feed/shorts" || path.startsWith("/feed/shorts/") || path.startsWith("/shorts");
}

function applyInstagram() {
  document.body?.classList.remove("focus-shield-hide-instagram");
  const shouldHideReelsEntry = settings.instagramBlockReels || settings.instagramMessagesOnly;
  const shouldHideExploreEntry = settings.instagramBlockExplore || settings.instagramMessagesOnly;
  const shouldHideSearchEntry = settings.instagramBlockSearch || settings.instagramMessagesOnly;

  if (window.location.pathname === INBOX_PATH) {
    redirectScheduled = false;
    lastRedirectTarget = "";
  }

  if (settings.instagramBlockAll) {
    renderOverlay({
      title: "Instagram est coup\u00E9 pour l'instant",
      body: "Fokus bloque cette surface pour t'aider \u00E0 rester hors du flux.",
      note: "Tu peux modifier ce choix \u00E0 tout moment depuis le popup de l'extension."
    });
    document.body?.classList.add("focus-shield-hide-instagram");
    return;
  }

  hideOverlay();

  if (shouldHideReelsEntry) {
    hideElements(INSTAGRAM_SELECTORS.navLinks.reels);
  }

  if (shouldHideExploreEntry) {
    hideElements(INSTAGRAM_SELECTORS.navLinks.explore);
  }

  if (shouldHideSearchEntry) {
    hideElements(INSTAGRAM_SELECTORS.navLinks.search);
    hideElements(INSTAGRAM_SELECTORS.searchInputs);
  }

  if (settings.instagramBlockStories) {
    hideElements(INSTAGRAM_SELECTORS.storyTray);
    if (window.location.pathname.startsWith("/stories")) {
      hideElements(INSTAGRAM_SELECTORS.main);
    }
  }

  if (settings.instagramBlockReels && window.location.pathname.startsWith("/reels")) {
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (settings.instagramBlockExplore && window.location.pathname.startsWith("/explore")) {
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (settings.instagramBlockFeed && window.location.pathname === "/") {
    hideElements(INSTAGRAM_SELECTORS.feedArticles);
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (!settings.instagramMessagesOnly) {
    return;
  }

  const path = window.location.pathname;
  const allowed = pathAllowedInInstagramMessagesOnly(path);
  document.body?.classList.toggle("focus-shield-hide-instagram", !allowed);

  if (!allowed) {
    renderOverlay({
      title: "Mode messages actif",
      body: "Seule la messagerie reste accessible dans cette configuration Fokus.",
      detail: "Le feed, Explore, Stories et Reels restent masqu\u00E9s pour limiter les d\u00E9tours.",
      ctaHref: INBOX_PATH,
      ctaLabel: "Ouvrir la messagerie",
      note: "D\u00E9sactive ce mode dans le popup si tu veux retrouver le reste d'Instagram."
    });
  } else {
    hideOverlay();
  }

  if (!allowed && settings.instagramRedirectHomeToInbox) {
    const isSafeToRedirect = !["/accounts/login", "/challenge"].some((prefix) => path.startsWith(prefix));

    if (
      isSafeToRedirect &&
      path !== INBOX_PATH &&
      !redirectScheduled &&
      lastRedirectTarget !== path
    ) {
      redirectScheduled = true;
      lastRedirectTarget = path;
      window.location.replace(INBOX_PATH);
    }
  }
}

function applyYouTube() {
  document.body?.classList.remove("focus-shield-youtube-thumbnails-off");
  document.body?.classList.remove("focus-shield-youtube-search-only");
  hideYouTubeHomeNote();

  if (settings.youtubeBlockAll) {
    renderOverlay({
      title: "YouTube est en pause",
      body: "Cette surface est bloqu\u00E9e pour \u00E9viter les recommandations et l'encha\u00EEnement passif.",
      note: "Tu peux rouvrir YouTube depuis le popup Fokus quand tu en as vraiment besoin."
    });
    hideElements(YOUTUBE_SELECTORS.appShell);
    return;
  }

  hideOverlay();

  if (settings.youtubeHideThumbnails) {
    document.body?.classList.add("focus-shield-youtube-thumbnails-off");
    hideElements(YOUTUBE_SELECTORS.thumbnails);
  }

  if (settings.youtubeBlockShorts) {
    hideElements(YOUTUBE_SELECTORS.shortsLinks);
    hideElements(YOUTUBE_SELECTORS.shortsShelves);

    if (isYouTubeShortsPath(window.location.pathname)) {
      renderOverlay({
        title: "Shorts est bloqu\u00E9",
        body: "Fokus coupe ce flux vertical pour \u00E9viter l'encha\u00EEnement rapide des vid\u00E9os.",
        detail: "Tu peux toujours utiliser la recherche, les abonnements ou une vid\u00E9o pr\u00E9cise sans ouvrir Shorts.",
        ctaHref: getCurrentOriginPath(YOUTUBE_HOME_PATH),
        ctaLabel: settings.youtubeSearchOnlyHome ? "Retour \u00E0 l'accueil calme" : "Revenir \u00E0 YouTube",
        note: "D\u00E9sactive ce filtre dans le popup si tu veux r\u00E9autoriser Shorts."
      });
      hideElements(YOUTUBE_SELECTORS.appShell);
      return;
    }
  }

  if (settings.youtubeSearchOnlyHome && window.location.pathname === "/") {
    document.body?.classList.add("focus-shield-youtube-search-only");
    hideElements(YOUTUBE_SELECTORS.homeFeed);
    hideElements(YOUTUBE_SELECTORS.sidebars);
    showYouTubeHomeNote();
  }
}

function applyTikTok() {
  if (settings.tiktokBlockAll) {
    renderOverlay({
      title: "TikTok est coup\u00E9",
      body: "Fokus bloque TikTok enti\u00E8rement dans cette configuration.",
      note: "Tu peux r\u00E9autoriser l'acc\u00E8s plus tard depuis le popup si ton besoin change."
    });
    hideElements("body > *:not(#focus-shield-overlay):not(style)");
    return;
  }

  hideOverlay();
}

function applySiteRules() {
  if (SITE === "instagram") {
    applyInstagram();
  } else if (SITE === "youtube") {
    applyYouTube();
  } else if (SITE === "tiktok") {
    applyTikTok();
  }
}

function applyAll() {
  ensureStyle();
  resetHiddenElements();
  hideOverlay();
  hideYouTubeHomeNote();
  applySiteRules();
}

async function readSettings() {
  const stored = await callStorage(activeStorageArea, "get", DEFAULT_SETTINGS);
  settings = { ...DEFAULT_SETTINGS, ...stored };
}

function startObserver() {
  if (observerStarted) {
    return;
  }

  const observer = new MutationObserver(() => {
    queueApplyAll();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  observerStarted = true;
}

function startNavigationHooks() {
  if (navigationHooksStarted) {
    return;
  }

  const queueNavigationReapply = () => {
    queueApplyAll();
  };
  const wrap = (methodName) => {
    const original = history[methodName];
    history[methodName] = function wrappedHistoryState(...args) {
      const result = original.apply(this, args);
      queueMicrotask(queueApplyAll);
      return result;
    };
  };

  wrap("pushState");
  wrap("replaceState");
  WINDOW_NAVIGATION_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, queueNavigationReapply);
  });

  const documentEvents = DOCUMENT_NAVIGATION_EVENTS[SITE] ?? [];

  documentEvents.forEach((eventName) => {
    // Some SPA surfaces, especially YouTube, expose their own route lifecycle events.
    document.addEventListener(eventName, queueNavigationReapply);
  });
  navigationHooksStarted = true;
}

async function initialize() {
  if (SITE === "other") {
    return;
  }

  try {
    await detectStorageArea();
    await readSettings();
    ensureStyle();
    startObserver();
    startNavigationHooks();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyAll, { once: true });
    } else {
      applyAll();
    }
  } catch (error) {
    console.error("Fokus: content initialization failed", error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== activeStorageArea) {
    return;
  }

  Object.keys(changes).forEach((key) => {
    settings[key] = changes[key].newValue;
  });

  queueApplyAll();
});

initialize();
