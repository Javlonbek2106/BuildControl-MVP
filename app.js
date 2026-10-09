/* =========================================================
   BuildControl MVP — qurilish nazorati platformasi (demo)
   Sof HTML / CSS / JavaScript. Ma'lumotlar brauzerda
   (localStorage) saqlanadi, internet talab qilinmaydi.
   ========================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'buildcontrol_mvp_buxoro_v3';
  var SESSION_KEY = 'buildcontrol_mvp_user';

  /* ---------- Lug'atlar ---------- */
  var ROLES = {
    rahbar: 'Rahbar',
    nazorat: 'Texnik nazorat',
    pudratchi: 'Pudratchi',
    admin: 'Administrator'
  };
  var ROLE_DESC = {
    rahbar: 'Barcha obyektlar holati, jadval va byudjet nazorati',
    nazorat: 'Kamchiliklarni qayd etish, tasdiqlash yoki qaytarish',
    pudratchi: 'Vazifalarni bajarish, material kirim va sarfini yuritish',
    admin: "Barcha modullar va tizim holatiga to'liq kirish"
  };

  var STATUS = {
    yangi: { label: 'Yangi', color: '#2F6FDE' },
    ishda: { label: 'Ishda', color: '#B7791F' },
    bartaraf: { label: 'Bartaraf etildi', color: '#7B5BD6' },
    qaytarildi: { label: 'Qaytarildi', color: '#C8423B' },
    tasdiq: { label: 'Tasdiqlandi', color: '#2E8B57' }
  };
  var STATUS_ORDER = ['yangi', 'ishda', 'bartaraf', 'qaytarildi', 'tasdiq'];
  var DEFECT_VERBS = {
    yangi: 'yangi kamchilik qayd etdi',
    ishda: "kamchilik bo'yicha ishni boshladi",
    bartaraf: 'kamchilikni bartaraf etilgan deb belgiladi',
    qaytarildi: 'kamchilikni qayta ishlashga qaytardi',
    tasdiq: 'kamchilik bartaraf etilganini tasdiqladi'
  };

  var SEVERITY = {
    past: 'Past',
    orta: "O'rta",
    yuqori: 'Yuqori',
    kritik: 'Kritik'
  };

  var MATERIALS = [
    { name: 'Sement M400', unit: 'tonna' },
    { name: 'Armatura A500', unit: 'tonna' },
    { name: "G'isht", unit: 'ming dona' },
    { name: 'Beton B25', unit: 'm³' },
    { name: 'Qum', unit: 'm³' },
    { name: 'Shag\'al', unit: 'm³' }
  ];

  /* ---------- Ikonkalar (inline SVG) ---------- */
  var ICONS = {
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    reset: '<path d="M4 4v6h6"/><path d="M20 12a8 8 0 1 1-2.3-5.7L20 9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    hat: '<path d="M3 17h18v2H3z"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 6v4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1"/><path d="M7 14h10v7H7z"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.5 4 2.5 4 6"/>',
    arrowLeft: '<path d="M15 6l-6 6 6 6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-6-6-9 9"/>',
    warn: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16h.01"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>'
  };
  function icon(name, size) {
    size = size || 20;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Yordamchilar ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid(p) { return (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(n) { var d = today(); d.setDate(d.getDate() + n); return d.toISOString(); }
  function pad2(n) { return ('0' + n).slice(-2); }
  // Mahalliy sana (YYYY-MM-DD). toISOString() UTC qaytaradi va UTC+5 da kechagi kunni beradi.
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  function fmtDate(s) {
    if (!s) return '—';
    var d = new Date(s);
    return d.getDate() + '-' + MONTHS[d.getMonth()] + ', ' + d.getFullYear();
  }
  function fmtDateTime(s) {
    var d = new Date(s);
    var year = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '';
    return d.getDate() + '-' + MONTHS[d.getMonth()] + year + ', ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
  function fmtNum(n) {
    var r = Math.round(n * 100) / 100;
    return String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function fmtMoney(n) { return fmtNum(n) + " mln so'm"; }
  function initials(name) {
    var clean = String(name).replace(/["'«»]/g, '').trim().split(/\s+/);
    return ((clean[0] || '')[0] || '') + ((clean[1] || '')[0] || '');
  }
  // Qidiruv uchun: o'zbekcha tutuq belgisining turli yozilishlarini bittaga keltiradi
  function norm(s) { return String(s).toLowerCase().replace(/[ʻʼ’‘`]/g, "'"); }

  /* ---------- Jurnal matnlari (demo ma'lumotlar va ish jarayonida bir xil) ---------- */
  function defectLogText(by, to, title) { return by + ' ' + DEFECT_VERBS[to] + ': «' + title + '»'; }
  function materialLogText(by, type, material, qty, unit) {
    return by + ' material ' + (type === 'kirim' ? 'kirimini' : 'sarfini') + ' kiritdi: ' + material + ' — ' + fmtNum(qty) + ' ' + unit;
  }
  function progressLogText(by, o) { return by + ' bajarilish foizini yangiladi: «' + o.name + '» — ' + o.progress + '%'; }

  /* ---------- Demo ma'lumotlar ---------- */
  function seed() {
    // daysAgo kun oldingi hh:mm; kelajakdagi vaqt chiqib qolmasligi uchun hozirgi vaqt bilan cheklanadi
    function at(daysAgo, hhmm) {
      var d = today(), p = hhmm.split(':');
      d.setDate(d.getDate() - daysAgo);
      d.setHours(Number(p[0]), Number(p[1]));
      return new Date(Math.min(d.getTime(), Date.now() - 5 * 60000)).toISOString();
    }
    var users = [
      { id: 'u1', name: 'Akmal Karimov', role: 'rahbar', title: 'Loyiha boshqarmasi rahbari' },
      { id: 'u2', name: 'Dilshod Rahimov', role: 'nazorat', title: 'Texnik nazorat muhandisi' },
      { id: 'u3', name: 'Sardor Toshmatov', role: 'pudratchi', title: '"Mustahkam Qurilish" MChJ, prorab' },
      { id: 'u4', name: 'Nodira Aliyeva', role: 'admin', title: 'Tizim administratori' }
    ];

    var objects = [
      { id: 'o1', name: '"Yangi Buxoro" turar-joy majmuasi', type: 'Turar-joy binosi', address: "Buxoro sh., Bahouddin Naqshband ko'chasi",
        customer: '"Buxoro Invest Qurilish" DUK', contractor: '"Mustahkam Qurilish" MChJ', start: addDays(-210), end: addDays(150),
        budget: 48500, progress: 61, floors: '9 qavat, 3 blok' },
      { id: 'o2', name: "G'ijduvon tumani 12-maktab rekonstruksiyasi", type: "Ta'lim muassasasi", address: "Buxoro viloyati, G'ijduvon tumani, G'ijduvon shahri",
        customer: "G'ijduvon tumani hokimligi", contractor: '"Mustahkam Qurilish" MChJ', start: addDays(-120), end: addDays(40),
        budget: 12800, progress: 58, floors: '3 qavat' },
      { id: 'o3', name: "Kogon shahar oilaviy poliklinikasi", type: "Sog'liqni saqlash", address: "Buxoro viloyati, Kogon shahri, Mustaqillik ko'chasi",
        customer: "Buxoro viloyati sog'liqni saqlash boshqarmasi", contractor: '"Mustahkam Qurilish" MChJ', start: addDays(-300), end: addDays(20),
        budget: 21400, progress: 93, floors: '2 qavat' },
      { id: 'o4', name: 'Vobkent "Quyoshcha" bolalar bog\'chasi', type: "Maktabgacha ta'lim", address: "Buxoro viloyati, Vobkent tumani, Vobkent shahri",
        customer: 'Vobkent tumani hokimligi', contractor: '"Mustahkam Qurilish" MChJ', start: addDays(-45), end: addDays(260),
        budget: 9600, progress: 12, floors: '2 qavat' }
    ];

    var HIST_TIMES = ['10:20', '09:05', '15:40', '11:15', '08:50', '17:25', '14:30', '09:40', '16:10', '11:45', '10:05', '08:30', '16:45', '12:20', '13:10', '10:35', '09:15'];
    var histCount = 0;
    function hist(daysAgo, by, role, from, to, note) {
      return { at: at(daysAgo, HIST_TIMES[histCount++ % HIST_TIMES.length]), by: by, role: role, from: from, to: to, note: note || '' };
    }
    var defects = [
      { id: 'd1', no: 1, objectId: 'o1', title: "Armatura himoya qatlami yetarli emas", location: 'B-blok, 4-qavat, ustun K-12',
        desc: "Ustun armaturasining beton himoya qatlami 15 mm, loyiha bo'yicha 30 mm bo'lishi kerak.", severity: 'kritik',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(-2), status: 'ishda', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-9),
        history: [hist(9, 'Dilshod Rahimov', 'nazorat', null, 'yangi', 'Ko\'rik vaqtida aniqlandi'), hist(7, 'Sardor Toshmatov', 'pudratchi', 'yangi', 'ishda', 'Brigada biriktirildi')] },
      { id: 'd2', no: 2, objectId: 'o1', title: "G'isht terimida vertikal choklar to'ldirilmagan", location: 'A-blok, 6-qavat, tashqi devor',
        desc: 'Choklarning taxminan 20 foizi qorishma bilan to\'ldirilmagan.', severity: 'orta',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(4), status: 'yangi', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-1),
        history: [hist(1, 'Dilshod Rahimov', 'nazorat', null, 'yangi', '')] },
      { id: 'd3', no: 3, objectId: 'o2', title: "Tom gidroizolyatsiyasida yoriqlar", location: 'Asosiy bino, tom',
        desc: "Gidroizolyatsiya qatlamining choklarida yoriqlar, yomg'irda suv o'tishi xavfi bor.", severity: 'yuqori',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(2), status: 'bartaraf', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-12),
        history: [hist(12, 'Dilshod Rahimov', 'nazorat', null, 'yangi', ''), hist(10, 'Sardor Toshmatov', 'pudratchi', 'yangi', 'ishda', ''), hist(1, 'Sardor Toshmatov', 'pudratchi', 'ishda', 'bartaraf', 'Yoriqlar qayta yopildi, ikki qavat mastika surtildi')] },
      { id: 'd4', no: 4, objectId: 'o2', title: "Elektr kabellari himoya quvurisiz yotqizilgan", location: '2-qavat, yo\'lak',
        desc: "Kabellar gofrirlangan quvursiz suvoq ostiga yotqizilgan.", severity: 'yuqori',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(-5), status: 'qaytarildi', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-20),
        history: [hist(20, 'Dilshod Rahimov', 'nazorat', null, 'yangi', ''), hist(18, 'Sardor Toshmatov', 'pudratchi', 'yangi', 'ishda', ''), hist(8, 'Sardor Toshmatov', 'pudratchi', 'ishda', 'bartaraf', ''), hist(6, 'Dilshod Rahimov', 'nazorat', 'bartaraf', 'qaytarildi', "Faqat bir qismi tuzatilgan, 205-xona hali ochiq")] },
      { id: 'd5', no: 5, objectId: 'o3', title: "Pol plitkalari sathi notekis", location: '1-qavat, qabulxona',
        desc: "Sath farqi 2 metrda 6 mm gacha.", severity: 'past',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(-10), status: 'tasdiq', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-25),
        history: [hist(25, 'Dilshod Rahimov', 'nazorat', null, 'yangi', ''), hist(23, 'Sardor Toshmatov', 'pudratchi', 'yangi', 'ishda', ''), hist(15, 'Sardor Toshmatov', 'pudratchi', 'ishda', 'bartaraf', 'Plitkalar qayta yotqizildi'), hist(13, 'Dilshod Rahimov', 'nazorat', 'bartaraf', 'tasdiq', 'Qabul qilindi')] },
      { id: 'd6', no: 6, objectId: 'o3', title: "Yong'in signalizatsiyasi datchiklari o'rnatilmagan", location: '2-qavat, palatalar',
        desc: "Loyiha bo'yicha 14 ta datchikdan 9 tasi o'rnatilgan.", severity: 'kritik',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(6), status: 'ishda', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(-4),
        history: [hist(4, 'Dilshod Rahimov', 'nazorat', null, 'yangi', ''), hist(3, 'Sardor Toshmatov', 'pudratchi', 'yangi', 'ishda', 'Datchiklar buyurtma qilindi')] },
      { id: 'd7', no: 7, objectId: 'o4', title: "Poydevor qazig'ida suv yig'ilgan", location: 'Qurilish maydoni, shimoliy qism',
        desc: "Drenaj tizimi ishlamayapti, poydevor qazig'ida suv turibdi.", severity: 'orta',
        assignee: '"Mustahkam Qurilish" MChJ', deadline: addDays(3), status: 'yangi', photos: [], fixPhotos: [],
        createdBy: 'Dilshod Rahimov', createdAt: addDays(0),
        history: [hist(0, 'Dilshod Rahimov', 'nazorat', null, 'yangi', '')] }
    ];

    var plans = {
      o1: { 'Sement M400': 820, 'Armatura A500': 410, "G'isht": 1650, 'Beton B25': 5200 },
      o2: { 'Sement M400': 140, 'Armatura A500': 38, "G'isht": 210, 'Beton B25': 480 },
      o3: { 'Sement M400': 260, 'Armatura A500': 95, "G'isht": 520, 'Beton B25': 1350 },
      o4: { 'Sement M400': 190, 'Armatura A500': 70, "G'isht": 380, 'Beton B25': 900 }
    };

    var materials = [];
    // Kirim ertalab, sarf tushdan keyin: bir kunda sarf kirimdan oldin chiqib qolmasligi uchun
    var MAT_TIMES = { kirim: ['08:40', '09:55', '10:30', '11:15', '09:20'], sarf: ['14:10', '15:25', '16:40', '17:20', '13:35', '15:50', '16:15'] };
    var matCount = { kirim: 0, sarf: 0 };
    function m(objectId, name, type, qty, daysAgo, note) {
      var unit = MATERIALS.filter(function (x) { return x.name === name; })[0].unit;
      var times = MAT_TIMES[type], time = times[matCount[type]++ % times.length];
      materials.push({ id: uid('m'), objectId: objectId, material: name, unit: unit, type: type, qty: qty, date: at(daysAgo, time), by: 'Sardor Toshmatov', note: note || '' });
    }
    m('o1', 'Sement M400', 'kirim', 540, 60, 'Qizilqumsement yetkazib berdi'); m('o1', 'Sement M400', 'sarf', 495, 3, 'Karkas ishlari');
    m('o1', 'Armatura A500', 'kirim', 260, 50); m('o1', 'Armatura A500', 'sarf', 248, 5);
    m('o1', "G'isht", 'kirim', 900, 30); m('o1', "G'isht", 'sarf', 830, 2);
    m('o1', 'Beton B25', 'kirim', 3300, 20); m('o1', 'Beton B25', 'sarf', 3300, 20);
    m('o2', 'Sement M400', 'kirim', 110, 40); m('o2', 'Sement M400', 'sarf', 96, 4);
    m('o2', 'Armatura A500', 'kirim', 26, 35); m('o2', 'Armatura A500', 'sarf', 24, 9);
    m('o2', "G'isht", 'kirim', 180, 25); m('o2', "G'isht", 'sarf', 176, 6);
    m('o3', 'Sement M400', 'kirim', 275, 90); m('o3', 'Sement M400', 'sarf', 271, 10, 'Reja bo\'yicha sarfdan oshgan');
    m('o3', 'Armatura A500', 'kirim', 96, 120); m('o3', 'Armatura A500', 'sarf', 94, 60);
    m('o3', 'Beton B25', 'kirim', 1340, 100); m('o3', 'Beton B25', 'sarf', 1335, 70);
    m('o4', 'Sement M400', 'kirim', 30, 10); m('o4', 'Sement M400', 'sarf', 18, 2);
    m('o4', 'Beton B25', 'kirim', 120, 6); m('o4', 'Beton B25', 'sarf', 115, 5, 'Poydevor tayyorgarligi');

    var docs = [
      { id: uid('doc'), objectId: 'o1', name: 'Bosh reja va fasad chizmalari.pdf', kind: 'Loyiha hujjati', size: 4.2, date: at(200, '11:20'), by: 'Nodira Aliyeva' },
      { id: uid('doc'), objectId: 'o1', name: 'Qurilishga ruxsatnoma.pdf', kind: 'Ruxsatnoma', size: 0.6, date: at(215, '15:05'), by: 'Nodira Aliyeva', expires: addDays(400) },
      { id: uid('doc'), objectId: 'o1', name: 'Smeta hisob-kitobi.xlsx', kind: 'Smeta', size: 1.1, date: at(205, '10:40'), by: 'Akmal Karimov' },
      { id: uid('doc'), objectId: 'o2', name: 'Rekonstruksiya loyihasi.pdf', kind: 'Loyiha hujjati', size: 3.4, date: at(125, '09:30'), by: 'Nodira Aliyeva' },
      { id: uid('doc'), objectId: 'o2', name: 'Qurilishga ruxsatnoma.pdf', kind: 'Ruxsatnoma', size: 0.5, date: at(130, '14:15'), by: 'Nodira Aliyeva', expires: addDays(25) },
      { id: uid('doc'), objectId: 'o3', name: 'Ekspertiza xulosasi.pdf', kind: 'Ekspertiza', size: 0.9, date: at(310, '16:00'), by: 'Akmal Karimov' },
      { id: uid('doc'), objectId: 'o4', name: 'Muhandislik-geologik tadqiqot.pdf', kind: 'Loyiha hujjati', size: 2.7, date: at(50, '11:50'), by: 'Nodira Aliyeva' }
    ];

    // Harakatlar jurnali yuqoridagi ma'lumotlardan hosil qilinadi, shuning uchun obyekt tarixi ular bilan mos keladi
    var activity = [];
    function addLog(when, text, objectId) { activity.push({ at: when, text: text, objectId: objectId }); }
    objects.forEach(function (o) {
      addLog(at(daysBetween(o.start, today().toISOString()) + 12, '10:00'), "Akmal Karimov yangi obyekt qo'shdi: «" + o.name + '»', o.id);
    });
    docs.forEach(function (d) { addLog(d.date, d.by + ' hujjat yukladi: «' + d.name + '»', d.objectId); });
    materials.forEach(function (e) { addLog(e.date, materialLogText(e.by, e.type, e.material, e.qty, e.unit), e.objectId); });
    defects.forEach(function (d) {
      d.history.forEach(function (h) { addLog(h.at, defectLogText(h.by, h.to, d.title), d.objectId); });
    });
    [['o1', 3, '18:05'], ['o2', 6, '17:40'], ['o3', 2, '18:20'], ['o4', 4, '17:55']].forEach(function (p) {
      var o = objects.filter(function (x) { return x.id === p[0]; })[0];
      addLog(at(p[1], p[2]), progressLogText('Sardor Toshmatov', o), o.id);
    });
    activity.sort(function (a, b) { return new Date(b.at) - new Date(a.at); });

    return { users: users, objects: objects, defects: defects, plans: plans, materials: materials, docs: docs, acts: [], activity: activity, seq: { defect: 7, act: 0 } };
  }

  /* ---------- Holat (state) ---------- */
  var db;
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { db = JSON.parse(raw); return; }
    } catch (e) { /* storage mavjud emas */ }
    db = seed();
    save();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); return true; }
    catch (e) { toast("Brauzer xotirasi to'ldi. Kichikroq rasm yuklang yoki demo ma'lumotlarni tiklang.", 'err'); return false; }
  }
  var currentUser = null;
  function loadSession() {
    try { var id = sessionStorage.getItem(SESSION_KEY); if (id) currentUser = db.users.filter(function (u) { return u.id === id; })[0] || null; } catch (e) {}
  }
  function setSession(u) {
    currentUser = u;
    try { if (u) sessionStorage.setItem(SESSION_KEY, u.id); else sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  function logActivity(text, objectId) {
    db.activity.unshift({ at: new Date().toISOString(), text: text, objectId: objectId });
    db.activity = db.activity.slice(0, 300);
  }
  // O'zgarishni saqlaydi; xotira to'lsa (masalan, katta rasm) o'zgarishni bekor qilib, ekrandagi holatni saqlangan holat bilan mos qoldiradi
  function commit(undo) {
    if (save()) return true;
    undo();
    return false;
  }

  /* ---------- Hisob-kitoblar ---------- */
  function getObject(id) { return db.objects.filter(function (o) { return o.id === id; })[0]; }
  function getDefect(id) { return db.defects.filter(function (d) { return d.id === id; })[0]; }
  function userByRole(role) { return db.users.filter(function (u) { return u.role === role; })[0]; }
  function isOpen(d) { return d.status !== 'tasdiq'; }
  function isOverdue(d) { return isOpen(d) && new Date(d.deadline) < today(); }
  function plannedProgress(o) {
    var total = daysBetween(o.start, o.end), passed = daysBetween(o.start, today().toISOString());
    if (total <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round(passed / total * 100)));
  }
  // Haqiqiy bajarilish rejadan 10 foiz punktdan ko'proq orqada bo'lsa, obyekt "jadvaldan ortda" hisoblanadi
  function isLagging(progress, planned) { return progress + 10 < planned; }
  function objectState(o) {
    if (o.progress >= 100) return 'done';
    return isLagging(o.progress, plannedProgress(o)) ? 'lag' : 'ok';
  }
  function objectDefects(id) { return db.defects.filter(function (d) { return d.objectId === id; }); }
  function materialSummary(objectId) {
    var plan = db.plans[objectId] || {};
    var rows = {};
    MATERIALS.forEach(function (mt) {
      rows[mt.name] = { name: mt.name, unit: mt.unit, plan: plan[mt.name] || 0, kirim: 0, sarf: 0 };
    });
    db.materials.forEach(function (e) {
      if (e.objectId !== objectId) return;
      if (!rows[e.material]) rows[e.material] = { name: e.material, unit: e.unit, plan: 0, kirim: 0, sarf: 0 };
      rows[e.material][e.type] += Number(e.qty) || 0;
    });
    return Object.keys(rows).map(function (k) { return rows[k]; }).filter(function (r) { return r.plan || r.kirim || r.sarf; });
  }
  function materialAlerts() {
    var out = [];
    db.objects.forEach(function (o) {
      var prog = o.progress;
      materialSummary(o.id).forEach(function (r) {
        if (!r.plan) return;
        var usedPct = r.sarf / r.plan * 100;
        if (r.sarf > r.plan) out.push({ o: o, r: r, text: 'smetadan ' + fmtNum(r.sarf - r.plan) + ' ' + r.unit + ' ortiq sarflangan' });
        else if (usedPct > prog + 15) out.push({ o: o, r: r, text: 'sarf ' + Math.round(usedPct) + '%, bajarilish esa ' + prog + '%' });
      });
    });
    return out;
  }

  /* ---------- Rol bo'yicha ruxsatlar ---------- */
  function can(action) {
    var r = currentUser ? currentUser.role : '';
    var map = {
      createObject: ['admin', 'rahbar'],
      editProgress: ['admin', 'rahbar', 'pudratchi'],
      createDefect: ['admin', 'nazorat'],
      addMaterial: ['admin', 'pudratchi'],
      uploadDoc: ['admin', 'rahbar', 'pudratchi', 'nazorat'],
      createAct: ['admin', 'nazorat', 'rahbar']
    };
    return (map[action] || []).indexOf(r) >= 0;
  }
  function defectActions(d) {
    var r = currentUser.role, a = [];
    var isContractor = r === 'pudratchi' || r === 'admin';
    var isInspector = r === 'nazorat' || r === 'admin';
    if (isContractor && (d.status === 'yangi' || d.status === 'qaytarildi')) a.push({ to: 'ishda', label: 'Ishni boshlash', cls: 'btn-dark' });
    if (isContractor && d.status === 'ishda') a.push({ to: 'bartaraf', label: 'Bartaraf etildi', cls: 'btn-primary', photo: true });
    if (isInspector && d.status === 'bartaraf') {
      a.push({ to: 'tasdiq', label: 'Tasdiqlash', cls: 'btn-ok' });
      a.push({ to: 'qaytarildi', label: 'Qaytarish', cls: 'btn-danger', needNote: true });
    }
    return a;
  }

  /* ---------- UI: toast, modal ---------- */
  function toast(msg, kind) {
    var root = $('#toast-root');
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || 'ok');
    el.innerHTML = icon(kind === 'err' ? 'warn' : 'check', 18) + '<span>' + esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(function () { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; }, 2800);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
  }
  function openModal(opts) {
    var root = $('#modal-root');
    root.innerHTML =
      '<div class="modal-bg" data-close="bg"><div class="modal ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(opts.title) + '</h3><button class="x" data-close="x" aria-label="Yopish">' + icon('x', 18) + '</button></div>' +
      '<div class="modal-body">' + opts.body + '</div>' +
      (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') +
      '</div></div>';
    var bg = $('.modal-bg', root);
    bg.addEventListener('mousedown', function (e) { if (e.target === bg) closeModal(); });
    $('[data-close="x"]', root).addEventListener('click', closeModal);
    if (opts.onMount) opts.onMount($('.modal', root));
  }
  function closeModal() { $('#modal-root').innerHTML = ''; }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var lb = $('.lightbox'); if (lb) { lb.parentNode.removeChild(lb); return; }
      closeModal();
    }
  });
  function lightbox(src) {
    var el = document.createElement('div');
    el.className = 'lightbox';
    el.innerHTML = '<img src="' + src + '" alt="Kattalashtirilgan rasm">';
    el.addEventListener('click', function () { el.parentNode.removeChild(el); });
    document.body.appendChild(el);
  }

  /* Rasmni siqish (xotira tejash uchun) */
  function readImage(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1000, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = function () { toast('Rasmni o\'qib bo\'lmadi', 'err'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Komponentlar ---------- */
  function statusBadge(s) { return '<span class="badge st-' + s + '">' + esc(STATUS[s].label) + '</span>'; }
  function sevTag(s) { return '<span class="tag sev-' + s + '">' + esc(SEVERITY[s]) + '</span>'; }
  function progressBar(o) {
    var st = objectState(o), plan = plannedProgress(o);
    return '<div class="prog ' + st + '" title="Haqiqiy: ' + o.progress + '%, reja: ' + plan + '%"><span style="width:' + o.progress + '%"></span><i class="plan" style="left:calc(' + plan + '% - 1px)"></i></div>';
  }
  function deadlineText(d) {
    var left = daysBetween(today().toISOString(), d.deadline);
    if (!isOpen(d)) return '<span class="muted">' + fmtDate(d.deadline) + '</span>';
    if (left < 0) return '<span class="overdue">' + Math.abs(left) + ' kun kechikdi</span>';
    if (left === 0) return '<span class="overdue">Bugun</span>';
    return '<span>' + left + ' kun qoldi</span>';
  }
  function avatar(u) { return '<span class="avatar r-' + u.role + '">' + esc(initials(u.name)) + '</span>'; }
  function brand() { return '<div class="brand"><span class="brand-mark">' + icon('hat', 20) + '</span>BuildControl</div>'; }

  /* =========================================================
     ROUTER
     ========================================================= */
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'dashboard';
    var parts = h.split('/');
    return { name: parts[0], id: parts[1] || null, tab: parts[2] || null };
  }
  function go(path) { location.hash = '#/' + path; }
  window.addEventListener('hashchange', render);

  /* ---------- Login ---------- */
  function renderLogin() {
    var html =
      '<div class="login">' +
      '<section class="login-hero">' + brand() +
      '<div><div class="eyebrow">QURILISHNI RAQAMLASHTIRISH</div><h1>Har bir obyekt — nazorat ostida</h1>' +
      '<p>Loyihalashdan ekspluatatsiyagacha bo\'lgan barcha jarayonlar yagona raqamli tizimda: hujjatlar, dala nazorati, materiallar va hisobotlar.</p></div>' +
      '<div class="login-foot">MVP demo versiya · Ma\'lumotlar shu brauzerda saqlanadi</div></section>' +
      '<section class="login-panel"><h2>Tizimga kirish</h2><p class="muted">Demo uchun rolni tanlang:</p><div class="role-list">' +
      db.users.map(function (u) {
        return '<button class="role-btn r-' + u.role + '" data-user="' + u.id + '">' + avatar(u) + '<span><b>' + esc(u.name) + ' · ' + esc(ROLES[u.role]) + '</b><small>' + esc(u.title) + '</small><em>' + esc(ROLE_DESC[u.role]) + '</em></span></button>';
      }).join('') +
      '</div></section></div>';
    $('#app').innerHTML = html;
    $all('[data-user]').forEach(function (b) {
      b.addEventListener('click', function () {
        setSession(db.users.filter(function (u) { return u.id === b.getAttribute('data-user'); })[0]);
        if (!location.hash || location.hash === '#/') go('dashboard'); else render();
      });
    });
  }

  /* ---------- Shell ---------- */
  var NAV = [
    { id: 'dashboard', label: 'Boshqaruv paneli', short: 'Panel', icon: 'chart', roles: ['rahbar', 'nazorat', 'pudratchi', 'admin'] },
    { id: 'objects', label: 'Obyektlar', short: 'Obyektlar', icon: 'building', roles: ['rahbar', 'nazorat', 'pudratchi', 'admin'] },
    { id: 'defects', label: 'Kamchiliklar', short: 'Kamchilik', icon: 'alert', roles: ['rahbar', 'nazorat', 'pudratchi', 'admin'] },
    { id: 'materials', label: 'Materiallar', short: 'Material', icon: 'box', roles: ['rahbar', 'pudratchi', 'admin'] },
    { id: 'acts', label: 'Dalolatnomalar', short: 'Hujjatlar', icon: 'file', roles: ['rahbar', 'nazorat', 'admin'] }
  ];
  function allowed(page) {
    var item = NAV.filter(function (n) { return n.id === page; })[0];
    return !item || item.roles.indexOf(currentUser.role) >= 0;
  }
  function shell(title, content) {
    var r = route();
    var openCount = db.defects.filter(isOpen).length;
    var nav = NAV.filter(function (n) { return allowed(n.id); }).map(function (n) {
      var active = r.name === n.id ? ' active' : '';
      var count = n.id === 'defects' ? '<span class="count">' + openCount + '</span>' : (n.id === 'objects' ? '<span class="count">' + db.objects.length + '</span>' : '');
      return '<a class="nav-link' + active + '" href="#/' + n.id + '">' + icon(n.icon) + '<span class="lbl-long">' + n.label + '</span><span class="lbl-short">' + n.short + '</span>' + count + '</a>';
    }).join('');
    var roleOpts = db.users.map(function (u) {
      return '<option value="' + u.id + '"' + (u.id === currentUser.id ? ' selected' : '') + '>' + esc(ROLES[u.role]) + ' — ' + esc(u.name) + '</option>';
    }).join('');
    return '<div class="shell r-' + currentUser.role + '">' +
      '<aside class="sidebar">' + brand() + nav +
      '<div class="sidebar-foot"><button id="btn-reset">' + icon('reset', 16) + 'Demo ma\'lumotlarni tiklash</button>' +
      '<button data-logout>' + icon('logout', 16) + 'Chiqish</button></div></aside>' +
      '<div class="main"><header class="topbar"><div class="crumbs">' + esc(title) + '</div><div class="spacer"></div>' +
      '<label class="demo-switch" title="Taqdimot vaqtida rollarni tez almashtirish uchun">' + icon('users', 16) + '<span>Rol:</span><select id="role-switch">' + roleOpts + '</select></label>' +
      '<div class="me">' + avatar(currentUser) + '<div><b>' + esc(currentUser.name) + '</b><small>' + esc(ROLES[currentUser.role]) + '</small></div></div>' +
      '<button class="icon-btn" data-logout title="Chiqish" aria-label="Chiqish">' + icon('logout', 18) + '</button></header>' +
      '<main class="page">' + content + '</main></div></div>';
  }
  function bindShell() {
    $('#role-switch').addEventListener('change', function (e) {
      setSession(db.users.filter(function (u) { return u.id === e.target.value; })[0]);
      toast('Rol almashtirildi: ' + ROLES[currentUser.role]);
      render();
    });
    $all('[data-logout]').forEach(function (b) { b.addEventListener('click', function () { setSession(null); render(); }); });
    $('#btn-reset').addEventListener('click', function () {
      if (!confirm("Barcha kiritilgan o'zgarishlar o'chirilib, boshlang'ich demo ma'lumotlar tiklanadi. Davom etasizmi?")) return;
      db = seed(); save();
      defectFilter = { status: 'all', object: 'all' };
      matObject = null;
      toast('Demo ma\'lumotlar tiklandi'); render();
    });
  }

  /* ---------- Dashboard (har bir rol o'z ko'rinishini oladi) ---------- */
  function pageDashboard() {
    var role = currentUser.role;
    if (role === 'nazorat') return dashboardNazorat();
    if (role === 'pudratchi') return dashboardPudratchi();
    if (role === 'admin') return dashboardAdmin();
    return dashboardRahbar('Barcha obyektlar holati');
  }
  function kpi(ic, cls, val, lbl, sub) {
    return '<div class="card kpi"><div class="kpi-ic ' + cls + '">' + icon(ic, 24) + '</div><div><div class="val">' + val + '</div><div class="lbl"><b>' + esc(lbl) + '</b><br>' + esc(sub) + '</div></div></div>';
  }
  function dashboardHead(sub) {
    return '<div class="page-head"><div><h1>Assalomu alaykum, ' + esc(currentUser.name.split(' ')[0]) + '!</h1><div class="sub">' + esc(sub) + ' · ' + fmtDate(today().toISOString()) + '</div></div>' +
      '<div class="actions">' + (can('createDefect') ? '<button class="btn btn-primary" data-act="new-defect">' + icon('camera', 18) + 'Kamchilik qayd etish</button>' : '') + '</div></div>';
  }
  function feedHtml(list, emptyText) {
    if (!list.length) return '<div class="empty">' + esc(emptyText) + '</div>';
    return '<ul class="feed">' + list.map(function (a) {
      return '<li><span class="dot"></span><div>' + esc(a.text) + '<time>' + fmtDateTime(a.at) + '</time></div></li>';
    }).join('') + '</ul>';
  }
  function activityCard() {
    return '<div class="card"><div class="card-head"><h3>So\'nggi harakatlar</h3></div>' + feedHtml(db.activity.slice(0, 8), 'Harakatlar hali yo\'q') + '</div>';
  }
  function defectListCard(title, list, emptyText, linkAll) {
    var body = list.length ? '<ul class="feed up-list">' + list.map(function (d) {
      return '<li class="click" data-defect="' + d.id + '"><div style="min-width:0;flex:1"><b>' + esc(d.title) + '</b><time>' + esc(getObject(d.objectId).name) + '</time><div class="row wrap" style="margin-top:6px;justify-content:space-between">' + statusBadge(d.status) + '<span class="small">' + deadlineText(d) + '</span></div></div></li>';
    }).join('') + '</ul>' : '<div class="empty">' + esc(emptyText) + '</div>';
    return '<div class="card"><div class="card-head"><h3>' + esc(title) + '</h3>' + (linkAll ? '<a class="right small" href="#/defects">Barchasi</a>' : '') + '</div>' + body + '</div>';
  }
  function objectProgressList() {
    return db.objects.map(function (o) {
      var od = objectDefects(o.id).filter(isOpen).length;
      return '<div class="obj-prog" data-obj="' + o.id + '"><div class="nm">' + esc(o.name) + '</div><div class="pct">' + o.progress + '%</div>' +
        '<div style="grid-column:1/-1">' + progressBar(o) + '</div>' +
        '<div class="meta"><span>Reja: ' + plannedProgress(o) + '%</span><span>Topshirish: ' + fmtDate(o.end) + '</span><span>Ochiq kamchilik: ' + od + '</span>' +
        (objectState(o) === 'lag' ? '<span class="overdue">Jadvaldan ortda</span>' : '') + '</div></div>';
    }).join('');
  }
  function progressCard(withLegend) {
    var legend = withLegend ? '<div class="right legend"><span><i style="background:#2F6FDE"></i>Haqiqiy</span><span><i style="background:#E8833A"></i>Ortda</span><span><i style="background:#14213D;width:3px"></i>Reja</span></div>' : '';
    return '<div class="card"><div class="card-head"><h3>Obyektlar bo\'yicha bajarilish</h3>' + legend + '</div>' + objectProgressList() + '</div>';
  }
  function defectStatusCard() {
    var max = 1;
    var counts = STATUS_ORDER.map(function (s) { var c = db.defects.filter(function (d) { return d.status === s; }).length; if (c > max) max = c; return { s: s, c: c }; });
    var bars = counts.map(function (x) {
      return '<div class="bar-row"><span>' + esc(STATUS[x.s].label) + '</span><div class="track"><span style="width:' + (x.c / max * 100) + '%;background:' + STATUS[x.s].color + '"></span></div><b>' + x.c + '</b></div>';
    }).join('');
    var open = db.defects.filter(isOpen);
    var sev = ['kritik', 'yuqori', 'orta', 'past'].map(function (k) {
      return '<span class="tag sev-' + k + '">' + esc(SEVERITY[k]) + ': ' + open.filter(function (d) { return d.severity === k; }).length + '</span>';
    }).join('');
    return '<div class="card"><div class="card-head"><h3>Kamchiliklar holati</h3></div><div class="bars">' + bars + '</div>' +
      '<div class="sev-row"><span class="small muted">Ochiq kamchiliklar darajasi bo\'yicha</span><div class="row wrap">' + sev + '</div></div></div>';
  }
  function materialAlertsCard() {
    var alerts = materialAlerts();
    var body = alerts.length ? '<ul class="feed">' + alerts.slice(0, 5).map(function (a) {
      return '<li><span class="dot" style="background:#C8423B"></span><div><b>' + esc(a.r.name) + '</b> — ' + esc(a.o.name) + '<time>' + esc(a.text) + '</time></div></li>';
    }).join('') + '</ul>' : '<div class="empty">Materiallar sarfida og\'ish yo\'q</div>';
    return '<div class="card"><div class="card-head"><h3>Materiallar bo\'yicha ogohlantirish</h3></div>' + body + '</div>';
  }
  function usersCard() {
    var rows = db.users.map(function (u) {
      return '<div class="person">' + avatar(u) + '<div><b>' + esc(u.name) + '</b><small>' + esc(ROLES[u.role]) + ' · ' + esc(u.title) + '</small></div></div>';
    }).join('');
    return '<div class="card"><div class="card-head"><h3>Foydalanuvchilar va rollar</h3><span class="right small muted">' + db.users.length + ' ta</span></div><div class="card-pad people">' + rows + '</div></div>';
  }
  function storageCard() {
    var used = 0;
    try { used = (localStorage.getItem(STORAGE_KEY) || '').length; } catch (e) { /* storage mavjud emas */ }
    var pct = Math.min(100, Math.round(used / (5 * 1024 * 1024) * 100));
    var photos = db.defects.reduce(function (s, d) { return s + d.photos.length + d.fixPhotos.length; }, 0);
    var files = db.docs.filter(function (d) { return d.data; }).length;
    return '<div class="card"><div class="card-head"><h3>Brauzer xotirasi</h3></div><div class="card-pad grid" style="gap:14px">' +
      '<div class="row" style="justify-content:space-between"><span class="muted">Ishlatilgan</span><b>' + fmtNum(Math.round(used / 1024)) + ' KB · ~' + pct + '%</b></div>' +
      '<div class="prog' + (pct > 80 ? ' lag' : '') + '"><span style="width:' + Math.max(pct, 1) + '%"></span></div>' +
      '<div class="info-grid">' + info('Rasmlar', photos + ' ta') + info('Saqlangan fayllar', files + ' ta') +
      info('Dalolatnoma va hisobotlar', db.acts.length + ' ta') + info('Harakatlar jurnali', db.activity.length + ' ta yozuv') + '</div>' +
      '<p class="small muted">Ma\'lumotlar faqat shu brauzerda saqlanadi (chegara taxminan 5 MB). Xotira to\'lsa, yangi rasm va fayllar saqlanmaydi.</p></div></div>';
  }

  function dashboardRahbar(sub) {
    var objs = db.objects;
    var lag = objs.filter(function (o) { return objectState(o) === 'lag'; }).length;
    var open = db.defects.filter(isOpen);
    var overdue = db.defects.filter(isOverdue);
    var budget = objs.reduce(function (s, o) { return s + o.budget; }, 0);

    var kpis =
      '<div class="grid g-4">' +
      kpi('building', '', objs.length, 'Faol obyektlar', fmtMoney(budget) + ' umumiy qiymat') +
      kpi('check', 'green', objs.length - lag, 'Jadval bo\'yicha', 'reja bilan bir xil yoki oldinda') +
      kpi('clock', 'red', lag, 'Jadvaldan ortda', 'rejadan 10% dan ko\'p orqada') +
      kpi('alert', 'blue', open.length, 'Ochiq kamchiliklar', overdue.length + ' tasining muddati o\'tgan') +
      '</div>';

    var upcoming = open.slice().sort(byDeadline).slice(0, 5);

    return dashboardHead(sub) +
      kpis +
      '<div class="grid g-main">' + progressCard(true) + defectStatusCard() + '</div>' +
      '<div class="grid g-3">' +
      defectListCard('Muddati yaqin kamchiliklar', upcoming, 'Ochiq kamchilik yo\'q', true) +
      materialAlertsCard() +
      activityCard() +
      '</div>';
  }

  function dashboardAdmin() {
    return dashboardRahbar('Tizim va barcha obyektlar holati') +
      '<div class="grid g-2">' + usersCard() + storageCard() + '</div>';
  }

  function byDeadline(a, b) { return new Date(a.deadline) - new Date(b.deadline); }

  function dashboardNazorat() {
    var open = db.defects.filter(isOpen);
    var overdue = db.defects.filter(isOverdue).sort(byDeadline);
    var awaiting = db.defects.filter(function (d) { return d.status === 'bartaraf'; }).sort(byDeadline);
    var weekAgo = today(); weekAgo.setDate(weekAgo.getDate() - 7);
    var recent = db.defects.filter(function (d) { return new Date(d.createdAt) >= weekAgo; }).length;

    var kpis =
      '<div class="grid g-4">' +
      kpi('alert', 'blue', open.length, 'Ochiq kamchiliklar', 'barcha obyektlar bo\'yicha') +
      kpi('check', 'green', awaiting.length, 'Tasdiq kutilmoqda', 'pudratchi bartaraf etdi — tekshiring') +
      kpi('clock', 'red', overdue.length, 'Muddati o\'tgan', 'darhol e\'tibor talab qiladi') +
      kpi('camera', '', recent, 'So\'nggi 7 kunda', 'yangi qayd etilgan kamchilik') +
      '</div>';

    return dashboardHead('Dala nazorati holati') +
      kpis +
      '<div class="grid g-main">' +
      defectListCard('Tasdiqlash kutilayotgan kamchiliklar', awaiting, 'Tasdiq kutayotgan kamchilik yo\'q', false) +
      defectStatusCard() +
      '</div>' +
      '<div class="grid g-2">' +
      defectListCard('Muddati o\'tgan kamchiliklar', overdue.slice(0, 5), 'Muddati o\'tgan kamchilik yo\'q', true) +
      activityCard() +
      '</div>';
  }

  function dashboardPudratchi() {
    var toStart = db.defects.filter(function (d) { return d.status === 'yangi' || d.status === 'qaytarildi'; });
    var inWork = db.defects.filter(function (d) { return d.status === 'ishda'; });
    var myTasks = toStart.concat(inWork).sort(byDeadline);
    // "Bartaraf etildi" holatidagilar pudratchi uchun yakunlangan (nazorat tasdig'ini kutadi), shuning uchun kechikkanlarga kirmaydi
    var overdue = myTasks.filter(isOverdue);
    var alerts = materialAlerts().length;

    var kpis =
      '<div class="grid g-4">' +
      kpi('alert', 'blue', toStart.length, 'Boshlanishi kerak', 'yangi yoki qaytarilgan kamchiliklar') +
      kpi('hat', '', inWork.length, 'Ishda', 'hozir bajarilmoqda') +
      kpi('clock', 'red', overdue.length, 'Muddati o\'tgan', 'darhol bartaraf etish kerak') +
      kpi('box', alerts ? 'red' : 'green', alerts, 'Material ogohlantirishi', 'smeta yoki sarf me\'yoridan og\'ish') +
      '</div>';

    return dashboardHead('Sizning vazifalaringiz') +
      kpis +
      '<div class="grid g-main">' +
      defectListCard('Sizning vazifalaringiz', myTasks, 'Hozircha vazifa yo\'q', true) +
      progressCard(false) +
      '</div>' +
      '<div class="grid g-2">' + materialAlertsCard() + activityCard() + '</div>';
  }

  /* ---------- Obyektlar ---------- */
  function pageObjects() {
    var cards = db.objects.map(function (o) {
      var ds = objectDefects(o.id), open = ds.filter(isOpen).length, od = ds.filter(isOverdue).length;
      var left = daysBetween(today().toISOString(), o.end);
      return '<div class="card obj-card" data-obj="' + o.id + '"><div class="top"><div class="obj-ic">' + icon('building', 22) + '</div><div><h3>' + esc(o.name) + '</h3><div class="addr">' + esc(o.address) + '</div></div></div>' +
        '<div><div class="row" style="justify-content:space-between;margin-bottom:6px"><span class="small muted">Bajarilish (reja ' + plannedProgress(o) + '%)</span><b>' + o.progress + '%</b></div>' + progressBar(o) + '</div>' +
        '<div class="obj-stats"><span>Kamchilik: <b>' + open + '</b> ochiq' + (od ? ', <span class="overdue">' + od + ' kechikkan</span>' : '') + '</span><span>Topshirish: <b>' + (left >= 0 ? left + ' kun' : 'muddat o\'tgan') + '</b></span><span>Qiymati: <b>' + fmtMoney(o.budget) + '</b></span></div></div>';
    }).join('');
    return '<div class="page-head"><div><h1>Obyektlar</h1><div class="sub">Har bir obyektning raqamli pasporti</div></div><div class="actions">' +
      (can('createObject') ? '<button class="btn btn-primary" data-act="new-object">' + icon('plus', 18) + 'Yangi obyekt</button>' : '') + '</div></div>' +
      '<div class="grid g-2">' + cards + '</div>';
  }

  function pageObject(id, tab) {
    var o = getObject(id);
    if (!o) return '<div class="empty">Obyekt topilmadi. <a href="#/objects">Obyektlar ro\'yxatiga qaytish</a></div>';
    tab = tab || 'passport';
    var tabs = [['passport', 'Pasport'], ['defects', 'Kamchiliklar'], ['materials', 'Materiallar'], ['docs', 'Hujjatlar'], ['history', 'Tarix']];
    var tabHtml = tabs.map(function (t) { return '<button class="tab' + (t[0] === tab ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var body = '';
    if (tab === 'passport') body = objectPassport(o);
    if (tab === 'defects') body = defectTable(objectDefects(o.id), true);
    if (tab === 'materials') body = '<div class="card-pad">' + materialsBlock(o.id) + '</div>';
    if (tab === 'docs') body = docsBlock(o);
    if (tab === 'history') body = feedHtml(db.activity.filter(function (a) { return a.objectId === o.id; }), 'Bu obyekt bo\'yicha harakatlar hali qayd etilmagan');
    return '<div class="page-head"><div><a href="#/objects" class="small muted row" style="text-decoration:none;gap:4px;margin-bottom:6px">' + icon('arrowLeft', 16) + 'Obyektlar</a><h1>' + esc(o.name) + '</h1><div class="sub row">' + icon('pin', 16) + esc(o.address) + '</div></div>' +
      '<div class="actions">' + (can('createDefect') ? '<button class="btn" data-act="new-defect" data-objid="' + o.id + '">' + icon('camera', 18) + 'Kamchilik</button>' : '') +
      (can('createAct') ? '<button class="btn btn-primary" data-act="new-act" data-objid="' + o.id + '">' + icon('file', 18) + 'Dalolatnoma</button>' : '') + '</div></div>' +
      '<div class="card"><div class="tabs">' + tabHtml + '</div>' + body + '</div>';
  }

  function objectPassport(o) {
    var plan = plannedProgress(o);
    var ds = objectDefects(o.id);
    var inspector = userByRole('nazorat');
    var contractorUser = userByRole('pudratchi');
    var leader = userByRole('rahbar');
    var editable = can('editProgress');
    return '<div class="card-pad grid g-main">' +
      '<div class="grid" style="gap:22px">' +
      '<div class="info-grid">' +
      info('Obyekt turi', o.type) + info('Tavsif', o.floors || '—') +
      info('Buyurtmachi', o.customer) + info('Bosh pudratchi', o.contractor) +
      info('Qurilish boshlangan', fmtDate(o.start)) + info('Topshirish muddati', fmtDate(o.end)) +
      info('Loyiha qiymati', fmtMoney(o.budget)) + info('Kamchiliklar', ds.length + ' ta (' + ds.filter(isOpen).length + ' ochiq)') +
      '</div>' +
      '<div class="action-box"><div class="row" style="justify-content:space-between"><h4>Bajarilish foizi</h4><span class="small muted">Reja bo\'yicha bugun: <b>' + plan + '%</b></span></div>' +
      progressBar(o) +
      (editable ? '<div class="row wrap"><input type="range" min="0" max="100" value="' + o.progress + '" id="prog-range" style="flex:1;min-width:180px"><b id="prog-val" style="width:48px;text-align:right">' + o.progress + '%</b><button class="btn btn-dark btn-sm" id="prog-save" data-objid="' + o.id + '">Saqlash</button></div>'
        : '<p class="small muted">Haqiqiy bajarilish: <b>' + o.progress + '%</b>. Foizni pudratchi yoki rahbar yangilaydi.</p>') +
      '</div></div>' +
      '<div><h4 style="margin-bottom:10px">Mas\'ul shaxslar</h4><div class="people">' +
      person(leader, 'Buyurtmachi tomonidan loyiha rahbari') +
      person(inspector, 'Texnik nazorat') +
      person(contractorUser, o.contractor) +
      '</div></div></div>';
  }
  function info(k, v) { return '<div><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div></div>'; }
  function person(u, sub) { return u ? '<div class="person">' + avatar(u) + '<div><b>' + esc(u.name) + '</b><small>' + esc(sub) + '</small></div></div>' : ''; }

  function docsBlock(o) {
    var docs = db.docs.filter(function (d) { return d.objectId === o.id; });
    var rows = docs.map(function (d) {
      var exp = '';
      if (d.expires) {
        var left = daysBetween(today().toISOString(), d.expires);
        exp = left < 0 ? '<span class="overdue">Muddati tugagan</span>'
          : left < 30 ? '<span class="overdue">' + (left === 0 ? 'Bugun tugaydi' : left + ' kunda tugaydi') + '</span>'
          : '<span class="muted">' + fmtDate(d.expires) + ' gacha</span>';
      }
      return '<tr><td><div class="cell-title"><span class="thumb">' + icon('file', 20) + '</span><div><b>' + esc(d.name) + '</b><small>' + esc(d.kind) + ' · ' + d.size + ' MB</small></div></div></td><td>' + esc(d.by) + '</td><td>' + fmtDate(d.date) + '</td><td>' + (exp || '—') + '</td><td class="num">' +
        (d.data ? '<a class="btn btn-sm" href="' + esc(d.data) + '" download="' + esc(d.name) + '">' + icon('download', 14) + 'Ochish</a>'
          : '<span class="small muted" title="MVP versiyada 400 KB dan katta fayllarning faqat nomi va hajmi saqlanadi">Brauzerda saqlanmagan</span>') + '</td></tr>';
    }).join('');
    var acts = db.acts.filter(function (a) { return a.objectId === o.id; });
    return '<div class="card-pad grid" style="gap:16px">' +
      (can('uploadDoc') ? '<label class="drop">' + icon('upload', 24) + '<b>Hujjat yuklash</b><span class="small">PDF, Excel, rasm — bir nechta faylni tanlash mumkin (400 KB gacha fayllar brauzerda saqlanadi)</span><input type="file" id="doc-input" data-objid="' + o.id + '" multiple></label>' : '') +
      (docs.length ? '<div class="table-wrap"><table class="tbl"><thead><tr><th>Hujjat</th><th>Yuklagan</th><th>Sana</th><th>Amal qilish</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty">Hujjatlar hali yuklanmagan</div>') +
      '<div><h4 style="margin-bottom:10px">Dalolatnoma va hisobotlar</h4>' + (acts.length ? actTable(acts) : '<div class="empty">Bu obyekt bo\'yicha hali hujjat tuzilmagan</div>') + '</div>' +
      '</div>';
  }

  /* ---------- Kamchiliklar ---------- */
  var defectFilter = { status: 'all', object: 'all' };
  function pageDefects() {
    var chips = [['all', 'Barchasi'], ['open', 'Ochiq'], ['overdue', 'Kechikkan']].concat(STATUS_ORDER.map(function (s) { return [s, STATUS[s].label]; }));
    var list = filteredDefects();
    var chipHtml = chips.map(function (c) {
      var n = countFor(c[0]);
      return '<button class="chip' + (defectFilter.status === c[0] ? ' active' : '') + '" data-filter="' + c[0] + '">' + c[1] + '<span class="n">' + n + '</span></button>';
    }).join('');
    var objOpts = '<option value="all">Barcha obyektlar</option>' + db.objects.map(function (o) { return '<option value="' + o.id + '"' + (defectFilter.object === o.id ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('');
    return '<div class="page-head"><div><h1>Kamchiliklar</h1><div class="sub">Dala nazorati: aniqlash → vazifa → bartaraf etish → tasdiqlash</div></div><div class="actions">' +
      (can('createDefect') ? '<button class="btn btn-primary" data-act="new-defect">' + icon('camera', 18) + 'Kamchilik qayd etish</button>' : '') + '</div></div>' +
      '<div class="row wrap" style="justify-content:space-between"><div class="filters">' + chipHtml + '</div><select class="input" id="obj-filter" style="max-width:320px">' + objOpts + '</select></div>' +
      '<div class="card">' + defectTable(list, false) + '</div>';
  }
  function countFor(f) {
    return db.defects.filter(function (d) {
      if (defectFilter.object !== 'all' && d.objectId !== defectFilter.object) return false;
      return matchStatus(d, f);
    }).length;
  }
  function matchStatus(d, f) {
    if (f === 'all') return true;
    if (f === 'open') return isOpen(d);
    if (f === 'overdue') return isOverdue(d);
    return d.status === f;
  }
  function filteredDefects() {
    return db.defects.filter(function (d) {
      if (defectFilter.object !== 'all' && d.objectId !== defectFilter.object) return false;
      return matchStatus(d, defectFilter.status);
    }).sort(function (a, b) {
      if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  function defectTable(list, inObject) {
    if (!list.length) return '<div class="empty">Kamchiliklar topilmadi</div>';
    var rows = list.map(function (d) {
      var o = getObject(d.objectId);
      var th = d.photos && d.photos.length ? '<img class="thumb" src="' + d.photos[0] + '" alt="">' : '<span class="thumb">' + icon('image', 20) + '</span>';
      return '<tr class="click" data-defect="' + d.id + '"><td><div class="cell-title">' + th + '<div><b>#' + d.no + ' ' + esc(d.title) + '</b><small>' + esc(inObject ? d.location : (o ? o.name : '') + ' · ' + d.location) + '</small></div></div></td>' +
        '<td>' + sevTag(d.severity) + '</td><td>' + statusBadge(d.status) + '</td><td class="num">' + deadlineText(d) + '</td></tr>';
    }).join('');
    return '<div class="table-wrap"><table class="tbl"><thead><tr><th>Kamchilik</th><th>Darajasi</th><th>Holati</th><th class="num">Muddat</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function openNewDefect(objectId) {
    var photos = [];
    var objOpts = db.objects.map(function (o) { return '<option value="' + o.id + '"' + (o.id === objectId ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('');
    var sevOpts = Object.keys(SEVERITY).map(function (k) { return '<option value="' + k + '"' + (k === 'orta' ? ' selected' : '') + '>' + SEVERITY[k] + '</option>'; }).join('');
    openModal({
      title: 'Yangi kamchilik qayd etish',
      body:
        '<div class="form-grid">' +
        '<div class="field full"><label>Obyekt</label><select class="input" id="f-obj">' + objOpts + '</select></div>' +
        '<div class="field full"><label>Kamchilik nomi *</label><input class="input" id="f-title" placeholder="Masalan: devorda yoriq paydo bo\'lgan"></div>' +
        '<div class="field"><label>Joylashuvi</label><input class="input" id="f-loc" placeholder="Blok, qavat, xona"></div>' +
        '<div class="field"><label>Darajasi</label><select class="input" id="f-sev">' + sevOpts + '</select></div>' +
        '<div class="field"><label>Bartaraf etish muddati</label><input type="date" class="input" id="f-deadline" min="' + iso(today()) + '" value="' + iso(new Date(addDays(7))) + '"></div>' +
        '<div class="field"><label>Mas\'ul</label><input class="input" id="f-assignee" readonly></div>' +
        '<div class="field full"><label>Izoh</label><textarea class="input" id="f-desc" placeholder="Nima aniqlandi, me\'yor qanday bo\'lishi kerak"></textarea></div>' +
        '<div class="field full"><label>Foto (telefonda kamera ochiladi)</label><label class="drop">' + icon('camera', 26) + '<b>Rasm qo\'shish</b><span class="small">3 tagacha rasm</span><input type="file" id="f-photo" accept="image/*" capture="environment" multiple></label><div class="previews" id="f-previews"></div></div>' +
        '</div>',
      foot: '<button class="btn" data-close-btn>Bekor qilish</button><button class="btn btn-primary" id="f-save">' + icon('check', 18) + 'Saqlash va yuborish</button>',
      onMount: function (m) {
        function syncAssignee() { $('#f-assignee', m).value = getObject($('#f-obj', m).value).contractor; }
        syncAssignee();
        $('#f-obj', m).addEventListener('change', syncAssignee);
        $('[data-close-btn]', m).addEventListener('click', closeModal);
        $('#f-photo', m).addEventListener('change', function (e) {
          var files = Array.prototype.slice.call(e.target.files).slice(0, 3 - photos.length);
          files.forEach(function (f) {
            readImage(f, function (data) {
              photos.push(data);
              $('#f-previews', m).innerHTML = photos.map(function (p) { return '<img src="' + p + '" alt="">'; }).join('');
            });
          });
          e.target.value = '';
        });
        $('#f-save', m).addEventListener('click', function () {
          var title = $('#f-title', m).value.trim();
          if (!title) { $('#f-title', m).focus(); toast('Kamchilik nomini kiriting', 'err'); return; }
          var deadline = $('#f-deadline', m).value;
          if (!deadline || deadline < iso(today())) { $('#f-deadline', m).focus(); toast('Bartaraf etish muddati bugundan oldin bo\'lmasligi kerak', 'err'); return; }
          var oid = $('#f-obj', m).value;
          var now = new Date().toISOString();
          db.seq.defect += 1;
          var d = {
            id: uid('d'), no: db.seq.defect, objectId: oid, title: title,
            location: $('#f-loc', m).value.trim() || '—', desc: $('#f-desc', m).value.trim(),
            severity: $('#f-sev', m).value, assignee: getObject(oid).contractor,
            deadline: new Date(deadline + 'T00:00:00').toISOString(),
            status: 'yangi', photos: photos, fixPhotos: [], createdBy: currentUser.name, createdAt: now,
            history: [{ at: now, by: currentUser.name, role: currentUser.role, from: null, to: 'yangi', note: '' }]
          };
          db.defects.unshift(d);
          logActivity(defectLogText(currentUser.name, 'yangi', title), oid);
          if (!commit(function () { db.defects.shift(); db.activity.shift(); db.seq.defect -= 1; })) return;
          closeModal();
          toast('Kamchilik qayd etildi va pudratchiga yuborildi');
          render();
        });
      }
    });
  }

  function openDefect(id) {
    var d = getDefect(id);
    if (!d) return;
    var o = getObject(d.objectId);
    var main = ['yangi', 'ishda', 'bartaraf', 'tasdiq'];
    var curIdx = main.indexOf(d.status === 'qaytarildi' ? 'ishda' : d.status);
    var flow = main.map(function (s, i) {
      var cls = i < curIdx ? 'on' : (i === curIdx ? 'cur' : '');
      return '<span class="' + cls + '">' + STATUS[s].label + '</span>';
    }).join('<i>›</i>');
    var photosHtml = (d.photos.length ? d.photos.map(function (p) { return '<figure><img src="' + p + '" alt="Kamchilik rasmi" data-zoom><figcaption>Aniqlanganda</figcaption></figure>'; }).join('') : '<div class="no-photo">Aniqlangan holat rasmi yo\'q</div>') +
      (d.fixPhotos.length ? d.fixPhotos.map(function (p) { return '<figure><img src="' + p + '" alt="Tuzatilgan holat" data-zoom><figcaption>Bartaraf etilgandan keyin</figcaption></figure>'; }).join('') : '');
    var hist = d.history.slice().reverse().map(function (h) {
      return '<li><span class="tdot" style="background:' + STATUS[h.to].color + '"></span><b>' + esc(STATUS[h.to].label) + '</b><time>' + fmtDateTime(h.at) + '</time>' +
        '<p>' + esc(h.by) + ' (' + esc(ROLES[h.role] || '') + ')' + (h.note ? ': ' + esc(h.note) : '') + '</p></li>';
    }).join('');
    var actions = defectActions(d);
    var actionHtml = actions.length ?
      '<div class="action-box"><h4>Sizning harakatingiz (' + esc(ROLES[currentUser.role]) + ')</h4>' +
      '<textarea class="input" id="a-note" placeholder="' + (actions.some(function (a) { return a.needNote; }) ? 'Izoh (qaytarishda majburiy)' : 'Izoh (ixtiyoriy)') + '"></textarea>' +
      (actions.some(function (a) { return a.photo; }) ? '<label class="drop" style="padding:12px">' + icon('camera', 20) + '<span class="small"><b>Tuzatilgan holat rasmi</b> (ixtiyoriy)</span><input type="file" id="a-photo" accept="image/*" capture="environment"></label><div class="previews" id="a-prev"></div>' : '') +
      '<div class="row wrap">' + actions.map(function (a, i) { return '<button class="btn ' + a.cls + '" data-action="' + i + '">' + esc(a.label) + '</button>'; }).join('') + '</div></div>'
      : '<div class="action-box"><p class="small muted">' + waitingText(d) + '</p></div>';

    openModal({
      wide: true,
      title: '#' + d.no + ' ' + d.title,
      body:
        '<div class="row wrap" style="justify-content:space-between">' + statusBadge(d.status) + '<div class="flow">' + flow + '</div></div>' +
        '<div class="grid g-main">' +
        '<div class="grid" style="gap:18px">' +
        '<div class="info-grid">' + info('Obyekt', o.name) + info('Joylashuvi', d.location) +
        '<div><div class="k">Darajasi</div><div class="v">' + sevTag(d.severity) + '</div></div>' +
        '<div><div class="k">Muddat</div><div class="v">' + fmtDate(d.deadline) + ' · ' + deadlineText(d) + '</div></div>' +
        info('Mas\'ul', d.assignee) + info('Qayd etgan', d.createdBy + ', ' + fmtDate(d.createdAt)) + '</div>' +
        (d.desc ? '<div><div class="k small muted">Izoh</div><p>' + esc(d.desc) + '</p></div>' : '') +
        '<div class="photo-grid">' + photosHtml + '</div>' +
        actionHtml +
        '</div>' +
        '<div><h4 style="margin-bottom:12px">Harakatlar tarixi</h4><ul class="timeline">' + hist + '</ul></div>' +
        '</div>',
      onMount: function (m) {
        var fixPhoto = null;
        $all('[data-zoom]', m).forEach(function (img) { img.addEventListener('click', function () { lightbox(img.src); }); });
        var ph = $('#a-photo', m);
        if (ph) ph.addEventListener('change', function (e) {
          if (!e.target.files[0]) return;
          readImage(e.target.files[0], function (data) { fixPhoto = data; $('#a-prev', m).innerHTML = '<img src="' + data + '" alt="">'; });
        });
        $all('[data-action]', m).forEach(function (btn) {
          btn.addEventListener('click', function () {
            var a = actions[Number(btn.getAttribute('data-action'))];
            var note = $('#a-note', m).value.trim();
            if (a.needNote && !note) { toast('Qaytarish sababini izohda yozing', 'err'); $('#a-note', m).focus(); return; }
            var from = d.status, photoCount = d.fixPhotos.length;
            d.status = a.to;
            if (a.to === 'bartaraf' && fixPhoto) d.fixPhotos.push(fixPhoto);
            d.history.push({ at: new Date().toISOString(), by: currentUser.name, role: currentUser.role, from: from, to: a.to, note: note });
            logActivity(defectLogText(currentUser.name, a.to, d.title), d.objectId);
            if (!commit(function () { d.status = from; d.fixPhotos.length = photoCount; d.history.pop(); db.activity.shift(); })) return;
            toast('Holat yangilandi: ' + STATUS[a.to].label);
            render();
            openDefect(d.id);
          });
        });
      }
    });
  }
  function waitingText(d) {
    if (d.status === 'tasdiq') return 'Kamchilik bartaraf etilgan va texnik nazorat tomonidan tasdiqlangan. Jarayon yopildi.';
    if (d.status === 'bartaraf') return 'Texnik nazorat tasdiqlashi kutilmoqda. Rolni «Texnik nazorat»ga almashtirib, tasdiqlang yoki qaytaring.';
    return 'Pudratchi harakati kutilmoqda. Rolni «Pudratchi»ga almashtirib, ishni boshlang yoki bartaraf etilganini belgilang.';
  }

  /* ---------- Materiallar ---------- */
  var matObject = null;
  function pageMaterials() {
    if (!matObject || !getObject(matObject)) matObject = db.objects[0].id;
    var objOpts = db.objects.map(function (o) { return '<option value="' + o.id + '"' + (o.id === matObject ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('');
    return '<div class="page-head"><div><h1>Resurslar va materiallar</h1><div class="sub">Kirim, sarf va smeta bilan solishtirish</div></div><div class="actions">' +
      '<select class="input" id="mat-obj" style="min-width:300px">' + objOpts + '</select></div></div>' +
      '<div class="card card-pad">' + materialsBlock(matObject) + '</div>';
  }
  function materialsBlock(objectId) {
    var o = getObject(objectId);
    var rows = materialSummary(objectId);
    var tbl = rows.map(function (r) {
      var stock = r.kirim - r.sarf;
      var pct = r.plan ? Math.round(r.sarf / r.plan * 100) : 0;
      var warn = r.plan && (r.sarf > r.plan || pct > o.progress + 15);
      return '<tr class="' + (warn ? 'warn-row' : '') + '"><td><b>' + esc(r.name) + '</b><br><small class="muted">' + esc(r.unit) + '</small></td>' +
        '<td class="num">' + (r.plan ? fmtNum(r.plan) : '—') + '</td><td class="num">' + fmtNum(r.kirim) + '</td><td class="num">' + fmtNum(r.sarf) + '</td><td class="num">' + fmtNum(stock) + '</td>' +
        '<td style="min-width:150px"><div class="prog' + (warn ? ' lag' : '') + '"><span style="width:' + Math.min(100, pct) + '%"></span></div><small class="muted">' + (r.plan ? pct + '% smetadan' : 'smetada yo\'q') + '</small></td>' +
        '<td>' + (warn ? '<span class="overdue">' + (r.sarf > r.plan ? 'Smetadan oshgan' : 'Sarf bajarilishdan tez') + '</span>' : '<span class="muted">Me\'yorda</span>') + '</td></tr>';
    }).join('');
    var journal = db.materials.filter(function (e) { return e.objectId === objectId; }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 12).map(function (e) {
      return '<tr><td>' + fmtDate(e.date) + '</td><td><span class="badge ' + (e.type === 'kirim' ? 'st-tasdiq' : 'st-ishda') + '">' + (e.type === 'kirim' ? 'Kirim' : 'Sarf') + '</span></td><td>' + esc(e.material) + '</td><td class="num">' + fmtNum(e.qty) + ' ' + esc(e.unit) + '</td><td>' + esc(e.note || '—') + '</td><td>' + esc(e.by) + '</td></tr>';
    }).join('');
    var matOpts = MATERIALS.map(function (mt) { return '<option value="' + esc(mt.name) + '">' + esc(mt.name) + ' (' + mt.unit + ')</option>'; }).join('');
    var form = can('addMaterial') ?
      '<div class="action-box"><h4>Yozuv qo\'shish</h4><div class="row wrap">' +
      '<select class="input" id="m-type" style="max-width:130px"><option value="kirim">Kirim</option><option value="sarf">Sarf</option></select>' +
      '<select class="input" id="m-name" style="max-width:220px">' + matOpts + '</select>' +
      '<input class="input" id="m-qty" type="number" min="0" step="0.1" placeholder="Miqdor" style="max-width:120px">' +
      '<input class="input" id="m-note" placeholder="Izoh (yetkazib beruvchi, ish turi)" style="flex:1;min-width:180px">' +
      '<button class="btn btn-primary" id="m-add" data-objid="' + objectId + '">' + icon('plus', 16) + 'Qo\'shish</button></div></div>'
      : '<p class="small muted">Material kirimi va sarfini pudratchi kiritadi. Siz faqat kuzatasiz.</p>';
    return '<div class="grid" style="gap:20px">' +
      '<div class="table-wrap"><table class="tbl"><thead><tr><th>Material</th><th class="num">Smeta</th><th class="num">Kirim</th><th class="num">Sarf</th><th class="num">Qoldiq</th><th>Smetadan sarf</th><th>Holat</th></tr></thead><tbody>' + (tbl || '<tr><td colspan="7" class="empty">Ma\'lumot yo\'q</td></tr>') + '</tbody></table></div>' +
      '<p class="small muted">Bajarilish: <b>' + o.progress + '%</b>. Material sarfi bajarilish foizidan 15% dan ko\'p oshsa, tizim ogohlantiradi.</p>' +
      form +
      '<div><h4 style="margin-bottom:10px">Jurnal (so\'nggi yozuvlar)</h4><div class="table-wrap"><table class="tbl"><thead><tr><th>Sana</th><th>Turi</th><th>Material</th><th class="num">Miqdor</th><th>Izoh</th><th>Kiritgan</th></tr></thead><tbody>' + (journal || '<tr><td colspan="6" class="empty">Yozuvlar yo\'q</td></tr>') + '</tbody></table></div></div>' +
      '</div>';
  }

  /* ---------- Dalolatnomalar va davriy hisobotlar ---------- */
  var ACT_TYPES = {
    bajarilgan: 'Bajarilgan ishlar dalolatnomasi',
    korik: 'Texnik ko\'rik dalolatnomasi',
    haftalik: 'Haftalik holat hisoboti',
    oylik: 'Oylik holat hisoboti'
  };
  var REPORT_DAYS = { haftalik: 7, oylik: 30 };
  function actTable(list) {
    var rows = list.slice().reverse().map(function (a) {
      var o = getObject(a.objectId);
      var search = norm(ACT_TYPES[a.type] + ' ' + a.no + ' ' + (o ? o.name : '') + ' ' + a.by);
      return '<tr class="click" data-actid="' + a.id + '" data-search="' + esc(search) + '"><td><div class="cell-title"><span class="thumb">' + icon('file', 20) + '</span><div><b>' + esc(ACT_TYPES[a.type]) + ' № ' + a.no + '</b><small>' + esc(o ? o.name : '') + '</small></div></div></td><td>' + esc(a.by) + '</td><td>' + fmtDateTime(a.at) + '</td><td class="num"><span class="btn btn-sm">' + icon('print', 14) + 'Ko\'rish / PDF</span></td></tr>';
    }).join('');
    return '<div class="table-wrap"><table class="tbl"><thead><tr><th>Hujjat</th><th>Tuzgan</th><th>Sana</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function pageActs() {
    var has = db.acts.length > 0;
    return '<div class="page-head"><div><h1>Dalolatnomalar</h1><div class="sub">Dalolatnoma va davriy hisobotlar tizim ma\'lumotlaridan bir tugma bilan tuziladi va elektron arxivda saqlanadi</div></div><div class="actions">' +
      (can('createAct') ? '<button class="btn btn-primary" data-act="new-act">' + icon('plus', 18) + 'Dalolatnoma tuzish</button>' : '') + '</div></div>' +
      (has ? '<input class="input" type="search" id="act-search" placeholder="Arxivdan qidirish: obyekt, hujjat turi, raqami yoki muallif" style="max-width:520px">' : '') +
      '<div class="card">' + (has ? actTable(db.acts) + '<div class="empty" id="act-none" style="display:none">Hech narsa topilmadi</div>'
        : '<div class="empty">' + icon('file', 32) + '<p style="margin-top:8px">Hali hujjat tuzilmagan.' + (can('createAct') ? ' «Dalolatnoma tuzish» tugmasini bosing.' : '') + '</p></div>') + '</div>';
  }
  function openNewAct(objectId) {
    var objOpts = db.objects.map(function (o) { return '<option value="' + o.id + '"' + (o.id === objectId ? ' selected' : '') + '>' + esc(o.name) + '</option>'; }).join('');
    var typeOpts = Object.keys(ACT_TYPES).map(function (k) { return '<option value="' + k + '">' + ACT_TYPES[k] + '</option>'; }).join('');
    openModal({
      title: 'Dalolatnoma tuzish',
      body: '<div class="field"><label>Obyekt</label><select class="input" id="act-obj">' + objOpts + '</select></div>' +
        '<div class="field"><label>Hujjat turi</label><select class="input" id="act-type">' + typeOpts + '</select></div>' +
        '<p class="small muted">Hujjatga obyekt pasporti, bajarilish foizi, kamchiliklar va materiallar bo\'yicha joriy ma\'lumotlar avtomatik kiritiladi. Haftalik va oylik hisobotlarda shu davrdagi o\'zgarishlar ham ko\'rsatiladi.</p>',
      foot: '<button class="btn" data-close-btn>Bekor qilish</button><button class="btn btn-primary" id="act-make">' + icon('file', 18) + 'Tuzish</button>',
      onMount: function (m) {
        $('[data-close-btn]', m).addEventListener('click', closeModal);
        $('#act-make', m).addEventListener('click', function () {
          var oid = $('#act-obj', m).value, o = getObject(oid), type = $('#act-type', m).value;
          // Hujjat tuzilgan paytdagi holat nusxasi: keyingi o'zgarishlar tuzilgan hujjatni o'zgartirmaydi
          var snapshot = {
            object: JSON.parse(JSON.stringify(o)), planned: plannedProgress(o),
            defects: objectDefects(oid).map(function (d) {
              var closed = d.history.filter(function (h) { return h.to === 'tasdiq'; }).pop();
              return { no: d.no, title: d.title, location: d.location, severity: d.severity, status: d.status, deadline: d.deadline, createdAt: d.createdAt, closedAt: closed ? closed.at : null };
            }),
            materials: materialSummary(oid),
            signers: { rahbar: userByRole('rahbar').name, nazorat: userByRole('nazorat').name, pudratchi: userByRole('pudratchi').name }
          };
          if (REPORT_DAYS[type]) {
            var since = today(); since.setDate(since.getDate() - REPORT_DAYS[type]);
            snapshot.period = {
              since: since.toISOString(),
              entries: db.materials.filter(function (e) { return e.objectId === oid && new Date(e.date) >= since; })
                .sort(function (x, y) { return new Date(x.date) - new Date(y.date); })
                .map(function (e) { return { date: e.date, type: e.type, material: e.material, qty: e.qty, unit: e.unit }; })
            };
          }
          db.seq.act += 1;
          var act = { id: uid('act'), no: db.seq.act, type: type, objectId: oid, at: new Date().toISOString(), by: currentUser.name, role: currentUser.role, snapshot: snapshot };
          db.acts.push(act);
          logActivity(currentUser.name + ' ' + ACT_TYPES[type].toLowerCase() + ' № ' + act.no + ' tuzdi', oid);
          if (!commit(function () { db.acts.pop(); db.activity.shift(); db.seq.act -= 1; })) return;
          toast(REPORT_DAYS[type] ? 'Hisobot tuzildi' : 'Dalolatnoma tuzildi');
          if (route().name === 'acts' || route().name === 'objects') render();
          showAct(act.id);
        });
      }
    });
  }
  function actHtml(a) {
    var s = a.snapshot, o = s.object, report = !!s.period;
    var open = s.defects.filter(function (d) { return d.status !== 'tasdiq'; });
    function defTable(list, emptyText) {
      var rows = list.length ? list.map(function (d, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(d.title) + '</td><td>' + esc(d.location) + '</td><td>' + esc(SEVERITY[d.severity]) + '</td><td>' + esc(STATUS[d.status].label) + '</td></tr>';
      }).join('') : '<tr><td colspan="5">' + esc(emptyText) + '</td></tr>';
      return '<table><thead><tr><th>№</th><th>Kamchilik</th><th>Joylashuvi</th><th>Darajasi</th><th>Holati</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
    function sig(label, name) { return '<div><span>' + esc(label) + '</span><span>' + esc(name) + '</span></div>'; }
    var sections, sign;
    if (report) {
      var since = new Date(s.period.since);
      var fresh = s.defects.filter(function (d) { return new Date(d.createdAt) >= since; }).length;
      var closedNow = s.defects.filter(function (d) { return d.closedAt && new Date(d.closedAt) >= since; }).length;
      var entryRows = s.period.entries.length ? s.period.entries.map(function (e) {
        return '<tr><td>' + fmtDate(e.date) + '</td><td>' + (e.type === 'kirim' ? 'Kirim' : 'Sarf') + '</td><td>' + esc(e.material) + '</td><td>' + fmtNum(e.qty) + ' ' + esc(e.unit) + '</td></tr>';
      }).join('') : '<tr><td colspan="4">Davr ichida yozuv kiritilmagan</td></tr>';
      var summary = 'Hisobot davrida ' + fresh + ' ta yangi kamchilik qayd etildi, ' + closedNow + ' tasi bartaraf etilib tasdiqlandi; hisobot sanasida ' + open.length + ' ta kamchilik ochiq. ' +
        'Bajarilish ' + o.progress + '% (reja bo\'yicha ' + s.planned + '%): ' + (isLagging(o.progress, s.planned) ? 'obyekt jadvaldan ortda, choralar ko\'rish talab etiladi.' : 'ishlar jadval doirasida.');
      sections =
        '<h4>2. Davr ichidagi kamchiliklar</h4><p>Yangi qayd etilgan: <b>' + fresh + '</b> ta. Bartaraf etilib tasdiqlangan: <b>' + closedNow + '</b> ta. Hisobot sanasida ochiq: <b>' + open.length + '</b> ta.</p>' +
        defTable(open, 'Ochiq kamchiliklar yo\'q') +
        '<h4>3. Davr ichidagi material harakati</h4><table><thead><tr><th>Sana</th><th>Turi</th><th>Material</th><th>Miqdor</th></tr></thead><tbody>' + entryRows + '</tbody></table>' +
        '<h4>4. Xulosa</h4><p>' + esc(summary) + '</p>';
      sign = sig('Tuzdi', a.by) + sig('Tasdiqladi', a.by === s.signers.rahbar ? '' : s.signers.rahbar);
    } else {
      var closed = s.defects.length - open.length;
      var matRows = s.materials.length ? s.materials.map(function (r) {
        return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.unit) + '</td><td>' + (r.plan ? fmtNum(r.plan) : '—') + '</td><td>' + fmtNum(r.kirim) + '</td><td>' + fmtNum(r.sarf) + '</td><td>' + fmtNum(r.kirim - r.sarf) + '</td></tr>';
      }).join('') : '<tr><td colspan="6">Ma\'lumot yo\'q</td></tr>';
      var conclusion = a.type === 'bajarilgan'
        ? 'Obyektda ishlar ' + o.progress + '% hajmda bajarilgan (reja bo\'yicha ' + s.planned + '%). ' + (open.length ? open.length + ' ta kamchilik bartaraf etilishi lozim.' : 'Ochiq kamchiliklar mavjud emas.')
        : 'Texnik ko\'rik natijasida jami ' + s.defects.length + ' ta kamchilik qayd etilgan, shundan ' + closed + ' tasi bartaraf etilib tasdiqlangan, ' + open.length + ' tasi ochiq. Pudratchi ochiq kamchiliklarni belgilangan muddatlarda bartaraf etishi shart.';
      sections =
        '<h4>2. Aniqlangan kamchiliklar</h4>' + defTable(s.defects, 'Kamchiliklar qayd etilmagan') +
        '<h4>3. Materiallar hisobi</h4><table><thead><tr><th>Material</th><th>O\'lchov</th><th>Smeta</th><th>Kirim</th><th>Sarf</th><th>Qoldiq</th></tr></thead><tbody>' + matRows + '</tbody></table>' +
        '<h4>4. Xulosa</h4><p>' + esc(conclusion) + '</p>';
      sign = sig('Buyurtmachi vakili', s.signers.rahbar) + sig('Texnik nazorat muhandisi', s.signers.nazorat) + sig('Bosh pudratchi vakili', s.signers.pudratchi) + sig('Tuzdi', a.by);
    }
    return '<div class="act-paper">' +
      '<h2>' + esc(ACT_TYPES[a.type]) + '</h2><div class="act-no">№ ' + a.no + '</div>' +
      '<div class="act-meta"><span>Buxoro shahri</span><span>' + fmtDate(a.at) + '</span></div>' +
      '<p><b>Obyekt:</b> ' + esc(o.name) + '<br><b>Manzil:</b> ' + esc(o.address) + '<br><b>Buyurtmachi:</b> ' + esc(o.customer) + '<br><b>Bosh pudratchi:</b> ' + esc(o.contractor) + '<br><b>Qurilish muddati:</b> ' + fmtDate(o.start) + ' — ' + fmtDate(o.end) +
      (report ? '<br><b>Hisobot davri:</b> ' + fmtDate(s.period.since) + ' — ' + fmtDate(a.at) : '') + '</p>' +
      '<h4>1. Ishlarning bajarilish holati</h4><p>Haqiqiy bajarilish: <b>' + o.progress + '%</b>. Kalendar reja bo\'yicha: <b>' + s.planned + '%</b>.</p>' +
      sections +
      '<div class="sign">' + sign + '</div>' +
      '<div class="stamp">Hujjat BuildControl platformasida avtomatik shakllantirildi · ID: ' + esc(a.id) + '</div></div>';
  }
  function showAct(id) {
    var a = db.acts.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    openModal({
      wide: true,
      title: ACT_TYPES[a.type] + ' № ' + a.no,
      body: actHtml(a),
      foot: '<span class="small muted" style="margin-right:auto">Chop etish oynasida «PDF sifatida saqlash»ni tanlang</span><button class="btn" data-close-btn>Yopish</button><button class="btn btn-primary" id="act-print">' + icon('print', 18) + 'PDF yuklab olish</button>',
      onMount: function (m) {
        $('[data-close-btn]', m).addEventListener('click', closeModal);
        $('#act-print', m).addEventListener('click', function () { printAct(a); });
      }
    });
  }
  function printAct(a) {
    var area = $('#print-area');
    area.innerHTML = actHtml(a);
    document.body.classList.add('print-mode');
    var oldTitle = document.title;
    document.title = 'Dalolatnoma-' + a.no;
    var done = function () { document.body.classList.remove('print-mode'); area.innerHTML = ''; document.title = oldTitle; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 500); }, 50);
  }

  /* ---------- Yangi obyekt ---------- */
  function openNewObject() {
    openModal({
      title: 'Yangi obyekt qo\'shish',
      body: '<div class="form-grid">' +
        '<div class="field full"><label>Obyekt nomi *</label><input class="input" id="o-name" placeholder="Masalan: Romitan tumani 20-maktab"></div>' +
        '<div class="field full"><label>Manzil</label><input class="input" id="o-addr" placeholder="Shahar, tuman, ko\'cha"></div>' +
        '<div class="field"><label>Obyekt turi</label><select class="input" id="o-type"><option>Turar-joy binosi</option><option>Ta\'lim muassasasi</option><option>Sog\'liqni saqlash</option><option>Maktabgacha ta\'lim</option><option>Ma\'muriy bino</option><option>Infratuzilma</option></select></div>' +
        '<div class="field"><label>Loyiha qiymati (mln so\'m)</label><input type="number" min="0" class="input" id="o-budget" value="10000"></div>' +
        '<div class="field"><label>Buyurtmachi</label><input class="input" id="o-cust" value="Tuman hokimligi"></div>' +
        '<div class="field"><label>Bosh pudratchi</label><input class="input" id="o-contr" value="&quot;Mustahkam Qurilish&quot; MChJ"></div>' +
        '<div class="field"><label>Boshlanish sanasi</label><input type="date" class="input" id="o-start" value="' + iso(today()) + '"></div>' +
        '<div class="field"><label>Topshirish muddati</label><input type="date" class="input" id="o-end" value="' + iso(new Date(addDays(270))) + '"></div>' +
        '</div>',
      foot: '<button class="btn" data-close-btn>Bekor qilish</button><button class="btn btn-primary" id="o-save">' + icon('check', 18) + 'Saqlash</button>',
      onMount: function (m) {
        $('[data-close-btn]', m).addEventListener('click', closeModal);
        $('#o-save', m).addEventListener('click', function () {
          var name = $('#o-name', m).value.trim();
          if (!name) { toast('Obyekt nomini kiriting', 'err'); $('#o-name', m).focus(); return; }
          var start = $('#o-start', m).value, end = $('#o-end', m).value;
          if (!start || !end || end <= start) { toast('Topshirish muddati boshlanish sanasidan keyin bo\'lishi kerak', 'err'); $(start ? '#o-end' : '#o-start', m).focus(); return; }
          var o = {
            id: uid('o'), name: name, type: $('#o-type', m).value, address: $('#o-addr', m).value.trim() || '—',
            customer: $('#o-cust', m).value.trim() || '—', contractor: $('#o-contr', m).value.trim() || '—',
            start: new Date(start + 'T00:00:00').toISOString(), end: new Date(end + 'T00:00:00').toISOString(),
            budget: Math.max(0, Number($('#o-budget', m).value) || 0), progress: 0, floors: ''
          };
          db.objects.push(o);
          db.plans[o.id] = {};
          logActivity(currentUser.name + ' yangi obyekt qo\'shdi: «' + name + '»', o.id);
          if (!commit(function () { db.objects.pop(); delete db.plans[o.id]; db.activity.shift(); })) return;
          closeModal(); toast('Obyekt qo\'shildi');
          go('objects/' + o.id);
        });
      }
    });
  }

  /* =========================================================
     RENDER
     ========================================================= */
  function render() {
    if (!currentUser) { renderLogin(); return; }
    var r = route();
    if (!allowed(r.name)) { go('dashboard'); return; }
    var title, content;
    switch (r.name) {
      case 'objects':
        if (r.id) { var o = getObject(r.id); title = o ? o.name : 'Obyekt'; content = pageObject(r.id, r.tab); }
        else { title = 'Obyektlar'; content = pageObjects(); }
        break;
      case 'defects': title = 'Kamchiliklar'; content = pageDefects(); break;
      case 'materials': title = 'Materiallar'; content = pageMaterials(); break;
      case 'acts': title = 'Dalolatnomalar'; content = pageActs(); break;
      default: title = 'Boshqaruv paneli'; content = pageDashboard();
    }
    $('#app').innerHTML = shell(title, content);
    bindShell();
    bindPage();
  }

  function bindPage() {
    var app = $('#app');
    $all('[data-obj]', app).forEach(function (el) { el.addEventListener('click', function () { go('objects/' + el.getAttribute('data-obj')); }); });
    $all('[data-defect]', app).forEach(function (el) { el.addEventListener('click', function () { openDefect(el.getAttribute('data-defect')); }); });
    $all('[data-actid]', app).forEach(function (el) { el.addEventListener('click', function () { showAct(el.getAttribute('data-actid')); }); });
    $all('[data-obj], [data-defect], [data-actid]', app).forEach(function (el) {
      el.tabIndex = 0;
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') el.click(); });
    });
    $all('[data-act="new-defect"]', app).forEach(function (el) { el.addEventListener('click', function () { openNewDefect(el.getAttribute('data-objid') || (route().name === 'objects' ? route().id : null)); }); });
    $all('[data-act="new-object"]', app).forEach(function (el) { el.addEventListener('click', openNewObject); });
    $all('[data-act="new-act"]', app).forEach(function (el) { el.addEventListener('click', function () { openNewAct(el.getAttribute('data-objid')); }); });
    $all('[data-tab]', app).forEach(function (el) { el.addEventListener('click', function () { go('objects/' + route().id + '/' + el.getAttribute('data-tab')); }); });
    $all('[data-filter]', app).forEach(function (el) { el.addEventListener('click', function () { defectFilter.status = el.getAttribute('data-filter'); render(); }); });

    var of = $('#obj-filter'); if (of) of.addEventListener('change', function () { defectFilter.object = of.value; render(); });
    var mo = $('#mat-obj'); if (mo) mo.addEventListener('change', function () { matObject = mo.value; render(); });

    var range = $('#prog-range');
    if (range) {
      range.addEventListener('input', function () { $('#prog-val').textContent = range.value + '%'; });
      $('#prog-save').addEventListener('click', function () {
        var o = getObject($('#prog-save').getAttribute('data-objid'));
        var prev = o.progress;
        o.progress = Number(range.value);
        logActivity(progressLogText(currentUser.name, o), o.id);
        if (!commit(function () { o.progress = prev; db.activity.shift(); })) return;
        toast('Bajarilish foizi saqlandi'); render();
      });
    }

    var mAdd = $('#m-add');
    if (mAdd) mAdd.addEventListener('click', function () {
      var qty = Number($('#m-qty').value);
      if (!qty || qty <= 0) { toast('Miqdorni kiriting', 'err'); $('#m-qty').focus(); return; }
      var name = $('#m-name').value, type = $('#m-type').value, oid = mAdd.getAttribute('data-objid');
      var unit = MATERIALS.filter(function (x) { return x.name === name; })[0].unit;
      if (type === 'sarf') {
        var row = materialSummary(oid).filter(function (r) { return r.name === name; })[0];
        var stock = row ? Math.round((row.kirim - row.sarf) * 100) / 100 : 0;
        if (qty > stock) { toast('Omborda yetarli emas: qoldiq ' + fmtNum(stock) + ' ' + unit, 'err'); $('#m-qty').focus(); return; }
      }
      db.materials.push({ id: uid('m'), objectId: oid, material: name, unit: unit, type: type, qty: qty, date: new Date().toISOString(), by: currentUser.name, note: $('#m-note').value.trim() });
      logActivity(materialLogText(currentUser.name, type, name, qty, unit), oid);
      if (!commit(function () { db.materials.pop(); db.activity.shift(); })) return;
      toast('Yozuv qo\'shildi'); render();
    });

    var actSearch = $('#act-search');
    if (actSearch) actSearch.addEventListener('input', function () {
      var q = norm(actSearch.value.trim()), shown = 0;
      $all('[data-search]', app).forEach(function (tr) {
        var hit = tr.getAttribute('data-search').indexOf(q) >= 0;
        tr.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      $('#act-none').style.display = shown ? 'none' : '';
    });

    var docIn = $('#doc-input');
    if (docIn) docIn.addEventListener('change', function () {
      var oid = docIn.getAttribute('data-objid');
      var files = Array.prototype.slice.call(docIn.files);
      var pending = files.length;
      files.forEach(function (f) {
        var rec = { id: uid('doc'), objectId: oid, name: f.name, kind: guessKind(f.name), size: Math.round(f.size / 1048576 * 10) / 10 || 0.1, date: new Date().toISOString(), by: currentUser.name };
        var finish = function () {
          db.docs.push(rec);
          if (--pending > 0) return;
          logActivity(currentUser.name + ' ' + (files.length === 1 ? 'hujjat yukladi: «' + files[0].name + '»' : files.length + ' ta hujjat yukladi'), oid);
          if (commit(function () { db.docs.splice(db.docs.length - files.length, files.length); db.activity.shift(); })) toast('Hujjat yuklandi');
          render();
        };
        if (f.size < 400 * 1024) {
          var rd = new FileReader();
          rd.onload = function () { rec.data = rd.result; finish(); };
          rd.onerror = finish;
          rd.readAsDataURL(f);
        } else finish();
      });
    });
  }
  function guessKind(n) {
    n = n.toLowerCase();
    if (/ruxsat/.test(n)) return 'Ruxsatnoma';
    if (/smeta|\.xlsx?$/.test(n)) return 'Smeta';
    if (/\.(jpe?g|png|webp)$/.test(n)) return 'Fotosurat';
    return 'Loyiha hujjati';
  }

  /* ---------- Start ---------- */
  load();
  loadSession();
  render();
})();
