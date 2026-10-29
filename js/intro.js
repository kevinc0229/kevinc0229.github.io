(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const started = performance.now();
  const timers = new Set();
  let revealed = false;
  let finished = false;

  function schedule(callback, delay) {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    timers.clear();
    root.classList.remove('intro-pending', 'intro-revealing');
    document.querySelector('.page-reveal')?.remove();
    window.removeEventListener('load', ready);
    window.removeEventListener('keydown', finish);
    window.removeEventListener('pointerdown', finish);
    window.removeEventListener('pagehide', finish);
    reducedMotion.removeEventListener('change', motionChanged);
  }

  function reveal() {
    if (revealed || finished) return;
    revealed = true;
    root.classList.add('intro-revealing');
    schedule(finish, 1100);
  }

  function ready() {
    schedule(reveal, Math.max(0, 650 - (performance.now() - started)));
  }

  function motionChanged() {
    if (reducedMotion.matches) finish();
  }

  // Loaded in the head so the curtains cover the first paint, rather than flashing in.
  root.classList.add('intro-pending');
  window.addEventListener('load', ready, { once: true });
  window.addEventListener('keydown', finish);
  window.addEventListener('pointerdown', finish);
  window.addEventListener('pagehide', finish, { once: true });
  reducedMotion.addEventListener('change', motionChanged);
  if (document.readyState === 'complete') ready();
  // Slow resources never keep the page covered indefinitely.
  schedule(reveal, 1500);
})();
