const matchModeSelect = document.getElementById("match-mode");
const matchCategorySelect = document.getElementById("match-category");
const matchTimer = document.getElementById("match-timer");
const matchRound = document.getElementById("match-round");
const matchScore = document.getElementById("match-score");
const matchProgressBar = document.getElementById("match-progress-bar");
const matchPrompt = document.getElementById("match-prompt");
const matchTarget = document.getElementById("match-target");
const matchOptions = document.getElementById("match-options");
const matchFeedback = document.getElementById("match-feedback");
const matchStart = document.getElementById("match-start");
const matchNext = document.getElementById("match-next");
const matchRestart = document.getElementById("match-restart");
const matchLeaderboard = document.getElementById("match-leaderboard");

const MATCH_STORAGE_KEY = "dico_archi_match_scores_v1";
const MATCH_DURATION_SECONDS = 45;
const MATCH_OPTION_COUNT = 4;
const MATCH_MIN_OPTION_COUNT = 2;

let matchPool = [];
let matchState = null;
let matchTimerId = null;

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
    .filter((item) => item.term && item.definition && item.category);
}

function buildCategoryOptions(items) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "fr"));

  matchCategorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Toutes les catégories";
  matchCategorySelect.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    matchCategorySelect.appendChild(option);
  }
}

function getActivePool() {
  if (!matchCategorySelect.value) return matchPool;
  return matchPool.filter((item) => item.category === matchCategorySelect.value);
}

function updateMeta() {
  if (!matchState) return;
  matchScore.textContent = `${matchState.correct} / ${matchState.total}`;
  matchTimer.textContent = `Temps restant : ${Math.max(matchState.remainingSeconds, 0)} s`;
  matchRound.textContent = `Combo : ${matchState.combo}`;
  const pct = ((MATCH_DURATION_SECONDS - Math.max(matchState.remainingSeconds, 0)) / MATCH_DURATION_SECONDS) * 100;
  matchProgressBar.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
}

function stopTimer() {
  if (matchTimerId) {
    window.clearInterval(matchTimerId);
    matchTimerId = null;
  }
}

function startTimer() {
  stopTimer();
  matchTimerId = window.setInterval(() => {
    if (!matchState || matchState.ended) return;
    matchState.elapsedSeconds += 1;
    matchState.remainingSeconds -= 1;
    updateMeta();
    if (matchState.remainingSeconds <= 0) {
      finishGame();
    }
  }, 1000);
}

