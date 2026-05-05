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
  youtubeSearchOnlyHome: false,
  tiktokBlockAll: false
};

const SITE = detectSite();
const STYLE_ID = "focus-shield-style";
const OVERLAY_ID = "focus-shield-overlay";
const HIDDEN_ATTR = "data-focus-shield-hidden";
const INBOX_PATH = "/direct/inbox/";

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
    "yt-lockup-view-model-wiz__content-image",
    "yt-thumbnail-view-model",
    "ytd-hero-playlist-thumbnail",
    "ytd-reel-shelf-renderer"
  ].join(", ")
};

let settings = { ...DEFAULT_SETTINGS };
let observerStarted = false;
let navigationHooksStarted = false;
let redirectScheduled = false;
let lastRedirectTarget = "";
let applyQueued = false;

function detectSite() {
  const host = window.location.hostname;

  if (host.includes("instagram.com")) {
    return "instagram";
  }

  if (host.includes("youtube.com")) {
    return "youtube";
  }

  if (host.includes("tiktok.com")) {
    return "tiktok";
  }

  return "other";
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
      font-family: Arial, sans-serif;
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
    overlay.hidden = true;
    document.documentElement.appendChild(overlay);
  }

  return overlay;
}

function renderOverlay({ title, body, ctaHref, ctaLabel }) {
  const overlay = ensureOverlay();
  const linkMarkup = ctaHref && ctaLabel
    ? `<a href="${ctaHref}">${ctaLabel}</a>`
    : "";

  overlay.innerHTML = `
    <div class="focus-shield-card">
      <h1>${title}</h1>
      <p>${body}</p>
      ${linkMarkup}
    </div>
  `;
  overlay.hidden = false;
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

function applyInstagram() {
  document.body?.classList.remove("focus-shield-hide-instagram");

  if (window.location.pathname === INBOX_PATH) {
    redirectScheduled = false;
    lastRedirectTarget = "";
  }

  if (settings.instagramBlockAll) {
    renderOverlay({
      title: "Instagram est bloque",
      body: "Cette surface est coupee pour garder ton attention la ou tu l'as decidee."
    });
    document.body?.classList.add("focus-shield-hide-instagram");
    return;
  }

  hideOverlay();

  hideElements(INSTAGRAM_SELECTORS.navLinks.reels);
  hideElements(INSTAGRAM_SELECTORS.navLinks.explore);

  if (settings.instagramBlockSearch) {
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
      title: "Instagram verrouille en mode messages",
      body: "Stories, Reels, Explore et feed sont caches pour garder surtout la messagerie.",
      ctaHref: INBOX_PATH,
      ctaLabel: "Ouvrir les messages"
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

  if (settings.youtubeBlockAll) {
    renderOverlay({
      title: "YouTube est bloque",
      body: "Tu peux couper totalement YouTube ou revenir plus tard via le popup de l'extension."
    });
    hideElements("ytd-app");
    return;
  }

  hideOverlay();

  if (settings.youtubeHideThumbnails) {
    document.body?.classList.add("focus-shield-youtube-thumbnails-off");
    hideElements(YOUTUBE_SELECTORS.thumbnails);
  }

  if (settings.youtubeSearchOnlyHome && window.location.pathname === "/") {
    document.body?.classList.add("focus-shield-youtube-search-only");
    hideElements(YOUTUBE_SELECTORS.homeFeed);
    hideElements(YOUTUBE_SELECTORS.sidebars);
  }
}

function applyTikTok() {
  if (settings.tiktokBlockAll) {
    renderOverlay({
      title: "TikTok est bloque",
      body: "TikTok est completement coupe dans cette configuration."
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
  applySiteRules();
}

async function readSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
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
  window.addEventListener("popstate", queueApplyAll);
  navigationHooksStarted = true;
}

async function initialize() {
  if (SITE === "other") {
    return;
  }

  await readSettings();
  ensureStyle();
  startObserver();
  startNavigationHooks();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll, { once: true });
  } else {
    applyAll();
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  Object.keys(changes).forEach((key) => {
    settings[key] = changes[key].newValue;
  });

  queueApplyAll();
});

initialize();
