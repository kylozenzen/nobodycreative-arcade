function resetBall(){ball.x=player.x+12;ball.y=player.y-2;ball.shot=false;ball.t=0;ball.spin=0;ball.kind="jumper"}
function resetRun(){
  state={pos:1,max:10,score:0,heat:0,combo:1,bestCombo:1,makes:0,misses:0,perfects:0,shotWindow:1,stunBonus:0,bully:false,magnet:0,ghost:false,ghostReady:false,quickFirst:false,clockMax:8.5,clock:8.5,space:18,advantage:0,advantageBonus:0,reads:0,readStreak:0,bestReadStreak:0,lastMove:"",repeat:0,antiSpam:2,deadeye:0,styleBank:0,timeouts:0};
  running=true;paused=false;time=0;freeze=0;shake=0;netT=0;particles.length=0;streaks.length=0;floaters.length=0;
  startOverlay.classList.add("hidden");upgradeOverlay.classList.add("hidden");endOverlay.classList.add("hidden");
  spawnPossession();ui();sfx.ui();
}
function spawnPossession(){
  paused=false;state.ghostReady=state.ghost;state.clock=state.clockMax;state.space=18;state.advantage=0;state.styleBank=0;
  if(state.quickFirst)state.heat=clamp(state.heat+10,0,100);
  player.x=player.tx=W/2;player.y=player.ty=H*.82;player.action="idle";player.aT=0;player.stun=0;player.air=0;
  var d=defenderTypes[(state.pos-1)%defenderTypes.length];
  defender.type=d.type;defender.name=d.name;defender.accent=d.accent;defender.boss=(state.pos===5||state.pos===10);if(defender.boss){defender.name="THE RIVAL";defender.accent="#e9ff3f"}
  defender.readsNeeded=defender.boss?2:1;defender.readsWon=0;if(defender.boss)state.clock=state.clockMax+1.5;defender.x=W/2+rand(-28,28);defender.y=H*.555;defender.tx=defender.x;defender.ty=defender.y;defender.stun=0;defender.commit=0;defender.trashT=rand(1.5,3.5);
  pickStance();resetBall();ui();
  if(defender.boss)setTimeout(function(){if(running&&!paused)showCallout("RIVAL ROUND","win two reads")},120);
}
function upgradeMoment(){
  paused=true;upgradeGrid.innerHTML="";
  var pool=upgrades.slice().sort(function(){return Math.random()-.5}).slice(0,3);
  pool.forEach(function(u){
    var b=document.createElement("button");b.type="button";b.className="upgrade";
    b.innerHTML="<strong><i>"+u.icon+"</i>"+u.name+"</strong><small>"+u.desc+"</small>";
    b.addEventListener("click",function(){audioInit();sfx.ui();u.apply();upgradeOverlay.classList.add("hidden");spawnPossession()});
    upgradeGrid.appendChild(b);
  });
  upgradeOverlay.classList.remove("hidden");
}
function nextPossession(made){
  paused=true;
  setTimeout(function(){
    state.pos++;
    if(state.pos>state.max){endRun();return}
    if(made && (state.makes===2||state.makes===5||state.makes===8)){upgradeMoment()}
    else spawnPossession();
  },680);
}
function endRun(){
  running=false;paused=true;finalScore.textContent=state.score;madeStat.textContent=state.makes;bestComboStat.textContent="x"+state.bestCombo;perfectStat.textContent=state.reads;
  if(state.makes>=8){endKicker.textContent="Court owned";endText.textContent="Somebody is already lying about guarding you."}
  else if(state.makes>=5){endKicker.textContent="Respect earned";endText.textContent="Good run. The fence crowd definitely noticed."}
  else{endKicker.textContent="Run complete";endText.textContent="A few buckets short. Run it back."}
  endOverlay.classList.remove("hidden");
}

