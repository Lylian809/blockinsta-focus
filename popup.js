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
const UI_PREFERENCES_DEFAULTS = {
  siteShortcutsOpenInNewTab: false,
  focusDurationMinutes: 25,
  focusMusicProvider: "spotify",
  focusSession: null,
  userFirstName: "",
  focusStartImageCursor: -1,
  focusStartCopyCursor: -1
};
const SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY = "siteShortcutsOpenInNewTab";
const FOCUS_DURATION_KEY = "focusDurationMinutes";
const FOCUS_MUSIC_PROVIDER_KEY = "focusMusicProvider";
const FOCUS_SESSION_KEY = "focusSession";
const FOCUS_OVERLAY_EVENT_KEY = "focusOverlayEvent";
const FOCUS_COMPLETION_LOG_KEY = "focusCompletionLog";
const USER_FIRST_NAME_KEY = "userFirstName";
const FOCUS_START_IMAGE_CURSOR_KEY = "focusStartImageCursor";
const FOCUS_START_COPY_CURSOR_KEY = "focusStartCopyCursor";
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
const FOCUS_PLANS = {
  25: { workMinutes: 25, breakMinutes: 5 },
  50: { workMinutes: 50, breakMinutes: 10 },
  90: { workMinutes: 90, breakMinutes: 30 }
};
const FOCUS_MUSIC_PROVIDERS = {
  spotify: {
    label: "Spotify",
    url: "https://open.spotify.com/search/focus%20music"
  },
  youtubeMusic: {
    label: "YouTube Music",
    url: "https://music.youtube.com/search?q=focus%20music"
  },
  appleMusic: {
    label: "Apple Music",
    url: "https://music.apple.com/us/search?term=focus%20music"
  },
  lofi: {
    label: "Lo-fi",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
  }
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
const FOCUS_START_TITLES = [
  "tu vas tout défoncer.",
  "t'es un monstre.",
  "grosse session en vue.",
  "t'as ça dans les mains."
];
const FOCUS_START_BODIES = [
  "Concentre-toi et massacre cette session.",
  "Coupe le bruit et fais une vraie grosse session.",
  "Une action après l'autre. Tu vas tout tuer.",
  "Mode monstre activé. Va chercher du concret."
];

const COUNTED_PROTECTION_SETTINGS = [
  "instagramBlockAll",
  "instagramMessagesOnly",
  "instagramBlockReels",
  "instagramBlockStories",
  "instagramBlockExplore",
  "instagramBlockFeed",
  "instagramBlockSearch",
  "youtubeBlockAll",
  "youtubeHideThumbnails",
  "youtubeBlockShorts",
  "youtubeSearchOnlyHome",
  "tiktokBlockAll"
];

const GROUP_DEPENDENCIES = {
  instagramBlockAll: [
    "instagramMessagesOnly",
    "instagramBlockReels",
    "instagramBlockStories",
    "instagramBlockExplore",
    "instagramBlockFeed",
    "instagramBlockSearch",
    "instagramRedirectHomeToInbox"
  ],
  youtubeBlockAll: [
    "youtubeHideThumbnails",
    "youtubeBlockShorts",
    "youtubeSearchOnlyHome"
  ],
  instagramMessagesOnly: [
    "instagramBlockReels",
    "instagramBlockStories",
    "instagramBlockExplore",
    "instagramBlockFeed",
    "instagramBlockSearch"
  ]
};

const DISABLED_REASONS = {
  instagramBlockAll: "D\u00E9sactiv\u00E9 car Instagram est enti\u00E8rement bloqu\u00E9.",
  youtubeBlockAll: "D\u00E9sactiv\u00E9 car YouTube est enti\u00E8rement bloqu\u00E9.",
  instagramMessagesOnly: "D\u00E9sactiv\u00E9 car le mode messages seulement masque d\u00E9j\u00E0 ces surfaces.",
  instagramRedirectHomeToInbox: "Disponible seulement quand le mode messages seulement est actif."
};
const SUPPORTED_TAB_SITES = [
  {
    key: "instagram",
    label: "Instagram",
    homeUrl: "https://www.instagram.com/",
    matcher: (hostname) => matchesHostname(hostname, "instagram.com")
  },
  {
    key: "youtube",
    label: "YouTube",
    homeUrl: "https://www.youtube.com/",
    matcher: (hostname) => matchesHostname(hostname, "youtube.com")
  },
  {
    key: "tiktok",
    label: "TikTok",
    homeUrl: "https://www.tiktok.com/",
    matcher: (hostname) => matchesHostname(hostname, "tiktok.com")
  }
];
const ACTIVE_TAB_CONTEXT_REFRESH_DELAY_MS = 350;
const SITE_SETTING_PREFIXES = [
  { prefix: "instagram", siteKey: "instagram" },
  { prefix: "youtube", siteKey: "youtube" },
  { prefix: "tiktok", siteKey: "tiktok" }
];

const statusNode = document.getElementById("status");
const srStatusNode = document.getElementById("sr-status");
const focusStateBadgeNode = document.getElementById("focus-state-badge");
const focusCopyNode = document.getElementById("focus-copy");
const focusTimerNode = document.getElementById("focus-timer");
const focusTimerNoteNode = document.getElementById("focus-timer-note");
const focusBreakNoteNode = document.getElementById("focus-break-note");
const welcomeCardNode = document.getElementById("welcome-card");
const userFirstNameNode = document.getElementById("user-first-name");
const saveFirstNameButton = document.getElementById("save-first-name");
const startFocusSessionButton = document.getElementById("start-focus-session");
const stopFocusSessionButton = document.getElementById("stop-focus-session");
const resetDefaultsButton = document.getElementById("reset-defaults");
const refreshActiveTabButton = document.getElementById("refresh-active-tab");
const refreshStateCopyNode = document.getElementById("refresh-state-copy");
const refreshTabContextNode = document.getElementById("refresh-tab-context");
const siteShortcutsNode = document.getElementById("site-shortcuts");
const siteShortcutsLabelNode = document.getElementById("site-shortcuts-label");
const siteShortcutsModeNode = document.getElementById("site-shortcuts-mode");
const siteShortcutsNewTabModeNode = document.getElementById("site-shortcuts-new-tab-mode");
const siteShortcutsNoteNode = document.getElementById("site-shortcuts-note");
const defaultStateCopyNode = document.getElementById("default-state-copy");
const summaryTitleNode = document.getElementById("summary-title");
const summaryBodyNode = document.getElementById("summary-body");
const summaryStorageBadgeNode = document.getElementById("summary-storage-badge");
const summaryStorageNoteNode = document.getElementById("summary-storage-note");
const summaryTabNoteNode = document.getElementById("summary-tab-note");
const summaryPresetBadgeNode = document.getElementById("summary-preset-badge");
const summaryPresetNoteNode = document.getElementById("summary-preset-note");
const contextNoteNodes = {
  instagram: document.getElementById("instagram-context-note"),
  youtube: document.getElementById("youtube-context-note"),
  tiktok: document.getElementById("tiktok-context-note")
};
const focusStatsNodes = {
  today: document.getElementById("stats-today"),
  week: document.getElementById("stats-week"),
  month: document.getElementById("stats-month"),
  year: document.getElementById("stats-year"),
  allTime: document.getElementById("stats-all-time"),
  totalTime: document.getElementById("stats-total-time")
};
const statsWeekDaysNode = document.getElementById("stats-week-days");
const checkboxFields = Array.from(document.querySelectorAll("input[type='checkbox']"));
const settingFields = checkboxFields.filter((field) => Boolean(field.name));
const fieldMap = new Map(settingFields.map((field) => [field.name, field]));
const siteCards = Array.from(document.querySelectorAll(".site-card[data-group]"));
const siteShortcutButtons = Array.from(document.querySelectorAll("[data-site-shortcut]"));
const durationButtons = Array.from(document.querySelectorAll("[data-focus-duration]"));
const musicProviderButtons = Array.from(document.querySelectorAll("[data-music-provider]"));
const accordionToggleNodes = Array.from(document.querySelectorAll("[data-accordion-toggle]"));
const accordionPanelNodes = new Map(
  Array.from(document.querySelectorAll("[data-accordion-panel]")).map((node) => [node.dataset.accordionPanel, node])
);

let activeStorageArea = "sync";
let screenReaderAnnouncementFrame = 0;
let activeTabContextRefreshTimeout = 0;
let statusResetTimeout = 0;
let focusTimerInterval = 0;
let focusDurationMinutes = UI_PREFERENCES_DEFAULTS.focusDurationMinutes;
let focusMusicProvider = UI_PREFERENCES_DEFAULTS.focusMusicProvider;
let focusSession = null;
let focusCompletionLog = [];
let userFirstName = UI_PREFERENCES_DEFAULTS.userFirstName;
let focusStartImageCursor = UI_PREFERENCES_DEFAULTS.focusStartImageCursor;
let focusStartCopyCursor = UI_PREFERENCES_DEFAULTS.focusStartCopyCursor;
let accordionState = {
  music: false,
  stats: false,
  instagram: false,
  youtube: false,
  tiktok: false,
  support: false,
  reset: false
};
let activeTabContext = {
  kind: "unknown",
  canReload: false,
  isSupported: false,
  label: "cet onglet",
  siteKey: null,
  reason: "",
  tabId: null,
  windowId: null
};

function matchesHostname(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function normalizeFocusSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const phase = session.phase === "break" ? "break" : "work";
  const phaseStartedAt = Number(session.phaseStartedAt);
  const phaseEndsAt = Number(session.phaseEndsAt);
  const workMinutes = Number(session.workMinutes);
  const breakMinutes = Number(session.breakMinutes);
  const cycleCount = Number(session.cycleCount);

  if (!Number.isFinite(phaseEndsAt) || phaseEndsAt <= Date.now()) {
    return null;
  }

  return {
    phase,
    phaseStartedAt: Number.isFinite(phaseStartedAt) ? phaseStartedAt : Date.now(),
    phaseEndsAt,
    workMinutes: Number.isFinite(workMinutes) && workMinutes > 0
      ? workMinutes
      : focusDurationMinutes,
    breakMinutes: Number.isFinite(breakMinutes) && breakMinutes >= 0
      ? breakMinutes
      : (FOCUS_PLANS[focusDurationMinutes]?.breakMinutes ?? 5),
    cycleCount: Number.isFinite(cycleCount) && cycleCount > 0 ? cycleCount : 1
  };
}

function getFocusRemainingMs(session = focusSession) {
  if (!session) {
    return 0;
  }

  return Math.max(0, session.phaseEndsAt - Date.now());
}

function getFocusPhaseRemainingMs(session = focusSession) {
  return getFocusRemainingMs(session);
}

function isFocusSessionActive(session = focusSession) {
  return getFocusRemainingMs(session) > 0;
}

function formatDurationClock(totalMs) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getSelectedMusicProvider() {
  return FOCUS_MUSIC_PROVIDERS[focusMusicProvider] ?? FOCUS_MUSIC_PROVIDERS.spotify;
}

function getFocusPlan(duration = focusDurationMinutes) {
  return FOCUS_PLANS[duration] ?? FOCUS_PLANS[25];
}

function getNextRotationIndex(currentIndex, listLength) {
  if (!Number.isFinite(listLength) || listLength <= 0) {
    return 0;
  }

  const normalizedIndex = Number.isFinite(currentIndex) ? currentIndex : -1;
  return (normalizedIndex + 1 + listLength) % listLength;
}

function pickFocusStartImagePath(currentIndex = focusStartImageCursor) {
  return FOCUS_START_IMAGES[getNextRotationIndex(currentIndex, FOCUS_START_IMAGES.length)];
}

function pickFocusStartCopy(currentIndex = focusStartCopyCursor) {
  const index = getNextRotationIndex(currentIndex, FOCUS_START_TITLES.length);
  return {
    title: `${getDisplayFirstName()}, ${FOCUS_START_TITLES[index]}`,
    body: FOCUS_START_BODIES[index]
  };
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

function formatMinutesAsClock(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hoursPart = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  return `${String(hoursPart).padStart(2, "0")}h${String(minutesPart).padStart(2, "0")}`;
}

function getLast7DaysBuckets(log = focusCompletionLog) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: ["D", "L", "M", "M", "J", "V", "S"][date.getDay()],
      count: 0
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  normalizeFocusCompletionLog(log).forEach((entry) => {
    const key = new Date(entry.completedAt).toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);

    if (bucket) {
      bucket.count += 1;
    }
  });

  return buckets;
}

