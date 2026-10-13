/* =========================================================
   SHIZUKU 雫 — book.js
   the moon gate (only the round door is sharp; scroll and you walk through it),
   five slow steps, a wooden tag that fills itself and swings, an ink signature,
   a red stamp. nothing is sent and nothing is kept: reload and it's gone.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, toast, chars, ripple, ready, makeWater, floatLayer, inView } = window.SZ;
  const DAY = 864e5;

  /* =========================================================
     01 · THE MOON GATE — only the round door is sharp. scroll, and you walk through it:
     the circle opens to the whole screen while the garden comes closer.
     ========================================================= */
  const hero = $('#bkHero');
  if (hero) {
    const pin = $('#gatePin'), front = $('#gateFront'), back = $('.gate-back', pin);
    const svg = $('#gateRings'), r1 = $('#gateRing1'), r2 = $('#gateRing2'), tp = $('#gateTextPath'), txt = $('#gateText');
    const GATE = { x: .582, y: .535, r: .205 };          // where the round door is in the photo (fractions of the photo)
    const st = { open: motion ? 0 : 1, through: 0 };
    let img = $(':scope > img', back), geo = { cx: 0, cy: 0, R: 0, W: 1, H: 1 };
    let mx = 0, my = 0, sx = 0, sy = 0, angle = 0, on = true;
    function place() {
      const W = pin.clientWidth, H = pin.clientHeight;
      const iw = (img && img.naturalWidth) || 736, ih = (img && img.naturalHeight) || 414;
      const k = Math.max(W / iw, H / ih), dw = iw * k, dh = ih * k;
      // on a tall screen the photo is cropped at the sides: slide the crop so the door stays in the middle
      const px = dw > W + 1 ? clamp((W / 2 - GATE.x * dw) / (W - dw), 0, 1) : .5;
      $$('.gate-back > img, .gate-front .slot > img', pin).forEach((im) => { im.style.objectPosition = `${(px * 100).toFixed(2)}% 50%`; });
      geo = { cx: (W - dw) * px + GATE.x * dw, cy: (H - dh) / 2 + GATE.y * dh, R: Math.min(GATE.r * dw, H * .42, W * .43), W, H };
      pin.style.setProperty('--gx', geo.cx + 'px'); pin.style.setProperty('--gy', geo.cy + 'px');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      render();
    }
    function render() {
      const { cx, cy, R, W, H } = geo;
      const x = cx + sx, y = cy + sy;
      const far = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
      const ease = st.through * st.through;
      const r = R * st.open + (far - R) * ease;
      front.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
      const sc = 1 + st.through * .55;
      front.style.transform = back.style.transform = `scale(${sc.toFixed(4)})`;
      // the rings: drawn in on arrival, they open with the door, then fade
      const rr1 = r * sc + 8, rr2 = r * sc * 1.1 + 20, c1 = 2 * Math.PI * rr1;
      r1.setAttribute('cx', x); r1.setAttribute('cy', y); r1.setAttribute('r', rr1);
      r2.setAttribute('cx', x); r2.setAttribute('cy', y); r2.setAttribute('r', rr2);
      r1.style.strokeDasharray = c1; r1.style.strokeDashoffset = c1 * (1 - st.open);
      const tr = rr1 + 26;
      tp.setAttribute('d', `M ${x - tr} ${y} a ${tr} ${tr} 0 1 1 ${tr * 2} 0 a ${tr} ${tr} 0 1 1 ${-tr * 2} 0`);
      txt.setAttribute('transform', `rotate(${angle.toFixed(2)} ${x} ${y})`);
      svg.style.opacity = clamp(st.open * (1 - st.through * 1.8), 0, 1);
    }
    place();
    addEventListener('resize', place);
    back.addEventListener('slot:load', (e) => { img = e.detail; place(); });
    $('.gate-front .slot', pin).addEventListener('slot:load', () => place());
    pin.addEventListener('pointermove', (e) => { const r = pin.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - .5) * 30; my = ((e.clientY - r.top) / r.height - .5) * 20; });
    pin.addEventListener('pointerleave', () => { mx = my = 0; });
    if (motion) {
      inView(hero, (v) => (on = v), '0px');
      gsap.ticker.add(() => {
        if (!on) return;
        sx += (mx - sx) * .05; sy += (my - sy) * .05;
        angle = (angle + .04) % 360;
        render();
      });
    }

    const fl = floatLayer($('#bkFloat'), pin, { pool: '雫雨予月', n: innerWidth < 700 ? 8 : 14, intro: true, sizes: [14, 36] });
    const letters = $$('#bkTitle span');
    ready(() => {
      if (!motion) return;
      gsap.timeline()
        .to(st, { open: 1, duration: 2.4, ease: 'expo.inOut' })
        .fromTo(letters, { yPercent: 110, opacity: 0, filter: 'blur(12px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: 'expo.out', stagger: .06 }, .9)
        .from('.bk-sub, .bk-hero .hero-info, .bk-hero .hero-foot > *, .bk-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: .08 }, 1.4);
      fl.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .6 + i * .06 }));
    });
    if (motion) {
      // through the gate
      ScrollTrigger.create({ trigger: hero, start: 'top top', end: '+=130%', pin, scrub: 1, onUpdate: (s) => { st.through = s.progress; } });
      gsap.to('#bkTitle, .bk-sub, .bk-hero .hero-info, .bk-hero .hero-vert, .bk-hero .hero-foot, #bkFloat', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '+=60%', scrub: true } });
    } else render();
  }

  /* ---------- floating characters in the quiet sections ---------- */
  $$('main section:not(#bkHero) .float-layer').forEach((l) => {
    floatLayer(l, l.closest('section'), { pool: l.dataset.float || '雫', n: +(l.dataset.n || 10), sizes: [12, 30] });
  });

  /* =========================================================
     02 · FIVE SLOW STEPS
     ========================================================= */
  const form = $('#bkForm');
  if (!form) return;
  // this page keeps nothing: clear what an older version of it may have left behind
  try { ['sz-booking', 'sz-sign', 'sz-tag'].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* private window */ }
  const S = { start: null, end: null, guests: 1, name: '', room: null, rits: new Set(), signed: false };
  const tag = $('#tag');
  const swing = (k = 1) => motion && gsap.fromTo(tag, { rotation: rand(2, 4) * k * (Math.random() < .5 ? -1 : 1) }, { rotation: 0, duration: 2.2, ease: 'elastic.out(1, .25)' });
  const DN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], MN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const fmt = (d) => `${DN[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()].slice(0, 3)}`;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nights = () => (S.start && S.end ? Math.round((S.end - S.start) / DAY) : 0);

  /* ---------- (1) when: a calendar with the full moon closed ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const moonAge = (d) => (((d - new Date(2000, 0, 6, 18, 14)) / DAY) % 29.530588 + 29.530588) % 29.530588;
  const isMoon = (d) => Math.abs(moonAge(new Date(d.getTime() + DAY / 2)) - 14.77) < .55;
  const isFull = (d) => { const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); return ((n * 2654435761) >>> 0) % 9 === 0; };
  const blocked = (d) => d < today || isMoon(d) || isFull(d);
  let view = 0;
  const cal = $('#cal'), monthsEl = $('#calMonths'), whenOut = $('#whenOut');
  function renderCal() {
    cal.innerHTML = '';
    const names = [];
    for (let m = 0; m < 2; m++) {
      const first = new Date(today.getFullYear(), today.getMonth() + view + m, 1);
      names.push(`${MN[first.getMonth()]} ${first.getFullYear()}`);
      const box = document.createElement('div'); box.className = 'month';
      box.innerHTML = `<h4>${MN[first.getMonth()]}<small>${first.getFullYear()}</small></h4>`;
      const grid = document.createElement('div'); grid.className = 'days7';
      ['m', 't', 'w', 't', 'f', 's', 's'].forEach((d) => { const s = document.createElement('span'); s.className = 'dow'; s.textContent = d; grid.appendChild(s); });
      const lead = (first.getDay() + 6) % 7;
      for (let i = 0; i < lead; i++) grid.appendChild(document.createElement('span'));
      const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      for (let dd = 1; dd <= daysIn; dd++) {
        const d = new Date(first.getFullYear(), first.getMonth(), dd);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'day'; b.textContent = dd; b.dataset.t = d.getTime();
        if (d.getTime() === today.getTime()) b.classList.add('today');
        if (d < today) b.disabled = true;
        else if (isMoon(d)) { b.classList.add('moon'); b.disabled = true; b.title = 'full moon: closed'; }
        else if (isFull(d)) { b.classList.add('full'); b.disabled = true; b.title = 'full'; }
        const t = d.getTime();
        if (S.start && t === S.start.getTime()) b.classList.add('start');
        if (S.end && t === S.end.getTime()) b.classList.add('end');
        if (S.start && S.end && t > S.start.getTime() && t < S.end.getTime()) b.classList.add('in');
        b.setAttribute('aria-label', fmt(d) + (b.disabled ? ', unavailable' : ''));
        b.addEventListener('click', () => pickDay(d, b));
        grid.appendChild(b);
      }
      box.appendChild(grid); cal.appendChild(box);
    }
    monthsEl.textContent = names.join('  ·  ');
    $('#calPrev').disabled = view <= 0;
  }
  function pickDay(d, b) {
    if (!S.start || (S.start && S.end) || d <= S.start) { S.start = d; S.end = null; }
    else {
      for (let t = S.start.getTime() + DAY; t < d.getTime(); t += DAY) if (blocked(new Date(t))) { toast('there\'s a closed night in between. the moon, probably.'); return; }
      if ((d - S.start) / DAY > 14) { toast('fourteen nights at most. after that, you live here.'); return; }
      S.end = d;
    }
    const r = b.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, .7);
    renderCal(); update();
  }
  $('#calPrev').addEventListener('click', () => { view = Math.max(0, view - 1); renderCal(); });
  $('#calNext').addEventListener('click', () => { view = Math.min(10, view + 1); renderCal(); });

  /* ---------- (2) who ---------- */
  const gNum = $('#gNum');
  $('#gMinus').addEventListener('click', () => { S.guests = 1; gNum.textContent = 1; update(); });
  $('#gPlus').addEventListener('click', () => { if (S.guests === 2) toast('two is the most. it\'s a quiet house.'); S.guests = 2; gNum.textContent = 2; update(); });
  $('#gName').addEventListener('input', (e) => { S.name = e.target.value.trim(); update(false); });

  /* ---------- (3) the room ---------- */
  const rpicks = $$('.rpick');
  rpicks.forEach((lab) => $('input', lab).addEventListener('change', () => {
    rpicks.forEach((o) => o.classList.toggle('on', o === lab));
    S.room = { name: lab.dataset.name, price: +lab.dataset.price, k: lab.dataset.k, v: $('input', lab).value };
    const r = lab.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, 1);
    update();
  }));

  /* ---------- (4) rituals & small things ---------- */
  const tgs = $$('.tg');
  tgs.forEach((lab) => {
    const inp = $('input', lab);
    if (inp.disabled) { lab.classList.add('on', 'fixed'); return; }
    inp.addEventListener('change', () => {
      lab.classList.toggle('on', inp.checked);
      inp.checked ? S.rits.add(lab.dataset.name) : S.rits.delete(lab.dataset.name);
      update();
    });
  });

  /* ---------- (5) the vow: three promises and an ink signature ---------- */
  const vows = $$('.vow');
  vows.forEach((v) => v.addEventListener('change', () => update()));
  const pad = $('#signPad'), sc = $('#signCanvas'), sctx = sc.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const sizePad = () => {
    const keep = S.signed ? sc.toDataURL() : null;
    sc.width = pad.clientWidth * dpr; sc.height = pad.clientHeight * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0); sctx.lineCap = 'round'; sctx.lineJoin = 'round';
    if (keep) { const im = new Image(); im.onload = () => sctx.drawImage(im, 0, 0, pad.clientWidth, pad.clientHeight); im.src = keep; }
  };
  sizePad(); addEventListener('resize', sizePad);
  let drawing = false, lx = 0, ly = 0, lw = 3, lt = 0;
  const pos = (e) => { const r = pad.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  pad.addEventListener('pointerdown', (e) => { drawing = true; pad.setPointerCapture(e.pointerId); [lx, ly] = pos(e); lt = performance.now(); $('#signHint').style.opacity = 0; });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [x, y] = pos(e), now = performance.now();
    const v = Math.hypot(x - lx, y - ly) / Math.max(1, now - lt);
    const w = clamp(5.5 - v * 3.2, 1.2, 5.5);       // a brush: slow is thick, fast is thin
    lw += (w - lw) * .35;
    sctx.strokeStyle = 'rgba(20,16,14,.92)'; sctx.lineWidth = lw;
    sctx.beginPath(); sctx.moveTo(lx, ly); sctx.quadraticCurveTo(lx, ly, (lx + x) / 2, (ly + y) / 2); sctx.lineTo(x, y); sctx.stroke();
    lx = x; ly = y; lt = now;
    if (!S.signed) { S.signed = true; update(false); }
  });
  const endStroke = () => { drawing = false; };
  pad.addEventListener('pointerup', endStroke); pad.addEventListener('pointercancel', endStroke);
  $('#signClear').addEventListener('click', () => { sctx.clearRect(0, 0, sc.width, sc.height); S.signed = false; $('#signHint').style.opacity = 1; update(false); });

  /* ---------- the tag fills itself ---------- */
  const tagNo = [17, 3, 7, 12, 23, 41, 54, 77, 99, 108][Math.floor(Math.random() * 10)];
  $('#tagNo').textContent = tagNo;
  const totalEl = $('#tTotal'); let shownTotal = 0;
  function total() {
    const extras = tgs.filter((l) => S.rits.has(l.dataset.name)).reduce((a, l) => a + (+l.dataset.price) * S.guests, 0);
    return (S.room ? S.room.price * nights() : 0) + (S.room ? extras : 0);
  }
  function update(doSwing = true) {
    const n = nights();
    $('#tArrive').textContent = S.start ? fmt(S.start) : '—';
    $('#tNights').textContent = n ? `${n} night${n > 1 ? 's' : ''}` : (S.start ? 'pick the last morning' : '—');
    $('#tGuests').textContent = S.guests;
    $('#tRoom').textContent = S.room ? S.room.name : '—';
    $('#tRit').textContent = 2 + S.rits.size;
    $('#tagName').textContent = S.name || 'a guest';
    $('#tagK').textContent = S.room ? S.room.k : '雫';
    whenOut.textContent = S.start ? (n ? `${fmt(S.start)} → ${fmt(S.end)} · ${n} night${n > 1 ? 's' : ''} in the fog.` : `arriving ${fmt(S.start)}. now the morning you leave.`) : 'no nights yet.';
    $('#whoOut').textContent = S.guests === 2 ? `two guests${S.name ? `, ${S.name} and someone` : ''}. the futon is wide.` : `one guest${S.name ? `: ${S.name}` : ''}. a quiet one, probably.`;
    $('#roomOut').textContent = S.room ? `${S.room.name}, € ${S.room.price} a night${n ? ` · € ${S.room.price * n} for ${n}` : ''}.` : 'no room yet. take your time.';
    $('#ritOut').textContent = S.rits.size ? `two included, plus ${[...S.rits].join(', ')}.` : 'two included. the rest is up to you.';
    const t = total();
    if (motion && !document.hidden) gsap.to({ v: shownTotal }, { v: t, duration: 1, ease: 'power2.out', onUpdate() { totalEl.textContent = Math.round(this.targets()[0].v).toLocaleString('en-US'); }, onComplete: () => { totalEl.textContent = t.toLocaleString('en-US'); } });
    else totalEl.textContent = t.toLocaleString('en-US');
    shownTotal = t;
    // the step pills
    const done = [n > 0, true, !!S.room, true, vows.every((v) => v.checked) && S.signed];
    $$('#bkDots a').forEach((a, i) => a.classList.toggle('done', done[i] && (i !== 1 || S.name.length > 0) && (i !== 3 || S.rits.size > 0)));
    if (doSwing) swing();
  }
  // which step you're on
  if (motion) $$('.step').forEach((st, i) => ScrollTrigger.create({ trigger: st, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && $$('#bkDots a').forEach((a, j) => a.classList.toggle('now', i === j)) }));

  /* ---------- hand it over: the red stamp ---------- */
  const stamp = (instant) => {
    tag.classList.add('stamped');
    $('#tagFoot').textContent = S.start ? `see you at the bridge, ${fmt(S.start)}, 15:00` : 'see you at the bridge';
    $('#tagReset').hidden = false;
    if (!motion || instant) { gsap.set('#tagStamp', { opacity: .9, scale: 1 }); return; }
    gsap.timeline()
      .to('#tagStamp', { opacity: .92, scale: 1, duration: .35, ease: 'power4.in' })
      .to(tag, { y: 6, duration: .08, yoyo: true, repeat: 1 }, '-=.05')
      .add(() => {
        const r = tag.getBoundingClientRect();
        for (let i = 0; i < 12; i++) setTimeout(() => ripple(r.left + rand(0, r.width), r.top + rand(0, r.height), rand(.8, 1.8)), i * 80);
        swing(1.6);
      });
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const miss = !nights() ? ['#stWhen', 'pick your nights first. the fog can wait, but the calendar can\'t.']
      : !S.room ? ['#stRoom', 'choose a room. any of them. they\'re all quiet.']
      : !vows.every((v) => v.checked) ? ['#stVow', 'three small promises, please. you can do it.']
      : !S.signed ? ['#stVow', 'sign with your finger. it\'s ink, it\'s fine.'] : null;
    if (miss) {
      toast(miss[1], 3200);
      const el = $(miss[0]), y = el.getBoundingClientRect().top + scrollY - 90;
      if (SZ.lenis) SZ.lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: 'smooth' });
      if (miss[0] === '#stVow' && S.signed === false && vows.every((v) => v.checked)) { pad.classList.remove('bad'); void pad.offsetWidth; pad.classList.add('bad'); }
      return;
    }
    stamp();
    toast('reserved. nothing was sent: we\'re fictional. but we\'ll keep the water warm ♡', 5200);
    if (SZ.lenis && innerWidth < 1100) SZ.lenis.scrollTo(tag.getBoundingClientRect().top + scrollY - 140, { duration: 1.4 });
  });
  // start again: a clean page, nothing was ever kept
  $('#tagReset').addEventListener('click', () => location.reload());

  renderCal(); update(false);

  if (motion) {
    gsap.from('.bk-steps-title', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#bkSteps', start: 'top 70%' } });
    $$('.step').forEach((st) => gsap.from(st.children, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: st, start: 'top 80%' } }));
    gsap.from(tag, { y: -120, rotation: -8, opacity: 0, duration: 2, ease: 'elastic.out(1, .4)', scrollTrigger: { trigger: '.bk-grid', start: 'top 70%' } });
  }

  /* =========================================================
     03 · ALWAYS INCLUDED / 04 · THE SMALL PRINT
     ========================================================= */
  if (motion) {
    gsap.from('#incl li', { y: 50, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '#incl', start: 'top 85%' } });
    gsap.from('#faq summary', { yPercent: 50, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '#faq', start: 'top 85%' } });
    $$('#faq details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) gsap.from($('p', d), { y: -10, opacity: 0, duration: .7, ease: 'expo.out' }); }));
  }

  /* =========================================================
     05 · SEE YOU. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫', n: 14, sizes: [12, 30] });
    const letters = $$('#getinTitle span:not(.sp)');
    const dropEl = $('#getinDrop');
    let dropT = null;
    const fall = () => {
      const h = getin.clientHeight, land = h * .72, lx = rand(.3, .7);
      gsap.set(dropEl, { left: lx * 100 + '%' });
      gsap.timeline()
        .fromTo(dropEl, { y: -30, opacity: 1, scaleY: 1.5 }, { y: land, scaleY: 1, duration: .9, ease: 'power2.in' })
        .to(dropEl, { opacity: 0, scaleY: .2, scaleX: 2, duration: .12, onStart: () => {
          pool.dropLocal(lx, .72, 7, 1300);
          const r = getin.getBoundingClientRect();
          ripple(r.left + r.width * lx, r.top + land, 1.4);
          letters.forEach((l) => {
            const lr = l.getBoundingClientRect();
            const d = Math.abs(lr.left + lr.width / 2 - (r.left + r.width * lx));
            gsap.fromTo(l, { y: 0 }, { keyframes: [{ y: -14, duration: .25, ease: 'sine.out' }, { y: 0, duration: 1.4, ease: 'elastic.out(1, .3)' }], delay: d / 900, overwrite: 'auto' });
          });
        } })
        .set(dropEl, { scaleX: 1 });
    };
    if (motion) {
      gsap.from(letters, { yPercent: 70, opacity: 0, filter: 'blur(16px)', stagger: .09, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: getin, start: 'top 55%' } });
      gsap.from('.getin-foot > *', { y: 20, opacity: 0, stagger: .1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: getin, start: 'top 40%' } });
      inView(getin, (v) => { clearInterval(dropT); if (v) { setTimeout(fall, 900); dropT = setInterval(fall, 3800); } }, '-20%');
    }
  }
})();
