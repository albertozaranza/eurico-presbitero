(() => {
  const stage = document.getElementById('stage');
  const slides = [...stage.querySelectorAll('.slide')];
  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const notesBox = document.getElementById('notes');
  const overview = document.getElementById('overview');
  let current = 0;

  const fit = () => {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  };

  const renderNotes = () => {
    const n = slides[current].querySelector('.notes');
    if (!n) { notesBox.innerHTML = ''; return; }
    notesBox.innerHTML =
      `<div class="who">SLIDE ${current + 1} · FALA: ${n.dataset.who.toUpperCase()} · ${n.dataset.time}</div>` + n.innerHTML;
  };

  const go = (i, push = true) => {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle('active', k === current));
    stage.classList.toggle('on-cover', current === 0);
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    if (push) history.replaceState(null, '', `#${current + 1}`);
    renderNotes();
  };

  const toggleFullscreen = () =>
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

  const buildOverview = () => {
    overview.innerHTML = slides.map((s, k) =>
      `<button data-i="${k}"><b>${String(k + 1).padStart(2, '0')}</b>${s.dataset.title}</button>`).join('');
    overview.onclick = e => {
      const b = e.target.closest('button');
      if (b) { go(+b.dataset.i); overview.classList.remove('open'); }
    };
  };

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter': e.preventDefault(); go(current + 1); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': e.preventDefault(); go(current - 1); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'n': case 'N': notesBox.classList.toggle('open'); break;
      case 'o': case 'O': overview.classList.toggle('open'); break;
      case 'Escape': overview.classList.remove('open'); notesBox.classList.remove('open'); break;
    }
  });

  // clique nas bordas e deslize no toque
  stage.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x > 0.7) go(current + 1); else if (x < 0.15) go(current - 1);
  });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    tx = null;
  });

  document.getElementById('btn-prev').onclick = () => go(current - 1);
  document.getElementById('btn-next').onclick = () => go(current + 1);
  document.getElementById('btn-notes').onclick = () => notesBox.classList.toggle('open');
  document.getElementById('btn-grid').onclick = () => overview.classList.toggle('open');
  document.getElementById('btn-full').onclick = toggleFullscreen;

  addEventListener('resize', fit);
  addEventListener('hashchange', () => go((parseInt(location.hash.slice(1)) || 1) - 1, false));
  buildOverview();
  fit();
  go((parseInt(location.hash.slice(1)) || 1) - 1, false);
})();
