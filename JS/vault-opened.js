const body = document.body;

const storyMessageEl = document.getElementById('story-message');
const storyHintEl = document.getElementById('story-hint');

const audioEl = document.getElementById('audio');
const nowPlayingEl = document.getElementById('now-playing');

const wallFromEl = document.getElementById('wall-from');
const wallMessageEl = document.getElementById('wall-message');
const wallAddBtn = document.getElementById('wall-add');
const wallClearBtn = document.getElementById('wall-clear');
const wallListEl = document.getElementById('wall-list');

const toastComplimentBtn = document.getElementById('toast-compliment');
const toastOutputEl = document.getElementById('toast-output');
const toastPopEl = document.getElementById('toast-pop');

const songModalEl = document.getElementById('song-modal');
const songListEl = document.getElementById('song-list');
const songCloseBtn = document.getElementById('song-close');

const unlockOverlayEl = document.getElementById('unlock-overlay');
const unlockProceedBtn = document.getElementById('unlock-proceed');
const vaultMainEl = document.getElementById('vault-main');

const LS_MUSIC_KEY = 'itpeeps_music_choice';
const LS_WALL_KEY = 'itpeeps_wall_messages_v1';

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function initTheme() {
  body.classList.remove('light-mode');
}

const STORY = [
  'Hiiiiiiii Doooooooc!',
  'gumoniii!',
  'Merry Christmas!',
  'Happy New Year!',
  "Happy Valentine's!",
  'Happy Chinese New Year!',
  'Happy Birthday!',
];

const TRANSITIONS = ['rise', 'zoom', 'slide'];
const OUT_MS = 400;
const IN_DELAY_MS = 70;
const IN_MS = 520;

let storyIdx = 0;
let isStoryAnimating = false;

function animateStoryTo(text, direction, targetIndex) {
  if (!storyMessageEl) return;
  if (isStoryAnimating) return;
  isStoryAnimating = true;

  const isBack = direction === 'prev';
  const transitionType = TRANSITIONS[Math.min(targetIndex, TRANSITIONS.length - 1)];

  storyMessageEl.classList.remove(
    'is-animating-in', 'is-animating-out',
    'transition-rise', 'transition-zoom', 'transition-slide', 'rev'
  );
  storyMessageEl.classList.add('transition-' + transitionType);
  if (isBack) storyMessageEl.classList.add('rev');
  storyMessageEl.classList.add('is-animating-out');

  window.setTimeout(() => {
    storyMessageEl.textContent = text;
    storyMessageEl.classList.remove('is-animating-out');
    void storyMessageEl.offsetWidth;
    storyMessageEl.classList.add('is-animating-in');
    setOccasionEffect(targetIndex);

    window.setTimeout(() => {
      storyMessageEl.classList.remove('is-animating-in', 'transition-rise', 'transition-zoom', 'transition-slide', 'rev');
      isStoryAnimating = false;
    }, IN_DELAY_MS + IN_MS);
  }, OUT_MS);
}

function goNextStory() {
  const nextIdx = storyIdx + 1;
  if (nextIdx < STORY.length) {
    storyIdx = nextIdx;
    animateStoryTo(STORY[storyIdx], 'next', storyIdx);
    if (storyHintEl) {
      storyHintEl.textContent = storyIdx === STORY.length - 1 ? 'Click or swipe once more to continue.' : 'Click or swipe left for next, right for previous.';
    }
    return;
  }
  setOccasionEffect(-1);
  openSongModal();
}

function goPrevStory() {
  const prevIdx = storyIdx - 1;
  if (prevIdx < 0) return;
  storyIdx = prevIdx;
  animateStoryTo(STORY[storyIdx], 'prev', storyIdx);
  if (storyHintEl) {
    storyHintEl.textContent = storyIdx === STORY.length - 1 ? 'Click or swipe once more to continue.' : 'Click or swipe left for next, right for previous.';
  }
}

