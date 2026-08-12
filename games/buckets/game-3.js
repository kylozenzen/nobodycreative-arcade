function update(dt){
  time+=dt;if(!running||paused)return;
  if(freeze>0){freeze-=dt;return}
  if(!ball.shot){state.clock-=dt;if(state.clock<=0){state.clock=0;ui();shotClockViolation();return}}
  if(state.advantage>0){state.advantage=Math.max(0,state.advantage-dt);if(state.advantage===0)pickStance(defender.stance)}
  state.space=clamp(state.space-dt*(state.advantage>0?5:11),0,100);
  if(shake>0)shake=Math.max(0,shake-dt*30);
  if(netT>0)netT-=dt;
  if(player.stun>0)player.stun-=dt;if(player.aT>0)player.aT-=dt;
  if(defender.stun>0)defender.stun-=dt;if(defender.commit>0)defender.commit-=dt;
  player.dribble+=dt*(player.action==="drive"?12:8);
  var ox=player.x,oy=player.y;player.x=lerp(player.x,player.tx,1-Math.pow(.0006,dt));player.y=lerp(player.y,player.ty,1-Math.pow(.0012,dt));
  player.lean=clamp((player.x-ox)*.18,-.28,.28);
  if(Math.sin(player.dribble*2*Math.PI)>0.96&&!ball.shot)sfx.bounce();

  if(!ball.shot){
    var handSide=player.action==="cross"?(player.facing||1):(Math.sin(player.dribble*.8)>0?1:-1);
    var bounce=Math.abs(Math.sin(player.dribble*Math.PI));
    ball.x=player.x+handSide*(12+4*(1-bounce));ball.y=player.y-4+bounce*23;ball.spin+=dt*9;
  }else{
    ball.t+=dt;var t=clamp(ball.t/ball.dur,0,1),e=easeOut(t);
    ball.x=lerp(ball.sx,ball.tx,e);ball.y=lerp(ball.sy,ball.ty,e)-Math.sin(Math.PI*t)*ball.arc;ball.spin+=dt*18;
    if(player.action==="dunk"){player.air=Math.sin(Math.PI*t)*18}
    trail(ball.x,ball.y,ball.perfect?"#e9ff3f":"rgba(255,122,24,.8)");
    if(t>=1){ball.shot=false;player.air=0;resolveShot()}
  }

  if(defender.stun<=0&&!ball.shot){
    defender.trashT-=dt;
    var targetX=player.x;
    if(defender.type==="reacher")targetX+=Math.sin(time*5)*12;
    if(defender.type==="shadow")targetX=player.x;
    if(defender.type==="wall")targetX=lerp(defender.x,player.x,.35);
    if(defender.type==="gambler")targetX+=Math.sin(time*3.7)*24;
    defender.tx=clamp(targetX,35,W-35);
    var gap=defender.stance==="press"||defender.stance==="reach"?H*.125:defender.stance==="sag"?H*.205:H*.16;
    defender.ty=clamp(player.y-gap,H*.32,H*.64);
    if(defender.commit>0)defender.tx+=player.facing*26;
    defender.x=lerp(defender.x,defender.tx,1-Math.pow(defender.type==="shadow"?.003:.012,dt));
    defender.y=lerp(defender.y,defender.ty,1-Math.pow(.02,dt));
    if(d2(player,defender)<43&&player.action!=="drive"){
      if(state.ghostReady)state.ghostReady=false;
      else{player.stun=.18;player.ty+=10;state.heat=clamp(state.heat-3,0,100)}
    }
  }

  if(pointer.down&&!pointer.moved){
    var held=(performance.now()-pointer.t0)/1000;
    if(held>.12){pointer.charge=clamp((held-.12)/.9,0,1);shotMeter.classList.add("active");shotFill.style.width=(pointer.charge*100)+"%"}
  }
  ui();

  for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;if(p.t>p.life)particles.splice(i,1)}
  for(var j=streaks.length-1;j>=0;j--){var q=streaks[j];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.t>q.life)streaks.splice(j,1)}
  for(var k=floaters.length-1;k>=0;k--){var f=floaters[k];f.t+=dt;f.y-=24*dt;if(f.t>f.life)floaters.splice(k,1)}
}

