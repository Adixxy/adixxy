const STORAGE_KEY = 'churchOverlayState';

const defaultState = {
  name: '',
  date: '',
  announcement: '',
  logoUrl: '',
  alert: '',
  visible: {
    name: false,
    date: false,
    announcement: false,
    logo: false,
    alert: false,
  },
  standby: [],
};

function getState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

function setState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  render(next);
}

function updateState(mutator) {
  const current = getState();
  const next = mutator(current);
  setState(next);
}

function setVisibility(element, isVisible) {
  element.classList.toggle('hidden', !isVisible);
}

function render(state = getState()) {
  const nameTag = document.getElementById('nameTag');
  const dateBadge = document.getElementById('dateBadge');
  const announcementBar = document.getElementById('announcementBar');
  const logo = document.getElementById('logo');
  const alertBox = document.getElementById('alertBox');

  if (!nameTag) return;

  nameTag.textContent = state.name;
  dateBadge.textContent = state.date;
  announcementBar.textContent = state.announcement;
  alertBox.textContent = state.alert;

  if (state.logoUrl) {
    logo.src = state.logoUrl;
  }

  setVisibility(nameTag, state.visible.name && !!state.name);
  setVisibility(dateBadge, state.visible.date && !!state.date);
  setVisibility(announcementBar, state.visible.announcement && !!state.announcement);
  setVisibility(logo, state.visible.logo && !!state.logoUrl);
  setVisibility(alertBox, state.visible.alert && !!state.alert);

  hydratePanelFields(state);
  renderStandbyList(state);
}

function hydratePanelFields(state) {
  const nameInput = document.getElementById('nameInput');
  const dateInput = document.getElementById('dateInput');
  const announcementInput = document.getElementById('announcementInput');
  const logoInput = document.getElementById('logoInput');
  const alertInput = document.getElementById('alertInput');
  const standbyInput = document.getElementById('standbyInput');

  if (!nameInput) return;

  nameInput.value = state.name;
  dateInput.value = state.date;
  announcementInput.value = state.announcement;
  logoInput.value = state.logoUrl;
  alertInput.value = state.alert;
  standbyInput.value = state.standby.join('\n');

  const overlayUrl = document.getElementById('overlayUrl');
  const outputUrl = `${window.location.origin}${window.location.pathname.replace('index.html', 'output.html')}`;
  overlayUrl.textContent = outputUrl;
}

function renderStandbyList(state) {
  const standbyList = document.getElementById('standbyList');
  if (!standbyList) return;

  standbyList.innerHTML = '';
  state.standby.forEach((name) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'standby-item';
    item.textContent = name;
    item.addEventListener('click', () => {
      updateState((draft) => ({
        ...draft,
        name,
        visible: { ...draft.visible, name: true },
      }));
    });
    standbyList.appendChild(item);
  });
}

function setupControlEvents() {
  const panel = document.querySelector('.control-panel');
  if (!panel) return;

  const readValues = () => ({
    name: document.getElementById('nameInput').value.trim(),
    date: document.getElementById('dateInput').value.trim(),
    announcement: document.getElementById('announcementInput').value.trim(),
    logoUrl: document.getElementById('logoInput').value.trim(),
    alert: document.getElementById('alertInput').value.trim(),
  });

  panel.addEventListener('click', async (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const values = readValues();

    if (action === 'copy-url') {
      const text = document.getElementById('overlayUrl').textContent;
      await navigator.clipboard.writeText(text);
      target.textContent = 'Copiado ✓';
      setTimeout(() => (target.textContent = 'Copiar URL'), 1200);
      return;
    }

    if (action === 'save-standby') {
      const names = document
        .getElementById('standbyInput')
        .value.split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      updateState((draft) => ({ ...draft, standby: names }));
      return;
    }

    const map = {
      'show-name': ['name', true],
      'hide-name': ['name', false],
      'show-date': ['date', true],
      'hide-date': ['date', false],
      'show-announcement': ['announcement', true],
      'hide-announcement': ['announcement', false],
      'show-logo': ['logo', true],
      'hide-logo': ['logo', false],
      'show-alert': ['alert', true],
      'hide-alert': ['alert', false],
    };

    const [key, visible] = map[action] || [];
    if (!key) return;

    updateState((draft) => ({
      ...draft,
      ...values,
      visible: {
        ...draft.visible,
        [key]: visible,
      },
    }));
  });
}

function setupHiddenReturnToPanel() {
  const secretBtn = document.getElementById('secretPanelBtn');
  if (!secretBtn) return;

  let typed = '';
  const showSecretButton = () => secretBtn.classList.remove('hidden');

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
      showSecretButton();
    }

    typed = `${typed}${event.key.toLowerCase()}`.slice(-5);
    if (typed === 'panel') {
      showSecretButton();
    }
  });

  secretBtn.addEventListener('click', () => {
    const panelUrl = `${window.location.origin}${window.location.pathname.replace('output.html', 'index.html')}`;
    window.open(panelUrl, '_blank');
  });
}

window.addEventListener('storage', () => render(getState()));
window.addEventListener('DOMContentLoaded', () => {
  render(getState());
  setupControlEvents();
  setupHiddenReturnToPanel();
});
