const DEFAULT_SETTINGS = {
  messagesOnly: true,
  blockReels: true,
  blockStories: true,
  blockExplore: true,
  blockFeed: true,
  blockSearch: true,
  redirectHomeToInbox: true
};

const statusNode = document.getElementById("status");
const fields = Array.from(document.querySelectorAll("input[type='checkbox']"));

const renderStatus = (message) => {
  statusNode.textContent = message;
};

const saveSetting = async (event) => {
  const { name, checked } = event.target;
  await chrome.storage.sync.set({ [name]: checked });
  renderStatus("Parametres enregistres.");
};

const initialize = async () => {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  fields.forEach((field) => {
    field.checked = Boolean(settings[field.name]);
    field.addEventListener("change", saveSetting);
  });

  renderStatus("Parametres charges.");
};

initialize();
