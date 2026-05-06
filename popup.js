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

const statusNode = document.getElementById("status");
const resetDefaultsButton = document.getElementById("reset-defaults");
const fields = Array.from(document.querySelectorAll("input[type='checkbox']"));
const fieldMap = new Map(fields.map((field) => [field.name, field]));

function renderStatus(message) {
  statusNode.textContent = message;
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

      field.disabled = locked;
      field.closest(".toggle")?.classList.toggle("is-disabled", locked);
    });
  });

  const instagramMessagesOnly = fieldMap.get("instagramMessagesOnly");
  const instagramRedirect = fieldMap.get("instagramRedirectHomeToInbox");
  const redirectLocked = !instagramMessagesOnly?.checked || fieldMap.get("instagramBlockAll")?.checked;

  if (instagramRedirect) {
    instagramRedirect.disabled = Boolean(redirectLocked);
    instagramRedirect.closest(".toggle")?.classList.toggle("is-disabled", Boolean(redirectLocked));
  }
}

async function persistField(field) {
  await chrome.storage.sync.set({ [field.name]: field.checked });
}

async function saveSetting(event) {
  const field = event.target;
  await persistField(field);
  applyDependencies();
  renderStatus("Reglage enregistre.");
}

async function resetDefaults() {
  await chrome.storage.sync.set(DEFAULT_SETTINGS);

  fields.forEach((field) => {
    field.checked = Boolean(DEFAULT_SETTINGS[field.name]);
  });

  applyDependencies();
  renderStatus("Reglages Fokus reappliques.");
}

async function initialize() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  fields.forEach((field) => {
    field.checked = Boolean(settings[field.name]);
    field.addEventListener("change", saveSetting);
  });

  resetDefaultsButton?.addEventListener("click", resetDefaults);
  applyDependencies();
  renderStatus("Parametres charges.");
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
