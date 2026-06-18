/*
  EcoMercado - Prototipo interactivo
  Sin librerías externas. Guarda datos en localStorage.
*/
const STORAGE_KEY = "ecomercado-prototype-v1";

const defaultState = {
  merchantName: "Comerciante demo",
  businessType: "Lácteos",
  tariff: 0.80,
  budget: 150,
  selectedDeviceId: null,
  lastSimulation: null,
  devices: [
    {
      id: crypto.randomUUID(),
      name: "Congeladora antigua",
      category: "Refrigeración",
      watts: 350,
      qty: 1,
      hours: 24,
      days: 30,
      state: "Antiguo / ineficiente",
      priority: "Alta"
    },
    {
      id: crypto.randomUUID(),
      name: "Foco fluorescente",
      category: "Iluminación",
      watts: 40,
      qty: 4,
      hours: 10,
      days: 30,
      state: "Antiguo / ineficiente",
      priority: "Media"
    },
    {
      id: crypto.randomUUID(),
      name: "Ventilador",
      category: "Ventilación",
      watts: 70,
      qty: 1,
      hours: 8,
      days: 26,
      state: "Regular",
      priority: "Baja"
    }
  ]
};

let state = loadState();

const pageTitles = {
  login: "Inicio de sesión",
  dashboard: "Dashboard de consumo",
  equipos: "Registro de equipos",
  detalle: "Detalle y recomendaciones",
  simulador: "Simulador de ahorro",
  confirmacion: "Plan de acción",
  perfil: "Perfil y configuración"
};