function getPeriodStart(now, period) {
  const start = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

function getFocusStats(log = focusCompletionLog) {
  const normalizedLog = normalizeFocusCompletionLog(log);
  const now = new Date();
  const todayStart = getPeriodStart(now, "today");
  const weekStart = getPeriodStart(now, "week");
  const monthStart = getPeriodStart(now, "month");
  const yearStart = getPeriodStart(now, "year");

  return normalizedLog.reduce((stats, entry) => {
    if (entry.completedAt >= todayStart) {
      stats.today += 1;
    }

    if (entry.completedAt >= weekStart) {
      stats.week += 1;
    }

    if (entry.completedAt >= monthStart) {
      stats.month += 1;
    }

    if (entry.completedAt >= yearStart) {
      stats.year += 1;
    }

    stats.allTime += 1;
    stats.totalMinutes += entry.workMinutes;
    return stats;
  }, {
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
    totalMinutes: 0
  });
}

function getDisplayFirstName() {
  const trimmed = String(userFirstName || "").trim();
  return trimmed || "Champion";
}

function shouldShowWelcomeCard() {
  return !String(userFirstName || "").trim();
}

function renderFocusStats() {
  const stats = getFocusStats();

  Object.entries(focusStatsNodes).forEach(([key, node]) => {
    if (!node) {
      return;
    }

    node.textContent = key === "totalTime"
      ? formatMinutesAsClock(stats.totalMinutes)
      : String(stats[key] ?? 0);
  });

  if (statsWeekDaysNode) {
    const buckets = getLast7DaysBuckets();
    statsWeekDaysNode.innerHTML = buckets.map((bucket) => `
      <span class="stats-week-day${bucket.count > 0 ? " is-active" : ""}">
        <small>${bucket.label}</small>
        <strong>${bucket.count > 0 ? bucket.count : "·"}</strong>
      </span>
    `).join("");
  }
}

function getFocusPhase(session = focusSession) {
  if (!session) {
    return "idle";
  }

  return session.phase === "break" ? "break" : "work";
}

function getFieldLabel(field) {
  return field.closest(".toggle")?.querySelector("strong")?.textContent?.trim() ?? field.name;
}

function getFieldDescriptionIds(field) {
  const ids = [];
  const toggle = field.closest(".toggle");
  const helpCopy = toggle?.querySelector("small:not(.dependency-note)");
  const dependencyNote = toggle?.querySelector(".dependency-note");
  const site = field.closest("[data-group]")?.dataset.group;
  const contextNote = site ? contextNoteNodes[site] : null;

  if (helpCopy?.id) {
    ids.push(helpCopy.id);
  }

  if (dependencyNote?.id) {
    ids.push(dependencyNote.id);
  }

  if (contextNote?.id) {
    ids.push(contextNote.id);
  }

  return ids;
}

function syncFieldAccessibility(field) {
  const toggle = field.closest(".toggle");
  const heading = toggle?.querySelector("strong");
  const descriptionIds = getFieldDescriptionIds(field);

  if (heading?.id) {
    field.setAttribute("aria-labelledby", heading.id);
  }

  if (descriptionIds.length) {
    field.setAttribute("aria-describedby", descriptionIds.join(" "));
  } else {
    field.removeAttribute("aria-describedby");
  }

  field.setAttribute("aria-disabled", String(field.disabled));
  field.setAttribute("aria-checked", String(field.checked));
}

function initializeFieldAccessibility() {
  checkboxFields.forEach((field) => {
    const toggle = field.closest(".toggle");

    if (!toggle) {
      return;
    }

    const heading = toggle.querySelector("strong");
    const helpCopy = toggle.querySelector("small:not(.dependency-note)");

    if (heading && !heading.id) {
      heading.id = `${field.name}-label`;
    }

    if (helpCopy && !helpCopy.id) {
      helpCopy.id = `${field.name}-help`;
    }

    syncFieldAccessibility(field);
  });
}

function announceScreenReader(message) {
  if (!srStatusNode || !message) {
    return;
  }

  srStatusNode.textContent = "";
  cancelAnimationFrame(screenReaderAnnouncementFrame);
  screenReaderAnnouncementFrame = requestAnimationFrame(() => {
    srStatusNode.textContent = message;
  });
}

function renderStatus(message, { persist = false } = {}) {
  statusNode.textContent = message;

  clearTimeout(statusResetTimeout);

  if (persist) {
    return;
  }

  statusResetTimeout = window.setTimeout(() => {
    statusNode.textContent = "Fokus prêt.";
  }, 3200);
}

function callTabs(method, ...args) {
  const tabs = chrome.tabs;

  if (!tabs || typeof tabs[method] !== "function") {
    return Promise.reject(new Error(`API chrome.tabs.${method} indisponible.`));
  }

  return new Promise((resolve, reject) => {
    tabs[method](...args, (result) => {
      const error = chrome.runtime?.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(result);
    });
  });
}

async function nudgeActiveTabForFocusUi() {
  try {
    const tabs = await callTabs("query", { active: true, lastFocusedWindow: true });
    const tab = Array.isArray(tabs) ? tabs[0] : null;

    if (!tab?.id) {
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { type: "fokus-sync-focus-ui" }, (response) => {
          const error = chrome.runtime?.lastError;

          if (error) {
            reject(new Error(error.message));
            return;
          }

          resolve(response);
        });
      });
    } catch (error) {
      const url = String(tab.url || tab.pendingUrl || "");

      if (/^https?:\/\//i.test(url)) {
        await callTabs("reload", tab.id, {});
        return;
      }
    }
  } catch (error) {
    console.error("Fokus: failed to nudge active tab focus UI", error);
  }
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

function isMissingTabError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /No tab with id|tab was closed/i.test(message);
}

function renderStorageSummaryState() {
  if (!summaryStorageBadgeNode || !summaryStorageNoteNode) {
    return;
  }

  const usingLocalStorage = activeStorageArea === "local";
  summaryStorageBadgeNode.hidden = !usingLocalStorage;
  summaryStorageNoteNode.hidden = !usingLocalStorage;

  if (usingLocalStorage) {
    summaryStorageNoteNode.textContent = "Le stockage sync Chrome est indisponible ; Fokus enregistre donc les r\u00E9glages seulement sur cet appareil.";
  }
}

function getSupportedTabSite(hostname) {
  return SUPPORTED_TAB_SITES.find((site) => site.matcher(hostname)) ?? null;
}

