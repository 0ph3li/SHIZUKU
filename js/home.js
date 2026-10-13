/* =========================================================
   SHIZUKU 雫 — home.js
   the surface (water you can touch, characters that float, little numbers),
   what we do here, five waters, locker 17, three rituals, get in.
   one water engine and one floating layer, used all the way down.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, chars, ripple, scramble, ready, makeWater, floatLayer } = window.SZ;
  const inView = (el, cb, margin = '120px') => {
    const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: margin });
    io.observe(el); return io;
  };

  /* =========================================================
     01 · THE SURFACE
     ========================================================= */
  const hero = $('#hero');
  // black water, moonlight, a lotus: what you see until hero.jpg arrives
  function lotusPainter(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a1f25'); g.addColorStop(.5, '#0c0f13'); g.addColorStop(1, '#050709');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    let rg = ctx.createRadialGradient(W * .28, H * .2, 0, W * .28, H * .2, W * .55);
    rg.addColorStop(0, 'rgba(205,214,224,.26)'); rg.addColorStop(1, 'rgba(205,214,224,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    const cx = W * .5, cy = H * .64, s = Math.min(W, H) * .19;
    for (let i = 1; i < 11; i++) {
      ctx.strokeStyle = `rgba(220,226,232,${.13 - i * .009})`;
      ctx.lineWidth = 1 + (i % 3) * .8;
      ctx.beginPath(); ctx.ellipse(cx, cy + s * .1, i * s * .42, i * s * .42 * .26, 0, 0, Math.PI * 2); ctx.stroke();
    }
    rg = ctx.createRadialGradient(cx, cy + s * .25, 0, cx, cy + s * .25, s * 2.2);
    rg.addColorStop(0, 'rgba(243,196,210,.22)'); rg.addColorStop(1, 'rgba(243,196,210,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    const petal = (rot, len, wid, tip) => {
      ctx.save(); ctx.rotate(rot);
      const pg = ctx.createLinearGradient(0, 0, 0, -len);
      pg.addColorStop(0, 'rgba(236,170,190,.95)'); pg.addColorStop(.55, 'rgba(250,228,236,.97)'); pg.addColorStop(1, tip);
      ctx.fillStyle = pg; ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(wid, -len * .45, 0, -len); ctx.quadraticCurveTo(-wid, -len * .45, 0, 0); ctx.fill();
      ctx.restore();
    };
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .92);
    for (let i = -4; i <= 4; i++) petal(i * .34, s * (1.05 - Math.abs(i) * .06), s * .34, 'rgba(255,255,255,.9)');
    for (let i = -2; i <= 2; i++) petal(i * .26, s * .78, s * .3, 'rgba(255,255,255,1)');
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .18; ctx.translate(cx, cy + s * .12); ctx.scale(1, -.35);
    for (let i = -3; i <= 3; i++) petal(i * .34, s * .9, s * .3, 'rgba(255,255,255,.6)');
    ctx.restore();
  }
  // plain black water with a little moon in it (the pool at the end)
  function darkPainter(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W * .7, H * .32, 0, W * .7, H * .32, W * .35);
    rg.addColorStop(0, 'rgba(200,212,224,.2)'); rg.addColorStop(1, 'rgba(200,212,224,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(230,236,242,.55)';
    ctx.beginPath(); ctx.ellipse(W * .7, H * .32, W * .018, W * .018, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(200,212,224,.08)';
    for (let i = 0; i < 60; i++) { const y = rand(0, H); ctx.lineWidth = rand(.5, 1.5); ctx.beginPath(); ctx.moveTo(rand(0, W * .5), y); ctx.lineTo(rand(W * .5, W), y + rand(-2, 2)); ctx.stroke(); }
  }

  const heroMedia = $('#heroMedia');
  const water = makeWater({ host: heroMedia, canvas: $('#heroWater'), painter: lotusPainter, maxW: innerWidth < 700 ? 420 : 680, img: $(':scope > img', heroMedia) });
  heroMedia.addEventListener('slot:load', (e) => water.setSource(e.detail));
  water.bind(hero);

  const heroFloat = floatLayer($('#heroKanji'), hero, { pool: '雫雫雫霧霧滝山水静湯', n: innerWidth < 700 ? 16 : 30, intro: true });

  /* ---------- the little numbers, (1) to (17) ---------- */
  const nums = $('#heroNums');
  if (nums) {
    const spots = [[.30, .30], [.52, .66], [.10, .22], [.06, .55], [.47, .27], [.21, .73], [.31, .79], [.26, .44], [.20, .55], [.66, .62], [.69, .16], [.08, .40], [.56, .19], [.88, .86], [.40, .38], [.74, .37], [.37, .17]];
    const wordsList = ['breathe', 'soak', 'fog', 'cedar', 'yuzu', 'silence', 'waterfall', 'stone', 'moss', 'tea', 'lantern', 'mountain', 'drop', 'float', 'sleep', 'night', 'you'];
    spots.forEach(([x, y], i) => {
      const bt = document.createElement('button');
      bt.textContent = `(${i + 1})`; bt.dataset.w = wordsList[i]; bt.dataset.cursor = wordsList[i];
      bt.style.left = (x * 100) + '%'; bt.style.top = (y * 100) + '%';
      bt.style.opacity = [1, .8, .55, .35][i % 4];
      bt.setAttribute('aria-label', `drop: ${wordsList[i]}`);
      bt.addEventListener('click', (e) => { e.stopPropagation(); const r = bt.getBoundingClientRect(); water.drop(r.left + r.width / 2, r.top + r.height / 2, 7, 1100); ripple(r.left + r.width / 2, r.top + r.height / 2, 1.2); });
      nums.appendChild(bt);
    });
    if (motion) $$('button', nums).forEach((bt) => gsap.to(bt, { opacity: () => rand(.15, 1), duration: () => rand(1.2, 3), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: rand(0, 3) }));
  }

  /* ---------- the title falls in, drop by drop ---------- */
  const titleLetters = $$('#heroTitle span');
  ready(() => {
    if (!motion) return;
    const order = titleLetters.map((_, i) => i).sort(() => Math.random() - .5);
    const tl = gsap.timeline();
    order.forEach((i, n) => {
      const el = titleLetters[i];
      const at = .15 + n * .13;
      tl.fromTo(el, { y: -innerHeight * .75, scaleY: 1.9, scaleX: .55, opacity: 0, filter: 'blur(6px)' },
        { y: 0, scaleY: 1, scaleX: 1, opacity: 1, filter: 'blur(0px)', duration: .75, ease: 'power3.in', transformOrigin: '50% 100%' }, at)
        .to(el, { scaleY: .72, scaleX: 1.22, duration: .1, ease: 'power1.out', transformOrigin: '50% 100%', onStart: () => {
          const r = el.getBoundingClientRect();
          water.drop(r.left + r.width / 2, r.bottom - r.height * .2, 6, 1000);
          ripple(r.left + r.width / 2, r.bottom - r.height * .2, .8);
        } }, at + .75)
        .to(el, { scaleY: 1, scaleX: 1, duration: 1.1, ease: 'elastic.out(1, .35)' }, at + .85);
    });
    heroFloat.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.6, 2.6), ease: 'expo.out', delay: .3 + i * .04 }));
    tl.from('.hero-info', { opacity: 0, y: 20, filter: 'blur(6px)', duration: 1.2, ease: 'expo.out' }, .9)
      .from('.hero-sub', { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.6, ease: 'expo.out' }, 1.3)
      .from('.hero-foot > *, .hero-vert', { opacity: 0, y: 14, stagger: .1, duration: 1.2, ease: 'expo.out' }, 1.5)
      .from('#heroNums button', { scale: 0, duration: .9, stagger: { each: .04, from: 'random' }, ease: 'back.out(3)' }, 1.1)
      .add(() => titleLetters.forEach((el, i) => gsap.to(el, { y: () => rand(-10, 10), duration: rand(2.4, 3.6), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .2 })));
  });

  // scrolling away: the letters sink, the characters rise
  if (motion) {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('#heroTitle', { yPercent: 70, filter: 'blur(14px)', opacity: .15, ease: 'none', scrollTrigger: st });
    gsap.to('#heroKanji', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-sub, .hero-info, .hero-vert', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: st });
    gsap.to('#heroMedia', { scale: 1.12, ease: 'none', scrollTrigger: st });
  }

  /* =========================================================
     02 · STILL — the words surface out of the water, one by one
     ========================================================= */
  const still = $('#still');
  if (still) {
    floatLayer($('.float-layer', still), still, { pool: still.querySelector('.float-layer').dataset.float, n: +still.querySelector('.float-layer').dataset.n, sizes: [12, 34] });
    const text = $('#stillText');
    // words become .sw; <sup> and <em> stay whole
    [...text.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'sw'; s.textContent = p; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) n.classList.add('sw');
    });
    if (motion) {
      const ws = $$('.sw', text);
      gsap.fromTo(ws, { opacity: .08, filter: 'blur(9px)', y: (i) => Math.sin(i * .9) * 18 },
        { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: .1, scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: 1 } });
      gsap.from($$('li', $('#stillNotes')), { opacity: 0, y: 24, filter: 'blur(6px)', stagger: .12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#stillNotes', start: 'top 92%' } });
    }
  }

  /* =========================================================
     03 · FIVE WATERS — an index; the photo follows you, rippling
     ========================================================= */
  const index = $('#baths');
  if (index) {
    const rows = $$('.row', index);
    const fl = floatLayer($('#bathFloat'), index, { pool: '雫', n: +$('#bathFloat').dataset.n, sizes: [16, 54] });
    const layer = $('#bathFloat');
    layer.style.opacity = 0;
    const preview = $('#preview'), label = $('#previewLabel');
    rows.forEach((r) => r.style.setProperty('--tone', r.dataset.tone));

    // without a photo: a dark pool in the bath's colour, with its character in it
    const tonePainter = (row) => (ctx, W, H) => {
      ctx.fillStyle = '#0a0d10'; ctx.fillRect(0, 0, W, H);
      let g = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, W * .9);
      g.addColorStop(0, row.dataset.tone); g.addColorStop(1, 'rgba(10,13,16,0)');
      ctx.globalAlpha = .55; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      for (let i = 0; i < 26; i++) { ctx.strokeStyle = `rgba(255,255,255,${rand(.03, .1)})`; ctx.lineWidth = 1; const y = rand(0, H); ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(W * .3, y + rand(-8, 8), W * .7, y + rand(-8, 8), W, y); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `300 ${W * .42}px "Noto Serif JP", serif`; ctx.fillText(row.dataset.k, W * .5, H * .46);
    };

    if (fine && motion && preview) {
      const pw = makeWater({ host: preview, canvas: $('#previewWater'), painter: tonePainter(rows[0]), maxW: 340, rain: false, damp: .03 });
      const xTo = gsap.quickTo(preview, 'x', { duration: .7, ease: 'power3' });
      const yTo = gsap.quickTo(preview, 'y', { duration: .7, ease: 'power3' });
      const rotTo = gsap.quickTo(preview, 'rotation', { duration: .8, ease: 'power3' });
      let lx = 0, ly = 0, cur = null;
      index.addEventListener('pointermove', (e) => {
        const r = index.getBoundingClientRect();
        const x = e.clientX - r.left - preview.offsetWidth / 2, y = e.clientY - r.top - preview.offsetHeight / 2;
        xTo(x); yTo(y); rotTo(clamp((e.clientX - lx) * .4, -8, 8));
        const v = Math.hypot(e.clientX - lx, e.clientY - ly);
        if (cur && v > 4) pw.dropLocal(.5 - (e.clientX - lx) * .004, .5 - (e.clientY - ly) * .004, 3, clamp(v * 14, 80, 500));
        lx = e.clientX; ly = e.clientY;
      });
      rows.forEach((row) => row.addEventListener('pointerenter', () => {
        cur = row;
        const img = $('.row-media .slot > img', row);
        pw.setSource(img || null, tonePainter(row));
        label.textContent = img ? '' : $('.row-media .slot', row).dataset.img.replace('HOME/', '');
        pw.dropLocal(.5, .5, 8, 1200);
        gsap.to(preview, { opacity: 1, scale: 1, duration: .6, ease: 'expo.out' });
        fl.setChars(row.dataset.k);
        gsap.fromTo(fl.items.map((k) => k.el), { scale: .4 }, { scale: 1, duration: .9, ease: 'back.out(2.5)', stagger: { each: .015, from: 'random' } });
        gsap.to(layer, { opacity: 1, duration: .6 });
        ripple(lx, ly, .7);
      }));
      $('#bathList').addEventListener('pointerleave', () => {
        cur = null;
        gsap.to(preview, { opacity: 0, scale: .6, duration: .5, ease: 'power3.in' });
        gsap.to(layer, { opacity: 0, duration: .8 });
      });
    } else layer.style.opacity = 1;

    if (motion) {
      gsap.from(rows.map((r) => r.firstElementChild), { yPercent: 60, opacity: 0, filter: 'blur(10px)', stagger: .1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#bathList', start: 'top 85%' } });
      gsap.from('.index-head', { opacity: 0, duration: 1.2, scrollTrigger: { trigger: index, start: 'top 80%' } });
    }
  }

  /* =========================================================
     04 · LOCKER 17 — the phone you left behind, as an app board
     ========================================================= */
  const app = $('#locker');
  if (app) {
    const { store, toast } = window.SZ;
    const grid = $('#apGrid');
    const panels = $$('.ap', grid);
    const steam = document.createElement('i'); steam.className = 'ap-steam'; grid.appendChild(steam);

    // the board boots: panels pop up out of a blur, one by one; then css takes over (tabs, hover)
    const settle = (els) => els.forEach((el) => el.classList.add('in'));
    if (motion) {
      gsap.set(panels, { opacity: 0, y: 70, scale: .92, filter: 'blur(14px)' });
      ScrollTrigger.batch(panels, {
        start: 'top 92%', once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out', stagger: .07, clearProps: 'opacity,transform,filter', onComplete: () => settle(batch) }),
      });
      gsap.from('.ap-top > *, .ap-bottom > *', { y: 30, opacity: 0, stagger: .08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: app, start: 'top 75%' } });
    } else settle(panels);

    /* ---------- tabs: home / photos / steam / audio ---------- */
    const tabs = $$('#apTabs button'), ind = $('#apInd');
    const moveInd = (b, inst) => {
      const p = { x: b.offsetLeft, width: b.offsetWidth };
      if (motion && !inst) gsap.to(ind, { ...p, duration: .7, ease: 'elastic.out(1, .6)' }); else gsap.set(ind, p);
    };
    moveInd(tabs[0], true);
    addEventListener('resize', () => moveInd($('#apTabs button.on'), true));
    tabs.forEach((b) => b.addEventListener('click', () => {
      tabs.forEach((o) => o.classList.toggle('on', o === b));
      moveInd(b);
      app.dataset.view = b.dataset.tab;
      if (b.dataset.tab === 'audio' && !playing) setPlay(true);
      const r = b.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, .8);
    }));

    /* ---------- the icon rail ---------- */
    const rail = $('#apRail'), railInd = $('#apRailInd');
    const railBtns = $$('button:not(.ap-power)', rail);
    const moveRail = (b, inst) => {
      const across = rail.clientWidth > rail.clientHeight;   // a row on mobile, a column otherwise
      const p = across ? { x: b.offsetLeft, y: 0 } : { x: 0, y: b.offsetTop };
      if (motion && !inst) gsap.to(railInd, { ...p, duration: .6, ease: 'back.out(2)' }); else gsap.set(railInd, p);
    };
    moveRail(railBtns[0], true);
    addEventListener('resize', () => moveRail($('button.on', rail) || railBtns[0], true));
    railBtns.forEach((b) => b.addEventListener('click', () => { railBtns.forEach((o) => o.classList.toggle('on', o === b)); moveRail(b); }));

    // power: the board switches off like an old screen
    const off = $('#apOff');
    let powTl = null;
    $('#apPower').addEventListener('click', () => {
      if (playing) setPlay(false);
      off.setAttribute('aria-hidden', 'false');
      if (!motion) { off.style.visibility = 'visible'; off.style.opacity = 1; return; }
      if (powTl) powTl.progress(1).kill();
      powTl = gsap.timeline()
        .to(grid, { scaleY: .006, scaleX: 1.02, filter: 'brightness(3)', duration: .35, ease: 'power3.in' })
        .to(grid, { scaleX: 0, opacity: 0, duration: .25, ease: 'power3.in' })
        .set(off, { visibility: 'visible' })
        .to(off, { opacity: 1, duration: .6 })
        .from('.ap-off > *', { y: 20, opacity: 0, stagger: .12, duration: 1, ease: 'expo.out' }, '<');
    });
    $('#apOn').addEventListener('click', () => {
      off.setAttribute('aria-hidden', 'true');
      if (!motion) { off.style.visibility = 'hidden'; off.style.opacity = 0; return; }
      if (powTl) powTl.progress(1).kill();
      powTl = gsap.timeline()
        .to(off, { opacity: 0, duration: .4 })
        .set(off, { visibility: 'hidden' })
        .fromTo(grid, { scaleX: 0, scaleY: .006, opacity: 1 }, { scaleX: 1, duration: .3, ease: 'power3.out' })
        .to(grid, { scaleY: 1, filter: 'brightness(1)', duration: .6, ease: 'expo.out', clearProps: 'transform,filter,opacity' });
      toast('back on. 3% battery, no signal. it\'s fine.');
    });

    /* ---------- search: a placeholder that types itself ---------- */
    const search = $('#apSearch');
    const WORDS = ['search a feeling…', 'tired', 'too many tabs', '38°', 'nothing, for once'];
    let wi = 0, ci = 0, del = false;
    const typeT = setInterval(() => {
      if (document.activeElement === search) return;
      const w = WORDS[wi];
      ci += del ? -1 : 1;
      search.placeholder = w.slice(0, ci);
      if (!del && ci >= w.length + 12) del = true;
      if (del && ci <= 0) { del = false; wi = (wi + 1) % WORDS.length; }
    }, 90);
    const FEEL = [
      [/tired|exhaust|sleep|stanc/, 'the quiet room. a bed, a lamp, no clock.'],
      [/sad|cry|lonely|trist|heart/, 'the night bath. the water won\'t tell anyone.'],
      [/anx|stress|panic|ansia|busy|work|tab/, 'the silent hour. we\'ll take your watch.'],
      [/cold|freddo|numb/, 'the lotus pool, 36°. like a hug that doesn\'t ask questions.'],
      [/hungover|party|hot|angry|rabbi/, 'the falls basin. 12°, thirty seconds. you\'ll be new.'],
    ];
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = search.value.toLowerCase().trim();
      if (!q) return;
      const hit = FEEL.find(([re]) => re.test(q));
      toast(hit ? hit[1] : `"${q.slice(0, 24)}"? take the fog walk. it fixes most things.`, 4200);
      search.value = '';
    });
    $('#apTrack').addEventListener('click', () => { toast('tracking: nothing. your location is "somewhere in the fog".'); });
    $('#apMore').addEventListener('click', () => { toast('there is no more. that\'s the point.'); });

    /* ---------- profile ---------- */
    $('#apGuest').textContent = store.get('guest', null) || (() => { const g = String((Math.random() * 9000 + 1000) | 0); store.set('guest', g); return g; })();
    $('#apProfile').addEventListener('click', () => toast('profile: wet. relaxed. unavailable.'));
    $('#apMessage').addEventListener('click', () => toast('messages are off past the curtain. write a postcard.'));

    /* ---------- notifications ---------- */
    const notesEl = $('#apNotes');
    const NOTES = [
      ['06:00', 'today', 'the cold plunge', 'is open. we dare you.'],
      ['07:12', 'today', 'locker 17', 'your phone is asleep. let it.'],
      ['09:30', 'today', 'tea room', 'genmaicha is ready, too hot, on purpose.'],
      ['11:04', 'today', 'waterfall no. 41', 'especially loud today. it\'s rained all night.'],
      ['13:30', 'today', 'the fog', 'at 97%. the mountain is there. trust us.'],
      ['16:20', 'today', 'reminder', 'you don\'t have to reply to anything.'],
      ['21:00', 'tonight', 'night garden', 'lanterns on. the bath opens at 23:00.'],
    ];
    let filter = 'seen', ni = 0, notesT = null;
    const addNote = (seen) => {
      const [t, d, who, m] = NOTES[ni++ % NOTES.length];
      const li = document.createElement('li');
      if (seen) li.className = 'seen';
      li.innerHTML = `<time>${t}<small>${d}</small></time><p><b></b><span></span></p>`;
      $('b', li).textContent = who; $('span', li).textContent = m;
      li.addEventListener('click', () => (motion ? gsap.to(li, { x: 80, opacity: 0, duration: .45, ease: 'power2.in', onComplete: () => li.remove() }) : li.remove()));
      notesEl.prepend(li);
      if (motion && !seen) gsap.from(li, { y: -24, opacity: 0, scale: .94, filter: 'blur(6px)', duration: .9, ease: 'expo.out' });
      while (notesEl.children.length > 4) notesEl.lastElementChild.remove();
    };
    for (let i = 0; i < 4; i++) addNote(true);
    $$('#apToggle button').forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.f;
      $$('#apToggle button').forEach((o) => o.classList.toggle('on', o === b));
      $$('li', notesEl).forEach((li) => li.classList.toggle('seen', filter === 'seen'));
      clearInterval(notesT);
      if (filter === 'all') { addNote(false); notesT = setInterval(() => addNote(false), 3000); }
    }));

    /* ---------- the post: double tap to like ---------- */
    const postPh = $('#apPostPh'), likes = $('#apLikes');
    let liked = 1200;
    const like = () => {
      liked++; likes.textContent = (liked / 1000).toFixed(liked > 9999 ? 0 : 1) + 'k';
      const h = document.createElement('span'); h.className = 'ap-burst'; h.textContent = '♥'; postPh.appendChild(h);
      if (motion) {
        gsap.fromTo(h, { scale: 0, opacity: 1 }, { scale: 1.2, duration: .45, ease: 'back.out(3)' });
        gsap.to(h, { y: -60, opacity: 0, duration: .6, delay: .5, ease: 'power2.in', onComplete: () => h.remove() });
        gsap.fromTo('.ap-heart', { scale: 1.8 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' });
      } else setTimeout(() => h.remove(), 800);
    };
    postPh.addEventListener('dblclick', like);
    let lastTap = 0;
    postPh.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') { const n = Date.now(); if (n - lastTap < 300) like(); lastTap = n; } });
    $('#apFollow').addEventListener('click', (e) => { const on = e.currentTarget.classList.toggle('on'); e.currentTarget.textContent = on ? 'following' : 'follow'; });

    /* ---------- rings: the first 24 hours ---------- */
    const rings = $$('#apRings figure');
    const fillRings = () => rings.forEach((f) => {
      const v = +f.dataset.v, c = $('.v', f), b = $('b', f), o = { v: 0 };
      if (!motion) { c.style.strokeDashoffset = 201 * (1 - v / 100); b.textContent = v + '%'; return; }
      gsap.to(o, { v, duration: 2.2, ease: 'expo.out', onUpdate: () => { c.style.strokeDashoffset = 201 * (1 - o.v / 100); b.textContent = Math.round(o.v) + '%'; } });
    });
    if (motion) ScrollTrigger.create({ trigger: '#apRings', start: 'top 85%', once: true, onEnter: () => setTimeout(fillRings, 500) }); else fillRings();

    /* ---------- the player: rain made up on the spot (web audio) ---------- */
    const TRACKS = [
      { name: 'Rain On Cedar', by: 'Shizuku FM', bp: 1500, q: .5, lp: 6000, drops: [70, 240], drone: 0 },
      { name: 'Lotus Pool, 3am', by: 'Shizuku FM', bp: 520, q: .8, lp: 1500, drops: [400, 1400], drone: .04 },
      { name: 'Fog Room Hum', by: 'Shizuku FM', bp: 240, q: 1.1, lp: 650, drops: [1300, 3200], drone: .09 },
    ];
    const player = $('#apPlayer'), playBtn = $('#apPlay');
    let ac = null, master, bp, lp, droneG, playing = false, tIdx = 0, dripT = null, startedAt = 0, played = 0;
    function initAudio() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      let l = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; l = (l + .02 * w) / 1.02; d[i] = (w * .5 + l * 3) * .5; }
      const noise = ac.createBufferSource(); noise.buffer = buf; noise.loop = true;
      bp = ac.createBiquadFilter(); bp.type = 'bandpass';
      lp = ac.createBiquadFilter(); lp.type = 'lowpass';
      const ng = ac.createGain(); ng.gain.value = .55;
      noise.connect(bp); bp.connect(lp); lp.connect(ng); ng.connect(master); noise.start();
      const drone = ac.createOscillator(); drone.type = 'sine'; drone.frequency.value = 55;
      droneG = ac.createGain(); droneG.gain.value = 0; drone.connect(droneG); droneG.connect(master); drone.start();
      applyTrack();
      return true;
    }
    function applyTrack() {
      const tr = TRACKS[tIdx];
      $('#apTrackName').textContent = tr.name; $('#apTrackBy').textContent = tr.by;
      if (!ac) return;
      const t = ac.currentTime;
      bp.frequency.setTargetAtTime(tr.bp, t, .4); bp.Q.setTargetAtTime(tr.q, t, .4);
      lp.frequency.setTargetAtTime(tr.lp, t, .4); droneG.gain.setTargetAtTime(tr.drone, t, .8);
    }
    function drip() {
      if (!playing) return;
      const tr = TRACKS[tIdx], t = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain(), f = rand(800, 2400);
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + .07);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rand(.02, .07), t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .14);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .16);
      dripT = setTimeout(drip, rand(tr.drops[0], tr.drops[1]));
    }
    function setPlay(on) {
      if (on && !ac && !initAudio()) { toast('your browser can\'t hear rain. imagine it.'); return; }
      playing = on;
      player.classList.toggle('playing', on);
      playBtn.setAttribute('aria-label', on ? 'Pause the rain' : 'Play the rain');
      playBtn.dataset.cursor = on ? 'shh' : 'listen';
      if (on) { ac.resume(); master.gain.setTargetAtTime(.6, ac.currentTime, .4); startedAt = performance.now(); clearTimeout(dripT); drip(); tickTime(); }
      else if (ac) { master.gain.setTargetAtTime(0, ac.currentTime, .25); clearTimeout(dripT); played += performance.now() - startedAt; }
    }
    const timeEl = $('#apTime'), bar = $('#apBar');
    function tickTime() {
      if (!playing) return;
      const ms = played + performance.now() - startedAt, s = (ms / 1000) | 0;
      timeEl.textContent = `${String((s / 60) | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      bar.style.width = ((ms / 180000) % 1) * 100 + '%';
      requestAnimationFrame(tickTime);
    }
    playBtn.addEventListener('click', () => setPlay(!playing));
    const skip = (d) => { tIdx = (tIdx + d + TRACKS.length) % TRACKS.length; applyTrack(); scramble($('#apTrackName'), TRACKS[tIdx].name, 600); };
    $('#apNext').addEventListener('click', () => skip(1));
    $('#apPrev').addEventListener('click', () => skip(-1));
    $('#apShuffle').addEventListener('click', () => skip(1 + ((Math.random() * 2) | 0)));
    inView(app, (v) => { if (!v && playing) setPlay(false); }, '0px');

    /* ---------- presave the next full moon ---------- */
    const nextFull = () => {
      const syn = 29.530588 * 864e5, ref = new Date(2000, 0, 21, 4, 40).getTime();
      let t = ref + Math.ceil((Date.now() - ref) / syn) * syn;
      return new Date(t);
    };
    $('#apRemind').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, 1.4);
      toast('we\'ll send a drop on the full moon. (we won\'t, we\'re fictional ♡)', 3400);
    });
    $('#apWhen').addEventListener('click', () => {
      const d = nextFull();
      scramble($('#apMoon'), `next full moon: ${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}. night bath, lanterns off.`, 900);
    });
    $$('[data-noop]', app).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toast('partners of the house. fictional, but they smell nice.'); }));
  }

  /* =========================================================
     05 · RITUALS — a diptych; numbers float across both halves
     ========================================================= */
  const RITUALS = [
    { n: 'i', title: 'the fog walk', meta: '60 min · included', text: 'the cedar boardwalk, into the fog, to the third waterfall and back. no talking, no phone, no destination. you\'ll hear the falls long before you see them.' },
    { n: 'ii', title: 'the snow bath', meta: '45 min · € 44', text: 'an open-air pool under the eaves while snow settles on the stone guardians. hot water, cold face. nobody says a word, not even them.' },
    { n: 'iii', title: 'the night room', meta: '90 min · € 96', text: 'after 23:00, a cedar tub by a paper window, one lantern, the falls outside. you can cry in here; the water won\'t tell anyone.' },
  ];
  const dip = $('#rituals');
  if (dip) {
    const pin = $('.dip-pin', dip);
    const halves = $$('.dip-half', dip).map((h) => $$('.dip-img', h));
    const numsEl = $('#dipNums'), titleEl = $('#dipTitle'), metaEl = $('#dipMeta'), textEl = $('#dipText'), countEl = $('#dipCount');
    // the same numbers, the same places, on both halves (like the board)
    const N = 17, layouts = RITUALS.map(() => Array.from({ length: N }, () => [rand(.04, .46), rand(.12, .86)]));
    const pts = layouts[0].map(([x, y]) => ({ x, y, ph: rand(0, 6.28) }));
    const spans = [];
    for (let h = 0; h < 2; h++) for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      s.textContent = `(${i + 1})`; s.style.opacity = [1, .75, .5, .3][i % 4];
      numsEl.appendChild(s); spans.push({ el: s, i, h });
    }
    let pw = pin.clientWidth, ph = pin.clientHeight;
    addEventListener('resize', () => { pw = pin.clientWidth; ph = pin.clientHeight; });
    const stacked = () => innerWidth <= 800;
    const drawNums = () => {
      const t = performance.now() / 1000, st = stacked();
      for (const s of spans) {
        const p = pts[s.i];
        const dx = Math.sin(t * .5 + p.ph) * 6, dy = Math.cos(t * .4 + p.ph) * 5;
        const x = st ? p.x * 2 * pw : (p.x + s.h * .5) * pw;
        const y = st ? (p.y * .5 + s.h * .5) * ph : p.y * ph;
        s.el.style.transform = `translate3d(${(x + dx).toFixed(1)}px,${(y + dy).toFixed(1)}px,0)`;
      }
    };
    if (motion) { let on = false; inView(dip, (v) => (on = v), '0px'); gsap.ticker.add(() => on && drawNums()); } else drawNums();

    halves.forEach((imgs) => imgs.forEach((im, i) => { im.style.zIndex = i === 0 ? 1 : 0; }));
    let cur = 0, z = 2;
    const setText = (r) => {
      titleEl.textContent = r.title; titleEl._chars = null;
      metaEl.textContent = r.meta; textEl.textContent = r.text; countEl.textContent = r.n;
    };
    function go(i) {
      if (i === cur) return;
      const r = RITUALS[i];
      // the new photos open like a ripple from one of the numbers
      const from = layouts[cur][(Math.random() * N) | 0];
      const cx = (from[0] * 2 * 100).toFixed(1) + '%', cy = (from[1] * 100).toFixed(1) + '%';
      z++;
      halves.forEach((imgs) => {
        const im = imgs[i];
        im.style.zIndex = z;
        if (motion) gsap.fromTo(im, { clipPath: `circle(0% at ${cx} ${cy})` }, { clipPath: `circle(150% at ${cx} ${cy})`, duration: 1.6, ease: 'expo.inOut' });
      });
      cur = i;
      if (!motion) { setText(r); return; }
      const r0 = titleEl.getBoundingClientRect();
      ripple(r0.left + r0.width * from[0] * 2, r0.top + r0.height / 2, 2);
      layouts[i].forEach(([x, y], k) => gsap.to(pts[k], { x, y, duration: rand(1.2, 2), ease: 'expo.inOut' }));
      const old = chars(titleEl);
      gsap.timeline()
        .to(old, { yPercent: -60, opacity: 0, filter: 'blur(8px)', duration: .4, stagger: { each: .015, from: 'random' }, ease: 'power2.in' })
        .to([metaEl, textEl], { opacity: 0, y: -10, duration: .3 }, 0)
        .add(() => setText(r))
        .add(() => {
          gsap.fromTo(chars(titleEl), { yPercent: 80, opacity: 0, filter: 'blur(10px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: { each: .03, from: 'random' }, ease: 'expo.out' });
          scramble(metaEl, r.meta, 700);
          gsap.fromTo([metaEl, textEl], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'expo.out' });
        });
    }
    if (motion) {
      ScrollTrigger.create({
        trigger: dip, start: 'top top', end: '+=220%', pin, scrub: true,
        onUpdate: (s) => go(Math.min(RITUALS.length - 1, Math.floor(s.progress * RITUALS.length))),
      });
      gsap.from(chars(titleEl), { yPercent: 80, opacity: 0, filter: 'blur(10px)', duration: 1.4, stagger: { each: .04, from: 'random' }, ease: 'expo.out', scrollTrigger: { trigger: dip, start: 'top 60%' } });
    } else {
      // no motion: tap the title to see the next one
      titleEl.addEventListener('click', () => go((cur + 1) % RITUALS.length));
    }
  }

  /* =========================================================
     06 · GET IN — a drop falls, the pool answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫茶', n: 14, sizes: [12, 30] });
    const letters = $$('#getinTitle span:not(.sp)');
    const dropEl = $('#getinDrop');
    let dropT = null;
    const fall = () => {
      const h = getin.clientHeight, land = h * .72;
      const lx = rand(.3, .7);
      gsap.set(dropEl, { left: lx * 100 + '%' });
      gsap.timeline()
        .fromTo(dropEl, { y: -30, opacity: 1, scaleY: 1.5 }, { y: land, scaleY: 1, duration: .9, ease: 'power2.in' })
        .to(dropEl, { opacity: 0, scaleY: .2, scaleX: 2, duration: .12, onStart: () => {
          pool.dropLocal(lx, .72, 7, 1300);
          const r = getin.getBoundingClientRect();
          ripple(r.left + r.width * lx, r.top + land, 1.4);
          // the letters feel it, nearest first
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