const els = {
  pageTitle: document.querySelector("#pageTitle"),
  navItems: document.querySelectorAll(".nav__item"),
  screens: document.querySelectorAll(".screen"),
  savingStatus: document.querySelector("#savingStatus"),
  loginForm: document.querySelector("#loginForm"),
  merchantName: document.querySelector("#merchantName"),
  businessType: document.querySelector("#businessType"),
  totalKwh: document.querySelector("#totalKwh"),
  totalCost: document.querySelector("#totalCost"),
  worstDevice: document.querySelector("#worstDevice"),
  possibleSaving: document.querySelector("#possibleSaving"),
  consumptionBars: document.querySelector("#consumptionBars"),
  mainAlert: document.querySelector("#mainAlert"),
  heroKwh: document.querySelector("#heroKwh"),
  equipmentForm: document.querySelector("#equipmentForm"),
  deviceList: document.querySelector("#deviceList"),
  deviceCount: document.querySelector("#deviceCount"),
  selectedDeviceDetail: document.querySelector("#selectedDeviceDetail"),
  recommendations: document.querySelector("#recommendations"),
  currentDeviceSelect: document.querySelector("#currentDeviceSelect"),
  simulatorForm: document.querySelector("#simulatorForm"),
  simulatorResult: document.querySelector("#simulatorResult"),
  tariff: document.querySelector("#tariff"),
  actionPlan: document.querySelector("#actionPlan"),
  copyPrototypeLink: document.querySelector("#copyPrototypeLink"),
  qrImage: document.querySelector("#qrImage"),
  resetDemo: document.querySelector("#resetDemo"),
  settingMerchant: document.querySelector("#settingMerchant"),
  settingBusiness: document.querySelector("#settingBusiness"),
  settingTariff: document.querySelector("#settingTariff"),
  settingBudget: document.querySelector("#settingBudget"),
  settingsForm: document.querySelector("#settingsForm"),
  sidebar: document.querySelector(".sidebar"),
  openMenu: document.querySelector("#openMenu"),
  mobileBackdrop: document.querySelector("#mobileBackdrop")
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch (error) {
    console.warn("No se pudo cargar el estado local", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  els.savingStatus.textContent = "Guardado";
  setTimeout(() => {
    els.savingStatus.textContent = "Datos locales";
  }, 900);
}

function formatMoney(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatKwh(value) {
  return `${Number(value || 0).toFixed(1)} kWh`;
}

function getDeviceKwh(device) {
  return (Number(device.watts) * Number(device.qty) * Number(device.hours) * Number(device.days)) / 1000;
}

function getDeviceCost(device) {
  return getDeviceKwh(device) * Number(state.tariff || 0);
}

function getTotalKwh() {
  return state.devices.reduce((sum, device) => sum + getDeviceKwh(device), 0);
}

function getTotalCost() {
  return getTotalKwh() * Number(state.tariff || 0);
}

function getWorstDevice() {
  if (!state.devices.length) return null;
  return [...state.devices].sort((a, b) => getDeviceKwh(b) - getDeviceKwh(a))[0];
}

function renderAll() {
  renderDashboard();
  renderDeviceList();
  renderDetail();
  renderSimulatorOptions();
  renderRecommendations();
  renderSettings();
  renderActionPlan();
  updateQr();
}

function renderDashboard() {
  const totalKwh = getTotalKwh();
  const totalCost = getTotalCost();
  const worst = getWorstDevice();

  els.totalKwh.textContent = formatKwh(totalKwh);
  els.totalCost.textContent = formatMoney(totalCost);
  els.heroKwh.textContent = formatKwh(totalKwh);
  els.worstDevice.textContent = worst ? worst.name : "Sin datos";
  els.possibleSaving.textContent = state.lastSimulation ? formatMoney(state.lastSimulation.monthlySaving) : "S/ 0.00";

  if (!state.devices.length) {
    els.mainAlert.textContent = "Registra equipos para identificar el mayor consumo.";
    els.consumptionBars.innerHTML = `<p class="empty-state">No hay equipos registrados.</p>`;
    return;
  }

  if (worst) {
    const percent = totalKwh > 0 ? (getDeviceKwh(worst) / totalKwh) * 100 : 0;
    els.mainAlert.textContent = `${worst.name} concentra aproximadamente el ${percent.toFixed(0)}% del consumo mensual registrado. Conviene revisarlo primero.`;
  }

  els.consumptionBars.innerHTML = "";
  const sorted = [...state.devices].sort((a, b) => getDeviceKwh(b) - getDeviceKwh(a));
  sorted.forEach((device) => {
    const percent = totalKwh > 0 ? (getDeviceKwh(device) / totalKwh) * 100 : 0;
    const item = document.createElement("div");
    item.className = "bar-item";
    item.innerHTML = `
      <div class="bar-item__meta">
        <strong>${escapeHtml(device.name)}</strong>
        <span>${formatKwh(getDeviceKwh(device))} · ${percent.toFixed(0)}%</span>
      </div>
      <div class="bar-item__track" aria-label="${escapeHtml(device.name)} ${percent.toFixed(0)} por ciento">
        <div class="bar-item__fill" style="width: ${Math.max(percent, 4)}%"></div>
      </div>
    `;
    els.consumptionBars.appendChild(item);
  });
}

function renderDeviceList() {
  els.deviceList.innerHTML = "";
  els.deviceCount.textContent = `${state.devices.length} equipo${state.devices.length === 1 ? "" : "s"}`;

  if (!state.devices.length) {
    els.deviceList.innerHTML = `<p class="empty-state">Todavía no registras equipos.</p>`;
    return;
  }

  const template = document.querySelector("#deviceTemplate");
  state.devices.forEach((device) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".device-card");
    card.querySelector(".device-card__name").textContent = device.name;
    card.querySelector(".device-card__meta").textContent = `${device.category} · ${device.state} · ${device.qty} unidad(es)`;
    card.querySelector(".device-card__kwh").textContent = formatKwh(getDeviceKwh(device));
    card.querySelector(".device-card__view").addEventListener("click", () => {
      state.selectedDeviceId = device.id;
      saveState();
      renderAll();
      showScreen("detalle");
    });
    card.querySelector(".device-card__delete").addEventListener("click", () => {
      const ok = confirm(`¿Eliminar ${device.name}?`);
      if (!ok) return;
      state.devices = state.devices.filter((item) => item.id !== device.id);
      if (state.selectedDeviceId === device.id) state.selectedDeviceId = null;
      saveState();
      renderAll();
    });
    els.deviceList.appendChild(node);
  });
}

function renderDetail() {
  const device = state.devices.find((item) => item.id === state.selectedDeviceId) || getWorstDevice();
  if (!device) {
    els.selectedDeviceDetail.className = "detail-card empty-state";
    els.selectedDeviceDetail.textContent = "Selecciona o registra un equipo para ver su detalle.";
    return;
  }

  state.selectedDeviceId = device.id;
  const totalKwh = getTotalKwh();
  const share = totalKwh > 0 ? (getDeviceKwh(device) / totalKwh) * 100 : 0;
  els.selectedDeviceDetail.className = "detail-card";
  els.selectedDeviceDetail.innerHTML = `
    <span class="badge">${escapeHtml(device.category)}</span>
    <h3>${escapeHtml(device.name)}</h3>
    <dl>
      <div><dt>Consumo</dt><dd>${formatKwh(getDeviceKwh(device))}</dd></div>
      <div><dt>Costo mensual</dt><dd>${formatMoney(getDeviceCost(device))}</dd></div>
      <div><dt>Participación</dt><dd>${share.toFixed(0)}%</dd></div>
      <div><dt>Estado</dt><dd>${escapeHtml(device.state)}</dd></div>
      <div><dt>Uso</dt><dd>${device.hours} h/día</dd></div>
      <div><dt>Prioridad</dt><dd>${escapeHtml(device.priority)}</dd></div>
    </dl>
  `;
}

function renderRecommendations() {
  const recs = buildRecommendations();
  els.recommendations.innerHTML = "";
  if (!recs.length) {
    els.recommendations.innerHTML = `<p class="empty-state">No hay suficientes datos para recomendar cambios.</p>`;
    return;
  }

  recs.forEach((rec) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    card.innerHTML = `
      <strong>${escapeHtml(rec.title)}</strong>
      <p>${escapeHtml(rec.message)}</p>
    `;
    els.recommendations.appendChild(card);
  });
}

