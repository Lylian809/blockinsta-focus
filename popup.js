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
  ]
};

const DISABLED_REASONS = {
  instagramBlockAll: "Désactivé car Instagram est entièrement bloqué.",
  youtubeBlockAll: "Désactivé car YouTube est entièrement bloqué.",
  instagramRedirectHomeToInbox: "Disponible seulement quand le mode messages seulement est actif."
};

const statusNode = document.getElementById("status");
const resetDefaultsButton = document.getElementById("reset-defaults");
const summaryTitleNode = document.getElementById("summary-title");
const summaryBodyNode = document.getElementById("summary-body");
const fields = Array.from(document.querySelectorAll("input[type='checkbox']"));
const fieldMap = new Map(fields.map((field) => [field.name, field]));

function renderStatus(message) {
  statusNode.textContent = message;
}

function getCurrentSettingsSnapshot() {
  return Object.fromEntries(
    fields.map((field) => [field.name, Boolean(field.checked)])
  );
}

function getInstagramSummary(settings) {
  if (settings.instagramBlockAll) {
    return "Instagram coupé.";
  }

  if (settings.instagramMessagesOnly) {
    return "Instagram limité aux messages.";
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

  return `Instagram allégé : ${hiddenAreas.join(", ")} masqués.`;
}

function getYouTubeSummary(settings) {
  if (settings.youtubeBlockAll) {
    return "YouTube coupé.";
  }

  const protections = [
    settings.youtubeHideThumbnails && "miniatures masquées",
    settings.youtubeSearchOnlyHome && "accueil limité à la recherche"
  ].filter(Boolean);

  if (!protections.length) {
    return "YouTube libre.";
  }

  return `YouTube : ${protections.join(", ")}.`;
}

function getTikTokSummary(settings) {
  return settings.tiktokBlockAll ? "TikTok coupé." : "TikTok libre.";
}

function renderSummary() {
  if (!summaryTitleNode || !summaryBodyNode) {
    return;
  }

  const currentSettings = getCurrentSettingsSnapshot();
  const enabledCount = Object.values(currentSettings).filter(Boolean).length;

  if (enabledCount === 0) {
    summaryTitleNode.textContent = "Aucune protection active.";
    summaryBodyNode.textContent = "Tout est actuellement ouvert sur Instagram, YouTube et TikTok.";
    return;
  }

  summaryTitleNode.textContent = `${enabledCount} protection${enabledCount > 1 ? "s" : ""} active${enabledCount > 1 ? "s" : ""}.`;
  summaryBodyNode.textContent = [
    getInstagramSummary(currentSettings),
    getYouTubeSummary(currentSettings),
    getTikTokSummary(currentSettings)
  ].join(" ");
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
    return;
  }

  if (!note) {
    note = document.createElement("small");
    note.className = "dependency-note";
    toggle.querySelector("span")?.appendChild(note);
  }

  note.textContent = reason;
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

  const instagramMessagesOnly = fieldMap.get("instagramMessagesOnly");
  const instagramRedirect = fieldMap.get("instagramRedirectHomeToInbox");
  const redirectLocked = !instagramMessagesOnly?.checked || fieldMap.get("instagramBlockAll")?.checked;

  if (instagramRedirect) {
    const reason = fieldMap.get("instagramBlockAll")?.checked
      ? DISABLED_REASONS.instagramBlockAll
      : DISABLED_REASONS.instagramRedirectHomeToInbox;
    setDisabledState(instagramRedirect, Boolean(redirectLocked), reason);
  }

  renderSummary();
}

async function persistField(field) {
  await chrome.storage.sync.set({ [field.name]: field.checked });
}

async function saveSetting(event) {
  const field = event.target;
  await persistField(field);
  applyDependencies();
  renderStatus("Réglage enregistré.");
}

async function resetDefaults() {
  await chrome.storage.sync.set(DEFAULT_SETTINGS);

  fields.forEach((field) => {
    field.checked = Boolean(DEFAULT_SETTINGS[field.name]);
  });

  applyDependencies();
  renderStatus("Réglages Fokus réappliqués.");
}

async function initialize() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  fields.forEach((field) => {
    field.checked = Boolean(settings[field.name]);
    field.addEventListener("change", saveSetting);
  });

  resetDefaultsButton?.addEventListener("click", resetDefaults);
  applyDependencies();
  renderStatus("Paramètres chargés.");
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  fields.forEach((field) => {
    if (!(field.name in changes)) {
      return;
    }

    field.checked = Boolean(changes[field.name].newValue);
  });

  applyDependencies();
});

initialize();
