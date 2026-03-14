const dailyTitle = document.getElementById("daily-title");
const dailyScore = document.getElementById("daily-score");
const dailySeed = document.getElementById("daily-seed");
const dailyRound = document.getElementById("daily-round");
const dailyStatusLine = document.getElementById("daily-status-line");
const dailyProgressBar = document.getElementById("daily-progress-bar");
const dailyQuestion = document.getElementById("daily-question");
const dailyOptions = document.getElementById("daily-options");
const dailyFeedback = document.getElementById("daily-feedback");
const dailyStart = document.getElementById("daily-start");
const dailyNext = document.getElementById("daily-next");
const dailyRestart = document.getElementById("daily-restart");
const dailySummary = document.getElementById("daily-summary");

const DAILY_STORAGE_KEY = "dico_archi_daily_v1";
const DAILY_QUESTION_COUNT = 5;
const DAILY_OPTION_COUNT = 4;

let dailyPool = [];
let dailyState = null;

function seededShuffle(items, seed) {
  const array = items.slice();
  let state = seed;
  function next() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  }
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeItems(items) {
  return (items || [])
    .map((item) => ({
      term: String(item.term || "").trim(),
      slug: String(item.slug || "").trim(),
      definition: String(item.definition || "").trim()
    }))
    .filter((item) => item.term && item.definition);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function updateMeta() {
  if (!dailyState) return;
  dailyScore.textContent = `${dailyState.correct} bonne${dailyState.correct > 1 ? "s" : ""}`;
  dailyRound.textContent = `Question ${Math.min(dailyState.index + 1, DAILY_QUESTION_COUNT)} / ${DAILY_QUESTION_COUNT}`;
  dailyStatusLine.textContent = `Réponses : ${dailyState.total} · Série : ${dailyState.streak}`;
  dailyProgressBar.style.width = `${Math.min((dailyState.total / DAILY_QUESTION_COUNT) * 100, 100)}%`;
}

function setFeedback(text, tone = "") {
  dailyFeedback.textContent = text;
  dailyFeedback.classList.remove("ok", "ko");
  if (tone) dailyFeedback.classList.add(tone);
}

function getStoredSummary() {
  try {
    const raw = window.localStorage.getItem(DAILY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function saveSummary(summary) {
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(summary));
  } catch (_error) {
    // Ignore.
  }
}

function renderSummary() {
  const summary = getStoredSummary();
  if (!summary || summary.dayKey !== getTodayKey()) {
    dailySummary.textContent = "Aucune tentative aujourd'hui.";
    return;
  }
  dailySummary.textContent = `Aujourd'hui : ${summary.score}/${summary.total} · série max ${summary.bestStreak}`;
}

function buildDailyDeck() {
  const dayKey = getTodayKey();
  const seed = hashString(dayKey);
  return seededShuffle(dailyPool, seed).slice(0, DAILY_QUESTION_COUNT);
}

function pickQuestion() {
  const current = dailyState.deck[dailyState.index];
  const distractors = seededShuffle(
    dailyPool.filter((item) => item.slug !== current.slug),
    hashString(`${getTodayKey()}-${current.slug}`)
  ).slice(0, Math.min(DAILY_OPTION_COUNT - 1, dailyPool.length - 1));

  const options = seededShuffle(
    [current, ...distractors].map((item) => ({
      label: item.term,
      isCorrect: item.slug === current.slug
    })),
    hashString(`options-${current.slug}-${getTodayKey()}`)
  );

  return {
    prompt: "Quel terme correspond à cette définition ?",
    definition: current.definition,
    correctLabel: current.term,
    options
  };
}

function finishDaily() {
  dailyState.ended = true;
  dailyStart.hidden = true;
  dailyStart.disabled = true;
  dailyNext.disabled = true;
  dailyRestart.hidden = false;
  setFeedback("Défi terminé. Vous pouvez rejouer la même série aujourd’hui.", "ok");
  saveSummary({
    dayKey: getTodayKey(),
    score: dailyState.correct,
    total: dailyState.total,
    bestStreak: dailyState.bestStreak
  });
  renderSummary();
}

function renderQuestion() {
  if (!dailyState || dailyState.ended) return;

  const current = pickQuestion();
  dailyQuestion.textContent = current.prompt;
  dailyOptions.textContent = "";
  setFeedback("");
  dailyNext.disabled = true;

  const definition = document.createElement("div");
  definition.className = "match__target";
  definition.textContent = current.definition;
  dailyOptions.appendChild(definition);

  const optionsWrap = document.createElement("div");
  optionsWrap.className = "quiz__options";

  for (const option of current.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      if (button.disabled || dailyState.ended) return;

      const buttons = optionsWrap.querySelectorAll("button");
      buttons.forEach((item) => {
        item.disabled = true;
        if (item.textContent === current.correctLabel) {
          item.classList.add("correct");
        }
      });

      dailyState.total += 1;
      if (option.isCorrect) {
        dailyState.correct += 1;
        dailyState.streak += 1;
        dailyState.bestStreak = Math.max(dailyState.bestStreak, dailyState.streak);
        setFeedback("Bonne réponse.", "ok");
      } else {
        dailyState.streak = 0;
        button.classList.add("wrong");
        setFeedback(`Bonne réponse : ${current.correctLabel}`, "ko");
      }

      updateMeta();
      if (dailyState.total >= DAILY_QUESTION_COUNT) {
        finishDaily();
        return;
      }

      dailyNext.disabled = false;
    });
    optionsWrap.appendChild(button);
  }

  dailyOptions.appendChild(optionsWrap);
  updateMeta();
}

function resetDaily() {
  const deck = buildDailyDeck();
  dailyState = {
    deck,
    index: 0,
    total: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    ended: false
  };

  dailyTitle.textContent = "Défi du jour";
  dailySeed.textContent = `Jour : ${getTodayKey()}`;
  dailyQuestion.textContent = "Clique sur « Commencer » pour lancer la série quotidienne.";
  dailyOptions.textContent = "";
  dailyStart.hidden = false;
  dailyStart.disabled = false;
  dailyNext.disabled = true;
  dailyRestart.hidden = true;
  setFeedback("");
  updateMeta();
}

async function loadDaily() {
  try {
    const response = await fetch("/api/quiz", {
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "daily_fetch_failed");
    }

    dailyPool = normalizeItems(payload.items);
    if (dailyPool.length < DAILY_OPTION_COUNT) {
      dailyQuestion.textContent = "Le corpus est encore trop petit pour le défi du jour.";
      dailyStart.hidden = false;
      dailyStart.disabled = true;
      return;
    }

    resetDaily();
    renderSummary();
  } catch (error) {
    dailyQuestion.textContent = `Impossible de charger le défi : ${error.message}`;
    dailyStart.disabled = true;
  }
}

dailyStart.addEventListener("click", () => {
  if (!dailyState) return;
  dailyStart.disabled = true;
  dailyStart.hidden = true;
  renderQuestion();
});

dailyNext.addEventListener("click", () => {
  if (!dailyState || dailyState.ended) return;
  dailyState.index += 1;
  renderQuestion();
});

dailyRestart.addEventListener("click", () => {
  resetDaily();
  dailyStart.disabled = true;
  renderQuestion();
});

loadDaily();
