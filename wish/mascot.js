/* =========================================================
   mascot.js — "น้องผึ้ง" มาสคอตของ COM7
   - ใช้ภาพ PNG/WebP โปร่งใส (assets/wish/bee-mascot.webp)
   - เคลื่อนไหวด้วย CSS: บินลอย / ส่ายตัว / ออร่าทอง / ประกายดาว / ดอกไม้ลอย
   ใช้งาน: ใส่ <span data-mascot></span> แล้วเรียก Mascot.mountAll()
   * ตั้ง window.MASCOT_SRC ก่อนโหลดไฟล์นี้ เพื่อเปลี่ยนที่อยู่ภาพ (เช่น data URI)
   ========================================================= */
(function (root) {
  'use strict';

  const SRC = root.MASCOT_SRC || 'assets/wish/bee-mascot.webp';
  const FALLBACK = 'assets/wish/bee-mascot.png';

  const STYLE = [
    '.bee{position:relative;display:block;width:100%;aspect-ratio:549/560}',
    '.bee__fly{position:absolute;inset:0;animation:bee-fly 3.6s ease-in-out infinite}',
    '.bee__img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transform-origin:50% 60%;',
    '  animation:bee-wiggle 1.8s ease-in-out infinite;filter:drop-shadow(0 8px 14px rgba(60,30,0,.35)) drop-shadow(0 0 18px rgba(255,205,90,.45))}',
    '.bee__aura{position:absolute;left:10%;top:12%;width:80%;height:80%;border-radius:50%;',
    '  background:radial-gradient(circle,rgba(255,236,160,.75) 0%,rgba(255,200,80,.3) 45%,rgba(255,190,60,0) 70%);',
    '  animation:bee-aura 2.6s ease-in-out infinite}',
    '.bee__spark{position:absolute;width:13%;aspect-ratio:1;color:#fff4c4;animation:bee-twinkle 2.2s ease-in-out infinite;',
    '  filter:drop-shadow(0 0 6px rgba(255,214,110,.95))}',
    '.bee__spark svg{width:100%;height:100%;display:block}',
    '.bee__spark--1{left:2%;top:22%}',
    '.bee__spark--2{right:0;top:52%;width:9%;animation-delay:-.7s}',
    '.bee__spark--3{left:24%;bottom:2%;width:9%;animation-delay:-1.4s}',
    '.bee__flower{position:absolute;width:11%;aspect-ratio:1;animation:bee-flower 4.5s ease-in-out infinite}',
    '.bee__flower--1{left:-2%;top:44%}',
    '.bee__flower--2{right:4%;bottom:6%;width:9%;animation-delay:-2s}',
    '@keyframes bee-fly{0%,100%{transform:translate(0,0)}25%{transform:translate(2%,-5%)}50%{transform:translate(0,-8%)}75%{transform:translate(-2%,-4%)}}',
    '@keyframes bee-wiggle{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}',
    '@keyframes bee-aura{50%{transform:scale(1.12);opacity:.65}}',
    '@keyframes bee-twinkle{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(.45) rotate(45deg);opacity:.35}}',
    '@keyframes bee-flower{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12%) rotate(25deg)}}',
    '@media (prefers-reduced-motion:reduce){.bee *{animation:none!important}}'
  ].join('\n');

  const STAR = '<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z" fill="currentColor"/></svg>';
  const FLOWER = '<svg viewBox="-10 -10 20 20" aria-hidden="true">' +
    [0, 72, 144, 216, 288].map(function (a) {
      return '<ellipse cx="0" cy="-5" rx="3.6" ry="5" fill="#fff6f0" transform="rotate(' + a + ')"/>';
    }).join('') + '<circle r="3" fill="#ffd34d"/></svg>';

  /** HTML ของน้องผึ้ง (มี aura + ประกาย + ดอกไม้) */
  function html() {
    return '<span class="bee">' +
      '<span class="bee__aura"></span>' +
      '<span class="bee__flower bee__flower--1">' + FLOWER + '</span>' +
      '<span class="bee__flower bee__flower--2">' + FLOWER + '</span>' +
      '<span class="bee__fly">' +
        '<img class="bee__img" src="' + SRC + '" alt="" draggable="false" ' +
        'onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'' + FALLBACK + '\'}">' +
      '</span>' +
      '<span class="bee__spark bee__spark--1">' + STAR + '</span>' +
      '<span class="bee__spark bee__spark--2">' + STAR + '</span>' +
      '<span class="bee__spark bee__spark--3">' + STAR + '</span>' +
    '</span>';
  }

  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('bee-style')) return;
    const s = document.createElement('style');
    s.id = 'bee-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  /** วาดน้องผึ้งลงทุก element ที่มี [data-mascot] และยังว่างอยู่ */
  function mountAll(scope) {
    injectStyle();
    (scope || document).querySelectorAll('[data-mascot]').forEach(function (node) {
      if (!node.firstElementChild) node.innerHTML = html();
    });
  }

  root.Mascot = { html: html, mountAll: mountAll };
})(typeof window !== 'undefined' ? window : globalThis);
