(() => {
  "use strict";
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
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
  const bestKey = "nobodyArcade.tapePanicBest";
  let best = Number(localStorage.getItem(bestKey) || 0);
  let running = false, score = 0, lives = 3, time = 45, last = 0, spawnClock = 0, secondClock = 0, sound = false;
  let tapes = [];
  const bin = { x: 380, y: 485, w: 140, h: 42, targetX: 450 };
  bestEl.textContent = best;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    ctx.setTransform(canvas.width / 900, 0, 0, canvas.height / 560, 0, 0);
  }
  function reset() {
    score = 0; lives = 3; time = 45; tapes = []; spawnClock = 0; secondClock = 0; bin.x = 380; bin.targetX = 450;
    updateHud();
  }
  function updateHud() {
    scoreEl.textContent = score;
    timeEl.textContent = time;
    livesEl.textContent = Array.from({ length: 3 }, (_, i) => i < lives ? "♥" : "·").join(" ");
  }
  function beep(freq, duration=.05) {
    if (!sound) return;
    try {
      beep.ctx ||= new (AudioContext || webkitAudioContext)();
      const o = beep.ctx.createOscillator(), g = beep.ctx.createGain();
      o.type = "square"; o.frequency.value = freq; g.gain.value = .025;
      o.connect(g); g.connect(beep.ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, beep.ctx.currentTime + duration); o.stop(beep.ctx.currentTime + duration);
    } catch {}
  }
  function spawnTape() {
    const roll = Math.random();
    const type = roll > .90 ? "gold" : roll < .22 ? "cursed" : "good";
    tapes.push({ x: 35 + Math.random() * 800, y: -50, w: 70, h: 42, speed: 120 + Math.random() * 115 + (45-time)*2.4, rotation: (Math.random()-.5)*.7, spin: (Math.random()-.5)*1.4, type });
  }
  function hit(a, b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function update(dt) {
    bin.x += (bin.targetX - bin.w/2 - bin.x) * Math.min(1, dt * 11);
    bin.x = Math.max(0, Math.min(900-bin.w, bin.x));
    spawnClock += dt; secondClock += dt;
    const interval = Math.max(.28, .72 - (45-time)*.008);
    if (spawnClock >= interval) { spawnClock = 0; spawnTape(); }
    if (secondClock >= 1) { secondClock -= 1; time -= 1; updateHud(); if (time <= 0) endGame(); }
    for (const tape of tapes) { tape.y += tape.speed * dt; tape.rotation += tape.spin * dt; }
    tapes = tapes.filter((tape) => {
      if (hit(tape, bin)) {
        if (tape.type === "cursed") { lives -= 1; score = Math.max(0, score-25); beep(120,.1); }
        else { score += tape.type === "gold" ? 75 : 10; beep(tape.type === "gold" ? 880 : 520); }
        updateHud(); if (lives <= 0) endGame(); return false;
      }
      if (tape.y > 590) { if (tape.type === "good") { score = Math.max(0, score-3); updateHud(); } return false; }
      return true;
    });
  }
  function drawTape(tape) {
    ctx.save(); ctx.translate(tape.x+tape.w/2,tape.y+tape.h/2); ctx.rotate(tape.rotation); ctx.translate(-tape.w/2,-tape.h/2);
    const colors = tape.type === "cursed" ? ["#ff5c5c","#661313"] : tape.type === "gold" ? ["#ffe66c","#9d6500"] : ["#76d8ff","#144d67"];
    const grad = ctx.createLinearGradient(0,0,tape.w,tape.h); grad.addColorStop(0,colors[0]); grad.addColorStop(1,colors[1]);
    ctx.fillStyle=grad; ctx.strokeStyle="rgba(255,255,255,.45)"; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(0,0,tape.w,tape.h,7); ctx.fill(); ctx.stroke();
    ctx.fillStyle="rgba(5,7,4,.72)"; ctx.beginPath(); ctx.roundRect(12,9,tape.w-24,18,4); ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.55)"; ctx.beginPath(); ctx.arc(17,34,4,0,Math.PI*2); ctx.arc(tape.w-17,34,4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,900,560);
    const bg = ctx.createLinearGradient(0,0,0,560); bg.addColorStop(0,"#0c1209"); bg.addColorStop(1,"#050704"); ctx.fillStyle=bg; ctx.fillRect(0,0,900,560);
    ctx.strokeStyle="rgba(184,255,107,.07)"; ctx.lineWidth=1;
    for(let x=0;x<900;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,560);ctx.stroke()} for(let y=0;y<560;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(900,y);ctx.stroke()}
    ctx.fillStyle="rgba(184,255,107,.55)"; ctx.font="800 14px system-ui"; ctx.fillText("DROP ZONE / EMPLOYEES ONLY",24,34);
    tapes.forEach(drawTape);
    ctx.fillStyle="#d7d8c8"; ctx.strokeStyle="#5b6252"; ctx.lineWidth=4; ctx.beginPath(); ctx.roundRect(bin.x,bin.y,bin.w,bin.h,10); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#151913"; ctx.fillRect(bin.x+14,bin.y+9,bin.w-28,14); ctx.fillStyle="#b8ff6b"; ctx.font="900 13px system-ui"; ctx.textAlign="center"; ctx.fillText("RETURN",bin.x+bin.w/2,bin.y+34); ctx.textAlign="left";
  }
  function loop(timestamp) {
    if (!running) return;
    const dt = Math.min(.035, (timestamp-last)/1000 || 0); last=timestamp; update(dt); draw(); requestAnimationFrame(loop);
  }
  function start() { reset(); overlay.classList.add("hidden"); running=true; last=performance.now(); requestAnimationFrame(loop); }
  function endGame() {
    if (!running) return; running=false;
    if (score>best) { best=score; localStorage.setItem(bestKey,String(best)); bestEl.textContent=best; title.textContent="New employee record."; }
    else title.textContent = lives<=0 ? "The cursed tapes won." : "Shift complete.";
    copy.textContent=`You returned ${score} points worth of tapes. Management has converted this into zero dollars.`;
    startButton.textContent="Play again"; overlay.classList.remove("hidden"); beep(180,.2);
  }
  function move(clientX) { const rect=canvas.getBoundingClientRect(); bin.targetX=(clientX-rect.left)/rect.width*900; }
  stage.addEventListener("pointerdown",e=>{move(e.clientX); stage.setPointerCapture?.(e.pointerId)}); stage.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")move(e.clientX)});
  addEventListener("keydown",e=>{if(e.key==="ArrowLeft")bin.targetX-=85;if(e.key==="ArrowRight")bin.targetX+=85;if((e.key===" "||e.key==="Enter")&&!running)start()});
  startButton.addEventListener("click",start); muteButton.addEventListener("click",()=>{sound=!sound;muteButton.textContent=`Sound: ${sound?"on":"off"}`;beep(660)});
  addEventListener("resize",resize); resize(); draw();
})();
