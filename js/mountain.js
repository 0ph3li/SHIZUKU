/* =========================================================
   SHIZUKU 雫 — mountain.js
   the peaks in the fog (banks of fog on two layers, the title between them), the way up,
   a map of 108 waterfalls you can name, how to get here, the week, come up.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, store, toast, ripple, ready, scramble, makeWater, floatLayer, inView } = window.SZ;

  /* =========================================================
     01 · THE PEAKS IN THE FOG — your photo, and real banks of fog drifting
     across it on two layers (one behind the title, one in front).
     the fog steps aside around your hand, then closes again.
     ========================================================= */
  const hero = $('#mtHero');
  if (hero) {
    const media = $('.mt-hero-media', hero);
    const back = $('#mtBack'), front = $('#mtFront');
    const bctx = back.getContext('2d'), fctx = front.getContext('2d');
    let W = 0, H = 0, on = true, raf = 0, mx = -1e4, my = -1e4;

    // one wide, soft bank of fog, drawn once
    const bank = document.createElement('canvas');
    bank.width = 900; bank.height = 300;
    (() => {
      const c = bank.getContext('2d');
      for (let i = 0; i < 26; i++) {
        const x = rand(140, 760), y = rand(110, 190), r = rand(60, 150);
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(232,236,238,.42)'); g.addColorStop(.6, 'rgba(226,231,234,.16)'); g.addColorStop(1, 'rgba(226,231,234,0)');
        c.fillStyle = g; c.fillRect(0, 0, 900, 300);
      }
    })();
    const makeBanks = (n, y0, y1, s0, s1, a0, a1) => Array.from({ length: n }, () => {
      const w = rand(s0, s1);
      return { x: rand(-w, 1), y: rand(y0, y1), w, h: w * rand(.26, .4), v: rand(.08, .3) * (Math.random() < .5 ? 1 : -1), a: rand(a0, a1), ox: 0, oy: 0 };
    });
    let backBanks = [], frontBanks = [];
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      back.width = front.width = W; back.height = front.height = H;
      backBanks = makeBanks(9, H * .15, H * .75, W * .5, W * 1.1, .5, .9);
      frontBanks = makeBanks(6, H * .45, H * 1.0, W * .7, W * 1.4, .55, 1);
      [...backBanks, ...frontBanks].forEach((b) => { b.x = rand(-b.w * .5, W - b.w * .5); });
    }
    function drawBanks(ctx, banks, sp, lift) {
      ctx.clearRect(0, 0, W, H);
      banks.forEach((b) => {
        b.x += b.v * (reduced ? 0 : 1);
        if (b.x > W + 40) b.x = -b.w; if (b.x < -b.w - 40) b.x = W;
        // your hand parts the fog
        const cx = b.x + b.w / 2 + b.ox, cy = b.y + b.oy - lift;
        const dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy), R = b.w * .45;
        let tx = 0, ty = 0;
        if (d < R) { const f = (1 - d / R) * b.w * .35; tx = dx / (d || 1) * f; ty = dy / (d || 1) * f * .5; }
        b.ox += (tx - b.ox) * .03; b.oy += (ty - b.oy) * .03;
        ctx.globalAlpha = Math.min(1, b.a * (1 + sp * .9));
        ctx.drawImage(bank, b.x + b.ox, b.y + b.oy - lift - b.h / 2, b.w, b.h);
      });
      ctx.globalAlpha = 1;
    }
    function frame() {
      raf = 0;
      if (!on || document.hidden) return;
      const sp = clamp(scrollY / H, 0, 1);
      drawBanks(bctx, backBanks, sp, sp * H * .15);
      drawBanks(fctx, frontBanks, sp, sp * H * .5);     // as you climb, the near fog rises past you faster
      raf = requestAnimationFrame(frame);
    }
    size();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    inView(hero, (v) => { on = v; if (v && !raf) raf = requestAnimationFrame(frame); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(frame); });
    if (!motion) requestAnimationFrame(frame);

    // the photo leans a little towards your hand
    const px = motion ? gsap.quickTo(media, 'x', { duration: 1.6, ease: 'power3' }) : () => {};
    const py = motion ? gsap.quickTo(media, 'y', { duration: 1.6, ease: 'power3' }) : () => {};
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      px((mx / r.width - .5) * -24); py((my / r.height - .5) * -14);
    });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; px(0); py(0); });

    const fl = floatLayer($('#mtFloat'), hero, { pool: '山山霧滝雫', n: innerWidth < 700 ? 10 : 18, intro: true, sizes: [14, 40] });
    const letters = $$('#mtTitle span');
    ready(() => {
      if (!motion) return;
      gsap.from(media, { scale: 1.25, duration: 3, ease: 'expo.out' });
      // the title rises out of the fog
      gsap.fromTo(letters, { y: () => rand(70, 150), opacity: 0, filter: 'blur(16px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 2.4, ease: 'expo.out', stagger: { each: .07, from: 'center' }, delay: .3 });
      fl.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .3 + i * .05 }));
      gsap.from('.mt-hero .hero-info, .mt-sub, .mt-hero .hero-foot > *, .mt-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', stagger: .08, delay: 1.3 });
      letters.forEach((el, i) => gsap.to(el, { y: () => rand(-7, 7), duration: rand(2.8, 4), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.6 + i * .12 }));
    });
    if (motion) {
      const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#mtTitle', { yPercent: -50, opacity: 0, filter: 'blur(10px)', ease: 'none', scrollTrigger: st });
      gsap.to('#mtFloat', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo('.mt-hero-media > img', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: st });
    }
  }

  /* ---------- floating characters in the other sections ---------- */
  $$('main section:not(#mtHero) .float-layer').forEach((l) => {
    floatLayer(l, l.closest('section'), { pool: l.dataset.float || '雫山', n: +(l.dataset.n || 12), sizes: [12, 32] });
  });

  /* =========================================================
     02 · THE WAY UP — altitude climbs, photos dissolve through the fog
     ========================================================= */
  const way = $('#mtWay');
  if (way) {
    const STOPS = [
      { a: 320, name: 'the last village', text: 'one wet street, one lantern, one cat. after this, the road stops pretending.' },
      { a: 900, name: 'the river', text: 'wide and slow down here, under the clouds. you\'ll follow it the whole way up; it gets louder as you climb.' },
      { a: 1200, name: 'waterfall no. 1', text: 'the first of a hundred and eight. stop here. everyone does.' },
      { a: 1600, name: 'the stone path', text: 'two stone buddhas keep the path. the signal dies between them. you\'ll check your phone twice more, out of habit. then you won\'t.' },
      { a: 1840, name: 'shizuku', text: 'a wooden house over a pond, pines, the fog. someone takes your bag and your phone, and gives you tea.' },
    ];
    const photos = $$('.way-ph', way), altEl = $('#wayAlt'), needle = $('#wayNeedle'), nameEl = $('#wayName'), textEl = $('#wayText');
    const white = document.createElement('i');
    white.className = 'way-white';
    Object.assign(white.style, { position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(80% 70% at 50% 50%, rgba(226,231,234,.95), rgba(200,206,210,.85))', opacity: 0, pointerEvents: 'none' });
    $('.mt-way-pin', way).insertBefore(white, $('.way-fog', way));
    let cur = 0;
    const show = (a, idx) => {
      altEl.textContent = Math.round(a).toLocaleString('en-US');
      needle.style.bottom = (a / 1840 * 100) + '%';
      if (idx !== cur) {
        cur = idx;
        const s = STOPS[idx];
        if (motion) {
          gsap.timeline()
            .to([nameEl, textEl], { opacity: 0, y: -10, duration: .25, ease: 'power2.in' })
            .add(() => { nameEl.textContent = s.name; textEl.textContent = s.text; })
            .fromTo([nameEl, textEl], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .06 });
        } else { nameEl.textContent = s.name; textEl.textContent = s.text; }
      }
    };
    show(320, 0);
    if (motion) {
      const o = { a: 320, i: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: way, start: 'top top', end: '+=360%', pin: '.mt-way-pin', scrub: .8 },
        onUpdate: () => show(o.a, Math.round(o.i)),
      });
      tl.to({}, { duration: .5 });
      STOPS.forEach((s, i) => {
        if (!i) return;
        // a wall of fog passes, the next place is behind it
        tl.to(o, { a: s.a, i, duration: 1, ease: 'power1.inOut' }, '>')
          .to(white, { opacity: .85, duration: .5, ease: 'power1.in' }, '<')
          .to(white, { opacity: 0, duration: .5, ease: 'power1.out' }, '>')
          .fromTo(photos[i], { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: .7, ease: 'power2.out' }, '<-.1')
          .to(photos[i - 1], { opacity: 0, duration: .3 }, '<')
          .to({}, { duration: .5 });
      });
    } else photos.forEach((p, i) => { p.style.opacity = i === photos.length - 1 ? 1 : 0; });
  }

  /* =========================================================
     03 · 108 WATERFALLS — a contour map; the named ones glow, you can name the rest
     ========================================================= */
  const fallsMap = $('#fallsMap');
  if (fallsMap) {
    // the map is the same for everyone: a seeded random
    let seed = 108;
    const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const HILLS = [{ x: 560, y: 245, r: 250 }, { x: 230, y: 330, r: 190 }, { x: 830, y: 390, r: 170 }];
    const svg = $('#contours');
    const ringPts = (h, j) => {
      const ph = [rnd() * 6, rnd() * 6, rnd() * 6], pts = [];
      for (let a = 0; a < 360; a += 6) {
        const th = a * Math.PI / 180;
        const n = 1 + Math.sin(th * 3 + ph[0]) * .08 + Math.sin(th * 5 + ph[1]) * .05 + Math.sin(th * 2 + ph[2]) * .06;
        const r = h.r * j / 9 * n;
        pts.push([h.x + Math.cos(th) * r * 1.25, h.y + Math.sin(th) * r * .8]);
      }
      return pts;
    };
    const rings = [];
    HILLS.forEach((h) => { for (let j = 1; j <= 9; j++) { const p = ringPts(h, j); rings.push({ h, j, p }); const el = document.createElementNS('http://www.w3.org/2000/svg', 'path'); el.setAttribute('d', 'M' + p.map((q) => q.join(' ')).join(' L') + ' Z'); if (j % 3 === 0) el.setAttribute('class', 'major'); svg.appendChild(el); } });

    const NAMES = {
      1: 'the first one, by the bridge.', 3: 'eleven steps. it feeds the baths.', 7: 'right outside the waterfall room.', 12: 'you can walk behind it.',
      17: 'locker 17\'s favourite.', 23: 'frozen from december to march.', 33: 'only exists when it rains.', 41: 'the loud one.',
      54: 'in the moss garden. very small, very proud.', 77: 'nobody has ever found it. we hear it, though.', 99: 'a monk lived behind it, once.', 108: 'the last one. closest to the sky.',
    };
    const mine = store.get('falls', {});
    const falls = [];
    // 99 on the map, spaced out so every one is easy to touch (the other nine hide on the other pages)
    const placed = [];
    // no two touch areas overlap (they're 30 × 40), and none sits on the house label
    const far = (q, k) => placed.every((p) => Math.abs(p[0] - q[0]) > 32 * k || Math.abs(p[1] - q[1]) > 44 * k) && !(Math.abs(q[0] - 560) < 110 && Math.abs(q[1] - 246) < 30);
    for (let n = 1; n <= 99; n++) {
      let q = null;
      for (let tries = 0; tries < 400 && !q; tries++) {
        const ring = rings[Math.floor(rnd() * rings.length)];
        const c = ring.p[Math.floor(rnd() * ring.p.length)];
        if (c[0] > 20 && c[0] < 980 && c[1] > 24 && c[1] < 536 && far(c, tries < 300 ? 1.05 : 1)) q = c;
      }
      for (let tries = 0; tries < 2000 && !q; tries++) { const c = [rnd() * 940 + 30, rnd() * 500 + 30]; if (far(c, 1)) q = c; }
      if (!q) q = [rnd() * 900 + 50, rnd() * 460 + 50];
      placed.push(q);
      const b = document.createElement('button');
      b.className = 'fall' + (NAMES[n] ? ' named' : '') + (mine[n] ? ' mine' : '');
      b.style.left = (q[0] / 1000 * 100) + '%'; b.style.top = (q[1] / 560 * 100) + '%';
      b.style.setProperty('--d', (rnd() * 1 + .8).toFixed(2) + 's'); b.style.setProperty('--dl', (-rnd() * 2).toFixed(2) + 's');
      b.setAttribute('aria-label', `waterfall no. ${n}`); b.dataset.cursor = `no. ${n}`;
      b.innerHTML = '<i></i>';
      fallsMap.appendChild(b); falls.push(b);
    }
    const noEl = $('#fallNo'), nameEl = $('#fallName'), form = $('#fallForm'), input = $('#fallInput'), note = $('#fallNote');
    let sel = 3;
    const select = (n, quiet) => {
      sel = n;
      falls.forEach((f, i) => f.classList.toggle('on', i === n - 1));
      noEl.textContent = n;
      if (NAMES[n] || mine[n]) {
        const name = NAMES[n] || mine[n]; nameEl.textContent = NAMES[n] ? name : `"${name}"`; form.hidden = true; note.textContent = NAMES[n] ? 'named by the house.' : 'named by you. only in your browser ♡'; }
      else { nameEl.textContent = 'no name yet.'; form.hidden = false; input.value = ''; note.textContent = 'it\'s been falling for ten thousand years without one.'; }
      if (!quiet && motion) gsap.fromTo([noEl, nameEl], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', stagger: .05 });
    };
    falls.forEach((f, i) => {
      if (fine) f.addEventListener('pointerenter', () => select(i + 1));
      f.addEventListener('click', (e) => { e.stopPropagation(); select(i + 1); ripple(e.clientX, e.clientY, .9); });
    });
    // a touch near a waterfall picks the nearest one (fingers are bigger than threads of water)
    fallsMap.addEventListener('click', (e) => {
      let best = -1, bd = 1e9;
      falls.forEach((f, i) => { const r = f.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY); if (d < bd) { bd = d; best = i; } });
      if (best >= 0 && bd < 48) { select(best + 1); ripple(e.clientX, e.clientY, .9); }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim().slice(0, 40);
      if (!v) return;
      mine[sel] = v; store.set('falls', mine);
      falls[sel - 1].classList.add('mine');
      select(sel);
      const r = falls[sel - 1].getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, 1.6);
      toast(`waterfall no. ${sel} is now called "${v}". only you know. ♡`, 3600);
    });
    select(3, true);
    const side = $('.mt-falls-side');
    side.innerHTML = 'some have names.<br>most don\'t. give one a name.<br>nine aren\'t on any map.';

    // the falls light up one by one, the counter follows
    const count = $('#fallsCount');
    if (motion) {
      gsap.set(falls, { opacity: 0, scaleY: 0 });
      ScrollTrigger.create({
        trigger: fallsMap, start: 'top 75%', once: true,
        onEnter: () => {
          const order = falls.map((_, i) => i).sort(() => Math.random() - .5);
          const o = { n: 0 };
          gsap.to(order.map((i) => falls[i]), { opacity: 1, scaleY: 1, duration: .6, ease: 'back.out(2)', stagger: .018, transformOrigin: '50% 0%' });
          gsap.to(o, { n: 99, duration: 99 * .018 + .6, ease: 'none', onUpdate: () => { count.textContent = Math.round(o.n); } });
        },
      });
      gsap.from('#contours path', { opacity: 0, duration: 1.2, stagger: .02, ease: 'power1.out', scrollTrigger: { trigger: fallsMap, start: 'top 85%' } });
    } else { falls.forEach((f) => { f.style.opacity = 1; }); count.textContent = 99; }
  }

  /* =========================================================
     04 · HOW TO GET HERE
     ========================================================= */
  if (motion) {
    $$('.route li').forEach((li) => gsap.from(li.children, { yPercent: 50, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: li, start: 'top 88%' } }));
  }

  /* =========================================================
     05 · THE WEEK — fog, fog, fog, fog, (clear: we close the curtains), fog, fog
     ========================================================= */
  const daysEl = $('#weatherDays');
  if (daysEl) {
    const DN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const clearDay = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const li = document.createElement('li');
      li.style.setProperty('--dl', (-i * 1.3) + 's');
      const clear = i === clearDay;
      if (clear) li.className = 'clear';
      li.innerHTML = `<small>${i ? DN[d.getDay()] + ' ' + d.getDate() : 'today'}</small><span class="jp">${clear ? '晴' : '霧'}</span><b>${clear ? 'clear' : 'fog'}</b><span>${clear ? 'we close the curtains' : `visibility ${Math.round(rand(2, 9))} m · ${Math.round(rand(6, 12))}°`}</span>`;
      daysEl.appendChild(li);
    }
    if (motion) gsap.from($$('li', daysEl), { y: 40, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: daysEl, start: 'top 88%' } });
  }

  /* =========================================================
     06 · COME UP. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫山', n: 14, sizes: [12, 30] });
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
