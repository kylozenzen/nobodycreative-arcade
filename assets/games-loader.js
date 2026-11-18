/*
  NOBODY ARCADE GAME LOADER

  games/games.json turns each game on (true) or off (false).
  Every enabled game is read from games/<id>/arcade.json.
  Art and preview file names in arcade.json are relative to the game's folder.
*/
(() => {
  "use strict";

  const BASE = "games/";
  const DEFAULTS = {
    tagline: "", description: "", longDescription: "", genres: [], status: "Playable",
    platform: ["Desktop"], featured: false, workshop: false, playUrl: "", sourceUrl: "",
    embed: true, mobileOptimized: false, session: "", accent: "", icon: "", secret: false,
    tools: [], role: "", challenge: "", solution: "", next: ""
  };

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }

  function normalize(id, meta) {
    const game = { ...DEFAULTS, ...meta, id };
    game.title = game.title || id;
    game.shortTitle = game.shortTitle || game.title;
    game.poster = game.poster ? `${BASE}${id}/${game.poster}` : "";
    game.screenshots = (game.screenshots?.length ? game.screenshots : [game.poster])
      .filter(Boolean)
      .map((file) => `${BASE}${id}/${file}`);
    game.previewVideo = game.previewVideo ? `${BASE}${id}/${game.previewVideo}` : "";
    return game;
  }

  async function loadArcadeGames() {
    const toggles = await fetchJson(`${BASE}games.json`);
    const ids = Object.keys(toggles).filter((id) => toggles[id] === true);
    const loaded = await Promise.all(ids.map(async (id) => {
      try {
        return normalize(id, await fetchJson(`${BASE}${id}/arcade.json`));
      } catch (error) {
        console.warn(`Skipping game "${id}":`, error);
        return null;
      }
    }));
    window.ARCADE_GAMES = loaded.filter(Boolean);
    return window.ARCADE_GAMES;
  }

  window.loadArcadeGames = loadArcadeGames;

  // Project View source link, matched by game title.
  document.addEventListener("DOMContentLoaded", () => {
    const dialogContent = document.querySelector("#dialogContent");
    if (!dialogContent || typeof MutationObserver === "undefined") return;

    const addSourceLink = () => {
      const title = dialogContent.querySelector("#dialogTitle")?.textContent?.trim();
      const footer = dialogContent.querySelector(".dialog-footer");
      if (!title || !footer || footer.querySelector("[data-source-link]")) return;

      const game = (window.ARCADE_GAMES || []).find((item) => item.title === title && item.sourceUrl);
      if (!game) return;

      const link = document.createElement("a");
      link.className = "button button-secondary";
      link.href = game.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.sourceLink = game.id;
      link.textContent = "Source code ↗";
      footer.insertBefore(link, footer.lastElementChild);
    };

    new MutationObserver(addSourceLink).observe(dialogContent, { childList: true, subtree: true });
  });
})();
