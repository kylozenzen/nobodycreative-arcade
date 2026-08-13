(function(){
  "use strict";
  var app=document.getElementById("app"),menu=startOverlay;
  if(!app||!menu||typeof resetRun!=="function")return;

  var BEST_KEY="buckets-best-run-v05";
  function best(){try{return parseInt(localStorage.getItem(BEST_KEY)||"0",10)||0}catch(e){return 0}}
  function saveBest(v){try{if(v>best())localStorage.setItem(BEST_KEY,String(v))}catch(e){}}

  var style=document.createElement("style");
  style.textContent=`
  .shellMenu{background:radial-gradient(circle at 50% 14%,rgba(233,255,63,.14),transparent 30%),linear-gradient(180deg,rgba(4,5,8,.58),rgba(4,5,8,.94));}
  .shellCard{position:relative;overflow:hidden;padding:24px 22px 20px}.shellCard:before{content:"";position:absolute;left:-12%;right:-12%;top:38%;height:1px;background:linear-gradient(90deg,transparent,rgba(233,255,63,.34),transparent);transform:rotate(-5deg)}
  .shellEyebrow{display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:9px;font-weight:1000;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.52)}
  .shellEyebrow b{color:#e9ff3f}.shellLogo{margin:12px 0 5px;font-size:62px;line-height:.76;font-style:italic;font-weight:1000;letter-spacing:-.075em}.shellLogo i{font-style:normal;color:#e9ff3f}
  .shellMode{font-size:13px;font-weight:950;letter-spacing:.16em;text-transform:uppercase;color:#fff}.shellPitch{margin:9px 0 16px;color:#c8cad0;font-size:13px;line-height:1.45;max-width:340px}
  .shellJourney{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 16px}.shellStop{padding:9px 8px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.075)}.shellStop b{display:block;font-size:9px;letter-spacing:.08em}.shellStop span{display:block;margin-top:3px;font-size:8px;color:rgba(255,255,255,.45)}
  .shellActions{display:grid;gap:8px}.shellSecondary{background:#0b0d12;color:#f5f5f0;border:1px solid rgba(255,255,255,.11);box-shadow:none}.shellFooter{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:9px;color:rgba(255,255,255,.42);font-weight:800}.shellFooter b{color:#fff}
  .pauseButton{position:absolute;z-index:19;right:14px;top:calc(env(safe-area-inset-top,0px) + 66px);width:42px;height:42px;padding:0;border-radius:50%;display:none;place-items:center;background:rgba(5,6,9,.72);border:1px solid rgba(255,255,255,.12);box-shadow:none;color:#fff;font-size:13px;letter-spacing:2px;backdrop-filter:blur(8px)}.pauseButton.on{display:grid}.pauseButton:active{transform:scale(.96)}
  .pauseCard{text-align:center}.pauseMark{margin:7px auto 14px;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#e9ff3f;color:#08090d;font-weight:1000;font-size:18px;letter-spacing:3px}.pauseCard h2{font-size:36px;margin:0 0 7px}.pauseCard .lede{margin-bottom:16px}.pauseActions{display:grid;gap:8px}.dangerish{background:#171920;color:#fff;border:1px solid rgba(255,255,255,.1);box-shadow:none}.menuish{background:transparent;color:#bfc1c7;border:1px solid rgba(255,255,255,.1);box-shadow:none}
  .helpGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 17px}.helpItem{padding:11px;border-radius:12px;background:#0b0d12;border:1px solid rgba(255,255,255,.075);text-align:left}.helpItem b{display:block;font-size:11px;color:#fff}.helpItem span{display:block;margin-top:3px;font-size:9px;line-height:1.35;color:#9699a2}.helpNote{padding:10px 11px;border-radius:12px;background:rgba(233,255,63,.06);border:1px solid rgba(233,255,63,.14);color:#cfd1c8;font-size:10px;line-height:1.4;margin-bottom:14px}
  `;
  document.head.appendChild(style);

  menu.classList.add("shellMenu");
  var card=menu.querySelector(".card");
  if(card){
    card.classList.add("shellCard");
    card.innerHTML=`
      <div class="shellEyebrow"><span>Nobody Creative presents</span><b>One-thumb basketball</b></div>
      <div class="shellLogo">BUCKETS<i>.</i></div>
      <div class="shellMode">Street Run · Build Your Bag</div>
      <p class="shellPitch">Read the defender. Chain your moves. Build a style. Ten possessions from the neighborhood to The Cage.</p>
      <div class="shellJourney">
        <div class="shellStop"><b>01 · NEIGHBORHOOD</b><span>Learn the read</span></div>
        <div class="shellStop"><b>02 · ROOFTOP</b><span>Tighter windows</span></div>
        <div class="shellStop"><b>03 · THE CAGE</b><span>Earn the run</span></div>
      </div>
      <div class="shellActions">
        <button type="button" id="startBtn">Play Street Run</button>
        <button type="button" class="shellSecondary" id="howBtn">How to Play</button>
      </div>
      <div class="shellFooter"><span>Portrait · Touch-first · Sound on</span><span>BEST <b id="menuBest">${best()}</b></span></div>`;
  }

  var pauseBtn=document.createElement("button");pauseBtn.type="button";pauseBtn.className="pauseButton";pauseBtn.id="pauseBtn";pauseBtn.setAttribute("aria-label","Pause");pauseBtn.textContent="Ⅱ";app.appendChild(pauseBtn);

  var pauseOverlay=document.createElement("div");pauseOverlay.className="overlay hidden";pauseOverlay.id="pauseOverlay";
  pauseOverlay.innerHTML=`<div class="card pauseCard"><div class="kicker">Street Run paused</div><div class="pauseMark">Ⅱ</div><h2>PAUSED.</h2><p class="lede">Your clock is frozen. Your defender is still judging you.</p><div class="pauseActions"><button type="button" id="resumeBtn">Resume</button><button type="button" class="dangerish" id="restartRunBtn">Restart Run</button><button type="button" class="menuish" id="mainMenuBtn">Main Menu</button></div></div>`;
  app.appendChild(pauseOverlay);

  var helpOverlay=document.createElement("div");helpOverlay.className="overlay hidden";helpOverlay.id="helpOverlay";
  helpOverlay.innerHTML=`<div class="card"><div class="kicker">Build Your Bag</div><h2>ONE THUMB. DEEP BAG.</h2><p class="lede">Read the stance first, then choose how you want to attack it.</p><div class="helpGrid"><div class="helpItem"><b>Tap</b><span>Hesitation / quick fake</span></div><div class="helpItem"><b>Swipe ↔</b><span>Crossover · after Drive = Euro</span></div><div class="helpItem"><b>Swipe ↑</b><span>Drive · attack the rim</span></div><div class="helpItem"><b>Swipe ↓</b><span>Stepback · after Drive = Spin</span></div><div class="helpItem"><b>Hold + release</b><span>Jumper · after Drive = Floater/Pull-up</span></div><div class="helpItem"><b>Stepback + hold</b><span>Fadeaway jumper</span></div></div><div class="helpNote"><b>READ THE FLOOR:</b> PRESS/REACH wants a cross or hesi. SAG gives you the jumper. CUT OFF wants a stepback. Create SPACE before forcing a finish.</div><button type="button" id="helpBackBtn">Back to Menu</button></div>`;
  app.appendChild(helpOverlay);

  function refreshBest(){var el=document.getElementById("menuBest");if(el)el.textContent=best()}
  function showMenu(){
    running=false;paused=true;pointer.down=false;shotMeter.classList.remove("active");pauseOverlay.classList.add("hidden");helpOverlay.classList.add("hidden");menu.classList.remove("hidden");pauseBtn.classList.remove("on");refreshBest();
  }
  function pauseGame(){if(!running||paused)return;paused=true;pointer.down=false;shotMeter.classList.remove("active");pauseOverlay.classList.remove("hidden")}
  function resumeGame(){if(!running)return;pauseOverlay.classList.add("hidden");paused=false}

  var oldReset=resetRun;
  resetRun=function(){oldReset();pauseBtn.classList.add("on")};
  window.startBuckets=resetRun;

  var oldEnd=endRun;
  endRun=function(){saveBest(state.score);oldEnd();pauseBtn.classList.remove("on");refreshBest()};

  document.getElementById("startBtn").addEventListener("click",function(){audioInit();resetRun()});
  document.getElementById("howBtn").addEventListener("click",function(){menu.classList.add("hidden");helpOverlay.classList.remove("hidden")});
  document.getElementById("helpBackBtn").addEventListener("click",function(){helpOverlay.classList.add("hidden");menu.classList.remove("hidden")});
  pauseBtn.addEventListener("click",function(e){e.stopPropagation();audioInit();pauseGame()});
  document.getElementById("resumeBtn").addEventListener("click",function(){audioInit();resumeGame()});
  document.getElementById("restartRunBtn").addEventListener("click",function(){audioInit();pauseOverlay.classList.add("hidden");resetRun()});
  document.getElementById("mainMenuBtn").addEventListener("click",function(){audioInit();showMenu()});

  var version=document.querySelector(".version");if(version)version.textContent="MENU SHELL v0.5";
  refreshBest();
})();
