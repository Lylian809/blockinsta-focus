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
  tiktokBlockAll: false,
  focusSession: null,
  focusOverlayEvent: null,
  focusCompletionLog: [],
  userFirstName: "",
  focusStartImageCursor: -1,
  focusStartCopyCursor: -1,
  focusEndImageCursor: -1,
  focusEndCopyCursor: -1
};
const FOCUS_MODE_OVERRIDES = {
  instagramBlockAll: true,
  instagramMessagesOnly: false,
  instagramBlockReels: false,
  instagramBlockStories: false,
  instagramBlockExplore: false,
  instagramBlockFeed: false,
  instagramBlockSearch: false,
  instagramRedirectHomeToInbox: false,
  youtubeBlockAll: false,
  youtubeHideThumbnails: true,
  youtubeBlockShorts: true,
  youtubeSearchOnlyHome: true,
  tiktokBlockAll: true
};

const SITE = detectSite();
const STYLE_ID = "focus-shield-style";
const OVERLAY_ID = "focus-shield-overlay";
const OVERLAY_TITLE_ID = "focus-shield-overlay-title";
const OVERLAY_BODY_ID = "focus-shield-overlay-body";
const YOUTUBE_HOME_NOTE_ID = "focus-shield-youtube-home-note";
const FOCUS_WIDGET_ID = "focus-shield-focus-widget";
const FOCUS_WIDGET_HANDLE_ID = "focus-shield-focus-widget-handle";
const FOCUS_SPLASH_ID = "focus-shield-focus-splash";
const FOCUS_COMPLETION_LOG_KEY = "focusCompletionLog";
const FOCUS_START_IMAGE_CURSOR_KEY = "focusStartImageCursor";
const FOCUS_START_COPY_CURSOR_KEY = "focusStartCopyCursor";
const FOCUS_END_IMAGE_CURSOR_KEY = "focusEndImageCursor";
const FOCUS_END_COPY_CURSOR_KEY = "focusEndCopyCursor";
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
const FOCUS_START_IMAGES = [
  "assets/motivation/start/start-01.jpg",
  "assets/motivation/start/start-02.jpg",
  "assets/motivation/start/start-03.jpeg",
  "assets/motivation/start/start-04.jpg",
  "assets/motivation/start/start-05.jpg",
  "assets/motivation/start/start-06.jpg",
  "assets/motivation/start/start-07.jpg",
  "assets/motivation/start/start-08.jpg",
  "assets/motivation/start/start-09.jpg"
];
const FOCUS_END_IMAGES = [
  "assets/motivation/end/end-01.jpg",
  "assets/motivation/end/end-02.jpg",
  "assets/motivation/end/end-03.jpg",
  "assets/motivation/end/end-04.webp",
  "assets/motivation/end/end-05.jpg",
  "assets/motivation/end/end-06.png",
  "assets/motivation/end/end-07.jpg",
  "assets/motivation/end/end-08.jpg",
  "assets/motivation/end/end-09.jpg",
  "assets/motivation/end/end-10.jpg",
  "assets/motivation/end/end-11.jpg",
  "assets/motivation/end/end-12.jpg",
  "assets/motivation/end/end-13.jpg"
];

let settings = { ...DEFAULT_SETTINGS };
let observerStarted = false;
let navigationHooksStarted = false;
let redirectScheduled = false;
let lastRedirectTarget = "";
let applyQueued = false;
let activeStorageArea = "sync";
let focusSessionTimeout = 0;
let focusWidgetPointerState = null;
let focusWidgetInterval = 0;
let lastFocusOverlayId = "";
let focusTransitionInFlight = false;

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

function normalizeFocusSession(session, options = {}) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const { allowExpired = false } = options;

  const phase = session.phase === "break" ? "break" : "work";
  const phaseStartedAt = Number(session.phaseStartedAt);
  const phaseEndsAt = Number(session.phaseEndsAt);
  const workMinutes = Number(session.workMinutes);
  const breakMinutes = Number(session.breakMinutes);
  const cycleCount = Number(session.cycleCount);

  if (!Number.isFinite(phaseEndsAt) || (!allowExpired && phaseEndsAt <= Date.now())) {
    return null;
  }

  return {
    phase,
    phaseStartedAt: Number.isFinite(phaseStartedAt) ? phaseStartedAt : Date.now(),
    phaseEndsAt,
    workMinutes: Number.isFinite(workMinutes) ? workMinutes : 25,
    breakMinutes: Number.isFinite(breakMinutes) ? breakMinutes : 5,
    cycleCount: Number.isFinite(cycleCount) && cycleCount > 0 ? cycleCount : 1
  };
}

function isFocusSessionActive() {
  return Boolean(settings.focusSession && Number(settings.focusSession.phaseEndsAt) > Date.now());
}

