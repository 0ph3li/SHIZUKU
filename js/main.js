/* =========================================================
   SHIZUKU 雫 — main.js (shared by every page)
   Page scripts (home.js …) load after this file and use window.SZ.
   Everything the site remembers lives in localStorage under "sz-".
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const motion = hasGsap && !reduced;
  const root = document.documentElement;
  if (!motion) root.classList.add('no-motion');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- storage: never trust it, never need it ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sz-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sz-' + k, JSON.stringify(v)); } catch (e) { /* private window */ } },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem('sz-' + k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem('sz-' + k, v); } catch (e) { /* nothing */ } },
  };
  store.set('visits', store.get('visits', 0) + (session.get('counted') ? 0 : 1));
  session.set('counted', '1');

  /* ---------- ready: things that wait for the loader ---------- */
  const readyFns = [];
  let isReady = false;
  const ready = (fn) => (isReady ? fn() : readyFns.push(fn));

  /* ---------- smooth scroll (lenis), wired into ScrollTrigger ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: .085, wheelMultiplier: .95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 2.2 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }));
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const t = id === '#top' ? document.body : $(id);
    if (!t) return;
    e.preventDefault();
    scrollToY(t === document.body ? 0 : t.getBoundingClientRect().top + scrollY);
  }));

  /* ---------- text splitting ---------- */
  // characters: every letter becomes a .char (spaces stay text so lines still wrap)
  function chars(el) {
    if (el._chars) return el._chars;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        // letters live inside a word that never breaks, so lines only wrap between words
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'cw';
          [...part].forEach((ch) => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; w.appendChild(s); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    return (el._chars = $$('.char', el));
  }
  // words: each word sits in a mask (.w) so it can rise out of it (.wi)
  function words(el) {
    if (el._words) return el._words;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
    walk(el);
    return (el._words = $$('.wi', el));
  }

  /* ---------- image slots: load img/<name>, keep the placeholder if it's missing ---------- */
  function fillSlot(slot) {
    const name = slot.dataset.img;
    if (!name) return;
    if (slot.dataset.ratio) slot.style.setProperty('--ratio', slot.dataset.ratio.replace('/', ' / '));
    const img = new Image();
    img.decoding = 'async';
    img.alt = slot.dataset.alt || '';
    img.onload = () => {
      slot.querySelectorAll(':scope > img').forEach((o) => o.remove());
      slot.prepend(img); slot.classList.add('has-img');
      slot.dispatchEvent(new CustomEvent('slot:load', { detail: img }));
      if (motion && !slot.hasAttribute('data-noparallax')) {
        gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: slot, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    };
    img.src = 'img/' + name;
  }
  $$('.slot[data-img]').forEach(fillSlot);

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg, ms = 2800) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  /* ---------- ripples: click anywhere and the page is water ---------- */
  const fx = $('#fx');
  const rings = [];
  let fxCtx = null, fxRunning = false, dpr = Math.min(devicePixelRatio || 1, 2);
  function fxSize() { if (!fx) return; fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; }
  if (fx) { fxCtx = fx.getContext('2d'); fxSize(); addEventListener('resize', fxSize); }
  function ripple(x, y, power = 1) {
    if (!fxCtx || reduced) return;
    for (let i = 0; i < 3; i++) rings.push({ x, y, t: -i * 0.14, life: 1.5 + power * .4, max: (90 + power * 120) * (1 - i * .18) });
    if (!fxRunning) { fxRunning = true; requestAnimationFrame(fxLoop); }
  }
  let fxLast = performance.now();
  function fxLoop(now) {
    const dt = Math.min(.05, (now - fxLast) / 1000); fxLast = now;
    fxCtx.clearRect(0, 0, fx.width, fx.height);
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.t += dt;
      if (r.t < 0) continue;
      const p = r.t / r.life;
      if (p >= 1) { rings.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - p, 3);
      fxCtx.beginPath();
      fxCtx.ellipse(r.x * dpr, r.y * dpr, r.max * e * dpr, r.max * e * .42 * dpr, 0, 0, Math.PI * 2);
      fxCtx.strokeStyle = `rgba(255,255,255,${(1 - p) * .55})`;
      fxCtx.lineWidth = (1.6 - p) * dpr;
      fxCtx.stroke();
    }
    if (rings.length) requestAnimationFrame(fxLoop); else { fxRunning = false; fxCtx.clearRect(0, 0, fx.width, fx.height); }
  }
  addEventListener('pointerdown', (e) => {
    if (e.target.closest('input, textarea, .dial')) return;
    ripple(e.clientX, e.clientY, .6);
  });

  /* ---------- cursor: a ring that becomes a droplet with a word in it ---------- */
  const cur = $('#cursor');
  if (cur && fine && motion) {
    root.classList.add('has-cursor');
    const label = $('span', cur);
    const xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-label'); }
    });
    document.addEventListener('pointerout', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) cur.classList.remove('is-label');
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && motion) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- water wobble: hover an image and it goes under ---------- */
  const turb = $('#wobbleTurb'), dmap = $('#wobbleMap');
  if (turb && dmap && motion && fine) {
    const state = { s: 0, f: 0 };
    let owner = null;
    const apply = () => { dmap.setAttribute('scale', state.s.toFixed(2)); turb.setAttribute('baseFrequency', `${(.008 + state.f * .004).toFixed(4)} ${(.024 + state.f * .01).toFixed(4)}`); };
    $$('[data-wobble]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        if (owner && owner !== el) owner.style.filter = '';
        owner = el; el.style.filter = 'url(#wobble)';
        gsap.killTweensOf(state);
        gsap.timeline({ onUpdate: apply })
          .to(state, { s: 34, f: 1, duration: .45, ease: 'power2.out' })
          .to(state, { s: 0, f: 0, duration: 1.6, ease: 'elastic.out(1, .35)', onComplete: () => { if (owner === el) { el.style.filter = ''; owner = null; } } });
      });
    });
  }

  /* ---------- reveals ---------- */
  function reveals() {
    if (!motion) return;
    $$('[data-words]').forEach((el) => {
      const ws = words(el);
      gsap.from(ws, { yPercent: 110, rotate: 4, duration: 1.3, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, filter: 'blur(8px)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-scramble]').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => scramble(el) }));
  }

  /* ---------- scramble: text arrives through water ---------- */
  const GLYPHS = '雫水湯霧蓮静夜塩冷~°·∙○◌';
  function scramble(el, text = el.dataset.text || el.textContent, dur = 900) {
    if (!el.dataset.text) el.dataset.text = text;
    if (reduced) { el.textContent = text; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const n = Math.floor(p * text.length);
      let s = text.slice(0, n);
      for (let i = n; i < text.length; i++) s += text[i] === ' ' ? ' ' : (Math.random() < .5 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : text[i]);
      el.textContent = s;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
    };
    requestAnimationFrame(tick);
  }

  /* ---------- nav: hide on the way down, back on the way up; depth gauge ---------- */
  const nav = $('#topnav');
  const depthEl = $('#depth'), tempEl = $('#temp');
  let lastY = scrollY, depth = 0;
  function onScroll() {
    const y = scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    depth = clamp(y / max, 0, 1);
    root.style.setProperty('--depth', depth.toFixed(3));
    if (depthEl) depthEl.textContent = (12 - depth * 11.6).toFixed(1);   // the further down, the thicker the fog
    if (nav && !$('#menu.open')) nav.classList.toggle('hide', y > lastY && y > 200);
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // water temperature: pages can set it (the baths, the dial)
  let temp = 38, tempTween = null;
  function setTemp(v) {
    if (!tempEl) return;
    if (!motion) { temp = v; tempEl.textContent = v.toFixed(1); return; }
    if (tempTween) tempTween.kill();
    const o = { t: temp };
    tempTween = gsap.to(o, { t: v, duration: 1.2, ease: 'power2.out', onUpdate: () => { temp = o.t; tempEl.textContent = o.t.toFixed(1); } });
  }

  // open now? 06:00 — 02:00, closed on the full moon (roughly)
  const openEl = $('#statusOpen');
  if (openEl) {
    const now = new Date(), h = now.getHours();
    const moon = ((now - new Date(2000, 0, 6, 18, 14)) / 864e5) % 29.530588;
    const full = Math.abs(moon - 14.77) < .6;
    const open = !full && (h >= 6 || h < 2);
    openEl.classList.toggle('closed', !open);
    openEl.lastChild.textContent = full ? 'full moon · closed' : open ? 'open now' : 'asleep · opens 06:00';
  }


  /* ---------- sound: rain on the roof, the falls far away, a drop now and then ---------- */
  const sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const navEl = $('#topnav');
    if (!AC || !navEl) return null;
    const btn = document.createElement('button');
    btn.className = 'snd'; btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Sound: rain and the falls');
    btn.dataset.cursor = 'listen';
    btn.innerHTML = '<span class="snd-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="snd-t mono">sound</span>';
    navEl.insertBefore(btn, $('.nav-cta', navEl) || $('#burger'));
    // each place up here sounds a little different
    const MIX = { home: [.16, .22], rooms: [.22, .12], baths: [.1, .5], rituals: [.08, .1], mountain: [.12, .42], journal: [.3, .1], book: [.14, .18] }[document.body.dataset.page] || [.16, .2];
    let ac = null, master = null, on = false, dripT = null;
    function init() {
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const len = ac.sampleRate * 3, buf = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); let l = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; l = (l + .02 * w) / 1.02; d[i] = w * .4 + l * 2.6; } }
      const src = () => { const n = ac.createBufferSource(); n.buffer = buf; n.loop = true; n.start(0, Math.random() * 3); return n; };
      // rain
      const rain = src(), bp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), rg = ac.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = .5; lp.type = 'lowpass'; lp.frequency.value = 7000; rg.gain.value = MIX[0];
      rain.connect(bp); bp.connect(lp); lp.connect(rg); rg.connect(master);
      // the falls: low, wide, breathing slowly
      const falls = src(), flp = ac.createBiquadFilter(), fg = ac.createGain();
      flp.type = 'lowpass'; flp.frequency.value = 420; fg.gain.value = MIX[1];
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .07; lg.gain.value = MIX[1] * .3; lfo.connect(lg); lg.connect(fg.gain); lfo.start();
      falls.connect(flp); flp.connect(fg); fg.connect(master);
    }
    function drip() {
      if (!on) return;
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f = rand(700, 2200);
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.8, t + .08);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rand(.015, .045), t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .18);
      dripT = setTimeout(drip, rand(350, 1700));
    }
    function start() {
      if (!ac) init();
      ac.resume();
      on = true; btn.classList.add('on'); btn.classList.remove('waiting'); btn.setAttribute('aria-pressed', 'true');
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(.6, ac.currentTime, .8);
      clearTimeout(dripT); drip();
      session.set('sound', '1');
    }
    function stop(remember = true) {
      on = false; btn.classList.remove('on', 'waiting'); btn.setAttribute('aria-pressed', 'false');
      clearTimeout(dripT);
      if (ac) master.gain.setTargetAtTime(0, ac.currentTime, .25);
      if (remember) session.set('sound', '0');
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); on ? stop() : start(); });
    // it was on in the last page: browsers need a touch before sound, so it waits for one
    if (session.get('sound') === '1') {
      btn.classList.add('waiting');
      const wake = () => { if (!on && btn.classList.contains('waiting')) start(); removeEventListener('pointerdown', wake, true); removeEventListener('keydown', wake, true); };
      addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
    }
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else if (on) ac.resume(); });
    return {
      fade() { if (ac && on) master.gain.setTargetAtTime(0, ac.currentTime, .3); },
      resume() { if (ac && on) master.gain.setTargetAtTime(.6, ac.currentTime, .8); },
      get on() { return on; },
    };
  })();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    const set = (open) => {
      menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open && motion) gsap.from($$('li', menu), { yPercent: 60, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out', delay: .15 });
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- footer: newsletter that sends nothing, letters that ripple ---------- */
  const letter = $('#letter');
  if (letter) letter.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#letterMail', letter);
    const r = inp.getBoundingClientRect();
    ripple(r.left + r.width / 2, r.top + r.height / 2, 1.4);
    inp.value = '';
    toast('a drop landed. (nothing was sent: we\'re fictional ♡)', 3400);
  });
  const ftWord = $('#ftWord');
  if (ftWord && motion) {
    const letters = $$('span', ftWord);
    letters.forEach((s, i) => s.addEventListener('pointerenter', () => {
      letters.forEach((o, j) => {
        const d = Math.abs(i - j);
        gsap.fromTo(o, { y: 0 }, { keyframes: [{ y: -28 / (d + 1), duration: .25 + d * .05, ease: 'sine.out' }, { y: 0, duration: 1.2, ease: 'elastic.out(1, .3)' }], delay: d * .06, overwrite: true });
      });
    }));
    gsap.from(letters, { yPercent: 100, opacity: 0, stagger: .06, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: ftWord, start: 'top 95%' } });
  }


  /* ---------- links that leave the page: the cursor becomes a drop over them ---------- */
  function isPageLink(a) {
    if (!a || !a.href || a.target || a.hasAttribute('download')) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return false;
    return !(url.pathname === location.pathname && url.hash);
  }
  if (cur && root.classList.contains('has-cursor')) {
    document.addEventListener('pointerover', (e) => { const a = e.target.closest('a[href]'); if (a && isPageLink(a)) cur.classList.add('is-drop'); });
    document.addEventListener('pointerout', (e) => { const a = e.target.closest('a[href]'); if (a && !a.contains(e.relatedTarget)) cur.classList.remove('is-drop'); });
  }

  /* ---------- between pages: the fog rolls in, the next page appears when it lifts ---------- */
  const veil = document.createElement('div');
  veil.className = 'fogveil'; veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML = '<b></b><i></i><i></i><i></i><i></i><p class="fogveil-k jp">霧</p><p class="fogveil-to mono"></p>';
  document.body.appendChild(veil);
  const arrivedInFog = motion && session.get('fog') === '1';
  session.set('fog', '0');
  if (arrivedInFog) veil.classList.add('on', 'full');
  const clouds = $$('i', veil), veilBg = $('b', veil), veilTxt = $$('p', veil);
  let leaving = false;
  function leaveTo(url, label, x = innerWidth / 2, y = innerHeight / 2) {
    if (leaving) return;
    leaving = true;
    // the drop under your finger falls, and the fog grows from where it lands
    if (cur && root.classList.contains('has-cursor')) gsap.fromTo($('i', cur), { y: 0, scaleY: 1, opacity: 1 }, { y: 46, scaleY: .35, scaleX: 1.6, opacity: 0, duration: .45, ease: 'power2.in' });
    ripple(x, y + 46, 1.6);
    $('.fogveil-to', veil).textContent = label ? '→ ' + label : '';
    veil.classList.add('on');
    if (window.SZ && SZ.sound) SZ.sound.fade();
    let gone = false;
    const go = () => { if (gone) return; gone = true; session.set('fog', '1'); location.href = url; };
    setTimeout(go, 1600);     // failsafe: if the animation can't run (a hidden tab), go anyway
    gsap.timeline({ onComplete: go })
      .fromTo(veilBg, { opacity: 1, clipPath: `circle(0% at ${x}px ${y + 46}px)` }, { clipPath: `circle(150% at ${x}px ${y + 46}px)`, duration: 1.1, ease: 'power3.in' }, .2)
      .fromTo(clouds, { x: (i) => (x - innerWidth / 2) * (1 - i * .2), y: (i) => (y - innerHeight / 2) * .5, scale: .3, opacity: 0 }, { x: 0, y: 0, scale: 1.25, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: .07 }, .15)
      .fromTo(veilTxt, { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .6, ease: 'expo.out', stagger: .08 }, .45);
  }
  function liftFog() {
    gsap.timeline({ onComplete: () => veil.classList.remove('on', 'full') })
      .set(veilBg, { opacity: 1, clipPath: 'none' }).set(clouds, { x: 0, y: 0, yPercent: 0, scale: 1.25, opacity: 1 }).set(veilTxt, { opacity: 0 })
      .to(clouds, { yPercent: -80, scale: 1.6, opacity: 0, duration: 1.8, ease: 'power2.inOut', stagger: .1 }, .1)
      .to(veilBg, { opacity: 0, duration: 1.3, ease: 'power2.inOut' }, .25);
  }
  if (motion) {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      if (!isPageLink(a)) return;
      const url = new URL(a.href, location.href);
      e.preventDefault();
      if (menu && menu.classList.contains('open')) burger.click();
      leaveTo(url.href, (a.textContent || '').replace(/[→↑↗←]/g, '').trim().toLowerCase(), e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    });
    // coming back with the back button: no fog stuck on screen
    addEventListener('pageshow', (e) => { if (e.persisted) { leaving = false; gsap.set(veilBg, { opacity: 0 }); if (cur) gsap.set($('i', cur), { clearProps: 'all' }); veil.classList.remove('on', 'full'); if (SZ.sound) SZ.sound.resume(); } });
  }


  /* ---------- the real hour up here: night is darker, dawn is pink, dusk is warm ---------- */
  const HOURS = {
    night: { note: 'night · lanterns on', toast: 'it\'s late up here. lanterns on, the night garden is open.' },
    dawn: { note: 'dawn · the fog is pink', toast: 'it\'s dawn up here. the fog is pink right now, for about four minutes.' },
    day: { note: 'day · fog 97%', toast: '' },
    dusk: { note: 'dusk · the fog is coming up', toast: 'dusk. the fog is coming up the valley, one tree at a time.' },
  };
  function hourNow() {
    const q = new URLSearchParams(location.search).get('hour');
    if (q && HOURS[q]) return q;                                 // ?hour=dawn to see it any time
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    return h >= 5.5 && h < 6.25 ? 'dawn' : h >= 6.25 && h < 17.5 ? 'day' : h >= 17.5 && h < 19.5 ? 'dusk' : 'night';
  }
  const tint = document.createElement('div');
  tint.className = 'hour-tint'; tint.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tint);
  function setHour(h) {
    root.dataset.hour = h;
    const st = $('.status');
    if (st) {
      let n = $('#hourNote');
      if (!n) { n = document.createElement('span'); n.id = 'hourNote'; n.className = 'hour-note'; st.insertBefore(n, st.firstChild); }
      n.textContent = HOURS[h].note;
    }
  }
  setHour(hourNow());
  if (HOURS[root.dataset.hour].toast && session.get('hour-told') !== root.dataset.hour) {
    session.set('hour-told', root.dataset.hour);
    ready(() => setTimeout(() => toast(HOURS[root.dataset.hour].toast, 4600), 2600));
  }
  setInterval(() => { const h = hourNow(); if (h !== root.dataset.hour) setHour(h); }, 60000);

  /* ---------- the hunt: of the 108 waterfalls, nine hide on the pages of the site. find them all ---------- */
  const HIDDEN = [
    { n: 100, page: 'home', sel: '#hero', x: 12, y: 78, where: 'the home page, at the surface' },
    { n: 101, page: 'home', sel: '#footer', x: 92, y: 30, where: 'the bottom of the home page' },
    { n: 102, page: 'rooms', sel: '#rmInout', x: 48, y: 84, where: 'the rooms, between what\'s in and what isn\'t' },
    { n: 103, page: 'baths', sel: '#btCircuit', x: 86, y: 18, where: 'the baths, near the circuit' },
    { n: 104, page: 'rituals', sel: '#rtFeel', x: 90, y: 82, where: 'rituals, where they ask how you feel' },
    { n: 105, page: 'mountain', sel: '#mtRoute', x: 94, y: 12, where: 'the mountain, on the way here' },
    { n: 106, page: 'journal', sel: '#jrNote', x: 6, y: 86, where: 'the journal, by the fogged glass' },
    { n: 107, page: 'book', sel: '#bkIncl', x: 97, y: 20, where: 'book a stay, with what\'s included' },
    { n: 108, page: 'mountain', sel: '#mtHero', x: 50, y: 13, where: 'the top of the mountain, closest to the sky' },
  ];
  const HN = HIDDEN.map((h) => h.n), GOAL = HIDDEN.length;
  const found = new Set(store.get('found', []).filter((n) => HN.includes(n)));   // only the hidden nine count
  const foundCount = () => found.size;
  function findFall(n, x, y) {
    if (found.has(n)) return false;
    found.add(n); store.set('found', [...found]);
    if (x !== undefined) ripple(x, y, 1.3);
    document.dispatchEvent(new CustomEvent('sz:found', { detail: { n, count: found.size } }));
    if (found.size >= GOAL) {
      toast('all nine. the monk left you a letter. it\'s at the bottom of the page ↓', 6000);
      showSecretLink();
    }
    return true;
  }
  function showSecretLink() {
    const fb = $('.ft-bottom');
    if (!fb || $('.secret-link', fb)) return;
    const a = document.createElement('a');
    a.href = 'secret.html'; a.className = 'secret-link text-link'; a.textContent = 'the monk\'s letter 雫';
    fb.appendChild(a);
  }
  // the hidden ones on this page
  HIDDEN.filter((h) => h.page === document.body.dataset.page).forEach((h) => {
    const host = $(h.sel);
    if (!host) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hidden-fall' + (found.has(h.n) ? ' found' : '');
    b.style.left = h.x + '%'; b.style.top = h.y + '%';
    b.setAttribute('aria-label', `waterfall no. ${h.n}`); b.dataset.cursor = found.has(h.n) ? `no. ${h.n} ✓` : `no. ${h.n}?`;
    b.innerHTML = '<i></i>';
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (findFall(h.n, e.clientX, e.clientY)) { b.classList.add('found'); b.dataset.cursor = `no. ${h.n} ✓`; if (found.size < GOAL) toast(`waterfall no. ${h.n}, found. ${found.size} / ${GOAL} hidden ones.`, 3200); }
      else toast(`no. ${h.n}. you already found this one.`);
    });
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.appendChild(b);
  });
  // a small counter in every footer, once you've started looking
  const fbot = $('.ft-bottom');
  if (fbot && found.size) { const p = document.createElement('p'); p.className = 'found-count mono'; p.textContent = `hidden waterfalls found: ${found.size} / ${GOAL}`; fbot.appendChild(p); document.addEventListener('sz:found', (e) => { p.textContent = `hidden waterfalls found: ${e.detail.count} / ${GOAL}`; }); }
  if (found.size >= GOAL) showSecretLink();

  /* ---------- tab title: the tab misses you ---------- */
  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? '(  ) still soaking… come back ♡' : title; });

  /* ---------- loader: running the bath ---------- */
  function loader() {
    const el = $('#loader');
    const finish = () => {
      if (el) el.classList.add('done');
      document.body.classList.remove('loading');
      isReady = true; readyFns.splice(0).forEach((f) => f());
      if (motion) ScrollTrigger.refresh();
    };
    if (!el) return finish();
    if (!motion) { el.classList.add('done'); return finish(); }
    if (arrivedInFog) { el.classList.add('done'); finish(); liftFog(); return; }
    document.body.classList.add('loading');
    if (lenis) lenis.stop();
    const quick = session.get('bathed') === '1';
    session.set('bathed', '1');
    const msgs = ['climbing to 1,840 m', 'into the fog', 'running the bath', 'losing the signal', '38°. come in.'];
    const msgEl = $('#loaderMsg'), tEl = $('#loaderTemp');
    const o = { p: 0 };
    const k = quick ? .45 : 1;
    const tl = gsap.timeline({ onComplete: () => { if (lenis) lenis.start(); finish(); } });
    tl.to('.loader-drop', { opacity: 1, duration: .2 })
      .fromTo('.loader-drop', { y: -40, scaleY: 1.4 }, { y: innerHeight / 2 - 10, scaleY: 1, duration: .8 * k, ease: 'power2.in' }, '<')
      .to('.loader-drop', { scaleY: .2, scaleX: 2, opacity: 0, duration: .18 })
      .fromTo('.loader-rings i', { scale: 0, opacity: .9 }, { scale: (i) => 40 + i * 18, opacity: 0, duration: 2.2 * k, stagger: .18, ease: 'expo.out' }, '<')
      .fromTo('.loader-kanji', { opacity: 0, y: 20, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 * k, ease: 'expo.out' }, '<.05')
      .to(o, {
        p: 1, duration: 2.1 * k, ease: 'power1.inOut',
        onUpdate: () => {
          $('#loaderBar').style.transform = `scaleX(${o.p})`;
          tEl.textContent = (12 + o.p * 26).toFixed(1);
          msgEl.textContent = msgs[Math.min(msgs.length - 1, Math.floor(o.p * msgs.length))];
        },
      }, '<.1')
      .to('.loader-inner', { y: -30, opacity: 0, filter: 'blur(10px)', duration: .7, ease: 'power2.in' }, '+=.2')
      // the bath drains: the whole sheet sinks, its top edge wobbling like water
      .to('#loaderWave', { attr: { d: 'M0 40 Q 180 75 360 40 T 720 40 T 1080 40 T 1440 40 V80 H0Z' }, duration: .5, repeat: 3, yoyo: true, ease: 'sine.inOut' }, '<.3')
      .to(el, { yPercent: 115, duration: 1.4, ease: 'expo.inOut' }, '<');
  }

  /* ---------- for whoever opens the console ---------- */
  console.log(`%c
   *    /\\_/\\      +
       ( o.o )   <3  ghostly.grl
   +    > ^ <          *
`, 'color:#d9738f;font-family:monospace;font-size:13px');
  console.log('%cSHIZUKU 雫%c  you opened the console 1,840 m up in the fog. put the laptop down, the water is getting cold.\ntype %cshizuku.help()%c',
    'background:#0c0e11;color:#f3c4d2;font-weight:bold;padding:2px 8px', 'color:inherit',
    'color:#d9738f;font-weight:bold', 'color:inherit');
  window.shizuku = {
    help() { console.log('shizuku.temp(n)  ·  shizuku.drop()  ·  shizuku.cannonball()  ·  shizuku.falls()  ·  shizuku.hour(\'dawn\')  ·  shizuku.whoami()  ·  shizuku.forget()'); return '♡'; },
    falls() { return `${found.size} / ${GOAL} hidden waterfalls found. they're thin threads of falling water, on the pages.`; },
    hour(h) { if (HOURS[h]) { setHour(h); return HOURS[h].note; } return 'night, dawn, day or dusk'; },
    temp(n = 38) { setTemp(clamp(+n || 38, 4, 60)); return n > 45 ? 'that\'s soup. you are the soup.' : n < 15 ? 'very nordic of you.' : 'perfect. stay a while.'; },
    drop() { ripple(innerWidth / 2, innerHeight / 2, 2); return '雫'; },
    cannonball() { cannonball(); return 'the lifeguard saw that.'; },
    whoami() { return 'someone who reads source code in a bathrobe. respect.'; },
    forget() {
      try { Object.keys(localStorage).filter((k) => k.startsWith('sz-')).forEach((k) => localStorage.removeItem(k)); sessionStorage.clear(); } catch (e) { /* nothing */ }
      return 'forgotten. like a dream after a long bath.';
    },
  };

  /* ---------- konami: cannonball ---------- */
  function cannonball() {
    for (let i = 0; i < 14; i++) setTimeout(() => ripple(rand(0, innerWidth), rand(0, innerHeight), rand(1, 2.4)), i * 70);
    if (motion) gsap.fromTo('main', { y: 14 }, { y: 0, duration: 1.2, ease: 'elastic.out(1, .25)' });
    toast('cannonball! the lifeguard is disappointed in you.', 3200);
  }
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kIdx = 0;
  addEventListener('keydown', (e) => {
    kIdx = e.key === KONAMI[kIdx] ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) { kIdx = 0; cannonball(); }
  });

  window.SZ = { $, $$, clamp, rand, reduced, motion, fine, store, session, sound, findFall, HIDDEN, GOAL, get found() { return found; }, chars, words, fillSlot, toast, ripple, scramble, setTemp, ready, get lenis() { return lenis; }, get depth() { return depth; }, get temp() { return temp; } };

  reveals();
  if (document.readyState === 'complete') loader();
  else addEventListener('load', loader);
  // failsafe: if fonts or a CDN hang, the bath still runs
  setTimeout(() => { if (!isReady) { const l = $('#loader'); if (l) l.classList.add('done'); document.body.classList.remove('loading'); if (lenis) lenis.start(); isReady = true; readyFns.splice(0).forEach((f) => f()); } }, 9000);
})();
