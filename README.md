# Nobody Arcade — Phase 1

A deployable, data-driven portfolio hub for Ben's mini games.

## Included

- Responsive homepage and game library
- Featured game
- Search, genre filters and sorting
- Playable / prototype / concept statuses
- Project View case-study modal
- In-site iframe player or external launch mode
- Recently played and played-game tracking using localStorage
- Workshop section for active builds
- Shareable project URLs such as `#game=high-stakes-truth`
- Optional lightweight interface sounds
- Netlify configuration

## Connect the games

Open `data/games.js` and update each game's `playUrl`:

```js
playUrl: "https://your-deployed-game.netlify.app",
embed: true
```

Use `embed: false` when the game's host blocks iframe embedding.

## Update your contact details

In `index.html`, replace:

```html
mailto:hello@example.com
```

## Preview locally

Because this is a static site, you can open `index.html` directly. A local web server is better for testing embeds:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to Netlify

Drag this entire folder into Netlify Drop, or connect it to a GitHub repository. No build command is required. The publish directory is the repository root.

## Add another game

Duplicate one object in `data/games.js`, give it a unique `id`, and update the fields. It will automatically appear in the library, filters, counts and workshop.

## Recommended next pass

1. Add every deployed game URL.
2. Replace the temporary contact email.
3. Add real screenshots or short game clips to the data model.
4. Add analytics events for game launches and project views.
5. Choose a custom domain such as `arcade.nobodycreative.com` or `play.nobodycreative.com`.
