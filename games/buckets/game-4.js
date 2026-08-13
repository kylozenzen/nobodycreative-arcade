function lockMobileBrowser(){
  var root=document.documentElement,body=document.body,app=document.getElementById("app");
  [root,body,app,canvas].forEach(function(el){
    if(!el)return;
    el.style.webkitUserSelect="none";
    el.style.userSelect="none";
    el.style.webkitTouchCallout="none";
    el.style.webkitTapHighlightColor="transparent";
    el.style.overscrollBehavior="none";
  });
  root.style.overflow="hidden";
  root.style.touchAction="none";
  body.style.overflow="hidden";
  body.style.touchAction="none";
  body.style.position="fixed";
  body.style.inset="0";
  body.style.width="100%";
  body.style.height="100%";
  if(app){app.style.touchAction="none";app.style.overflow="hidden"}
  canvas.style.touchAction="none";

  document.addEventListener("touchmove",function(e){e.preventDefault()},{passive:false});
  ["gesturestart","gesturechange","gestureend"].forEach(function(type){
    document.addEventListener(type,function(e){e.preventDefault()},{passive:false});
  });
  ["contextmenu","dragstart","selectstart"].forEach(function(type){
    document.addEventListener(type,function(e){e.preventDefault()});
  });
  document.addEventListener("dblclick",function(e){e.preventDefault()},{passive:false});
  window.addEventListener("scroll",function(){window.scrollTo(0,0)},{passive:true});
}
lockMobileBrowser();

function down(e){
  if(!running||paused)return;audioInit();pointer.down=true;pointer.id=e.pointerId;pointer.sx=pointer.x=e.clientX;pointer.sy=pointer.y=e.clientY;pointer.t0=performance.now();pointer.moved=false;pointer.charge=0;
  try{canvas.setPointerCapture(e.pointerId)}catch(err){}
}
function move(e){
  if(!pointer.down||e.pointerId!==pointer.id)return;pointer.x=e.clientX;pointer.y=e.clientY;
  var dx=pointer.x-pointer.sx,dy=pointer.y-pointer.sy;if(Math.sqrt(dx*dx+dy*dy)>20){pointer.moved=true;shotMeter.classList.remove("active")}
}
function up(e){
  if(!pointer.down||e.pointerId!==pointer.id)return;
  var dx=e.clientX-pointer.sx,dy=e.clientY-pointer.sy,mag=Math.sqrt(dx*dx+dy*dy),held=(performance.now()-pointer.t0)/1000;
  pointer.down=false;shotMeter.classList.remove("active");shotFill.style.width="0%";
  if(mag>30){
    if(Math.abs(dx)>Math.abs(dy))crossover(dx>0?1:-1);
    else if(dy<0)drive();else stepback();
  }else if(held>.16){shoot(clamp((held-.12)/.9,0,1))}
  else hesitate();
}
canvas.addEventListener("pointerdown",down,{passive:true});canvas.addEventListener("pointermove",move,{passive:true});canvas.addEventListener("pointerup",up,{passive:true});canvas.addEventListener("pointercancel",function(){pointer.down=false;shotMeter.classList.remove("active")},{passive:true});

window.addEventListener("keydown",function(e){
  if(!running||paused)return;
  if(e.key==="ArrowLeft"||e.key==="a")crossover(-1);
  else if(e.key==="ArrowRight"||e.key==="d")crossover(1);
  else if(e.key==="ArrowUp"||e.key==="w")drive();
  else if(e.key==="ArrowDown"||e.key==="s")stepback();
  else if(e.key==="h")hesitate();
  else if(e.key===" "){e.preventDefault();shoot(.72)}
});
document.getElementById("startBtn").addEventListener("click",function(){audioInit();resetRun()});
document.getElementById("restartBtn").addEventListener("click",function(){audioInit();resetRun()});
window.startBuckets=resetRun;

var bagScript=document.createElement("script");
bagScript.src="./game-5.js";
bagScript.async=false;
bagScript.onload=function(){
  var shellScript=document.createElement("script");
  shellScript.src="./game-6.js";
  shellScript.async=false;
  document.body.appendChild(shellScript);
};
document.body.appendChild(bagScript);