function hesitate(){
  if(paused||ball.shot||player.stun>0)return;
  player.action="hesi";player.aT=.22;sfx.squeak();floater("HESI",player.x,player.y-42,"#55dcff");
  var read=tryRead("hesi");if(read==="win")defender.tx+=rand(-20,20);else if(read==="lose")state.heat=clamp(state.heat-1,0,100);ui();
}
function crossover(dir){
  if(paused||ball.shot||player.stun>0)return;
  player.action="cross";player.aT=.3;player.facing=dir;player.tx=clamp(player.tx+dir*W*.23,46,W-46);sfx.cross();sfx.squeak();
  var read=tryRead("cross");
  if(read==="win"||read==="open"){defender.tx=clamp(defender.x-dir*42,38,W-38);state.combo++;state.bestCombo=Math.max(state.bestCombo,state.combo)}
  else if(read==="partial"){defender.tx=clamp(defender.x-dir*20,38,W-38)}
  else if(read==="lose"&&defender.type==="shadow"){player.stun=.12;floater("STAYED HOME",defender.x,defender.y-50,"#ff657a")}
  ui();
}
function stepback(){
  if(paused||ball.shot||player.stun>0)return;
  player.action="step";player.aT=.36;player.ty=clamp(player.ty+H*.085,H*.41,H*.84);defender.commit=.3;defender.ty-=10;sfx.squeak();
  var read=tryRead("step");if(read==="win"||read==="open"){floater("SPACE",player.x,player.y-48,"#e9ff3f");state.space=100}else if(read==="lose")defender.ty+=16;ui();
}
function drive(){
  if(paused||ball.shot||player.stun>0)return;
  if(player.y<H*.39){if(state.advantage>0||defender.stun>0||state.heat>=95)dunk();else layup();return}
  player.action="drive";player.aT=.42;sfx.squeak();
  var read=state.advantage>0?"open":tryRead("drive");
  if(read==="lose"&&(defender.stance==="cut"||defender.type==="wall")){
    if(state.ghostReady){state.ghostReady=false;floater("GHOST",player.x,player.y-50,"#55dcff")}
    else if(state.bully){defender.stun=.28;defender.ty-=26;defender.tx+=player.x<defender.x?34:-34;shake=5;floater("BULLY",player.x,player.y-50,"#ffb22f")}
    else{player.stun=.3;player.ty+=24;state.combo=1;state.space=0;state.heat=clamp(state.heat-7,0,100);sfx.block();showCallout("CUT OFF","try creating space");ui();return}
  }
  var burstAmt=(state.advantage>0?H*.22:H*.14);player.ty=clamp(player.ty-burstAmt,H*.28,H*.82);state.space=clamp(state.space+(state.advantage>0?8:-4),0,100);ui();
}
function layup(){
  if(paused||ball.shot||player.stun>0)return;
  registerMove("drive");player.action="layup";player.aT=.5;var contest=clamp(1-d2(player,defender)/115,0,1);var chance=.48+state.space*.002-contest*.28+state.heat*.0012;
  ball.shot=true;ball.kind="layup";ball.t=0;ball.dur=.5;ball.sx=ball.x;ball.sy=ball.y;ball.tx=W/2;ball.ty=H*.205;ball.arc=H*.09;ball.made=Math.random()<clamp(chance,.12,.88);ball.perfect=false;player.tx=W/2;player.ty=H*.29;
}
function dunk(){
  if(paused||ball.shot||player.stun>0)return;
  registerMove("drive");player.action="dunk";player.aT=.58;ball.shot=true;ball.kind="dunk";ball.t=0;ball.dur=.5;ball.sx=ball.x;ball.sy=ball.y;ball.tx=W/2;ball.ty=H*.205;ball.arc=H*.12;ball.made=true;ball.perfect=false;
  player.tx=W/2;player.ty=H*.255;state.combo++;state.bestCombo=Math.max(state.bestCombo,state.combo);
}
function shoot(charge){
  if(paused||ball.shot||player.stun>0)return;
  charge=clamp(charge,0,1);player.action="shot";player.aT=.5;
  var read=state.advantage>0?"open":tryRead("shot");
  var sweet=.72,perfectWindow=.055*state.shotWindow+(state.heat>=100?.018:0),perfect=Math.abs(charge-sweet)<=perfectWindow;
  var hoop={x:W/2,y:H*.205};var contest=clamp(1-d2(player,defender)/150,0,.86);contest*=Math.max(.28,1-state.deadeye);if(state.advantage>0)contest*=.18;if(defender.stun>0)contest*=.2;if(defender.type==="wall")contest*=1.08;
  var timing=Math.max(0,1-Math.abs(charge-sweet)/.42);var spaceBonus=state.space*.0022;
  var chance=.12+timing*.55+spaceBonus-contest*.34+state.heat*.0012;
  if(read==="lose")chance-=.08;if(perfect)chance=Math.max(chance,state.advantage>0?.95:.74);
  var made=Math.random()<clamp(chance,.04,.97);
  if(!made&&Math.abs(charge-sweet)<.18&&Math.random()<state.magnet){made=true;floater("MAGNET",hoop.x,hoop.y+40,"#55dcff")}
  ball.shot=true;ball.kind="jumper";ball.t=0;ball.dur=.74;ball.sx=ball.x;ball.sy=ball.y;ball.tx=hoop.x;ball.ty=hoop.y;ball.arc=H*(.17+.06*charge);ball.perfect=perfect;ball.made=made;
  if(perfect){sfx.pure();showCallout("PURE",state.advantage>0?"open + perfect":"perfect release")}else tone(330,.05,"triangle",.02,420);
}
function resolveShot(){
  if(ball.made){
    var base=ball.perfect?300:200,bonus=Math.max(0,state.combo-1)*50+state.styleBank;
    if(ball.kind==="dunk"){base=400;bonus=Math.max(0,state.combo-1)*70+state.styleBank;state.heat=clamp(state.heat+18,0,100);sfx.dunk();shake=13;freeze=.07;flash(.22);showCallout("POSTER","+"+(base+bonus))}
    else if(ball.kind==="layup"){base=250;sfx.swish();state.heat=clamp(state.heat+8,0,100);showCallout("TOUGH FINISH","+"+(base+bonus))}
    else{sfx.swish();state.heat=clamp(state.heat+(ball.perfect?17:10),0,100);if(ball.perfect)state.perfects++;else showCallout(state.styleBank?"CASH THE READ":"BUCKET","+"+(base+bonus))}
    state.score+=base+bonus;state.makes++;state.combo++;state.bestCombo=Math.max(state.bestCombo,state.combo);netT=.32;burst(W/2,H*.225,ball.perfect?22:14,ball.perfect?"#e9ff3f":"#ffffff");floater("+"+(base+bonus),W/2,H*.28,"#e9ff3f");state.styleBank=0;if(state.heat>=100)floater("ON FIRE",player.x,player.y-58,"#ffb22f");ui();nextPossession(true);
  }else{
    sfx.rim();shake=5;state.misses++;state.combo=1;state.readStreak=0;state.styleBank=0;state.heat=clamp(state.heat-12,0,100);showCallout("BRICK",state.space<45?"create more space":"keep shooting");burst(W/2,H*.21,9,"#ff7a18");ui();nextPossession(false);
  }
}
function flash(a){flashEl.style.opacity=String(a);setTimeout(function(){flashEl.style.opacity="0"},70)}
