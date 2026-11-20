# Nobody Arcade

A mobile-first arcade and playable portfolio for Nobody Creative. Live at https://nobodycreative-arcade.netlify.app

Every cabinet plays in the browser, and each one has a Project View with the concept, role, challenge, solution and next steps.

## What's in it

- Cabinet-style game cards with poster art and optional lazy-loaded preview videos
- Search, genre filters, sorting and a featured cabinet
- Full-screen game player with deferred iframe loading
- Installable PWA with home-screen icons, offline shell and app shortcuts
- A hidden Back Room with a secret game, **Tape Panic**
- Continue Playing, sharing and optional interface sounds

## Deploy to Netlify

The repo root is the publish root. `index.html` is at the top level and there is no build step.

After changing core files (`index.html`, `assets/`, `secret/`), bump `CACHE` in `service-worker.js` so returning visitors get the new version.

## Games

Every game lives in its own folder under `games/`:

```
games/
  games.json            ← turns each game on (true) or off (false)
  high-stakes-truth/
    arcade.json         ← title, tagline, status, links, and art/preview file names
    poster.webp         ← card art
    screen.svg          ← optional screenshot for Project View
    preview.mp4         ← optional 4–8 second silent preview
```

**Turn a game on or off:** change its line in `games/games.json`, then push.

**Add a game:** copy its repo into a new folder under `games/`, add an `arcade.json` and a poster, then add a line to `games/games.json`.

**Where a game runs:** set `playUrl` in its `arcade.json`. Use a full URL for a game hosted elsewhere, or `games/<id>/index.html` for one copied into its folder. Set `embed` to `false` if the host blocks iframes.

File names in `arcade.json` are relative to the game's folder. Optional fields can be left out and default sensibly.

## The hidden game

The Back Room is intentionally absent from normal navigation. It can be discovered through repeated interaction with the Nobody Arcade logo or a familiar old-school keyboard sequence. The unlock persists in local storage.

The secret game files live in:

```text
secret/index.html
secret/styles.css
secret/game.js
```

## Local preview

PWA installation and the service worker require a local server rather than opening the file directly:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.
