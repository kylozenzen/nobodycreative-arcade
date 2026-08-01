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

## Connect a game

Open `data/games.js` and update:

```js
playUrl: "https://your-game.netlify.app",
embed: true
```

Use `embed: false` when the game host blocks iframe embedding.

## Replace cabinet artwork with a real screenshot

Every game currently has branded preview art here:

```text
assets/games/GAME-SLUG/poster.svg
assets/games/GAME-SLUG/screen.svg
```

A clean 16:9 `.webp`, `.jpg`, or `.png` works best. Then update the game entry:

```js
poster: "assets/games/high-stakes-truth/poster.webp",
screenshots: [
  "assets/games/high-stakes-truth/screenshot-1.webp",
  "assets/games/high-stakes-truth/screenshot-2.webp"
]
```

Recommended screenshot size: **1280×720** or **1600×900**.

## Add a moving gameplay preview

Record 4–8 seconds of gameplay with no audio. Export a compact MP4 or WebM—ideally under 2 MB—and add:

```js
previewVideo: "assets/games/high-stakes-truth/preview.mp4"
```

The hub keeps clips unloaded until someone hovers, focuses, or scrolls the cabinet prominently into view on mobile. Data Saver and reduced-motion preferences are respected.

## Mobile installation

- On supported Chrome/Android browsers, the hub shows an **Install arcade** button when the browser says the PWA is ready.
- On iPhone and iPad, the button opens the Safari steps: **Share → Add to Home Screen → Add**.
- Installation requires HTTPS. Netlify supplies HTTPS automatically.
- Browsers decide exactly when native installation becomes available, so the prompt may not appear on the first instant of a brand-new visit.

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

## Add another game

Duplicate an object in `data/games.js`, use a unique `id`, and update its content and media paths. The hub automatically updates the filters, counts, cards, workshop, recent plays, and project dialog.