function getTabIdentity(tab) {
  return {
    tabId: Number.isInteger(tab?.id) ? tab.id : null,
    windowId: Number.isInteger(tab?.windowId) ? tab.windowId : null
  };
}

function setActiveTabContextForSupportedSite(site, labelOverride = "", tabIdentity = {}) {
  activeTabContext = {
    kind: "supported",
    canReload: true,
    isSupported: true,
    label: labelOverride || site.label,
    siteKey: site.key,
    reason: "",
    tabId: tabIdentity.tabId ?? activeTabContext.tabId ?? null,
    windowId: tabIdentity.windowId ?? activeTabContext.windowId ?? null
  };
}

function activeTabContextMatchesSite(siteKey) {
  return activeTabContext.isSupported && activeTabContext.siteKey === siteKey;
}

function getMissingActiveTabContext() {
  return {
    kind: "missing",
    canReload: false,
    isSupported: false,
    label: "introuvable",
    siteKey: null,
    reason: "Fokus ne trouve pas d'onglet actif rechargeable dans cette fen\u00EAtre. Utilise un raccourci ci-dessous pour ouvrir Instagram, YouTube ou TikTok dans un nouvel onglet.",
    tabId: null,
    windowId: null
  };
}

function getRestrictedActiveTabContext() {
  return {
    kind: "restricted",
    canReload: false,
    isSupported: false,
    label: "adresse masqu\u00E9e",
    siteKey: null,
    reason: "Chrome ne partage pas l'adresse de cet onglet avec Fokus. Utilise un raccourci ci-dessous pour ouvrir Instagram, YouTube ou TikTok directement dans cet onglet.",
    tabId: null,
    windowId: null
  };
}

function getUnavailableActiveTabContext() {
  return {
    kind: "unavailable",
    canReload: false,
    isSupported: false,
    label: "cet onglet",
    siteKey: null,
    reason: "Fokus ne peut pas identifier l'onglet actuel. Utilise un raccourci ci-dessous pour ouvrir Instagram, YouTube ou TikTok dans un nouvel onglet.",
    tabId: null,
    windowId: null
  };
}

function parseTabUrl(url) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url);
  } catch (error) {
    return null;
  }
}

function getActiveTabContextFromUrl(url, tabIdentity = {}) {
  if (!url) {
    return getMissingActiveTabContext();
  }

  const parsedUrl = parseTabUrl(url);

  if (!parsedUrl) {
    return {
      kind: "unreadable",
      canReload: false,
      isSupported: false,
      label: "onglet non reconnu",
      siteKey: null,
      reason: "Fokus ne lit pas correctement l'adresse de cet onglet. Ouvre Instagram, YouTube ou TikTok, ou utilise un raccourci ci-dessous.",
      tabId: tabIdentity.tabId ?? null,
      windowId: tabIdentity.windowId ?? null
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      kind: "internal",
      canReload: false,
      isSupported: false,
      label: "page interne",
      siteKey: null,
      reason: "Les pages internes du navigateur ou les onglets sp\u00E9ciaux ne peuvent pas \u00EAtre recharg\u00E9s utilement depuis Fokus.",
      tabId: tabIdentity.tabId ?? null,
      windowId: tabIdentity.windowId ?? null
    };
  }

  const supportedSite = getSupportedTabSite(parsedUrl.hostname);

  if (supportedSite) {
    return {
      kind: "supported",
      canReload: true,
      isSupported: true,
      label: supportedSite.label,
      siteKey: supportedSite.key,
      reason: "",
      tabId: tabIdentity.tabId ?? null,
      windowId: tabIdentity.windowId ?? null
    };
  }

  return {
    kind: "unsupported",
    canReload: false,
    isSupported: false,
    label: parsedUrl.hostname.replace(/^www\./, ""),
    siteKey: null,
    reason: "Cet onglet n'utilise pas un site pris en charge par Fokus. Ouvre Instagram, YouTube ou TikTok pour appliquer un rechargement utile.",
    tabId: tabIdentity.tabId ?? null,
    windowId: tabIdentity.windowId ?? null
  };
}

function setActiveTabContextFromTab(tab) {
  if (!tab) {
    activeTabContext = getMissingActiveTabContext();
    return false;
  }

  const url = tab?.pendingUrl || tab?.url || "";
  const tabIdentity = getTabIdentity(tab);

  if (!url) {
    activeTabContext = {
      ...getRestrictedActiveTabContext(),
      ...tabIdentity
    };
    return false;
  }

  activeTabContext = getActiveTabContextFromUrl(url, tabIdentity);
  return true;
}

function getActiveTabId() {
  return Number.isInteger(activeTabContext.tabId) ? activeTabContext.tabId : null;
}

async function detectActiveTabContext() {
  try {
    const tabs = await callTabs("query", { active: true, lastFocusedWindow: true });
    const tab = Array.isArray(tabs) ? tabs[0] : null;
    setActiveTabContextFromTab(tab);
  } catch (error) {
    activeTabContext = getUnavailableActiveTabContext();
  }
}

async function refreshActiveTabContext() {
  await detectActiveTabContext();
  renderActiveSiteState();
  renderRefreshState();
}

function scheduleActiveTabContextRefresh(delay = ACTIVE_TAB_CONTEXT_REFRESH_DELAY_MS) {
  clearTimeout(activeTabContextRefreshTimeout);
  activeTabContextRefreshTimeout = window.setTimeout(() => {
    refreshActiveTabContext().catch((error) => {
      console.error("Fokus: active tab context refresh failed", error);
    });
  }, delay);
}

function renderRefreshState() {
  if (!refreshStateCopyNode || !refreshActiveTabButton || !refreshTabContextNode) {
    return;
  }

  const usingLocalStorage = activeStorageArea === "local";
  const contextLabel = activeTabContext.label;
  const hasTargetTab = getActiveTabId() !== null;

  refreshTabContextNode.textContent = `Onglet actuel : ${contextLabel}.`;

  if (!hasTargetTab) {
    refreshStateCopyNode.textContent = activeTabContext.reason;
    refreshActiveTabButton.disabled = true;
    renderSiteShortcuts();
    return;
  }

  if (!activeTabContext.canReload) {
    refreshStateCopyNode.textContent = activeTabContext.reason;
    refreshActiveTabButton.disabled = true;
    renderSiteShortcuts();
    return;
  }

  if (activeTabContext.isSupported) {
    refreshStateCopyNode.textContent = usingLocalStorage
      ? `Recharge ${contextLabel} pour lui faire reprendre les r\u00E9glages stock\u00E9s localement sur cet appareil.`
      : `Recharge ${contextLabel} si la page \u00E9tait d\u00E9j\u00E0 ouverte avant Fokus ou n'a pas encore repris tes derniers r\u00E9glages.`;
    refreshActiveTabButton.disabled = false;
    renderSiteShortcuts();
    return;
  }
}

function getSiteShortcutUrl(siteKey) {
  const site = SUPPORTED_TAB_SITES.find((candidate) => candidate.key === siteKey);

  if (!site) {
    return "";
  }

  const currentSettings = getCurrentSettingsSnapshot();

  if (
    siteKey === "instagram" &&
    currentSettings.instagramMessagesOnly &&
    currentSettings.instagramRedirectHomeToInbox
  ) {
    return "https://www.instagram.com/direct/inbox/";
  }

  return site.homeUrl;
}

function getSiteShortcutLabel(siteKey) {
  const currentSettings = getCurrentSettingsSnapshot();

  if (
    siteKey === "instagram" &&
    currentSettings.instagramMessagesOnly &&
    currentSettings.instagramRedirectHomeToInbox
  ) {
    return "Messagerie Instagram";
  }

  const site = SUPPORTED_TAB_SITES.find((candidate) => candidate.key === siteKey);
  return site?.label ?? siteKey;
}

function getSiteShortcutContext(siteKey) {
  const site = SUPPORTED_TAB_SITES.find((candidate) => candidate.key === siteKey);

  if (!site) {
    return null;
  }

  return {
    ...site,
    destinationLabel: getSiteShortcutLabel(siteKey),
    targetUrl: getSiteShortcutUrl(siteKey)
  };
}

function shouldOpenSiteShortcutInNewTab() {
  if (getActiveTabId() === null) {
    return true;
  }

  return Boolean(siteShortcutsNewTabModeNode?.checked);
}

function renderSiteShortcutLabels() {
  const opensInCurrentTab = !shouldOpenSiteShortcutInNewTab();

  siteShortcutButtons.forEach((button) => {
    const siteKey = button.dataset.siteShortcut;

    if (!siteKey) {
      return;
    }

    const label = getSiteShortcutLabel(siteKey);
    button.textContent = label;
    button.setAttribute(
      "aria-label",
      opensInCurrentTab
        ? `Ouvrir ${label} dans l'onglet actif.`
        : `Ouvrir ${label} dans un nouvel onglet.`
    );
  });
}

