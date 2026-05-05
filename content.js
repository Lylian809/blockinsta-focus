const DEFAULT_SETTINGS = {
  messagesOnly: true,
  blockReels: true,
  blockStories: true,
  blockExplore: true,
  blockFeed: true,
  blockSearch: true,
  redirectHomeToInbox: true
};

const STYLE_ID = "blockinsta-focus-style";
const OVERLAY_ID = "blockinsta-focus-overlay";
const INBOX_PATH = "/direct/inbox/";
const ALLOWED_PREFIXES = [
  "/direct",
  "/accounts/login",
  "/challenge",
  "/session"
];

const selectors = {
  main: "main, [role='main']",
  feedArticles: "article",
  storyTray: "div[data-pagelet='story_tray'], section main canvas + div, [aria-label*='Stories']",
  searchInputs: "input[aria-label='Search input'], input[placeholder='Search']",
  navLinks: {
    reels: "a[href*='/reels/']",
    explore: "a[href='/explore/'], a[href^='/explore/']",
    home: "a[href='/'], a[href='/' i]",
    search: "a[href='/explore/'], a[href^='/explore/']",
    create: "a[href='/create/select/'], a[href*='/create/']",
    notifications: "a[href*='/accounts/activity/']"
  }
};

let settings = { ...DEFAULT_SETTINGS };
let observerStarted = false;
let navigationHooksStarted = false;

const hideElements = (selector) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.style.setProperty("display", "none", "important");
    node.setAttribute("data-blockinsta-hidden", "true");
  });
};

const resetHiddenElements = () => {
  document.querySelectorAll("[data-blockinsta-hidden='true']").forEach((node) => {
    node.style.removeProperty("display");
    node.removeAttribute("data-blockinsta-hidden");
  });
};

const pathAllowedInMessagesOnly = (path) => {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const ensureStyle = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-blockinsta-hidden="true"] {
      display: none !important;
    }

    body.blockinsta-messages-only main,
    body.blockinsta-messages-only section main,
    body.blockinsta-messages-only article {
      visibility: hidden !important;
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

    #${OVERLAY_ID} .blockinsta-card {
      max-width: 460px;
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
};

const ensureOverlay = () => {
  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="blockinsta-card">
        <h1>Instagram verrouille en mode messages</h1>
        <p>
          Les Stories, Reels, l'Explore et le feed sont masques pour garder
          uniquement la messagerie.
        </p>
        <a href="${INBOX_PATH}">Ouvrir les messages</a>
      </div>
    `;
    document.documentElement.appendChild(overlay);
  }
  return overlay;
};

const applyMessagesOnlyMode = () => {
  const overlay = ensureOverlay();
  const path = window.location.pathname;
  const allowed = pathAllowedInMessagesOnly(path);

  document.body?.classList.toggle("blockinsta-messages-only", !allowed);
  overlay.hidden = allowed;

  if (!allowed && settings.redirectHomeToInbox) {
    const isSafeToRedirect = ![
      "/accounts/login",
      "/challenge"
    ].some((prefix) => path.startsWith(prefix));

    if (isSafeToRedirect && window.location.pathname !== INBOX_PATH) {
      window.location.replace(INBOX_PATH);
    }
  }
};

const applyFeatureBlocks = () => {
  resetHiddenElements();

  hideElements(selectors.navLinks.reels);
  hideElements(selectors.navLinks.explore);

  if (settings.blockSearch) {
    hideElements(selectors.navLinks.search);
    hideElements(selectors.searchInputs);
  }

  if (settings.blockStories) {
    hideElements(selectors.storyTray);
    if (window.location.pathname.startsWith("/stories")) {
      hideElements(selectors.main);
    }
  }

  if (settings.blockReels && window.location.pathname.startsWith("/reels")) {
    hideElements(selectors.main);
  }

  if (settings.blockExplore && window.location.pathname.startsWith("/explore")) {
    hideElements(selectors.main);
  }

  if (settings.blockFeed && window.location.pathname === "/") {
    hideElements(selectors.feedArticles);
    hideElements(selectors.main);
  }
};

const applyAll = () => {
  ensureStyle();
  applyFeatureBlocks();

  if (settings.messagesOnly) {
    applyMessagesOnlyMode();
  } else {
    const overlay = ensureOverlay();
    overlay.hidden = true;
    document.body?.classList.remove("blockinsta-messages-only");
  }
};

const readSettings = async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  settings = { ...DEFAULT_SETTINGS, ...stored };
};

const startObserver = () => {
  if (observerStarted) {
    return;
  }

  const observer = new MutationObserver(() => {
    applyAll();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  observerStarted = true;
};

const startNavigationHooks = () => {
  if (navigationHooksStarted) {
    return;
  }

  const wrap = (methodName) => {
    const original = history[methodName];
    history[methodName] = function wrappedHistoryState(...args) {
      const result = original.apply(this, args);
      queueMicrotask(applyAll);
      return result;
    };
  };

  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", applyAll);
  navigationHooksStarted = true;
};

const initialize = async () => {
  await readSettings();
  ensureStyle();
  startObserver();
  startNavigationHooks();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll, { once: true });
  } else {
    applyAll();
  }
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  Object.keys(changes).forEach((key) => {
    settings[key] = changes[key].newValue;
  });

  applyAll();
});

initialize();