function drawSky(){
  var g=ctx.createLinearGradient(0,0,0,H*.52);g.addColorStop(0,"#070811");g.addColorStop(1,"#151729");ctx.fillStyle=g;ctx.fillRect(0,0,W,H*.6);
  ctx.fillStyle="rgba(255,255,255,.45)";
  for(var i=0;i<16;i++){var sx=(i*83+41)%W,sy=85+(i*47)%Math.max(100,H*.24);ctx.fillRect(sx,sy,1,1)}
  var base=H*.42;ctx.fillStyle="#090a10";
  var widths=[50,72,41,64,88,46,73],x=-12;
  for(i=0;i<widths.length;i++){var bw=widths[i],bh=60+((i*43)%110);ctx.fillRect(x,base-bh,bw,bh);ctx.fillStyle="rgba(233,255,63,.08)";for(var wy=base-bh+12;wy<base-8;wy+=19)for(var wx=x+9;wx<x+bw-8;wx+=16)if((wx+wy+i)%3<1.2)ctx.fillRect(wx,wy,4,3);ctx.fillStyle="#090a10";x+=bw-4}
  var lightY=H*.19;
  ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(28,H*.47);ctx.lineTo(28,lightY);ctx.stroke();ctx.beginPath();ctx.moveTo(W-28,H*.47);ctx.lineTo(W-28,lightY);ctx.stroke();
  var rg=ctx.createRadialGradient(28,lightY,0,28,lightY,H*.2);rg.addColorStop(0,"rgba(255,245,205,.17)");rg.addColorStop(1,"rgba(255,245,205,0)");ctx.fillStyle=rg;ctx.fillRect(0,0,W,H*.45);
}
function drawFence(){
  var top=H*.32,bot=H*.58;ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle="#aeb3be";ctx.lineWidth=.8;
  for(var x=-H;x<W+H;x+=18){ctx.beginPath();ctx.moveTo(x,bot);ctx.lineTo(x+(bot-top),top);ctx.stroke()}
  for(x=0;x<W+H;x+=18){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-(bot-top),bot);ctx.stroke()}
  ctx.globalAlpha=.42;line(ctx,0,top,W,top,2,"#6f7480");line(ctx,0,bot,W,bot,2,"#6f7480");ctx.restore();
}
function courtPoint(y){var t=clamp((y-H*.18)/(H*.82-H*.18),0,1);return {l:lerp(W*.23,10,t),r:lerp(W*.77,W-10,t)}}
function drawCourt(){
  var topY=H*.17,botY=H;ctx.fillStyle="#151619";ctx.beginPath();ctx.moveTo(W*.22,topY);ctx.lineTo(W*.78,topY);ctx.lineTo(W,botY);ctx.lineTo(0,botY);ctx.closePath();ctx.fill();
  var grad=ctx.createLinearGradient(0,topY,0,H);grad.addColorStop(0,"rgba(255,255,255,.015)");grad.addColorStop(1,"rgba(233,255,63,.035)");ctx.fillStyle=grad;ctx.fill();
  ctx.strokeStyle="rgba(240,241,232,.34)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.22,topY);ctx.lineTo(0,H);ctx.moveTo(W*.78,topY);ctx.lineTo(W,H);ctx.stroke();
  ctx.beginPath();ctx.ellipse(W/2,H*.72,W*.24,H*.10,0,0,Math.PI*2);ctx.strokeStyle="rgba(240,241,232,.18)";ctx.stroke();
  var laneTop=H*.205,laneBot=H*.49,p1=courtPoint(laneTop),p2=courtPoint(laneBot);
  ctx.beginPath();ctx.moveTo(W*.43,laneTop);ctx.lineTo(p2.l+W*.18,laneBot);ctx.lineTo(p2.r-W*.18,laneBot);ctx.lineTo(W*.57,laneTop);ctx.closePath();ctx.fillStyle="rgba(233,255,63,.035)";ctx.fill();ctx.strokeStyle="rgba(240,241,232,.22)";ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,H*.47,W*.12,0,Math.PI*2);ctx.strokeStyle="rgba(240,241,232,.16)";ctx.stroke();
  ctx.save();ctx.translate(W*.09,H*.76);ctx.rotate(-1.22);ctx.fillStyle="rgba(255,255,255,.05)";ctx.font="900 30px system-ui";ctx.fillText("TRUST NOBODY",0,0);ctx.restore();
}
function drawHoop(){
  var x=W/2,backY=H*.165,rimY=H*.205;
  ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(x-W*.18,backY+7,W*.36,7);
  rr(ctx,x-W*.17,backY-W*.055,W*.34,W*.11,5);ctx.fillStyle="rgba(222,228,238,.13)";ctx.fill();ctx.strokeStyle="rgba(245,247,250,.7)";ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle="rgba(245,247,250,.45)";ctx.lineWidth=2;ctx.strokeRect(x-24,backY-13,48,28);
  ctx.strokeStyle="#ff6b24";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,rimY,W*.075,6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="rgba(240,240,235,.55)";ctx.lineWidth=1.4;
  var sway=Math.sin(netT*32)*4*(netT>0?netT/.32:0);
  for(var i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*W*.027,rimY+4);ctx.quadraticCurveTo(x+i*W*.02+sway,rimY+28,x+i*W*.014,rimY+40);ctx.stroke()}
  for(i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x+sway*.2,rimY+15+i*9,W*(.055-i*.009),3.5,0,0,Math.PI*2);ctx.stroke()}
}
function shadow(x,y,s){ctx.fillStyle="rgba(0,0,0,.36)";ctx.beginPath();ctx.ellipse(x,y+24,26*s,8*s,0,0,Math.PI*2);ctx.fill()}
function drawHuman(o,isPlayer){
  var s=isPlayer?1:1.07,x=o.x,y=o.y-(isPlayer?player.air:0),stun=!isPlayer&&o.stun>0;
  var bounce=Math.sin(time*8+(isPlayer?0:1))*1.4,lean=isPlayer?player.lean:0;
  ctx.save();ctx.translate(x,y+bounce);ctx.rotate(lean);
  shadow(0,0,s);
  var body=isPlayer?"#f1f2ec":"#1e222d",accent=isPlayer?"#e9ff3f":(o.accent||"#55dcff");
  if(stun){ctx.rotate(Math.sin(time*30)*.08);y+=3}
  var legSpread=isPlayer&&player.action==="cross"?9:6;
  line(ctx,-5,11,-legSpread,33,8*s,body);line(ctx,5,11,legSpread,33,8*s,body);
  line(ctx,-legSpread,33,-legSpread-(isPlayer?player.facing*3:0),43,7*s,"#e8ebef");line(ctx,legSpread,33,legSpread+(isPlayer?player.facing*4:0),43,7*s,"#e8ebef");
  rr(ctx,-15*s,-17*s,30*s,35*s,8);ctx.fillStyle=body;ctx.fill();
  rr(ctx,-14*s,-14*s,28*s,10*s,4);ctx.fillStyle=accent;ctx.fill();
  ctx.fillStyle=isPlayer?"#0b0d12":"#f3f4ef";ctx.font=(isPlayer?"1000 ":"900 ")+(10*s)+"px system-ui";ctx.textAlign="center";ctx.fillText(isPlayer?"00":(o.type==="wall"?"45":o.type==="reacher"?"3":"11"),0,7);
  var arm=15*s;
  if(isPlayer&&player.action==="shot"){line(ctx,-12,-10,-7,-30,7,body);line(ctx,12,-10,7,-31,7,body)}
  else if(isPlayer&&player.action==="dunk"){line(ctx,-12,-10,-7,-34,7,body);line(ctx,12,-10,4,-40,7,body)}
  else if(isPlayer&&player.action==="layup"){line(ctx,-12,-10,-5,-31,7,body);line(ctx,12,-8,18,2,7,body)}
  else if(!isPlayer&&o.stance==="reach"){line(ctx,-12,-8,-21,-14+Math.sin(time*13)*5,7,body);line(ctx,12,-8,21,-17-Math.sin(time*11)*4,7,body)}
  else if(!isPlayer&&o.stance==="cut"){line(ctx,-12,-8,-24,4,7,body);line(ctx,12,-8,24,4,7,body)}
  else{line(ctx,-12,-8,-arm,8+(isPlayer?Math.sin(player.dribble*3)*3:0),7,body);line(ctx,12,-8,arm,7,7,body)}
  ctx.fillStyle=isPlayer?"#b97552":"#966345";ctx.beginPath();ctx.arc(0,-29*s,9.5*s,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=isPlayer?"#15171e":"#0a0b0e";ctx.beginPath();ctx.arc(0,-32*s,9*s,Math.PI,Math.PI*2);ctx.fill();
  if(!isPlayer){ctx.fillStyle=accent;ctx.globalAlpha=.9;ctx.fillRect(-18*s,-4,4,16);ctx.globalAlpha=1}
  ctx.restore();
}
function drawBall(){
  var r=ball.r*(ball.shot?1.04:1),x=ball.x,y=ball.y;
  ctx.save();ctx.translate(x,y);ctx.rotate(ball.spin);
  ctx.fillStyle="#f07a22";ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(35,20,10,.8)";ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.bezierCurveTo(-4,-3,-4,3,0,r);ctx.moveTo(0,-r);ctx.bezierCurveTo(4,-3,4,3,0,r);ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,.2)";ctx.beginPath();ctx.arc(-3,-3,2.4,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawDefenderLabel(){
  var y=defender.y-69;if(y<135)y=135;
  ctx.font="900 9px system-ui";ctx.textAlign="center";var txt=defender.stun>0?"STUNNED":defender.name+(defender.boss?" · RIVAL":"");
  var w=ctx.measureText(txt).width+18;rr(ctx,defender.x-w/2,y,w,20,10);ctx.fillStyle="rgba(5,6,9,.78)";ctx.fill();ctx.strokeStyle=defender.stanceColor||"rgba(255,255,255,.12)";ctx.globalAlpha=.75;ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=defender.stun>0?"#e9ff3f":"rgba(255,255,255,.78)";ctx.fillText(txt,defender.x,y+13);
}
function drawEffects(){
  for(var i=0;i<streaks.length;i++){var s=streaks[i],a=1-s.t/s.life;ctx.globalAlpha=a*.55;ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x,s.y,s.r*a,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
  for(i=0;i<particles.length;i++){var p=particles[i],pa=1-p.t/p.life;ctx.globalAlpha=pa;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r*pa,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
  for(i=0;i<floaters.length;i++){var f=floaters[i],fa=1-f.t/f.life;ctx.globalAlpha=fa;ctx.fillStyle=f.color;ctx.font="1000 12px system-ui";ctx.textAlign="center";ctx.fillText(f.txt,f.x,f.y)}
  ctx.globalAlpha=1;
  if(state.heat>=75&&running){var g=ctx.createRadialGradient(player.x,player.y,0,player.x,player.y,90);g.addColorStop(0,"rgba(255,120,24,.10)");g.addColorStop(1,"rgba(255,120,24,0)");ctx.fillStyle=g;ctx.fillRect(player.x-100,player.y-100,200,200)}
}
function draw(){
  ctx.save();var sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake*.5,shake*.5):0;ctx.translate(sx,sy);
  ctx.clearRect(-20,-20,W+40,H+40);drawSky();drawFence();drawCourt();drawHoop();drawDefenderLabel();drawHuman(defender,false);drawHuman(player,true);drawBall();drawEffects();
  ctx.restore();
}
function loop(ts){
  var dt=Math.min(.033,(ts-last)/1000||0);last=ts;update(dt);draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