function renderSiteShortcutNote(showShortcuts, canChooseNewTab) {
  if (!siteShortcutsNoteNode) {
    return;
  }

  if (!showShortcuts) {
    siteShortcutsNoteNode.hidden = true;
    siteShortcutsNoteNode.textContent = "";
    return;
  }

  const notes = [];
  const instagramShortcutLabel = getSiteShortcutLabel("instagram");

  if (instagramShortcutLabel === "Messagerie Instagram") {
    notes.push("Le raccourci Instagram ouvre directement la messagerie car le mode messages seulement et la redirection sont actifs.");
  }

  if (!canChooseNewTab && shouldOpenSiteShortcutInNewTab()) {
    notes.push("Fokus ouvrira le site choisi dans un nouvel onglet car aucun onglet actif exploitable n'est disponible pour le remplacer.");
  }

  if (siteShortcutsModeNode && !siteShortcutsModeNode.hidden && siteShortcutsNewTabModeNode?.checked) {
    notes.push("Le site choisi s'ouvrira dans un nouvel onglet pour conserver la page actuelle.");
  } else if (canChooseNewTab) {
    notes.push("Le site choisi remplacera la page actuelle dans cet onglet. Active \"Conserver la page actuelle\" si tu veux l'ouvrir dans un nouvel onglet \u00E0 la place.");
  }

  siteShortcutsNoteNode.hidden = notes.length === 0;
  siteShortcutsNoteNode.textContent = notes.join(" ");
}

function renderSiteShortcuts() {
  if (!siteShortcutsNode || !siteShortcutButtons.length) {
    return;
  }

  const showShortcuts = !activeTabContext.isSupported;
  const hasTargetTab = getActiveTabId() !== null;
  const canChooseNewTab = showShortcuts && hasTargetTab;
  const opensInCurrentTab = showShortcuts && !shouldOpenSiteShortcutInNewTab();

  siteShortcutsNode.hidden = !showShortcuts;

  if (siteShortcutsLabelNode) {
    siteShortcutsLabelNode.textContent = opensInCurrentTab
      ? "Ouvre directement un site pris en charge dans cet onglet :"
      : "Ouvre directement un site pris en charge dans un nouvel onglet :";
  }

  if (siteShortcutsModeNode) {
    siteShortcutsModeNode.hidden = !canChooseNewTab;
  }

  if (siteShortcutsNewTabModeNode) {
    siteShortcutsNewTabModeNode.disabled = !canChooseNewTab;
  }

  renderSiteShortcutLabels();
  renderSiteShortcutNote(showShortcuts, canChooseNewTab);

  siteShortcutButtons.forEach((button) => {
    button.disabled = !showShortcuts;
  });
}

function renderActiveSiteState() {
  const activeSiteKey = activeTabContext.isSupported ? activeTabContext.siteKey : null;

  siteCards.forEach((card) => {
    const isActiveSite = card.dataset.group === activeSiteKey;
    const hasSupportedContext = Boolean(activeSiteKey);

    card.classList.toggle("is-active-site", isActiveSite);
    card.classList.toggle("is-inactive-site", hasSupportedContext && !isActiveSite);
    if (isActiveSite) {
      card.setAttribute("aria-current", "true");
    } else {
      card.removeAttribute("aria-current");
    }
  });

  if (!summaryTabNoteNode) {
    return;
  }

  if (activeSiteKey) {
    summaryTabNoteNode.textContent = `Onglet actuel : ${activeTabContext.label}. Cette carte est mise en avant ci-dessous pour te permettre d'ajuster le bon site plus vite.`;
    return;
  }

  if (activeTabContext.kind === "internal") {
    summaryTabNoteNode.textContent = "Onglet actuel : page interne du navigateur. Fokus laisse toutes les cartes visibles car aucun site pris en charge n'est ouvert.";
    return;
  }

  if (activeTabContext.kind === "missing") {
    summaryTabNoteNode.textContent = "Fokus ne rep\u00E8re pas l'onglet actif ; les r\u00E9glages restent disponibles pour Instagram, YouTube et TikTok.";
    return;
  }

  if (activeTabContext.kind === "restricted") {
    summaryTabNoteNode.textContent = "Onglet actuel : adresse masqu\u00E9e par Chrome. Fokus garde les trois cartes visibles et propose des raccourcis pour ouvrir directement un site pris en charge ici.";
    return;
  }

  if (activeTabContext.kind === "unreadable") {
    summaryTabNoteNode.textContent = "Onglet actuel : adresse illisible pour Fokus. Les trois cartes restent disponibles et les raccourcis ci-dessous permettent d'ouvrir directement Instagram, YouTube ou TikTok.";
    return;
  }

  if (activeTabContext.kind === "unavailable") {
    summaryTabNoteNode.textContent = "Fokus ne parvient pas \u00E0 identifier l'onglet courant ; les trois cartes restent disponibles et les raccourcis peuvent rouvrir un site pris en charge proprement.";
    return;
  }

  summaryTabNoteNode.textContent = `Onglet actuel : ${activeTabContext.label}. Fokus garde les trois cartes visibles car ce site n'est pas encore pris en charge.`;
}

function getCurrentSettingsSnapshot() {
  return Object.fromEntries(
    settingFields.map((field) => [field.name, Boolean(field.checked)])
  );
}

function getSiteKeyForSetting(settingName) {
  const match = SITE_SETTING_PREFIXES.find(({ prefix }) => settingName.startsWith(prefix));
  return match?.siteKey ?? null;
}

function shouldSuggestRefreshingActiveSiteForSetting(settingName) {
  if (!activeTabContext.isSupported || !activeTabContext.canReload) {
    return false;
  }

  return getSiteKeyForSetting(settingName) === activeTabContext.siteKey;
}

function didActiveSiteSettingsChange(previousSettings, nextSettings) {
  if (!activeTabContext.isSupported || !activeTabContext.canReload) {
    return false;
  }

  const activeSiteKey = activeTabContext.siteKey;

  return Object.keys(nextSettings).some((settingName) => {
    if (getSiteKeyForSetting(settingName) !== activeSiteKey) {
      return false;
    }

    return Boolean(previousSettings[settingName]) !== Boolean(nextSettings[settingName]);
  });
}

function matchesDefaultSettings(settings) {
  return Object.entries(DEFAULT_SETTINGS).every(
    ([name, value]) => Boolean(settings[name]) === value
  );
}

function applyFocusModeOverrides(settings) {
  if (!isFocusSessionActive()) {
    return settings;
  }

  return {
    ...settings,
    ...FOCUS_MODE_OVERRIDES
  };
}

function getEffectiveSettings(settings) {
  const settingsWithFocus = applyFocusModeOverrides(settings);

  return {
    ...settingsWithFocus,
    instagramMessagesOnly: settingsWithFocus.instagramBlockAll ? false : settingsWithFocus.instagramMessagesOnly,
    instagramBlockReels: settingsWithFocus.instagramBlockAll || settingsWithFocus.instagramMessagesOnly ? false : settingsWithFocus.instagramBlockReels,
    instagramBlockStories: settingsWithFocus.instagramBlockAll || settingsWithFocus.instagramMessagesOnly ? false : settingsWithFocus.instagramBlockStories,
    instagramBlockExplore: settingsWithFocus.instagramBlockAll || settingsWithFocus.instagramMessagesOnly ? false : settingsWithFocus.instagramBlockExplore,
    instagramBlockFeed: settingsWithFocus.instagramBlockAll || settingsWithFocus.instagramMessagesOnly ? false : settingsWithFocus.instagramBlockFeed,
    instagramBlockSearch: settingsWithFocus.instagramBlockAll || settingsWithFocus.instagramMessagesOnly ? false : settingsWithFocus.instagramBlockSearch,
    instagramRedirectHomeToInbox: settingsWithFocus.instagramBlockAll || !settingsWithFocus.instagramMessagesOnly
      ? false
      : settingsWithFocus.instagramRedirectHomeToInbox,
    youtubeHideThumbnails: settingsWithFocus.youtubeBlockAll ? false : settingsWithFocus.youtubeHideThumbnails,
    youtubeBlockShorts: settingsWithFocus.youtubeBlockAll ? false : settingsWithFocus.youtubeBlockShorts,
    youtubeSearchOnlyHome: settingsWithFocus.youtubeBlockAll ? false : settingsWithFocus.youtubeSearchOnlyHome
  };
}

function getYouTubeProtectionLabels(settings) {
  return [
    settings.youtubeHideThumbnails && "miniatures masqu\u00E9es",
    settings.youtubeBlockShorts && "Shorts bloqu\u00E9s",
    settings.youtubeSearchOnlyHome && "accueil limit\u00E9 \u00E0 la recherche"
  ].filter(Boolean);
}

function countActiveProtections(settings) {
  return COUNTED_PROTECTION_SETTINGS.reduce(
    (count, name) => count + (settings[name] ? 1 : 0),
    0
  );
}

function getInstagramSummary(settings) {
  if (settings.instagramBlockAll) {
    return "Instagram coup\u00E9.";
  }

  if (settings.instagramMessagesOnly) {
    return "Instagram limit\u00E9 aux messages.";
  }

  const hiddenAreas = [
    settings.instagramBlockStories && "Stories",
    settings.instagramBlockReels && "Reels",
    settings.instagramBlockExplore && "Explore",
    settings.instagramBlockFeed && "feed",
    settings.instagramBlockSearch && "recherche"
  ].filter(Boolean);

  if (!hiddenAreas.length) {
    return "Instagram libre.";
  }

  return `Instagram all\u00E9g\u00E9 : ${hiddenAreas.join(", ")} masqu\u00E9s.`;
}

function getYouTubeSummary(settings) {
  if (settings.youtubeBlockAll) {
    return "YouTube coup\u00E9.";
  }

  const protections = getYouTubeProtectionLabels(settings);

  if (!protections.length) {
    return "YouTube libre.";
  }

  return `YouTube : ${protections.join(", ")}.`;
}

function getTikTokSummary(settings) {
  return settings.tiktokBlockAll ? "TikTok coup\u00E9." : "TikTok libre.";
}

