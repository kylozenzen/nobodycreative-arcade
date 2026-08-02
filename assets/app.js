(() => {
  "use strict";

  const games = Array.isArray(window.ARCADE_GAMES) ? window.ARCADE_GAMES : [];
  const STORAGE = {
    recent: "nobodyArcade.recentGame",
    played: "nobodyArcade.playedGames",
    sound: "nobodyArcade.sound",
    secret: "nobodyArcade.backRoomUnlocked",
    installDismissed: "nobodyArcade.installDismissed"
  };
  const state = {
    genre: "All",
    query: "",
    sort: "featured",
    collection: "",
    sound: localStorage.getItem(STORAGE.sound) === "on",
    secretUnlocked: localStorage.getItem(STORAGE.secret) === "yes",
    installPrompt: null,
    secretTaps: []
  };
  const publicGames = games.filter((game) => !game.secret);
  const secretGames = games.filter((game) => game.secret);
  const $ = (selector) => document.querySelector(selector);

  const elements = {
    featuredGame: $("#featuredGame"), playableCount: $("#playableCount"), prototypeCount: $("#prototypeCount"), playedCount: $("#playedCount"),
    filterButtons: $("#filterButtons"), searchInput: $("#searchInput"), sortSelect: $("#sortSelect"), resultsCount: $("#resultsCount"), clearFiltersButton: $("#clearFiltersButton"),
    gameGrid: $("#gameGrid"), emptyState: $("#emptyState"), workshopGrid: $("#workshopGrid"), continueSection: $("#continueSection"), continueCard: $("#continueCard"),
    randomGameButton: $("#randomGameButton"), mobileRandomButton: $("#mobileRandomButton"), gameDialog: $("#gameDialog"), dialogClose: $("#dialogClose"), dialogContent: $("#dialogContent"),
    playDialog: $("#playDialog"), playDialogClose: $("#playDialogClose"), playDialogTitle: $("#playDialogTitle"), gameFrame: $("#gameFrame"), openNewTab: $("#openNewTab"),
    fullscreenButton: $("#fullscreenButton"), playerLoading: $("#playerLoading"), iframeWrap: $(".iframe-wrap"), toast: $("#toast"), soundToggle: $("#soundToggle"), year: $("#year"),
    installButton: $("#installButton"), mobileInstallButton: $("#mobileInstallButton"), mobileNav: $("#mobileNav"), installBanner: $("#installBanner"), installBannerButton: $("#installBannerButton"), installDismiss: $("#installDismiss"),
    installDialog: $("#installDialog"), installDialogClose: $("#installDialogClose"), installInstructions: $("#installInstructions"), secretTrigger: $("#secretTrigger"),
    backRoom: $("#backRoom"), secretGameSlot: $("#secretGameSlot"), unlockFlash: $("#unlockFlash")
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character]);
  }
  function getPlayedIds() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE.played) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }
  function getRecentGame() {
    const id = localStorage.getItem(STORAGE.recent);
    return games.find((game) => game.id === id && (!game.secret || state.secretUnlocked)) || null;
  }
  function hasLink(game) { return typeof game.playUrl === "string" && game.playUrl.trim().length > 0; }
  function isPlayable(game) { return game.status === "Playable"; }
  function playButtonLabel(game) {
    if (hasLink(game)) return "Play now";
    return isPlayable(game) ? "Connect game" : "Build in progress";
  }
  function availableGames() { return state.secretUnlocked ? games : publicGames; }
  function posterFor(game) { return game.poster || "assets/share-card.svg"; }
  function isMobileViewport() { return window.matchMedia("(max-width: 760px)").matches; }

  function renderStats() {
    const pool = availableGames();
    elements.playableCount.textContent = pool.filter(isPlayable).length;
    elements.prototypeCount.textContent = pool.filter((game) => ["Prototype", "In development", "Concept"].includes(game.status)).length;
    elements.playedCount.textContent = getPlayedIds().filter((id) => pool.some((game) => game.id === id)).length;
  }

  function mediaMarkup(game, location = "card") {
    const video = game.previewVideo
      ? `<video muted loop playsinline preload="none" poster="${escapeHtml(posterFor(game))}" data-preview-src="${escapeHtml(game.previewVideo)}" aria-hidden="true"></video>`
      : "";
    return `
      <img src="${escapeHtml(posterFor(game))}" alt="${escapeHtml(game.title)} preview artwork" loading="lazy" decoding="async" />
      ${video}
      ${location === "card" ? `<button class="screen-action" type="button" data-play="${escapeHtml(game.id)}" aria-label="${escapeHtml(playButtonLabel(game))}: ${escapeHtml(game.title)}"></button>` : ""}
    `;
  }

  function renderFeatured() {
    const game = publicGames.find((item) => item.featured) || publicGames[0];
    if (!game) return;
    elements.featuredGame.innerHTML = `
      <div class="featured-art">
        ${mediaMarkup(game, "featured")}
        <span class="status-badge">Featured cabinet</span>
      </div>
      <div class="featured-copy">
        <p class="eyebrow">${escapeHtml(game.status)} · ${escapeHtml(game.genres.join(" / "))}</p>
        <h2>${escapeHtml(game.title)}</h2>
        <p>${escapeHtml(game.tagline)}</p>
        <div class="featured-actions">
          <button class="button button-primary" type="button" data-play="${escapeHtml(game.id)}">${escapeHtml(playButtonLabel(game))}</button>
          <button class="button button-secondary" type="button" data-details="${escapeHtml(game.id)}">Project view</button>
        </div>
      </div>`;
  }

  function getGenres() { return ["All", ...new Set(publicGames.flatMap((game) => game.genres))]; }
  function renderFilters() {
    elements.filterButtons.innerHTML = getGenres().map((genre) => `
      <button class="filter-button ${state.genre === genre ? "active" : ""}" type="button" data-genre="${escapeHtml(genre)}" aria-pressed="${state.genre === genre}">${escapeHtml(genre)}</button>`).join("");
  }
  function getVisibleGames() {
    const query = state.query.trim().toLowerCase();
    const statusWeight = { "Playable": 0, "In development": 1, "Prototype": 2, "Concept": 3 };
    const visible = publicGames.filter((game) => {
      const matchesGenre = state.genre === "All" || game.genres.includes(state.genre);
      const haystack = [game.title, game.tagline, game.description, game.status, ...game.genres, ...game.platform].join(" ").toLowerCase();
      const saved = ArcadeStorage.load();
      const matchesCollection = !state.collection || saved[state.collection]?.includes(game.id);
      return matchesGenre && matchesCollection && (!query || haystack.includes(query));
    });
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
      <article class="game-card" data-game-card="${escapeHtml(game.id)}">
        <div class="cabinet-top">
          <div class="cabinet-marquee">
            <strong>${escapeHtml(game.shortTitle || game.title)}</strong>
            <span class="status-badge">${escapeHtml(game.status)}</span>
          </div>
        </div>
        <div class="cabinet-body">
          <div class="cabinet-screen">
            ${mediaMarkup(game)}
            <div class="screen-labels">
              <span class="preview-badge">${game.previewVideo ? "Live preview" : "Preview art"}</span>
              ${game.mobileOptimized ? '<span class="touch-badge">Touch ready</span>' : ""}
            </div>
          </div>
          <div class="cabinet-controls" aria-hidden="true"><span class="joystick"></span><span class="arcade-buttons"><i></i><i></i></span></div>
        </div>
        <div class="game-card-copy">
          <h3>${escapeHtml(game.title)} ${played ? '<span class="played-badge" title="Played">✓</span>' : ""}</h3>
          <p class="game-tagline">${escapeHtml(game.tagline)}</p>
          <div class="game-meta">
            ${game.genres.slice(0, 2).map((genre) => `<span class="meta-pill">${escapeHtml(genre)}</span>`).join("")}
            <span class="meta-pill">${escapeHtml(game.session || "Quick play")}</span>
          </div>
          <div class="card-actions">
            <button class="button button-primary ${!hasLink(game) ? "button-disabled" : ""}" type="button" data-play="${escapeHtml(game.id)}">${escapeHtml(playButtonLabel(game))}</button>
            <button class="button button-secondary" type="button" data-details="${escapeHtml(game.id)}">Project view</button>
            <button class="collection-button" type="button" data-favorite="${escapeHtml(game.id)}" aria-pressed="${ArcadeStorage.load().favorites.includes(game.id)}">${ArcadeStorage.load().favorites.includes(game.id) ? "♥ Favorited" : "♡ Favorite"}</button>
            <button class="collection-button" type="button" data-later="${escapeHtml(game.id)}" aria-pressed="${ArcadeStorage.load().playLater.includes(game.id)}">${ArcadeStorage.load().playLater.includes(game.id) ? "✓ Play Later" : "+ Play Later"}</button>
          </div>
        </div>
      </article>`;
  }

  function renderGames() {
    const visible = getVisibleGames();
    elements.gameGrid.innerHTML = visible.map(gameCard).join("");
    elements.resultsCount.textContent = `${visible.length} ${visible.length === 1 ? "game" : "games"} found`;
    elements.emptyState.classList.toggle("hidden", visible.length !== 0);
    elements.clearFiltersButton.classList.toggle("hidden", state.genre === "All" && !state.query);
    queueMicrotask(observeMobilePreviews);
  }
  function renderWorkshop() {
    const workshopGames = publicGames.filter((game) => game.workshop);
    elements.workshopGrid.innerHTML = workshopGames.map((game, index) => `
      <article class="workshop-card"><span class="workshop-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div>
        <p class="eyebrow">${escapeHtml(game.status)}</p><h3>${escapeHtml(game.title)}</h3><p>${escapeHtml(game.next)}</p>
        <button class="text-button" type="button" data-details="${escapeHtml(game.id)}">See project notes →</button>
      </div></article>`).join("");
  }
  function renderContinue() {
    const saved=ArcadeStorage.load(); const recent=Object.entries(saved.passport.games).sort((a,b)=>new Date(b[1].lastPlayed)-new Date(a[1].lastPlayed)).slice(0,3).map(([id,stats])=>({game:games.find(g=>g.id===id),stats})).filter(x=>x.game);
    elements.continueSection.classList.toggle("hidden", !recent.length);
    if (!recent.length) return;
    elements.continueCard.innerHTML = recent.map(({game,stats})=>`<article class="continue-card"><div class="continue-art"><img src="${escapeHtml(posterFor(game))}" alt="" loading="lazy" /></div><div><p class="eyebrow">${new Date(stats.lastPlayed).toLocaleDateString()} · ${stats.launches} launch${stats.launches===1?"":"es"}</p><h3>${escapeHtml(game.title)}</h3><p>${escapeHtml(game.platform.join(" / "))}${saved.favorites.includes(game.id)?" · ♥ Favorite":""}</p></div><button class="button button-primary" type="button" data-play="${escapeHtml(game.id)}">Continue</button></article>`).join("")+`<button class="text-button" type="button" data-open-passport>View complete activity history →</button>`;
  }
  function renderBackRoom() {
    elements.backRoom.classList.toggle("hidden", !state.secretUnlocked);
    if (!state.secretUnlocked || !secretGames.length) return;
    elements.secretGameSlot.innerHTML = gameCard(secretGames[0]);
    queueMicrotask(observeMobilePreviews);
  }

  function projectDialogMarkup(game) {
    const screenshots = Array.isArray(game.screenshots) ? game.screenshots : [];
    return `
      <div class="dialog-media">
        ${mediaMarkup(game, "dialog")}
        <div class="dialog-media-copy"><p class="eyebrow">${escapeHtml(game.status)} · ${escapeHtml(game.year)}</p><h2 id="dialogTitle">${escapeHtml(game.title)}</h2><p>${escapeHtml(game.tagline)}</p></div>
      </div>
      <div class="dialog-body">
        <p class="dialog-intro">${escapeHtml(game.longDescription)}</p>
        ${screenshots.length ? `<div class="screenshot-strip">${screenshots.map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(game.title)} gameplay preview" loading="lazy" />`).join("")}</div>` : ""}
        <div class="case-grid">
          <div class="case-item"><strong>My role</strong><p>${escapeHtml(game.role)}</p></div>
          <div class="case-item"><strong>The challenge</strong><p>${escapeHtml(game.challenge)}</p></div>
          <div class="case-item"><strong>The solution</strong><p>${escapeHtml(game.solution)}</p></div>
          <div class="case-item"><strong>Next iteration</strong><p>${escapeHtml(game.next)}</p></div>
        </div>
        <p class="eyebrow">Tools and systems</p>
        <div class="tools-list">${game.tools.map((tool) => `<span class="meta-pill">${escapeHtml(tool)}</span>`).join("")}</div>
        <div class="dialog-footer">
          <button class="button button-primary ${!hasLink(game) ? "button-disabled" : ""}" type="button" data-play="${escapeHtml(game.id)}">${escapeHtml(playButtonLabel(game))}</button>
          <button class="button button-secondary" type="button" data-share="${escapeHtml(game.id)}">Share game</button>
          <button class="button button-secondary" type="button" data-favorite="${escapeHtml(game.id)}">${ArcadeStorage.load().favorites.includes(game.id)?"♥ Favorited":"♡ Favorite"}</button><button class="button button-secondary" type="button" data-later="${escapeHtml(game.id)}">${ArcadeStorage.load().playLater.includes(game.id)?"✓ Play Later":"+ Play Later"}</button>
        </div>
      </div>`;
  }
  function openDetails(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game || (game.secret && !state.secretUnlocked)) return;
    elements.dialogContent.innerHTML = projectDialogMarkup(game);
    ArcadeProgress.caseStudy(game);
    elements.gameDialog.showModal();
    chirp(360, .05);
  }
  function markPlayed(game) {
    const played = getPlayedIds();
    if (!played.includes(game.id)) played.push(game.id);
    localStorage.setItem(STORAGE.played, JSON.stringify(played));
    localStorage.setItem(STORAGE.recent, game.id);
    renderStats(); renderGames(); renderContinue(); renderBackRoom();
  }
  function launchGame(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game || (game.secret && !state.secretUnlocked)) return;
    if (!hasLink(game)) {
      showToast(`${game.title} needs its playUrl added in data/games.js.`);
      chirp(140, .08);
      return;
    }
    if (elements.gameDialog.open) elements.gameDialog.close();
    markPlayed(game); ArcadeProgress.launch(game); chirp(520, .08);
    if(game.id === "tape-panic") { window.location.assign(game.playUrl); return; }
    if (game.embed) {
      elements.playDialogTitle.textContent = game.title;
      elements.openNewTab.href = game.playUrl;
      elements.iframeWrap.classList.remove("loaded");
      elements.playerLoading.classList.remove("hidden");
      elements.gameFrame.src = game.playUrl;
      elements.playDialog.showModal();
      if (isMobileViewport() && !game.mobileOptimized) showToast("Desktop controls recommended for this cabinet.");
    } else {
      window.open(game.playUrl, "_blank", "noopener,noreferrer");
    }
  }
  function closePlayDialog() {
    if (elements.playDialog.open) elements.playDialog.close();
    elements.gameFrame.src = "about:blank";
    elements.iframeWrap.classList.remove("loaded");
  }
  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 3000);
  }
  async function shareGame(gameId) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    const url = `${window.location.origin}${window.location.pathname}#game=${encodeURIComponent(game.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: game.title, text: game.tagline, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast(`${game.title} link copied.`);
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Sharing failed. Your browser chose chaos.");
    }
  }
  function chooseRandomGame() {
    const pool = availableGames().filter(hasLink);
    const candidates = pool.length ? pool : availableGames();
    const game = candidates[Math.floor(Math.random() * candidates.length)];
    if (game) openDetails(game.id);
  }
  function handleHash() {
    const match = window.location.hash.match(/^#game=(.+)$/);
    if (match) openDetails(decodeURIComponent(match[1]));
  }

  function startPreview(card) {
    const settings=ArcadeStorage.load().settings;
    if (settings.dataSaver || !settings.autoplay || settings.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = card?.querySelector("video[data-preview-src]");
    if (!video) return;
    if (!video.src) video.src = video.dataset.previewSrc;
    video.play().then(() => card.classList.add("previewing")).catch(() => {});
  }
  function stopPreview(card) {
    const video = card?.querySelector("video[data-preview-src]");
    if (!video) return;
    video.pause();
    card.classList.remove("previewing");
  }

  let previewObserver;
  let activePreviewCard;
  function observeMobilePreviews() {
    previewObserver?.disconnect();
    if (!isMobileViewport() || navigator.connection?.saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    previewObserver = new IntersectionObserver((entries) => {
      const best = entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio >= .68).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!best) return;
      const card = best.target;
      if (activePreviewCard && activePreviewCard !== card) stopPreview(activePreviewCard);
      activePreviewCard = card;
      startPreview(card);
    }, { threshold: [.25, .68, .9] });
    document.querySelectorAll("[data-game-card]").forEach((card) => { if (card.querySelector("video[data-preview-src]")) previewObserver.observe(card); });
  }

  let audioContext;
  function chirp(frequency = 440, duration = .06) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = frequency; oscillator.type = "square";
      gain.gain.setValueAtTime(.025, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch { /* optional */ }
  }
  function updateSoundButton() {
    elements.soundToggle.textContent = `Sound: ${state.sound ? "on" : "off"}`;
    elements.soundToggle.setAttribute("aria-pressed", String(state.sound));
  }

  function isStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function isAndroid() { return /android/i.test(navigator.userAgent); }
  function updateInstallUI() {
    const dismissed = localStorage.getItem(STORAGE.installDismissed) === "yes";
    const eligible = !isStandalone() && (Boolean(state.installPrompt) || isIOS());
    elements.installButton.classList.toggle("hidden", !eligible);
    elements.mobileInstallButton.classList.toggle("hidden", !eligible);
    elements.mobileNav.classList.toggle("install-available", eligible);
    elements.installBanner.classList.toggle("hidden", !eligible || dismissed);
  }
  async function triggerInstall() {
    if (isStandalone()) { showToast("Nobody Arcade is already installed."); return; }
    if (state.installPrompt) {
      state.installPrompt.prompt();
      const choice = await state.installPrompt.userChoice;
      if (choice.outcome === "accepted") showToast("Arcade installed. Please behave responsibly.");
      state.installPrompt = null;
      updateInstallUI();
      return;
    }
    elements.installInstructions.innerHTML = isIOS()
      ? "<li>Tap the <strong>Share</strong> button in Safari.</li><li>Scroll and choose <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>.</li>"
      : isAndroid()
        ? "<li>Open your browser menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation.</li>"
        : "<li>Open your browser menu.</li><li>Choose <strong>Install Nobody Arcade</strong>.</li><li>Confirm the installation.</li>";
    elements.installDialog.showModal();
  }

  function unlockBackRoom() {
    if (state.secretUnlocked) {
      elements.backRoom.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("The Back Room remembers you.");
      return;
    }
    state.secretUnlocked = true;
    localStorage.setItem(STORAGE.secret, "yes");
    ArcadeProgress.backRoom();
    document.querySelector("#backRoomNav")?.classList.remove("hidden");
    renderStats(); renderBackRoom();
    elements.unlockFlash.classList.remove("hidden");
    chirp(880, .12);
    setTimeout(() => { elements.unlockFlash.classList.add("hidden"); elements.backRoom.scrollIntoView({ behavior: "smooth", block: "center" }); }, 2200);
  }
  function registerSecretTap() {
    const now = Date.now();
    state.secretTaps = state.secretTaps.filter((time) => now - time < 2600);
    state.secretTaps.push(now);
    const remaining = 5 - state.secretTaps.length;
    if (remaining > 0 && remaining < 4) showToast(`${remaining} suspicious tap${remaining === 1 ? "" : "s"} remaining.`);
    chirp(250 + state.secretTaps.length * 80, .04);
    if (state.secretTaps.length >= 5) { state.secretTaps = []; unlockBackRoom(); }
  }
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiIndex = 0;
  function handleKonami(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === konami[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === konami.length) { konamiIndex = 0; unlockBackRoom(); }
    } else konamiIndex = key === konami[0] ? 1 : 0;
  }

  document.addEventListener("click", (event) => {
    const playTarget = event.target.closest("[data-play]");
    const detailsTarget = event.target.closest("[data-details]");
    const genreTarget = event.target.closest("[data-genre]");
    const shareTarget = event.target.closest("[data-share]");
    const favoriteTarget=event.target.closest("[data-favorite]"); const laterTarget=event.target.closest("[data-later]"); const passportTarget=event.target.closest("[data-open-passport]"); const collectionTarget=event.target.closest("[data-collection]");
    if (playTarget) launchGame(playTarget.dataset.play);
    if (detailsTarget) openDetails(detailsTarget.dataset.details);
    if (shareTarget) shareGame(shareTarget.dataset.share);
    if(favoriteTarget){const game=games.find(g=>g.id===favoriteTarget.dataset.favorite);if(game){ArcadeProgress.favorite(game);renderGames();renderFeatured();renderContinue();showToast("Favorites updated.")}}
    if(laterTarget){const game=games.find(g=>g.id===laterTarget.dataset.later);if(game){ArcadeProgress.later(game);renderGames();showToast("Play Later updated.")}}
    if(passportTarget) openPassport();
    if(collectionTarget){state.collection=state.collection===collectionTarget.dataset.collection?"":collectionTarget.dataset.collection;document.querySelectorAll("[data-collection]").forEach(b=>{const on=b.dataset.collection===state.collection;b.classList.toggle("active",on);b.setAttribute("aria-pressed",on)});renderGames()}
    if (genreTarget) {
      state.genre = genreTarget.dataset.genre;
      renderFilters(); renderGames(); chirp(300, .04);
    }
  });
  document.addEventListener("pointerover", (event) => {
    const card = event.target.closest("[data-game-card]");
    if (card && event.pointerType !== "touch") startPreview(card);
  });
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest("[data-game-card]");
    if (card && !card.contains(event.relatedTarget)) stopPreview(card);
  });
  document.addEventListener("focusin", (event) => startPreview(event.target.closest("[data-game-card]")));
  document.addEventListener("focusout", (event) => {
    const card = event.target.closest("[data-game-card]");
    if (card && !card.contains(event.relatedTarget)) stopPreview(card);
  });
  document.addEventListener("keydown", handleKonami);

  elements.searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderGames(); });
  elements.sortSelect.addEventListener("change", (event) => { state.sort = event.target.value; renderGames(); });
  elements.clearFiltersButton.addEventListener("click", () => { state.genre = "All"; state.query = ""; elements.searchInput.value = ""; renderFilters(); renderGames(); });
  elements.randomGameButton.addEventListener("click", chooseRandomGame);
  elements.mobileRandomButton.addEventListener("click", chooseRandomGame);
  elements.dialogClose.addEventListener("click", () => elements.gameDialog.close());
  elements.playDialogClose.addEventListener("click", closePlayDialog);
  elements.playDialog.addEventListener("close", () => { elements.gameFrame.src = "about:blank"; elements.iframeWrap.classList.remove("loaded"); });
  elements.gameFrame.addEventListener("load", () => { elements.playerLoading.classList.add("hidden"); elements.iframeWrap.classList.add("loaded"); });
  elements.fullscreenButton.addEventListener("click", async () => {
    try { await elements.iframeWrap.requestFullscreen(); } catch { showToast("Fullscreen was blocked by the browser."); }
  });
  document.querySelector("#restartButton").addEventListener("click",()=>{const src=elements.gameFrame.src;elements.gameFrame.src="about:blank";requestAnimationFrame(()=>elements.gameFrame.src=src)});
  document.querySelector("#controlsButton").addEventListener("click",()=>showToast("Controls vary by cabinet. Keyboard, pointer, and touch support are listed on each project."));
  document.querySelector("#playerFavorite").addEventListener("click",()=>{const game=games.find(g=>g.title===elements.playDialogTitle.textContent);if(game)ArcadeProgress.favorite(game)});
  elements.soundToggle.addEventListener("click", () => {
    state.sound = !state.sound; localStorage.setItem(STORAGE.sound, state.sound ? "on" : "off"); updateSoundButton(); chirp(660, .07);
  });
  elements.installButton.addEventListener("click", triggerInstall);
  elements.mobileInstallButton.addEventListener("click", triggerInstall);
  elements.installBannerButton.addEventListener("click", triggerInstall);
  elements.installDismiss.addEventListener("click", () => { localStorage.setItem(STORAGE.installDismissed, "yes"); updateInstallUI(); });
  elements.installDialogClose.addEventListener("click", () => elements.installDialog.close());
  elements.secretTrigger.addEventListener("click", registerSecretTap);
  function openPassport(){ArcadePassport.render();document.querySelector("#passportDialog").showModal()}
  document.querySelector("#passportButton").addEventListener("click",openPassport);document.querySelector("#mobilePassportButton").addEventListener("click",openPassport);document.querySelector("#passportClose").addEventListener("click",()=>document.querySelector("#passportDialog").close());
  elements.unlockFlash.addEventListener("click", () => elements.unlockFlash.classList.add("hidden"));
  window.addEventListener("hashchange", handleHash);
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); state.installPrompt = event; updateInstallUI(); });
  window.addEventListener("appinstalled", () => { state.installPrompt = null; updateInstallUI(); showToast("Nobody Arcade installed."); });

  if ("serviceWorker" in navigator && ["http:", "https:"].includes(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
  }

  ArcadeProgress.init();
  state.secretUnlocked=state.secretUnlocked||ArcadeStorage.load().passport.backRoomUnlocked;
  if(state.secretUnlocked){localStorage.setItem(STORAGE.secret,"yes");document.querySelector("#backRoomNav")?.classList.remove("hidden")}
  function renderDaily(){const c=ArcadeProgress.today(),row=ArcadeStorage.load().challenges[c.date];document.querySelector("#dailyChallenge").innerHTML=`<div><p class="eyebrow">Daily assignment · ${escapeHtml(c.date)}</p><h2 id="daily-title">${escapeHtml(c.title)}</h2><p>${escapeHtml(c.description)}</p></div><div class="daily-progress"><strong>${row.completed?"STAMPED ✓":`${row.progress||0} / ${c.target}`}</strong><div class="xp-track"><span style="width:${Math.min(100,(row.progress||0)/c.target*100)}%"></span></div><small>${c.xp} XP</small></div>`}
  window.addEventListener("arcade-state",()=>{renderDaily();renderContinue()});window.addEventListener("arcade-achievement",e=>showToast(`Achievement unlocked: ${e.detail.name}`));window.addEventListener("arcade-rank",e=>{showToast(`Token privileges upgraded: ${e.detail.rank}`);document.body.classList.add("rank-up");setTimeout(()=>document.body.classList.remove("rank-up"),900)});
  document.querySelector("#workshop").addEventListener("focusin",()=>{const v=ArcadeStorage.load();ArcadeProgress.challenge(v,"workshop");ArcadeStorage.save(v)},{once:true});
  elements.year.textContent = new Date().getFullYear();
  renderStats(); renderFeatured(); renderFilters(); renderGames(); renderWorkshop(); renderContinue(); renderBackRoom(); renderDaily(); updateSoundButton(); updateInstallUI(); handleHash();
})();
