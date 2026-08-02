# Nobody Arcade — Phase 2

A mobile-first, installable static arcade, playable portfolio, and suspicious late-night workplace. Phase 2 adds a shared, account-free progression layer while preserving the Phase 1.5.2 full-page Tape Panic repair.

## Phase 2 features

- Local Arcade Passport with editable nickname, generated arcade ID, XP, eight configurable ranks, visit history, activity, collections, and settings.
- Twelve configurable achievements, deterministic daily assignments, anti-farming XP awards, rank-up feedback, favorites, Play Later, and richer Continue Playing cards.
- A unified lazy-loaded player shell, validated cross-game event bridge, local analytics hooks, import/export, and a persistent Back Room unlock.
- Data Saver, reduced-motion support, lazy media, network-first application assets, cache cleanup, responsive controls, and accessible dialogs.

## Storage and privacy

`js/storage.js` owns the versioned `nobodyArcade.phase2` localStorage record (`schemaVersion: 2`). No account, device fingerprint, database, paid service, or third-party tracker is used. Activity is capped at 50 entries. Export writes a portable JSON document containing its schema/export dates, Passport, achievements, activity, favorites, Play Later, settings, and challenge history. Import checks the schema and required structures, then asks before replacement. Legacy Back Room keys remain supported so Phase 1.5 players keep access.

To clear progress, use **Passport → Reset progress** (confirmation required), or remove `nobodyArcade.phase2` in browser storage. Future migrations should be added to `load()` in `js/storage.js` and increment `VERSION`; do not silently discard an older record.

## Content configuration

### Add a game

Add an object to `data/games.js`, retaining the documented fields. Never invent a URL: leave `playUrl` empty to preserve prototype/development behavior. `embed: true` uses the player iframe only after explicit launch. Use `embed: false` for external/full-page games. Tape Panic intentionally remains `embed: false`.

Preview paths are `poster`, optional `previewVideo`, and `screenshots`. Replace the files at those paths (or update the paths). Posters are lazy-loaded; videos use `preload="none"`, and Data Saver prevents playback.

### Add an achievement

Add an entry to `data/achievements.js` with `id`, `name`, `description`, `icon`, `xp`, `condition`, and any condition target. Set `secret: true` to obscure it until unlocked. Add a predicate branch to `condition()` in `js/progression.js` for a new condition type.

### Add a daily challenge

Add a definition to `data/challenges.js` with a stable `id`, `title`, `description`, `type`, `target`, and `xp` (plus optional genre/game criteria). A hash of the user's local `YYYY-MM-DD` selects the same entry all day without a server. Add event matching in `challenge()` for new criteria.

## Game event bridge

An embedded game may report `game_started`, `game_completed`, `score_submitted`, `achievement_triggered`, `level_completed`, or `daily_challenge_progress`. The hub validates message shape, known game ID/event, source window, and configured URL origin.

```js
window.parent.postMessage(
  {
    type: "NOBODY_ARCADE_EVENT",
    gameId: "example-game",
    event: "score_submitted",
    payload: { score: 1200 }
  },
  window.location.origin
);
```

For a game hosted on another approved domain, replace `window.location.origin` with the **hub's exact origin**, such as `https://arcade.example.com`, and configure that game's exact HTTPS URL in `data/games.js`. Do not use `"*"`. Non-integrated games still count at launch.

## Analytics adapter

`trackArcadeEvent(name, detail)` stores the latest 100 first-party events locally and logs on localhost. No external scripts are included. To connect Plausible, Google Analytics, or another consent-appropriate provider, listen for `arcade-analytics` or extend `js/analytics.js` to forward allow-listed event names after the provider is initialized. Keep the local call sites provider-agnostic.

## Local PWA testing

Service workers require HTTP(S), not `file://`:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`, use browser application tools to inspect the manifest/service worker, then test the install prompt or Add to Home Screen. Test a production build in standalone mode. The versioned service worker uses network-first delivery for HTML/JS/CSS and `/secret/*`, deletes obsolete caches on activation, and never depends on a cached Tape Panic script when the network works.

## Tape Panic release blocker

`/secret/index.html` is a same-tab full-page game with an Arcade return link. Its canvas uses an internal rounded-path fallback (not `roundRect`), guarded storage/audio, one tracked animation frame, ResizeObserver plus viewport/orientation recovery, non-scrolling pointer controls, and an exposed development test surface at `window.__TAPE_PANIC_TEST__`. Do not put it back in the iframe without equivalent real-browser coverage.

## Netlify deployment

The repository root is deployable as-is. Either connect it to Netlify or generate a drag-and-drop archive locally:

```bash
./scripts/package-netlify.sh
```

The script creates `nobody-arcade-phase2-netlify.zip` with `index.html`, `_redirects`, `netlify.toml`, the manifest, and service worker at the archive root. The generated ZIP is intentionally ignored by Git because pull-request systems may reject binary files; attach it to a release or upload it directly to Netlify rather than committing it. After deployment, verify HTTPS, installability, cache update behavior, and `/secret/index.html` directly.

## Architecture

- `data/`: games, ranks, achievements, daily challenge pool
- `js/storage.js`: schema, validation, persistence, export
- `js/progression.js`: XP, ranks, challenges, activity, achievements
- `js/passport.js`: Passport/settings/import/export UI
- `js/event-bridge.js`: trusted iframe messages
- `js/analytics.js`: provider-neutral local event hook
- `assets/app.js`: arcade floor and existing UI orchestration
- `secret/`: standalone Tape Panic

## Phase 3 recommendations

Optional encrypted cloud sync, explicit multi-profile support, signed cross-origin event tokens, richer per-game saves, opt-in global leaderboards, automated visual regression CI, and a consent-managed analytics adapter.
