const memoryCategorySelect = document.getElementById("memory-category");
const memoryStatus = document.getElementById("memory-status");
const memoryScore = document.getElementById("memory-score");
const memoryPairs = document.getElementById("memory-pairs");
const memoryMoves = document.getElementById("memory-moves");
const memoryTimer = document.getElementById("memory-timer");
const memoryBoard = document.getElementById("memory-board");
const memoryStart = document.getElementById("memory-start");
const memoryRestart = document.getElementById("memory-restart");
const memoryLeaderboard = document.getElementById("memory-leaderboard");

const MEMORY_STORAGE_KEY = "dico_archi_memory_scores_v1";
const MEMORY_PAIR_COUNT = 4;
const MEMORY_MIN_PAIR_COUNT = 2;

let memoryPool = [];
let memoryGame = null;
let memoryTimerId = null;

function shuffle(items) {
  const array = items.slice();
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function normalizeItems(items) {
  return (items || [])
    .map((item) => ({
      term: String(item.term || "").trim(),
      slug: String(item.slug || "").trim(),
      definition: String(item.definition || "").trim(),
      category: String(item.category || "").trim()
    }))
    .filter((item) => item.term && item.definition);
}

function buildCategoryOptions(items) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "fr"));

  memoryCategorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Toutes les catégories";
  memoryCategorySelect.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    memoryCategorySelect.appendChild(option);
  }
}

function getActivePool() {
  if (!memoryCategorySelect.value) return memoryPool;
  return memoryPool.filter((item) => item.category === memoryCategorySelect.value);
}

function getLeaderboard() {
  try {
    const raw = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(entries));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function renderLeaderboard() {
  const entries = getLeaderboard();
  if (!entries.length) {
    memoryLeaderboard.textContent = "Aucune partie enregistrée.";
    return;
  }

  memoryLeaderboard.textContent = entries
    .map((item, index) => `${index + 1}. ${item.seconds}s · ${item.moves} coups · ${item.categoryLabel}`)
    .join(" · ");
}

function stopTimer() {
  if (memoryTimerId) {
    window.clearInterval(memoryTimerId);
    memoryTimerId = null;
  }
}

function updateMeta() {
  if (!memoryGame) return;
  memoryScore.textContent = `${memoryGame.matches} / ${memoryGame.totalPairs}`;
  memoryPairs.textContent = `Paires : ${memoryGame.totalPairs}`;
  memoryMoves.textContent = `Coups : ${memoryGame.moves}`;
  memoryTimer.textContent = `Temps : ${memoryGame.seconds} s`;
}

function startTimer() {
  stopTimer();
  memoryTimerId = window.setInterval(() => {
    if (!memoryGame || memoryGame.ended) return;
    memoryGame.seconds += 1;
    updateMeta();
  }, 1000);
}

function finishGame() {
  memoryGame.ended = true;
  stopTimer();
  memoryStatus.textContent = "Bravo. Toutes les paires ont été retrouvées.";
  memoryStatus.classList.remove("ko");
  memoryStatus.classList.add("ok");
  memoryStart.disabled = true;
  memoryRestart.hidden = false;

  const leaderboard = getLeaderboard();
  leaderboard.push({
    seconds: memoryGame.seconds,
    moves: memoryGame.moves,
    categoryLabel: memoryCategorySelect.value || "Toutes catégories",
    createdAt: new Date().toISOString()
  });

  leaderboard.sort((a, b) => a.seconds - b.seconds || a.moves - b.moves);
  saveLeaderboard(leaderboard.slice(0, 5));
  renderLeaderboard();
}

function renderBoard() {
  memoryBoard.textContent = "";
  for (const card of memoryGame.cards) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory__card";
    button.dataset.cardId = card.id;
    button.disabled = card.matched;

    if (card.revealed || card.matched) {
      button.classList.add("is-open");
      if (card.matched) button.classList.add("is-matched");

      const kind = document.createElement("span");
      kind.className = "memory__kind";
      kind.textContent = card.kind === "term" ? "Terme" : "Définition";
      button.appendChild(kind);

      const text = document.createElement("strong");
      text.textContent = card.label;
      button.appendChild(text);
    } else {
      button.innerHTML = '<span aria-hidden="true">?</span><strong>Retourner</strong>';
    }

    button.addEventListener("click", () => handleCardClick(card.id));
    memoryBoard.appendChild(button);
  }
}

