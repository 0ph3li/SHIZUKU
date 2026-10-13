/* =========================================================
   SHIZUKU 雫 — journal.js
   rain on the window (every drop is a little lens), the latest letter,
   all the letters, a reader, a note you write on the fogged glass
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, clamp, rand, motion, reduced, fine, store, toast, chars, ripple, ready, fillSlot, makeWater, floatLayer, inView } = window.SZ;

  /* ---------- the letters ---------- */
  const POSTS = [
    {
      date: '14 oct 2026', by: 'haru, the gardener', k: '霧', min: 3, img: 'JOURNAL/post-1.jpg', alt: 'Temple roofs below a mountain in the fog', sign: 'Haru',
      title: 'the fog has a colour at 05:40',
      ex: 'for four minutes every morning, the fog turns pink. i\'ve watched it for nineteen years and i still don\'t know why.',
      body: [
        'for four minutes every morning, the fog turns pink. i\'ve watched it for nineteen years and i still don\'t know why. the guests who see it think it\'s the sun. it isn\'t, the sun is still behind the ridge. it\'s something the fog does on its own.',
        'i start the day at five, raking the moss garden before the eaves start dripping. by 05:30 i put the rake down and sit on the temple steps, under the old roofs. i don\'t do anything. i wait. it comes up from the valley like someone blushing.',
        'if you stay with us, ask the night porter to knock at 05:30. bring the blanket from your room. don\'t bring a camera. it doesn\'t come out in photos, and anyway, it\'s not for keeping.',
      ],
    },
    {
      date: '29 sep 2026', by: 'the night porter', k: '鍵', min: 4, img: 'JOURNAL/post-2.jpg', alt: 'A paper window at night, a tree and a lamp behind it', sign: 'the night porter',
      title: 'what happens in locker 17',
      ex: 'every phone that comes up the mountain spends the week in a locker. i look after them. here is what they do while you\'re in the water.',
      body: [
        'every phone that comes up the mountain spends the week in a locker. i look after them. people think the phones are lonely. they aren\'t. after the first night they stop buzzing, and by the third they\'ve gone very quiet, the way a dog goes quiet when it realises nobody is coming.',
        'locker 17 is the famous one. it\'s the one in the photos. there\'s nothing special about it, except that guests ask for it, and that the phones in it seem to sleep better. i once found one with 100% battery after nine days. i think it was relieved.',
        'when you leave, i hand your phone back in a warm towel. it will have 41 notifications. none of them will matter. you\'ll read them on the bus anyway. that\'s alright. you\'ll be different reading them.',
      ],
    },
    {
      date: '02 sep 2026', by: 'mr. ito, tea', k: '茶', min: 5, img: 'JOURNAL/post-3.jpg', alt: 'Two bowls of matcha on a wooden counter facing a bamboo forest', sign: 'Ito',
      title: 'thirty years of the same tea',
      ex: 'people ask me if i get bored, making the same bowl of matcha every day at four. i do. that\'s the point.',
      body: [
        'people ask me if i get bored, making the same bowl of matcha every day at four. i do. that\'s the point. boredom is a room. if you stay in it long enough, it gets bigger, and then one day there are windows.',
        'the water comes from waterfall no. 3. i heat it to 80°, never more. i whisk forty times, in an m shape, not a circle. two bowls, always, even when only one guest comes: the bamboo outside drinks the second. none of this matters, and all of it does.',
        'the guests who talk during the tea hour are always the ones who need it most. i don\'t stop them. by the third sip they stop on their own. the forest outside the window does most of the work. i just pour.',
      ],
    },
    {
      date: '17 aug 2026', by: 'vera yu, the house', k: '滝', min: 4, img: 'JOURNAL/post-4.jpg', alt: 'A waterfall falling into the green jungle', sign: 'Vera',
      title: 'on naming waterfalls',
      ex: 'there are a hundred and eight of them, give or take. twelve have names. the rest are waiting for you.',
      body: [
        'there are a hundred and eight of them, give or take. twelve have names: the loud one, the one you can walk behind, the one that only exists when it rains. the rest have been falling for ten thousand years without anyone calling them anything.',
        'we started letting guests name them last spring. there is now a waterfall called "monday", one called "my mother\'s laugh", and one called "please". i think that last one is my favourite. nobody has explained it, and i hope nobody does.',
        'you can name one too, on the mountain page. the name stays with you, not with us. it\'s only in your browser, like a pressed flower in a book you\'ll forget you own.',
      ],
    },
    {
      date: '30 jul 2026', by: 'a guest, room 4', k: '眠', min: 6, img: 'JOURNAL/post-5.jpg', alt: 'A stone bathroom with a glass wall and a lantern', sign: 'room 4',
      title: 'eleven days in the fog room',
      ex: 'i came for three days. i stayed eleven. this is the letter i left on the bed for whoever comes next.',
      body: [
        'i came for three days. i stayed eleven. i\'m leaving this on the bed for whoever comes next, because someone left one for me and it helped.',
        'the first two days you will be restless. you\'ll reach for your pocket forty times an hour. you\'ll think the fog is boring. on the third day you will sleep for eleven hours and wake up not knowing what day it is, and it won\'t frighten you. that\'s when it starts.',
        'go on the fog walk even if it\'s raining. especially if it\'s raining. drink the tea while it\'s too hot. take the long bath behind the glass wall at night, with only the lantern on. and write something on the ceiling before you go. there are wishes up there from people who are fine now. i checked. some of them wrote back.',
      ],
    },
    {
      date: '11 jul 2026', by: 'the house', k: '雪', min: 2, img: 'JOURNAL/post-6.jpg', alt: 'A snowy rock garden seen through open sliding doors', sign: 'the house',
      title: 'notes on snow, in july',
      ex: 'it doesn\'t snow in july. we just like to think about it, on the hot days, in the stone pool.',
      body: [
        'it doesn\'t snow in july. we just like to think about it, on the hot days, sitting in the stone pool with a cold towel on our heads.',
        'in winter we slide the doors open onto the rock garden and leave them open. the snow piles up on the stones like rice. the guardians in the moss wear white hats until march. the waterfalls freeze in strange shapes, and number 23 stops altogether.',
        'the snow bath reopens in november. if you\'re reading this in the heat, close your eyes for a moment. there. that\'s it.',
      ],
    },
  ];

  /* =========================================================
     01 · RAIN ON THE WINDOW — drops gather, slide, and each one is a little upside-down lens
     ========================================================= */
  const hero = $('#jrHero');
  const rain = (() => {
    const cvs = $('#jrRain');
    if (!hero || !cvs) return { drop() {} };
    const ctx = cvs.getContext('2d');
    const sharp = document.createElement('canvas'), sctx = sharp.getContext('2d');
    let W = 0, H = 0, on = true, raf = 0, img = null, hasSharp = false;
    let small = [], big = [];
    const paintSharp = () => {
      sharp.width = W; sharp.height = H;
      if (img && img.naturalWidth) {
        const k = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
        sctx.filter = 'brightness(1.7) contrast(1.15) saturate(1.1)';   // drops gather light: brighter than the blurred glass
        sctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        sctx.filter = 'none';
      } else {
        const g = sctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a6670'); g.addColorStop(1, '#14191e');
        sctx.fillStyle = g; sctx.fillRect(0, 0, W, H);
      }
      hasSharp = true;
    };
    const size = () => {
      W = hero.clientWidth; H = hero.clientHeight; cvs.width = W; cvs.height = H;
      small = Array.from({ length: Math.round(W * H / 2200) }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(.8, 3.4) }));
      big = [];
      for (let i = 0; i < W * H / 15000; i++) add(rand(0, W), rand(0, H), rand(5, 12.5));
      paintSharp();
    };
    const K = () => clamp(W / 1100, .7, 1.5);          // drops scale with the window
    const add = (x, y, r) => big.push({ x, y, r: r * K(), vy: 0, slide: r > 13, stop: 0, last: y, sx: rand(-.2, .2) });
    function drawDrop(d, stretch = 1) {
      const r = d.r, ry = r * stretch;
      if (r > 2.6 && hasSharp) {
        // the world, upside down, inside the drop
        ctx.save();
        ctx.beginPath(); ctx.ellipse(d.x, d.y, r, ry, 0, 0, Math.PI * 2); ctx.clip();
        ctx.translate(d.x, d.y); ctx.scale(1, -1);
        const s = r * 5;
        ctx.drawImage(sharp, d.x - s, d.y - s, s * 2, s * 2, -r, -ry, r * 2, ry * 2);
        ctx.restore();
        // a dark lower rim and a bright upper edge: water against the light
        ctx.beginPath(); ctx.ellipse(d.x, d.y + r * .1, r, ry, 0, .15 * Math.PI, .85 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = Math.max(1, r * .16); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(d.x, d.y, r * .92, ry * .92, 0, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = Math.max(.8, r * .1); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.ellipse(d.x, d.y, r, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(214,226,234,.3)'; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(d.x - r * .32, d.y - ry * .38, Math.max(.4, r * .22), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    }
    function frame() {
      raf = 0;
      if (!on || document.hidden) return;
      // new rain hitting the glass
      if (!reduced && Math.random() < .3) add(rand(0, W), rand(0, H * .85), rand(4, 12));
      if (Math.random() < .4 && small.length < W * H / 1600) small.push({ x: rand(0, W), y: rand(0, H), r: rand(.8, 3) });
      ctx.clearRect(0, 0, W, H);
      small.forEach((d) => drawDrop(d));
      for (let i = big.length - 1; i >= 0; i--) {
        const d = big[i];
        if (!d.slide && d.r > 13 * K()) d.slide = true;
        // still drops slowly gather water from the air
        if (!d.slide) d.r += .004;
        if (d.slide) {
          if (d.stop > 0) d.stop--;
          else {
            d.vy = Math.min(d.vy + .05 + d.r * .006, 2 + d.r * .4); d.y += d.vy; d.x += d.sx + rand(-.25, .25);
            if (Math.random() < .02) { d.stop = rand(6, 30) | 0; d.vy = 0; }
          }
          // it eats the little drops in its way
          for (let j = small.length - 1; j >= 0; j--) {
            const s = small[j];
            if (Math.abs(s.x - d.x) < d.r && Math.abs(s.y - d.y) < d.r) { d.r = Math.min(20 * K(), d.r + s.r * .15); small.splice(j, 1); }
          }
          // and leaves a trail
          if (d.last - d.y < -10 * (1 + Math.random())) { small.push({ x: d.x + rand(-1, 1), y: d.y - d.r * 1.4, r: rand(.6, d.r * .38) }); d.last = d.y; d.r = Math.max(4, d.r - .05); }
          if (d.y - d.r > H) { big.splice(i, 1); continue; }
        }
        drawDrop(d, d.slide ? 1.18 : 1);
      }
      if (big.length > 170) big.splice(0, big.length - 170);
      raf = requestAnimationFrame(frame);
    }
    size();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    const media = $('.jr-hero-media', hero);
    const loaded = $(':scope > img', media);
    if (loaded) { img = loaded; paintSharp(); }
    media.addEventListener('slot:load', (e) => { img = e.detail; paintSharp(); });
    inView(hero, (v) => { on = v; if (v && !raf) raf = requestAnimationFrame(frame); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(frame); });
    hero.addEventListener('pointerdown', (e) => {
      const r = hero.getBoundingClientRect();
      for (let i = 0; i < 4; i++) add(e.clientX - r.left + rand(-16, 16), e.clientY - r.top + rand(-10, 10), rand(8, 13));
    });
    if (!motion) requestAnimationFrame(frame);
    return { drop: add };
  })();

  if (hero) {
    const fl = floatLayer($('#jrFloat'), hero, { pool: '雨雫記霧', n: innerWidth < 700 ? 10 : 16, intro: true, sizes: [14, 38] });
    const letters = $$('#jrTitle span');
    ready(() => {
      if (!motion) return;
      // the title, seen through wet glass, comes into focus
      gsap.fromTo(letters, { opacity: 0, scale: 1.25, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'expo.out', stagger: { each: .1, from: 'random' }, delay: .2 });
      fl.items.forEach((k, i) => gsap.to(k, { intro: 1, duration: rand(1.8, 2.8), ease: 'expo.out', delay: .3 + i * .05 }));
      gsap.from('.jr-hero .hero-info, .jr-sub, .jr-hero .hero-foot > *, .jr-hero .hero-vert', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out', stagger: .08, delay: 1.1 });
      letters.forEach((el, i) => gsap.to(el, { y: () => rand(-7, 7), duration: rand(2.8, 4), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 + i * .12 }));
    });
    if (motion) {
      const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('#jrTitle', { yPercent: 50, opacity: 0, filter: 'blur(14px)', ease: 'none', scrollTrigger: st });
      gsap.to('#jrFloat', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
    }
  }

  /* ---------- floating characters in the quiet sections ---------- */
  $$('main section:not(#jrHero):not(#jrList) .float-layer').forEach((l) => {
    floatLayer(l, l.closest('section'), { pool: l.dataset.float || '雫記', n: +(l.dataset.n || 12), sizes: [12, 32] });
  });

  /* =========================================================
     THE READER — slides up over everything
     ========================================================= */
  const reader = $('#reader'), rScroll = $('#readerScroll');
  rScroll.setAttribute('data-lenis-prevent', '');
  let open = -1, lastFocus = null;
  function fill(i) {
    const p = POSTS[i];
    $('#rdMeta').innerHTML = `<span>${p.date}</span><b>${p.by}</b><span>${p.min} min, slowly</span>`;
    $('#rdTitle').textContent = p.title;
    const slot = $('#rdSlot');
    slot.querySelectorAll(':scope > img').forEach((o) => o.remove());
    slot.classList.remove('has-img');
    slot.dataset.img = p.img; slot.dataset.alt = p.alt;
    $('#rdLabel').innerHTML = `${p.img.replace('JOURNAL/', '')}<small>${p.alt}</small>`;
    fillSlot(slot);
    $('#rdBody').innerHTML = '';
    p.body.forEach((t) => { const el = document.createElement('p'); el.textContent = t; $('#rdBody').appendChild(el); });
    $('#rdSign').textContent = p.sign;
    $('#rdPrev').hidden = i >= POSTS.length - 1; $('#rdNext').hidden = i <= 0;
    rScroll.scrollTop = 0;
  }
  function openReader(i) {
    open = i; fill(i);
    lastFocus = document.activeElement;
    reader.setAttribute('aria-hidden', 'false');
    if (SZ.lenis) SZ.lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    if (!motion) { Object.assign(reader.style, { visibility: 'visible', opacity: 1, clipPath: 'none' }); $('#readerClose').focus(); return; }
    gsap.timeline()
      .set(reader, { visibility: 'visible', opacity: 1 })
      .fromTo(reader, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
      .from(chars($('#rdTitle')), { yPercent: 80, opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: 'expo.out', stagger: { each: .015, from: 'random' } }, '-=.3')
      .from('.rd-meta, .rd-ph, .rd-body p, .rd-sign', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .07 }, '<.1')
      .add(() => $('#readerClose').focus());
  }
  function closeReader() {
    if (open < 0) return;
    open = -1;
    reader.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (SZ.lenis) SZ.lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    if (!motion) { Object.assign(reader.style, { visibility: 'hidden', opacity: 0 }); return; }
    gsap.to(reader, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut', onComplete: () => gsap.set(reader, { visibility: 'hidden' }) });
  }
  const swap = (i) => {
    if (!motion) return fill(i);
    gsap.to('.rd', { opacity: 0, y: -20, duration: .3, onComplete: () => { open = i; fill(i); gsap.fromTo('.rd', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }); } });
  };
  $('#readerClose').addEventListener('click', closeReader);
  $('#rdPrev').addEventListener('click', () => swap(open + 1));
  $('#rdNext').addEventListener('click', () => swap(open - 1));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open >= 0) closeReader(); });

  /* =========================================================
     02 · THE LATEST LETTER
     ========================================================= */
  const feat = $('#feat');
  if (feat) {
    const p = POSTS[0];
    $('#featDate').textContent = p.date; $('#featBy').textContent = p.by;
    $('#featTitle').textContent = p.title; $('#featEx').textContent = p.ex;
    feat.addEventListener('click', () => openReader(0));
    if (motion) {
      gsap.from('.feat-ph', { clipPath: 'inset(0% 100% 0% 0% round 26px)', duration: 1.8, ease: 'expo.inOut', scrollTrigger: { trigger: feat, start: 'top 75%' } });
      gsap.from(chars($('#featTitle')), { yPercent: 80, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out', stagger: { each: .02, from: 'random' }, scrollTrigger: { trigger: feat, start: 'top 70%' } });
      gsap.from('.feat-meta, .feat-ex, #featRead', { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: feat, start: 'top 65%' } });
    }
  }

  /* =========================================================
     03 · ALL THE LETTERS — hover one: its photo opens under the line, its character rains
     ========================================================= */
  const list = $('#letters');
  if (list) {
    const layer = $('#listFloat');
    const fl = floatLayer(layer, $('#jrList'), { pool: '記', n: +layer.dataset.n, sizes: [16, 50] });
    layer.style.opacity = 0;
    POSTS.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = 'letter';
      li.innerHTML = `<button data-cursor="read"><span class="l-date"></span><span class="l-title"></span><span class="l-by"></span><span class="l-min"></span></button><span class="l-strip"><span class="slot dark" data-noparallax><span class="slot-label"></span></span></span>`;
      $('.l-date', li).textContent = p.date; $('.l-title', li).textContent = p.title;
      $('.l-by', li).textContent = p.by; $('.l-min', li).textContent = p.min + ' min';
      const slot = $('.slot', li); slot.dataset.img = p.img; slot.dataset.alt = p.alt;
      $('.slot-label', li).textContent = p.img.replace('JOURNAL/', '');
      fillSlot(slot);
      $('button', li).addEventListener('click', () => openReader(i));
      if (fine && motion) li.addEventListener('pointerenter', () => {
        fl.setChars(p.k);
        gsap.fromTo(fl.items.map((k) => k.el), { scale: .4 }, { scale: 1, duration: .9, ease: 'back.out(2.5)', stagger: { each: .015, from: 'random' } });
        gsap.to(layer, { opacity: 1, duration: .6 });
      });
      list.appendChild(li);
    });
    list.addEventListener('pointerleave', () => motion && gsap.to(layer, { opacity: 0, duration: .8 }));
    if (!fine || !motion) layer.style.opacity = .3;
    if (motion) gsap.from($$('.letter button', list), { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.3, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: list, start: 'top 85%' } });
  }

  /* =========================================================
     04 · A NOTE ON THE GLASS — your words cleared out of the condensation, then it fogs back
     ========================================================= */
  const pane = $('#glassPane');
  if (pane) {
    const cvs = $('#noteFog'), ctx = cvs.getContext('2d');
    const tex = document.createElement('canvas'), tctx = tex.getContext('2d');
    let W = 0, H = 0, raf = 0, on = false, writing = null;
    const drips = [];
    const build = () => {
      W = pane.clientWidth; H = pane.clientHeight;
      cvs.width = tex.width = W; cvs.height = tex.height = H;
      tctx.fillStyle = 'rgba(200,207,212,.9)'; tctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) {
        const x = rand(0, W), y = rand(0, H), r = rand(W * .05, W * .2), g = tctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, Math.random() < .6 ? 'rgba(240,243,245,.35)' : 'rgba(160,170,178,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(tex, 0, 0);
    };
    const loop = () => {
      raf = 0;
      if (!on || document.hidden) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = .004; ctx.drawImage(tex, 0, 0); ctx.globalAlpha = 1;   // it fogs back, slowly
      ctx.globalCompositeOperation = 'destination-out';
      if (writing) {
        // a finger writing, left to right
        const { text, t0, dur, size } = writing;
        const p = clamp((performance.now() - t0) / dur, 0, 1);
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, W * (.08 + p * .84), H); ctx.clip();
        ctx.font = `italic 400 ${size}px "Cormorant Garamond", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.lineWidth = size * .05; ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.fillText(text, W / 2, H / 2); ctx.strokeText(text, W / 2, H / 2);
        ctx.restore();
        if (Math.random() < .045) drips.push({ x: W * (.1 + p * .8) + rand(-20, 20), y: H / 2 + size * .25, v: 0, r: rand(1, 1.8), life: rand(50, 140) });
        if (p >= 1) writing = null;
      }
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i];
        d.v = Math.min(d.v + .03, 1.2); d.y += d.v * (Math.random() < .1 ? 0 : 1);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.9)'; ctx.fill();
        if (--d.life <= 0 || d.y > H) drips.splice(i, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(loop);
    };
    const write = (text) => {
      const size = clamp(W / Math.max(6, text.length) * 1.5, 26, H * .3);
      writing = { text, t0: performance.now(), dur: 900 + text.length * 60, size };
      if (!raf && on) raf = requestAnimationFrame(loop);
    };
    build();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    inView(pane, (v) => { on = v; if (v && !raf) raf = requestAnimationFrame(loop); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && on && !raf) raf = requestAnimationFrame(loop); });
    let first = true;
    ScrollTrigger.create({ trigger: pane, start: 'top 75%', once: true, onEnter: () => { if (first) { first = false; setTimeout(() => write(store.get('note', 'hello, fog')), 400); } } });
    $('#glassNote').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#noteInput').value.trim().slice(0, 48);
      if (!v) return;
      store.set('note', v);
      write(v);
      $('#noteInput').value = '';
      const r = pane.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, 1.4);
    });
    if (motion) gsap.from('.jr-note-title', { yPercent: 40, opacity: 0, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#jrNote', start: 'top 70%' } });
  }

  /* =========================================================
     05 · SLOWLY. — a drop falls, the photo answers
     ========================================================= */
  const getin = $('#getin');
  if (getin) {
    const poolEl = $('#pool');
    const darkPainter = (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05080b'); g.addColorStop(1, '#0b1118'); c.fillStyle = g; c.fillRect(0, 0, W, H); };
    const pool = makeWater({ host: poolEl, canvas: $('#poolWater'), painter: darkPainter, maxW: innerWidth < 700 ? 420 : 680, rain: false, img: $(':scope > img', poolEl) });
    poolEl.addEventListener('slot:load', (e) => pool.setSource(e.detail));
    pool.bind(getin);
    floatLayer($('.float-layer', getin), getin, { pool: '雫記', n: 14, sizes: [12, 30] });
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
