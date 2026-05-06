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
  instagramBlockAll: "D\u00E9sactiv\u00E9 car Instagram est enti\u00E8rement bloqu\u00E9.",
  youtubeBlockAll: "D\u00E9sactiv\u00E9 car YouTube est enti\u00E8rement bloqu\u00E9.",
  instagramRedirectHomeToInbox: "Disponible seulement quand le mode messages seulement est actif."
};

const statusNode = document.getElementById("status");
const resetDefaultsButton = document.getElementById("reset-defaults");
const summaryTitleNode = document.getElementById("summary-title");
const summaryBodyNode = document.getElementById("summary-body");
const fields = Array.from(document.querySelectorAll("input[type='checkbox']"));
const fieldMap = new Map(fields.map((field) => [field.name, field]));

let activeStorageArea = "sync";

function renderStatus(message) {
  statusNode.textContent = message;
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
  } catch (error) {
    field.checked = !field.checked;
    applyDependencies();
    renderStatus("Impossible d'enregistrer ce r\u00E9glage.");
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
  } catch (error) {
    renderStatus("Impossible de r\u00E9initialiser les r\u00E9glages.");
    console.error("Fokus: popup reset failed", error);
  }
}

async function initialize() {
  try {
    await detectStorageArea();
    const settings = await callStorage(activeStorageArea, "get", DEFAULT_SETTINGS);

    fields.forEach((field) => {
      field.checked = Boolean(settings[field.name]);
      field.addEventListener("change", saveSetting);
    });

    resetDefaultsButton?.addEventListener("click", resetDefaults);
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
  });

  applyDependencies();
});

initialize();