function resetOpenCards(matchedPairId = "") {
  for (const card of memoryGame.cards) {
    if (card.revealed && !card.matched) {
      if (matchedPairId && card.pairId === matchedPairId) {
        card.matched = true;
      } else {
        card.revealed = false;
      }
    }
  }
}

function handleCardClick(cardId) {
  if (!memoryGame || memoryGame.busy || memoryGame.ended) return;

  const card = memoryGame.cards.find((item) => item.id === cardId);
  if (!card || card.revealed || card.matched) return;

  card.revealed = true;
  renderBoard();

  const openCards = memoryGame.cards.filter((item) => item.revealed && !item.matched);
  if (openCards.length < 2) return;

  memoryGame.moves += 1;
  memoryGame.busy = true;
  updateMeta();

  const [first, second] = openCards;
  const isMatch = first.pairId === second.pairId && first.kind !== second.kind;

  window.setTimeout(() => {
    if (isMatch) {
      resetOpenCards(first.pairId);
      memoryGame.matches += 1;
      memoryStatus.textContent = "Bonne paire.";
      memoryStatus.classList.remove("ko");
      memoryStatus.classList.add("ok");
    } else {
      resetOpenCards();
      memoryStatus.textContent = "Pas la bonne paire. Essaie encore.";
      memoryStatus.classList.remove("ok");
      memoryStatus.classList.add("ko");
    }

    memoryGame.busy = false;
    renderBoard();
    updateMeta();

    if (memoryGame.matches >= memoryGame.totalPairs) {
      finishGame();
    }
  }, isMatch ? 380 : 700);
}

function createGame() {
  const activePool = shuffle(getActivePool());
  const pairCount = Math.min(MEMORY_PAIR_COUNT, activePool.length);

  if (pairCount < MEMORY_MIN_PAIR_COUNT) {
    memoryGame = null;
    memoryBoard.textContent = "";
    memoryStatus.textContent = "Cette catégorie ne contient pas encore assez de termes pour lancer le memory.";
    memoryStatus.classList.remove("ok");
    memoryStatus.classList.add("ko");
    memoryStart.disabled = true;
    memoryRestart.hidden = true;
    memoryScore.textContent = "0 / 0";
    memoryPairs.textContent = "Paires : 0";
    memoryMoves.textContent = "Coups : 0";
    memoryTimer.textContent = "Temps : 0 s";
    return;
  }

  const selected = activePool.slice(0, pairCount);
  const cards = shuffle(
    selected.flatMap((item, index) => ([
      {
        id: `${item.slug}-term-${index}`,
        pairId: item.slug,
        kind: "term",
        label: item.term,
        revealed: false,
        matched: false
      },
      {
        id: `${item.slug}-definition-${index}`,
        pairId: item.slug,
        kind: "definition",
        label: item.definition,
        revealed: false,
        matched: false
      }
    ]))
  );

  memoryGame = {
    cards,
    matches: 0,
    totalPairs: pairCount,
    moves: 0,
    seconds: 0,
    busy: false,
    ended: false
  };

  memoryStatus.textContent = "Retourne deux cartes pour retrouver une paire.";
  memoryStatus.classList.remove("ok", "ko");
  memoryStart.disabled = false;
  memoryRestart.hidden = true;
  renderBoard();
  updateMeta();
}

async function loadMemory() {
  try {
    const response = await fetch("/api/quiz", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "memory_fetch_failed");
    }

    memoryPool = normalizeItems(payload.items);
    buildCategoryOptions(memoryPool);
    createGame();
    renderLeaderboard();
  } catch (error) {
    memoryStatus.textContent = `Impossible de charger le memory : ${error.message}`;
    memoryStatus.classList.add("ko");
  }
}

memoryStart.addEventListener("click", () => {
  if (!memoryGame) {
    createGame();
  }
  if (!memoryGame) return;

  memoryStatus.textContent = "Partie en cours.";
  memoryStatus.classList.remove("ok", "ko");
  memoryStart.disabled = true;
  memoryRestart.hidden = false;
  startTimer();
});

memoryRestart.addEventListener("click", () => {
  stopTimer();
  createGame();
  startTimer();
  memoryStart.disabled = true;
  memoryRestart.hidden = false;
  memoryStatus.textContent = "Nouvelle partie lancée.";
  memoryStatus.classList.remove("ko");
  memoryStatus.classList.add("ok");
});

memoryCategorySelect.addEventListener("change", () => {
  stopTimer();
  createGame();
});

loadMemory();
