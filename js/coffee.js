(() => {
  const trigger = document.querySelector('.coffee-invite');
  const cup = trigger.querySelector('.coffee-cup');
  const modal = document.querySelector('#coffee-modal');
  const media = modal.querySelector('.coffee-media');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  let closing = false;

  function animate(opening) {
    animation?.cancel();
    if (reducedMotion.matches) return Promise.resolve();
    const origin = cup.getBoundingClientRect();
    const target = modal.getBoundingClientRect();
    const bounds = (left, top, width, height) => ({
      left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`,
      right: 'auto', bottom: 'auto', margin: '0px',
    });
    const small = bounds(origin.left, origin.top, origin.width, origin.height);
    // Keep the upward unfurling, with width catching up before full height.
    const middleWidth = origin.width + (target.width - origin.width) * .5;
    const middleHeight = origin.height + (target.height - origin.height) * .7;
    const middleCenterX = (origin.left + origin.width / 2) * .4
      + (target.left + target.width / 2) * .6;
    const middleCenterY = (origin.top + origin.height / 2) * .3
      + (target.top + target.height / 2) * .7;
    const middle = bounds(
      middleCenterX - middleWidth / 2,
      middleCenterY - middleHeight / 2,
      middleWidth,
      middleHeight,
    );
    const full = bounds(target.left, target.top, target.width, target.height);
    const frames = [
      { ...small, opacity: 1, offset: 0 },
      { ...middle, opacity: 1, offset: .5 },
      { ...full, opacity: 1, offset: 1 },
    ];
    const playbackFrames = opening ? frames : frames.slice().reverse().map(frame => ({
      ...frame, offset: 1 - frame.offset,
    }));
    if (!opening) {
      playbackFrames[playbackFrames.length - 1] = { ...small, opacity: 0, offset: 1 };
      playbackFrames.splice(playbackFrames.length - 1, 0, {
        ...small, opacity: 1, offset: .9,
      });
    }
    animation = modal.animate(playbackFrames, {
      duration: opening ? 850 : 700,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'both',
    });
    return animation.finished.catch(() => {});
  }

  async function close() {
    if (closing || !modal.open) return;
    closing = true;
    modal.classList.add('is-closing');
    await animate(false);
    trigger.classList.add('focus-restored');
    modal.close();
    animation?.cancel();
    media.replaceChildren();
    modal.classList.remove('is-closing');
    document.body.classList.remove('coffee-open');
    closing = false;
    trigger.focus({ preventScroll: true });
  }

  trigger.hidden = false;
  trigger.addEventListener('blur', () => trigger.classList.remove('focus-restored'));
  trigger.addEventListener('keydown', () => trigger.classList.remove('focus-restored'));
  trigger.addEventListener('click', async () => {
    if (modal.open) return;
    modal.showModal();
    document.body.classList.add('coffee-open');
    await animate(true);
    if (!modal.open || closing) return;
    animation?.cancel();
    const gif = document.createElement('img');
    gif.alt = 'Rick Astley dancing in Never Gonna Give You Up. You got Rickrolled.';
    gif.src = 'img/portfolio/rickroll.gif?v=landscape';
    media.replaceChildren(gif);
  });
  modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
  });
})();
