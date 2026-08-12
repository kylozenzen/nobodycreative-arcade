var canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
var scoreEl=document.getElementById("score"),heatEl=document.getElementById("heat"),comboEl=document.getElementById("combo");
var roundLabel=document.getElementById("roundLabel"),startOverlay=document.getElementById("startOverlay"),upgradeOverlay=document.getElementById("upgradeOverlay"),endOverlay=document.getElementById("endOverlay");
var upgradeGrid=document.getElementById("upgradeGrid"),shotMeter=document.getElementById("shotMeter"),shotFill=document.getElementById("shotFill"),flashEl=document.getElementById("flash");
var readHud=document.getElementById("readHud"),readLabel=document.getElementById("readLabel"),readHint=document.getElementById("readHint"),spaceFill=document.getElementById("spaceFill"),clockEl=document.getElementById("clock");
var callout=document.getElementById("callout"),calloutMain=document.getElementById("calloutMain"),calloutSub=document.getElementById("calloutSub");
var finalScore=document.getElementById("finalScore"),madeStat=document.getElementById("madeStat"),bestComboStat=document.getElementById("bestComboStat"),perfectStat=document.getElementById("perfectStat"),endText=document.getElementById("endText"),endKicker=document.getElementById("endKicker");

var W=390,H=844,DPR=1,last=0,time=0,running=false,paused=false,freeze=0,shake=0,netT=0;
var particles=[],streaks=[],floaters=[];
var pointer={down:false,id:null,sx:0,sy:0,x:0,y:0,t0:0,moved:false,charge:0};

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function easeOut(t){return 1-Math.pow(1-t,3)}
function rand(a,b){return a+Math.random()*(b-a)}
function d2(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy)}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function line(c,x1,y1,x2,y2,w,color){c.strokeStyle=color;c.lineWidth=w;c.lineCap="round";c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}

var state={pos:1,max:10,score:0,heat:0,combo:1,bestCombo:1,makes:0,misses:0,perfects:0,
shotWindow:1,stunBonus:0,bully:false,magnet:0,ghost:false,ghostReady:false,quickFirst:false,
clockMax:8.5,clock:8.5,space:18,advantage:0,advantageBonus:0,reads:0,readStreak:0,bestReadStreak:0,
lastMove:"",repeat:0,antiSpam:2,deadeye:0,styleBank:0,timeouts:0};
var player={x:195,y:690,tx:195,ty:690,r:18,action:"idle",aT:0,stun:0,dribble:0,facing:1,lean:0,air:0};
var defender={x:195,y:470,tx:195,ty:470,r:21,type:"shadow",name:"THE SHADOW",stun:0,commit:0,facing:-1,trashT:0,
stance:"press",stanceLabel:"PRESS",stanceHint:"Crowding your handle",stanceColor:"#ff5470",boss:false,readsNeeded:1,readsWon:0};
var ball={x:207,y:680,r:9,shot:false,t:0,dur:.78,sx:0,sy:0,tx:0,ty:0,arc:0,perfect:false,made:false,spin:0,kind:"jumper"};
var defenderTypes=[
 {type:"reacher",name:"THE REACHER",accent:"#ff5470"},
 {type:"wall",name:"THE WALL",accent:"#ffb22f"},
 {type:"shadow",name:"THE SHADOW",accent:"#5bd8ff"},
 {type:"gambler",name:"THE GAMBLER",accent:"#c783ff"}
];
var stanceDefs={
 press:{id:"press",label:"PRESS",hint:"Crowding your handle",coach:"Crowding you · cross or tap hesi",color:"#ff5470",counter:["cross","hesi"]},
 sag:{id:"sag",label:"SAG",hint:"Giving you air",coach:"Giving space · shoot it",color:"#55dcff",counter:["shot"]},
 reach:{id:"reach",label:"REACH",hint:"Hands are active",coach:"Hands active · cross them",color:"#ffb22f",counter:["cross"]},
 cut:{id:"cut",label:"CUT OFF",hint:"Sitting on the drive",coach:"Drive cut off · step back",color:"#c783ff",counter:["step"]}
};
var upgrades=[
 {icon:"◎",name:"HEAT CHECK",desc:"Widen the perfect-release window.",apply:function(){state.shotWindow=Math.min(1.75,state.shotWindow+.24)}},
 {icon:"↯",name:"ANKLE INSURANCE",desc:"Crossovers stun defenders longer.",apply:function(){state.stunBonus+=.16}},
 {icon:"▰",name:"BULLY BALL",desc:"Drives knock defenders out of your lane.",apply:function(){state.bully=true}},
 {icon:"⌁",name:"MAGNET RIM",desc:"Near misses get a second chance.",apply:function(){state.magnet=Math.min(.55,state.magnet+.18)}},
 {icon:"◇",name:"GHOST STEP",desc:"Ignore the first defensive bump each possession.",apply:function(){state.ghost=true}},
 {icon:"🔥",name:"MICROWAVE",desc:"Start every new possession with extra heat.",apply:function(){state.quickFirst=true}},
 {icon:"⏱",name:"CLOCKWORK",desc:"Add 1.5 seconds to every possession.",apply:function(){state.clockMax=Math.min(12,state.clockMax+1.5)}},
 {icon:"➜",name:"FIRST STEP",desc:"Correct reads stay open longer.",apply:function(){state.advantageBonus+=.35}},
 {icon:"◉",name:"DEAD EYE",desc:"Reduce the penalty on contested jumpers.",apply:function(){state.deadeye=Math.min(.35,state.deadeye+.12)}},
 {icon:"♜",name:"DEEP BAG",desc:"Defenders take longer to adapt to repeated moves.",apply:function(){state.antiSpam=Math.min(4,state.antiSpam+1)}}
];

