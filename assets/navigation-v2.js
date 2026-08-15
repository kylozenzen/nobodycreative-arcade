(() => {
  "use strict";

  const games = Array.isArray(window.ARCADE_GAMES) ? window.ARCADE_GAMES.filter((game) => !game.secret) : [];
  if (!games.length) return;

  const hasLink = (game) => typeof game.playUrl === "string" && game.playUrl.trim().length > 0;
  const playable = games.filter((game) => game.status === "Playable" && hasLink(game));
  const linked = games.filter(hasLink);
  const featuredPool = games.filter((game) => game.featured && hasLink(game));
  const heroPool = featuredPool.length ? featuredPool : (playable.length ? playable : games);
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[character]);

  const accentClass = (game) => `accent-${String(game.accent || "orange").toLowerCase().replace(/[^a-z0-9-]/g, "")}`;
  const posterFor = (game) => game.poster || "assets/share-card.svg";
  const gameMeta = (game) => [game.genres?.[0], game.session, game.mobileOptimized ? "Touch ready" : game.platform?.[0]].filter(Boolean);

  function proxyAction(attribute, gameId) {
    const proxy = document.createElement("button");
    proxy.type = "button";
    proxy.hidden = true;
    proxy.setAttribute(attribute, gameId);
    document.body.appendChild(proxy);
    proxy.click();
    proxy.remove();
  }

  function chooseRandom(pool = playable, avoidId = "") {
    const candidates = (pool.length ? pool : linked.length ? linked : games).filter((game) => game.id !== avoidId);
    if (!candidates.length) return (pool.length ? pool : linked.length ? linked : games)[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const hero = $(".hero");
  let heroIndex = 0;

  if (hero) {
    hero.classList.add("hero-v2");
    hero.innerHTML = `
      <div class="arcade-entry-copy">
        <div class="arcade-open-sign"><span></span> ARCADE OPEN</div>
        <p class="eyebrow">No quarters. Questionable judgment.</p>
        <h1>Pick a cabinet.<br><em>Regret nothing.</em></h1>
        <p class="arcade-entry-text">Tiny browser games, odd experiments, and ideas that probably should have stayed in the Notes app.</p>
        <div class="arcade-entry-actions">
          <button class="button button-primary arcade-primary" id="v2QuickPlay" type="button">▶ Quick play</button>
          <a class="button button-secondary" href="#collections">Browse the floor ↓</a>
        </div>
        <div class="arcade-entry-stats" aria-label="Arcade statistics">
          <span><strong>${playable.length}</strong> ready now</span>
          <span><strong>${games.filter((game) => game.workshop).length}</strong> in the workshop</span>
          <span><strong>${games.length}</strong> cabinets total</span>
        </div>
      </div>
      <div class="v2-featured-wrap" aria-label="Featured cabinet">
        <div class="v2-featured-kicker">TONIGHT'S FEATURED CABINET</div>
        <div id="v2FeaturedStage"></div>
        <div class="v2-featured-nav" aria-label="Featured game navigation">
          <button type="button" id="v2PrevGame" aria-label="Previous featured game">←</button>
          <span id="v2FeatureCount"></span>
          <button type="button" id="v2NextGame" aria-label="Next featured game">→</button>
        </div>
      </div>`;
  }

  function renderFeatured() {
    const stage = $("#v2FeaturedStage");
    const count = $("#v2FeatureCount");
    if (!stage || !heroPool.length) return;
    const game = heroPool[heroIndex % heroPool.length];
    stage.innerHTML = `
      <article class="v2-cabinet ${accentClass(game)}" data-game-card="${escapeHtml(game.id)}">
        <div class="v2-cabinet-marquee">
          <span class="v2-marquee-dots" aria-hidden="true">••••••</span>
          <strong>${escapeHtml(game.shortTitle || game.title)}</strong>
          <span class="v2-marquee-dots" aria-hidden="true">••••••</span>
        </div>
        <div class="v2-cabinet-bezel">
          <div class="v2-cabinet-screen">
            <img src="${escapeHtml(posterFor(game))}" alt="${escapeHtml(game.title)} preview" loading="eager" decoding="async" />
            <div class="v2-screen-wash"></div>
            <div class="v2-screen-copy">
              <span>${escapeHtml(game.genres?.join(" • ") || game.status)}</span>
              <strong>${escapeHtml(game.title)}</strong>
              <p>${escapeHtml(game.tagline)}</p>
            </div>
          </div>
        </div>
        <div class="v2-control-deck">
          <div class="v2-joystick" aria-hidden="true"><i></i></div>
          <div class="v2-cabinet-info">
            <div>${gameMeta(game).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            <button class="v2-play-button" type="button" data-play="${escapeHtml(game.id)}">PLAY</button>
            <button class="v2-details-button" type="button" data-details="${escapeHtml(game.id)}">Project notes</button>
          </div>
          <div class="v2-button-bank" aria-hidden="true"><i></i><i></i></div>
        </div>
      </article>`;
    if (count) count.textContent = `${heroIndex + 1} / ${heroPool.length}`;
  }

  function collectionCard(game) {
    return `
      <article class="floor-card ${accentClass(game)}" data-game-card="${escapeHtml(game.id)}">
        <button class="floor-card-play" type="button" ${hasLink(game) ? `data-play="${escapeHtml(game.id)}"` : `data-details="${escapeHtml(game.id)}"`}>
          <div class="floor-card-art">
            <img src="${escapeHtml(posterFor(game))}" alt="" loading="lazy" decoding="async" />
            <span class="floor-card-number">${escapeHtml(game.icon || "◆")}</span>
            <span class="floor-card-status">${escapeHtml(game.status)}</span>
          </div>
          <div class="floor-card-copy">
            <span>${escapeHtml(game.genres?.[0] || "Arcade")}</span>
            <strong>${escapeHtml(game.title)}</strong>
            <p>${escapeHtml(game.tagline)}</p>
          </div>
        </button>
        <button class="floor-card-notes" type="button" data-details="${escapeHtml(game.id)}">Project notes →</button>
      </article>`;
  }

  function collectionMarkup(title, eyebrow, pool) {
    if (!pool.length) return "";
    return `
      <section class="floor-row" aria-label="${escapeHtml(title)}">
        <div class="floor-row-heading">
          <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h3>${escapeHtml(title)}</h3></div>
          <span>Swipe / scroll →</span>
        </div>
        <div class="floor-scroller">${pool.map(collectionCard).join("")}</div>
      </section>`;
  }

  const gamesSection = $("#games");
  if (gamesSection) {
    const discovery = document.createElement("section");
    discovery.id = "collections";
    discovery.className = "discovery-section";
    const workshopGames = games.filter((game) => game.workshop || game.status !== "Playable");
    const quickHits = playable.filter((game) => /sec|min/i.test(game.session || ""));
    discovery.innerHTML = `
      <div class="discovery-heading">
        <div>
          <p class="eyebrow">No cover art required</p>
          <h2>Find your next bad decision.</h2>
        </div>
        <p>The arcade does the selling now. Pick a mood, hit a button, or let the mystery cabinet ruin your productivity.</p>
      </div>

      <div class="no-thought-grid">
        <button class="no-thought-card quick-card" id="v2QuickCard" type="button">
          <span class="no-thought-icon">▶</span>
          <div><small>NO THINKING REQUIRED</small><strong>Quick Play</strong><p>Throw me into something playable right now.</p></div>
          <b>GO →</b>
        </button>
        <button class="no-thought-card mystery-card" id="v2MysteryCard" type="button">
          <span class="no-thought-icon">?</span>
          <div><small>THE QUESTIONABLE CHOICE</small><strong>Mystery Cabinet</strong><p id="v2MysteryCopy">You don't get to know what you're playing yet.</p></div>
          <b id="v2MysteryGo">???</b>
        </button>
      </div>

      ${collectionMarkup("Start here", "The good stuff", playable)}
      ${collectionMarkup("Short attention span theater", "One more run", quickHits.length ? quickHits : playable)}
      ${collectionMarkup("Still being held together with tape", "From the workshop", workshopGames)}
    `;
    gamesSection.before(discovery);

    gamesSection.classList.add("vault-section");
    const eyebrow = $(".section-heading .eyebrow", gamesSection);
    const title = $(".section-heading h2", gamesSection);
    const intro = $(".section-heading > p", gamesSection);
    if (eyebrow) eyebrow.textContent = "Every cabinet, no velvet rope";
    if (title) title.textContent = "The game vault";
    if (intro) intro.textContent = "Know exactly what you want? Search the full catalog. Otherwise, the fun stuff is upstairs.";
  }

  function quickPlay(source) {
    const picked = chooseRandom(playable);
    if (!picked) return;
    if (source) {
      source.classList.add("is-picking");
      setTimeout(() => source.classList.remove("is-picking"), 420);
    }
    proxyAction("data-play", picked.id);
  }

  let mysteryLast = "";
  function mysteryPlay(source) {
    const picked = chooseRandom(linked, mysteryLast);
    if (!picked) return;
    mysteryLast = picked.id;
    const copy = $("#v2MysteryCopy");
    const go = $("#v2MysteryGo");
    if (source) source.classList.add("is-revealing");
    if (copy) copy.textContent = `Cabinet selected: ${picked.title}. Good luck.`;
    if (go) go.textContent = "OPEN →";
    window.setTimeout(() => {
      if (source) source.classList.remove("is-revealing");
      proxyAction("data-play", picked.id);
    }, 520);
  }

  $("#v2QuickPlay")?.addEventListener("click", (event) => quickPlay(event.currentTarget));
  $("#v2QuickCard")?.addEventListener("click", (event) => quickPlay(event.currentTarget));
  $("#v2MysteryCard")?.addEventListener("click", (event) => mysteryPlay(event.currentTarget));
  $("#v2PrevGame")?.addEventListener("click", () => {
    heroIndex = (heroIndex - 1 + heroPool.length) % heroPool.length;
    renderFeatured();
  });
  $("#v2NextGame")?.addEventListener("click", () => {
    heroIndex = (heroIndex + 1) % heroPool.length;
    renderFeatured();
  });

  let touchStartX = 0;
  $("#v2FeaturedStage")?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  $("#v2FeaturedStage")?.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    if (Math.abs(endX - touchStartX) < 45) return;
    heroIndex = endX < touchStartX
      ? (heroIndex + 1) % heroPool.length
      : (heroIndex - 1 + heroPool.length) % heroPool.length;
    renderFeatured();
  }, { passive: true });

  renderFeatured();
})();