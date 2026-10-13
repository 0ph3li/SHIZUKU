/* =========================================================
   SHIZUKU 雫 — secret.js
   behind no. 99. if you found the nine hidden waterfalls, the curtain of water parts and the monk's letter appears.
   if you didn't, the water stays closed and tells you where to look.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const { $, $$, rand, motion, store, toast, ready } = window.SZ;
  const sc = $('#sc'), curtain = $('#curtain');
  const n = innerWidth < 700 ? 54 : 108;
  const threads = [];
  for (let i = 0; i < n; i++) {
    const t = document.createElement('i');
    t.style.left = ((i + .5) / n * 100) + '%';
    t.style.setProperty('--d', rand(.7, 1.6).toFixed(2) + 's'); t.style.setProperty('--dl', (-rand(0, 2)).toFixed(2) + 's');
    t.style.opacity = rand(.4, 1).toFixed(2);
    curtain.appendChild(t); threads.push(t);
  }
  // ?peek opens it anyway, for showing the page without hunting (portfolio demos)
  const peek = new URLSearchParams(location.search).has('peek');
  const count = SZ.found.size, open = peek || count >= SZ.GOAL;
  if (!open) {
    const box = $('#scLocked'); box.hidden = false;
    $('#scCount').textContent = count;
    const missing = SZ.HIDDEN.filter((h) => !SZ.found.has(h.n));
    const ul = $('#scMissing');
    missing.forEach((h) => { const li = document.createElement('li'); li.innerHTML = `<b>no. ${h.n}</b>`; li.append(h.where); ul.appendChild(li); });
    if (motion) ready(() => gsap.from(box.children, { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out', stagger: .08 }));
    return;
  }
  const letter = $('#scLetter'); letter.hidden = false;
  $('#scForget').addEventListener('click', () => { store.set('found', []); toast('forgotten. the water closes again.'); setTimeout(() => location.reload(), 1200); });
  if (!motion) { sc.classList.add('open'); threads.forEach((t, i) => { t.style.transform = `translateX(${(i < n / 2 ? -1 : 1) * 40}vw)`; }); return; }
  gsap.set(letter.children, { opacity: 0 });
  ready(() => {
    // you step behind the water: the threads part from the middle
    gsap.timeline()
      .to(threads, { x: (i) => { const k = (i + .5) / n - .5; return (k < 0 ? -1 : 1) * (innerWidth * .5 * (1 - Math.abs(k) * 1.2) + 40); }, duration: 2.6, ease: 'expo.inOut', stagger: { each: .006, from: 'center' } })
      .add(() => sc.classList.add('open'), '-=1.2')
      .to(letter.children, { opacity: 1, duration: .01 }, '-=1.2')
      .from('.sc-k, .sc-title > *', { y: 30, opacity: 0, filter: 'blur(12px)', duration: 1.4, ease: 'expo.out', stagger: .12 }, '-=1.2')
      .from('#scBody p', { y: 24, opacity: 0, filter: 'blur(8px)', duration: 1.6, ease: 'expo.out', stagger: .45 }, '-=.6')
      .from('.sc-sign > *', { opacity: 0, x: 30, duration: 1.4, ease: 'expo.out', stagger: .15 }, '-=.4')
      .from('.sc-end', { opacity: 0, y: 20, duration: 1, ease: 'expo.out' }, '-=.8');
  });
})();