function buildRecommendations() {
  const recs = [];
  const totalKwh = getTotalKwh();
  const worst = getWorstDevice();

  if (worst) {
    const share = totalKwh > 0 ? (getDeviceKwh(worst) / totalKwh) * 100 : 0;
    recs.push({
      title: `Prioridad 1: revisar ${worst.name}`,
      message: `Es el equipo con mayor consumo registrado (${share.toFixed(0)}%). Antes de comprar algo nuevo, valida potencia, horas reales de uso y mantenimiento.`
    });
  }

  state.devices.forEach((device) => {
    if (device.category === "Iluminación" && device.watts > 20 && device.hours >= 6) {
      recs.push({
        title: `Cambio sugerido: ${device.name}`,
        message: "Por su potencia y horas de uso, conviene simular reemplazo por una alternativa LED antes de tomar la decisión de compra."
      });
    }

    if (device.category === "Refrigeración" && device.state !== "Eficiente" && device.hours >= 12) {
      recs.push({
        title: `Mantenimiento o reemplazo: ${device.name}`,
        message: "Funciona muchas horas al día. Revisa sellos, temperatura, ventilación y consumo real; si el costo mensual es alto, pasa al simulador."
      });
    }

    if (getDeviceCost(device) > Number(state.budget || 0) && Number(state.budget || 0) > 0) {
      recs.push({
        title: `Alerta de presupuesto: ${device.name}`,
        message: `Su costo mensual estimado supera el presupuesto de mejora ingresado (${formatMoney(state.budget)}). No significa cambiarlo ya, pero sí analizarlo primero.`
      });
    }
  });

  return recs.slice(0, 5);
}

