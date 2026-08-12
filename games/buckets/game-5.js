(function(){
  "use strict";

  var app=document.getElementById("app");
  if(!app||typeof state==="undefined")return;

  var bag={
    chain:"",chainT:0,posMoves:[],bagWorkPaid:false,styleScore:0,phase:1,
    midrange:0,paint:0,bagWork:0,touch:0,showtime:0,cold:0
  };

  function phaseFor(pos){
    if(pos>=8)return {id:3,name:"THE CAGE",sub:"No easy reads",accent:"#ff4968"};
    if(pos>=4)return {id:2,name:"ROOFTOP",sub:"Less room. Faster recovery.",accent:"#55dcff"};
    return {id:1,name:"NEIGHBORHOOD",sub:"Build your bag",accent:"#e9ff3f"};
  }

  function installHud(){
    var style=document.createElement("style");
    style.textContent=".bagHud{position:absolute;z-index:9;left:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 48px);display:flex;gap:7px;align-items:center;pointer-events:none}.bagPill{padding:6px 9px;border-radius:999px;background:rgba(5,6,9,.72);border:1px solid rgba(255,255,255,.11);backdrop-filter:blur(8px);font-size:8px;font-weight:1000;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.72)}.bagPill b{color:#e9ff3f;font-size:10px}.stageFlash{position:absolute;z-index:18;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;background:rgba(4,5,8,.72);backdrop-filter:blur(6px)}.stageFlash.show{animation:stageIn 1.05s ease}.stageFlash div{text-align:center}.stageFlash strong{display:block;font-size:38px;line-height:.9;font-style:italic;font-weight:1000;letter-spacing:-.05em}.stageFlash span{display:block;margin-top:8px;font-size:9px;font-weight:1000;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.62)}@keyframes stageIn{0%{opacity:0}15%,70%{opacity:1}100%{opacity:0}}.moveToast{position:absolute;z-index:11;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 48px);padding:6px 9px;border-radius:999px;background:rgba(5,6,9,.72);border:1px solid rgba(233,255,63,.2);font-size:8px;font-weight:1000;letter-spacing:.08em;text-transform:uppercase;color:#e9ff3f;opacity:0;pointer-events:none}.moveToast.show{animation:moveToast .65s ease}@keyframes moveToast{0%{opacity:0;transform:translateY(5px)}20%,70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-4px)}}";
    document.head.appendChild(style);

    var hud=document.createElement("div");hud.className="bagHud";
    hud.innerHTML='<div class="bagPill" id="stagePill">NEIGHBORHOOD</div><div class="bagPill">STYLE <b id="styleScore">0</b></div>';
    app.appendChild(hud);

    var flash=document.createElement("div");flash.className="stageFlash";flash.id="stageFlash";
    flash.innerHTML='<div><strong id="stageTitle">NEIGHBORHOOD</strong><span id="stageSub">Build your bag</span></div>';
    app.appendChild(flash);

    var mt=document.createElement("div");mt.className="moveToast";mt.id="moveToast";app.appendChild(mt);

    var version=document.querySelector(".version");if(version)version.textContent="BUILD YOUR BAG v0.4";
    var kicker=startOverlay&&startOverlay.querySelector(".kicker");if(kicker)kicker.textContent="Nobody Creative presents · Build Your Bag v0.4";
    var lede=startOverlay&&startOverlay.querySelector(".lede");if(lede)lede.textContent="Read the defender, then decide how you want to beat them. Chain moves, build style, and take your bag from the neighborhood to The Cage.";
    var how=startOverlay&&startOverlay.querySelector(".how");
    if(how)how.innerHTML='<div><b>Drive → ↔</b>Euro step</div><div><b>Drive → ↓</b>Spin move</div><div><b>Drive → hold</b>Floater / pull-up</div><div><b>Stepback → hold</b>Fadeaway</div>';
    var small=startOverlay&&startOverlay.querySelector(".small");if(small)small.textContent="Short hold = pump fake · mix moves to grow STYLE and bonus points.";
  }

  installHud();
  var stagePill=document.getElementById("stagePill"),styleScoreEl=document.getElementById("styleScore"),stageFlash=document.getElementById("stageFlash"),stageTitle=document.getElementById("stageTitle"),stageSub=document.getElementById("stageSub"),moveToast=document.getElementById("moveToast");

  function moveToastShow(txt){
    if(!moveToast)return;moveToast.textContent=txt;moveToast.classList.remove("show");void moveToast.offsetWidth;moveToast.classList.add("show");
  }
  function stageIntro(p){
    if(!stageFlash)return;stageTitle.textContent=p.name;stageTitle.style.color=p.accent;stageSub.textContent=p.sub;stageFlash.classList.remove("show");void stageFlash.offsetWidth;stageFlash.classList.add("show");
  }
  function bagUI(){
    var p=phaseFor(state.pos);if(stagePill){stagePill.textContent=p.name;stagePill.style.borderColor=p.accent+"66"}if(styleScoreEl)styleScoreEl.textContent=bag.styleScore;
  }
  function clearChain(){bag.chain="";bag.chainT=0}
  function chain(name,t){bag.chain=name;bag.chainT=t||1.05}
  function markMove(name,style,bank){
    if(bag.posMoves.indexOf(name)<0)bag.posMoves.push(name);
    if(style){bag.styleScore+=style;bagUI();moveToastShow(name+" +"+style+" style")}
    if(bank)state.styleBank+=bank;
    if(bag.bagWork&&!bag.bagWorkPaid&&bag.posMoves.length>=3){bag.bagWorkPaid=true;bag.styleScore+=200;state.styleBank+=150;showCallout("DEEP BAG","+150 bank");moveToastShow("3-move chain +200 style");}
  }

  function resetBag(){
    bag.chain="";bag.chainT=0;bag.posMoves=[];bag.bagWorkPaid=false;bag.styleScore=0;bag.phase=1;
    bag.midrange=0;bag.paint=0;bag.bagWork=0;bag.touch=0;bag.showtime=0;bag.cold=0;bagUI();
  }

  var baseResetRun=resetRun;
  resetRun=function(){resetBag();baseResetRun();bag.phase=phaseFor(state.pos).id;bagUI()};

  var baseSpawn=spawnPossession;
  spawnPossession=function(){
    var prior=bag.phase;baseSpawn();bag.posMoves=[];bag.bagWorkPaid=false;clearChain();
    var p=phaseFor(state.pos);bag.phase=p.id;
    if(p.id===2)state.clock=Math.max(4,state.clock-.35);
    if(p.id===3)state.clock=Math.max(4,state.clock-.7);
    if(prior&&prior!==p.id)stageIntro(p);
    bagUI();ui();
  };

  var baseUI=ui;
  ui=function(){
    baseUI();
    var p=phaseFor(state.pos);roundLabel.textContent=p.name+" · "+state.pos+"/"+state.max+" · "+defender.name+(defender.boss?" · RIVAL":"");bagUI();
  };

  var baseUpdate=update;
  update=function(dt){
    if(bag.chainT>0){bag.chainT=Math.max(0,bag.chainT-dt);if(bag.chainT===0)bag.chain=""}
    baseUpdate(dt);
  };

  var baseDrawSky=drawSky;
  drawSky=function(){
    baseDrawSky();var p=phaseFor(state.pos);
    if(p.id===2){
      ctx.fillStyle="rgba(85,220,255,.035)";ctx.fillRect(0,0,W,H*.62);
      ctx.fillStyle="#080a0f";ctx.fillRect(0,H*.43,W,H*.04);
      ctx.strokeStyle="rgba(85,220,255,.28)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,H*.43);ctx.lineTo(W,H*.43);ctx.stroke();
      ctx.fillStyle="rgba(85,220,255,.16)";ctx.font="900 11px system-ui";ctx.fillText("ROOFTOP RUN",22,H*.415);
    }else if(p.id===3){
      ctx.fillStyle="rgba(255,73,104,.045)";ctx.fillRect(0,0,W,H*.65);
      ctx.fillStyle="#050609";
      for(var i=0;i<10;i++){var x=18+i*(W-36)/9,y=H*.46+(i%2)*7;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.fillRect(x-7,y+6,14,23)}
      ctx.strokeStyle="rgba(255,73,104,.34)";ctx.lineWidth=3;ctx.strokeRect(8,H*.31,W-16,H*.28);
    }
  };

  var baseDrawCourt=drawCourt;
  drawCourt=function(){
    baseDrawCourt();var p=phaseFor(state.pos);
    if(p.id===2){ctx.fillStyle="rgba(85,220,255,.025)";ctx.fillRect(0,H*.48,W,H*.52)}
    if(p.id===3){ctx.fillStyle="rgba(255,73,104,.035)";ctx.fillRect(0,H*.42,W,H*.58);ctx.save();ctx.translate(W*.09,H*.88);ctx.rotate(-1.2);ctx.fillStyle="rgba(255,73,104,.13)";ctx.font="1000 33px system-ui";ctx.fillText("THE CAGE",0,0);ctx.restore()}
  };

  function pumpFake(){
    if(paused||ball.shot||player.stun>0)return;
    player.action="shot";player.aT=.18;sfx.squeak();
    var bite=(defender.stance==="press"||defender.stance==="reach")?.82:(defender.stance==="cut"?.42:.18);
    bite+=state.heat*.0015;
    if(Math.random()<bite){defender.stun=.48;defender.commit=.42;state.advantage=Math.max(state.advantage,1.05+state.advantageBonus);state.space=Math.max(state.space,86);markMove("PUMP FAKE",125,80);showCallout("BIT!","attack the closeout");tone(720,.06,"triangle",.025,940)}
    else{markMove("PUMP FAKE",25,0);floater("STAYED DOWN",defender.x,defender.y-48,"#a4a6ad")}
    chain("pump",.8);ui();
  }

  function specialFinish(kind,dir){
    if(paused||ball.shot||player.stun>0)return;
    var hoop={x:W/2,y:H*.205},contest=clamp(1-d2(player,defender)/120,0,1);
    var baseChance=kind==="euro"?.64:.58;
    if(state.advantage>0)baseChance+=.16;if(defender.stun>0)baseChance+=.12;if(bag.paint)baseChance+=.12;
    baseChance+=state.space*.0015-contest*(bag.paint?.12:.25);
    player.action="layup";player.aT=.52;player.tx=clamp(W/2+(dir||1)*28,48,W-48);player.ty=H*.29;
    ball.shot=true;ball.kind="layup";ball.specialKind=kind;ball.t=0;ball.dur=.53;ball.sx=ball.x;ball.sy=ball.y;ball.tx=hoop.x+(kind==="euro"?(dir||1)*5:0);ball.ty=hoop.y;ball.arc=H*.105;ball.made=Math.random()<clamp(baseChance,.18,.95);ball.perfect=false;
    markMove(kind==="euro"?"EURO":"SPIN FINISH",kind==="euro"?180:200,kind==="euro"?110:125);clearChain();
  }

  function euroStep(dir){
    if(paused||ball.shot)return;
    player.facing=dir;player.tx=clamp(player.x+dir*W*.13,46,W-46);defender.tx=clamp(defender.x-dir*38,35,W-35);defender.commit=.36;sfx.squeak();sfx.cross();
    if(player.y<H*.54){specialFinish("euro",dir);return}
    state.advantage=Math.max(state.advantage,.85+state.advantageBonus);state.space=Math.max(state.space,78);markMove("EURO",140,75);chain("euro",.7);ui();
  }

  function spinMove(){
    if(paused||ball.shot)return;
    var dir=player.x<=defender.x?-1:1;player.action="spin";player.aT=.38;player.facing=dir;player.tx=clamp(player.x+dir*W*.15,46,W-46);player.ty=clamp(player.y-H*.09,H*.29,H*.82);defender.stun=.34+state.stunBonus*.5;defender.tx=clamp(defender.x-dir*26,35,W-35);state.advantage=Math.max(state.advantage,.75+state.advantageBonus);state.space=Math.max(state.space,72);sfx.cross();markMove("SPIN",160,90);chain("spin",.75);ui();
    if(player.y<H*.47&&d2(player,defender)<95)specialFinish("spin",dir);
  }

  function floaterShot(charge){
    if(paused||ball.shot)return;
    var hoop={x:W/2,y:H*.205},sweet=.43,perfect=Math.abs(charge-sweet)<(.085+(bag.touch?.04:0));
    var contest=clamp(1-d2(player,defender)/125,0,.8)*(bag.touch?.35:.72);var timing=Math.max(0,1-Math.abs(charge-sweet)/.38);
    var chance=.28+timing*.46+state.space*.0014-contest*.24+(bag.touch?.12:0)+(state.advantage>0?.10:0);
    player.action="layup";player.aT=.48;ball.shot=true;ball.kind="layup";ball.specialKind="floater";ball.t=0;ball.dur=.62;ball.sx=ball.x;ball.sy=ball.y;ball.tx=hoop.x;ball.ty=hoop.y;ball.arc=H*.145;ball.made=Math.random()<clamp(chance,.12,.95);ball.perfect=perfect;
    markMove("FLOATER",170,110+(bag.touch?45:0));clearChain();
  }

  function enhancedJumper(charge,kind){
    var savedSpace=state.space,savedWindow=state.shotWindow,savedStun=defender.stun;
    if(kind==="fade"){state.space=Math.max(state.space,88);defender.stun=Math.max(defender.stun,.22)}
    if(kind==="pullup")state.space=Math.max(state.space,64+(bag.midrange?18:0));
    if(bag.midrange&&(kind==="pullup"||kind==="fade"))state.shotWindow*=1.28;
    if(bag.cold&&state.clock<=2)state.shotWindow*=1.45;
    baseShoot(charge);
    if(ball.shot){ball.specialKind=kind;if(bag.midrange&&!ball.made&&Math.random()<.16)ball.made=true}
    state.space=savedSpace;state.shotWindow=savedWindow;defender.stun=Math.max(defender.stun,savedStun);
    markMove(kind==="fade"?"FADEAWAY":"PULL-UP",kind==="fade"?180:150,kind==="fade"?120:95);clearChain();
  }

  var baseHesi=hesitate;
  hesitate=function(){baseHesi();if(!paused&&!ball.shot){markMove("HESI",20,0);chain("hesi",.72)}};

  var baseCross=crossover;
  crossover=function(dir){
    if(bag.chain==="drive"&&bag.chainT>0){euroStep(dir);return}
    baseCross(dir);if(!paused&&!ball.shot){markMove("CROSS",25,0);chain("cross",.78)}
  };

  var baseStep=stepback;
  stepback=function(){
    if(bag.chain==="drive"&&bag.chainT>0){spinMove();return}
    baseStep();if(!paused&&!ball.shot){markMove("STEPBACK",45,15);chain("step",1.05)}
  };

  var baseDrive=drive;
  drive=function(){
    var wasShot=ball.shot;baseDrive();if(!paused&&!ball.shot&&!wasShot&&player.action==="drive"){markMove("DRIVE",20,0);chain("drive",1.12)}
  };

  var baseLayup=layup;
  layup=function(){
    var contact=d2(player,defender)<92&&state.advantage<=0,saved=state.space;
    if(contact&&bag.paint)state.space=Math.max(state.space,55);
    baseLayup();state.space=saved;
    if(ball.shot&&contact){ball.specialKind="contact";markMove("CONTACT",175,bag.paint?145:95)}
  };

  var baseDunk=dunk;
  dunk=function(){baseDunk();if(ball.shot){ball.specialKind="dunk";markMove("DUNK",bag.showtime?220:100,bag.showtime?180:60)}};

  var baseShoot=shoot;
  shoot=function(charge){
    if(charge<.16){pumpFake();return}
    if(bag.chain==="drive"&&bag.chainT>0){if(charge<.56)floaterShot(charge);else enhancedJumper(charge,"pullup");return}
    if(bag.chain==="step"&&bag.chainT>0){enhancedJumper(charge,"fade");return}
    var saved=state.shotWindow;if(bag.cold&&state.clock<=2)state.shotWindow*=1.45;baseShoot(charge);state.shotWindow=saved;clearChain();
  };

  var baseResolve=resolveShot;
  resolveShot=function(){
    var special=ball.specialKind||"",made=ball.made;
    if(made&&special==="floater"&&bag.touch){state.styleBank+=75;bag.styleScore+=100}
    if(made&&special==="dunk"&&bag.showtime){state.heat=clamp(state.heat+18,0,100);bag.styleScore+=150}
    baseResolve();
    if(made&&special){
      var labels={euro:"EURO STEP",spin:"SPIN CYCLE",floater:"TOUCH",pullup:"PULL-UP",fade:"FADEAWAY",contact:"AND-ONE ENERGY",dunk:"SHOWTIME"};
      showCallout(labels[special]||"BUCKET","bag work");
    }
    ball.specialKind="";bagUI();
  };

  upgrades.push(
    {icon:"◫",name:"MIDRANGE MENACE",desc:"Pull-ups and fades get a larger release window and extra make boost.",apply:function(){bag.midrange=1}},
    {icon:"⚒",name:"PAINT BEAST",desc:"Euro steps and contact finishes survive more traffic.",apply:function(){bag.paint=1}},
    {icon:"♣",name:"BAG WORK",desc:"Use three different moves in one possession to bank +150 bonus points.",apply:function(){bag.bagWork=1}},
    {icon:"☁",name:"TOUCH",desc:"Floaters ignore more contest and become easier to time.",apply:function(){bag.touch=1}},
    {icon:"★",name:"SHOWTIME",desc:"Dunks generate extra Heat, Style, and bonus bank.",apply:function(){bag.showtime=1}},
    {icon:"❄",name:"COLD BLOODED",desc:"Under 2 seconds, your perfect-release window grows dramatically.",apply:function(){bag.cold=1}}
  );

  bagUI();
})();