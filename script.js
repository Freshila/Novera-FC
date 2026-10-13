"use strict";

const $ = (selector) => document.querySelector(selector);

const players = [
  { id: 1, name: "Daniel Okafor", country: "Nigeria", flag: "NG", age: 19, position: "Forward", foot: "Right", club: "Demo Academy", number: "09", bio: "A fictional forward profile for demonstrating the VELORA discovery experience." },
  { id: 2, name: "Lucas Santos", country: "Brazil", flag: "BR", age: 18, position: "Midfielder", foot: "Left", club: "Demo Youth FC", number: "08", bio: "A fictional creative midfielder profile. No real performance data is claimed." },
  { id: 3, name: "Ethan Brooks", country: "England", flag: "GB", age: 20, position: "Defender", foot: "Right", club: "Demo City Academy", number: "04", bio: "A fictional defender profile created to test filters and player details." },
  { id: 4, name: "Mamadou Diallo", country: "Senegal", flag: "SN", age: 19, position: "Forward", foot: "Left", club: "Demo Dakar Academy", number: "11", bio: "A fictional attacking player profile for the demo directory." },
  { id: 5, name: "Haruto Sato", country: "Japan", flag: "JP", age: 18, position: "Goalkeeper", foot: "Right", club: "Demo Tokyo FC", number: "01", bio: "A fictional goalkeeper profile used to test the platform." },
  { id: 6, name: "Tiago Costa", country: "Portugal", flag: "PT", age: 20, position: "Midfielder", foot: "Right", club: "Demo Lisboa Academy", number: "10", bio: "A fictional midfield profile for the VELORA prototype." },
  { id: 7, name: "Malik Johnson", country: "United States", flag: "US", age: 19, position: "Defender", foot: "Left", club: "Demo United Academy", number: "03", bio: "A fictional defensive player profile for interface testing." },
  { id: 8, name: "Kwame Mensah", country: "Ghana", flag: "GH", age: 18, position: "Forward", foot: "Right", club: "Demo Accra FC", number: "07", bio: "A fictional forward profile demonstrating global discovery." }
];

const searchInput = $("#searchInput");
const positionFilter = $("#positionFilter");
const countryFilter = $("#countryFilter");
const playerGrid = $("#playerGrid");
const resultCount = $("#resultCount");
const shortlistCount = $("#shortlistCount");
const shortlistToggle = $("#shortlistToggle");
const resetFilters = $("#resetFilters");
const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
const playerDialog = $("#playerDialog");
const playerDetails = $("#playerDetails");
const closeDialog = $("#closeDialog");
const interestButton = $("#interestButton");
const interestFeedback = $("#interestFeedback");

let showShortlistOnly = false;
let shortlist = [];

try {
  const saved = JSON.parse(localStorage.getItem("velora-shortlist") || "[]");
  if (Array.isArray(saved)) shortlist = saved.filter(Number.isInteger);
} catch (error) {
  shortlist = [];
}