const occasionEffectEl = document.getElementById('occasion-effects');
function setOccasionEffect(index) {
  if (!occasionEffectEl) return;
  occasionEffectEl.querySelectorAll('[data-occasion]').forEach((el) => {
    el.classList.toggle('active', el.dataset.occasion === String(index));
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goNextStory();
  if (e.key === 'ArrowLeft') goPrevStory();
});

const storySwipeArea = document.getElementById('story-swipe-area');
const SWIPE_THRESHOLD = 55;
const SWIPE_MAX_VERTICAL = 50;
const CLICK_MAX_MOVE = 15;

let touchStartX = null;
let touchStartY = null;
let mouseStartX = null;
let mouseStartY = null;

function handleSwipeEnd(dx, dy) {
  if (dx < -SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_MAX_VERTICAL) goNextStory();
  if (dx > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_MAX_VERTICAL) goPrevStory();
  if (Math.abs(dx) < CLICK_MAX_MOVE && Math.abs(dy) < CLICK_MAX_MOVE) goNextStory();
}

storySwipeArea?.addEventListener('touchstart', (e) => {
  const t = e.touches?.[0];
  if (!t) return;
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

storySwipeArea?.addEventListener('touchend', (e) => {
  if (touchStartX == null || touchStartY == null) return;
  const t = e.changedTouches?.[0];
  if (!t) return;
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  touchStartX = null;
  touchStartY = null;
  handleSwipeEnd(dx, dy);
}, { passive: true });

storySwipeArea?.addEventListener('mousedown', (e) => {
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
});

storySwipeArea?.addEventListener('mouseup', (e) => {
  if (mouseStartX == null || mouseStartY == null) return;
  const dx = e.clientX - mouseStartX;
  const dy = e.clientY - mouseStartY;
  mouseStartX = null;
  mouseStartY = null;
  handleSwipeEnd(dx, dy);
});

const TRACKS = [
  { id: 'track-1', label: 'Finding A Catholic Man To Love The Love Of My Life', band: 'Reality Club', src: '../music/Finding A Catholic Man To Love The Love Of My Life.mp3' },
  { id: 'track-2', label: 'Alexandra', band: 'Reality Club', src: '../music/Alexandra.mp3' },
  { id: 'track-3', label: 'Anything You Want', band: 'Reality Club', src: '../music/Anything You Want.mp3' },
  { id: 'track-4', label: "You'll Find Lovers Like You and Me", band: 'Reality Club', src: "../music/You'll Find Lovers Like You and Me.mp3" },
];

let activeTrackId = null;

function setActiveTrack(trackId, shouldAutoplay = true) {
  const track = TRACKS.find(t => t.id === trackId);
  if (!track || !audioEl) return;

  activeTrackId = trackId;
  const lastSlash = track.src.lastIndexOf('/');
  const path = track.src.slice(0, lastSlash + 1);
  const file = encodeURIComponent(track.src.slice(lastSlash + 1));
  audioEl.src = path + file;
  nowPlayingEl && (nowPlayingEl.textContent = track.label);
  try { localStorage.setItem(LS_MUSIC_KEY, trackId); } catch {}

  // Update Spotify-style “now playing” state in list
  document.querySelectorAll('.song-item').forEach((el) => {
    el.dataset.playing = el.dataset.id === trackId ? 'true' : 'false';
  });

  if (shouldAutoplay) {
    const p = audioEl.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }
}

function renderSongList() {
  if (!songListEl) return;
  songListEl.innerHTML = '';

  TRACKS.forEach((t) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'song-item';
    row.dataset.id = t.id;
    row.dataset.playing = activeTrackId === t.id ? 'true' : 'false';
    row.innerHTML = `
      <div class="song-thumb">▶</div>
      <div class="song-meta">
        <div class="song-name">${t.label}</div>
        <div class="song-band">${t.band}</div>
      </div>
      <div class="song-play">▶</div>
    `;
    row.addEventListener('click', () => {
      setActiveTrack(t.id, true);
      openWallAndPlayer();
      closeSongModal();
    });
    songListEl.appendChild(row);
  });
}

function openSongModal() {
  if (!songModalEl) return;
  songModalEl.classList.remove('hidden');
  body.classList.remove('intro-mode');
}

function closeSongModal() {
  if (!songModalEl) return;
  songModalEl.classList.add('hidden');
}

function getNextTrackId() {
  const idx = TRACKS.findIndex((t) => t.id === activeTrackId);
  if (idx < 0) return TRACKS[0]?.id ?? null;
  const nextIdx = (idx + 1) % TRACKS.length;
  return TRACKS[nextIdx]?.id ?? null;
}

document.getElementById('btn-change-song')?.addEventListener('click', () => {
  openSongModal();
});

document.getElementById('btn-next-song')?.addEventListener('click', () => {
  const nextId = getNextTrackId();
  if (nextId) setActiveTrack(nextId, true);
});

songCloseBtn?.addEventListener('click', closeSongModal);

songModalEl?.addEventListener('click', (e) => {
  if (e.target === songModalEl) closeSongModal();
});

audioEl?.addEventListener('error', () => {
  if (!nowPlayingEl) return;
  const isFileProtocol = window.location.protocol === 'file:';
  nowPlayingEl.textContent = isFileProtocol
    ? 'Music won’t play when the page is opened as a file. Right‑click the project folder → “Open with Live Server” (or run a local server), then open the site from the server URL.'
    : 'Could not load the file. Check that the Music folder has option-1.mp3, option-2.mp3, option-3.mp3, option-4.mp3 next to the HTML folder.';
});

if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
  const musicSection = document.getElementById('music');
  if (musicSection && nowPlayingEl) {
    nowPlayingEl.textContent = 'Open this project with Live Server (or any local server) so music can play.';
  }
}

const WALL_COLLECTION = 'wall_messages';

async function loadWall() {
  if (window.firestore) {
    try {
      const snap = await window.firestore.collection(WALL_COLLECTION).orderBy('created_at', 'desc').get();
      return snap.docs.map((d) => {
        const data = d.data();
        const created_at = data.created_at?.toDate?.() || (data.created_at ? new Date(data.created_at) : null);
        return {
          id: d.id,
          from: data.from_name ?? data.from,
          message: data.message,
          ts: created_at ? created_at.toLocaleString() : '',
        };
      });
    } catch {
      return [];
    }
  }
  let list = [];
  try {
    list = safeJsonParse(localStorage.getItem(LS_WALL_KEY), []);
  } catch {
    list = [];
  }
  if (!Array.isArray(list)) list = [];
  return list;
}

function saveWall(list) {
  try { localStorage.setItem(LS_WALL_KEY, JSON.stringify(list)); } catch {}
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function renderWall() {
  if (!wallListEl) return;
  const list = await loadWall();
  wallListEl.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'note';
    empty.innerHTML = `<div class="from">Empty…</div><div class="body">Be the first one to leave a message.</div>`;
    wallListEl.appendChild(empty);
    return;
  }

  for (const item of list) {
    const card = document.createElement('div');
    card.className = 'note';
    card.innerHTML = `
      <div class="from">${escapeHtml(item.from || 'Anonymous')}</div>
      <div class="body">${escapeHtml(item.message || '')}</div>
      <div class="meta">${escapeHtml(item.ts || '')}</div>
    `;
    const tilt = (Math.random() - 0.5) * 4;
    card.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
    wallListEl.appendChild(card);
  }
}

wallAddBtn?.addEventListener('click', async () => {
  const from = (wallFromEl?.value || '').trim();
  const message = (wallMessageEl?.value || '').trim();
  if (!message) {
    toastOutputEl && (toastOutputEl.textContent = 'Write something first. 🙂');
    return;
  }

  if (window.firestore) {
    try {
      await window.firestore.collection(WALL_COLLECTION).add({
        from_name: from || 'Anonymous',
        message,
        created_at: new Date(),
      });
      if (wallMessageEl) wallMessageEl.value = '';
      await renderWall();
    } catch {
      toastOutputEl && (toastOutputEl.textContent = 'Failed to pin. Try again.');
    }
    return;
  }

  const list = await loadWall();
  const ts = new Date();
  list.push({
    from: from || 'Anonymous',
    message,
    ts: ts.toLocaleString(),
  });
  saveWall(list);
  if (wallMessageEl) wallMessageEl.value = '';
  await renderWall();
});

const confirmClearModal = document.getElementById('confirm-clear-modal');
const confirmClearCancel = document.getElementById('confirm-clear-cancel');
const confirmClearOk = document.getElementById('confirm-clear-ok');
const confirmClearBackdrop = document.getElementById('confirm-clear-backdrop');

const cubeExitBtn = document.getElementById('cube-exit-btn');
const exitVaultModal = document.getElementById('exit-vault-modal');
const exitVaultBackdrop = document.getElementById('exit-vault-backdrop');
const exitVaultNo = document.getElementById('exit-vault-no');
const exitVaultYes = document.getElementById('exit-vault-yes');
const exitVaultActions = document.getElementById('exit-vault-actions');
const exitVaultMessage = document.getElementById('exit-vault-message');
const exitVaultBye = document.getElementById('exit-vault-bye');
const EXIT_VAULT_YES_COUNT = 3;
let exitVaultYesCount = 0;

function openConfirmClear() {
  confirmClearModal?.classList.add('active');
}
function closeConfirmClear() {
  confirmClearModal?.classList.remove('active');
}

wallClearBtn?.addEventListener('click', openConfirmClear);

confirmClearCancel?.addEventListener('click', closeConfirmClear);
confirmClearBackdrop?.addEventListener('click', closeConfirmClear);
confirmClearOk?.addEventListener('click', async () => {
  if (window.firestore) {
    toastOutputEl && (toastOutputEl.textContent = 'Wall is in the cloud; clear from Firebase Console if needed.');
    closeConfirmClear();
    return;
  }
  saveWall([]);
  await renderWall();
  closeConfirmClear();
});

function openExitVaultModal() {
  exitVaultYesCount = 0;
  exitVaultModal?.classList.add('active');
  exitVaultMessage?.classList.remove('hidden');
  exitVaultActions?.classList.remove('hidden');
  exitVaultBye?.classList.add('hidden');
  if (exitVaultYes) {
    exitVaultYes.classList.remove('is-running');
    exitVaultYes.style.left = '';
    exitVaultYes.style.top = '';
  }
}

function closeExitVaultModal() {
  exitVaultModal?.classList.remove('active');
}

function moveExitYesButton() {
  if (!exitVaultYes) return;
  const btnRect = exitVaultYes.getBoundingClientRect();
  const padding = 24;
  const maxX = window.innerWidth - btnRect.width - padding * 2;
  const maxY = window.innerHeight - btnRect.height - padding * 2;
  const left = padding + Math.random() * Math.max(0, maxX);
  const top = padding + Math.random() * Math.max(0, maxY);
  if (!exitVaultYes.classList.contains('is-running')) {
    exitVaultYes.classList.add('is-running');
    exitVaultYes.style.left = btnRect.left + 'px';
    exitVaultYes.style.top = btnRect.top + 'px';
    requestAnimationFrame(() => {
      exitVaultYes.style.left = left + 'px';
      exitVaultYes.style.top = top + 'px';
    });
  } else {
    exitVaultYes.style.left = left + 'px';
    exitVaultYes.style.top = top + 'px';
  }
}

cubeExitBtn?.addEventListener('click', openExitVaultModal);
exitVaultBackdrop?.addEventListener('click', closeExitVaultModal);
exitVaultNo?.addEventListener('click', closeExitVaultModal);

exitVaultYes?.addEventListener('click', () => {
  exitVaultYesCount += 1;
  if (exitVaultYesCount < EXIT_VAULT_YES_COUNT) {
    moveExitYesButton();
  } else {
    exitVaultMessage?.classList.add('hidden');
    exitVaultActions?.classList.add('hidden');
    exitVaultBye?.classList.remove('hidden');
    setTimeout(() => {
      window.location.href = 'Landingpage.html';
    }, 1200);
  }
});

function openWallAndPlayer() {
  const wallSection = document.getElementById('wall');
  const musicSection = document.getElementById('music');
  wallSection?.classList.remove('hidden');
  musicSection?.classList.remove('hidden');
  [wallSection, musicSection].forEach((el) => {
    if (el) requestAnimationFrame(() => el.classList.add('reveal-in'));
  });
  wallSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

unlockProceedBtn?.addEventListener('click', () => {
  unlockOverlayEl?.classList.add('hidden');
  vaultMainEl?.classList.remove('hidden');
});

const COMPLIMENTS = [
  'Langlaaaaang kuuuu',
  'Langlangggg',
  'You’re the kind of person people feel safe with.',
  'You’re doing better than you think.',
  'You’re soft and strong at the same time. That’s rare.',
  'You are genuinely a gift.',
];

function randomCompliment() {
  return COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
}

let toastPopTimer = null;
function showPopToast(text) {
  if (!toastPopEl) return;
  toastPopEl.textContent = text;
  toastPopEl.classList.remove('show');
  void toastPopEl.offsetWidth;
  toastPopEl.classList.add('show');
  if (toastPopTimer) window.clearTimeout(toastPopTimer);
  toastPopTimer = window.setTimeout(() => {
    toastPopEl.classList.remove('show');
  }, 2300);
}

toastComplimentBtn?.addEventListener('click', () => {
  const msg = randomCompliment();
  toastOutputEl && (toastOutputEl.textContent = msg);
  showPopToast(msg);
});

function initScrollReveal() {
  const wallSection = document.getElementById('wall');
  const musicSection = document.getElementById('music');
  const sections = [wallSection, musicSection].filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  sections.forEach((s) => observer.observe(s));
}

initTheme();
body.classList.add('intro-mode');
if (storyMessageEl) {
  storyMessageEl.textContent = STORY[0];
  storyMessageEl.classList.add('message-first-in');
  window.setTimeout(() => storyMessageEl.classList.remove('message-first-in'), 640);
}
setOccasionEffect(0);

try {
  const savedTrack = localStorage.getItem(LS_MUSIC_KEY);
  if (savedTrack && TRACKS.some((t) => t.id === savedTrack)) {
    activeTrackId = savedTrack;
    const track = TRACKS.find((t) => t.id === savedTrack);
    if (track && audioEl) {
      audioEl.src = track.src;
      nowPlayingEl && (nowPlayingEl.textContent = track.label);
    }
  }
} catch {}

renderSongList();
renderWall();
initScrollReveal();
