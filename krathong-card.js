/* ★ 12 พ.ย. 2569 (แจ็ค) การ์ดลอยกระทง 1080×1350
   วาดกระทง + ของตกแต่งที่ผู้ใช้เลือก (ใช้ KrathongArt.svg) · ชื่อ · #COM7สานสายใจ · QR ชวนเพื่อนมาลอย
   ไม่มีคำอธิษฐาน / รหัสพนักงานบนการ์ด (PDPA)
   ใช้: await KrathongCard.draw(canvas, {kr:'pink', add:['candle'], name:'พิม'}) */
(function(){
'use strict';
var W=1080,H=1350,GOLD='#e7c56a',CREAM='#f7e3a8';
var SITE='https://com7er.github.io/com7loykrathong2026/float.html';

function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function rnd(seed){var s=seed||7;return function(){s=(s*9301+49297)%233280;return s/233280;};}
function loadSvg(str){return new Promise(function(ok){var i=new Image();i.onload=function(){ok(i)};i.onerror=function(){ok(null)};
  i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str);});}

/* ---------- ฉากหลัง: ฟ้ากลางคืน · จันทร์เต็มดวง · ดาว · โคมลอย · สายน้ำ ---------- */
function scene(c){
  var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#070a2c');g.addColorStop(.45,'#1a1452');g.addColorStop(.62,'#3a1f6e');g.addColorStop(.63,'#0d1a4a');g.addColorStop(1,'#050a26');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  var r=rnd(11),i;
  for(i=0;i<120;i++){var x=r()*W,y=r()*H*.58,s=r()*2.2+.4;c.globalAlpha=.35+r()*.6;c.fillStyle='#fff6dc';c.beginPath();c.arc(x,y,s,0,7);c.fill();}
  c.globalAlpha=1;
  // จันทร์
  var mx=W*.80,my=520,mr=86,mg=c.createRadialGradient(mx,my,10,mx,my,mr*3.2);mg.addColorStop(0,'rgba(255,236,180,.55)');mg.addColorStop(1,'rgba(255,236,180,0)');
  c.fillStyle=mg;c.fillRect(0,0,W,H*.65);
  var m2=c.createRadialGradient(mx-30,my-30,10,mx,my,mr);m2.addColorStop(0,'#fffaf0');m2.addColorStop(1,'#f3d891');c.fillStyle=m2;c.beginPath();c.arc(mx,my,mr,0,7);c.fill();
  // โคมลอย
  for(i=0;i<9;i++){var lx=70+r()*(W-140),ly=400+r()*240,ls=8+r()*12;if(Math.abs(lx-mx)<130&&Math.abs(ly-my)<130)continue;var lg=c.createRadialGradient(lx,ly,1,lx,ly,ls*3);lg.addColorStop(0,'rgba(255,190,90,.55)');lg.addColorStop(1,'rgba(255,190,90,0)');
    c.fillStyle=lg;c.beginPath();c.arc(lx,ly,ls*3,0,7);c.fill();c.fillStyle='#ffb65a';rr(c,lx-ls*.5,ly-ls*.7,ls,ls*1.3,ls*.3);c.fill();}
  // แสงจันทร์บนน้ำ
  var wy=H*.63;
  for(i=0;i<46;i++){var yy=wy+8+i*11,wd=(40+i*6)*(.6+r()*.6);c.globalAlpha=Math.max(0,.55-i*.011);c.fillStyle='#ffdd8a';rr(c,mx-wd/2+(r()-.5)*30,yy,wd,3,1.5);c.fill();}
  c.globalAlpha=1;
  // ระลอกคลื่น
  c.strokeStyle='rgba(160,190,255,.12)';c.lineWidth=2;
  for(i=0;i<14;i++){var y2=wy+30+i*34;c.beginPath();for(var x2=0;x2<=W;x2+=20){c.lineTo(x2,y2+Math.sin(x2/60+i)*4);}c.stroke();}
  // กระทงเล็ก ๆ ไกล ๆ (แสงเทียน)
  for(i=0;i<10;i++){var kx=r()*W,ky=wy+40+r()*250,kg=c.createRadialGradient(kx,ky,1,kx,ky,26);kg.addColorStop(0,'rgba(255,200,110,.7)');kg.addColorStop(1,'rgba(255,200,110,0)');c.fillStyle=kg;c.beginPath();c.arc(kx,ky,26,0,7);c.fill();}
}

/* ---------- กรอบทองคู่ + มุมลายไทย ---------- */
function frame(c){
  c.strokeStyle=GOLD;c.lineWidth=5;rr(c,34,34,W-68,H-68,30);c.stroke();
  c.strokeStyle='rgba(231,197,106,.55)';c.lineWidth=2;rr(c,52,52,W-104,H-104,22);c.stroke();
  [[52,52,1,1],[W-52,52,-1,1],[52,H-52,1,-1],[W-52,H-52,-1,-1]].forEach(function(p){
    c.save();c.translate(p[0],p[1]);c.scale(p[2],p[3]);c.strokeStyle=GOLD;c.lineWidth=3;c.fillStyle=GOLD;
    c.beginPath();c.moveTo(0,70);c.quadraticCurveTo(6,6,70,0);c.stroke();
    c.beginPath();c.moveTo(14,48);c.quadraticCurveTo(18,18,48,14);c.stroke();
    c.beginPath();c.arc(22,22,6,0,7);c.fill();
    c.beginPath();c.moveTo(70,0);c.quadraticCurveTo(84,-2,92,10);c.quadraticCurveTo(80,8,70,0);c.fill();
    c.beginPath();c.moveTo(0,70);c.quadraticCurveTo(-2,84,10,92);c.quadraticCurveTo(8,80,0,70);c.fill();
    c.restore();});
}
function pill(c,cx,y,w,h,text,font){
  rr(c,cx-w/2,y,w,h,h/2);c.fillStyle='rgba(20,12,48,.78)';c.fill();c.strokeStyle=GOLD;c.lineWidth=2.5;c.stroke();
  c.fillStyle=CREAM;c.font=font;c.textAlign='center';c.textBaseline='middle';c.fillText(text,cx,y+h/2+2);
}
function fitText(c,t,max,size,fam,weight){var s=size;do{c.font=(weight||'700')+' '+s+'px '+fam;s-=2;}while(c.measureText(t).width>max&&s>24);}
function qr(c,text,x,y,size){
  if(!window.qrcode)return false;var q=qrcode(0,'M');q.addData(text);q.make();var n=q.getModuleCount(),cell=size/n;
  c.fillStyle='#fff6dd';rr(c,x-12,y-12,size+24,size+24,16);c.fill();c.fillStyle='#2a1a05';
  for(var a=0;a<n;a++)for(var b=0;b<n;b++)if(q.isDark(a,b))c.fillRect(Math.floor(x+b*cell),Math.floor(y+a*cell),Math.ceil(cell),Math.ceil(cell));
  return true;
}

async function draw(cv,o){
  o=o||{};
  if(document.fonts){try{await Promise.all(['700 80px Charmonman','600 40px Prompt','500 30px Prompt'].map(function(f){return document.fonts.load(f,'กขอ')}));}catch(_){}}
  cv.width=W;cv.height=H;var c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  scene(c);
  // กระทง + ของตกแต่ง (SVG viewBox 420×320)
  var img=null;
  if(window.KrathongArt){img=await loadSvg(KrathongArt.svg(o.kr||'pink',o.add||[]));}
  var kw=1000,kh=kw*320/420,kx=(W-kw)/2,ky=440;
  var halo=c.createRadialGradient(W/2,ky+kh*.55,20,W/2,ky+kh*.55,kw*.62);halo.addColorStop(0,'rgba(255,214,130,.42)');halo.addColorStop(1,'rgba(255,214,130,0)');
  c.fillStyle=halo;c.fillRect(0,ky-120,W,kh+240);
  if(img){c.drawImage(img,kx,ky,kw,kh);}
  else{c.font='300px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🪷',W/2,ky+kh/2);}
  // เงาสะท้อนใต้กระทง
  c.save();c.globalAlpha=.18;c.translate(0,(ky+kh)*2-40);c.scale(1,-1);if(img)c.drawImage(img,kx,ky+kh*.55,kw,kh*.45);c.restore();
  frame(c);
  // หัวการ์ด
  pill(c,W/2,92,560,64,'ลอยกระทง · COM7 2569','500 30px Prompt,sans-serif');
  // ชื่อ
  var nm=String(o.name||'').trim().slice(0,24);
  var head=nm?('กระทงของ '+nm):'กระทงของฉัน';
  c.textAlign='center';c.textBaseline='alphabetic';
  fitText(c,head,W-200,84,'Charmonman,"Noto Serif Thai",serif','700');
  var tg=c.createLinearGradient(0,220,0,320);tg.addColorStop(0,'#fff3c4');tg.addColorStop(.55,'#f2cd6b');tg.addColorStop(1,'#c99a35');
  c.shadowColor='rgba(0,0,0,.65)';c.shadowBlur=14;c.fillStyle=tg;c.fillText(head,W/2,300);c.shadowBlur=0;
  c.font='400 30px Prompt,sans-serif';c.fillStyle='rgba(247,227,168,.85)';c.fillText('ลอยความตั้งใจ ไปพร้อมกับสายน้ำ',W/2,356);
  // แผ่นป้ายล่าง
  var py=H-290;var pg=c.createLinearGradient(0,py,0,H-70);pg.addColorStop(0,'rgba(10,8,34,0)');pg.addColorStop(.35,'rgba(10,8,34,.82)');pg.addColorStop(1,'rgba(10,8,34,.92)');
  c.fillStyle=pg;c.fillRect(56,py,W-112,H-56-py);
  c.textAlign='left';
  c.font='700 70px Charmonman,"Noto Serif Thai",serif';var hg=c.createLinearGradient(0,H-200,0,H-120);hg.addColorStop(0,'#fff3c4');hg.addColorStop(1,'#d9a944');c.fillStyle=hg;
  c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=10;c.fillText('สานสายใจ',110,H-170);c.shadowBlur=0;
  c.font='600 46px Prompt,sans-serif';c.fillStyle=CREAM;c.fillText('#COM7สานสายใจ',110,H-108);
  c.font='400 24px Prompt,sans-serif';c.fillStyle='rgba(247,227,168,.7)';c.fillText('มาลอยกระทงออนไลน์ด้วยกันนะ 🪷',112,H-70+ -4);
  // QR
  var qs=150,qx=W-110-qs,qy=H-112-qs;
  if(qr(c,SITE,qx,qy,qs)){c.font='400 21px Prompt,sans-serif';c.fillStyle=CREAM;c.textAlign='center';c.fillText('สแกนมาลอยด้วยกัน',qx+qs/2,qy+qs+40);}
  return cv;
}
function toBlob(cv){return new Promise(function(r){cv.toBlob(function(b){r(b)},'image/png')});}
window.KrathongCard={draw:draw,toBlob:toBlob};
})();