var AC=null;
function audioInit(){
  try{
    if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
  }catch(e){}
}
function tone(freq,dur,type,vol,slide){
  if(!AC)return;
  var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=type||"sine";o.frequency.setValueAtTime(freq,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
  g.gain.setValueAtTime(vol||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.02);
}
function noise(dur,vol){
  if(!AC)return;
  var len=Math.floor(AC.sampleRate*dur),buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);
  for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  var s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=vol||.025;s.connect(g);g.connect(AC.destination);s.start();
}
var sfx={
 ui:function(){tone(420,.07,"square",.025,650)},
 bounce:function(){tone(105,.07,"sine",.045,68)},
 squeak:function(){tone(1550,.035,"sawtooth",.012,950)},
 cross:function(){noise(.055,.02);tone(240,.06,"triangle",.02,390)},
 pure:function(){tone(660,.09,"sine",.035,990);setTimeout(function(){tone(990,.11,"sine",.03,1320)},55)},
 swish:function(){noise(.16,.045);tone(520,.08,"triangle",.018,760)},
 rim:function(){tone(310,.1,"square",.035,180);tone(540,.06,"triangle",.015,390)},
 dunk:function(){tone(95,.16,"sine",.07,45);noise(.1,.055)},
 block:function(){tone(160,.12,"square",.04,80)}
};

function resize(){
  var r=canvas.getBoundingClientRect();DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(r.width*DPR);canvas.height=Math.round(r.height*DPR);
  W=r.width;H=r.height;ctx.setTransform(DPR,0,0,DPR,0,0);
  if(!running){player.x=player.tx=W/2;player.y=player.ty=H*.82}
}
window.addEventListener("resize",resize);resize();

