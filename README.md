# Nobody Arcade — Phase 1.5

A deployable, mobile-first, data-driven arcade and playable portfolio for Nobody Creative.

## What Phase 1.5 adds

- Cabinet-style game cards with artwork, screen frames, joystick controls, and status marquees
- Static poster art for every current project
- Optional short gameplay-video previews that load only when needed
- Mobile-first layout with a sticky bottom navigation bar
- Full-screen mobile game player with deferred iframe loading
- Touch-ready and session-length labels
- Installable Progressive Web App (PWA)
- Android/Chrome installation prompt and iPhone/iPad instructions
- Home-screen icons, splash colors, service worker, offline shell, and app shortcuts
- Hidden Back Room unlocked through an easter egg
- A complete secret mobile game: **Tape Panic**
- Existing search, filters, project case studies, sharing, recent plays, workshop, and interface sounds

## Deploy to Netlify

This folder is already the publish root. `index.html` is at the top level.

1. Zip the contents of this folder—not a parent folder.
2. Open the site in Netlify.
3. Go to **Deploys** and upload the ZIP as a manual deploy.
4. Visit the HTTPS Netlify URL once deployment finishes.

No build command is required.

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

## Update contact information

In `index.html`, replace:

```html
mailto:hello@example.com
```

## Local preview

PWA installation and the service worker require a local server rather than opening the file directly:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Phase 1.5.3 maintenance note

This package preserves the Phase 1.5 design and interaction model. The only functional maintenance change is a hardened Tape Panic game engine plus a service-worker cache bump so the repaired game code is delivered. Tape Panic remains embedded in the original Nobody Arcade player.
