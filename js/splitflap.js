(() => {
  const columns = 72;
  const rows = 3;
  const holdTime = 6500;
  const alphabet = " abcdefghijklmnopqrstuvwxyz0123456789.,&/-'";
  // Edit these sentences to change the rotation; line wrapping is automatic.
  // The single image slide follows the golf sentence.
  const messages = [
    "I'm a software engineer at Anduril, working on C-UAS under Air Defense.",
    "I'm a part-time barista working on my latte art.",
    'I love travelling, especially to Japan.',
    'I once was lost, but now I am found.',
    'Working on my golf swing, currently slicing very badly.',
    { type: 'image', alt: 'Sad Pepe meme' },
    'The Three-Body Problem is my favorite book series.',
  ];
  const container = document.querySelector('.description');
  const board = container.querySelector('.splitflap');
  const copy = container.querySelector('.description-copy');
  const meme = board.querySelector('.board-meme-frame');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Set();
  let currentIndex = 0;
  let layouts = messages.map(message => typeof message === 'string' ? [message] : []);

  function characters(index) {
    return Array.from({ length: rows }, (_, row) =>
      (layouts[index][row] || '').padEnd(columns, ' ').slice(0, columns)
    ).join('').split('');
  }

  function half(className) {
    const element = document.createElement('span');
    element.className = `flap-half ${className}`;
    const glyph = document.createElement('span');
    glyph.className = 'flap-glyph';
    element.append(glyph);
    return { element, glyph };
  }

  const measurement = document.createElement('canvas').getContext('2d');
  const readingLines = [];
  const rowElements = Array.from({ length: rows }, () => {
    const row = document.createElement('span');
    row.className = 'flap-row';
    const reading = document.createElement('span');
    reading.className = 'flap-reading';
    const animation = document.createElement('span');
    animation.className = 'flap-tiles';
    row.append(reading, animation);
    board.append(row);
    readingLines.push(reading);
    return animation;
  });
  const tiles = Array.from({ length: rows * columns }, (_, position) => {
    const element = document.createElement('span');
    element.className = 'flap';
    const top = half('flap-top');
    const bottom = half('flap-bottom');
    const outgoing = half('flap-top flap-outgoing');
    const incoming = half('flap-bottom flap-incoming');
    element.append(top.element, bottom.element, outgoing.element, incoming.element);
    rowElements[Math.floor(position / columns)].append(element);
    return { element, top, bottom, outgoing, incoming, character: ' ' };
  });

  function sizeLetters() {
    if (!measurement) return;
    const style = getComputedStyle(board);
    measurement.font = `400 100px ${style.fontFamily}`;
    const preferredSize = parseFloat(style.getPropertyValue('--board-font-size')) || 18;
    const availableWidth = board.clientWidth || container.clientWidth || 355;
    const textWidth = text => measurement.measureText(text).width / 100;
    function wrap(text, size) {
      const lines = [''];
      text.split(' ').forEach(word => {
        const line = lines.length - 1;
        const candidate = lines[line] ? `${lines[line]} ${word}` : word;
        if (lines[line] && (textWidth(candidate) * size > availableWidth || candidate.length > columns)) {
          lines.push(word);
        } else {
          lines[line] = candidate;
        }
      });
      return lines;
    }
    const text = messages.map(message => typeof message === 'string' ? message : '');
    let size = preferredSize;
    layouts = text.map(message => wrap(message, size));
    while (layouts.some(lines => lines.length > rows) && size > 12) {
      size -= .5;
      layouts = text.map(message => wrap(message, size));
    }
    board.style.fontSize = `${size}px`;
    tiles.forEach((tile, position) => {
      const row = Math.floor(position / columns);
      const column = position % columns;
      const line = layouts[currentIndex][row] || '';
      // Prefix measurements preserve the font's natural advances and kerning.
      const width = column < line.length
        ? textWidth(line.slice(0, column + 1)) - textWidth(line.slice(0, column))
        : 0;
      tile.element.style.width = `${Math.max(0, width)}em`;
    });
  }

  function schedule(callback, delay) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers.clear();
  }

  function paint(tile, character) {
    tile.element.classList.remove('is-flipping');
    [tile.top, tile.bottom, tile.outgoing, tile.incoming].forEach(part => {
      part.glyph.textContent = character === ' ' ? '\u00a0' : character;
    });
    tile.character = character;
  }

  function settle() {
    characters(currentIndex).forEach((character, index) => paint(tiles[index], character));
    const message = messages[currentIndex];
    const isImage = typeof message !== 'string';
    copy.textContent = isImage ? message.alt : message;
    meme.hidden = !isImage;
    board.classList.toggle('is-image', isImage);
    readingLines.forEach((line, row) => { line.textContent = layouts[currentIndex][row] || '\u00a0'; });
    board.classList.remove('is-changing');
  }

  function canAutoplay() {
    return !reducedMotion.matches && !document.hidden;
  }

  function waitForNext() {
    if (canAutoplay()) schedule(() => show((currentIndex + 1) % messages.length), holdTime);
  }

  function flip(tile, character, duration) {
    tile.element.classList.remove('is-flipping');
    tile.top.glyph.textContent = tile.incoming.glyph.textContent = character === ' ' ? '\u00a0' : character;
    tile.bottom.glyph.textContent = tile.outgoing.glyph.textContent = tile.character === ' ' ? '\u00a0' : tile.character;
    // Reset each hinge before the next mechanical step.
    void tile.element.offsetWidth;
    tile.element.style.setProperty('--flip-time', `${duration}ms`);
    tile.element.classList.add('is-flipping');
    tile.character = character;
  }

  function show(index, animate = true) {
    clearTimers();
    // Complete an interrupted transition before starting another one.
    settle();
    currentIndex = index;
    meme.classList.remove('is-entering');
    if (typeof messages[index] !== 'string') {
      settle();
      if (animate && !reducedMotion.matches && !document.hidden) {
        meme.classList.add('is-entering');
      }
      waitForNext();
      return;
    }
    meme.hidden = true;
    board.classList.remove('is-image');
    sizeLetters();
    if (!animate || reducedMotion.matches || document.hidden) {
      settle();
      waitForNext();
      return;
    }
    board.classList.add('is-changing');
    const target = characters(index);
    let duration = 0;
    tiles.forEach((tile, position) => {
      if (tile.character === target[position]) return;
      const delay = (position % columns) * 7 + Math.floor(position / columns) * 65;
      const from = Math.max(0, alphabet.indexOf(tile.character.toLowerCase()));
      const to = Math.max(0, alphabet.indexOf(target[position].toLowerCase()));
      const steps = (to - from + alphabet.length) % alphabet.length || 1;
      const upperCase = target[position] !== target[position].toLowerCase();
      let elapsed = delay;
      for (let step = 1; step <= steps; step++) {
        const last = step === steps;
        let character = last ? target[position] : alphabet[(from + step) % alphabet.length];
        if (!last && upperCase) character = character.toUpperCase();
        // The drum picks up speed, then slows into its final character.
        const duration = last ? 116 : step === 1 ? 84 : 58;
        schedule(() => flip(tile, character, duration), elapsed);
        elapsed += duration + 8;
      }
      duration = Math.max(duration, elapsed);
    });
    schedule(() => { settle(); waitForNext(); }, duration + 30);
  }

  function updatePlayback() {
    clearTimers();
    sizeLetters();
    settle();
    waitForNext();
  }

  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  window.addEventListener('pagehide', () => { clearTimers(); settle(); });
  window.addEventListener('pageshow', updatePlayback);

  settle();
  board.hidden = false;
  copy.classList.add('visually-hidden');
  container.classList.add('has-board');
  sizeLetters();
  if (document.fonts) document.fonts.ready.then(updatePlayback);
  if ('ResizeObserver' in window) {
    let previousWidth = board.clientWidth;
    const resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (Math.abs(width - previousWidth) > .5) {
        previousWidth = width;
        updatePlayback();
      }
    });
    resizeObserver.observe(board);
  } else {
    window.addEventListener('resize', updatePlayback);
  }
  updatePlayback();
})();