function getLeaderboard() {
  try {
    const raw = window.localStorage.getItem(MATCH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    window.localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(entries));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function renderLeaderboard() {
  const entries = getLeaderboard();
  if (!entries.length) {
    matchLeaderboard.textContent = "Aucune partie enregistrée.";
    return;
  }

  matchLeaderboard.textContent = entries
    .map((item, index) => `${index + 1}. ${item.score}/${item.total} · combo ${item.bestCombo} · ${item.modeLabel}`)
    .join(" · ");
}

function getModeLabel() {
  return matchModeSelect.value === "definition-to-term"
    ? "Définition -> terme"
    : "Terme -> catégorie";
}

function setMessage(text, tone = "") {
  matchFeedback.textContent = text;
  matchFeedback.classList.remove("ok", "ko");
  if (tone) matchFeedback.classList.add(tone);
}

function getChoicePool() {
  const pool = getActivePool();
  if (matchModeSelect.value === "term-to-category") {
    const categoryPool = Array.from(new Set(pool.map((item) => item.category).filter(Boolean)));
    return categoryPool.length >= MATCH_MIN_OPTION_COUNT ? pool : [];
  }
  return pool.length >= MATCH_MIN_OPTION_COUNT ? pool : [];
}

function pickQuestion() {
  const pool = getChoicePool();
  if (!pool.length) return null;

  const remaining = pool.filter((item) => !matchState.usedSlugs.has(item.slug));
  const source = remaining.length ? remaining : pool;
  const correct = source[Math.floor(Math.random() * source.length)];
  matchState.usedSlugs.add(correct.slug);

  if (matchModeSelect.value === "term-to-category") {
    const categoryChoices = shuffle(
      Array.from(new Set(pool.map((item) => item.category).filter(Boolean)))
    );
    const correctCategory = correct.category;
    const options = shuffle([
      correctCategory,
      ...categoryChoices.filter((item) => item !== correctCategory).slice(0, MATCH_OPTION_COUNT - 1)
    ]).map((value) => ({
      label: value,
      isCorrect: value === correctCategory
    }));

    return {
      prompt: "Choisis la bonne catégorie pour ce terme.",
      target: correct.term,
      correctLabel: correctCategory,
      options
    };
  }

  const optionCount = Math.min(MATCH_OPTION_COUNT, pool.length);
  const distractors = shuffle(pool.filter((item) => item.slug !== correct.slug)).slice(0, optionCount - 1);
  const options = shuffle([correct, ...distractors]).map((item) => ({
    label: item.term,
    isCorrect: item.slug === correct.slug
  }));

  return {
    prompt: "Quel terme correspond à cette définition ?",
    target: correct.definition,
    correctLabel: correct.term,
    options
  };
}

function finishGame() {
  if (!matchState || matchState.ended) return;
  matchState.ended = true;
  stopTimer();
  matchStart.disabled = true;
  matchNext.disabled = true;
  matchRestart.hidden = false;
  setMessage("Run terminé. Rejoue pour battre ton score et ton combo.", "ok");

  const leaderboard = getLeaderboard();
  leaderboard.push({
    score: matchState.correct,
    total: matchState.total,
    seconds: matchState.elapsedSeconds,
    bestCombo: matchState.bestCombo,
    modeLabel: getModeLabel(),
    createdAt: new Date().toISOString()
  });
  leaderboard.sort((a, b) => b.score - a.score || b.bestCombo - a.bestCombo || a.seconds - b.seconds);
  saveLeaderboard(leaderboard.slice(0, 5));
  renderLeaderboard();

  window.DicoArchiMetrics?.submitGameScore({
    gameKey: "rush",
    score: matchState.correct,
    total: matchState.total,
    seconds: matchState.elapsedSeconds,
    bestCombo: matchState.bestCombo,
    modeLabel: getModeLabel(),
    categoryLabel: matchCategorySelect?.value || "Toutes catégories"
  });
}

function renderQuestion() {
  if (!matchState || matchState.ended) return;

  const question = pickQuestion();
  if (!question) {
    matchPrompt.textContent = "Ce mode n’a pas encore assez de contenu pour se lancer.";
    matchTarget.textContent = "";
    matchOptions.textContent = "";
    matchStart.disabled = true;
    matchNext.disabled = true;
    setMessage("");
    return;
  }

  matchState.current = question;
  matchPrompt.textContent = question.prompt;
  matchTarget.textContent = question.target;
  matchOptions.textContent = "";
  setMessage("");
  matchNext.disabled = true;

  for (const option of question.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      if (button.disabled || matchState.ended) return;

      const buttons = matchOptions.querySelectorAll("button");
      buttons.forEach((item) => {
        item.disabled = true;
        if (item.textContent === question.correctLabel) {
          item.classList.add("correct");
        }
      });

      matchState.total += 1;
      matchState.index += 1;

      if (option.isCorrect) {
        matchState.correct += 1;
        matchState.combo += 1;
        matchState.bestCombo = Math.max(matchState.bestCombo, matchState.combo);
        button.classList.add("correct");
        setMessage(`Bonne réponse. Combo x${matchState.combo}.`, "ok");
      } else {
        matchState.combo = 0;
        button.classList.add("wrong");
        setMessage(`Bonne réponse : ${question.correctLabel}`, "ko");
      }

      updateMeta();
      matchNext.disabled = false;
    });
    matchOptions.appendChild(button);
  }

  updateMeta();
}

function resetGame() {
  stopTimer();
  matchState = {
    index: 0,
    total: 0,
    correct: 0,
    elapsedSeconds: 0,
    remainingSeconds: MATCH_DURATION_SECONDS,
    combo: 0,
    bestCombo: 0,
    usedSlugs: new Set(),
    current: null,
    ended: false
  };

  matchPrompt.textContent = "Clique sur « Lancer le run » pour démarrer une manche de 45 secondes.";
  matchTarget.textContent = "";
  matchOptions.textContent = "";
  matchStart.disabled = false;
  matchNext.disabled = true;
  matchRestart.hidden = true;
  setMessage("");

  if (!getChoicePool().length) {
    matchPrompt.textContent = "Ce mode n’a pas encore assez de contenu pour se lancer.";
    matchStart.disabled = true;
  }

  updateMeta();
}

async function loadMatch() {
  try {
    const response = await fetch("/api/quiz", {
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "match_fetch_failed");
    }

    matchPool = normalizeItems(payload.items);
    buildCategoryOptions(matchPool);
    resetGame();
    renderLeaderboard();
  } catch (error) {
    matchPrompt.textContent = `Impossible de charger Match Express : ${error.message}`;
    setMessage("", "");
    matchStart.disabled = true;
  }
}

matchStart.addEventListener("click", () => {
  if (!matchState) return;
  matchStart.disabled = true;
  matchRestart.hidden = false;
  startTimer();
  renderQuestion();
});

matchNext.addEventListener("click", () => {
  if (!matchState || matchState.ended) return;
  matchNext.disabled = true;
  renderQuestion();
});

matchRestart.addEventListener("click", () => {
  resetGame();
  matchStart.disabled = true;
  matchRestart.hidden = false;
  startTimer();
  renderQuestion();
});

matchModeSelect.addEventListener("change", () => {
  resetGame();
});

matchCategorySelect.addEventListener("change", () => {
  resetGame();
});

loadMatch();