function getInstagramMode(settings) {
  if (settings.instagramBlockAll) {
    return { label: "Bloqu\u00E9", tone: "strong" };
  }

  if (settings.instagramMessagesOnly) {
    return { label: "Messages seulement", tone: "on" };
  }

  const hasFiltering = [
    settings.instagramBlockStories,
    settings.instagramBlockReels,
    settings.instagramBlockExplore,
    settings.instagramBlockFeed,
    settings.instagramBlockSearch
  ].some(Boolean);

  return hasFiltering
    ? { label: "All\u00E9g\u00E9", tone: "on" }
    : { label: "Ouvert", tone: "off" };
}

function getYouTubeMode(settings) {
  if (settings.youtubeBlockAll) {
    return { label: "Bloqu\u00E9", tone: "strong" };
  }

  const protectionCount = getYouTubeProtectionLabels(settings).length;

  if (protectionCount >= 2) {
    return { label: "Prot\u00E9g\u00E9", tone: "on" };
  }

  if (protectionCount === 1) {
    return { label: "All\u00E9g\u00E9", tone: "on" };
  }

  return { label: "Ouvert", tone: "off" };
}

function getTikTokMode(settings) {
  return settings.tiktokBlockAll
    ? { label: "Bloqu\u00E9", tone: "strong" }
    : { label: "Ouvert", tone: "off" };
}

function getInstagramModeDetail(settings) {
  if (settings.instagramBlockAll) {
    return "Aucun acc\u00E8s \u00E0 Instagram tant que ce blocage complet reste actif.";
  }

  if (settings.instagramMessagesOnly) {
    return "Seule la messagerie reste accessible ; le reste d'Instagram est masqu\u00E9.";
  }

  const hiddenAreas = [
    settings.instagramBlockStories && "Stories",
    settings.instagramBlockReels && "Reels",
    settings.instagramBlockExplore && "Explore",
    settings.instagramBlockFeed && "feed",
    settings.instagramBlockSearch && "recherche"
  ].filter(Boolean);

  if (!hiddenAreas.length) {
    return "Tout Instagram reste accessible dans cette configuration.";
  }

  return `Instagram reste accessible, avec ${hiddenAreas.join(", ")} masqu\u00E9s.`;
}

function getYouTubeModeDetail(settings) {
  if (settings.youtubeBlockAll) {
    return "Aucun acc\u00E8s \u00E0 YouTube tant que ce blocage complet reste actif.";
  }

  const protections = [];

  if (settings.youtubeHideThumbnails) {
    protections.push("les miniatures sont masqu\u00E9es");
  }

  if (settings.youtubeBlockShorts) {
    protections.push("les Shorts sont bloqu\u00E9s");
  }

  if (settings.youtubeSearchOnlyHome) {
    protections.push("l'accueil recommand\u00E9 est masqu\u00E9");
  }

  if (protections.length) {
    return `YouTube reste accessible, mais ${protections.join(", ")}.`;
  }

  return "Tout YouTube reste accessible dans cette configuration.";
}

function getTikTokModeDetail(settings) {
  return settings.tiktokBlockAll
    ? "TikTok est enti\u00E8rement bloqu\u00E9 dans cette configuration."
    : "TikTok reste accessible tant que le blocage complet n'est pas activ\u00E9.";
}

function renderSiteModes() {}

function renderContextNotes(settings) {
  const instagramContextNode = contextNoteNodes.instagram;
  const youtubeContextNode = contextNoteNodes.youtube;
  const tiktokContextNode = contextNoteNodes.tiktok;

  if (instagramContextNode) {
    if (settings.instagramBlockAll) {
      instagramContextNode.textContent = "Le blocage complet masque tout Instagram ; les autres r\u00E9glages Instagram n'ont plus d'effet tant qu'il reste actif.";
    } else if (settings.instagramMessagesOnly && settings.instagramRedirectHomeToInbox) {
      instagramContextNode.textContent = "Les pages Instagram bloqu\u00E9es te renverront directement vers la messagerie pour \u00E9viter un d\u00E9tour inutile.";
    } else if (settings.instagramMessagesOnly) {
      instagramContextNode.textContent = "Les pages Instagram hors messagerie afficheront une carte Fokus ; active aussi la redirection si tu veux arriver directement dans les messages.";
    } else {
      instagramContextNode.textContent = "Les filtres Instagram retirent seulement certaines surfaces ; le reste du site continue de fonctionner normalement.";
    }
  }

  if (youtubeContextNode) {
    if (settings.youtubeBlockAll) {
      youtubeContextNode.textContent = "Le blocage complet masque tout YouTube ; les autres r\u00E9glages YouTube n'ont plus d'effet tant qu'il reste actif.";
    } else if (settings.youtubeSearchOnlyHome && settings.youtubeHideThumbnails && settings.youtubeBlockShorts) {
      youtubeContextNode.textContent = "YouTube devient volontairement utilitaire : accueil recommand\u00E9, miniatures et Shorts sont masqu\u00E9s pour limiter les entr\u00E9es passives.";
    } else if (settings.youtubeBlockShorts && settings.youtubeHideThumbnails) {
      youtubeContextNode.textContent = "YouTube reste utilisable, mais Fokus retire les miniatures et coupe l'acc\u00E8s aux Shorts pour r\u00E9duire les d\u00E9tours visuels et le flux vertical.";
    } else if (settings.youtubeBlockShorts && settings.youtubeSearchOnlyHome) {
      youtubeContextNode.textContent = "Fokus coupe l'acc\u00E8s aux Shorts et laisse la recherche comme point d'entr\u00E9e principal sur l'accueil.";
    } else if (settings.youtubeSearchOnlyHome) {
      youtubeContextNode.textContent = "La page d'accueil YouTube peut sembler presque vide : c'est normal, Fokus ne laisse que la recherche comme point d'entr\u00E9e.";
    } else if (settings.youtubeBlockShorts) {
      youtubeContextNode.textContent = "YouTube reste utilisable, mais Fokus bloque Shorts pour couper le flux vertical et ses raccourcis.";
    } else if (settings.youtubeHideThumbnails) {
      youtubeContextNode.textContent = "YouTube reste utilisable, mais les aper\u00E7us visuels disparaissent pour rendre la navigation moins accrocheuse.";
    } else {
      youtubeContextNode.textContent = "Sans filtre YouTube actif, l'accueil, les recommandations, Shorts et les miniatures restent visibles normalement.";
    }
  }

  if (tiktokContextNode) {
    tiktokContextNode.textContent = settings.tiktokBlockAll
      ? "TikTok est compl\u00E8tement coup\u00E9 ; aucun autre filtre TikTok n'est n\u00E9cessaire dans cette version."
      : "TikTok reste enti\u00E8rement accessible tant que le blocage complet n'est pas activ\u00E9.";
  }
}

