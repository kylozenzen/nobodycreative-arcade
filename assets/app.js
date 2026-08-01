(() => {
  "use strict";

  const games = Array.isArray(window.ARCADE_GAMES) ? window.ARCADE_GAMES : [];
  const STORAGE = {
    recent: "nobodyArcade.recentGame",
    played: "nobodyArcade.playedGames",
    sound: "nobodyArcade.sound"
  };

  const state = {
    genre: "All",
    query: "",
    sort: "featured",
    sound: localStorage.getItem(STORAGE.sound) === "on"
  };

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    featuredGame: $("#featuredGame"),
    playableCount: $("#playableCount"),
    prototypeCount: $("#prototypeCount"),
    playedCount: $("#playedCount"),
    filterButtons: $("#filterButtons"),
    searchInput: $("#searchInput"),
    sortSelect: $("#sortSelect"),
    resultsCount: $("#resultsCount"),
    clearFiltersButton: $("#clearFiltersButton"),
    gameGrid: $("#gameGrid"),
    emptyState: $("#emptyState"),
    workshopGrid: $("#workshopGrid"),
    continueSection: $("#continueSection"),
    continueCard: $("#continueCard"),
    randomGameButton: $("#randomGameButton"),
    gameDialog: $("#gameDialog"),
    dialogClose: $("#dialogClose"),
    dialogContent: $("#dialogContent"),
    playDialog: $("#playDialog"),
    playDialogClose: $("#playDialogClose"),
    playDialogTitle: $("#playDialogTitle"),
    gameFrame: $("#gameFrame"),
    openNewTab: $("#openNewTab"),
    toast: $("#toast"),
    soundToggle: $("#soundToggle"),
    year: $("#year")
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;"
    })[character]);
  }

  function getPlayedIds() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE.played) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function getRecentGame() {
    const id = localStorage.getItem(STORAGE.recent);
    return games.find((game) => game.id === id) || null;
  }

  function hasLink(game) {
    return typeof game.playUrl === "string" && game.playUrl.trim().length > 0;
  }

  function isPlayable(game) {
    return game.status === "Playable";
  }

  function accentClass(game) {
    return `accent-${game.accent || "purple"}`;
  }

  function playButtonLabel(game) {
    if (hasLink(game)) return "Play now";
    return isPlayable(game) ? "Connect game" : "Build in progress";
  }

  function renderStats() {
    const played = getPlayedIds();
    elements.playableCount.textContent = games.filter(isPlayable).length;
    elements.prototypeCount.textContent = games.filter((game) => ["Prototype", "In development", "Concept"].includes(game.status)).length;
    elements.playedCount.textContent = played.length;
  }

  function renderFeatured() {
    const featuredPool = games.filter((game) => game.featured);
    const game = featuredPool[0] || games[0];
    if (!game) return;

    elements.featuredGame.innerHTML = `
      <div class="featured-art ${accentClass(game)}">
        <span class="status-badge">Featured cabinet</span>
        <span class="featured-icon" aria-hidden="true">${escapeHtml(game.icon)}</span>
      </div>
      <div class="featured-copy">
        <p class="eyebrow">${escapeHtml(game.status)} · ${escapeHtml(game.genres.join(" / "))}</p>
        <h2>${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.tagline)}</p>
        <div class="featured-actions">
          <button class="button button-primary" type="button" data-play="${escapeHtml(game.id)}">${escapeHtml(playButtonLabel(game))}</button>
          <button class="button button-secondary" type="button" data-details="${escapeHtml(game.id)}">Project view</button>
        </div>
      </div>
    `;
  }

  function getGenres() {
    return ["All", ...new Set(games.flatMap((game) => game.genres))];
  }

  function renderFilters() {
    elements.filterButtons.innerHTML = getGenres().map((genre) => `
      <button class="filter-button ${state.genre === genre ? "active" : ""}" type="button" data-genre="${escapeHtml(genre)}" aria-pressed="${state.genre === genre}">
        ${escapeHtml(genre)}
      </button>
    `).join("");
  }

  function getVisibleGames() {
    const query = state.query.trim().toLowerCase();
    let visible = games.filter((game) => {
      const matchesGenre = state.genre === "All" || game.genres.includes(state.genre);
      const haystack = [game.title, game.tagline, game.description, game.status, ...game.genres, ...game.platform].join(" ").toLowerCase();
      return matchesGenre && (!query || haystack.includes(query));
    });

    const statusWeight = { "Playable": 0, "In development": 1, "Prototype": 2, "Concept": 3 };
    visible.sort((a, b) => {
      if (state.sort === "newest") return b.year - a.year || a.title.localeCompare(b.title);
      if (state.sort === "az") return a.title.localeCompare(b.title);
      if (state.sort === "status") return (statusWeight[a.status] ?? 99) - (statusWeight[b.status] ?? 99) || a.title.localeCompare(b.title);
      return Number(b.featured) - Number(a.featured) || (statusWeight[a.status] ?? 99) - (statusWeight[b.status] ?? 99);
    });
    return visible;
  }

  function gameCard(game) {
    const played = getPlayedIds().includes(game.id);
    return `
      <article class="game-card">
        <div class="game-art ${accentClass(game)}">
          <span class="status-badge">${escapeHtml(game.status)}</span>
          ${played ? '<span class="played-badge" title="Played">✓</span>' : ""}
          <span class="game-icon" aria-hidden="true">${escapeHtml(game.icon)}</span>
        </div>
        <div class="game-card-copy">
          <h3>${escapeHtml(game.title)}</h3>
          <p class="game-tagline">${escapeHtml(game.tagline)}</p>
          <div class="game-meta">
            ${game.genres.slice(0, 2).map((genre) => `<span class="meta-pill">${escapeHtml(genre)}</span>`).join("")}
            <span class="meta-pill">${escapeHtml(game.platform.join(" + "))}</span>
          </div>
          <div class="card-actions">
            <button class="button button-primary ${!hasLink(game) ? "button-disabled" : ""}" type="button" data-play="${escapeHtml(game.id)}">
              ${escapeHtml(playButtonLabel(game))}
            </button>
            <button class="button button-secondary" type="button" data-details="${escapeHtml(game.id)}">Project view</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderGames() {
    const visible = getVisibleGames();
    elements.gameGrid.innerHTML = visible.map(gameCard).join("");
    elements.resultsCount.textContent = `${visible.length} ${visible.length === 1 ? "game" : "games"} found`;
    elements.emptyState.classList.toggle("hidden", visible.length !== 0);
    elements.clearFiltersButton.classList.toggle("hidden", state.genre === "All" && !state.query);
  }

  function renderWorkshop() {
    const workshopGames = games.filter((game) => game.workshop);
    elements.workshopGrid.innerHTML = workshopGames.map((game, index) => `
      <article class="workshop-card">
        <span class="workshop-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <p class="eyebrow">${escapeHtml(game.status)}</p>
          <h3>${escapeHtml(game.title)}</h3>
          <p>${escapeHtml(game.next)}</p>
          <button class="text-button" type="button" data-details="${escapeHtml(game.id)}">See project notes →</button>
        </div>
      </article>
    `).join("");
  }

  function renderContinue() {
    const game = getRecentGame();
    elements.continueSection.classList.toggle("hidden", !game);
    if (!game) return;

    elements.continueCard.innerHTML = `
      <article class="continue-card">
        <div class="continue-art ${accentClass(game)}" aria-hidden="true">${escapeHtml(game.icon)}</div>
        <div>
          <p class="eyebrow">Last cabinet visited</p>
          <h3>${escapeHtml(game.title)}</h3>
          <p>${escapeHtml(game.tagline)}</p>
        </div>
        <button class="button button-primary" type="button" data-play="${escapeHtml(game.id)}">Continue</button>
      </article>
    `;
  }

  function projectDialogMarkup(game) {
    return `
      <div class="dialog-hero ${accentClass(game)}">
        <p class="eyebrow">${escapeHtml(game.status)} · ${escapeHtml(game.year)}</p>
        <h2 id="dialogTitle">${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.tagline)}</p>
      </div>
      <div class="dialog-body">
        <p class="dialog-intro">${escapeHtml(game.longDescription)}</p>
        <div class="case-grid">
          <div class="case-item"><strong>My role</strong><p>${escapeHtml(game.role)}</p></div>
          <div class="case-item"><strong>The challenge</strong><p>${escapeHtml(game.challenge)}</p></div>
          <div class="case-item"><strong>The solution</strong><p>${escapeHtml(game.solution)}</p></div>
          <div class="case-item"><strong>Next iteration</strong><p>${escapeHtml(game.next)}</p></div>
        </div>
        <p class="eyebrow">Tools and systems</p>
        <div class="tools-list">
          ${game.tools.map((tool) => `<span class="meta-pill">${escapeHtml(tool)}</span>`).join("")}
        </div>
        <div class="dialog-footer">
          <button class="button button-primary ${!hasLink(game) ? "button-disabled" : ""}" type="button" data-play="${escapeHtml(game.id)}">${escapeHtml(playButtonLabel(game))}</button>
          <button class="button button-secondary" type="button" data-copy="${escapeHtml(game.id)}">Copy game link</button>
        </div>
      </div>
    `;
  }

  function openDetails(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    elements.dialogContent.innerHTML = projectDialogMarkup(game);
    elements.gameDialog.showModal();
    chirp(360, 0.05);
  }

  function markPlayed(game) {
    const played = getPlayedIds();
    if (!played.includes(game.id)) played.push(game.id);
    localStorage.setItem(STORAGE.played, JSON.stringify(played));
    localStorage.setItem(STORAGE.recent, game.id);
    renderStats();
    renderGames();
    renderContinue();
  }

  function launchGame(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;

    if (!hasLink(game)) {
      showToast(`${game.title} needs its playUrl added in data/games.js.`);
      chirp(140, 0.08);
      return;
    }

    markPlayed(game);
    chirp(520, 0.08);

    if (game.embed) {
      elements.playDialogTitle.textContent = game.title;
      elements.gameFrame.src = game.playUrl;
      elements.openNewTab.href = game.playUrl;
      elements.playDialog.showModal();
    } else {
      window.open(game.playUrl, "_blank", "noopener,noreferrer");
    }
  }

  function closePlayDialog() {
    elements.playDialog.close();
    elements.gameFrame.src = "about:blank";
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 3000);
  }

  function copyGameLink(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    const url = `${window.location.origin}${window.location.pathname}#game=${encodeURIComponent(game.id)}`;
    navigator.clipboard?.writeText(url).then(
      () => showToast(`${game.title} link copied.`),
      () => showToast("Copy failed. Your browser chose chaos.")
    );
  }

  function chooseRandomGame() {
    const playableWithLinks = games.filter(hasLink);
    const pool = playableWithLinks.length ? playableWithLinks : games;
    const game = pool[Math.floor(Math.random() * pool.length)];
    if (game) openDetails(game.id);
  }

  function handleHash() {
    const match = window.location.hash.match(/^#game=(.+)$/);
    if (match) openDetails(decodeURIComponent(match[1]));
  }

  let audioContext;
  function chirp(frequency = 440, duration = .06) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "square";
      gain.gain.setValueAtTime(.025, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      // Sound is optional. The arcade survives.
    }
  }

  function updateSoundButton() {
    elements.soundToggle.textContent = `Sound: ${state.sound ? "on" : "off"}`;
    elements.soundToggle.setAttribute("aria-pressed", String(state.sound));
  }

  document.addEventListener("click", (event) => {
    const playTarget = event.target.closest("[data-play]");
    const detailsTarget = event.target.closest("[data-details]");
    const genreTarget = event.target.closest("[data-genre]");
    const copyTarget = event.target.closest("[data-copy]");

    if (playTarget) launchGame(playTarget.dataset.play);
    if (detailsTarget) openDetails(detailsTarget.dataset.details);
    if (copyTarget) copyGameLink(copyTarget.dataset.copy);
    if (genreTarget) {
      state.genre = genreTarget.dataset.genre;
      renderFilters();
      renderGames();
      chirp(300, .04);
    }
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderGames();
  });
  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderGames();
  });
  elements.clearFiltersButton.addEventListener("click", () => {
    state.genre = "All";
    state.query = "";
    elements.searchInput.value = "";
    renderFilters();
    renderGames();
  });
  elements.randomGameButton.addEventListener("click", chooseRandomGame);
  elements.dialogClose.addEventListener("click", () => elements.gameDialog.close());
  elements.playDialogClose.addEventListener("click", closePlayDialog);
  elements.playDialog.addEventListener("close", () => { elements.gameFrame.src = "about:blank"; });
  elements.soundToggle.addEventListener("click", () => {
    state.sound = !state.sound;
    localStorage.setItem(STORAGE.sound, state.sound ? "on" : "off");
    updateSoundButton();
    chirp(660, .07);
  });
  window.addEventListener("hashchange", handleHash);

  elements.year.textContent = new Date().getFullYear();
  renderStats();
  renderFeatured();
  renderFilters();
  renderGames();
  renderWorkshop();
  renderContinue();
  updateSoundButton();
  handleHash();
})();
