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
    matcher: (hostname) => hostname.includes("instagram.com")
  },
  {
    key: "youtube",
    label: "YouTube",
    homeUrl: "https://www.youtube.com/",
    matcher: (hostname) => hostname.includes("youtube.com")
  },
  {
    key: "tiktok",
    label: "TikTok",
    homeUrl: "https://www.tiktok.com/",
    matcher: (hostname) => hostname.includes("tiktok.com")
  }
];
const ACTIVE_TAB_CONTEXT_REFRESH_DELAY_MS = 350;

const statusNode = document.getElementById("status");
const srStatusNode = document.getElementById("sr-status");
const resetDefaultsButton = document.getElementById("reset-defaults");
const refreshActiveTabButton = document.getElementById("refresh-active-tab");
const refreshStateCopyNode = document.getElementById("refresh-state-copy");
const refreshTabContextNode = document.getElementById("refresh-tab-context");
const siteShortcutsNode = document.getElementById("site-shortcuts");
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
  canReload: false,
  isSupported: false,
  label: "cet onglet",
  siteKey: null,
  reason: ""
};

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

function setActiveTabContextForSupportedSite(site, labelOverride = "") {
  activeTabContext = {
    canReload: true,
    isSupported: true,
    label: labelOverride || site.label,
    siteKey: site.key,
    reason: ""
  };
}

function getMissingActiveTabContext() {
  return {
    canReload: false,
    isSupported: false,
    label: "introuvable",
    siteKey: null,
    reason: "Fokus ne trouve pas d'onglet actif rechargeable dans cette fen\u00EAtre."
  };
}

function getUnavailableActiveTabContext() {
  return {
    canReload: false,
    isSupported: false,
    label: "cet onglet",
    siteKey: null,
    reason: "Fokus ne peut pas identifier l'onglet actuel. Ouvre un onglet Instagram, YouTube ou TikTok puis r\u00E9essaie."
  };
}

function getActiveTabContextFromUrl(url) {
  if (!url) {
    return getMissingActiveTabContext();
  }

  const parsedUrl = new URL(url);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      canReload: false,
      isSupported: false,
      label: "page interne",
      siteKey: null,
      reason: "Les pages internes du navigateur ou les onglets sp\u00E9ciaux ne peuvent pas \u00EAtre recharg\u00E9s utilement depuis Fokus."
    };
  }

  const supportedSite = getSupportedTabSite(parsedUrl.hostname);

  if (supportedSite) {
    return {
      canReload: true,
      isSupported: true,
      label: supportedSite.label,
      siteKey: supportedSite.key,
      reason: ""
    };
  }

  return {
    canReload: false,
    isSupported: false,
    label: parsedUrl.hostname.replace(/^www\./, ""),
    siteKey: null,
    reason: "Cet onglet n'utilise pas un site pris en charge par Fokus. Ouvre Instagram, YouTube ou TikTok pour appliquer un rechargement utile."
  };
}

