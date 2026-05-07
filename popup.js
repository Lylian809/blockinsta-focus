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
  siteShortcutsOpenInNewTab: false
};
const SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY = "siteShortcutsOpenInNewTab";

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
const siteModeNodes = {
  instagram: document.getElementById("instagram-mode"),
  youtube: document.getElementById("youtube-mode"),
  tiktok: document.getElementById("tiktok-mode")
};
const siteModeDetailNodes = {
  instagram: document.getElementById("instagram-mode-detail"),
  youtube: document.getElementById("youtube-mode-detail"),
  tiktok: document.getElementById("tiktok-mode-detail")
};
const contextNoteNodes = {
  instagram: document.getElementById("instagram-context-note"),
  youtube: document.getElementById("youtube-context-note")
};
const fields = Array.from(document.querySelectorAll("input[type='checkbox']"));
const fieldMap = new Map(fields.map((field) => [field.name, field]));
const siteCards = Array.from(document.querySelectorAll(".site-card[data-group]"));
const siteShortcutButtons = Array.from(document.querySelectorAll("[data-site-shortcut]"));

let activeStorageArea = "sync";
let screenReaderAnnouncementFrame = 0;
let activeTabContextRefreshTimeout = 0;
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
  fields.forEach((field) => {
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

function renderStatus(message) {
  statusNode.textContent = message;
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
    fields.map((field) => [field.name, Boolean(field.checked)])
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

function getEffectiveSettings(settings) {
  return {
    ...settings,
    instagramMessagesOnly: settings.instagramBlockAll ? false : settings.instagramMessagesOnly,
    instagramBlockReels: settings.instagramBlockAll || settings.instagramMessagesOnly ? false : settings.instagramBlockReels,
    instagramBlockStories: settings.instagramBlockAll || settings.instagramMessagesOnly ? false : settings.instagramBlockStories,
    instagramBlockExplore: settings.instagramBlockAll || settings.instagramMessagesOnly ? false : settings.instagramBlockExplore,
    instagramBlockFeed: settings.instagramBlockAll || settings.instagramMessagesOnly ? false : settings.instagramBlockFeed,
    instagramBlockSearch: settings.instagramBlockAll || settings.instagramMessagesOnly ? false : settings.instagramBlockSearch,
    instagramRedirectHomeToInbox: settings.instagramBlockAll || !settings.instagramMessagesOnly
      ? false
      : settings.instagramRedirectHomeToInbox,
    youtubeHideThumbnails: settings.youtubeBlockAll ? false : settings.youtubeHideThumbnails,
    youtubeBlockShorts: settings.youtubeBlockAll ? false : settings.youtubeBlockShorts,
    youtubeSearchOnlyHome: settings.youtubeBlockAll ? false : settings.youtubeSearchOnlyHome
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

function renderSiteModes(settings) {
  const siteModes = {
    instagram: getInstagramMode(settings),
    youtube: getYouTubeMode(settings),
    tiktok: getTikTokMode(settings)
  };
  const siteModeDetails = {
    instagram: getInstagramModeDetail(settings),
    youtube: getYouTubeModeDetail(settings),
    tiktok: getTikTokModeDetail(settings)
  };

  Object.entries(siteModeNodes).forEach(([site, node]) => {
    if (!node) {
      return;
    }

    const mode = siteModes[site];
    node.textContent = mode.label;
    node.classList.toggle("is-on", mode.tone === "on");
    node.classList.toggle("is-strong", mode.tone === "strong");
  });

  Object.entries(siteModeDetailNodes).forEach(([site, node]) => {
    if (!node) {
      return;
    }

    node.textContent = siteModeDetails[site];
  });
}

function renderContextNotes(settings) {
  const instagramContextNode = contextNoteNodes.instagram;
  const youtubeContextNode = contextNoteNodes.youtube;

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
}

function renderSummary() {
  if (!summaryTitleNode || !summaryBodyNode) {
    return;
  }

  const currentSettings = getCurrentSettingsSnapshot();
  const effectiveSettings = getEffectiveSettings(currentSettings);
  const enabledCount = countActiveProtections(effectiveSettings);

  renderSiteShortcutLabels();
  renderSiteModes(currentSettings);
  renderContextNotes(currentSettings);

  if (enabledCount === 0) {
    summaryTitleNode.textContent = "Aucune protection active.";
    summaryBodyNode.textContent = "Tout est actuellement ouvert sur Instagram, YouTube et TikTok.";
    return;
  }

  summaryTitleNode.textContent = `${enabledCount} protection${enabledCount > 1 ? "s" : ""} active${enabledCount > 1 ? "s" : ""}.`;
  summaryBodyNode.textContent = [
    getInstagramSummary(effectiveSettings),
    getYouTubeSummary(effectiveSettings),
    getTikTokSummary(effectiveSettings)
  ].join(" ");
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

  fields.forEach(syncFieldAccessibility);

  renderSummary();
  renderDefaultPresetState();
}

async function persistField(field) {
  await callStorage(activeStorageArea, "set", { [field.name]: field.checked });
}

function getStorageStatusSuffix() {
  return activeStorageArea === "local" ? " localement" : "";
}

function getRefreshHint(shouldSuggestRefresh) {
  if (!shouldSuggestRefresh) {
    return "";
  }

  return ` Rafra\u00EEchis ${activeTabContext.label} pour appliquer ce changement tout de suite.`;
}

async function persistUiPreference(name, value) {
  await callStorage(activeStorageArea, "set", { [name]: value });
}

async function saveSetting(event) {
  const field = event.target;

  try {
    await persistField(field);
    applyDependencies();
    renderStatus(
      `R\u00E9glage enregistr\u00E9${getStorageStatusSuffix()}.${getRefreshHint(
        shouldSuggestRefreshingActiveSiteForSetting(field.name)
      )}`
    );
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

    fields.forEach((field) => {
      field.checked = Boolean(DEFAULT_SETTINGS[field.name]);
    });

    applyDependencies();
    renderStatus(
      `R\u00E9glages Fokus r\u00E9appliqu\u00E9s${getStorageStatusSuffix()}.${getRefreshHint(
        didActiveSiteSettingsChange(previousSettings, DEFAULT_SETTINGS)
      )}`
    );
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
      ...UI_PREFERENCES_DEFAULTS
    });

    fields.forEach((field) => {
      field.checked = Boolean(storedValues[field.name]);
      field.addEventListener("change", saveSetting);
    });

    if (siteShortcutsNewTabModeNode) {
      siteShortcutsNewTabModeNode.checked = Boolean(storedValues[SITE_SHORTCUTS_OPEN_IN_NEW_TAB_KEY]);
    }

    initializeFieldAccessibility();
    resetDefaultsButton?.addEventListener("click", resetDefaults);
    refreshActiveTabButton?.addEventListener("click", refreshActiveTab);
    siteShortcutsNewTabModeNode?.addEventListener("change", handleSiteShortcutsModeChange);
    siteShortcutButtons.forEach((button) => {
      button.addEventListener("click", openSupportedSite);
    });
    applyDependencies();
    renderStatus(
      activeStorageArea === "local"
        ? "Param\u00E8tres charg\u00E9s en stockage local."
        : "Param\u00E8tres charg\u00E9s."
    );
  } catch (error) {
    fields.forEach((field) => {
      field.disabled = true;
    });
    resetDefaultsButton?.setAttribute("disabled", "disabled");
    refreshActiveTabButton?.setAttribute("disabled", "disabled");
    siteShortcutButtons.forEach((button) => {
      button.setAttribute("disabled", "disabled");
    });
    renderStatus("Impossible de charger les r\u00E9glages.");
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

  fields.forEach((field) => {
    if (!(field.name in changes)) {
      return;
    }

    field.checked = Boolean(changes[field.name].newValue);
    syncFieldAccessibility(field);
  });

  applyDependencies();
});

initialize();