function renderSimulatorOptions() {
  els.currentDeviceSelect.innerHTML = "";
  if (!state.devices.length) {
    els.currentDeviceSelect.innerHTML = `<option value="">Registra un equipo primero</option>`;
    return;
  }

  state.devices.forEach((device) => {
    const option = document.createElement("option");
    option.value = device.id;
    option.textContent = `${device.name} (${formatKwh(getDeviceKwh(device))})`;
    els.currentDeviceSelect.appendChild(option);
  });

  if (state.selectedDeviceId) els.currentDeviceSelect.value = state.selectedDeviceId;
  els.tariff.value = state.tariff;
}

function renderSettings() {
  els.settingMerchant.value = state.merchantName;
  els.settingBusiness.value = state.businessType;
  els.settingTariff.value = state.tariff;
  els.settingBudget.value = state.budget;
}

function renderActionPlan() {
  const worst = getWorstDevice();
  const recs = buildRecommendations();
  const simulation = state.lastSimulation;
  const items = [];

  if (worst) {
    items.push({
      title: "1. Medir primero el equipo crítico",
      text: `${worst.name} aparece como el mayor consumidor. La decisión debe empezar por verificar horas reales, potencia y estado físico.`
    });
  }

  if (simulation) {
    items.push({
      title: "2. Cambio con ahorro estimado",
      text: `El último cálculo proyecta un ahorro mensual de ${formatMoney(simulation.monthlySaving)}. Recuperación estimada: ${simulation.paybackText}.`
    });
  }

  if (recs.length) {
    items.push({
      title: "3. Recomendación generada",
      text: recs[0].message
    });
  }

  if (!items.length) {
    els.actionPlan.innerHTML = `<p class="empty-state">Registra equipos y ejecuta el simulador para generar un plan real.</p>`;
    return;
  }

  els.actionPlan.innerHTML = items.map((item) => `
    <article class="plan-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function updateQr() {
  const currentUrl = window.location.href.split("#")[0] || "https://example.com/ecomercado";
  const encoded = encodeURIComponent(currentUrl);
  els.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}`;
}

function showScreen(name) {
  els.screens.forEach((screen) => screen.classList.remove("is-visible"));
  const target = document.querySelector(`#screen-${name}`);
  if (target) target.classList.add("is-visible");

  els.navItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.screen === name);
  });

  els.pageTitle.textContent = pageTitles[name] || "EcoMercado";
  closeMobileMenu();
  window.location.hash = name;
}

function addDeviceFromForm(event) {
  event.preventDefault();
  const device = {
    id: crypto.randomUUID(),
    name: document.querySelector("#deviceName").value.trim(),
    category: document.querySelector("#deviceCategory").value,
    watts: Number(document.querySelector("#deviceWatts").value),
    qty: Number(document.querySelector("#deviceQty").value),
    hours: Number(document.querySelector("#deviceHours").value),
    days: Number(document.querySelector("#deviceDays").value),
    state: document.querySelector("#deviceState").value,
    priority: document.querySelector("#devicePriority").value
  };

  if (!device.name || device.watts <= 0 || device.qty <= 0) {
    alert("Completa nombre, potencia y cantidad con valores válidos.");
    return;
  }

  state.devices.push(device);
  state.selectedDeviceId = device.id;
  saveState();
  event.target.reset();
  document.querySelector("#deviceWatts").value = 100;
  document.querySelector("#deviceQty").value = 1;
  document.querySelector("#deviceHours").value = 8;
  document.querySelector("#deviceDays").value = 30;
  renderAll();
}