function ui(){
  scoreEl.textContent=state.score;
  heatEl.style.width=state.heat+"%";
  comboEl.textContent="x"+state.combo+" combo";
  comboEl.className="comboPill"+(state.combo>=3||state.heat>=75?" hot":"");
  roundLabel.textContent="Read the Floor · "+state.pos+"/"+state.max+" · "+defender.name+(defender.boss?" · RIVAL":"");
  if(readLabel){readLabel.textContent=(state.advantage>0?"OPEN · ":"")+defender.stanceLabel+(defender.boss?" "+defender.readsWon+"/"+defender.readsNeeded:"");readLabel.style.color=state.advantage>0?"#e9ff3f":defender.stanceColor;}
  if(readHint)readHint.textContent=state.advantage>0?"Attack now — recovery incoming":((state.pos<=3?defender.stanceCoach:defender.stanceHint)||"");
  if(spaceFill)spaceFill.style.width=clamp(state.space,0,100)+"%";
  if(readHud)readHud.className="readHud"+(state.advantage>0?" open":"");
  if(clockEl){clockEl.textContent=Math.max(0,state.clock).toFixed(1);clockEl.className="clock"+(state.clock<=3?" danger":"");}
}
function showCallout(main,sub){
  calloutMain.textContent=main;calloutSub.textContent=sub||"";
  callout.classList.remove("show");void callout.offsetWidth;callout.classList.add("show");
}
function setStance(id){
  var s=stanceDefs[id]||stanceDefs.press;defender.stance=s.id;defender.stanceLabel=s.label;defender.stanceHint=s.hint;defender.stanceCoach=s.coach;defender.stanceColor=s.color;ui();
}
function pickStance(exclude){
  var pool;
  if(defender.type==="reacher")pool=["reach","press","sag"];
  else if(defender.type==="wall")pool=["cut","sag","press"];
  else if(defender.type==="gambler")pool=["reach","press","cut","sag"];
  else pool=["press","sag","cut","reach"];
  if(exclude&&pool.length>1)pool=pool.filter(function(x){return x!==exclude});
  setStance(pool[Math.floor(Math.random()*pool.length)]);
}
function adaptTo(move){
  var map={cross:"sag",hesi:"sag",step:"reach",drive:"cut",shot:"press"};setStance(map[move]||"press");
}
function registerMove(move){
  if(state.lastMove===move)state.repeat++;else{state.lastMove=move;state.repeat=1}
  if(state.repeat>state.antiSpam){state.repeat=1;state.readStreak=0;state.space=clamp(state.space-18,0,100);state.advantage=0;adaptTo(move);showCallout("HE'S ON IT","mix up your bag");sfx.block();ui();return true}
  return false;
}
function tryRead(move){
  if(state.advantage>0)return "open";
  if(registerMove(move))return "adapted";
  var s=stanceDefs[defender.stance],correct=s.counter.indexOf(move)>=0;
  if(correct){
    defender.readsWon++;state.reads++;state.readStreak++;state.bestReadStreak=Math.max(state.bestReadStreak,state.readStreak);state.styleBank+=75;state.heat=clamp(state.heat+8,0,100);
    if(defender.boss&&defender.readsWon<defender.readsNeeded){defender.stun=.18;state.space=clamp(state.space+20,0,100);showCallout("RIVAL ADAPTS",defender.readsWon+"/"+defender.readsNeeded+" reads");pickStance(defender.stance);return "partial"}
    state.advantage=1.25+state.advantageBonus+(state.heat>=100?.25:0);state.space=100;defender.stun=.5+state.stunBonus;showCallout("READ 'EM","+75 style banked");burst(defender.x,defender.y+8,10,"#e9ff3f");sfx.cross();ui();return "win";
  }
  state.readStreak=0;state.space=clamp(state.space-14,0,100);defender.commit=.24;state.heat=clamp(state.heat-2,0,100);floater("NOT THERE",player.x,player.y-46,"#ff657a");ui();return "lose";
}
function shotClockViolation(){
  if(paused||ball.shot)return;paused=true;state.timeouts++;state.misses++;state.combo=1;state.readStreak=0;state.styleBank=0;state.heat=clamp(state.heat-10,0,100);sfx.block();showCallout("SHOT CLOCK","possession lost");ui();nextPossession(false);
}
function floater(txt,x,y,color){floaters.push({txt:txt,x:x,y:y,t:0,life:.8,color:color||"#fff"})}
function burst(x,y,n,color){
  for(var i=0;i<(n||16);i++)particles.push({x:x,y:y,vx:rand(-180,180),vy:rand(-210,-40),t:0,life:rand(.4,.8),r:rand(1.5,4),color:color||"#e9ff3f"});
}
function trail(x,y,color){streaks.push({x:x,y:y,vx:rand(-25,25),vy:rand(30,90),t:0,life:.25,r:rand(2,5),color:color})}