function renderDurationButtons() {
  durationButtons.forEach((button) => {
    const duration = Number(button.dataset.focusDuration);
    const selected = duration === focusDurationMinutes;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderMusicProviderButtons() {
  musicProviderButtons.forEach((button) => {
    const selected = button.dataset.musicProvider === focusMusicProvider;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setAccordionExpanded(key, expanded) {
  accordionState[key] = expanded;

  const toggle = accordionToggleNodes.find((node) => node.dataset.accordionToggle === key);
  const panel = accordionPanelNodes.get(key);

  if (toggle) {
    toggle.setAttribute("aria-expanded", String(expanded));
  }

  if (panel) {
    panel.hidden = !expanded;
  }
}

function toggleAccordion(key) {
  setAccordionExpanded(key, !accordionState[key]);
}

function renderAccordions() {
  Object.entries(accordionState).forEach(([key, expanded]) => {
    setAccordionExpanded(key, expanded);
  });
}

async function clearExpiredFocusSessionIfNeeded() {
  if (focusSession || !getStorageArea(activeStorageArea)) {
    return;
  }

  try {
    const stored = await callStorage(activeStorageArea, "get", { [FOCUS_SESSION_KEY]: null });
    const normalizedSession = normalizeFocusSession(stored[FOCUS_SESSION_KEY]);

    if (!normalizedSession && stored[FOCUS_SESSION_KEY]) {
      await callStorage(activeStorageArea, "set", { [FOCUS_SESSION_KEY]: null });
    }
  } catch (error) {
    console.error("Fokus: failed to clear expired focus session", error);
  }
}

function stopFocusTimerTicker() {
  if (focusTimerInterval) {
    clearInterval(focusTimerInterval);
    focusTimerInterval = 0;
  }
}

function startFocusTimerTicker() {
  stopFocusTimerTicker();

  if (!isFocusSessionActive()) {
    return;
  }

  focusTimerInterval = window.setInterval(() => {
    renderFocusState();
  }, 1000);
}

function renderFocusState() {
  let sessionJustFinished = false;

  if (focusSession && !isFocusSessionActive()) {
    focusSession = null;
    sessionJustFinished = true;
    callStorage(activeStorageArea, "set", { [FOCUS_SESSION_KEY]: null }).catch((error) => {
      console.error("Fokus: failed to clear finished focus session", error);
    });
  }

  const active = isFocusSessionActive();
  const plan = getFocusPlan(focusDurationMinutes);
  const phase = getFocusPhase();

  focusStateBadgeNode.textContent = active ? "En cours" : "Inactif";
  focusStateBadgeNode.classList.toggle("is-active", active);
  focusTimerNode.textContent = active
    ? formatDurationClock(getFocusPhaseRemainingMs())
    : `${String(focusDurationMinutes).padStart(2, "0")}:00`;
  focusCopyNode.textContent = active
    ? phase === "work"
      ? "Instagram et TikTok sont bloqués. YouTube reste limité à la recherche pendant tout le focus."
      : "Pause en cours. Les blocages restent actifs pour t'aider à vraiment décrocher."
    : "Lance une session pour bloquer Instagram et TikTok, puis basculer YouTube en mode recherche uniquement.";
  focusTimerNoteNode.textContent = active
    ? phase === "work"
      ? `Cycle ${focusSession.cycleCount}. ${focusSession.workMinutes} minutes de focus, puis ${focusSession.breakMinutes} minutes de pause.`
      : `Pause de ${focusSession.breakMinutes} minutes en cours. Ensuite, Fokus relancera automatiquement un nouveau cycle.`
    : "Choisis une durée puis lance la session.";

  if (focusBreakNoteNode) {
    focusBreakNoteNode.textContent = `${plan.workMinutes} min de focus + ${plan.breakMinutes} min de pause.`;
  }

  if (startFocusSessionButton) {
    startFocusSessionButton.textContent = active ? "Relancer une session" : "Démarrer";
  }

  if (stopFocusSessionButton) {
    stopFocusSessionButton.disabled = !active;
  }

  renderDurationButtons();
  renderMusicProviderButtons();
  renderAccordions();

  if (!active) {
    stopFocusTimerTicker();
    clearExpiredFocusSessionIfNeeded();
    if (sessionJustFinished) {
      applyDependencies();
      renderStatus("Session Focus terminée.");
      announceScreenReader("Session Focus terminée.");
    }
    return;
  }

  startFocusTimerTicker();
}

function renderWelcomeState() {
  if (!welcomeCardNode || !userFirstNameNode) {
    return;
  }

  const show = shouldShowWelcomeCard();
  welcomeCardNode.hidden = !show;

  if (show && document.activeElement !== userFirstNameNode) {
    userFirstNameNode.focus();
  }
}

function handleAccordionToggle(event) {
  const key = event.currentTarget?.dataset?.accordionToggle;

  if (!key) {
    return;
  }

  toggleAccordion(key);
}

function renderSummary() {
  if (!summaryTitleNode || !summaryBodyNode) {
    return;
  }

  const currentSettings = getCurrentSettingsSnapshot();
  const effectiveSettings = getEffectiveSettings(currentSettings);
  const enabledCount = countActiveProtections(effectiveSettings);

  renderSiteShortcutLabels();
  renderSiteModes(effectiveSettings);
  renderContextNotes(effectiveSettings);

  if (enabledCount === 0) {
    summaryTitleNode.textContent = "Aucune protection active.";
    summaryBodyNode.textContent = "Tout est actuellement ouvert sur Instagram, YouTube et TikTok.";
    return;
  }

  summaryTitleNode.textContent = isFocusSessionActive()
    ? `Session Focus active : ${enabledCount} protections forcées.`
    : `${enabledCount} protection${enabledCount > 1 ? "s" : ""} active${enabledCount > 1 ? "s" : ""}.`;
  const summaryLines = [
    getInstagramSummary(effectiveSettings),
    getYouTubeSummary(effectiveSettings),
    getTikTokSummary(effectiveSettings)
  ];

  if (isFocusSessionActive()) {
    summaryLines.unshift("Le mode Focus surchargera temporairement tes réglages manuels.");
  }

  summaryBodyNode.textContent = summaryLines.join(" ");
}

function renderPresetSummaryState() {
  if (!summaryPresetBadgeNode || !summaryPresetNoteNode) {
    return;
  }

  const currentSettings = getCurrentSettingsSnapshot();
  const alreadyDefault = matchesDefaultSettings(currentSettings);

  summaryPresetBadgeNode.textContent = alreadyDefault
    ? "Preset Fokus"
    : "Configuration perso";
  summaryPresetBadgeNode.classList.toggle("is-default", alreadyDefault);
  summaryPresetBadgeNode.classList.toggle("is-custom", !alreadyDefault);
  summaryPresetNoteNode.textContent = alreadyDefault
    ? "Tu utilises la configuration recommand\u00E9e pour garder un cadre simple et coh\u00E9rent."
    : "Tu utilises une configuration personnalis\u00E9e ; le bouton de r\u00E9initialisation permet de revenir au preset recommand\u00E9.";
  if (isFocusSessionActive()) {
    summaryPresetNoteNode.textContent += " Le mode Focus remplace temporairement cette base pendant la session.";
  }
}

function renderDefaultPresetState() {
  if (!resetDefaultsButton || !defaultStateCopyNode) {
    return;
  }

  const currentSettings = getCurrentSettingsSnapshot();
  const alreadyDefault = matchesDefaultSettings(currentSettings);

  resetDefaultsButton.disabled = alreadyDefault;
  defaultStateCopyNode.textContent = alreadyDefault
    ? "La configuration recommand\u00E9e Fokus est d\u00E9j\u00E0 active."
    : "Ta configuration s'\u00E9carte du pr\u00E9r\u00E9glage Fokus recommand\u00E9.";
  if (isFocusSessionActive()) {
    defaultStateCopyNode.textContent += " Le mode Focus prend temporairement le dessus jusqu'à la fin du timer.";
  }
  renderStorageSummaryState();
  renderPresetSummaryState();
  renderActiveSiteState();
  renderRefreshState();
}

function setDisabledState(field, disabled, reason = "") {
  field.disabled = disabled;
  const toggle = field.closest(".toggle");

  if (!toggle) {
    return;
  }

  toggle.classList.toggle("is-disabled", disabled);

  let note = toggle.querySelector(".dependency-note");

  if (!disabled || !reason) {
    note?.remove();
    syncFieldAccessibility(field);
    return;
  }

  if (!note) {
    note = document.createElement("small");
    note.className = "dependency-note";
    note.id = `${field.name}-dependency-note`;
    toggle.querySelector("span")?.appendChild(note);
  }

  note.textContent = reason;
  syncFieldAccessibility(field);
}

function applyDependencies() {
  Object.entries(GROUP_DEPENDENCIES).forEach(([masterName, dependentNames]) => {
    const master = fieldMap.get(masterName);
    const locked = Boolean(master?.checked);

    dependentNames.forEach((name) => {
      const field = fieldMap.get(name);
      if (!field) {
        return;
      }

      setDisabledState(field, locked, locked ? DISABLED_REASONS[masterName] : "");
    });
  });

  if (fieldMap.get("instagramBlockAll")?.checked) {
    [
      "instagramBlockReels",
      "instagramBlockStories",
      "instagramBlockExplore",
      "instagramBlockFeed",
      "instagramBlockSearch"
    ].forEach((name) => {
      const field = fieldMap.get(name);

      if (!field) {
        return;
      }

      setDisabledState(field, true, DISABLED_REASONS.instagramBlockAll);
    });
  }

  const instagramMessagesOnly = fieldMap.get("instagramMessagesOnly");
  const instagramRedirect = fieldMap.get("instagramRedirectHomeToInbox");
  const redirectLocked = !instagramMessagesOnly?.checked || fieldMap.get("instagramBlockAll")?.checked;

  if (instagramRedirect) {
    const reason = fieldMap.get("instagramBlockAll")?.checked
      ? DISABLED_REASONS.instagramBlockAll
      : DISABLED_REASONS.instagramRedirectHomeToInbox;
    setDisabledState(instagramRedirect, Boolean(redirectLocked), reason);
  }

  checkboxFields.forEach(syncFieldAccessibility);

  renderSummary();
  renderDefaultPresetState();
}

async function persistField(field) {
  await callStorage(activeStorageArea, "set", { [field.name]: field.checked });
}

function getStorageStatusSuffix() {
  return activeStorageArea === "local" ? " localement" : "";
}

function getSiteLabelForSetting(settingName) {
  const siteKey = getSiteKeyForSetting(settingName);
  return SUPPORTED_TAB_SITES.find((site) => site.key === siteKey)?.label ?? "";
}

function getRefreshHint(shouldSuggestRefresh) {
  if (!shouldSuggestRefresh) {
    return "";
  }

  return ` Rafra\u00EEchis ${activeTabContext.label} pour appliquer ce changement tout de suite.`;
}

function getDeferredApplyHint(siteLabel = "") {
  if (!siteLabel) {
    return " Le changement s'appliquera \u00E0 l'ouverture ou au prochain rechargement du site concern\u00E9.";
  }

  return ` Le changement s'appliquera \u00E0 l'ouverture ou au prochain rechargement de ${siteLabel}.`;
}

function buildSettingSavedMessage(settingName) {
  const siteLabel = getSiteLabelForSetting(settingName);
  const shouldSuggestRefresh = shouldSuggestRefreshingActiveSiteForSetting(settingName);
  const focusSuffix = isFocusSessionActive()
    ? " Le mode Focus actif prendra quand même temporairement le dessus."
    : "";

  return `R\u00E9glage enregistr\u00E9${getStorageStatusSuffix()}.${shouldSuggestRefresh
    ? getRefreshHint(true)
    : getDeferredApplyHint(siteLabel)}${focusSuffix}`;
}

function buildDefaultsResetMessage(previousSettings) {
  const shouldSuggestRefresh = didActiveSiteSettingsChange(previousSettings, DEFAULT_SETTINGS);

  return `R\u00E9glages Fokus r\u00E9appliqu\u00E9s${getStorageStatusSuffix()}.${shouldSuggestRefresh
    ? getRefreshHint(true)
    : " Les changements s'appliqueront \u00E0 l'ouverture ou au prochain rechargement des sites concern\u00E9s."}`;
}

async function persistUiPreference(name, value) {
  await callStorage(activeStorageArea, "set", { [name]: value });
}

async function saveFirstName() {
  if (!userFirstNameNode) {
    return;
  }

  const nextValue = userFirstNameNode.value.trim();

  if (!nextValue) {
    renderStatus("Entre ton prénom pour continuer.");
    announceScreenReader("Entre ton prénom pour continuer.");
    userFirstNameNode.focus();
    return;
  }

  const previousValue = userFirstName;
  userFirstName = nextValue;
  renderFocusState();

  try {
    await persistUiPreference(USER_FIRST_NAME_KEY, nextValue);
    renderWelcomeState();
    renderStatus(nextValue ? `Prénom enregistré${getStorageStatusSuffix()}.` : `Prénom effacé${getStorageStatusSuffix()}.`);
    announceScreenReader(nextValue ? `Prénom ${nextValue} enregistré.` : "Prénom effacé.");
  } catch (error) {
    userFirstName = previousValue;
    if (userFirstNameNode) {
      userFirstNameNode.value = previousValue;
    }
    renderFocusState();
    renderStatus("Impossible d'enregistrer le prénom.");
    announceScreenReader("Impossible d'enregistrer le prénom.");
    console.error("Fokus: failed to persist first name", error);
  }
}

async function selectFocusDuration(event) {
  const button = event.currentTarget;
  const duration = Number(button?.dataset.focusDuration);

  if (!Number.isFinite(duration) || duration <= 0) {
    return;
  }

  const previousDuration = focusDurationMinutes;
  focusDurationMinutes = duration;
  renderFocusState();

  try {
    await persistUiPreference(FOCUS_DURATION_KEY, duration);
    renderStatus(`Durée Focus réglée sur ${duration} minutes${getStorageStatusSuffix()}.`);
    announceScreenReader(`Durée Focus réglée sur ${duration} minutes.`);
  } catch (error) {
    focusDurationMinutes = previousDuration;
    renderFocusState();
    renderStatus("Impossible d'enregistrer cette durée Focus.");
    announceScreenReader("Impossible d'enregistrer cette durée Focus.");
    console.error("Fokus: failed to persist focus duration", error);
  }
}

async function startFocusSession() {
  if (shouldShowWelcomeCard()) {
    userFirstNameNode?.focus();
    renderStatus("Entre d'abord ton prénom pour personnaliser les messages.");
    announceScreenReader("Entre d'abord ton prénom pour personnaliser les messages.");
    return;
  }

  const plan = getFocusPlan();
  const phaseStartedAt = Date.now();
  const session = {
    phase: "work",
    phaseStartedAt,
    phaseEndsAt: phaseStartedAt + plan.workMinutes * 60 * 1000,
    workMinutes: plan.workMinutes,
    breakMinutes: plan.breakMinutes,
    cycleCount: 1
  };

  try {
    const nextImageCursor = getNextRotationIndex(focusStartImageCursor, FOCUS_START_IMAGES.length);
    const nextCopyCursor = getNextRotationIndex(focusStartCopyCursor, FOCUS_START_TITLES.length);
    const splashCopy = pickFocusStartCopy(focusStartCopyCursor);
    await callStorage(activeStorageArea, "set", {
      [FOCUS_SESSION_KEY]: session,
      [FOCUS_START_IMAGE_CURSOR_KEY]: nextImageCursor,
      [FOCUS_START_COPY_CURSOR_KEY]: nextCopyCursor,
      [FOCUS_OVERLAY_EVENT_KEY]: {
        id: `focus-start-${Date.now()}`,
        type: "focus-start",
        title: splashCopy.title,
        body: splashCopy.body,
        createdAt: Date.now(),
        imagePath: pickFocusStartImagePath(focusStartImageCursor)
      }
    });
    focusSession = session;
    focusStartImageCursor = nextImageCursor;
    focusStartCopyCursor = nextCopyCursor;
    await nudgeActiveTabForFocusUi();
    renderFocusState();
    renderWelcomeState();
    applyDependencies();
    renderStatus(`Session Focus lancée pour ${plan.workMinutes} minutes avec ${plan.breakMinutes} minutes de pause${getStorageStatusSuffix()}.`);
    announceScreenReader(`Session Focus lancée pour ${plan.workMinutes} minutes avec ${plan.breakMinutes} minutes de pause.`);
    window.close();
  } catch (error) {
    renderStatus("Impossible de démarrer la session Focus.");
    announceScreenReader("Impossible de démarrer la session Focus.");
    console.error("Fokus: failed to start focus session", error);
  }
}

async function stopFocusSession() {
  if (!focusSession) {
    return;
  }

  try {
    await callStorage(activeStorageArea, "set", { [FOCUS_SESSION_KEY]: null });
    focusSession = null;
    await nudgeActiveTabForFocusUi();
    renderFocusState();
    applyDependencies();
    renderStatus(`Session Focus arrêtée${getStorageStatusSuffix()}.`);
    announceScreenReader("Session Focus arrêtée.");
  } catch (error) {
    renderStatus("Impossible d'arrêter la session Focus.");
    announceScreenReader("Impossible d'arrêter la session Focus.");
    console.error("Fokus: failed to stop focus session", error);
  }
}

async function openMusicProvider(event) {
  const button = event.currentTarget;
  const providerKey = button?.dataset.musicProvider;
  const provider = providerKey ? FOCUS_MUSIC_PROVIDERS[providerKey] : null;

  if (!provider) {
    return;
  }

  focusMusicProvider = providerKey;
  setAccordionExpanded("music", false);
  renderFocusState();

  try {
    await persistUiPreference(FOCUS_MUSIC_PROVIDER_KEY, providerKey);
  } catch (error) {
    console.error("Fokus: failed to persist provider before opening", error);
  }

  try {
    await callTabs("create", { url: provider.url, active: true });
    renderStatus(`${provider.label} ouvert dans un nouvel onglet.`);
    announceScreenReader(`${provider.label} ouvert dans un nouvel onglet.`);
  } catch (error) {
    renderStatus(`Impossible d'ouvrir ${provider.label}.`);
    announceScreenReader(`Impossible d'ouvrir ${provider.label}.`);
    console.error("Fokus: failed to open music provider", error);
  }
}

async function saveSetting(event) {
  const field = event.target;

  try {
    await persistField(field);
    applyDependencies();
    renderStatus(buildSettingSavedMessage(field.name));
    announceScreenReader(`${getFieldLabel(field)} ${field.checked ? "activ\u00E9" : "d\u00E9sactiv\u00E9"}. ${statusNode.textContent}`);
  } catch (error) {
    field.checked = !field.checked;
    applyDependencies();
    renderStatus("Impossible d'enregistrer ce r\u00E9glage.");
    announceScreenReader(`Impossible de modifier ${getFieldLabel(field)}.`);
    console.error("Fokus: popup save failed", error);
  }
}

async function resetDefaults() {
  try {
    const previousSettings = getCurrentSettingsSnapshot();
    await callStorage(activeStorageArea, "set", DEFAULT_SETTINGS);

    settingFields.forEach((field) => {
      field.checked = Boolean(DEFAULT_SETTINGS[field.name]);
    });

    applyDependencies();
    renderStatus(buildDefaultsResetMessage(previousSettings));
    announceScreenReader("Les r\u00E9glages Fokus recommand\u00E9s sont de nouveau actifs.");
  } catch (error) {
    renderStatus("Impossible de r\u00E9initialiser les r\u00E9glages.");
    announceScreenReader("Impossible de r\u00E9initialiser les r\u00E9glages Fokus.");
    console.error("Fokus: popup reset failed", error);
  }
}

async function refreshActiveTab() {
  const activeTabId = getActiveTabId();

  if (!refreshActiveTabButton || !activeTabContext.canReload || activeTabId === null) {
    return;
  }

  refreshActiveTabButton.disabled = true;

  try {
    await callTabs("reload", activeTabId, {});
    const reloadStatus = activeTabContext.isSupported
      ? `${activeTabContext.label} recharg\u00E9.`
      : "Onglet actif recharg\u00E9.";
    renderStatus(reloadStatus);
    announceScreenReader(reloadStatus);
  } catch (error) {
    if (isMissingTabError(error)) {
      await refreshActiveTabContext();
      renderStatus("L'onglet cibl\u00E9 n'existe plus ; choisis un site ci-dessous pour repartir.");
      announceScreenReader("L'onglet cibl\u00E9 n'existe plus.");
      return;
    }

    renderStatus("Impossible de recharger l'onglet actif.");
    announceScreenReader("Impossible de recharger l'onglet actif.");
    console.error("Fokus: active tab reload failed", error);
  } finally {
    renderRefreshState();
  }
}

async function openSupportedSite(event) {
  const button = event.currentTarget;
  const siteKey = button?.dataset.siteShortcut;
  const siteContext = getSiteShortcutContext(siteKey);
  const activeTabId = getActiveTabId();

  if (!siteContext) {
    return;
  }

  const { destinationLabel, key, targetUrl } = siteContext;
  const opensInCurrentTab = activeTabId !== null && !shouldOpenSiteShortcutInNewTab();

  siteShortcutButtons.forEach((shortcutButton) => {
    shortcutButton.disabled = true;
  });

  try {
    renderStatus(`Ouverture de ${destinationLabel}...`);

    if (opensInCurrentTab) {
      let updatedTab;

      try {
        updatedTab = await callTabs("update", activeTabId, { url: targetUrl });
      } catch (error) {
        if (!isMissingTabError(error)) {
          throw error;
        }

        updatedTab = await callTabs("create", { url: targetUrl, active: true });
      }

      if (!setActiveTabContextFromTab(updatedTab) || !activeTabContextMatchesSite(key)) {
        setActiveTabContextForSupportedSite(siteContext, destinationLabel, getTabIdentity(updatedTab));
      }
    } else {
      const createdTab = await callTabs("create", { url: targetUrl, active: true });

      if (!setActiveTabContextFromTab(createdTab) || !activeTabContextMatchesSite(key)) {
        setActiveTabContextForSupportedSite(siteContext, destinationLabel, getTabIdentity(createdTab));
      }
    }

    renderActiveSiteState();
    renderRefreshState();
    scheduleActiveTabContextRefresh();
    const successMessage = opensInCurrentTab
      ? `${destinationLabel} ouvert dans l'onglet actif.`
      : `${destinationLabel} ouvert dans un nouvel onglet.`;
    renderStatus(successMessage);
    announceScreenReader(successMessage);
  } catch (error) {
    renderStatus(`Impossible d'ouvrir ${destinationLabel}.`);
    announceScreenReader(`Impossible d'ouvrir ${destinationLabel}.`);
    console.error("Fokus: supported site shortcut failed", error);
  } finally {
    renderSiteShortcuts();
  }
}

async function handleSiteShortcutsModeChange() {
  if (!siteShortcutsNewTabModeNode) {
    return;
  }

  const opensInNewTab = Boolean(siteShortcutsNewTabModeNode.checked);

  renderSiteShortcuts();

  try {
    await persistUiPreference(SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY, opensInNewTab);
    announceScreenReader(
      opensInNewTab
        ? "Les raccourcis ouvriront maintenant un nouvel onglet."
        : "Les raccourcis remplaceront maintenant l'onglet actuel."
    );
    renderStatus(
      opensInNewTab
        ? `Les raccourcis Fokus ouvriront maintenant un nouvel onglet${getStorageStatusSuffix()}.`
        : `Les raccourcis Fokus remplaceront maintenant l'onglet actuel${getStorageStatusSuffix()}.`
    );
  } catch (error) {
    siteShortcutsNewTabModeNode.checked = !opensInNewTab;
    renderSiteShortcuts();
    renderStatus("Impossible d'enregistrer ce choix de raccourci.");
    announceScreenReader("Impossible d'enregistrer ce choix de raccourci.");
    console.error("Fokus: failed to persist shortcut mode preference", error);
  }
}

async function initialize() {
  try {
    await detectStorageArea();
    await detectActiveTabContext();
    const storedValues = await callStorage(activeStorageArea, "get", {
      ...DEFAULT_SETTINGS,
      ...UI_PREFERENCES_DEFAULTS,
      [FOCUS_COMPLETION_LOG_KEY]: []
    });

    focusDurationMinutes = Number(storedValues[FOCUS_DURATION_KEY]) || UI_PREFERENCES_DEFAULTS.focusDurationMinutes;
    focusMusicProvider = storedValues[FOCUS_MUSIC_PROVIDER_KEY] || UI_PREFERENCES_DEFAULTS.focusMusicProvider;
    focusSession = normalizeFocusSession(storedValues[FOCUS_SESSION_KEY]);
    focusCompletionLog = normalizeFocusCompletionLog(storedValues[FOCUS_COMPLETION_LOG_KEY]);
    userFirstName = storedValues[USER_FIRST_NAME_KEY] || UI_PREFERENCES_DEFAULTS.userFirstName;
    focusStartImageCursor = Number.isFinite(Number(storedValues[FOCUS_START_IMAGE_CURSOR_KEY]))
      ? Number(storedValues[FOCUS_START_IMAGE_CURSOR_KEY])
      : UI_PREFERENCES_DEFAULTS.focusStartImageCursor;
    focusStartCopyCursor = Number.isFinite(Number(storedValues[FOCUS_START_COPY_CURSOR_KEY]))
      ? Number(storedValues[FOCUS_START_COPY_CURSOR_KEY])
      : UI_PREFERENCES_DEFAULTS.focusStartCopyCursor;

    settingFields.forEach((field) => {
      field.checked = Boolean(storedValues[field.name]);
      field.addEventListener("change", saveSetting);
    });

    if (siteShortcutsNewTabModeNode) {
      siteShortcutsNewTabModeNode.checked = Boolean(storedValues[SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY]);
    }

    if (userFirstNameNode) {
      userFirstNameNode.value = userFirstName;
      userFirstNameNode.addEventListener("change", saveFirstName);
      userFirstNameNode.addEventListener("blur", saveFirstName);
    }
    saveFirstNameButton?.addEventListener("click", saveFirstName);

    initializeFieldAccessibility();
    durationButtons.forEach((button) => {
      button.addEventListener("click", selectFocusDuration);
    });
    musicProviderButtons.forEach((button) => {
      button.addEventListener("click", openMusicProvider);
    });
    accordionToggleNodes.forEach((button) => {
      button.addEventListener("click", handleAccordionToggle);
    });
    startFocusSessionButton?.addEventListener("click", startFocusSession);
    stopFocusSessionButton?.addEventListener("click", stopFocusSession);
    resetDefaultsButton?.addEventListener("click", resetDefaults);
    refreshActiveTabButton?.addEventListener("click", refreshActiveTab);
    siteShortcutsNewTabModeNode?.addEventListener("change", handleSiteShortcutsModeChange);
    siteShortcutButtons.forEach((button) => {
      button.addEventListener("click", openSupportedSite);
    });
    renderFocusState();
    renderFocusStats();
    renderWelcomeState();
    applyDependencies();
    renderStatus(
      activeStorageArea === "local"
        ? "Param\u00E8tres charg\u00E9s en stockage local."
        : "Param\u00E8tres charg\u00E9s.",
      { persist: true }
    );
  } catch (error) {
    settingFields.forEach((field) => {
      field.disabled = true;
    });
    resetDefaultsButton?.setAttribute("disabled", "disabled");
    refreshActiveTabButton?.setAttribute("disabled", "disabled");
    siteShortcutsNewTabModeNode?.setAttribute("disabled", "disabled");
    siteShortcutButtons.forEach((button) => {
      button.setAttribute("disabled", "disabled");
    });
    durationButtons.forEach((button) => {
      button.setAttribute("disabled", "disabled");
    });
    musicProviderButtons.forEach((button) => {
      button.setAttribute("disabled", "disabled");
    });
    startFocusSessionButton?.setAttribute("disabled", "disabled");
    stopFocusSessionButton?.setAttribute("disabled", "disabled");
    renderStatus("Impossible de charger les r\u00E9glages.", { persist: true });
    console.error("Fokus: popup initialization failed", error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== activeStorageArea) {
    return;
  }

  if (siteShortcutsNewTabModeNode && SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY in changes) {
    siteShortcutsNewTabModeNode.checked = Boolean(
      changes[SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY].newValue
    );
  }

  if (FOCUS_DURATION_KEY in changes) {
    focusDurationMinutes = Number(changes[FOCUS_DURATION_KEY].newValue) || UI_PREFERENCES_DEFAULTS.focusDurationMinutes;
    renderFocusState();
  }

  if (FOCUS_MUSIC_PROVIDER_KEY in changes) {
    focusMusicProvider = changes[FOCUS_MUSIC_PROVIDER_KEY].newValue || UI_PREFERENCES_DEFAULTS.focusMusicProvider;
    renderFocusState();
  }

  if (FOCUS_SESSION_KEY in changes) {
    focusSession = normalizeFocusSession(changes[FOCUS_SESSION_KEY].newValue);
    renderFocusState();
  }

  if (FOCUS_COMPLETION_LOG_KEY in changes) {
    focusCompletionLog = normalizeFocusCompletionLog(changes[FOCUS_COMPLETION_LOG_KEY].newValue);
    renderFocusStats();
  }

  if (USER_FIRST_NAME_KEY in changes) {
    userFirstName = changes[USER_FIRST_NAME_KEY].newValue || UI_PREFERENCES_DEFAULTS.userFirstName;
    if (userFirstNameNode && userFirstNameNode.value !== userFirstName) {
      userFirstNameNode.value = userFirstName;
    }
    renderFocusState();
    renderWelcomeState();
  }

  if (FOCUS_START_IMAGE_CURSOR_KEY in changes) {
    focusStartImageCursor = Number.isFinite(Number(changes[FOCUS_START_IMAGE_CURSOR_KEY].newValue))
      ? Number(changes[FOCUS_START_IMAGE_CURSOR_KEY].newValue)
      : UI_PREFERENCES_DEFAULTS.focusStartImageCursor;
  }

  if (FOCUS_START_COPY_CURSOR_KEY in changes) {
    focusStartCopyCursor = Number.isFinite(Number(changes[FOCUS_START_COPY_CURSOR_KEY].newValue))
      ? Number(changes[FOCUS_START_COPY_CURSOR_KEY].newValue)
      : UI_PREFERENCES_DEFAULTS.focusStartCopyCursor;
  }

  settingFields.forEach((field) => {
    if (!(field.name in changes)) {
      return;
    }

    field.checked = Boolean(changes[field.name].newValue);
    syncFieldAccessibility(field);
  });

  applyDependencies();
});

initialize();
