/* =========================================================
   data.js — ข้อมูลตัวอย่าง (Mock data)
   * เมื่อเชื่อม API จริง ให้แทนที่ WISH_DATA ด้วยข้อมูลจาก backend
   ========================================================= */
window.WISH_DATA = {
  /* หมวดคำอธิษฐาน (เรียงตามอันดับ) */
  categories: [
    { key: 'love',   label: 'ความรัก',  icon: '💖', pct: 32, color: '#f472b6' },
    { key: 'work',   label: 'การงาน',   icon: '💼', pct: 24, color: '#c084fc' },
    { key: 'study',  label: 'การเรียน', icon: '📖', pct: 18, color: '#60a5fa' },
    { key: 'health', label: 'สุขภาพ',   icon: '✨', pct: 12, color: '#facc15' },
    { key: 'family', label: 'ครอบครัว', icon: '👨‍👩‍👧', pct: 7,  color: '#fb7185' },
    { key: 'money',  label: 'การเงิน',  icon: '💰', pct: 5,  color: '#818cf8' },
    { key: 'other',  label: 'อื่นๆ',    icon: '🙂', pct: 2,  color: '#fbbf24' }
  ],

  /* จำนวนคำอธิษฐานเริ่มต้น (mock) */
  totalWishes: 12480,

  /* ป้ายคำอธิษฐาน (ภาพ) + สีกระดาษที่ใช้ในหน้าต่างอ่านคำอธิษฐาน */
  tags: [
    { src: 'assets/wish/tags/tag-pink-1.webp',  color: '#ffc4da' },
    { src: 'assets/wish/tags/tag-blue-1.webp',  color: '#c4e4f4' },
    { src: 'assets/wish/tags/tag-peach-1.webp', color: '#ffe2cc' },
    { src: 'assets/wish/tags/tag-blue-2.webp',  color: '#c4e4f4' },
    { src: 'assets/wish/tags/tag-peach-2.webp', color: '#ffe2cc' },
    { src: 'assets/wish/tags/tag-pink-2.webp',  color: '#ffc4da' }
  ],

  /* ตัวอย่างคำอธิษฐาน (ไม่ระบุชื่อจริง) */
  wishes: [
    { cat: 'love',   text: 'ขอให้เจอคนที่ใช่ และรักกันไปนาน ๆ', by: 'เพื่อนพนักงาน · BaNANA' },
    { cat: 'work',   text: 'ขอให้ยอดขายสาขาทะลุเป้า ทีมเราได้ไปเที่ยวด้วยกัน', by: 'ทีมสาขา · Studio7' },
    { cat: 'study',  text: 'ขอให้สอบใบรับรองผ่านในครั้งเดียว', by: 'เพื่อนพนักงาน · HQ' },
    { cat: 'family', text: 'ขอให้ครอบครัวสุขภาพแข็งแรง อยู่กันพร้อมหน้าทุกปี', by: 'เพื่อนพนักงาน · iCare' },
    { cat: 'health', text: 'ขอให้คุณแม่หายป่วยไว ๆ กลับมาแข็งแรงเหมือนเดิม', by: 'เพื่อนพนักงาน · BaNANA' },
    { cat: 'love',   text: 'ขอให้ความรักของเราสองคนมั่นคงตลอดไป', by: 'เพื่อนพนักงาน · HQ' },
    { cat: 'work',   text: 'ขอให้ได้เลื่อนตำแหน่งตามที่ตั้งใจไว้', by: 'เพื่อนพนักงาน · Studio7' },
    { cat: 'money',  text: 'ขอให้ปลดหนี้บัตรได้ภายในปีหน้า', by: 'ไม่ระบุชื่อ' },
    { cat: 'love',   text: 'ขอให้คนที่แอบชอบหันมามองบ้างสักครั้ง', by: 'ไม่ระบุชื่อ' },
    { cat: 'study',  text: 'ขอให้เรียนจบปริญญาโททันปีนี้', by: 'เพื่อนพนักงาน · HQ' },
    { cat: 'work',   text: 'ขอให้ลูกค้าทุกคนยิ้มกลับบ้าน', by: 'ทีมสาขา · BaNANA' },
    { cat: 'health', text: 'ขอให้ทุกคนในทีมสุขภาพดี ไม่เจ็บไม่ป่วย', by: 'ทีมสาขา · iCare' },
    { cat: 'other',  text: 'ขอให้ได้ไปเที่ยวญี่ปุ่นกับเพื่อน ๆ สักครั้ง', by: 'ไม่ระบุชื่อ' },
    { cat: 'love',   text: 'ขอให้แมวที่บ้านอ้วนท้วนสมบูรณ์ และรักเราที่สุด', by: 'เพื่อนพนักงาน · Studio7' },
    { cat: 'family', text: 'ขอให้ได้พาพ่อแม่ไปเที่ยวทะเลปลายปีนี้', by: 'เพื่อนพนักงาน · BaNANA' },
    { cat: 'work',   text: 'ขอให้โปรเจกต์ใหม่ปล่อยทันกำหนด และไม่มีบั๊ก', by: 'ทีม IT · HQ' },
    { cat: 'study',  text: 'ขอให้ภาษาอังกฤษเก่งขึ้น พูดได้คล่อง ๆ', by: 'ไม่ระบุชื่อ' },
    { cat: 'money',  text: 'ขอให้เก็บเงินดาวน์บ้านได้ครบตามแผน', by: 'เพื่อนพนักงาน · iCare' }
  ]
};