function setActiveTabContextFromTab(tab) {
  const url = tab?.pendingUrl || tab?.url || "";

  if (!url) {
    activeTabContext = getMissingActiveTabContext();
    return false;
  }

  activeTabContext = getActiveTabContextFromUrl(url);
  return true;
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

  refreshTabContextNode.textContent = `Onglet actuel : ${contextLabel}.`;

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

function renderSiteShortcutLabels() {
  siteShortcutButtons.forEach((button) => {
    const siteKey = button.dataset.siteShortcut;

    if (!siteKey) {
      return;
    }

    const label = getSiteShortcutLabel(siteKey);
    button.textContent = label;
    button.setAttribute("aria-label", `Ouvrir ${label} dans l'onglet actif.`);
  });
}

function renderSiteShortcutNote(showShortcuts) {
  if (!siteShortcutsNoteNode) {
    return;
  }

  if (!showShortcuts) {
    siteShortcutsNoteNode.hidden = true;
    siteShortcutsNoteNode.textContent = "";
    return;
  }

  const instagramShortcutLabel = getSiteShortcutLabel("instagram");

  if (instagramShortcutLabel === "Messagerie Instagram") {
    siteShortcutsNoteNode.hidden = false;
    siteShortcutsNoteNode.textContent = "Le raccourci Instagram ouvre directement la messagerie car le mode messages seulement et la redirection sont actifs.";
    return;
  }

  siteShortcutsNoteNode.hidden = true;
  siteShortcutsNoteNode.textContent = "";
}

function renderSiteShortcuts() {
  if (!siteShortcutsNode || !siteShortcutButtons.length) {
    return;
  }

  const showShortcuts = !activeTabContext.isSupported;
  siteShortcutsNode.hidden = !showShortcuts;
  renderSiteShortcutLabels();
  renderSiteShortcutNote(showShortcuts);

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

  if (activeTabContext.label === "page interne") {
    summaryTabNoteNode.textContent = "Onglet actuel : page interne du navigateur. Fokus laisse toutes les cartes visibles car aucun site pris en charge n'est ouvert.";
    return;
  }

  if (activeTabContext.label === "introuvable") {
    summaryTabNoteNode.textContent = "Fokus ne rep\u00E8re pas l'onglet actif ; les r\u00E9glages restent disponibles pour Instagram, YouTube et TikTok.";
    return;
  }

  summaryTabNoteNode.textContent = `Onglet actuel : ${activeTabContext.label}. Fokus garde les trois cartes visibles car ce site n'est pas encore pris en charge.`;
}

function getStorageArea(areaName = activeStorageArea) {
  return chrome.storage?.[areaName] ?? null;
}

function callStorage(areaName, method, ...args) {
  const area = getStorageArea(areaName);

  if (!area || typeof area[method] !== "function") {
    return Promise.reject(new Error(`Zone de stockage ${areaName} indisponible.`));
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

  throw new Error("Aucun stockage Chrome disponible.");
}

function getCurrentSettingsSnapshot() {
  return Object.fromEntries(
    fields.map((field) => [field.name, Boolean(field.checked)])
  );
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
    youtubeSearchOnlyHome: settings.youtubeBlockAll ? false : settings.youtubeSearchOnlyHome
  };
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

  const protections = [
    settings.youtubeHideThumbnails && "miniatures masqu\u00E9es",
    settings.youtubeSearchOnlyHome && "accueil limit\u00E9 \u00E0 la recherche"
  ].filter(Boolean);

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

  if (settings.youtubeHideThumbnails && settings.youtubeSearchOnlyHome) {
    return { label: "Prot\u00E9g\u00E9", tone: "on" };
  }

  if (settings.youtubeHideThumbnails || settings.youtubeSearchOnlyHome) {
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

  if (settings.youtubeHideThumbnails && settings.youtubeSearchOnlyHome) {
    return "YouTube reste accessible, mais les miniatures et l'accueil recommand\u00E9 sont masqu\u00E9s.";
  }

  if (settings.youtubeHideThumbnails) {
    return "YouTube reste accessible, mais les miniatures sont masqu\u00E9es.";
  }

  if (settings.youtubeSearchOnlyHome) {
    return "YouTube reste accessible, mais l'accueil recommand\u00E9 est masqu\u00E9.";
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
    } else if (settings.youtubeSearchOnlyHome && settings.youtubeHideThumbnails) {
      youtubeContextNode.textContent = "L'accueil YouTube devient volontairement calme : recommandations masqu\u00E9es sur la page d'accueil et miniatures retir\u00E9es ailleurs.";
    } else if (settings.youtubeSearchOnlyHome) {
      youtubeContextNode.textContent = "La page d'accueil YouTube peut sembler presque vide : c'est normal, Fokus ne laisse que la recherche comme point d'entr\u00E9e.";
    } else if (settings.youtubeHideThumbnails) {
      youtubeContextNode.textContent = "YouTube reste utilisable, mais les aper\u00E7us visuels disparaissent pour rendre la navigation moins accrocheuse.";
    } else {
      youtubeContextNode.textContent = "Sans filtre YouTube actif, l'accueil, les recommandations et les miniatures restent visibles normalement.";
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

async function saveSetting(event) {
  const field = event.target;

  try {
    await persistField(field);
    applyDependencies();
    renderStatus(`R\u00E9glage enregistr\u00E9${getStorageStatusSuffix()}.`);
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
    await callStorage(activeStorageArea, "set", DEFAULT_SETTINGS);

    fields.forEach((field) => {
      field.checked = Boolean(DEFAULT_SETTINGS[field.name]);
    });

    applyDependencies();
    renderStatus(`R\u00E9glages Fokus r\u00E9appliqu\u00E9s${getStorageStatusSuffix()}.`);
    announceScreenReader("Les r\u00E9glages Fokus recommand\u00E9s sont de nouveau actifs.");
  } catch (error) {
    renderStatus("Impossible de r\u00E9initialiser les r\u00E9glages.");
    announceScreenReader("Impossible de r\u00E9initialiser les r\u00E9glages Fokus.");
    console.error("Fokus: popup reset failed", error);
  }
}

async function refreshActiveTab() {
  if (!refreshActiveTabButton || !activeTabContext.canReload) {
    return;
  }

  refreshActiveTabButton.disabled = true;

  try {
    await callTabs("reload", undefined, {});
    const reloadStatus = activeTabContext.isSupported
      ? `${activeTabContext.label} recharg\u00E9.`
      : "Onglet actif recharg\u00E9.";
    renderStatus(reloadStatus);
    announceScreenReader(reloadStatus);
  } catch (error) {
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

  if (!siteContext) {
    return;
  }

  const { destinationLabel, key, label, targetUrl } = siteContext;

  siteShortcutButtons.forEach((shortcutButton) => {
    shortcutButton.disabled = true;
  });

  try {
    const updatedTab = await callTabs("update", { url: targetUrl });

    if (!setActiveTabContextFromTab(updatedTab)) {
      setActiveTabContextForSupportedSite(siteContext, destinationLabel);
    }

    renderActiveSiteState();
    renderRefreshState();
    scheduleActiveTabContextRefresh();
    renderStatus(`${destinationLabel} ouvert dans l'onglet actif.`);
    announceScreenReader(`${destinationLabel} ouvert dans l'onglet actif.`);
  } catch (error) {
    renderStatus(`Impossible d'ouvrir ${label}.`);
    announceScreenReader(`Impossible d'ouvrir ${label}.`);
    console.error("Fokus: supported site shortcut failed", error);
  } finally {
    renderSiteShortcuts();
  }
}

async function initialize() {
  try {
    await detectStorageArea();
    await detectActiveTabContext();
    const settings = await callStorage(activeStorageArea, "get", DEFAULT_SETTINGS);

    fields.forEach((field) => {
      field.checked = Boolean(settings[field.name]);
      field.addEventListener("change", saveSetting);
    });

    initializeFieldAccessibility();
    resetDefaultsButton?.addEventListener("click", resetDefaults);
    refreshActiveTabButton?.addEventListener("click", refreshActiveTab);
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
