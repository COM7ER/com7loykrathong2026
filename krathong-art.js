/* ★ krathong-art.js — วาดกระทงแบบเดียวกับหน้าเลือกกระทง (float.html) ใช้ร่วมกับหน้าสายน้ำ
   ค่า "แบบกระทง" ในชีต = "<แบบ>|<ของตกแต่ง,คั่นด้วยจุลภาค>" เช่น "coco|candle,flower" · แจ็ค 3 พ.ย. 2569 */
(function(){
'use strict';

'use strict';
var R=function(a,b){return a+Math.random()*(b-a)};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var MAXA=3; // จำนวนของตกแต่งสูงสุดที่เลือกได้

/* ───────── data ───────── */
var KR={
  pink:{name:'ชมพูบานฉ่ำ',c:['#ffd0e6','#ff7fb8','#e21c7e','#a00b57'],s:1},
  white:{name:'ขาวพรีเมียม',c:['#ffffff','#fff3d6','#ecd7a4','#b99a58'],s:1},
  gold:{name:'ทองอร่าม',c:['#fff0a6','#ffd24d','#d99a1c','#8d5a07'],s:1},
  mini:{name:'พิงค์มินิ',c:['#ffc2dc','#ff5fa5','#d6197a','#8e0a52'],s:.82},
  sky:{name:'ฟ้าใสหวาน',c:['#ffd6ec','#a9dcff','#5a9be8','#2c5cc0'],s:1},
  violet:{name:'ม่วงละมุน',c:['#ffd1f2','#e07be0','#a43cc0','#5f1b86'],s:1},
  coco:{name:'กระทงกะลา',t:'coco',c:['#ffffff','#fff3d6','#ecd7a4','#b99a58'],s:1},
  fish:{name:'กระทงอาหารปลา',t:'fish',c:['#ffffff','#fff3d6','#ecd7a4','#b99a58'],s:1},
  banana:{name:'กระทงดอกบัว',t:'banana',c:['#ffffff','#ffe3ef','#ff9cc6','#d83a86'],s:1}
};
var ADD=[
  {id:'candle',name:'เทียน'},{id:'incense',name:'ธูป'},{id:'flower',name:'ดอกไม้'},{id:'marigold',name:'ดาวเรือง'},
  {id:'lotus',name:'ดอกบัว'},{id:'rose',name:'กุหลาบ'},{id:'gold',name:'เงินทอง'},{id:'sparkle',name:'ประกาย'},
  {id:'heart',name:'หัวใจ'},{id:'butterfly',name:'ผีเสื้อ'},
  {id:'dragon',name:'มังกรทอง',g:'animal'},{id:'rabbit',name:'กระต่าย',g:'animal'},{id:'turtle',name:'เต่าอายุยืน',g:'animal'},{id:'bird',name:'นก',g:'animal'}
];

var state={kr:'pink',add:new Set()};
/* ───────── svg builders ───────── */
function flame(x,y,k,glow){
  var dl=(-Math.random()*2).toFixed(2);
  return (glow!==false?'<circle class="gl" cx="'+x+'" cy="'+(y-14*k)+'" r="'+(46*k)+'" fill="url(#glowG)"/><ellipse cx="'+x+'" cy="'+(y-12*k)+'" rx="'+(26*k)+'" ry="'+(1.3*k)+'" fill="#fff4c8" opacity=".3"/>':'')+
    '<g transform="translate('+x+' '+y+') scale('+k+')"><g class="fl" style="animation-delay:'+dl+'s">'+
    '<path d="M0 1C-9-5-8-18 0-33C8-18 9-5 0 1Z" fill="url(#flameG)"/>'+
    '<path d="M0 0C-5-4-5-12 0-22C5-12 5-4 0 0Z" fill="#ffe27a"/>'+
    '<path d="M0-1C-3-4-3-10 0-17C3-10 3-4 0-1Z" fill="#fffdf0"/>'+
    '<ellipse cx="0" cy="-3" rx="2.4" ry="3.6" fill="#7db4ff" opacity=".55"/></g></g>';
}
function candle(x,yb,h,hw,k,glow){
  var top=yb-h,bandY=yb-h*.42,bandH=Math.max(1.6,h*.13);
  return '<ellipse cx="'+x+'" cy="'+(yb+hw*.2)+'" rx="'+(hw*1.9)+'" ry="'+(hw*.6)+'" fill="rgba(20,0,10,.38)"/>'+
    '<rect x="'+(x-hw)+'" y="'+top+'" width="'+(hw*2)+'" height="'+h+'" rx="'+(hw*.35)+'" fill="url(#waxG)"/>'+
    '<rect x="'+(x-hw*.55)+'" y="'+(top+hw*.5)+'" width="'+(hw*.26)+'" height="'+(h-hw)+'" rx="'+(hw*.13)+'" fill="#fff" opacity=".5"/>'+
    '<rect x="'+(x-hw)+'" y="'+bandY+'" width="'+(hw*2)+'" height="'+bandH+'" fill="url(#bandG)"/>'+
    '<rect x="'+(x-hw)+'" y="'+(bandY+bandH+hw*.28)+'" width="'+(hw*2)+'" height="'+Math.max(.8,hw*.16)+'" fill="url(#bandG)" opacity=".7"/>'+
    '<ellipse cx="'+x+'" cy="'+top+'" rx="'+hw+'" ry="'+(hw*.34)+'" fill="#fff3cf"/>'+
    '<ellipse cx="'+x+'" cy="'+(top+hw*.04)+'" rx="'+(hw*.62)+'" ry="'+(hw*.2)+'" fill="#efcf86"/>'+
    '<rect x="'+(x+hw*.38)+'" y="'+top+'" width="'+(hw*.42)+'" height="'+(h*.2)+'" rx="'+(hw*.21)+'" fill="url(#waxG)"/>'+
    '<path d="M'+x+' '+top+'v-3" stroke="#3a2a1a" stroke-width="1.3" stroke-linecap="round"/>'+
    flame(x,top-3,k,glow);
}
function lotus(pal,P,cx,cy,S,o){
  o=o||{};
  var c=pal.c;
  function lg(k,a,b){return '<linearGradient id="'+P+'-'+k+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>'}
  function petal(a,w,l,k){
    return '<g transform="rotate('+a+') scale('+w+' '+l+')">'+
      '<path d="M0 0C-24-12-30-48 0-72C30-48 24-12 0 0Z" fill="url(#'+P+'-'+k+')" stroke="rgba(255,255,255,.3)" stroke-width=".7" vector-effect="non-scaling-stroke"/>'+
      '<path d="M0-4C-14-16-17-40-2-64C-6-42-5-22 0-4Z" fill="rgba(255,255,255,.2)"/>'+
      '<path d="M0-6C1.5-28 1.5-48 0-66" stroke="rgba(255,255,255,.28)" stroke-width=".8" fill="none" vector-effect="non-scaling-stroke"/></g>';
  }
  var rows=[['b',[-78,-52,-26,0,26,52,78],1,1],['m',[-65,-39,-13,13,39,65],1.04,.9],['f',[-50,-25,0,25,50],1,.72]];
  var s='<defs>'+lg('b',c[2],c[3])+lg('m',c[1],c[2])+lg('f',c[0],c[1])+'</defs><g transform="translate('+cx+' '+cy+') scale('+S+')">';
  rows.forEach(function(r){s+=r[1].map(function(a){return petal(a,r[2],r[3],r[0])}).join('')});
  s+='<ellipse cx="0" cy="-34" rx="30" ry="9.5" fill="url(#cupG)" stroke="#ffe9a8" stroke-width=".8"/><ellipse cx="0" cy="-36" rx="20" ry="5" fill="#ffd45a" opacity=".55"/><g fill="#fff6c4"><circle cx="-18" cy="-36" r="1.8"/><circle cx="-9" cy="-39" r="1.6"/><circle cx="9" cy="-39" r="1.6"/><circle cx="18" cy="-36" r="1.8"/><circle cx="0" cy="-40" r="1.4"/></g></g>';
  if(o.candle!==false) s+=candle(cx,cy-31*S,40*S,5*S,.69*S,o.glow);
  return s;
}
function leaves(P,cx,cy,k){
  function l(r,m){return '<g transform="scale('+m+' 1) rotate('+r+')"><path d="M0 0C28-20 100-24 150 6C100 20 30 14 0 0Z" fill="url(#leafG)" stroke="rgba(160,255,190,.25)" stroke-width=".8" vector-effect="non-scaling-stroke"/><path d="M4 4C44-2 96 0 142 6" stroke="rgba(210,255,220,.32)" stroke-width=".8" fill="none" vector-effect="non-scaling-stroke"/></g>'}
  var s='<g transform="translate('+cx+' '+cy+') scale('+k+')"><ellipse cx="0" cy="6" rx="122" ry="14" fill="#0b3d2b"/>';
  [-14,-4,6].forEach(function(r){s+=l(r,1)+l(r,-1)});
  return s+'</g>';
}
function sq(x,y,sc){return 'translate('+x+' '+y+') scale('+sc+' '+(sc*.86)+')'}
function frangi(x,y,sc){
  var p='',i;
  for(i=0;i<5;i++) p+='<g transform="rotate('+(i*72)+')"><path d="M0 0C-7-3-9-15-1-20C6-19 9-8 0 0Z" fill="url(#fpG)" stroke="rgba(214,170,110,.6)" stroke-width=".5"/><path d="M0-1C-1-7 0-13 1-17C-4-12-4-5 0-1Z" fill="rgba(255,255,255,.75)"/><path d="M-1-2C-3-9-2-14 0-17" stroke="rgba(255,176,70,.5)" stroke-width=".6" fill="none"/></g>';
  return '<g transform="'+sq(x,y,sc)+'"><ellipse cx="1" cy="5" rx="17" ry="7" fill="rgba(0,25,20,.4)"/>'+p+'<circle r="4.6" fill="url(#cupG)"/><circle r="2" fill="#ff9d1a"/><circle cx="-1.2" cy="-1.2" r=".9" fill="#fff5c0"/></g>';
}
function cosmos(x,y,sc){
  var p='',i,t='M0 0C-8-4-9-15-6-20L-3-18 0-21 3-18 6-20C9-15 8-4 0 0Z';
  for(i=0;i<8;i++) p+='<path d="'+t+'" fill="url(#cm2G)" stroke="rgba(150,10,70,.35)" stroke-width=".5" transform="rotate('+(i*45+22)+')"/>';
  for(i=0;i<8;i++) p+='<g transform="rotate('+(i*45)+') scale(.8)"><path d="'+t+'" fill="url(#cmG)" stroke="rgba(150,10,70,.3)" stroke-width=".5"/><path d="M0-3C-1-9-1-13 0-17" stroke="rgba(255,255,255,.35)" stroke-width=".7" fill="none"/></g>';
  return '<g transform="'+sq(x,y,sc)+'"><ellipse cx="1" cy="5" rx="18" ry="7" fill="rgba(25,0,25,.4)"/>'+p+'<circle r="4" fill="url(#cupG)"/><g fill="#a86a00"><circle cx="-1.8" cy="-1" r=".6"/><circle cx="1.6" cy="-1.4" r=".6"/><circle cx="0" cy="1.6" r=".6"/></g></g>';
}
function marigold(x,y,sc){
  function ring(n,off,k,fill,d){var s='';for(var j=0;j<n;j++)s+='<ellipse cx="0" cy="'+(-d)+'" rx="'+(4.6*k)+'" ry="'+(8*k)+'" fill="url(#'+fill+')" stroke="rgba(120,50,0,.35)" stroke-width=".5" transform="rotate('+(j*360/n+off)+')"/>';return s}
  var p=ring(14,0,1,'mg1G',8)+ring(11,13,.82,'mg2G',6)+ring(8,5,.62,'mg3G',4.2)+ring(5,20,.4,'mg3G',2.4);
  return '<g transform="'+sq(x,y,sc)+'"><ellipse cx="1" cy="6" rx="18" ry="7" fill="rgba(40,10,0,.42)"/>'+p+'<circle r="2.2" fill="#8a4500" opacity=".5"/><ellipse cx="-4" cy="-6" rx="5" ry="2.2" fill="rgba(255,255,255,.22)" transform="rotate(-35 -4 -6)"/></g>';
}
function star(x,y,k,anim,dl){
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><g class="'+(anim?'twk':'')+'" style="animation-delay:'+(dl||0)+'s"><circle r="13" fill="url(#haloG)"/>'+
    '<path d="M0-13C1.2-4.5 4.5-1.2 13 0C4.5 1.2 1.2 4.5 0 13C-1.2 4.5-4.5 1.2-13 0C-4.5-1.2-1.2-4.5 0-13Z" fill="url(#starG)"/>'+
    '<path d="M0-6L1-1 6 0 1 1 0 6-1 1-6 0-1-1Z" fill="#fff" opacity=".8" transform="rotate(45)"/><circle r="1.5" fill="#fff"/></g></g>';
}
function heart(x,y,k,anim,dl){
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><g class="'+(anim?'heart':'')+'" style="animation-delay:'+(dl||0)+'s"><circle r="11" fill="url(#hHaloG)"/>'+
    '<path d="M0 7C-11-2-9-11 0-5 9-11 11-2 0 7Z" fill="url(#heartG)" stroke="rgba(255,200,215,.85)" stroke-width=".7"/>'+
    '<ellipse cx="-3.6" cy="-3.6" rx="2.4" ry="1.3" fill="#fff" opacity=".75" transform="rotate(-35 -3.6 -3.6)"/></g></g>';
}
function butterfly(x,y,k,c1,c2,anim,dl){
  var fw='M0 0C-3-13-19-21-27-12C-30-4-14 4 0 0Z',hw='M0 0C-10 3-21 10-16 17C-11 21-3 12 0 0Z';
  var w='<path d="'+fw+'" fill="'+c1+'"/><path d="'+fw+'" fill="url(#wingShade)"/><path d="'+hw+'" fill="'+c2+'"/><path d="'+hw+'" fill="url(#wingShade)"/>'+
    '<path d="'+fw+'" fill="none" stroke="rgba(45,15,40,.85)" stroke-width="1.1"/><path d="'+hw+'" fill="none" stroke="rgba(45,15,40,.85)" stroke-width="1"/>'+
    '<path d="M0 0L-22-13M0 0L-25-7M0 0L-14 12M0 0L-17 5" stroke="rgba(45,15,40,.4)" stroke-width=".6" fill="none"/>'+
    '<g fill="#fff" opacity=".9"><circle cx="-23" cy="-10" r="1.1"/><circle cx="-25" cy="-5.5" r="1"/><circle cx="-15" cy="14" r="1"/><circle cx="-17" cy="9" r=".9"/></g>';
  var cls=anim?'wing':'';
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><g class="'+(anim?'fly':'')+'" style="animation-delay:'+(dl||0)+'s">'+
    '<g class="'+cls+'">'+w+'</g><g transform="scale(-1 1)"><g class="'+cls+'">'+w+'</g></g>'+
    '<ellipse cx="0" cy="3" rx="1.9" ry="9" fill="#2b1a3a"/><circle cx="0" cy="-7" r="2.1" fill="#2b1a3a"/>'+
    '<path d="M-1-8C-3-13-5-14-6-16M1-8C3-13 5-14 6-16" stroke="#2b1a3a" stroke-width=".8" fill="none"/><circle cx="-6" cy="-16" r=".9" fill="#2b1a3a"/><circle cx="6" cy="-16" r=".9" fill="#2b1a3a"/></g></g>';
}
function incense(x,y,k,smoke){
  var sticks=[[-5,-12,-80],[3,5,-90],[11,19,-78]],s='<g transform="translate('+x+' '+y+') scale('+k+')">';
  sticks.forEach(function(t,i){
    s+='<line x1="'+t[0]+'" y1="0" x2="'+t[1]+'" y2="'+t[2]+'" stroke="#8a4a1e" stroke-width="3" stroke-linecap="round"/>'+
       '<line x1="'+(t[0]-.7)+'" y1="0" x2="'+(t[1]-.7)+'" y2="'+t[2]+'" stroke="#e3a35f" stroke-width="1" stroke-linecap="round" opacity=".8"/>'+
       '<circle class="ember" cx="'+t[1]+'" cy="'+t[2]+'" r="7" fill="url(#glowG)"/><circle cx="'+t[1]+'" cy="'+t[2]+'" r="2.4" fill="#ff5a1f"/><circle cx="'+t[1]+'" cy="'+t[2]+'" r="1.1" fill="#ffd27a"/>';
    if(smoke){
      var d='M'+t[1]+' '+(t[2]-4)+'c-6-9 6-16 0-26s-5-12 0-20';
      s+='<path class="smoke" d="'+d+'" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3.4" stroke-linecap="round" style="animation-delay:'+(-i*1.1)+'s"/>'+
         '<path class="smoke" d="'+d+'" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round" style="animation-delay:'+(-i*1.1)+'s"/>';
    }
  });
  s+='<rect x="-10" y="-20" width="26" height="9" rx="3" fill="url(#bandG)"/><rect x="-10" y="-17" width="26" height="2.4" fill="#b3202a"/><rect x="-10" y="-12.5" width="26" height="1" fill="rgba(0,0,0,.22)"/>';
  return s+'</g>';
}

/* ───────── krathong preview ───────── */
/* ───────── new: helpers, krathong bases, gold / rose, auspicious animals ───────── */
function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}
function bowlY(x){var u=(x-260)/132;return u*u>=1?226:226+46*Math.sqrt(1-u*u)}
var BOWL='M128 226C128 258 186 272 260 272S392 258 392 226Z';

function cocoBase(P){
  var r=rng(7),i,s='',cols=['#ffc2dc','#ff7fb8','#fff3d6','#ffd24d','#ffffff'];
  s+='<ellipse cx="260" cy="270" rx="126" ry="9" fill="rgba(0,10,20,.4)"/><path d="'+BOWL+'" fill="url(#cocoG)"/>';
  for(i=0;i<46;i++){
    var x=142+r()*236,yb=bowlY(x)-6;
    if(yb<240)continue;
    var y=236+r()*(yb-236);
    s+='<path d="M'+x.toFixed(1)+' '+y.toFixed(1)+'q'+(r()*6-3).toFixed(1)+' 5 '+(r()*4-2).toFixed(1)+' '+(9+r()*5).toFixed(1)+'" stroke="#2a1508" stroke-opacity=".5" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  }
  s+='<path d="M140 238C146 256 172 266 206 270" fill="none" stroke="#f0c690" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>'+
     '<ellipse cx="260" cy="226" rx="132" ry="26" fill="url(#cocoRim)"/><ellipse cx="260" cy="228" rx="119" ry="21" fill="url(#cocoIn)"/>';
  for(i=0;i<24;i++){
    var px=260+(r()*2-1)*82,py=230+(r()*2-1)*8;
    s+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="9" ry="4.6" fill="'+cols[i%5]+'" stroke="rgba(120,40,70,.35)" stroke-width=".5" transform="rotate('+((r()*180-90)|0)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
  }
  s+=candle(260,232,56,7,1);
  return {back:leaves('cc',260,252,.95),front:s,cup:222};
}
function fishBase(P){
  var r=rng(11),i,s='',pc=['#f4b865','#dd8f3d','#bd6a2b','#ffd592'];
  function pel(x,y,z){return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+z.toFixed(1)+'" fill="'+pc[Math.floor(r()*4)]+'" stroke="rgba(80,35,5,.4)" stroke-width=".6"/>'}
  s+='<ellipse cx="260" cy="270" rx="126" ry="9" fill="rgba(0,10,20,.4)"/><path d="'+BOWL+'" fill="url(#pelG)"/>';
  for(i=0;i<150;i++){var x=134+r()*252,yb=bowlY(x)-3;if(yb<238)continue;s+=pel(x,232+r()*(yb-232),3+r()*1.4)}
  s+='<ellipse cx="260" cy="226" rx="130" ry="25" fill="#c97d34"/><ellipse cx="260" cy="228" rx="116" ry="20" fill="#7a4018"/>';
  var n=46,a,front='';
  for(i=0;i<n;i++){a=i/n*Math.PI*2;var px=260+123*Math.cos(a),py=226+23.5*Math.sin(a),pz=4+r()*.9;
    if(Math.sin(a)<0)s+=pel(px,py,pz);else front+=pel(px,py,pz)}
  for(i=0;i<46;i++){var qx=260+(r()*2-1)*100,qy=229+(r()*2-1)*13,u=(qx-260)/112,v=(qy-229)/18;if(u*u+v*v<1)s+=pel(qx,qy,3.2+r()*1.2)}
  s+=candle(260,232,56,7,1)+front;
  return {back:leaves('ff',260,252,.95),front:s,cup:222};
}
function bananaBase(P,pal){
  var s='',i,n=9,back='',front='',cy=234,S=1.12;
  function leaf(x,y,rot,len){
    return '<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+rot.toFixed(1)+')"><path d="M-9 0C-11 '+(-len*.55)+' -3 '+(-len*.9)+' 0 '+(-len)+'C3 '+(-len*.9)+' 11 '+(-len*.55)+' 9 0Z" fill="url(#bleafG)" stroke="rgba(190,255,200,.4)" stroke-width=".7"/>'+
      '<path d="M0 -2L0 '+(-len+5)+'" stroke="rgba(225,255,230,.5)" stroke-width="1" fill="none"/><path d="M-5 -2C-6 '+(-len*.5)+' -2 '+(-len*.8)+' 0 '+(-len+7)+'" stroke="rgba(10,70,40,.3)" stroke-width=".8" fill="none"/></g>';
  }
  for(i=0;i<n;i++){
    var a=Math.PI*(1.06+.88*i/(n-1)),x=260+112*Math.cos(a),y=238+19*Math.sin(a);
    back+=leaf(x,y,Math.cos(a)*30,44);
    var b=Math.PI*(.06+.88*i/(n-1)),x2=260+112*Math.cos(b),y2=238+19*Math.sin(b);
    front+=leaf(x2,y2+2,Math.cos(b)*26,30);
  }
  s+='<ellipse cx="260" cy="268" rx="128" ry="10" fill="rgba(0,10,20,.4)"/>'+
     '<path d="M136 238V258A124 22 0 0 0 384 258V238Z" fill="url(#trunkG)"/>'+
     '<path d="M136 246A124 22 0 0 0 384 246M136 254A124 22 0 0 0 384 254" fill="none" stroke="#7e9a58" stroke-opacity=".4"/>'+
     '<ellipse cx="260" cy="238" rx="124" ry="22" fill="#f6f8dc" stroke="#b9cf86" stroke-width="1.2"/><ellipse cx="260" cy="239" rx="104" ry="17" fill="#e6edbd"/>'+
     back+lotus(pal,P+'L',260,cy,S)+front;
  return {back:'',front:s,cup:cy-34*S};
}
function base(id,P){
  var pal=KR[id],t=pal.t||'lotus';
  if(t==='coco')return cocoBase(P);
  if(t==='fish')return fishBase(P);
  if(t==='banana')return bananaBase(P,pal);
  var S=1.45*pal.s;
  return {back:leaves(P,260,244,1),front:lotus(pal,P+'L',260,235,S),cup:235-34*S};
}
function koi(x,y,k,flip,dl){
  return '<g transform="translate('+x+' '+y+') scale('+(flip?-k:k)+' '+k+')"><g class="swim" style="animation-delay:'+dl+'s">'+
   '<path d="M30 0C40-9 50-10 56-6C53-2 53 2 56 6C50 10 40 9 30 0Z" fill="#ff8a3d"/>'+
   '<path d="M0 0C6-12 22-13 32 0C22 13 6 12 0 0Z" fill="url(#koiG)"/>'+
   '<path d="M10 -9C14-14 22-14 25-8C20-6 14-6 10-9Z" fill="#fff" opacity=".85"/>'+
   '<circle cx="5" cy="-2" r="1.7" fill="#2b1a3a"/><circle cx="4.5" cy="-2.5" r=".6" fill="#fff"/></g></g>';
}

function rose(x,y,sc){
  var i,p='';
  for(i=0;i<5;i++)p+='<ellipse cx="0" cy="-9" rx="8" ry="9" fill="url(#roseG)" stroke="rgba(90,0,25,.35)" stroke-width=".6" transform="rotate('+(i*72)+')"/>';
  var lf='<path d="M-12 7C-26 3-28 -7-18 -9C-14 -3-11 3-12 7Z" fill="url(#leafG)" stroke="rgba(160,255,190,.3)" stroke-width=".5"/>';
  return '<g transform="translate('+x+' '+y+') scale('+sc+')"><ellipse cx="1" cy="12" rx="17" ry="5" fill="rgba(25,0,10,.4)"/>'+lf+'<g transform="scale(-1 1)">'+lf+'</g>'+p+
    '<circle r="9.5" fill="url(#roseG)"/><path d="M0 0C3-1 4-4 1-6C-3-7-6-3-4 1C-2 5 4 5 7 1C10-4 6-10 0-10" stroke="rgba(255,220,225,.65)" stroke-width="1" fill="none"/>'+
    '<ellipse cx="-4" cy="-7" rx="3" ry="1.5" fill="#fff" opacity=".4" transform="rotate(-30 -4 -7)"/></g>';
}
function ingot(x,y,sc){
  return '<g transform="translate('+x+' '+y+') scale('+sc+')"><ellipse cx="0" cy="9" rx="21" ry="4" fill="rgba(30,10,0,.4)"/>'+
   '<path d="M-16 -2L-12 8L12 8L16 -2C8 2-8 2-16 -2Z" fill="#c98a1c" stroke="#8a5510" stroke-width=".7"/>'+
   '<path d="M-20 -6C-20 -14-12 -14-9 -8C-5 -4 5 -4 9 -8C12 -14 20 -14 20 -6C14 0-14 0-20 -6Z" fill="url(#goldG)" stroke="#9a5d05" stroke-width=".7"/>'+
   '<ellipse cx="0" cy="-5" rx="7" ry="3" fill="#fff3a8" opacity=".8"/><path d="M-15 -9C-13 -11-11 -11-10 -9" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/></g>';
}
function coin(x,y,r){
  return '<g transform="translate('+x+' '+y+')"><circle r="'+r+'" fill="url(#coinG)" stroke="#9a5d05" stroke-width=".7"/><circle r="'+(r*.78)+'" fill="none" stroke="#fff0a0" stroke-opacity=".7" stroke-width=".6"/><rect x="'+(-r*.26)+'" y="'+(-r*.26)+'" width="'+(r*.52)+'" height="'+(r*.52)+'" fill="#8a5200" opacity=".75"/></g>';
}
function coinStack(x,y,r){
  var s='<g transform="translate('+x+' '+y+')"><ellipse cx="0" cy="5" rx="'+(r+3)+'" ry="4" fill="rgba(30,10,0,.4)"/>';
  for(var i=0;i<3;i++){var cy=-i*4.2;
    s+='<path d="M'+(-r)+' '+cy+'v4a'+r+' '+(r*.38)+' 0 0 0 '+(2*r)+' 0v-4Z" fill="#c0860f" stroke="#8a5510" stroke-width=".5"/><ellipse cx="0" cy="'+cy+'" rx="'+r+'" ry="'+(r*.38)+'" fill="url(#coinG)" stroke="#9a5d05" stroke-width=".5"/>';}
  return s+'<rect x="'+(-r*.2)+'" y="-9.6" width="'+(r*.4)+'" height="'+(r*.2)+'" fill="#8a5200" opacity=".7"/></g>';
}

function dragonHead(){
  return '<path d="M4 -6C-8 -22-24 -20-36 -34C-30-12-20-2 4 6Z" fill="#e8452c"/><path d="M6 -8C-4 -28-12 -34-22 -40C-20-22-14-8 6 2Z" fill="#ff7a3d" opacity=".9"/>'+
   '<path d="M16 -11C16 -22 22 -30 32 -36C27 -27 28 -20 27 -13Z" fill="#fff2b8" stroke="#c98a2b" stroke-width=".6"/><path d="M26 -11C30 -20 38 -24 46 -24C40 -20 38 -15 36 -9Z" fill="#fff2b8" stroke="#c98a2b" stroke-width=".6"/>'+
   '<path d="M6 5C20 6 36 5 50 2C56 1 58 5 52 8C40 13 20 13 6 10Z" fill="#d99a24" stroke="#8a5510" stroke-width=".7"/>'+
   '<path d="M0 -10C12 -15 28 -14 40 -10C49 -8 58 -9 60 -4C61 -1 57 1 51 1C40 2 30 2 20 4C12 6 6 8 0 8Z" fill="url(#dragG)" stroke="#8a5510" stroke-width=".8"/>'+
   '<path d="M30 3L32 8L34 3M40 2L42 7L44 2" fill="#fff"/><circle cx="54" cy="-4" r="1.3" fill="#7a3a00"/>'+
   '<ellipse cx="22" cy="-3" rx="3.6" ry="2.8" fill="#fff"/><circle cx="23" cy="-3" r="1.9" fill="#c01818"/><circle cx="23.4" cy="-3.4" r=".7" fill="#fff"/>'+
   '<path d="M17 -7C21 -10 27 -9 29 -6" stroke="#8a5510" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
   '<path d="M54 -1C68 -8 72 8 88 2" fill="none" stroke="#ffe08a" stroke-width="1.6" stroke-linecap="round"/><path d="M52 4C64 14 72 2 84 12" fill="none" stroke="#ffe08a" stroke-width="1.4" stroke-linecap="round"/>';
}
function dragon(){
  var N=64,P=[],i,t;
  for(i=0;i<=N;i++){t=i/N;P.push({x:30+380*t,y:84+16*Math.sin(t*8.6+.2)*(.55+.45*t)-14*t})}
  for(i=0;i<=N;i++){
    var a=P[Math.max(0,i-1)],b=P[Math.min(N,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.sqrt(dx*dx+dy*dy),tt=i/N;
    P[i].tx=dx/l;P[i].ty=dy/l;P[i].nx=-dy/l;P[i].ny=dx/l;
    P[i].w=2.2+12.5*Math.min(1,tt*1.6)*(1-.35*Math.max(0,(tt-.85)/.15));
  }
  function pt(p,f){return (p.x+p.nx*p.w*f).toFixed(1)+' '+(p.y+p.ny*p.w*f).toFixed(1)}
  var lo=P.map(function(p){return pt(p,1)}),up=P.map(function(p){return pt(p,-1)}),mid=P.map(function(p){return pt(p,.35)});
  var s='<g class="dragf" filter="url(#gGlow)">';
  [14,19,46,51].forEach(function(k){
    var p=P[k],ang=Math.atan2(p.ny,p.nx)*180/Math.PI-90;
    s+='<g transform="translate('+(p.x+p.nx*p.w*.8).toFixed(1)+' '+(p.y+p.ny*p.w*.8).toFixed(1)+') rotate('+ang.toFixed(1)+')"><path d="M0 0C2 6 5 10 2 15" fill="none" stroke="#d99a24" stroke-width="3.6" stroke-linecap="round"/><path d="M2 15l-3 3M2 15l1 4M2 15l4 2" stroke="#fff2b8" stroke-width="1.1" stroke-linecap="round"/></g>';
  });
  s+='<g transform="translate('+P[0].x.toFixed(1)+' '+P[0].y.toFixed(1)+')"><path d="M0 0C-8-7-16-4-22-10C-17-2-16 4-23 9C-14 7-8 5 0 2Z" fill="#e8452c"/></g>';
  s+='<path d="M'+lo.join('L')+'L'+up.slice().reverse().join('L')+'Z" fill="url(#dragG)" stroke="#a55f06" stroke-width=".8" stroke-linejoin="round"/>';
  s+='<path d="M'+lo.join('L')+'L'+mid.slice().reverse().join('L')+'Z" fill="#fff1b0" opacity=".5"/>';
  for(i=4;i<N-3;i+=3){var p=P[i],sg=(i%2?1:-1);
    s+='<circle cx="'+(p.x+p.nx*p.w*.3*sg).toFixed(1)+'" cy="'+(p.y+p.ny*p.w*.3*sg).toFixed(1)+'" r="'+(p.w*.42).toFixed(1)+'" fill="none" stroke="rgba(150,85,0,.45)" stroke-width=".7"/>'}
  for(i=7;i<N-3;i+=2){var q=P[i],h=3+q.w*.35;
    s+='<path d="M'+(q.x-q.nx*q.w*.95-q.tx*2.4).toFixed(1)+' '+(q.y-q.ny*q.w*.95-q.ty*2.4).toFixed(1)+'L'+(q.x-q.nx*(q.w+h)-q.tx*2.8).toFixed(1)+' '+(q.y-q.ny*(q.w+h)-q.ty*2.8).toFixed(1)+'L'+(q.x-q.nx*q.w*.95+q.tx*2.4).toFixed(1)+' '+(q.y-q.ny*q.w*.95+q.ty*2.4).toFixed(1)+'Z" fill="#e8452c"/>'}
  var e=P[N],ea=Math.atan2(e.ty,e.tx)*180/Math.PI;
  s+='<g transform="translate('+e.x.toFixed(1)+' '+e.y.toFixed(1)+') rotate('+ea.toFixed(1)+') scale(.95)">'+dragonHead()+'</g>';
  s+='<g class="gl"><circle cx="498" cy="50" r="19" fill="url(#haloG)"/><circle cx="498" cy="50" r="8.5" fill="url(#pearlG)" stroke="#fff" stroke-opacity=".7" stroke-width=".6"/><path d="M490 56C486 48 492 44 490 38M506 56C510 48 504 44 506 38" stroke="#ff9a3c" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/></g>';
  return s+'</g>';
}

function rabbit(x,y,k,pad){
  var sk='fill="url(#rabG)" stroke="#cdbbe8" stroke-width=".8"',s='<g transform="translate('+x+' '+y+') scale('+k+')">';
  if(pad!==false)s+='<ellipse cx="0" cy="3" rx="48" ry="9" fill="rgba(0,20,15,.4)"/><ellipse cx="0" cy="0" rx="46" ry="9.5" fill="url(#padG)" stroke="#3fb872" stroke-width=".9"/><path d="M0 0L-44 -3M0 0L44 -3M0 0L-30 7M0 0L30 7M0 0L0 9" stroke="rgba(190,255,205,.35)" stroke-width=".8" fill="none"/>';
  return s+'<circle cx="-17" cy="-9" r="5.5" fill="#fff" stroke="#cdbbe8" stroke-width=".7"/>'+
   '<path d="M-17 -4C-19 -22-8 -34 0 -34C8 -34 19 -22 17 -4C12 2-12 2-17 -4Z" '+sk+'/>'+
   '<ellipse cx="-10" cy="-1" rx="8.5" ry="4" '+sk+'/><ellipse cx="10" cy="-1" rx="8.5" ry="4" '+sk+'/>'+
   '<g class="ear"><ellipse cx="7" cy="-63" rx="4.8" ry="14" transform="rotate(10 7 -63)" '+sk+'/><ellipse cx="7" cy="-62" rx="2.4" ry="9.5" transform="rotate(10 7 -62)" fill="#ffc0d4"/></g>'+
   '<ellipse cx="-7" cy="-64" rx="4.8" ry="14" transform="rotate(-9 -7 -64)" '+sk+'/><ellipse cx="-7" cy="-63" rx="2.4" ry="9.5" transform="rotate(-9 -7 -63)" fill="#ffc0d4"/>'+
   '<ellipse cx="0" cy="-43" rx="14" ry="12.5" '+sk+'/>'+
   '<circle cx="-5.2" cy="-44" r="1.9" fill="#2b1a3a"/><circle cx="5.2" cy="-44" r="1.9" fill="#2b1a3a"/><circle cx="-4.6" cy="-44.7" r=".6" fill="#fff"/><circle cx="5.8" cy="-44.7" r=".6" fill="#fff"/>'+
   '<path d="M-2 -39.5h4l-2 2.4z" fill="#ff8fb0"/><path d="M0 -37.1v1.6M0 -35.5q-2.6 2.4-4.4 .6M0 -35.5q2.6 2.4 4.4 .6" stroke="#b07a9a" stroke-width=".8" fill="none" stroke-linecap="round"/>'+
   '<ellipse cx="-9" cy="-39" rx="3" ry="2" fill="#ffb6c8" opacity=".6"/><ellipse cx="9" cy="-39" rx="3" ry="2" fill="#ffb6c8" opacity=".6"/>'+
   '<ellipse cx="-5" cy="-23" rx="4" ry="3" '+sk+'/><ellipse cx="5" cy="-23" rx="4" ry="3" '+sk+'/></g>';
}
function turtle(x,y,k,ripple){
  var s='<g transform="translate('+x+' '+y+') scale('+k+')">';
  if(ripple!==false)s+='<ellipse cx="2" cy="2" rx="50" ry="6" fill="none" stroke="#ffe1a0" stroke-opacity=".4" stroke-width="1"/>';
  return s+'<g class="bobS">'+
   '<path d="M-32 -6L-45 -2L-32 -1Z" fill="#6aa447"/><ellipse cx="-22" cy="-2" rx="11" ry="4.2" transform="rotate(18 -22 -2)" fill="url(#skinG)"/>'+
   '<ellipse cx="33" cy="-11" rx="10" ry="6" transform="rotate(-48 33 -11)" fill="#86b852"/>'+
   '<ellipse cx="42" cy="-20" rx="9" ry="7.2" fill="#9ccc5f" stroke="#3f7a2c" stroke-width=".7"/><circle cx="45.5" cy="-22" r="1.8" fill="#1d1a2b"/><circle cx="46" cy="-22.5" r=".6" fill="#fff"/>'+
   '<path d="M44 -16.5C47 -16 49 -17 50 -19" stroke="#3f7a2c" stroke-width=".9" fill="none" stroke-linecap="round"/><ellipse cx="41" cy="-17" rx="2" ry="1.2" fill="#ffb6a0" opacity=".6"/>'+
   '<path d="M-36 -2C-38 -40 38 -40 36 -2Z" fill="url(#turG)" stroke="#12503a" stroke-width="1"/>'+
   '<path d="M-8 -27L8 -27L15 -17L8 -7L-8 -7L-15 -17Z" fill="rgba(255,230,140,.18)" stroke="#ffe08a" stroke-width="1.1" stroke-linejoin="round"/>'+
   '<path d="M-15 -17L-28 -14M15 -17L28 -14M-8 -27L-12 -28.5M8 -27L12 -28.5M-8 -7L-14 -3M8 -7L14 -3" stroke="#ffe08a" stroke-width="1" fill="none" stroke-linecap="round"/>'+
   '<ellipse cx="-12" cy="-24" rx="7" ry="2.4" fill="#fff" opacity=".25" transform="rotate(-25 -12 -24)"/><path d="M-36 -2H36" stroke="#e0a82e" stroke-width="3.2" stroke-linecap="round"/>'+
   '<ellipse cx="22" cy="0" rx="12" ry="4.5" transform="rotate(-24 22 0)" fill="#86b852" stroke="#3f7a2c" stroke-width=".6"/></g></g>';
}
function bird(x,y,k,anim,dl){
  var w=anim?'bw':'';
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><g class="'+(anim?'fly':'')+'" style="animation-delay:'+(dl||0)+'s">'+
   '<path d="M-14 2C-30 -2-40 6-50 14C-38 14-30 12-14 8Z" fill="url(#tailG)"/><path d="M-14 4C-30 8-40 18-52 24C-40 22-30 18-14 10Z" fill="url(#tailG)" opacity=".85"/>'+
   '<g class="'+w+'" opacity=".55"><path d="M-2 -6C-6 -24 6 -34 20 -36C12 -28 10 -16 6 -6Z" fill="url(#wingG)"/></g>'+
   '<path d="M-16 4C-16 -8 0 -14 12 -8C20 -4 20 6 10 10C0 14-16 12-16 4Z" fill="url(#birdG)"/><ellipse cx="2" cy="7" rx="9" ry="4" fill="#fff2c4" opacity=".8"/>'+
   '<circle cx="14" cy="-9" r="7.5" fill="url(#birdG)"/><path d="M10 -15C8 -22 12 -22 14 -18" stroke="#ff7a1a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+
   '<path d="M20 -10L30 -7L20 -5Z" fill="#ff8a1f"/><circle cx="17" cy="-11" r="1.7" fill="#2b1a3a"/><circle cx="17.5" cy="-11.6" r=".6" fill="#fff"/>'+
   '<g class="'+w+'"><path d="M-4 -4C-8 -26 6 -38 24 -40C14 -30 12 -16 8 -4Z" fill="url(#wingG)" stroke="rgba(10,50,110,.4)" stroke-width=".7"/><path d="M2 -6C2 -20 8 -30 18 -36M6 -6C8 -18 12 -26 20 -33" stroke="rgba(255,255,255,.5)" stroke-width=".8" fill="none"/></g>'+
   '</g></g>';
}

/* ───────── krathong preview ───────── */
function body(P,full){
  var pal=KR[state.kr],has=function(i){return state.add.has(i)},s='';
  if(full&&has('dragon'))s+=dragon();
  var b=base(state.kr,P),cup=b.cup;
  s+=b.back;
  if(has('lotus')){
    var mp=state.kr==='pink'?KR.violet:KR.pink;
    s+=lotus(mp,P+'M1',100,252,.34,{candle:false})+lotus(mp,P+'M2',420,252,.34,{candle:false});
  }
  s+=b.front;
  if(has('candle'))s+=candle(222,cup+6,30,5,.62)+candle(298,cup+6,30,5,.62);
  if(has('incense'))s+=incense(290,cup+8,1,full);
  s+=frangi(178,258,1.05)+frangi(262,277,1.15)+frangi(350,258,1.05);
  if(has('flower'))s+=cosmos(122,250,1.1)+cosmos(216,272,1)+cosmos(308,274,1)+cosmos(400,250,1.1);
  if(has('marigold'))s+=marigold(148,274,1)+marigold(376,274,1)+marigold(262,262,.8);
  if(has('rose'))s+=rose(92,266,.95)+rose(238,290,1)+rose(284,292,.9)+rose(430,266,.95);
  if(has('gold'))s+=ingot(112,280,.9)+ingot(408,282,.9)+coinStack(196,292,11)+coinStack(330,292,11);
  if(has('rabbit'))s+=rabbit(56,266,.95);
  if(has('turtle'))s+=turtle(462,268,.9);
  if(full){
    if(pal.t==='fish')s+=koi(118,304,.8,false,0)+koi(404,300,.7,true,-2.4);
    if(has('heart'))s+=heart(232,156,1.3,true,0)+heart(262,150,1.5,true,-1.4)+heart(292,158,1.2,true,-2.8);
    if(has('sparkle'))[[120,140,1.1,0],[404,150,.95,-.6],[170,84,.8,-1.2],[352,76,1.05,-.3],[260,46,.7,-1.8],[78,210,.8,-.9],[444,214,.9,-1.5]].forEach(function(p){s+=star(p[0],p[1],p[2],true,p[3])});
    if(has('butterfly'))s+=butterfly(150,152,.9,'#ff9f1c','#ffd166',true,0)+butterfly(392,118,.8,'#ff7eb6','#ffd1e6',true,-3);
    if(has('bird'))s+=bird(70,150,1,true,-1);
  }
  return s;
}

var DEFS="<defs>\n  <linearGradient id=\"flameG\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#ff8a1f\"/><stop offset=\".55\" stop-color=\"#ffc94d\"/><stop offset=\"1\" stop-color=\"#fff3b0\"/></linearGradient>\n  <radialGradient id=\"glowG\"><stop offset=\"0\" stop-color=\"#ffd27a\" stop-opacity=\".75\"/><stop offset=\".45\" stop-color=\"#ffae45\" stop-opacity=\".25\"/><stop offset=\"1\" stop-color=\"#ff9a3c\" stop-opacity=\"0\"/></radialGradient>\n  <linearGradient id=\"waxG\" x1=\"0\" x2=\"1\" y1=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#d9bb78\"/><stop offset=\".25\" stop-color=\"#fff2cc\"/><stop offset=\".55\" stop-color=\"#fffcef\"/><stop offset=\".85\" stop-color=\"#efd599\"/><stop offset=\"1\" stop-color=\"#c8a55f\"/></linearGradient>\n  <radialGradient id=\"cupG\" cx=\".5\" cy=\".4\" r=\".7\"><stop offset=\"0\" stop-color=\"#fff0a0\"/><stop offset=\".6\" stop-color=\"#f6bd33\"/><stop offset=\"1\" stop-color=\"#c47d0e\"/></radialGradient>\n  <linearGradient id=\"leafG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#0c5a38\"/><stop offset=\".6\" stop-color=\"#2fa35c\"/><stop offset=\"1\" stop-color=\"#7bdc8c\"/></linearGradient>\n  <radialGradient id=\"whiteG\" cx=\".5\" cy=\".6\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#fbeed0\"/></radialGradient>\n  <radialGradient id=\"cosmosG\" cx=\".5\" cy=\".6\"><stop offset=\"0\" stop-color=\"#ff86b9\"/><stop offset=\"1\" stop-color=\"#ffd3e6\"/></radialGradient>\n  <linearGradient id=\"tg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#191650\"/><stop offset=\"1\" stop-color=\"#3b2872\"/></linearGradient>\n  <linearGradient id=\"padG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1f7a4a\"/><stop offset=\"1\" stop-color=\"#0a3a2a\"/></linearGradient>\n  <linearGradient id=\"bandG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#8a5510\"/><stop offset=\".3\" stop-color=\"#ffe08a\"/><stop offset=\".55\" stop-color=\"#fff2b8\"/><stop offset=\".8\" stop-color=\"#d49a2a\"/><stop offset=\"1\" stop-color=\"#8a5510\"/></linearGradient>\n  <linearGradient id=\"fpG\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#ffc02e\"/><stop offset=\".3\" stop-color=\"#fff0b8\"/><stop offset=\".65\" stop-color=\"#fffdf6\"/><stop offset=\"1\" stop-color=\"#ffe6ee\"/></linearGradient>\n  <linearGradient id=\"cmG\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#b0124f\"/><stop offset=\".4\" stop-color=\"#ff4f9a\"/><stop offset=\"1\" stop-color=\"#ffc2dc\"/></linearGradient>\n  <linearGradient id=\"cm2G\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#8a0a3e\"/><stop offset=\".5\" stop-color=\"#e0307e\"/><stop offset=\"1\" stop-color=\"#ff9cc4\"/></linearGradient>\n  <linearGradient id=\"mg1G\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#9c4a00\"/><stop offset=\".5\" stop-color=\"#f08400\"/><stop offset=\"1\" stop-color=\"#ffb21f\"/></linearGradient>\n  <linearGradient id=\"mg2G\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#b85a00\"/><stop offset=\".5\" stop-color=\"#ff9a0a\"/><stop offset=\"1\" stop-color=\"#ffc73a\"/></linearGradient>\n  <linearGradient id=\"mg3G\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#c06a00\"/><stop offset=\".5\" stop-color=\"#ffb52e\"/><stop offset=\"1\" stop-color=\"#ffe07a\"/></linearGradient>\n  <radialGradient id=\"haloG\"><stop offset=\"0\" stop-color=\"#fff\" stop-opacity=\".8\"/><stop offset=\".4\" stop-color=\"#ffe9a8\" stop-opacity=\".35\"/><stop offset=\"1\" stop-color=\"#ffd070\" stop-opacity=\"0\"/></radialGradient>\n  <radialGradient id=\"starG\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".5\" stop-color=\"#fff3c4\"/><stop offset=\"1\" stop-color=\"#f3b53a\"/></radialGradient>\n  <radialGradient id=\"heartG\" cx=\".35\" cy=\".3\" r=\".85\"><stop offset=\"0\" stop-color=\"#ffd0dc\"/><stop offset=\".4\" stop-color=\"#ff4f7d\"/><stop offset=\"1\" stop-color=\"#a50f3c\"/></radialGradient>\n  <radialGradient id=\"hHaloG\"><stop offset=\"0\" stop-color=\"#ff5a8c\" stop-opacity=\".5\"/><stop offset=\"1\" stop-color=\"#ff5a8c\" stop-opacity=\"0\"/></radialGradient>\n  <radialGradient id=\"wingShade\" cx=\"1\" cy=\".5\" r=\"1\"><stop offset=\"0\" stop-color=\"#1e0028\" stop-opacity=\".5\"/><stop offset=\".55\" stop-color=\"#1e0028\" stop-opacity=\"0\"/><stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\".2\"/></radialGradient>\n  <linearGradient id=\"cocoG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#b9854d\"/><stop offset=\".5\" stop-color=\"#7a4a22\"/><stop offset=\"1\" stop-color=\"#3b200e\"/></linearGradient>\n  <linearGradient id=\"cocoRim\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#8b5a2b\"/><stop offset=\".4\" stop-color=\"#d9ac72\"/><stop offset=\"1\" stop-color=\"#7a4a22\"/></linearGradient>\n  <radialGradient id=\"cocoIn\" cx=\".5\" cy=\".25\" r=\".9\"><stop offset=\"0\" stop-color=\"#6a3d1a\"/><stop offset=\"1\" stop-color=\"#22110a\"/></radialGradient>\n  <linearGradient id=\"pelG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#e9a851\"/><stop offset=\"1\" stop-color=\"#a95a22\"/></linearGradient>\n  <linearGradient id=\"koiG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#ff6a2a\"/><stop offset=\"1\" stop-color=\"#ffb04a\"/></linearGradient>\n  <linearGradient id=\"trunkG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#7e9a58\"/><stop offset=\".25\" stop-color=\"#e3ecb8\"/><stop offset=\".55\" stop-color=\"#fbfce6\"/><stop offset=\".85\" stop-color=\"#c3d596\"/><stop offset=\"1\" stop-color=\"#76934f\"/></linearGradient>\n  <linearGradient id=\"bleafG\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0\" stop-color=\"#1b7c46\"/><stop offset=\"1\" stop-color=\"#8fe39a\"/></linearGradient>\n  <linearGradient id=\"goldG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff3a8\"/><stop offset=\".5\" stop-color=\"#f5c43a\"/><stop offset=\"1\" stop-color=\"#b97a0d\"/></linearGradient>\n  <radialGradient id=\"coinG\" cx=\".35\" cy=\".3\" r=\".8\"><stop offset=\"0\" stop-color=\"#fff6b8\"/><stop offset=\".6\" stop-color=\"#f3b92f\"/><stop offset=\"1\" stop-color=\"#a86a08\"/></radialGradient>\n  <radialGradient id=\"roseG\" cx=\".4\" cy=\".35\" r=\".8\"><stop offset=\"0\" stop-color=\"#ff7a98\"/><stop offset=\".55\" stop-color=\"#d4143f\"/><stop offset=\"1\" stop-color=\"#7a0624\"/></radialGradient>\n  <linearGradient id=\"dragG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff0a0\"/><stop offset=\".5\" stop-color=\"#f6b92c\"/><stop offset=\"1\" stop-color=\"#b87008\"/></linearGradient>\n  <radialGradient id=\"pearlG\" cx=\".35\" cy=\".3\" r=\".8\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".6\" stop-color=\"#bfe9ff\"/><stop offset=\"1\" stop-color=\"#6fb4f0\"/></radialGradient>\n  <radialGradient id=\"rabG\" cx=\".4\" cy=\".3\" r=\".9\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#eadfff\"/></radialGradient>\n  <linearGradient id=\"turG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#6fcf7e\"/><stop offset=\".6\" stop-color=\"#2a8a52\"/><stop offset=\"1\" stop-color=\"#145238\"/></linearGradient>\n  <linearGradient id=\"skinG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#a7d467\"/><stop offset=\"1\" stop-color=\"#5f9640\"/></linearGradient>\n  <linearGradient id=\"birdG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffd54a\"/><stop offset=\"1\" stop-color=\"#ff8a1f\"/></linearGradient>\n  <linearGradient id=\"wingG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#58d6e6\"/><stop offset=\"1\" stop-color=\"#1b78c4\"/></linearGradient>\n  <linearGradient id=\"tailG\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#1766b0\"/><stop offset=\"1\" stop-color=\"#19c4c8\"/></linearGradient>\n  <filter id=\"gGlow\" x=\"-10%\" y=\"-30%\" width=\"120%\" height=\"170%\"><feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"3.5\" result=\"b\"/><feFlood flood-color=\"#ffc850\" flood-opacity=\".55\"/><feComposite in2=\"b\" operator=\"in\" result=\"g\"/><feMerge><feMergeNode in=\"g\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter>\n</defs>";
function svg(kr,add){state.kr=KR[kr]?kr:'pink';state.add=new Set(add||[]);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 20 420 320">'+DEFS+body('x',true)+'</svg>';}
var cache={};
function url(kr,add){var k=kr+'|'+(add||[]).join(',');
  if(!cache[k]){try{cache[k]=URL.createObjectURL(new Blob([svg(kr,add)],{type:'image/svg+xml'}));}catch(e){cache[k]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(kr,add));}}
  return cache[k];}
function parse(v){var p=String(v||'').split('|');if(!KR[p[0]])return null;
  return {kr:p[0],add:(p[1]||'').split(',').filter(function(x){return ADD.some(function(a){return a.id===x})}).slice(0,3)};}
function encode(kr,add){return kr+((add&&add.length)?'|'+add.join(','):'');}
window.KrathongArt={KR:KR,ADD:ADD,svg:svg,url:url,parse:parse,encode:encode};
})();
