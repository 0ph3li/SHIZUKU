/* =========================================================
   SHIZUKU 雫 — rooms.js
   a fogged window you wipe with your hand (drops run down it, then it fogs back),
   rooms that come out of the fog with numbered pins, in / not in, a night in the fog
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, chars, ripple, ready, makeWater, floatLayer, inView } = window.SZ;

  /* =========================================================
     01 · A FOGGED WINDOW
     ========================================================= */
  const hero = $('#rmHero');
  const fog = (() => {
    const cvs = $('#rmFog');
    if (!hero || !cvs) return { wipe() {}, stroke() {} };
    const ctx = cvs.getContext('2d');
    const tex = document.createElement('canvas'), tctx = tex.getContext('2d');
    const K = .5;                         // the fog is drawn at half resolution: it's fog, nobody can tell
    let W = 0, H = 0, visible = true, raf = 0;
    const drops = [];

    // breath on glass: pale grey, lighter and darker patches, a little grain
    function buildTex() {
      tex.width = W; tex.height = H;
      tctx.fillStyle = 'rgba(214,220,224,.93)'; tctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) {
        const x = rand(0, W), y = rand(0, H), r = rand(W * .05, W * .25);
        const g = tctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, Math.random() < .6 ? 'rgba(246,248,249,.35)' : 'rgba(176,186,193,.22)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
      }
      for (let i = 0; i < W * H * .004; i++) { tctx.fillStyle = `rgba(255,255,255,${rand(.05, .3).toFixed(2)})`; tctx.fillRect(rand(0, W), rand(0, H), 1, 1); }
    }
    function size() {
      const r = hero.getBoundingClientRect();
      W = Math.max(8, Math.round(r.width * K)); H = Math.max(8, Math.round(r.height * K));
      cvs.width = W; cvs.height = H;
      buildTex(); ctx.drawImage(tex, 0, 0);
    }
    function clear(x, y, r, a = .95) {
      ctx.globalCompositeOperation = 'destination-out';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .6})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    function wipe(x, y, r = 32) {
      clear(x, y, r);
      // where you wiped, the water gathers and runs down
      if (Math.random() < .14) drops.push({ x: x + rand(-r * .5, r * .5), y: y + r * .4, v: 0, max: rand(.5, 1.4), r: rand(1.4, 2.8), stop: 0, life: rand(90, 300) });
      if (!raf && visible) raf = requestAnimationFrame(loop);
    }
    function loop() {
      raf = 0;
      if (!visible || document.hidden) return;
      // the glass fogs back up, slowly
      ctx.globalAlpha = .007; ctx.drawImage(tex, 0, 0); ctx.globalAlpha = 1;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.stop > 0) d.stop--;
        else {
          d.v = Math.min(d.v + .04, d.max); d.y += d.v; d.x += rand(-.18, .18);
          if (Math.random() < .015) d.stop = rand(8, 40) | 0;
        }
        clear(d.x, d.y, d.r, .9);
        if (--d.life <= 0 || d.y > H) drops.splice(i, 1);
      }
      raf = requestAnimationFrame(loop);
    }
    const local = (cx, cy) => { const r = hero.getBoundingClientRect(); return [(cx - r.left) * K, (cy - r.top) * K]; };

    size();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    inView(hero, (v) => { visible = v; if (v && !raf) raf = requestAnimationFrame(loop); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); });

    // your hand on the glass: a continuous stroke, not dots
    let lx = null, ly = null;
    hero.addEventListener('pointermove', (e) => {
      const [x, y] = local(e.clientX, e.clientY);
      if (lx === null) { lx = x; ly = y; }
      const d = Math.hypot(x - lx, y - ly), steps = Math.max(1, Math.ceil(d / 6));
      for (let i = 1; i <= steps; i++) wipe(lx + (x - lx) * i / steps, ly + (y - ly) * i / steps, fine ? 30 : 36);
      lx = x; ly = y;
    });
    hero.addEventListener('pointerleave', () => { lx = ly = null; });
    hero.addEventListener('pointerdown', (e) => { const [x, y] = local(e.clientX, e.clientY); for (let i = 0; i < 3; i++) wipe(x + rand(-10, 10), y + rand(-10, 10), 46); });

    return {
      // a finger draws one slow curve across the glass, as a hint
      stroke(dur = 1.8) {
        if (!motion) return;
        const o = { t: 0 };
        let px = null, py = null;
        gsap.to(o, {
          t: 1, duration: dur, ease: 'power1.inOut',
          onUpdate: () => {
            const x = W * (.12 + o.t * .76), y = H * (.62 + Math.sin(o.t * Math.PI * 2.2) * .07);
            if (px !== null) { const d = Math.hypot(x - px, y - py), n = Math.max(1, Math.ceil(d / 5)); for (let i = 1; i <= n; i++) wipe(px + (x - px) * i / n, py + (y - py) * i / n, 26); }
            px = x; py = y;
          },
        });
      },
    };
  })();

  if (hero) {
    const rmFloat = floatLayer($('#rmFloat'), hero, { pool: '霧霧霧雫部屋眠', n: innerWidth < 700 ? 12 : 22, intro: true, sizes: [14, 42] });
    const letters = $$('#rmTitle span:not(.sp)');
    ready(() => {
      if (!motion) return;
      // the title condenses on the glass like breath
      gsap.fromTo(letters, { opacity: 0, scale: 1.4, filter: 'blur(18px)', y: () => rand(-20, 20) },
        { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 2, ease: 'expo.out', stagger: { each: .09, from: 'random' }, delay: .1 });
      gsap.from('.rm-hero .hero-info, .rm-sub, .rm-hero .hero-foot > *, .rm-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', stagger: .08, delay: .8 });
      setTimeout(() => fog.stroke(2), 900);
      rmFloat.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .2 + i * .05 }));
      letters.forEach((el, i) => gsap.to(el, { y: () => rand(-8, 8), duration: rand(2.6, 3.8), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 + i * .15 }));
    });
    if (motion) {
      const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#rmTitle', { yPercent: 60, filter: 'blur(14px)', opacity: .1, ease: 'none', scrollTrigger: st });
      gsap.to('.rm-hero-media', { scale: 1.1, ease: 'none', scrollTrigger: st });
      gsap.to('#rmFloat', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
    }
  }

  /* ---------- every other section gets its floating characters ---------- */
  $$('main section:not(#rmHero) .float-layer').forEach((l) => {
    const sec = l.closest('section');
    floatLayer(l, sec, { pool: l.dataset.float || '霧雫', n: +(l.dataset.n || 12), sizes: [12, 34] });
  });

  /* =========================================================
     02 · INTRO — words surface out of the fog
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
     03 · THE FOUR ROOMS — they come out of the fog, then the pins appear
     ========================================================= */
  $$('.room').forEach((room) => {
    const main = $('.room-main', room), veil = $('.room-veil', room), pinsEl = $('.room-pins', room);
    const pins = JSON.parse(pinsEl.dataset.pins || '[]');
    const btns = pins.map(([x, y, w], i) => {
      const b = document.createElement('button');
      b.textContent = `(${i + 1})`; b.dataset.w = w; b.dataset.cursor = 'look';
      b.style.left = x * 100 + '%'; b.style.top = y * 100 + '%';
      b.setAttribute('aria-label', w);
      b.addEventListener('click', (e) => {
        const on = !b.classList.contains('on');
        btns.forEach((o) => o.classList.remove('on'));
        b.classList.toggle('on', on);
        ripple(e.clientX, e.clientY, .9);
      });
      pinsEl.appendChild(b);
      return b;
    });
    // pins are written in photo coordinates; the photo is cropped to fill the frame, so follow the crop
    const place = () => {
      const img = $('.slot > img', main);
      if (!img || !img.naturalWidth) return;
      const w = main.clientWidth, h = main.clientHeight;
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * k, dh = img.naturalHeight * k;
      btns.forEach((b, i) => {
        const x = (w - dw) / 2 + pins[i][0] * dw, y = (h - dh) / 2 + pins[i][1] * dh;
        b.style.left = x + 'px'; b.style.top = y + 'px';
        b.hidden = x < 14 || y < 14 || x > w - 14 || y > h - 14;
      });
    };
    $('.slot', main).addEventListener('slot:load', place);
    addEventListener('resize', place);
    place();
    if (!motion) { veil.style.opacity = 0; return; }
    const name = $('.room-name', room);
    gsap.from(chars(name), { yPercent: 70, opacity: 0, filter: 'blur(12px)', duration: 1.5, ease: 'expo.out', stagger: { each: .03, from: 'random' }, scrollTrigger: { trigger: room, start: 'top 80%' } });
    gsap.from($('.room-k', room), { y: 40, rotate: -12, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: room, start: 'top 80%' } });
    // the fog lifts off the photo as you scroll into it
    gsap.timeline({ scrollTrigger: { trigger: main, start: 'top 85%', end: 'center 50%', scrub: 1 } })
      .fromTo(veil, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0)
      .fromTo($('.slot', main), { filter: 'blur(18px) brightness(1.3)', scale: 1.08 }, { filter: 'blur(0px) brightness(1)', scale: 1, ease: 'none' }, 0);
    gsap.from($$('button', pinsEl), { scale: 0, opacity: 0, duration: .9, ease: 'back.out(3)', stagger: .12, scrollTrigger: { trigger: main, start: 'center 60%' } });
    gsap.from($$('.room-side > *', room), { y: 40, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: $('.room-side', room), start: 'top 85%' } });
  });

  /* =========================================================
     04 · IN / NOT IN — the "not in" gets crossed out, one by one
     ========================================================= */
  const inout = $('#rmInout');
  if (inout && motion) {
    gsap.from($$('.inout-list.in li', inout), { x: -30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: inout, start: 'top 70%' } });
    gsap.from($$('.inout-list.out li', inout), { x: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: inout, start: 'top 70%' } });
    $$('.inout-list.out span', inout).forEach((s, i) => {
      s.style.setProperty('--strike', 0);
      gsap.to(s, { '--strike': 1, duration: .7, ease: 'power2.inOut', delay: .6 + i * .18, scrollTrigger: { trigger: inout, start: 'top 60%' } });
    });
    gsap.from('.inout-h', { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.5, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: inout, start: 'top 75%' } });
  }

  /* =========================================================
     05 · A NIGHT IN THE FOG — the line fills, the hours light up
     ========================================================= */
  const night = $('#night');
  if (night) {
    const items = $$('li', night);
    if (motion) {
      gsap.to('#nightFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: night, start: 'top 60%', end: 'bottom 60%', scrub: true } });
      items.forEach((li) => {
        ScrollTrigger.create({ trigger: li, start: 'top 62%', onToggle: (s) => li.classList.toggle('lit', s.progress > 0 || s.isActive), onLeaveBack: () => li.classList.remove('lit'), onEnter: () => li.classList.add('lit') });
        gsap.from(li.children, { y: 30, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: li, start: 'top 85%' } });
      });
      gsap.from('.rm-night-title', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#rmNight', start: 'top 70%' } });
    } else items.forEach((li) => li.classList.add('lit'));
  }

  /* =========================================================
     06 · SLEEP. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (ctx, W, H) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫眠', n: 14, sizes: [12, 30] });
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
