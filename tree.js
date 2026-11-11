/* =========================================================
   tree.js — ต้นไม้แห่งคำอธิษฐาน (วาดด้วย Canvas จากไฟล์ wish-tree ของพี่อั้ม)
   ★ ปรับให้เบา (แจ็ค 4 พ.ย. 2569):
     - ใบไม้ 850 → 480 ใบ (มือถือ 340) · วาด ~24 fps แทน 33 fps · ความละเอียดจอสูงสุด 1.25x
     - ใบไม้ร่วงพร้อมกันสูงสุด 2 ใบ · ประกาย 4 จุด · หญ้าที่โคน 160 ใบ
     - หยุดวาดเมื่อเลื่อนต้นไม้พ้นจอ หรือสลับแท็บ (ประหยัดแบตมือถือ)
   ส่งตำแหน่งกิ่งให้ main.js ผ่าน window.WishTree.anchors (x 0..1, y 0..1 ของกรอบต้นไม้)
   ========================================================= */
(function(){'use strict';
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var LOWEND=(navigator.hardwareConcurrency||4)<=4||Math.min(screen.width,screen.height)<500;
var LEAF_MAX=LOWEND?340:480, FRAME_MS=LOWEND?50:40;

/* ───────── tree: geometry (normalised: x 0..1, y 0..ASP) ───────── */
var ASP=0.95,GROUND=0.935,PI=Math.PI;
function mk(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var rnd=mk(20261104);
var segs=[],leaves=[],cands=[],roots=[];
var CAN={cx:.5,cy:.40,rx:.49,ry:.37};
function inCan(x,y,k){var dx=(x-CAN.cx)/(CAN.rx*k),dy=(y-CAN.cy)/(CAN.ry*k);return dx*dx+dy*dy<1}
function angDiff(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
var LP=[0,0,.5,.75,.95];
function addLeaf(x,y,dir,big){
  var r=rnd(),layer=r<.34?0:(r<.8?1:2);
  var gold=layer>0&&rnd()<.05;
  leaves.push({x:x,y:y,a:dir,s:(.044+rnd()*.026)*(big||1),layer:layer,v:gold?(layer===2?4:3):Math.floor(rnd()*3),
    ph:rnd()*6.28,f:.8+rnd()*1.1,k:rnd()});
}
function grow(x,y,ang,len,w,depth,maxD){
  var n=Math.max(8,Math.round(len/.012)),step=len/n,pts=[],angs=[],bend=(rnd()-.5)*.045,i,droop=depth>=3?.026:(depth===2?.016:.007);
  for(i=0;i<=n;i++){
    var t=i/n;pts.push([x,y,w*(1-t*.5)]);angs.push(ang);
    ang+=bend+(rnd()-.5)*.018;
    ang+=angDiff(ang,PI/2)*droop;
    x+=Math.cos(ang)*step;y+=Math.sin(ang)*step;
  }
  segs.push({pts:pts,d:depth});
  if(depth>=1)for(i=2;i<n;i+=2)cands.push({x:pts[i][0],y:pts[i][1],d:depth});
  if(depth>=2){
    for(i=2;i<=n;i++){
      if(rnd()<LP[depth]){
        var dir=angs[i-1]+angDiff(angs[i-1],PI/2)*.45+(rnd()-.5)*1.9;
        addLeaf(pts[i][0]+(rnd()-.5)*.014,pts[i][1]+(rnd()-.5)*.014,dir);
      }
    }
  }
  var tx=pts[n][0],ty=pts[n][1];
  if(depth>=maxD-1){for(i=0;i<(depth>=maxD?7:4);i++)addLeaf(tx+(rnd()-.5)*.02,ty+(rnd()-.5)*.02,angs[n]+(rnd()-.5)*2.6,1.1)}
  if(depth<maxD&&inCan(tx,ty,1.05)){
    var marks=depth===1?[.5,.78]:[.62],sg=rnd()<.5?1:-1;
    marks.forEach(function(m){
      var idx=Math.round(n*m),a0=angs[Math.max(0,idx-1)];
      grow(pts[idx][0],pts[idx][1],a0+sg*(.5+rnd()*.2),len*(.58+rnd()*.08),w*.55,depth+1,maxD);sg=-sg;
    });
    grow(tx,ty,angs[n]+(rnd()-.5)*.5,len*(.68+rnd()*.06),w*.55,depth+1,maxD);
  }
}
function build(){
  var i,t,tp=[],N=30;
  // trunk: sturdy, gently curved, wide root flare
  for(i=0;i<=N;i++){t=i/N;tp.push([.5+Math.sin(t*PI*1.3)*.016,GROUND-.012-t*.37,.062+.105*Math.pow(1-t,3)]);}
  segs.push({pts:tp,d:0,trunk:true});
  // roots
  [-1,1].forEach(function(dir){
    [[.19,.012,.07],[.11,.012,.05],[.15,-.01,.035]].forEach(function(r){
      var pts=[];
      for(var q=0;q<=14;q++){var u=q/14;pts.push([.5+dir*(.02+r[0]*u),GROUND-.055+u*(.06+r[1]),r[2]*(1-u*.78)]);}
      segs.push({pts:pts,d:0,root:true});
    });
  });
  var top=tp[tp.length-1],topY=top[1];
  // five crown limbs, symmetric
  [[-.6,.33],[.6,.33],[-.06,.25],[.22,.2]].forEach(function(o){
    var j=(rnd()-.5)*.05;
    grow(top[0],topY+.01,-PI/2+o[0]+j,o[1],.056,1,4);
  });
  // two sturdy side limbs sweeping out and up, like the reference tree
  var sl=tp[24];
  grow(sl[0],sl[1],PI+.55,.36,.05,1,4);
  grow(sl[0],sl[1],-.55,.36,.05,1,4);
  // one graceful lower pair for tags to hang from
  var lo=tp[17];
  grow(lo[0],lo[1],PI+.3,.3,.05,1,4);
  grow(lo[0],lo[1],-.3,.3,.05,1,4);
  var KX=.78,cx=function(x){return .5+(x-.5)*KX};
  segs.forEach(function(g){g.pts.forEach(function(p){p[0]=cx(p[0])})});
  leaves.forEach(function(l){l.x=cx(l.x)});cands.forEach(function(c){c.x=cx(c.x)});
  for(var pc=0;pc<80;pc++){
    var px,py,tries=0;
    do{px=CAN.cx+(rnd()*2-1)*CAN.rx*.62;py=CAN.cy+(rnd()*2-1)*CAN.ry*.95;tries++}while((!inCan(px,py,.88)||py>.62)&&tries<40);
    for(var q=0;q<7;q++)addLeaf(px+(rnd()-.5)*.07,py+(rnd()-.5)*.06,PI/2+(rnd()-.5)*2.8);
  }
  [[.5,.2],[.5,.3],[.44,.14],[.56,.14],[.5,.09],[.4,.26],[.6,.26],[.5,.4],[.36,.38],[.64,.38]].forEach(function(c){
    for(var q=0;q<10;q++)addLeaf(c[0]+(rnd()-.5)*.1,c[1]+(rnd()-.5)*.08,PI/2+(rnd()-.5)*2.8);
  });
  while(leaves.length>LEAF_MAX){leaves.splice(Math.floor(rnd()*leaves.length),1)}
}
build();

/* ───────── sprites ───────── */
var SH=144,SW=140;
var MP=[[0,.1],[.1,.17],[.3,.1],[.2,.3],[.5,.36],[.27,.55],[.2,.74],[.1,.76],[0,1]];
function leafPath(c,H,ox,oy){
  var p=[],i,n,a,b,q,k=.3;
  for(i=0;i<MP.length;i++)p.push([ox+MP[i][0]*H,oy+MP[i][1]*H]);
  for(i=MP.length-2;i>0;i--)p.push([ox-MP[i][0]*H,oy+MP[i][1]*H]);
  n=p.length;c.beginPath();
  for(i=0;i<n;i++){
    a=p[(i+n-1)%n];q=p[i];b=p[(i+1)%n];
    var x0=q[0]+(a[0]-q[0])*k,y0=q[1]+(a[1]-q[1])*k;
    if(i)c.lineTo(x0,y0);else c.moveTo(x0,y0);
    c.quadraticCurveTo(q[0],q[1],q[0]+(b[0]-q[0])*k,q[1]+(b[1]-q[1])*k);
  }
  c.closePath();
}
function sprite(c1,c2,rim,c3){
  var cv=document.createElement('canvas');cv.width=SW;cv.height=SH+10;var c=cv.getContext('2d');
  var H=SH-14,ox=SW/2,oy=14;
  leafPath(c,H,ox,oy);
  var g=c.createLinearGradient(ox,oy,ox,oy+H);g.addColorStop(0,c1);g.addColorStop(.5,c2);g.addColorStop(1,c3||c1);
  c.fillStyle=g;c.fill();
  c.save();c.clip();
  var sh=c.createLinearGradient(ox-H*.3,0,ox+H*.34,0);sh.addColorStop(0,'rgba(0,0,0,.2)');sh.addColorStop(.55,'rgba(255,255,230,0)');sh.addColorStop(1,'rgba(255,255,220,.26)');
  c.fillStyle=sh;c.fillRect(0,0,SW,SH+10);
  c.strokeStyle='rgba(255,250,200,.42)';c.lineCap='round';
  [[0,.97],[.3,.12],[-.3,.12],[.5,.36],[-.5,.36]].forEach(function(v,i){c.lineWidth=i?1.2:2;c.beginPath();c.moveTo(ox,oy+H*(i?.1:.08));c.lineTo(ox+v[0]*H*.92,oy+H*v[1]);c.stroke()});
  c.restore();
  leafPath(c,H,ox,oy);c.strokeStyle=rim;c.lineWidth=1.4;c.stroke();
  c.strokeStyle='#4a6a3a';c.lineWidth=2.4;c.beginPath();c.moveTo(ox,oy+H*.05);c.lineTo(ox,oy-12);c.stroke();
  return cv;
}
var SP=[
  [sprite('#0a3a2c','#14573f','rgba(120,200,160,.3)','#3d6a2c'),sprite('#0d4332','#1b6446','rgba(120,200,160,.3)','#55772c'),sprite('#103d34','#1d5e4c','rgba(130,210,190,.3)','#4a7a3a')],
  [sprite('#14603f','#3a9a4c','rgba(200,255,190,.45)','#c9b640'),sprite('#1a6f45','#52b052','rgba(200,255,190,.45)','#d8c04a'),sprite('#1f7a4a','#6cbc55','rgba(210,255,190,.45)','#e2c95a'),sprite('#8a8a2a','#d6b84a','rgba(255,240,170,.55)','#f0cf68')],
  [sprite('#2f9a58','#98dc6c','rgba(235,255,200,.6)','#f2d86a'),sprite('#3aa860','#b4e670','rgba(240,255,200,.6)','#ffdc70'),sprite('#52b45a','#d2ec72','rgba(245,255,200,.6)','#ffd45e'),sprite('#9aa83a','#efd668','rgba(255,245,190,.65)','#ffbf48'),sprite('#c09a2c','#ffd96a','rgba(255,250,210,.75)','#ff9f3a')]
];
var GLOW=(function(){var cv=document.createElement('canvas');cv.width=cv.height=48;var c=cv.getContext('2d'),g=c.createRadialGradient(24,24,0,24,24,24);
  g.addColorStop(0,'rgba(255,248,200,1)');g.addColorStop(.25,'rgba(255,224,120,.55)');g.addColorStop(1,'rgba(255,200,80,0)');c.fillStyle=g;c.fillRect(0,0,48,48);return cv})();

/* ───────── branch bitmap ───────── */
var stage=document.getElementById('treeStage'),cvB=document.getElementById('cvBack'),cvF=document.getElementById('cvFront');
var bc=cvB.getContext('2d'),fc=cvF.getContext('2d'),bmp=document.createElement('canvas'),S=1000,dpr=1;
function stroke(c,pts,sc,col,wm,add,ox){
  for(var i=0;i<pts.length-1;i++){
    var a=pts[i],b=pts[i+1],w=Math.max(.8,(a[2]*wm+(add||0))*sc);
    c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(a[0]*sc+(ox||0)*a[2]*sc,a[1]*sc);c.lineTo(b[0]*sc+(ox||0)*b[2]*sc,b[1]*sc);c.stroke();
  }
}
function paintBranches(){
  bmp.width=Math.round(S*dpr);bmp.height=Math.round(S*ASP*dpr);
  var c=bmp.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.lineCap='round';c.lineJoin='round';
  // ground mound
  var gx=.5*S,gy=(GROUND+.004)*S;
  var gg=c.createRadialGradient(gx,gy,S*.02,gx,gy,S*.42);gg.addColorStop(0,'rgba(210,160,50,.55)');gg.addColorStop(.6,'rgba(70,90,30,.35)');gg.addColorStop(1,'rgba(20,40,20,0)');
  c.save();c.translate(gx,gy);c.scale(1,.12);c.translate(-gx,-gy);c.fillStyle=gg;c.beginPath();c.arc(gx,gy,S*.42,0,6.283);c.fill();c.restore();
  var r2=mk(77),pl=[SP[1][3],SP[2][1],SP[2][3],SP[2][4],SP[1][2],SP[2][2]];
  for(var q=0;q<300;q++){var ux=(r2()-.5)*2,uy=(r2()-.5)*2,x=gx+ux*S*.36*(1-uy*uy*.3),y=gy+uy*S*.016,w=S*(.022+r2()*.014);
    c.save();c.translate(x,y);c.rotate(r2()*6.283);c.scale(1,.5);c.drawImage(pl[q%6],-w/2,-w*.1,w,w*(SH+10)/SW);c.restore();}
  // aerial roots
  roots.forEach(function(p){stroke(c,p,S,'#3a2a30',1,.0008);stroke(c,p,S,'#7a5a4a',.5,0,.2)});
  segs.filter(function(g){return !g.root&&!g.trunk}).concat(segs.filter(function(g){return g.root}),[segs[0]]).forEach(function(sg){
    var th=sg.pts[0][2]*S;
    stroke(c,sg.pts,S,'#2b180d',1,.004);
    stroke(c,sg.pts,S,'#6a4126',.86);
    stroke(c,sg.pts,S,'#4a2a16',.3,0,-.36);
    stroke(c,sg.pts,S,'#8c5a34',.5,0,.1);
    if(th>2.6)stroke(c,sg.pts,S,'#c99058',.18,0,.3);
    if(sg.trunk)stroke(c,sg.pts,S,'#b27c4a',.36,0,.14);
  });
  // bark texture on trunk
  var tr=segs[0].pts,r3=mk(5);c.strokeStyle='rgba(36,18,8,.5)';c.lineWidth=1.2;
  for(q=0;q<230;q++){var i=Math.floor(r3()*(tr.length-1)),p=tr[i],hw=p[2]*S*.5;var x=p[0]*S+(r3()-.5)*hw*1.7,y=p[1]*S;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+(r3()-.5)*3,y-S*(.01+r3()*.03));c.stroke();}
  c.strokeStyle='rgba(255,205,140,.22)';
  for(q=0;q<60;q++){i=Math.floor(r3()*(tr.length-1));p=tr[i];x=p[0]*S+p[2]*S*.3+(r3()-.2)*p[2]*S*.2;y=p[1]*S;c.beginPath();c.moveTo(x,y);c.lineTo(x+1,y-S*(.01+r3()*.02));c.stroke();}
}

/* ───────── sizing ───────── */
function resize(){
  var r=stage.getBoundingClientRect();S=Math.max(280,r.width);dpr=Math.min(window.devicePixelRatio||1,LOWEND?1:1.25);
  [cvB,cvF].forEach(function(cv){cv.width=Math.round(S*dpr);cv.height=Math.round(S*ASP*dpr)});
  stage.style.setProperty('--u',Math.max(.6,Math.min(1,S/900)).toFixed(3));
  paintBranches();
  if(typeof layoutHangs==='function')layoutHangs();
  if(reduce)paint(0);
}

/* ───────── render loop ───────── */
var L0=leaves.filter(function(l){return l.layer===0}),L1=leaves.filter(function(l){return l.layer===1}),L2=leaves.filter(function(l){return l.layer===2});
var lastP=0,lastG=0,lastGT=0,spk=[],wind=.3,gust=0,lastT=0,looping=false,visible=true,nextFall=2,falls=[],flies=[],fi;
for(fi=0;fi<0;fi++)flies.push({x:.1+Math.random()*.8,y:.14+Math.random()*.66,ph:Math.random()*6.28,sp:.15+Math.random()*.35,r:10+Math.random()*16});
for(fi=0;fi<4;fi++){var sl=L2[Math.floor(Math.random()*L2.length)];spk.push({x:sl.x,y:sl.y,ph:Math.random()*6.28,sp:.8+Math.random()*1.4})}
var FH=SH-14;
function drawLeaf(c,L,t){
  var sw=Math.sin(t*L.f+L.ph)*(.07+.1*L.k)*(1+wind*2.4)+Math.sin(t*.6+L.x*8)*.05*(.3+wind*1.8);
  var a=L.a+sw-PI/2,ca=Math.cos(a)*dpr,sa=Math.sin(a)*dpr,f=L.s*S/FH,sp=SP[L.layer][L.v];
  c.setTransform(ca,sa,-sa,ca,L.x*S*dpr,L.y*S*dpr);
  c.drawImage(sp,-SW/2*f,-20.5*f,SW*f,(SH+10)*f);
}
function paint(t,dt){
  var i,c=bc;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cvB.width,cvB.height);
  for(i=0;i<L0.length;i++)drawLeaf(c,L0[i],t);
  c.setTransform(1,0,0,1,0,0);c.drawImage(bmp,0,0);
  for(i=0;i<L1.length;i++)drawLeaf(c,L1[i],t);
  c=fc;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cvF.width,cvF.height);
  for(i=0;i<L2.length;i++)drawLeaf(c,L2[i],t);
  // falling leaves
  for(i=falls.length-1;i>=0;i--){
    var f=falls[i];f.y+=f.vy*(dt||0);f.x+=Math.sin(t*1.3+f.ph)*.035*(dt||0)+wind*.02*(dt||0);
    if(f.y>GROUND-.02){falls.splice(i,1);continue}
    var a=Math.sin(t*1.9+f.ph)*1.1+f.a,ca=Math.cos(a)*dpr,sa=Math.sin(a)*dpr,k=.05*S/FH;
    c.globalAlpha=Math.min(1,(GROUND-.02-f.y)*10);
    c.setTransform(ca,sa,-sa,ca,f.x*S*dpr,f.y*S*dpr);c.drawImage(SP[2][f.v],-SW/2*k,-20.5*k,SW*k,(SH+10)*k);
  }
  c.globalAlpha=1;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='lighter';
  for(i=0;i<flies.length;i++){
    var q=flies[i],x=q.x+Math.sin(t*q.sp+q.ph)*.04,y=q.y+Math.cos(t*q.sp*1.3+q.ph)*.03,al=.3+.7*(.5+.5*Math.sin(t*1.4+q.ph*3)),r=q.r*dpr*S/1000;
    c.globalAlpha=al;c.drawImage(GLOW,x*S*dpr-r,y*S*dpr-r,r*2,r*2);
  }
  for(i=0;i<spk.length;i++){var sk=spk[i],pp=Math.sin(t*sk.sp+sk.ph);if(pp<.55)continue;pp=(pp-.55)/.45;
    var px=sk.x*S*dpr,py=sk.y*S*dpr,ln=(5+9*pp)*dpr;c.globalAlpha=pp;c.drawImage(GLOW,px-ln,py-ln,ln*2,ln*2);
    c.fillStyle='#fffbe0';c.fillRect(px-ln*1.3,py-.6*dpr,ln*2.6,1.2*dpr);c.fillRect(px-.6*dpr,py-ln*1.3,1.2*dpr,ln*2.6)}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
}
function loop(ms){
  if(!visible){looping=false;return}
  if(ms-lastP<FRAME_MS){requestAnimationFrame(loop);return}lastP=ms;
  var t=ms/1000,dt=Math.min(.05,Math.max(.001,t-lastT));lastT=t;
  gust*=Math.pow(.4,dt);
  wind=.28+.14*Math.sin(t*.35)+.1*Math.sin(t*.9+2)+gust;
  
  if(t>nextFall&&falls.length<2){
    var s=L2[Math.floor(Math.random()*L2.length)];
    falls.push({x:s.x,y:s.y,vy:.05+Math.random()*.03,ph:Math.random()*6,a:Math.random()*6,v:Math.random()<.6?4:3});
    nextFall=t+2.5+Math.random()*3;
  }
  paint(t,dt);
  requestAnimationFrame(loop);
}
function start(){if(reduce||looping||!visible)return;looping=true;requestAnimationFrame(loop)}
if('IntersectionObserver' in window){
  new IntersectionObserver(function(en){visible=en[0].isIntersecting;if(visible)start()},{threshold:0}).observe(stage);
}

var rr=mk(4242),anchors=[],tagA=[],decoA=[];
(function(){
  var list=cands.slice(),i,j,t;
  for(i=list.length-1;i>0;i--){j=Math.floor(rr()*(i+1));t=list[i];list[i]=list[j];list[j]=t}
  for(i=0;i<list.length&&anchors.length<110;i++){
    var c=list[i];if(c.y<.26||c.y>.78||(Math.abs(c.x-.5)<.1&&c.y>.56))continue;
    if(anchors.every(function(a){return Math.hypot(a.x-c.x,a.y-c.y)>=.066}))anchors.push(c);
  }
  anchors.forEach(function(a){((a.y<.44||Math.abs(a.x-.5)>.32)?decoA:tagA).push(a)});
  while(decoA.length<34&&tagA.length>40)decoA.push(tagA.pop());
})();
document.addEventListener('visibilitychange',function(){visible=!document.hidden&&visible;if(!document.hidden)start()});
window.addEventListener('resize',function(){clearTimeout(window.__wtR);window.__wtR=setTimeout(resize,200)});
resize();if(!reduce)start();
window.WishTree={anchors:tagA.concat(decoA).map(function(a){return {x:a.x*100,y:a.y/ASP*100}}),ASP:ASP};
})();