function runSimulation(event) {
  event.preventDefault();
  const selectedId = els.currentDeviceSelect.value;
  const device = state.devices.find((item) => item.id === selectedId);
  if (!device) {
    alert("Registra o selecciona un equipo antes de simular.");
    return;
  }

  const efficientWatts = Number(document.querySelector("#efficientWatts").value);
  const replacementCost = Number(document.querySelector("#replacementCost").value);
  const tariff = Number(document.querySelector("#tariff").value);

  if (efficientWatts <= 0 || tariff < 0 || replacementCost < 0) {
    alert("Ingresa valores válidos para potencia, tarifa y costo.");
    return;
  }

  state.tariff = tariff;
  const currentKwh = getDeviceKwh(device);
  const efficientKwh = (efficientWatts * device.qty * device.hours * device.days) / 1000;
  const monthlySaving = Math.max(0, (currentKwh - efficientKwh) * tariff);
  const paybackMonths = monthlySaving > 0 ? replacementCost / monthlySaving : Infinity;
  const paybackText = Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} meses` : "no recuperable con estos datos";

  state.lastSimulation = {
    deviceId: device.id,
    deviceName: device.name,
    currentKwh,
    efficientKwh,
    monthlySaving,
    replacementCost,
    paybackText
  };
  saveState();

  els.simulatorResult.innerHTML = `
    <h3>Resultado para ${escapeHtml(device.name)}</h3>
    <p>Consumo actual estimado:</p>
    <strong>${formatKwh(currentKwh)}</strong>
    <p>Consumo con equipo eficiente:</p>
    <strong>${formatKwh(efficientKwh)}</strong>
    <p>Ahorro mensual estimado:</p>
    <strong>${formatMoney(monthlySaving)}</strong>
    <p>Recuperación de inversión:</p>
    <strong>${paybackText}</strong>
    <button class="button button--primary" type="button" data-screen-target="confirmacion">Generar plan</button>
  `;
  renderAll();
}

function saveLogin(event) {
  event.preventDefault();
  state.merchantName = els.merchantName.value.trim() || "Comerciante";
  state.businessType = els.businessType.value;
  saveState();
  renderAll();
  showScreen("dashboard");
}

function saveSettings(event) {
  event.preventDefault();
  state.merchantName = els.settingMerchant.value.trim() || state.merchantName;
  state.businessType = els.settingBusiness.value.trim() || state.businessType;
  state.tariff = Number(els.settingTariff.value || state.tariff);
  state.budget = Number(els.settingBudget.value || state.budget);
  saveState();
  renderAll();
  showScreen("dashboard");
}

function resetDemo() {
  const ok = confirm("¿Reiniciar datos de ejemplo? Se eliminarán los cambios locales.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  renderAll();
  showScreen("login");
}

function copyPrototypeLink() {
  const url = window.location.href.split("#")[0];
  navigator.clipboard?.writeText(url).then(() => {
    els.copyPrototypeLink.textContent = "Enlace copiado";
    setTimeout(() => (els.copyPrototypeLink.textContent = "Copiar enlace del prototipo"), 1200);
  }).catch(() => {
    alert("No se pudo copiar automáticamente. Copia el enlace desde la barra del navegador.");
  });
}

function openMobileMenu() {
  els.sidebar.classList.add("is-open");
  els.mobileBackdrop.hidden = false;
}

function closeMobileMenu() {
  els.sidebar.classList.remove("is-open");
  els.mobileBackdrop.hidden = true;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const navTarget = event.target.closest("[data-screen-target]");
    if (navTarget) showScreen(navTarget.dataset.screenTarget);
  });

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => showScreen(item.dataset.screen));
  });

  els.loginForm.addEventListener("submit", saveLogin);
  els.equipmentForm.addEventListener("submit", addDeviceFromForm);
  els.simulatorForm.addEventListener("submit", runSimulation);
  els.settingsForm.addEventListener("submit", saveSettings);
  els.resetDemo.addEventListener("click", resetDemo);
  els.copyPrototypeLink.addEventListener("click", copyPrototypeLink);
  els.openMenu.addEventListener("click", openMobileMenu);
  els.mobileBackdrop.addEventListener("click", closeMobileMenu);

  window.addEventListener("hashchange", () => {
    const name = window.location.hash.replace("#", "") || "login";
    if (pageTitles[name]) showScreen(name);
  });
}

function init() {
  els.merchantName.value = state.merchantName === "Comerciante demo" ? "" : state.merchantName;
  els.businessType.value = state.businessType;
  wireEvents();
  renderAll();
  const initial = window.location.hash.replace("#", "") || "login";
  showScreen(pageTitles[initial] ? initial : "login");
}

init();