function getFocusPhase(session = settings.focusSession) {
  if (!session) {
    return "idle";
  }

  return session.phase === "break" ? "break" : "work";
}

function getFocusPhaseRemainingMs(session = settings.focusSession) {
  if (!session) {
    return 0;
  }

  return Math.max(0, Number(session.phaseEndsAt) - Date.now());
}

function formatClockFromMs(totalMs) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeFocusCompletionLog(log) {
  if (!Array.isArray(log)) {
    return [];
  }

  return log
    .map((value) => {
      if (typeof value === "number") {
        return {
          completedAt: value,
          workMinutes: 25
        };
      }

      if (!value || typeof value !== "object") {
        return null;
      }

      const completedAt = Number(value.completedAt);
      const workMinutes = Number(value.workMinutes);

      if (!Number.isFinite(completedAt) || completedAt <= 0) {
        return null;
      }

      return {
        completedAt,
        workMinutes: Number.isFinite(workMinutes) && workMinutes > 0 ? workMinutes : 25
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.completedAt - right.completedAt)
    .slice(-4000);
}

function pickFocusImagePath(type, cycleCount = 1) {
  const images = type === "focus-end" ? FOCUS_END_IMAGES : FOCUS_START_IMAGES;
  const index = (Math.max(1, cycleCount) - 1) % images.length;
  return images[index];
}

function normalizeFocusOverlayEvent(eventData) {
  if (!eventData || typeof eventData !== "object" || !eventData.id) {
    return null;
  }

  return {
    id: String(eventData.id),
    type: String(eventData.type || "focus-start"),
    title: String(eventData.title || ""),
    body: String(eventData.body || ""),
    createdAt: Number(eventData.createdAt) || Date.now(),
    imagePath: String(eventData.imagePath || "")
  };
}

function getDisplayName(name) {
  const trimmed = String(name || "").trim();
  return trimmed || "Champion";
}

function pickMessage(list, cycleCount = 1) {
  const index = (Math.max(1, cycleCount) - 1) % list.length;
  return list[index];
}

function buildFocusOverlayEvent(type, firstName, cycleCount, phaseLabel) {
  const displayName = getDisplayName(firstName);
  const startTitles = [
    `${displayName}, tu vas tout défoncer.`,
    `${displayName}, t'es un monstre.`,
    `${displayName}, grosse session en vue.`,
    `${displayName}, t'as ça dans les mains.`
  ];
  const startBodies = [
    "Verrouille ton focus. Tu vas être putain de productif aujourd'hui.",
    "Coupe le bruit, garde l'essentiel, et massacre cette session.",
    "Tu vas tout tuer. Une action après l'autre, sans détour.",
    "Le mode monstre est lancé. Reste dedans et fais le taf."
  ];
  const endTitles = [
    `${displayName}, bien joué à toi.`,
    `${displayName}, t'as tout tué.`,
    `${displayName}, tu peux être fier de toi.`,
    `${displayName}, l'univers est fier de toi.`
  ];
  const endBodies = [
    `Tu viens de finir ${phaseLabel}. T'es un putain de monstre.`,
    "Session validée. Respire un coup, mais n'oublie pas : t'es trop fort.",
    "Tu avances pour de vrai. Garde cette énergie.",
    "Le plus dur est fait. Continue comme ça et tu vas tout retourner."
  ];

  return {
    id: `${type}-${Date.now()}`,
    type,
    title: type === "focus-start"
      ? pickMessage(startTitles, cycleCount)
      : pickMessage(endTitles, cycleCount),
    body: type === "focus-start"
      ? pickMessage(startBodies, cycleCount)
      : pickMessage(endBodies, cycleCount),
    createdAt: Date.now(),
    imagePath: pickFocusImagePath(type, cycleCount)
  };
}

function buildMotivationOverlayEvent(type, firstName, cycleCount, phaseLabel) {
  const displayName = getDisplayName(firstName);
  const startTitles = [
    `${displayName}, tu vas tout défoncer.`,
    `${displayName}, t'es un monstre.`,
    `${displayName}, grosse session en vue.`,
    `${displayName}, t'as ça dans les mains.`
  ];
  const startBodies = [
    "Concentre-toi et massacre cette session.",
    "Tu vas tout tuer. Une action après l'autre, sans détour.",
    "Le mode monstre est lancé. Reste dedans et fais le taf.",
    "Coupe le bruit. Va chercher une vraie grosse session."
  ];
  const endTitles = [
    `${displayName}, bien joué à toi.`,
    `${displayName}, t'as tout tué.`,
    `${displayName}, tu peux être fier de toi.`,
    `${displayName}, l'univers est fier de toi.`
  ];
  const endBodies = [
    `Tu viens de finir ${phaseLabel}. T'es un putain de monstre.`,
    "Session validée. Respire un coup, mais n'oublie pas : t'es trop fort.",
    "Tu avances pour de vrai. Garde cette énergie.",
    "Le plus dur est fait. Continue comme ça et tu vas tout retourner."
  ];

  return {
    id: `${type}-${Date.now()}`,
    type,
    title: type === "focus-start"
      ? pickMessage(startTitles, cycleCount)
      : pickMessage(endTitles, cycleCount),
    body: type === "focus-start"
      ? pickMessage(startBodies, cycleCount)
      : pickMessage(endBodies, cycleCount),
    createdAt: Date.now(),
    imagePath: pickFocusImagePath(type, cycleCount)
  };
}

function getNextRotationIndex(currentIndex, listLength) {
  if (!Number.isFinite(listLength) || listLength <= 0) {
    return 0;
  }

  const normalizedIndex = Number.isFinite(currentIndex) ? currentIndex : -1;
  return (normalizedIndex + 1 + listLength) % listLength;
}

function buildRotatingMotivationOverlayEvent(type, firstName, phaseLabel, rotation = {}) {
  const displayName = getDisplayName(firstName);
  const startTitles = [
    `${displayName}, tu vas tout dÃ©foncer.`,
    `${displayName}, t'es un monstre.`,
    `${displayName}, grosse session en vue.`,
    `${displayName}, t'as Ã§a dans les mains.`
  ];
  const startBodies = [
    "Concentre-toi et massacre cette session.",
    "Tu vas tout tuer. Une action aprÃ¨s l'autre, sans dÃ©tour.",
    "Le mode monstre est lancÃ©. Reste dedans et fais le taf.",
    "Coupe le bruit. Va chercher une vraie grosse session."
  ];
  const endTitles = [
    `${displayName}, bien jouÃ© Ã  toi.`,
    `${displayName}, t'as tout tuÃ©.`,
    `${displayName}, tu peux Ãªtre fier de toi.`,
    `${displayName}, l'univers est fier de toi.`
  ];
  const endBodies = [
    `Tu viens de finir ${phaseLabel}. T'es un putain de monstre.`,
    "Session validÃ©e. Respire un coup, mais n'oublie pas : t'es trop fort.",
    "Tu avances pour de vrai. Garde cette Ã©nergie.",
    "Le plus dur est fait. Continue comme Ã§a et tu vas tout retourner."
  ];
  const isEndOverlay = type === "focus-end";
  const images = isEndOverlay ? FOCUS_END_IMAGES : FOCUS_START_IMAGES;
  const titles = isEndOverlay ? endTitles : startTitles;
  const bodies = isEndOverlay ? endBodies : startBodies;
  const imageIndex = getNextRotationIndex(rotation.imageCursor, images.length);
  const copyIndex = getNextRotationIndex(rotation.copyCursor, titles.length);

  return {
    id: `${type}-${Date.now()}`,
    type,
    title: titles[copyIndex],
    body: bodies[copyIndex],
    createdAt: Date.now(),
    imagePath: images[imageIndex]
  };
}

function getEffectiveSettings() {
  if (!isFocusSessionActive()) {
    return settings;
  }

  return {
    ...settings,
    ...FOCUS_MODE_OVERRIDES
  };
}

function clearFocusSessionTimeout() {
  if (focusSessionTimeout) {
    clearTimeout(focusSessionTimeout);
    focusSessionTimeout = 0;
  }
}

function clearFocusWidgetTicker() {
  if (focusWidgetInterval) {
    clearInterval(focusWidgetInterval);
    focusWidgetInterval = 0;
  }
}

function syncFocusWidgetTicker() {
  clearFocusWidgetTicker();

  if (!isFocusSessionActive()) {
    return;
  }

  focusWidgetInterval = window.setInterval(() => {
    renderFocusWidget();
  }, 1000);
}

function scheduleFocusSessionExpiry() {
  clearFocusSessionTimeout();
  syncFocusWidgetTicker();

  if (!settings.focusSession) {
    return;
  }

  const remainingMs = Number(settings.focusSession.phaseEndsAt) - Date.now();

  if (remainingMs <= 0) {
    transitionFocusSession().catch((error) => {
      console.error("Fokus: immediate focus transition failed", error);
      queueApplyAll();
    });
    return;
  }

  focusSessionTimeout = window.setTimeout(() => {
    transitionFocusSession()
      .catch((error) => {
        console.error("Fokus: failed to transition focus session after phase end", error);
      })
      .finally(() => {
        queueApplyAll();
      });
  }, remainingMs + 50);
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

async function transitionFocusSession() {
  if (focusTransitionInFlight) {
    return;
  }

  if (!settings.focusSession) {
    return;
  }

  if (Date.now() < Number(settings.focusSession.phaseEndsAt)) {
    return;
  }

  focusTransitionInFlight = true;

  try {
    const stored = await callStorage(activeStorageArea, "get", DEFAULT_SETTINGS);
    const currentSession = normalizeFocusSession(stored.focusSession, { allowExpired: true });
    const focusCompletionLog = normalizeFocusCompletionLog(stored[FOCUS_COMPLETION_LOG_KEY]);
    const firstName = stored.userFirstName || "";
    const focusStartImageCursor = Number.isFinite(Number(stored[FOCUS_START_IMAGE_CURSOR_KEY]))
      ? Number(stored[FOCUS_START_IMAGE_CURSOR_KEY])
      : -1;
    const focusStartCopyCursor = Number.isFinite(Number(stored[FOCUS_START_COPY_CURSOR_KEY]))
      ? Number(stored[FOCUS_START_COPY_CURSOR_KEY])
      : -1;
    const focusEndImageCursor = Number.isFinite(Number(stored[FOCUS_END_IMAGE_CURSOR_KEY]))
      ? Number(stored[FOCUS_END_IMAGE_CURSOR_KEY])
      : -1;
    const focusEndCopyCursor = Number.isFinite(Number(stored[FOCUS_END_COPY_CURSOR_KEY]))
      ? Number(stored[FOCUS_END_COPY_CURSOR_KEY])
      : -1;

    if (!currentSession || Date.now() < Number(currentSession.phaseEndsAt)) {
      settings.focusSession = currentSession;
      return;
    }

    const now = Date.now();
    let nextSession;
    let overlayEvent;
    let nextCompletionLog = focusCompletionLog;
    let nextStartImageCursor = focusStartImageCursor;
    let nextStartCopyCursor = focusStartCopyCursor;
    let nextEndImageCursor = focusEndImageCursor;
    let nextEndCopyCursor = focusEndCopyCursor;

    if (currentSession.phase === "work") {
      nextCompletionLog = [...focusCompletionLog, {
        completedAt: now,
        workMinutes: currentSession.workMinutes
      }].slice(-4000);
      nextSession = {
        phase: "break",
        phaseStartedAt: now,
        phaseEndsAt: now + currentSession.breakMinutes * 60 * 1000,
        workMinutes: currentSession.workMinutes,
        breakMinutes: currentSession.breakMinutes,
        cycleCount: currentSession.cycleCount
      };
      nextEndImageCursor = getNextRotationIndex(focusEndImageCursor, FOCUS_END_IMAGES.length);
      nextEndCopyCursor = getNextRotationIndex(focusEndCopyCursor, 4);
      overlayEvent = buildRotatingMotivationOverlayEvent(
        "focus-end",
        firstName,
        `${currentSession.workMinutes} minutes de focus`,
        {
          imageCursor: focusEndImageCursor,
          copyCursor: focusEndCopyCursor
        }
      );
    } else {
      nextSession = {
        phase: "work",
        phaseStartedAt: now,
        phaseEndsAt: now + currentSession.workMinutes * 60 * 1000,
        workMinutes: currentSession.workMinutes,
        breakMinutes: currentSession.breakMinutes,
        cycleCount: currentSession.cycleCount + 1
      };
      nextStartImageCursor = getNextRotationIndex(focusStartImageCursor, FOCUS_START_IMAGES.length);
      nextStartCopyCursor = getNextRotationIndex(focusStartCopyCursor, 4);
      overlayEvent = buildRotatingMotivationOverlayEvent(
        "focus-start",
        firstName,
        `${currentSession.breakMinutes} minutes de pause`,
        {
          imageCursor: focusStartImageCursor,
          copyCursor: focusStartCopyCursor
        }
      );
    }

    await callStorage(activeStorageArea, "set", {
      focusSession: nextSession,
      focusOverlayEvent: overlayEvent,
      [FOCUS_COMPLETION_LOG_KEY]: nextCompletionLog,
      [FOCUS_START_IMAGE_CURSOR_KEY]: nextStartImageCursor,
      [FOCUS_START_COPY_CURSOR_KEY]: nextStartCopyCursor,
      [FOCUS_END_IMAGE_CURSOR_KEY]: nextEndImageCursor,
      [FOCUS_END_COPY_CURSOR_KEY]: nextEndCopyCursor
    });

    settings.focusSession = nextSession;
    settings.focusOverlayEvent = overlayEvent;
    settings[FOCUS_COMPLETION_LOG_KEY] = nextCompletionLog;
    settings[FOCUS_START_IMAGE_CURSOR_KEY] = nextStartImageCursor;
    settings[FOCUS_START_COPY_CURSOR_KEY] = nextStartCopyCursor;
    settings[FOCUS_END_IMAGE_CURSOR_KEY] = nextEndImageCursor;
    settings[FOCUS_END_COPY_CURSOR_KEY] = nextEndCopyCursor;
    lastFocusOverlayId = overlayEvent.id;
    showFocusSplash(overlayEvent);
    scheduleFocusSessionExpiry();
  } finally {
    focusTransitionInFlight = false;
  }
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
      z-index: 2147483646;
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

    #${FOCUS_WIDGET_ID} {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 2147483647;
      width: 180px;
      padding: 12px 12px 14px;
      border: 1px solid rgba(74, 46, 200, 0.16);
      border-radius: 18px;
      background:
        radial-gradient(circle at top right, rgba(74, 46, 200, 0.12), transparent 28%),
        linear-gradient(135deg, rgba(74, 46, 200, 0.07) 0%, rgba(255, 255, 255, 0.98) 58%, rgba(205, 191, 255, 0.34) 100%);
      box-shadow: 0 18px 42px rgba(17, 24, 39, 0.16);
      backdrop-filter: blur(12px);
      color: #111827;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      cursor: default;
      user-select: none;
    }

    #${FOCUS_WIDGET_ID}[hidden] {
      display: none !important;
    }

    #${FOCUS_WIDGET_HANDLE_ID} {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      cursor: grab;
    }

    #${FOCUS_WIDGET_HANDLE_ID}:active {
      cursor: grabbing;
    }

    #${FOCUS_WIDGET_ID} .focus-widget-eyebrow {
      margin: 0;
      color: #4338ca;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    #${FOCUS_WIDGET_ID} .focus-widget-drag {
      color: #6b7280;
      font-size: 13px;
      line-height: 1;
    }

    #${FOCUS_WIDGET_ID} .focus-widget-phase {
      margin: 0;
      color: #17131f;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    #${FOCUS_WIDGET_ID} .focus-widget-timer {
      margin: 6px 0 0;
      color: #17131f;
      font-size: 34px;
      font-weight: 800;
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    #${FOCUS_WIDGET_ID} .focus-widget-note {
      margin: 10px 0 0;
      color: #4b5563;
      font-size: 12px;
      line-height: 1.4;
    }

    #${FOCUS_SPLASH_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(17, 14, 34, 0.34);
      backdrop-filter: blur(8px);
    }

    #${FOCUS_SPLASH_ID} .focus-splash-card {
      width: min(720px, calc(100vw - 36px));
      border: 1px solid rgba(74, 46, 200, 0.18);
      border-radius: 30px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 32px 80px rgba(17, 24, 39, 0.34);
      color: #111827;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #${FOCUS_SPLASH_ID}[hidden] {
      display: none !important;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-visual {
      position: relative;
      min-height: 360px;
      padding: 20px;
      background:
        radial-gradient(circle at top right, rgba(74, 46, 200, 0.34), transparent 26%),
        linear-gradient(135deg, #18132d 0%, #261e46 36%, #4a2ec8 100%);
      color: #ffffff;
      overflow: hidden;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-image {
      position: absolute;
      inset: 0;
      background-position: center top;
      background-size: cover;
      background-repeat: no-repeat;
      opacity: 0.96;
      filter: grayscale(0.02) contrast(1.05) saturate(0.96);
    }

    #${FOCUS_SPLASH_ID} .focus-splash-image::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(17, 14, 34, 0.12) 0%, rgba(17, 14, 34, 0.72) 100%),
        linear-gradient(90deg, rgba(17, 14, 34, 0.70) 0%, rgba(17, 14, 34, 0.18) 100%);
    }

    #${FOCUS_SPLASH_ID} .focus-splash-kicker {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-art {
      display: none;
      position: absolute;
      right: 16px;
      bottom: 16px;
      font-size: 48px;
      line-height: 1;
      opacity: 0.92;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-close {
      z-index: 2;
      position: absolute;
      top: 14px;
      right: 14px;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-copy {
      padding: 24px 24px 20px;
    }

    #${FOCUS_SPLASH_ID} h3 {
      margin: 0 0 8px;
      font-size: 42px;
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    #${FOCUS_SPLASH_ID} p {
      margin: 0;
      color: #4b5563;
      font-size: 18px;
      line-height: 1.5;
    }

    #${FOCUS_SPLASH_ID} .focus-splash-progress {
      height: 5px;
      background: rgba(74, 46, 200, 0.12);
    }

    #${FOCUS_SPLASH_ID} .focus-splash-progress > span {
      display: block;
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #4a2ec8 0%, #8b74ff 100%);
      transform-origin: left center;
      animation: fokusSplashDrain 10s linear forwards;
    }

    @keyframes fokusSplashDrain {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
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

function hideTopLevelDocumentContent() {
  Array.from(document.documentElement.children).forEach((node) => {
    if (
      node.tagName === "HEAD" ||
      node.id === STYLE_ID ||
      node.id === OVERLAY_ID ||
      node.id === YOUTUBE_HOME_NOTE_ID ||
      node.id === FOCUS_WIDGET_ID ||
      node.id === FOCUS_SPLASH_ID
    ) {
      return;
    }

    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN_ATTR, "true");
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

function ensureFocusWidget() {
  let widget = document.getElementById(FOCUS_WIDGET_ID);

  if (!widget) {
    widget = document.createElement("div");
    widget.id = FOCUS_WIDGET_ID;
    widget.hidden = true;
    document.documentElement.appendChild(widget);
    installFocusWidgetDrag(widget);
  }

  return widget;
}

function ensureFocusSplash() {
  let splash = document.getElementById(FOCUS_SPLASH_ID);

  if (!splash) {
    splash = document.createElement("div");
    splash.id = FOCUS_SPLASH_ID;
    splash.hidden = true;
    document.documentElement.appendChild(splash);
  }

  return splash;
}

function hideFocusSplash() {
  const splash = ensureFocusSplash();
  splash.hidden = true;
  splash.innerHTML = "";
}

function getFocusSplashArt(type) {
  if (type === "focus-end") {
    return ["⚔️", "🏆", "🗿", "🔥"][Math.floor(Date.now() / 1000) % 4];
  }

  return ["🚀", "💥", "🦍", "⚡"][Math.floor(Date.now() / 1000) % 4];
}

function showFocusSplash(eventData) {
  if (!eventData || !eventData.id) {
    return;
  }

  const splash = ensureFocusSplash();
  const visualMarkup = eventData.imagePath
    ? `<div class="focus-splash-image" style="background-image: url('${chrome.runtime.getURL(eventData.imagePath)}');"></div>`
    : `<div class="focus-splash-art" aria-hidden="true">${getFocusSplashArt(eventData.type)}</div>`;
  splash.innerHTML = `
    <div class="focus-splash-card">
      <div class="focus-splash-visual">
        ${visualMarkup}
        <button class="focus-splash-close" type="button" aria-label="Fermer">×</button>
        <span class="focus-splash-kicker">${eventData.type === "focus-end" ? "Session validée" : "Mode monstre"}</span>
      </div>
      <div class="focus-splash-copy">
        <h3>${eventData.title}</h3>
        <p>${eventData.body}</p>
      </div>
      <div class="focus-splash-progress"><span></span></div>
    </div>
  `;
  splash.hidden = false;

  const closeButton = splash.querySelector(".focus-splash-close");
  closeButton?.addEventListener("click", hideFocusSplash, { once: true });

  window.setTimeout(() => {
    if (!splash.hidden) {
      hideFocusSplash();
    }
  }, 10000);
}

function installFocusWidgetDrag(widget) {
  const startDrag = (event) => {
    const handle = event.target instanceof Element
      ? event.target.closest(`#${FOCUS_WIDGET_HANDLE_ID}`)
      : null;

    if (!handle) {
      return;
    }

    const rect = widget.getBoundingClientRect();
    focusWidgetPointerState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };

    widget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const moveDrag = (event) => {
    if (!focusWidgetPointerState || focusWidgetPointerState.pointerId !== event.pointerId) {
      return;
    }

    const nextLeft = Math.min(
      Math.max(8, event.clientX - focusWidgetPointerState.offsetX),
      Math.max(8, window.innerWidth - widget.offsetWidth - 8)
    );
    const nextTop = Math.min(
      Math.max(8, event.clientY - focusWidgetPointerState.offsetY),
      Math.max(8, window.innerHeight - widget.offsetHeight - 8)
    );

    widget.style.left = `${nextLeft}px`;
    widget.style.top = `${nextTop}px`;
    widget.style.right = "auto";
    widget.style.bottom = "auto";
  };

  const endDrag = (event) => {
    if (!focusWidgetPointerState || focusWidgetPointerState.pointerId !== event.pointerId) {
      return;
    }

    focusWidgetPointerState = null;
    widget.releasePointerCapture(event.pointerId);
  };

  widget.addEventListener("pointerdown", startDrag);
  widget.addEventListener("pointermove", moveDrag);
  widget.addEventListener("pointerup", endDrag);
  widget.addEventListener("pointercancel", endDrag);
}

function renderFocusWidget() {
  const widget = ensureFocusWidget();

  if (!isFocusSessionActive()) {
    widget.hidden = true;
    widget.innerHTML = "";
    return;
  }

  const phase = getFocusPhase();
  const session = settings.focusSession;
  widget.innerHTML = `
    <div id="${FOCUS_WIDGET_HANDLE_ID}">
      <p class="focus-widget-eyebrow">Fokus</p>
      <span class="focus-widget-drag">+</span>
    </div>
    <p class="focus-widget-phase">${phase === "work" ? "Focus" : "Pause"}</p>
    <p class="focus-widget-timer">${formatClockFromMs(getFocusPhaseRemainingMs())}</p>
    <p class="focus-widget-note">
      ${phase === "work"
        ? `Cycle ${session.cycleCount}. ${session.workMinutes} min de focus, puis ${session.breakMinutes} min de pause.`
        : `Pause de ${session.breakMinutes} min. Un nouveau cycle repartira automatiquement.`}
    </p>
  `;
  widget.hidden = false;
}

function isFocusManagedNode(node) {
  if (!(node instanceof Node)) {
    return false;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node;
    return Boolean(
      element.closest?.(`#${OVERLAY_ID}, #${YOUTUBE_HOME_NOTE_ID}, #${FOCUS_WIDGET_ID}, #${STYLE_ID}`)
      || element.closest?.(`#${FOCUS_SPLASH_ID}`)
    );
  }

  return isFocusManagedNode(node.parentNode);
}

function isRelevantMutation(record) {
  if (isFocusManagedNode(record.target)) {
    return false;
  }

  const changedNodes = [
    ...record.addedNodes,
    ...record.removedNodes
  ];

  if (!changedNodes.length) {
    return true;
  }

  return changedNodes.some((node) => !isFocusManagedNode(node));
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
  const effectiveSettings = getEffectiveSettings();
  document.body?.classList.remove("focus-shield-hide-instagram");
  const shouldHideReelsEntry = effectiveSettings.instagramBlockReels || effectiveSettings.instagramMessagesOnly;
  const shouldHideExploreEntry = effectiveSettings.instagramBlockExplore || effectiveSettings.instagramMessagesOnly;
  const shouldHideSearchEntry = effectiveSettings.instagramBlockSearch || effectiveSettings.instagramMessagesOnly;

  if (window.location.pathname === INBOX_PATH) {
    redirectScheduled = false;
    lastRedirectTarget = "";
  }

  if (effectiveSettings.instagramBlockAll) {
    renderOverlay({
      title: "Instagram est coup\u00E9 pour l'instant",
      body: "Fokus bloque cette surface pour t'aider \u00E0 rester hors du flux.",
      detail: isFocusSessionActive()
        ? "Cette session Focus bloque temporairement Instagram jusqu'à la fin du timer."
        : undefined,
      note: "Tu peux modifier ce choix \u00E0 tout moment depuis le popup de l'extension."
    });
    hideTopLevelDocumentContent();
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

  if (effectiveSettings.instagramBlockStories) {
    hideElements(INSTAGRAM_SELECTORS.storyTray);
    if (window.location.pathname.startsWith("/stories")) {
      hideElements(INSTAGRAM_SELECTORS.main);
    }
  }

  if (effectiveSettings.instagramBlockReels && window.location.pathname.startsWith("/reels")) {
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (effectiveSettings.instagramBlockExplore && window.location.pathname.startsWith("/explore")) {
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (effectiveSettings.instagramBlockFeed && window.location.pathname === "/") {
    hideElements(INSTAGRAM_SELECTORS.feedArticles);
    hideElements(INSTAGRAM_SELECTORS.main);
  }

  if (!effectiveSettings.instagramMessagesOnly) {
    return;
  }

  const path = window.location.pathname;
  const allowed = pathAllowedInInstagramMessagesOnly(path);
  document.body?.classList.toggle("focus-shield-hide-instagram", !allowed);

  if (!allowed) {
    renderOverlay({
      title: "Mode messages actif",
      body: "Seule la messagerie reste accessible dans cette configuration Fokus.",
      detail: isFocusSessionActive()
        ? "La session Focus garde uniquement la messagerie pendant le timer."
        : "Le feed, Explore, Stories et Reels restent masqu\u00E9s pour limiter les d\u00E9tours.",
      ctaHref: INBOX_PATH,
      ctaLabel: "Ouvrir la messagerie",
      note: "D\u00E9sactive ce mode dans le popup si tu veux retrouver le reste d'Instagram."
    });
  } else {
    hideOverlay();
  }

  if (!allowed && effectiveSettings.instagramRedirectHomeToInbox) {
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
  const effectiveSettings = getEffectiveSettings();
  document.body?.classList.remove("focus-shield-youtube-thumbnails-off");
  document.body?.classList.remove("focus-shield-youtube-search-only");
  hideYouTubeHomeNote();

  if (effectiveSettings.youtubeBlockAll) {
    renderOverlay({
      title: "YouTube est en pause",
      body: "Cette surface est bloqu\u00E9e pour \u00E9viter les recommandations et l'encha\u00EEnement passif.",
      note: "Tu peux rouvrir YouTube depuis le popup Fokus quand tu en as vraiment besoin."
    });
    hideElements(YOUTUBE_SELECTORS.appShell);
    return;
  }

  hideOverlay();

  if (effectiveSettings.youtubeHideThumbnails) {
    document.body?.classList.add("focus-shield-youtube-thumbnails-off");
    hideElements(YOUTUBE_SELECTORS.thumbnails);
  }

  if (effectiveSettings.youtubeBlockShorts) {
    hideElements(YOUTUBE_SELECTORS.shortsLinks);
    hideElements(YOUTUBE_SELECTORS.shortsShelves);

    if (isYouTubeShortsPath(window.location.pathname)) {
      renderOverlay({
        title: "Shorts est bloqu\u00E9",
        body: "Fokus coupe ce flux vertical pour \u00E9viter l'encha\u00EEnement rapide des vid\u00E9os.",
        detail: "Tu peux toujours utiliser la recherche, les abonnements ou une vid\u00E9o pr\u00E9cise sans ouvrir Shorts.",
        ctaHref: getCurrentOriginPath(YOUTUBE_HOME_PATH),
        ctaLabel: effectiveSettings.youtubeSearchOnlyHome ? "Retour \u00E0 l'accueil calme" : "Revenir \u00E0 YouTube",
        note: "D\u00E9sactive ce filtre dans le popup si tu veux r\u00E9autoriser Shorts."
      });
      hideElements(YOUTUBE_SELECTORS.appShell);
      return;
    }
  }

  if (effectiveSettings.youtubeSearchOnlyHome && window.location.pathname === "/") {
    document.body?.classList.add("focus-shield-youtube-search-only");
    hideElements(YOUTUBE_SELECTORS.homeFeed);
    hideElements(YOUTUBE_SELECTORS.sidebars);
    showYouTubeHomeNote();
  }
}

function applyTikTok() {
  const effectiveSettings = getEffectiveSettings();

  if (effectiveSettings.tiktokBlockAll) {
    renderOverlay({
      title: "TikTok est coup\u00E9",
      body: "Fokus bloque TikTok enti\u00E8rement dans cette configuration.",
      detail: isFocusSessionActive()
        ? "Cette session Focus garde TikTok fermé jusqu'à la fin du timer."
        : undefined,
      note: "Tu peux r\u00E9autoriser l'acc\u00E8s plus tard depuis le popup si ton besoin change."
    });
    hideTopLevelDocumentContent();
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
  renderFocusWidget();
  applySiteRules();
}

async function readSettings() {
  const stored = await callStorage(activeStorageArea, "get", DEFAULT_SETTINGS);
  settings = { ...DEFAULT_SETTINGS, ...stored };
  settings.focusSession = normalizeFocusSession(stored.focusSession);
  settings.focusOverlayEvent = normalizeFocusOverlayEvent(stored.focusOverlayEvent);

  if (!settings.focusSession && stored.focusSession) {
    callStorage(activeStorageArea, "set", { focusSession: null }).catch((error) => {
      console.error("Fokus: failed to clear expired focus session", error);
    });
  }

  scheduleFocusSessionExpiry();
}

function startObserver() {
  if (observerStarted) {
    return;
  }

  const observer = new MutationObserver((records) => {
    if (!records.some(isRelevantMutation)) {
      return;
    }

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

    if (
      settings.focusOverlayEvent?.id &&
      Date.now() - Number(settings.focusOverlayEvent.createdAt || 0) <= 12000
    ) {
      lastFocusOverlayId = settings.focusOverlayEvent.id;
      showFocusSplash(settings.focusOverlayEvent);
    } else {
      lastFocusOverlayId = settings.focusOverlayEvent?.id ?? "";
    }
  } catch (error) {
    console.error("Fokus: content initialization failed", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "fokus-sync-focus-ui") {
    return;
  }

  queueApplyAll();
  sendResponse({ ok: true });
  return true;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== activeStorageArea) {
    return;
  }

  Object.keys(changes).forEach((key) => {
    settings[key] = key === "focusSession"
      ? normalizeFocusSession(changes[key].newValue)
      : key === "focusOverlayEvent"
        ? normalizeFocusOverlayEvent(changes[key].newValue)
        : changes[key].newValue;
  });

  scheduleFocusSessionExpiry();
  if (settings.focusOverlayEvent?.id && settings.focusOverlayEvent.id !== lastFocusOverlayId) {
    lastFocusOverlayId = settings.focusOverlayEvent.id;
    showFocusSplash(settings.focusOverlayEvent);
  }
  queueApplyAll();
});

initialize();
