/*
  NOBODY ARCADE GAME DATA

  playUrl: deployed game URL or a local path.
  sourceUrl: optional public GitHub repository shown in Project View.
  embed: true opens in the arcade player; false opens a new tab.
  poster: static 16:9 image shown in the cabinet.
  previewVideo: optional short muted MP4/WebM. It loads only on interaction.
  screenshots: optional gallery images for Project View.
  mobileOptimized: shows the Touch Ready badge.
  secret: hidden until the arcade easter egg is unlocked.
*/

window.ARCADE_GAMES = [
  {
    id: "high-stakes-truth",
    title: "High Stakes Truth",
    shortTitle: "High Stakes",
    tagline: "Bet big on suspiciously specific facts.",
    description: "A wager-driven true-or-false game where confidence matters almost as much as knowing the answer.",
    longDescription: "High Stakes Truth combines rapid-fire trivia with a casino-style risk system. Players choose how much confidence to place behind each answer, creating tension even when the question looks easy.",
    genres: ["Trivia", "Strategy"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: true, workshop: false, playUrl: "https://highstakestruth.netlify.app", embed: true, mobileOptimized: true, session: "3–6 min",
    accent: "orange", icon: "◆", poster: "assets/games/high-stakes-truth/poster.webp", previewVideo: "", screenshots: ["assets/games/high-stakes-truth/poster.webp"],
    tools: ["HTML", "CSS", "JavaScript"], role: "Concept, game design, writing, UI and development",
    challenge: "Make true-or-false trivia feel strategic instead of disposable.",
    solution: "Added percentage-based wagering, round modifiers, escalating tension and a table-first presentation.",
    next: "Expand the clue library, add daily challenges and create clearer onboarding for first-time players."
  },
  {
    id: "plot-twisted-movies", title: "Plot Twisted", shortTitle: "Plot Twisted",
    tagline: "Name the movie from one beautifully unhelpful clue.",
    description: "A cinema-styled movie trivia game where the clues are unhinged, the hints are suspicious, and the seats are your keyboard.",
    longDescription: "Plot Twisted turns movie plots into deliberately warped one-line clues inside a playable digital theater. Players pick a screening, use limited hints and race toward the moment where nonsense suddenly becomes obvious.",
    genres: ["Trivia", "Movies"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: true, workshop: false, playUrl: "https://plot-twisted.netlify.app", sourceUrl: "https://github.com/kylozenzen/plot-twisted-2026", embed: true, mobileOptimized: true, session: "3–8 min",
    accent: "velvet", icon: "◉", poster: "assets/games/plot-twisted-movies/plot-twisted-movies-poster.webp", previewVideo: "", screenshots: ["assets/games/plot-twisted-movies/plot-twisted-movies-poster.webp"],
    tools: ["HTML", "CSS", "JavaScript", "Movie clue library", "PWA"], role: "Concept, game design, writing, visual direction, UI and development",
    challenge: "Build a movie-trivia format with enough personality to feel like entering a theater rather than answering another quiz.",
    solution: "Framed the game as a velvet-and-brass cinema experience with selectable screenings, limited hints and compact rounds designed for mobile play.",
    next: "Expand the screening library, tune clue difficulty and add rotating featured films."
  },
  {
    id: "plot-twisted-gaming", title: "Plot Twisted Gaming", shortTitle: "Plot Twisted",
    tagline: "Name the game from a painfully bad description.",
    description: "Video-game trivia built around awkwardly accurate plot summaries and fuzzy answer matching.",
    longDescription: "Plot Twisted turns recognizable games into deliberately unhelpful descriptions. The fun comes from the instant jump between confusion and recognition.",
    genres: ["Trivia", "Comedy"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: true, workshop: false, playUrl: "https://plot-twisted-games.netlify.app", embed: true, mobileOptimized: true, session: "2–5 min",
    accent: "purple", icon: "?", poster: "assets/games/plot-twisted-gaming/poster.webp", previewVideo: "", screenshots: ["assets/games/plot-twisted-gaming/poster.webp"],
    tools: ["HTML", "CSS", "JavaScript", "JSON clue library"], role: "Concept, writing, clue system, UI and development",
    challenge: "Create hundreds of clues that are funny without becoming impossible.",
    solution: "Used a scalable clue file, forgiving fuzzy matching and a modern game library focused on the last 25–30 years.",
    next: "Triple the clue pool, improve streak feedback and add themed challenge packs."
  },
  {
    id: "feed-velocity", title: "Feed Velocity", shortTitle: "Feed Velocity",
    tagline: "Jump the algorithm before it buries you.",
    description: "A fast arcade game about surviving the endless acceleration of the social feed.",
    longDescription: "Feed Velocity transforms algorithm anxiety into a quick reflex game. The player jumps obstacles, builds combos and races through a feed that never plans to calm down.",
    genres: ["Arcade", "Comedy"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: true, workshop: false, playUrl: "https://feedvelocity.netlify.app", embed: true, mobileOptimized: true, session: "1–3 min",
    accent: "cyan", icon: "↑", poster: "assets/games/feed-velocity/poster.webp", previewVideo: "", screenshots: ["assets/games/feed-velocity/poster.webp"],
    tools: ["HTML", "CSS", "JavaScript", "RSS"], role: "Concept, game design, UI and development",
    challenge: "Teach a fast game quickly while preserving the joke and momentum.",
    solution: "Built a safe tutorial, combo multiplier, finish fanfare, mobile haptics and an RSS-powered between-level reader.",
    next: "Add leaderboard support, more obstacle patterns and stronger progression between runs."
  },
  {
    id: "whiteout", title: "Whiteout", shortTitle: "Whiteout",
    tagline: "Carve, launch, grab, and pretend that landing was intentional.",
    description: "A mobile-first snowboard trick run with swipes, spins, grabs, flips and a ninety-second clock.",
    longDescription: "Whiteout explores gesture controls for a compact action-sports game. The focus is readable movement, satisfying trick chains and short sessions that invite one more run.",
    genres: ["Sports", "Arcade"], status: "In development", platform: ["Mobile"], year: 2026,
    featured: false, workshop: true, playUrl: "https://project-whiteout.netlify.app", embed: true, mobileOptimized: true, session: "90 sec",
    accent: "ice", icon: "▲", poster: "assets/games/whiteout/poster.svg", previewVideo: "", screenshots: ["assets/games/whiteout/screen.svg"],
    tools: ["HTML", "CSS", "JavaScript", "Touch controls"], role: "Concept, control design, UI and development",
    challenge: "Fit carving, crouching, grabs, spins and flips into intuitive mobile controls.",
    solution: "Separated grounded controls from airborne gestures and designed the scoring around readable trick chains.",
    next: "Tune landing windows, add TRICKY mode and introduce signature uber tricks."
  },
  {
    id: "nobodys-wizard", title: "Nobody’s Wizard", shortTitle: "Nobody’s Wizard",
    tagline: "Magic is easy. Navigation is apparently the final boss.",
    description: "A top-down action prototype about spell combat, exploration, and making dark paths actually readable.",
    longDescription: "Nobody’s Wizard is a top-down action experiment focused on combat feel, tutorial clarity and guiding players through a moody environment without giant arrows everywhere.",
    genres: ["Action", "Adventure"], status: "Prototype", platform: ["Desktop"], year: 2026,
    featured: false, workshop: true, playUrl: "", embed: true, mobileOptimized: false, session: "5–10 min",
    accent: "green", icon: "✦", poster: "assets/games/nobodys-wizard/poster.svg", previewVideo: "", screenshots: ["assets/games/nobodys-wizard/screen.svg"],
    tools: ["Web game prototype", "JavaScript"], role: "Concept, game design and iteration",
    challenge: "Improve path readability without losing the dark fantasy atmosphere.",
    solution: "Reworked brightness, environmental guidance and tutorial sequencing around player behavior.",
    next: "Expand enemy variety and define one polished vertical slice."
  },
  {
    id: "hexbound", title: "Hexbound", shortTitle: "Hexbound",
    tagline: "Two fighters. Several grudges. Zero HR department.",
    description: "A 3D fighting-game experiment built around distinct characters, readable attacks and compact matches.",
    longDescription: "Hexbound is an early 3D fighting prototype exploring character silhouettes, arena readability and how much depth can fit into a browser-based demo.",
    genres: ["Fighting", "Action"], status: "Prototype", platform: ["Desktop"], year: 2026,
    featured: false, workshop: true, playUrl: "", embed: true, mobileOptimized: false, session: "3–7 min",
    accent: "red", icon: "X", poster: "assets/games/hexbound/poster.svg", previewVideo: "", screenshots: ["assets/games/hexbound/screen.svg"],
    tools: ["3D web prototype", "JavaScript"], role: "Concept, combat design and iteration",
    challenge: "Make a 3D fighting prototype understandable before adding a large roster.",
    solution: "Limited scope to two contrasting characters and focused on readable spacing, hit feedback and camera behavior.",
    next: "Finish one complete matchup, then validate controls before expanding."
  },
  {
    id: "animal-puzzle", title: "Animal Puzzle", shortTitle: "Animal Puzzle",
    tagline: "Tiny puzzles for tiny humans. Adults may also participate.",
    description: "A calm, colorful animal puzzle designed for young children with six pieces or fewer.",
    longDescription: "Animal Puzzle is a kid-friendly project built around large touch targets, recognizable animals and low-frustration interactions. It is designed to be playable without reading.",
    genres: ["Family", "Puzzle"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: false, workshop: false, playUrl: "", embed: true, mobileOptimized: true, session: "2–5 min",
    accent: "yellow", icon: "●", poster: "assets/games/animal-puzzle/poster.svg", previewVideo: "", screenshots: ["assets/games/animal-puzzle/screen.svg"],
    tools: ["HTML", "CSS", "JavaScript"], role: "Concept, child-focused UX and development",
    challenge: "Make the game understandable, forgiving and satisfying for a preschool-age player.",
    solution: "Used very small piece counts, oversized controls, immediate feedback and a broad animal library.",
    next: "Add more animals, gentle audio feedback and a parent-controlled difficulty setting."
  },
  {
    id: "late-fees", title: "Late Fees", shortTitle: "Late Fees",
    tagline: "A video store mystery with extremely enforceable return dates.",
    description: "An in-progress game combining a 3D video-rental store, strange customers and Plot Twisted-style trivia.",
    longDescription: "Late Fees is the larger-world experiment: a stylized video store where serving customers, discovering tapes and solving distorted game descriptions all feed into the same loop.",
    genres: ["Adventure", "Trivia"], status: "In development", platform: ["Desktop"], year: 2026,
    featured: false, workshop: true, playUrl: "", embed: true, mobileOptimized: false, session: "10–20 min",
    accent: "pink", icon: "▰", poster: "assets/games/late-fees/poster.svg", previewVideo: "", screenshots: ["assets/games/late-fees/screen.svg"],
    tools: ["3D web game", "Narrative design", "Trivia systems"], role: "Concept, world design and gameplay planning",
    challenge: "Connect the trivia mechanic to a world that feels worth exploring.",
    solution: "Framed trivia as customer interactions, tape discovery and employee tasks inside a nostalgic store setting.",
    next: "Complete one polished shift with varied customer routes, clearer navigation and a satisfying end-of-day loop."
  },
  {
    id: "tape-panic", title: "Tape Panic", shortTitle: "Tape Panic",
    tagline: "Return every tape before the late fees become sentient.",
    description: "A hidden one-button score chase built directly into Nobody Arcade.",
    longDescription: "Tape Panic is the arcade’s secret cabinet: a tiny mobile-friendly reflex game about catching good tapes, avoiding cursed ones and discovering how long a joke can remain mechanically viable.",
    genres: ["Arcade", "Secret"], status: "Playable", platform: ["Mobile", "Desktop"], year: 2026,
    featured: false, workshop: false, playUrl: "secret/index.html", embed: true, mobileOptimized: true, session: "60 sec",
    accent: "secret", icon: "▰", poster: "assets/games/tape-panic/poster.svg", previewVideo: "", screenshots: ["assets/games/tape-panic/screen.svg"],
    secret: true,
    tools: ["HTML", "CSS", "JavaScript", "Local high score"], role: "Secret game concept, design and development",
    challenge: "Reward exploration without making the hidden content feel like a dead link.",
    solution: "Built a complete bite-sized game unlocked by repeated logo taps or a classic keyboard code.",
    next: "Add rare golden tapes, cabinet-specific achievements and more hidden routes into the Back Room."
  }
];

// Keep these projects in the data file, but remove them from the live arcade for now.
const HIDDEN_GAME_IDS = new Set(["animal-puzzle", "late-fees", "nobodys-wizard"]);
window.ARCADE_GAMES = window.ARCADE_GAMES.filter((game) => !HIDDEN_GAME_IDS.has(game.id));

// Until the two new binary poster files are uploaded, gracefully fall back to the existing SVG artwork.
const POSTER_FALLBACKS = {
  "/assets/games/plot-twisted-gaming/poster.webp": "/assets/games/plot-twisted-gaming/poster.svg",
  "/assets/games/feed-velocity/poster.webp": "/assets/games/feed-velocity/poster.svg"
};
window.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const pathname = new URL(image.src, window.location.href).pathname;
  const fallback = POSTER_FALLBACKS[pathname];
  if (fallback) image.src = fallback;
}, true);

// Progressive enhancement: expose source links without changing the Phase 1.5 dialog layout.
document.addEventListener("DOMContentLoaded", () => {
  const dialogContent = document.querySelector("#dialogContent");
  if (!dialogContent || typeof MutationObserver === "undefined") return;

  const addSourceLink = () => {
    const title = dialogContent.querySelector("#dialogTitle")?.textContent?.trim();
    const footer = dialogContent.querySelector(".dialog-footer");
    if (!title || !footer || footer.querySelector("[data-source-link]")) return;

    const game = window.ARCADE_GAMES.find((item) => item.title === title && item.sourceUrl);
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