function saveShortlist() {
  try {
    localStorage.setItem("velora-shortlist", JSON.stringify(shortlist));
  } catch (error) {
    console.warn("Shortlist could not be saved on this device.");
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function populateCountries() {
  if (!countryFilter) return;
  const countries = [...new Set(players.map((player) => player.country))].sort();
  countryFilter.innerHTML = '<option value="">All countries</option>' +
    countries.map((country) =>
      `<option value="${escapeHTML(country)}">${escapeHTML(country)}</option>`
    ).join("");
}

function getVisiblePlayers() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const position = positionFilter ? positionFilter.value : "";
  const country = countryFilter ? countryFilter.value : "";

  return players.filter((player) => {
    const searchable = [
      player.name, player.country, player.position, player.club
    ].join(" ").toLowerCase();

    return (!query || searchable.includes(query)) &&
      (!position || player.position === position) &&
      (!country || player.country === country) &&
      (!showShortlistOnly || shortlist.includes(player.id));
  });
}

function renderPlayers() {
  if (!playerGrid) return;

  const visible = getVisiblePlayers();

  if (resultCount) {
    resultCount.textContent = `${visible.length} DEMO PROFILE${visible.length === 1 ? "" : "S"} FOUND`;
  }
  if (shortlistCount) shortlistCount.textContent = shortlist.length;

  if (!visible.length) {
    playerGrid.innerHTML = '<div class="empty-state">No profiles match your filters. Try another search.</div>';
    return;
  }

  playerGrid.innerHTML = visible.map((player) => {
    const saved = shortlist.includes(player.id);
    const initials = player.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

    return `
      <article class="player-card">
        <div class="player-art">
          <span class="player-number">#${escapeHTML(player.number)}</span>
          <span class="player-initial">${escapeHTML(initials)}</span>
          <span class="player-country">${escapeHTML(player.flag)} · ${escapeHTML(player.country)}</span>
        </div>
        <div class="player-info">
          <div class="player-position">${escapeHTML(player.position.toUpperCase())}</div>
          <h3>${escapeHTML(player.name)}</h3>
          <div class="player-meta">${player.age} years · ${escapeHTML(player.club)}</div>
          <div class="player-actions">
            <button class="${saved ? "saved" : ""}" data-save="${player.id}" aria-pressed="${saved}">
              ${saved ? "★ Saved" : "☆ Shortlist"}
            </button>
            <button class="view-btn" data-view="${player.id}">Profile ↗</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function openPlayer(id) {
  const player = players.find((item) => item.id === id);
  if (!player || !playerDialog || !playerDetails) return;

  const initials = player.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  playerDetails.innerHTML = `
    <div class="dialog-art">${escapeHTML(initials)}</div>
    <div class="player-position">${escapeHTML(player.position.toUpperCase())} · DEMO PROFILE</div>
    <h2>${escapeHTML(player.name)}</h2>
    <p class="dialog-meta">${escapeHTML(player.country)} · Age ${player.age} · ${escapeHTML(player.club)}</p>
    <p class="dialog-meta">Preferred foot: ${escapeHTML(player.foot)} · Shirt number: ${escapeHTML(player.number)}</p>
    <p>${escapeHTML(player.bio)}</p>
    <p class="dialog-note">This is a fictional demonstration profile. VELORA FC has not verified this player's identity or ability.</p>
    <button class="btn btn-primary" id="dialogSave">${shortlist.includes(player.id) ? "★ Remove from shortlist" : "☆ Add to shortlist"}</button>
  `;

  const dialogSave = $("#dialogSave");
  if (dialogSave) {
    dialogSave.addEventListener("click", () => {
      toggleShortlist(player.id);
      openPlayer(player.id);
    });
  }

  if (typeof playerDialog.showModal === "function") {
    playerDialog.showModal();
  } else {
    playerDialog.setAttribute("open", "");
  }
}

function toggleShortlist(id) {
  if (shortlist.includes(id)) {
    shortlist = shortlist.filter((item) => item !== id);
  } else {
    shortlist.push(id);
  }
  saveShortlist();
  renderPlayers();
}

if (playerGrid) {
  playerGrid.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save]");
    const viewButton = event.target.closest("[data-view]");

    if (saveButton) toggleShortlist(Number(saveButton.dataset.save));
    if (viewButton) openPlayer(Number(viewButton.dataset.view));
  });
}

if (searchInput) searchInput.addEventListener("input", renderPlayers);
if (positionFilter) positionFilter.addEventListener("change", renderPlayers);
if (countryFilter) countryFilter.addEventListener("change", renderPlayers);

if (resetFilters) {
  resetFilters.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (positionFilter) positionFilter.value = "";
    if (countryFilter) countryFilter.value = "";
    showShortlistOnly = false;
    if (shortlistToggle) shortlistToggle.classList.remove("saved");
    renderPlayers();
  });
}

if (shortlistToggle) {
  shortlistToggle.addEventListener("click", () => {
    showShortlistOnly = !showShortlistOnly;
    shortlistToggle.classList.toggle("saved", showShortlistOnly);
    renderPlayers();
  });
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mainNav.classList.remove("open"));
  });
}

if (closeDialog && playerDialog) {
  closeDialog.addEventListener("click", () => playerDialog.close());
}

if (playerDialog) {
  playerDialog.addEventListener("click", (event) => {
    if (event.target === playerDialog) playerDialog.close();
  });
}

if (interestButton && interestFeedback) {
  interestButton.addEventListener("click", () => {
    interestFeedback.textContent =
      "Thanks for your interest! This demo does not yet collect registrations.";
    interestButton.textContent = "Interest noted";
    interestButton.disabled = true;
  });
}

populateCountries();
renderPlayers();
