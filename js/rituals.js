/* =========================================================
   SHIZUKU 雫 — rituals.js
   incense smoke that curls up from a stick (stir it, blow on it),
   six rituals stacking like cards, how do you feel?, breathe.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, chars, ripple, ready, scramble, makeWater, floatLayer, inView } = window.SZ;

  /* =========================================================
     01 · INCENSE — soft particles on a flow field, rising from the ember
     ========================================================= */
  const hero = $('#rtHero');
  const smoke = (() => {
    const cvs = $('#rtSmoke');
    if (!hero || !cvs) return { puff() {} };
    const ctx = cvs.getContext('2d');
    let W = 0, H = 0, on = true, raf = 0, mx = -1e4, my = -1e4, vx = 0, vy = 0;
    const parts = [];
    // one soft white dot, drawn once, stamped many times
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sg = sprite.getContext('2d'), g = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(235,232,228,1)'); g.addColorStop(.4, 'rgba(235,232,228,.35)'); g.addColorStop(1, 'rgba(235,232,228,0)');
    sg.fillStyle = g; sg.fillRect(0, 0, 64, 64);
    const size = () => { W = hero.clientWidth; H = hero.clientHeight; cvs.width = W; cvs.height = H; };
    size(); addEventListener('resize', size);
    const tip = () => {
      const e = $('.rt-ember', hero), r = e.getBoundingClientRect(), h = hero.getBoundingClientRect();
      return [r.left + r.width / 2 - h.left, r.top - h.top];
    };
    // a slow, curling wind
    const flow = (x, y, t) => Math.sin(x * .0045 + t * .35) * Math.cos(y * .0052 - t * .22) * 2.2 + Math.sin((x + y) * .0021 + t * .12);
    function frame(now) {
      raf = 0;
      if (!on || document.hidden) return;
      const t = now / 1000;
      const [tx, ty] = tip();
      if (parts.length < 1300) for (let i = 0; i < (reduced ? 1 : 4); i++) parts.push({ x: tx + rand(-.6, .6), y: ty, vx: rand(-.05, .05), vy: -rand(.7, 1.2), r: rand(1.6, 3), a: rand(.04, .085), life: 1, ph: rand(0, 6.28) });
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        // near the stick the smoke goes straight up; higher, the wind takes it and it curls
        const age = 1 - p.life, f = flow(p.x, p.y, t) + Math.sin(t * 1.3 + p.ph) * .6;
        p.vx += (Math.sin(f) * .03 + Math.sin(t * .9 + p.y * .012) * .025) * Math.min(1, age * 2.5); p.vy += Math.cos(f) * .006 - .02;
        // your hand stirs it
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 130) { const k = (1 - d / 130) * .09; p.vx += vx * k; p.vy += vy * k; }
        p.vx *= .97; p.vy *= .985;
        p.x += p.vx; p.y += p.vy; p.r += .14 + age * .18; p.life -= .0019;
        if (p.life <= 0 || p.y < -60) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.a * p.life * (p.life < .9 ? 1 : (1 - p.life) * 10);
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      vx *= .9; vy *= .9;
      raf = requestAnimationFrame(frame);
    }
    inView(hero, (v) => { on = v; if (v && !raf) raf = requestAnimationFrame(frame); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(frame); });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (mx > -1e3) { vx = clamp(x - mx, -40, 40); vy = clamp(y - my, -40, 40); }
      mx = x; my = y;
    });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
    // click: you blow on it
    const puff = (cx, cy, power = 1) => parts.forEach((p) => {
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
      if (d < 320) { const k = (1 - d / 320) * 7 * power; p.vx += dx / d * k; p.vy += dy / d * k; }
    });
    hero.addEventListener('pointerdown', (e) => { const r = hero.getBoundingClientRect(); puff(e.clientX - r.left, e.clientY - r.top); });
    return { puff };
  })();

  if (hero) {
    const fl = floatLayer($('#rtFloat'), hero, { pool: '香香儀霧雫静', n: innerWidth < 700 ? 10 : 18, intro: true, sizes: [14, 40] });
    const letters = $$('#rtTitle span');
    ready(() => {
      if (!motion) return;
      gsap.from('#rtStick', { scaleY: 0, duration: 1.6, ease: 'expo.out' });
      // the letters drift up out of the smoke, each on its own curl
      const ember = $('.rt-ember').getBoundingClientRect();
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const fx = ember.left - (r.left + r.width / 2), fy = ember.top - (r.top + r.height / 2);
        gsap.timeline({ delay: .5 + i * .16 })
          .fromTo(el, { x: fx, y: fy, scale: .2, opacity: 0, filter: 'blur(22px)' }, { x: fx * .4 + rand(-60, 60), y: fy * .45, scale: .7, opacity: .5, filter: 'blur(12px)', duration: 1.1, ease: 'sine.out' })
          .to(el, { x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: 'expo.out' })
          .add(() => gsap.to(el, { y: rand(-8, 8), x: rand(-4, 4), duration: rand(2.8, 4), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      });
      fl.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .4 + i * .06 }));
      gsap.from('.rt-hero .hero-info, .rt-sub, .rt-hero .hero-foot > *, .rt-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', stagger: .08, delay: 1.6 });
    });
    if (motion) {
      const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#rtTitle', { yPercent: -60, filter: 'blur(16px)', opacity: 0, ease: 'none', scrollTrigger: st });
      gsap.to('#rtFloat', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
    }
  }

  /* ---------- floating characters in the other sections ---------- */
  $$('main section:not(#rtHero):not(#rtFeel) .float-layer').forEach((l) => {
    floatLayer(l, l.closest('section'), { pool: l.dataset.float || '香雫', n: +(l.dataset.n || 12), sizes: [12, 32] });
  });

  /* =========================================================
     02 · INTRO — words surface out of the smoke
     ========================================================= */
  const text = $('#stillText');
  if (text) {
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
      gsap.fromTo($$('.sw', text), { opacity: .08, filter: 'blur(9px)', y: (i) => Math.sin(i * .9) * 18 },
        { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: .1, scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: 1 } });
      gsap.from($$('.still-notes li'), { opacity: 0, y: 24, filter: 'blur(6px)', stagger: .12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.still-notes', start: 'top 92%' } });
    }
  }

  /* =========================================================
     03 · SIX RITUALS — each card slides over the last, the last one sinks back
     ========================================================= */
  const cards = $$('.rt-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--i', i);
    if (!motion) return;
    const panel = $('.rt-panel', card), next = cards[i + 1];
    // only while the next card is really covering this one: it steps back and a shade comes down (no filters, just opacity)
    if (next) {
      const st = { trigger: next, start: 'top 75%', end: 'top 12%', scrub: .6 };
      gsap.to(panel, { scale: .94, ease: 'none', scrollTrigger: st });
      gsap.to($('.rt-shade', card), { opacity: .7, ease: 'none', scrollTrigger: { ...st } });
    }
    gsap.from(chars($('.rt-name', card)), { yPercent: 80, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out', stagger: { each: .025, from: 'random' }, scrollTrigger: { trigger: card, start: 'top 55%' } });
    gsap.from($$('.rt-meta, .rt-text, .rt-steps li, .rt-when', card), { y: 24, opacity: 0, filter: 'blur(6px)', duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: card, start: 'top 50%' } });
    gsap.fromTo($('.rt-ph .slot', card), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.fromTo($('.rt-k', card), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true } });
  });

  /* =========================================================
     04 · HOW DO YOU FEEL? — pick a word, get a ritual
     ========================================================= */
  const FEEL = [
    { k: '夜', text: 'you don\'t need a ritual, you need a bed. but if you can\'t sleep: one lantern, warm water, then the bed.', r: 'the night room', id: 2 },
    { k: '霧', text: 'walk into the fog. you can\'t see far enough ahead to worry about any of it.', r: 'the fog walk', id: 0 },
    { k: '聴', text: 'lie down by waterfall no. 3. it\'s loud enough that you can cry and nobody hears.', r: 'listening to the falls', id: 5 },
    { k: '雪', text: 'hot water, snow on your face. you\'ll feel something. probably cold, then everything.', r: 'the snow bath', id: 1 },
    { k: '茶', text: 'someone whisks, you hold the bowl with both hands, and the world gets the size of a bowl.', r: 'the tea hour', id: 4 },
    { k: '石', text: 'lovely. come and sit with the guardians at dawn, and be fine together.', r: 'the guardians at dawn', id: 3 },
  ];
  const feel = $('#rtFeel');
  if (feel) {
    const layer = $('#feelFloat');
    const fl = floatLayer(layer, feel, { pool: '香', n: +layer.dataset.n, sizes: [16, 54] });
    layer.style.opacity = 0;
    const btns = $$('#feelWords button'), kEl = $('#feelK'), tEl = $('#feelText'), rEl = $('#feelRitual');
    const show = (f) => {
      kEl.textContent = f.k; tEl.textContent = f.text;
      rEl.innerHTML = `try: <a href="#rtStack" data-go="${f.id}">${f.r}</a>`;
      $('a', rEl).addEventListener('click', (e) => {
        e.preventDefault();
        const c = cards[f.id], y = c.getBoundingClientRect().top + scrollY;
        if (SZ.lenis) SZ.lenis.scrollTo(y, { duration: 2 }); else scrollTo({ top: y, behavior: 'smooth' });
      });
    };
    btns.forEach((b) => b.addEventListener('click', (e) => {
      const f = FEEL[+b.dataset.f];
      btns.forEach((o) => o.classList.toggle('on', o === b));
      ripple(e.clientX, e.clientY, 1.2);
      fl.setChars(f.k);
      if (!motion) { layer.style.opacity = 1; return show(f); }
      gsap.to(layer, { opacity: 1, duration: .6 });
      gsap.fromTo(fl.items.map((k) => k.el), { scale: .3 }, { scale: 1, duration: 1, ease: 'back.out(2.5)', stagger: { each: .015, from: 'random' } });
      gsap.timeline()
        .to([kEl, tEl, rEl], { opacity: 0, y: -12, filter: 'blur(10px)', duration: .35, ease: 'power2.in', stagger: .04 })
        .add(() => show(f))
        .fromTo(kEl, { opacity: 0, scale: 1.4, rotate: -10, filter: 'blur(14px)', y: 0 }, { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' })
        .fromTo([tEl, rEl], { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'expo.out', stagger: .1 }, '<.1');
    }));
    if (motion) gsap.from(btns, { yPercent: 60, opacity: 0, filter: 'blur(12px)', duration: 1.4, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#feelWords', start: 'top 85%' } });
  }

  /* =========================================================
     05 · BREATHE. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫香', n: 14, sizes: [12, 30] });
    const letters = $$('#getinTitle span');
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
