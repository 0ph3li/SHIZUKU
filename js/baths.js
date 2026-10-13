/* =========================================================
   SHIZUKU 雫 — baths.js
   a waterfall you can put your hand under, a thermometer from 12° to 48°,
   five waters that ripple, the circuit (follow the drop), the rules of the water
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, chars, ripple, ready, setTemp, makeWater, floatLayer, inView } = window.SZ;

  /* =========================================================
     01 · THE FALLS — streaks of water on a canvas; your hand splits them
     ========================================================= */
  const hero = $('#btHero');
  const falls = (() => {
    const cvs = $('#btFalls');
    if (!hero || !cvs) return { splash() {} };
    const ctx = cvs.getContext('2d');
    let W = 0, H = 0, on = true, raf = 0, mx = -1e4, my = -1e4;
    const parts = [], spray = [], mist = [];
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;   // most water falls in the middle
    const size = () => { W = hero.clientWidth; H = hero.clientHeight; cvs.width = W; cvs.height = H; };
    size(); addEventListener('resize', size);

    const splash = (x, y, n = 6, power = 1) => {
      for (let i = 0; i < n; i++) spray.push({ x: x + rand(-6, 6), y, vx: rand(-4, 4) * power, vy: -rand(1, 6) * power, r: rand(.6, 2.2), a: rand(.4, .9) });
    };
    function frame() {
      raf = 0;
      if (!on || document.hidden) return;
      const c = W * .5, bw = Math.min(W * .42, 640);
      // new water at the top
      const n = reduced ? 3 : (W > 900 ? 16 : 9);
      for (let i = 0; i < n; i++) parts.push({ x: c + gauss() * bw * .5, y: rand(-120, -10), vy: rand(5, 10), len: rand(30, 120), a: rand(.07, .32), lw: rand(.6, 2.2), ph: rand(0, 6) });

      ctx.clearRect(0, 0, W, H);
      // a faint column of light where the water is
      const g = ctx.createLinearGradient(c - bw * .6, 0, c + bw * .6, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(220,232,238,.07)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(c - bw * .6, 0, bw * 1.2, H);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy = Math.min(p.vy + .28, 30); p.y += p.vy; p.x += Math.sin(p.y * .01 + p.ph) * .15;
        // your hand: the water hits it and sprays sideways; below it, a dry gap
        if (Math.abs(p.x - mx) < 48 && p.y > my - 16 && p.y < my + 26) {
          if (Math.random() < .5) spray.push({ x: p.x, y: my - 8, vx: (p.x < mx ? -1 : 1) * rand(1.5, 6), vy: -rand(1, 5), r: rand(.6, 2), a: .8 });
          parts.splice(i, 1); continue;
        }
        if (p.y - p.len > H * .9) {
          if (Math.random() < .12) spray.push({ x: p.x, y: H * .9, vx: rand(-3, 3), vy: -rand(1, 5), r: rand(.6, 2), a: .6 });
          if (Math.random() < .03 && mist.length < 40) mist.push({ x: p.x + rand(-40, 40), y: H * .93, r: rand(50, 130), a: rand(.03, .07), vy: -rand(.2, .7), vx: rand(-.3, .3) });
          parts.splice(i, 1); continue;
        }
        ctx.strokeStyle = `rgba(228,238,244,${p.a})`; ctx.lineWidth = p.lw;
        ctx.beginPath(); ctx.moveTo(p.x, p.y - p.len); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      for (let i = spray.length - 1; i >= 0; i--) {
        const s = spray[i];
        s.vy += .22; s.x += s.vx; s.y += s.vy; s.a -= .016;
        if (s.a <= 0) { spray.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(240,246,250,${s.a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // the mist at the bottom, rising
      for (let i = mist.length - 1; i >= 0; i--) {
        const m = mist[i];
        m.y += m.vy; m.x += m.vx; m.r += .4; m.a -= .00025;
        if (m.a <= 0) { mist.splice(i, 1); continue; }
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(230,236,240,${m.a})`); mg.addColorStop(1, 'rgba(230,236,240,0)');
        ctx.fillStyle = mg; ctx.fillRect(m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
      }
      raf = requestAnimationFrame(frame);
    }
    inView(hero, (v) => { on = v; if (v && !raf) raf = requestAnimationFrame(frame); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(frame); });
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
    hero.addEventListener('pointerdown', (e) => { const r = hero.getBoundingClientRect(); splash(e.clientX - r.left, e.clientY - r.top, 24, 1.4); });
    return { splash: (cx, cy, n, p) => { const r = hero.getBoundingClientRect(); splash(cx - r.left, cy - r.top, n, p); } };
  })();

  if (hero) {
    const fl = floatLayer($('#btFloat'), hero, { pool: '滝滝雫水湯霧', n: innerWidth < 700 ? 12 : 22, intro: true, sizes: [14, 42] });
    const letters = $$('#btTitle span:not(.sp)');
    ready(() => {
      if (!motion) return;
      // the title comes down with the water and lands
      const order = letters.map((_, i) => i).sort(() => Math.random() - .5);
      const tl = gsap.timeline();
      order.forEach((i, n) => {
        const el = letters[i], at = .1 + n * .12;
        tl.fromTo(el, { y: -innerHeight * .8, scaleY: 2.4, scaleX: .4, opacity: 0, filter: 'blur(8px)' },
          { y: 0, scaleY: 1, scaleX: 1, opacity: 1, filter: 'blur(0px)', duration: .7, ease: 'power3.in', transformOrigin: '50% 100%' }, at)
          .to(el, { scaleY: .75, scaleX: 1.2, duration: .1, transformOrigin: '50% 100%', onStart: () => {
            const r = el.getBoundingClientRect();
            falls.splash(r.left + r.width / 2, r.bottom - r.height * .15, 14, 1);
            ripple(r.left + r.width / 2, r.bottom - r.height * .15, .7);
          } }, at + .7)
          .to(el, { scaleY: 1, scaleX: 1, duration: 1.1, ease: 'elastic.out(1, .35)' }, at + .8);
      });
      fl.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .2 + i * .05 }));
      tl.from('.bt-hero .hero-info, .bt-sub, .bt-hero .hero-foot > *, .bt-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', stagger: .08 }, 1)
        .add(() => letters.forEach((el, i) => gsap.to(el, { y: () => rand(-8, 8), duration: rand(2.6, 3.8), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .15 })));
    });
    if (motion) {
      const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#btTitle', { yPercent: 70, filter: 'blur(14px)', opacity: .1, ease: 'none', scrollTrigger: st });
      gsap.to('#btFloat', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
    }
  }

  /* ---------- floating characters everywhere else ---------- */
  $$('main section:not(#btHero):not(#btRules) .float-layer').forEach((l) => {
    floatLayer(l, l.closest('section'), { pool: l.dataset.float || '雫湯', n: +(l.dataset.n || 12), sizes: [12, 32] });
  });

  /* =========================================================
     02 · FROM 12° TO 48° — one big number, the circuit as a temperature
     ========================================================= */
  const scale = $('#btScale');
  if (scale) {
    const BATHS = [
      { t: 12, k: '滝', name: 'falls basin', time: '30 sec' },
      { t: 36, k: '蓮', name: 'lotus pool', time: '20 min' },
      { t: 48, k: '霧', name: 'fog room', time: '12 min' },
      { t: 41, k: '石', name: 'stone pool', time: '15 min' },
      { t: 39, k: '夜', name: 'night garden', time: 'after 23:00' },
    ];
    const ruler = $('#btRuler'), needle = $('#btNeedle'), deg = $('#btDeg');
    const nowK = $('#btNowK'), nowName = $('#btNowName'), nowTime = $('#btNowTime');
    const pos = (t) => ((t - 10) / 40) * 100;
    for (let t = 10; t <= 50; t += 2) {
      const i = document.createElement('i');
      i.className = 'tick' + (t % 10 === 0 ? ' big' : ''); i.style.left = pos(t) + '%';
      if (t % 10 === 0) i.innerHTML = `<small>${t}°</small>`;
      ruler.appendChild(i);
    }
    const marks = BATHS.map((b) => {
      const m = document.createElement('span');
      m.className = 'mark'; m.textContent = b.k; m.style.left = pos(b.t) + '%';
      ruler.appendChild(m); return m;
    });
    let cur = -1;
    const show = (t, idx) => {
      deg.textContent = Math.round(t);
      needle.style.left = pos(t) + '%';
      scale.style.setProperty('--heat', clamp((t - 12) / 36, 0, 1).toFixed(3));
      if (idx !== cur) {
        cur = idx;
        const b = BATHS[idx];
        marks.forEach((m, j) => m.classList.toggle('on', j === idx));
        nowK.textContent = b.k; nowName.textContent = b.name; nowTime.textContent = b.time;
        if (motion) gsap.fromTo('#btNow > *', { y: 14, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .7, ease: 'expo.out', stagger: .05 });
        setTemp(b.t);
      }
    };
    show(12, 0);
    if (motion) {
      const o = { t: 12, i: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: scale, start: 'top top', end: '+=320%', pin: '.bt-scale-pin', scrub: 1, onLeave: () => setTemp(38), onLeaveBack: () => setTemp(38) },
        onUpdate: () => show(o.t, Math.round(o.i)),
      });
      // each bath: travel to it, then stay a moment
      BATHS.forEach((b, i) => {
        if (i) tl.to(o, { t: b.t, i, duration: 1, ease: 'power2.inOut' });
        tl.to(o, { duration: .6 });
      });
    }
  }

  /* =========================================================
     03 · THE FIVE WATERS — every photo is water you can touch
     ========================================================= */
  $$('.plate').forEach((plate) => {
    const slot = $('.plate-media .slot', plate);
    const darkPainter = (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#11161b'); g.addColorStop(1, '#07090c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const w = makeWater({ host: slot, canvas: $('canvas', slot), painter: darkPainter, maxW: 420, rain: false, img: $(':scope > img', slot) });
    slot.addEventListener('slot:load', (e) => w.setSource(e.detail));
    w.bind($('.plate-media', plate));
    if (!motion) return;
    ScrollTrigger.create({ trigger: plate, start: 'top 60%', once: true, onEnter: () => setTimeout(() => w.dropLocal(.5, .45, 8, 1400), 500) });
    gsap.from($('.plate-media', plate), { clipPath: 'inset(100% 0% 0% 0% round 26px)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: plate, start: 'top 75%' } });
    gsap.from(chars($('.plate-name', plate)), { yPercent: 80, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out', stagger: { each: .03, from: 'random' }, scrollTrigger: { trigger: plate, start: 'top 70%' } });
    const tEl = $('.plate-temp', plate), target = parseInt(tEl.textContent, 10), o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'expo.out', onUpdate: () => { tEl.textContent = Math.round(o.v) + '°'; }, scrollTrigger: { trigger: plate, start: 'top 70%' } });
    gsap.from($$('.plate-n, .plate-text, .plate-how li', plate), { y: 24, opacity: 0, filter: 'blur(6px)', duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: plate, start: 'top 65%' } });
    gsap.fromTo($('.plate-k', plate), { yPercent: -35 }, { yPercent: -65, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* =========================================================
     04 · THE CIRCUIT — a drop runs the route as you scroll
     ========================================================= */
  const circuit = $('#circuit');
  if (circuit) {
    const path = $('#circuitPath'), fill = $('#circuitFill'), drop = $('#circuitDrop');
    const stops = $$('#circuitStops li');
    const len = path.getTotalLength();
    const stopAt = [0, .24, .5, .74, 1];
    const place = (p) => {
      const pt = path.getPointAtLength(len * p);
      drop.style.left = (pt.x / 1000 * 100) + '%'; drop.style.top = (pt.y / 420 * 100) + '%';
      fill.style.strokeDasharray = len; fill.style.strokeDashoffset = len * (1 - p);
      stops.forEach((s, i) => s.classList.toggle('lit', p >= stopAt[i] - .01));
    };
    place(motion ? 0 : 1);
    if (motion) {
      const o = { p: 0 };
      gsap.to(o, { p: 1, ease: 'none', onUpdate: () => place(o.p), scrollTrigger: { trigger: circuit, start: 'top 75%', end: 'bottom 35%', scrub: 1 } });
      gsap.from(stops, { y: 20, opacity: 0, filter: 'blur(6px)', duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: circuit, start: 'top 80%' } });
      gsap.from('.bt-circuit-title', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#btCircuit', start: 'top 70%' } });
    }
  }

  /* =========================================================
     05 · THE RULES — hover one and its character rains over the section
     ========================================================= */
  const rulesSec = $('#btRules');
  if (rulesSec) {
    const layer = $('#rulesFloat');
    const fl = floatLayer(layer, rulesSec, { pool: '雫', n: +layer.dataset.n, sizes: [16, 50] });
    const rules = $$('#rules li');
    if (fine && motion) {
      layer.style.opacity = 0;
      rules.forEach((li) => li.addEventListener('pointerenter', () => {
        fl.setChars(li.dataset.k);
        gsap.fromTo(fl.items.map((k) => k.el), { scale: .4 }, { scale: 1, duration: .9, ease: 'back.out(2.5)', stagger: { each: .015, from: 'random' } });
        gsap.to(layer, { opacity: 1, duration: .6 });
      }));
      $('#rules').addEventListener('pointerleave', () => gsap.to(layer, { opacity: 0, duration: .8 }));
    }
    if (motion) gsap.from(rules.map((li) => li.children), { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '#rules', start: 'top 85%' } });
  }

  /* =========================================================
     06 · SOAK. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫湯', n: 14, sizes: [12, 30] });
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
