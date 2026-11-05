/* =========================================================
   vote-card.js — การ์ดชวนโหวตผู้เข้าประกวด (1080×1350) · แจ็ค 5 พ.ย. 2569
   - ไม่มีรหัสพนักงาน/เบอร์/บริษัท บนการ์ด (PDPA) · QR พาไปหน้าการ์ดของผู้สมัครคนนั้นโดยตรง
   - ใช้ qrcode.min.js (qrcode-generator, MIT) วาด QR ในเครื่อง ไม่พึ่งเว็บภายนอก
   ========================================================= */
(function(){
'use strict';
var SITE='https://com7er.github.io/com7loykrathong2026/contestants.html';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function seeded(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function wrap(c,t,max){var sg=(window.Intl&&Intl.Segmenter)?Array.from(new Intl.Segmenter('th',{granularity:'word'}).segment(t),function(x){return x.segment}):Array.from(t),L=[],ln='';
  sg.forEach(function(w){if(ln&&c.measureText(ln+w).width>max){L.push(ln.trim());ln=w}else ln+=w});if(ln.trim())L.push(ln.trim());return L;}
/* ★ 5 พ.ย.: รูปจาก Drive แบบ thumbnail วาดลงการ์ดไม่ได้ (ติด CORS) → ใช้ lh3.googleusercontent.com ขนาด 1600px (ทดสอบแล้ววาดได้ คมชัด) */
function hiRes(src){var m=String(src||'').match(/drive\.google\.com\/thumbnail\?id=([\w-]+)/)||String(src||'').match(/lh3\.googleusercontent\.com\/d\/([\w-]+)/);return m?('https://lh3.googleusercontent.com/d/'+m[1]+'=s0'):src;}
function loadImg(src){src=hiRes(src);return new Promise(function(res){if(!src)return res(null);var i=new Image();i.crossOrigin='anonymous';i.onload=function(){res(i)};i.onerror=function(){res(null)};i.src=src;setTimeout(function(){res(i.complete&&i.naturalWidth?i:null)},8000);});}
function drawQR(c,text,x,y,size){
  if(!window.qrcode){return false}
  var q=qrcode(0,'M');q.addData(text);q.make();var n=q.getModuleCount(),cell=size/n;
  c.fillStyle='#fff6dd';rr(c,x-14,y-14,size+28,size+28,18);c.fill();c.fillStyle='#2a1a05';
  for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))c.fillRect(Math.floor(x+k*cell),Math.floor(y+r*cell),Math.ceil(cell),Math.ceil(cell));
  return true;
}
function corner(c,x,y,sx,sy,s,col){c.save();c.translate(x,y);c.scale(sx*s/48,sy*s/48);c.strokeStyle=col;c.fillStyle=col;c.lineCap='round';
  c.lineWidth=1.5;c.beginPath();c.moveTo(3,45);c.lineTo(3,12);c.quadraticCurveTo(3,3,12,3);c.lineTo(45,3);c.stroke();
  c.globalAlpha=.7;c.lineWidth=.8;c.beginPath();c.moveTo(8,45);c.lineTo(8,16);c.quadraticCurveTo(8,8,16,8);c.lineTo(45,8);c.stroke();c.globalAlpha=1;
  c.beginPath();c.moveTo(6,6);c.bezierCurveTo(13,5,19,8,20,15);c.bezierCurveTo(17,12,13,12,11,14);c.bezierCurveTo(12,11,11,8,6,6);c.fill();
  c.lineWidth=1.1;c.beginPath();c.moveTo(20,15);c.quadraticCurveTo(24,10,29,12);c.moveTo(15,20);c.quadraticCurveTo(10,24,12,29);c.stroke();
  c.beginPath();c.arc(35,8,1.3,0,6.283);c.arc(8,35,1.3,0,6.283);c.fill();c.restore();}
function goldGrad(c,W,H){var g=c.createLinearGradient(0,0,W,H);[[0,'#7a5622'],[.18,'#f6dc95'],[.32,'#b8862e'],[.5,'#fff4c8'],[.68,'#a77a2a'],[.84,'#f0d184'],[1,'#6e4c1c']].forEach(function(s){g.addColorStop(s[0],s[1])});return g;}
function pill(c,cx,y,w,h,fill,stroke,lw){rr(c,cx-w/2,y,w,h,h/2);c.fillStyle=fill;c.fill();c.lineWidth=lw||2.5;c.strokeStyle=stroke;c.stroke();}
async function draw(cv,p){
  if(document.fonts){try{await Promise.all(['700 46px Charm','700 92px Charmonman','400 30px Prompt','italic 400 27px "IBM Plex Sans Thai"'].map(function(f){return document.fonts.load(f,'กขอ')}))}catch(_){}}
  /* ★ ดีไซน์แบบการ์ดโหวตผีฮาโลวีน: รูปเต็มใบ · กรอบทองคู่ · มุมลายไทย · ป้ายหัว · แผ่นป้ายล่าง · QR */
  var W=1080,H=1350,c=cv.getContext('2d');cv.width=W;cv.height=H;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  var female=p.type==='female',tint=female?'rgba(160,40,110,':'rgba(40,40,140,',gold='#d8bd8a',cream='#ecd69a';
  // 1) รูปเต็มใบ
  c.fillStyle='#120a24';c.fillRect(0,0,W,H);
  var img=await loadImg(p.img);
  if(img){var s=Math.max(W/img.naturalWidth,H/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;c.drawImage(img,(W-dw)/2,(H-dh)*.15,dw,dh);}
  else{var g0=c.createLinearGradient(0,0,0,H);g0.addColorStop(0,'#060a2c');g0.addColorStop(1,'#4b2f7c');c.fillStyle=g0;c.fillRect(0,0,W,H);c.textAlign='center';c.font='260px sans-serif';c.fillText('🪷',W/2,H/2);}
  // 2) เงาไล่บน-ล่าง (ให้ตัวหนังสืออ่านง่าย)
  var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(5,4,20,.55)');g.addColorStop(.16,'rgba(5,4,20,0)');g.addColorStop(.55,'rgba(5,4,20,0)');g.addColorStop(.78,'rgba(5,4,20,.55)');g.addColorStop(1,'rgba(5,4,20,.85)');c.fillStyle=g;c.fillRect(0,0,W,H);
  // ม่านสีมุมบน (แบบ vc-cloth)
  [[0,1],[W,-1]].forEach(function(a){var gg=c.createLinearGradient(a[0],0,a[0]+a[1]*90,0);gg.addColorStop(0,tint+'.5)');gg.addColorStop(.4,tint+'.22)');gg.addColorStop(1,tint+'0)');c.fillStyle=gg;c.fillRect(a[1]>0?0:W-90,0,90,290);});
  // 3) กรอบทองคู่ + มุม
  var gd=goldGrad(c,W,H);c.save();c.shadowColor='rgba(246,220,149,.45)';c.shadowBlur=14;c.strokeStyle=gd;c.lineWidth=8.6;rr(c,13.5,13.5,W-27,H-27,16);c.stroke();c.restore();
  c.globalAlpha=.75;c.strokeStyle=gd;c.lineWidth=2.7;rr(c,30,30,W-60,H-60,11);c.stroke();c.globalAlpha=1;
  var cs=97;corner(c,11,11,1,1,cs,gold);corner(c,W-11,11,-1,1,cs,gold);corner(c,11,H-11,1,-1,cs,gold);corner(c,W-11,H-11,-1,-1,cs,gold);
  c.textAlign='center';c.textBaseline='alphabetic';
  // 4) ป้ายหัว
  c.font='700 46px Charm,"Charmonman",Prompt,serif';var ht='ประกวดนพมาศ AI · COM7 2569',hw=c.measureText(ht).width+90;
  pill(c,W/2,64,hw,74,'rgba(12,8,30,.55)','#b99b6b',2.5);
  c.font='42px sans-serif';c.fillText('🪷',W/2,58);
  c.font='700 46px Charm,"Charmonman",Prompt,serif';c.fillStyle=cream;c.shadowColor='rgba(0,0,0,.95)';c.shadowBlur=6;c.fillText(ht,W/2,116);c.shadowBlur=0;
  // 5) แผ่นป้ายล่าง
  var pw=W*.66,ph=p.bio?330:280,px=(W-pw)/2,py=H-62-ph;
  var rg=c.createRadialGradient(W/2,py+ph/2,10,W/2,py+ph/2,pw/1.6);rg.addColorStop(0,'rgba(6,4,22,.5)');rg.addColorStop(1,'rgba(6,4,22,.72)');
  rr(c,px,py,pw,ph,30);c.fillStyle=rg;c.fill();c.lineWidth=2.8;c.strokeStyle='#b99b6b';c.stroke();
  c.font='400 34px Prompt,"IBM Plex Sans Thai",sans-serif';c.fillStyle=cream;c.fillText('#'+p.id+' · '+(female?'นพมาศหญิง':'นพมาศชาย'),W/2,py+56);
  // เส้นคั่น ✦
  var oy=py+80,og=c.createLinearGradient(px+60,0,px+pw-60,0);og.addColorStop(0,'rgba(185,155,107,0)');og.addColorStop(.5,'#b99b6b');og.addColorStop(1,'rgba(185,155,107,0)');
  c.fillStyle=og;c.fillRect(px+60,oy,pw/2-90,2.4);c.fillRect(W/2+30,oy,pw/2-90,2.4);c.fillStyle='#b99b6b';c.font='24px serif';c.fillText('✦',W/2,oy+9);
  // ชื่อ (ตัวใหญ่แบบชื่อผี)
  var fs=92,L;do{c.font='700 '+fs+'px Charmonman,Charm,Prompt,serif';L=wrap(c,p.name||'',pw-80);fs-=6}while(L.length>1&&fs>50);
  c.fillStyle='#fbf4ec';c.shadowColor=female?'rgba(243,154,194,.9)':'rgba(246,220,149,.85)';c.shadowBlur=18;c.fillText(L[0]||'',W/2,py+178);c.shadowBlur=0;
  var ty=py+226;
  if(p.bio){c.font='italic 400 27px "IBM Plex Sans Thai",Prompt,sans-serif';c.fillStyle='#e9dcc0';var B=wrap(c,'“'+p.bio+'”',pw-90);c.fillText(B.length>1?B[0]+'…':B[0],W/2,ty);ty+=52;}
  c.font='400 30px Prompt,"IBM Plex Sans Thai",sans-serif';c.fillStyle=cream;c.fillText('ช่วยโหวตให้หน่อยนะ 💛 · 18–23 พ.ย. 2569',W/2,ty);
  c.font='500 26px Prompt,sans-serif';c.fillStyle='#f5c969';c.fillText('#COM7สานสายใจ',W/2,ty+44);
  // 6) QR มุมขวาเหนือแผ่นป้าย
  var qs=150,qx=W-60-qs-10,qy=py-qs-62;
  c.save();c.shadowColor='rgba(0,0,0,.65)';c.shadowBlur=22;c.shadowOffsetY=8;rr(c,qx-10,qy-10,qs+20,qs+20,12);c.fillStyle='#fff';c.fill();c.restore();
  rr(c,qx-10,qy-10,qs+20,qs+20,12);c.lineWidth=3.2;c.strokeStyle='#b99b6b';c.stroke();
  if(window.qrcode){var q=qrcode(0,'M');q.addData(SITE+'?c='+encodeURIComponent(p.id));q.make();var n=q.getModuleCount(),cell=qs/n;c.fillStyle='#120808';
    for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))c.fillRect(Math.floor(qx+k*cell),Math.floor(qy+r*cell),Math.ceil(cell),Math.ceil(cell));}
  c.font='400 22px Prompt,sans-serif';c.fillStyle=cream;c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=6;c.fillText('สแกนเพื่อโหวต',qx+qs/2,qy+qs+44);c.shadowBlur=0;
}
function toBlob(cv){return new Promise(function(r){cv.toBlob(function(b){r(b)},'image/png')});}
window.VoteCard={draw:draw,toBlob:toBlob};
})();
