(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const stage = document.querySelector("#stage");
  const scoreEl = document.querySelector("#score");
  const bestEl = document.querySelector("#best");
  const timeEl = document.querySelector("#time");
  const livesEl = document.querySelector("#lives");
  const overlay = document.querySelector("#overlay");
  const title = document.querySelector("#overlayTitle");
  const copy = document.querySelector("#overlayCopy");
  const startButton = document.querySelector("#startButton");
  const muteButton = document.querySelector("#mute");
  const statusEl = document.querySelector("#gameStatus");

  if (!canvas || !stage || !startButton || !overlay) return;

  const ctx = canvas.getContext("2d");
  const bestKey = "nobodyArcade.tapePanicBest";
  const WORLD_WIDTH = 900;
  const WORLD_HEIGHT = 560;
  const ROUND_SECONDS = 45;

  let best = safeNumber(safeStorageGet(bestKey), 0);
  let running = false;
  let score = 0;
  let lives = 3;
  let time = ROUND_SECONDS;
  let last = 0;
  let spawnClock = 0;
  let secondClock = 0;
  let sound = false;
  let animationFrame = 0;
  let tapes = [];
  const bin = { x: 380, y: 485, w: 140, h: 42, targetX: 450 };

  bestEl.textContent = String(best);

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Storage may be blocked. */ }
  }

  function safeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function setStatus(message = "") {
    if (statusEl) statusEl.textContent = message;
  }

  function roundedRectPath(context, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function resize() {
    if (!ctx) return;
    const rect = stage.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(rect.width || stage.clientWidth || WORLD_WIDTH));
    const cssHeight = Math.max(1, Math.round(rect.height || stage.clientHeight || WORLD_HEIGHT));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(cssWidth * ratio));
    const nextHeight = Math.max(1, Math.floor(cssHeight * ratio));

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    ctx.setTransform(canvas.width / WORLD_WIDTH, 0, 0, canvas.height / WORLD_HEIGHT, 0, 0);
    draw();
  }

  function reset() {
    score = 0;
    lives = 3;
    time = ROUND_SECONDS;
    tapes = [];
    spawnClock = 0;
    secondClock = 0;
    bin.x = 380;
    bin.targetX = 450;
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = String(score);
    timeEl.textContent = String(Math.max(0, time));
    livesEl.textContent = Array.from({ length: 3 }, (_, index) => index < lives ? "♥" : "·").join(" ");
  }

  function beep(frequency, duration = 0.05) {
    if (!sound) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      beep.context ||= new AudioContextClass();
      if (beep.context.state === "suspended") beep.context.resume();
      const oscillator = beep.context.createOscillator();
      const gain = beep.context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.025;
      oscillator.connect(gain);
      gain.connect(beep.context.destination);
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, beep.context.currentTime + duration);
      oscillator.stop(beep.context.currentTime + duration);
    } catch { /* Sound is optional. */ }
  }

  function spawnTape() {
    const roll = Math.random();
    const type = roll > 0.90 ? "gold" : roll < 0.22 ? "cursed" : "good";
    tapes.push({
      x: 35 + Math.random() * 800,
      y: -50,
      w: 70,
      h: 42,
      speed: 120 + Math.random() * 115 + (ROUND_SECONDS - time) * 2.4,
      rotation: (Math.random() - 0.5) * 0.7,
      spin: (Math.random() - 0.5) * 1.4,
      type
    });
  }

  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update(deltaTime) {
    bin.x += (bin.targetX - bin.w / 2 - bin.x) * Math.min(1, deltaTime * 11);
    bin.x = Math.max(0, Math.min(WORLD_WIDTH - bin.w, bin.x));
    spawnClock += deltaTime;
    secondClock += deltaTime;

    const interval = Math.max(0.28, 0.72 - (ROUND_SECONDS - time) * 0.008);
    if (spawnClock >= interval) {
      spawnClock = 0;
      spawnTape();
    }

    while (secondClock >= 1 && running) {
      secondClock -= 1;
      time -= 1;
      updateHud();
      if (time <= 0) endGame();
    }

    for (const tape of tapes) {
      tape.y += tape.speed * deltaTime;
      tape.rotation += tape.spin * deltaTime;
    }

    tapes = tapes.filter((tape) => {
      if (hit(tape, bin)) {
        if (tape.type === "cursed") {
          lives -= 1;
          score = Math.max(0, score - 25);
          beep(120, 0.1);
        } else {
          score += tape.type === "gold" ? 75 : 10;
          beep(tape.type === "gold" ? 880 : 520);
        }
        updateHud();
        if (lives <= 0) endGame();
        return false;
      }
      if (tape.y > 590) {
        if (tape.type === "good") {
          score = Math.max(0, score - 3);
          updateHud();
        }
        return false;
      }
      return true;
    });
  }

  function drawTape(tape) {
    ctx.save();
    ctx.translate(tape.x + tape.w / 2, tape.y + tape.h / 2);
    ctx.rotate(tape.rotation);
    ctx.translate(-tape.w / 2, -tape.h / 2);

    const colors = tape.type === "cursed"
      ? ["#ff5c5c", "#661313"]
      : tape.type === "gold"
        ? ["#ffe66c", "#9d6500"]
        : ["#76d8ff", "#144d67"];
    const gradient = ctx.createLinearGradient(0, 0, tape.w, tape.h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    roundedRectPath(ctx, 0, 0, tape.w, tape.h, 7);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    roundedRectPath(ctx, 12, 9, tape.w - 24, 18, 4);
    ctx.fillStyle = "rgba(5,7,4,.72)";
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(17, 34, 4, 0, Math.PI * 2);
    ctx.arc(tape.w - 17, 34, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    const background = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
    background.addColorStop(0, "#0c1209");
    background.addColorStop(1, "#050704");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.strokeStyle = "rgba(184,255,107,.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x < WORLD_WIDTH; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < WORLD_HEIGHT; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(184,255,107,.55)";
    ctx.font = "800 14px system-ui";
    ctx.fillText("DROP ZONE / EMPLOYEES ONLY", 24, 34);
    tapes.forEach(drawTape);

    roundedRectPath(ctx, bin.x, bin.y, bin.w, bin.h, 10);
    ctx.fillStyle = "#d7d8c8";
    ctx.fill();
    ctx.strokeStyle = "#5b6252";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#151913";
    ctx.fillRect(bin.x + 14, bin.y + 9, bin.w - 28, 14);
    ctx.fillStyle = "#b8ff6b";
    ctx.font = "900 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("RETURN", bin.x + bin.w / 2, bin.y + 34);
    ctx.textAlign = "left";
  }

  function loop(timestamp) {
    if (!running) return;
    const deltaTime = Math.min(0.035, (timestamp - last) / 1000 || 0);
    last = timestamp;
    update(deltaTime);
    draw();
    if (running) animationFrame = requestAnimationFrame(loop);
  }

  function notifyHub(event, payload = {}) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "NOBODY_ARCADE_EVENT", gameId: "tape-panic", event, payload }, window.location.origin);
      }
    } catch { /* Standalone play does not require messaging. */ }
  }

  function start() {
    if (!ctx) {
      setStatus("This browser could not initialize the game canvas.");
      return;
    }
    if (running) return;

    cancelAnimationFrame(animationFrame);
    resize();
    reset();
    title.textContent = "Return the good tapes.";
    copy.textContent = "Move the return bin. Catch blue and gold tapes. Avoid the cursed red ones.";
    startButton.textContent = "Start shift";
    setStatus("");
    overlay.classList.add("hidden");
    running = true;
    last = performance.now();
    draw();
    animationFrame = requestAnimationFrame(loop);
    try { stage.focus({ preventScroll: true }); } catch { stage.focus(); }
    notifyHub("game_started");
  }

  function endGame() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(animationFrame);

    if (score > best) {
      best = score;
      safeStorageSet(bestKey, String(best));
      bestEl.textContent = String(best);
      title.textContent = "New employee record.";
    } else {
      title.textContent = lives <= 0 ? "The cursed tapes won." : "Shift complete.";
    }

    copy.textContent = `You returned ${score} points worth of tapes. Management has converted this into zero dollars.`;
    startButton.textContent = "Play again";
    overlay.classList.remove("hidden");
    beep(180, 0.2);
    notifyHub("game_completed", { score });
  }

  function move(clientX) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    bin.targetX = ((clientX - rect.left) / rect.width) * WORLD_WIDTH;
  }

  stage.tabIndex = -1;
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.("button, a")) return;
    move(event.clientX);
    try { stage.setPointerCapture(event.pointerId); } catch { /* Optional. */ }
  });
  stage.addEventListener("pointermove", (event) => {
    if (event.buttons || event.pointerType === "touch") move(event.clientX);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      bin.targetX -= 85;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      bin.targetX += 85;
    }
    if ((event.key === " " || event.key === "Enter") && !running) {
      event.preventDefault();
      start();
    }
  });

  startButton.addEventListener("click", start);
  muteButton.addEventListener("click", () => {
    sound = !sound;
    muteButton.textContent = `Sound: ${sound ? "on" : "off"}`;
    beep(660);
  });

  window.addEventListener("resize", resize);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);

  if (!ctx) {
    setStatus("Tape Panic requires canvas support. Try opening it in a current browser.");
    startButton.disabled = true;
  } else {
    resize();
    reset();
    draw();
  }
})();
