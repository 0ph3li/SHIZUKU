/* =========================================================
   SHIZUKU 雫 — fx.js (shared effects, loads after main.js)
   SZ.makeWater: heightmap ripples on a canvas over a photo
   SZ.floatLayer: floating characters that step aside for you
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, clamp, rand, motion, reduced } = window.SZ;
  const inView = (el, cb, margin = '120px') => {
    const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: margin });
    io.observe(el); return io;
  };

  /* =========================================================
     THE WATER — heightmap ripples on a canvas over a photo (or a painting)
     makeWater({ host, canvas, painter }) → { drop, setSource, bind }
     ========================================================= */
  function makeWater({ host, canvas, painter, maxW = 680, rain = true, damp = .026, img = null }) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const over = document.createElement('canvas'), octx = over.getContext('2d');   // light only, for file://
    let W = 0, H = 0, a, b, src = null, out = null, shade = false, paintFn = painter;
    let visible = true, raf = 0, idle = false, nextRain = 0;

    function base() {
      if (img && img.naturalWidth) {
        const k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * k, h = img.naturalHeight * k;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      } else paintFn(ctx, W, H);
    }
    function paint() {
      if (!W) return;
      base();
      try { src = ctx.getImageData(0, 0, W, H); shade = false; out = ctx.createImageData(W, H); out.data.set(src.data); }
      catch (e) { src = null; shade = true; out = octx.createImageData(W, H); }   // a photo from file:// can't be read: draw only the light
      idle = false;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    }
    function size() {
      const r = host.getBoundingClientRect();
      if (!r.width) return;
      const k = Math.min(1, maxW / r.width);
      W = Math.max(16, Math.round(r.width * k)); H = Math.max(16, Math.round(r.height * k));
      canvas.width = over.width = W; canvas.height = over.height = H;
      a = new Float32Array(W * H); b = new Float32Array(W * H);
      paint();
    }
    function dropAt(x, y, r = 3, s = 300) {
      if (!W) return;
      x |= 0; y |= 0;
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
        const xx = x + i, yy = y + j;
        if (xx < 1 || yy < 1 || xx >= W - 1 || yy >= H - 1) continue;
        const d = Math.sqrt(i * i + j * j);
        if (d <= r) a[yy * W + xx] += s * Math.cos((d / r) * Math.PI / 2);
      }
      if (!raf && visible) raf = requestAnimationFrame(loop);
    }
    function step() {
      let e = 0;
      for (let y = 1; y < H - 1; y++) {
        let i = y * W + 1;
        for (let x = 1; x < W - 1; x++, i++) {
          let v = (a[i - 1] + a[i + 1] + a[i - W] + a[i + W]) * .5 - b[i];
          v -= v * damp;
          b[i] = v; e += v < 0 ? -v : v;
        }
      }
      const t = a; a = b; b = t;
      return e / (W * H);
    }
    function render() {
      const d = out.data;
      if (!shade) {
        const s = src.data;
        for (let y = 1; y < H - 1; y++) {
          let i = y * W + 1;
          for (let x = 1; x < W - 1; x++, i++) {
            const dx = a[i - 1] - a[i + 1], dy = a[i - W] - a[i + W];
            let sx = x + ((dx * .055) | 0), sy = y + ((dy * .055) | 0);
            if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
            if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
            const si = (sy * W + sx) << 2, o = i << 2, l = (dx - dy) * .22;
            d[o] = s[si] + l; d[o + 1] = s[si + 1] + l; d[o + 2] = s[si + 2] + l * 1.05;
          }
        }
        ctx.putImageData(out, 0, 0);
      } else {
        for (let i = W, n = W * (H - 1); i < n; i++) {
          const l = a[i - 1] - a[i + 1], o = i << 2, v = l > 0 ? 255 : 0;
          d[o] = d[o + 1] = d[o + 2] = v; d[o + 3] = Math.min(150, Math.abs(l) * .9);
        }
        base(); octx.putImageData(out, 0, 0); ctx.drawImage(over, 0, 0);
      }
    }
    function loop(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      if (rain && !reduced && now > nextRain) {
        dropAt(rand(0, W), rand(H * .3, H), rand(1.5, 3.2), rand(140, 300));
        nextRain = now + rand(500, 1500);
      }
      const e = step();
      if (e > .015) { render(); idle = false; }
      else if (!idle) { if (src) ctx.putImageData(src, 0, 0); else base(); idle = true; if (!rain) return; }
      raf = requestAnimationFrame(loop);
    }
    const toLocal = (cx, cy) => { const r = host.getBoundingClientRect(); return [(cx - r.left) / r.width * W, (cy - r.top) / r.height * H]; };

    size();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    inView(host, (v) => { visible = v; if (v && !raf) raf = requestAnimationFrame(loop); }, '0px');
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); });

    return {
      drop(cx, cy, r = 4, s = 600) { const [x, y] = toLocal(cx, cy); dropAt(x, y, r, s); },
      dropLocal(fx, fy, r = 4, s = 600) { dropAt(fx * W, fy * H, r, s); },
      setSource(newImg, newPainter) { img = newImg; if (newPainter) paintFn = newPainter; paint(); },
      resize: size,
      // your finger in the water
      bind(el) {
        let px = -1e3, py = -1e3;
        el.addEventListener('pointermove', (e) => {
          const dist = Math.hypot(e.clientX - px, e.clientY - py);
          if (dist < 7) return;
          px = e.clientX; py = e.clientY;
          const [x, y] = toLocal(px, py);
          dropAt(x, y, 2, clamp(60 + dist * 6, 60, 260));
        });
        el.addEventListener('pointerdown', (e) => { const [x, y] = toLocal(e.clientX, e.clientY); dropAt(x, y, 5, 900); });
      },
    };
  }

  /* =========================================================
     FLOATING CHARACTERS — like 爱 over a photo. they drift and step aside for you
     ========================================================= */
  function floatLayer(layer, area, { pool = '雫雫雫雫雫水静湯霧蓮', n = 24, intro = false, sizes = [14, 46] } = {}) {
    const items = [];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = pool[(Math.random() * pool.length) | 0];
      const r = Math.random();
      s.className = r < .55 ? 'k-w' : r < .75 ? 'k-g' : r < .9 ? 'k-p' : 'k-d';
      s.style.fontSize = rand(sizes[0], sizes[1]) + 'px';
      s.style.opacity = rand(.4, 1).toFixed(2);
      layer.appendChild(s);
      items.push({ el: s, bx: rand(.03, .95), by: rand(.06, .94), ph: rand(0, 6.28), sp: rand(.25, .7), amp: rand(6, 18), ox: 0, oy: 0, rot: rand(-8, 8), intro: intro && motion ? 0 : 1, fall: rand(.4, 1.1) });
    }
    let mx = -1e4, my = -1e4, w = area.clientWidth, h = area.clientHeight;
    addEventListener('resize', () => { w = area.clientWidth; h = area.clientHeight; });
    area.addEventListener('pointermove', (e) => { const r = area.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    area.addEventListener('pointerleave', () => { mx = my = -1e4; });
    const tick = () => {
      const t = performance.now() / 1000;
      for (const k of items) {
        const x = k.bx * w + Math.sin(t * k.sp + k.ph) * k.amp;
        const y = k.by * h + Math.cos(t * k.sp * .8 + k.ph) * k.amp * .7;
        const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
        let tx = 0, ty = 0;
        if (d < 170) { const f = (1 - d / 170) * 90; tx = (dx / (d || 1)) * f; ty = (dy / (d || 1)) * f; }
        k.ox += (tx - k.ox) * .08; k.oy += (ty - k.oy) * .08;
        const fy = (1 - k.intro) * -h * k.fall;
        k.el.style.transform = `translate3d(${(x + k.ox).toFixed(1)}px,${(y + k.oy + fy).toFixed(1)}px,0) rotate(${(k.rot + k.ox * .1).toFixed(1)}deg)`;
      }
    };
    if (motion) {
      let on = false;
      inView(area, (v) => { on = v; if (v) { w = area.clientWidth; h = area.clientHeight; } }, '0px');
      gsap.ticker.add(() => on && tick());
    } else tick();
    return {
      items,
      setChars(str) { items.forEach((k) => { k.el.textContent = str[(Math.random() * str.length) | 0]; }); },
      reshuffle() { items.forEach((k) => { k.bx = rand(.03, .95); k.by = rand(.06, .94); }); },
    };
  }

  Object.assign(window.SZ, { makeWater, floatLayer, inView });
})();
