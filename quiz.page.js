const quizModeSelect = document.getElementById("quiz-mode");
const quizCategorySelect = document.getElementById("quiz-category");
const quizQuestion = document.getElementById("quiz-question");
const quizFigure = document.getElementById("quiz-figure");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizScore = document.getElementById("quiz-score");
const quizStreak = document.getElementById("quiz-streak");
const quizProgressLabel = document.getElementById("quiz-progress-label");
const quizProgressBar = document.getElementById("quiz-progress-bar");
const quizBadge = document.getElementById("quiz-badge");
const quizNext = document.getElementById("quiz-next");
const quizReplay = document.getElementById("quiz-replay");
const quizLeaderboard = document.getElementById("quiz-leaderboard");

const QUIZ_STORAGE_KEY = "dico_archi_quiz_scores_v2";
const QUIZ_QUESTION_COUNT = 10;
const QUIZ_OPTION_COUNT = 4;
const QUIZ_MIN_OPTION_COUNT = 2;

let termPool = [];
let filteredPool = [];
let quizState = null;

function shuffle(items) {
  const array = items.slice();
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function normalizeQuizItems(items) {
  return (items || [])
    .map((item) => ({
      term: String(item.term || "").trim(),
      slug: String(item.slug || "").trim(),
      definition: String(item.definition || "").trim(),
      category: String(item.category || item.categories?.name || "").trim(),
      media_url: String(item.media_url || "").trim(),
      media_alt_text: String(item.media_alt_text || "").trim(),
      media_title: String(item.media_title || "").trim()
    }))
    .filter((item) => item.term && item.definition);
}

function buildCategoryOptions(items) {
  const categories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "fr"));

  quizCategorySelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Toutes les catégories";
  quizCategorySelect.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    quizCategorySelect.appendChild(option);
  }
}

function getActivePool() {
  const selectedCategory = quizCategorySelect.value;
  if (!selectedCategory) return termPool;
  return termPool.filter((item) => item.category === selectedCategory);
}

function getPlayablePool() {
  const pool = filteredPool.length ? filteredPool : termPool;
  if (quizModeSelect.value !== "media-to-term") return pool;
  return pool.filter((item) => item.media_url);
}

function setQuizMessage(text, tone = "") {
  quizFeedback.textContent = text;
  quizFeedback.classList.remove("ok", "ko");
  if (tone) quizFeedback.classList.add(tone);
}

function getLeaderboard() {
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveLeaderboard(entries) {
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(entries));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function renderLeaderboard() {
  const entries = getLeaderboard();
  if (!entries.length) {
    quizLeaderboard.textContent = "Aucune partie enregistrée.";
    return;
  }

  quizLeaderboard.textContent = entries
    .map((item, index) => `${index + 1}. ${item.score}/${item.total} · ${item.modeLabel}`)
    .join(" · ");
}

function getModeLabel() {
  if (quizModeSelect.value === "definition-to-term") return "Définition -> terme";
  if (quizModeSelect.value === "media-to-term") return "Image / schéma -> terme";
  return "Terme -> définition";
}

function updateBadge() {
  if (!quizState || !quizState.ended) {
    quizBadge.classList.add("hidden");
    quizBadge.textContent = "";
    quizBadge.classList.remove("gold", "silver", "bronze");
    return;
  }

  const ratio = quizState.total ? quizState.correct / quizState.total : 0;
  let cls = "bronze";
  let label = "Badge : Bronze";
  if (ratio >= 0.8) {
    cls = "gold";
    label = "Badge : Or";
  } else if (ratio >= 0.55) {
    cls = "silver";
    label = "Badge : Argent";
  }

  quizBadge.classList.remove("hidden", "gold", "silver", "bronze");
  quizBadge.classList.add(cls);
  quizBadge.textContent = `${label} · ${quizState.correct}/${quizState.total}`;
}

function updateQuizMeta() {
  if (!quizState) return;

  quizScore.textContent = `${quizState.correct} / ${quizState.total}`;
  quizStreak.textContent = `Série : ${quizState.streak}`;
  quizProgressLabel.textContent = `Question ${Math.min(quizState.index + 1, QUIZ_QUESTION_COUNT)} / ${QUIZ_QUESTION_COUNT}`;

  const pct = quizState.total ? (quizState.total / QUIZ_QUESTION_COUNT) * 100 : 0;
  quizProgressBar.style.width = `${Math.min(pct, 100)}%`;
  updateBadge();
}

function pickQuestion() {
  const mode = quizModeSelect.value;
  const pool = getPlayablePool();
  if (pool.length < QUIZ_MIN_OPTION_COUNT) return null;

  const remaining = pool.filter((item) => !quizState.usedSlugs.has(item.slug));
  const source = (remaining.length ? remaining : pool);
  const correct = source[Math.floor(Math.random() * source.length)];
  const optionCount = Math.min(QUIZ_OPTION_COUNT, pool.length);

  if (correct.slug) {
    quizState.usedSlugs.add(correct.slug);
  }

  const distractors = shuffle(
    pool.filter((item) => item.slug !== correct.slug)
  ).slice(0, optionCount - 1);

  const options = shuffle([correct, ...distractors]).map((item) => ({
    isCorrect: item.slug === correct.slug,
    value: mode === "term-to-definition" ? item.definition : item.term
  }));

  let prompt = `Quelle définition correspond au terme « ${correct.term} » ?`;
  if (mode === "definition-to-term") {
    prompt = `Quel terme correspond à cette définition ?\n${correct.definition}`;
  } else if (mode === "media-to-term") {
    prompt = "Quel terme correspond à cette image ou à ce schéma ?";
  }

  return {
    prompt,
    answer: correct,
    options
  };
}

function endQuiz() {
  quizState.ended = true;
  quizNext.disabled = true;
  quizReplay.hidden = false;

  const leaderboard = getLeaderboard();
  leaderboard.push({
    score: quizState.correct,
    total: quizState.total,
    modeLabel: getModeLabel(),
    createdAt: new Date().toISOString()
  });

  leaderboard.sort((a, b) => b.score - a.score || a.total - b.total);
  saveLeaderboard(leaderboard.slice(0, 5));
  renderLeaderboard();

  window.DicoArchiMetrics?.submitGameScore({
    gameKey: "quiz",
    score: quizState.correct,
    total: quizState.total,
    modeLabel: getModeLabel()
  });

  setQuizMessage("Manche terminée. Rejoue pour améliorer ton score.", "ok");
  updateQuizMeta();
}

function renderQuestion() {
  if (quizState.ended) {
    endQuiz();
    return;
  }

  const current = pickQuestion();
  if (!current) {
    quizQuestion.textContent = "Le quiz n’a pas encore assez de contenu pour ce mode.";
    quizNext.disabled = true;
    quizFigure.innerHTML = "";
    quizFigure.classList.add("hidden");
    quizOptions.textContent = "";
    setQuizMessage("");
    return;
  }

  quizState.current = current;
  quizQuestion.textContent = current.prompt;
  quizFigure.innerHTML = "";
  quizFigure.classList.add("hidden");
  quizOptions.textContent = "";
  setQuizMessage("");
  quizNext.disabled = true;

  if (quizModeSelect.value === "media-to-term" && current.answer.media_url) {
    const image = document.createElement("img");
    image.src = current.answer.media_url;
    image.alt = current.answer.media_alt_text || current.answer.media_title || `Schéma pour ${current.answer.term}`;
    image.loading = "lazy";
    quizFigure.appendChild(image);
    quizFigure.classList.remove("hidden");
  }

  for (const option of current.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.value;
    button.addEventListener("click", () => {
      if (button.disabled || quizState.ended) return;

      const buttons = quizOptions.querySelectorAll("button");
      buttons.forEach((item) => {
        item.disabled = true;
        if (item.textContent === current.options.find((entry) => entry.isCorrect)?.value) {
          item.classList.add("correct");
        }
      });

      quizState.total += 1;
      quizState.index += 1;

      if (option.isCorrect) {
        quizState.correct += 1;
        quizState.streak += 1;
        button.classList.add("correct");
        setQuizMessage("Bonne réponse.", "ok");
      } else {
        quizState.streak = 0;
        button.classList.add("wrong");
        setQuizMessage(
          `Bonne réponse : ${
            quizModeSelect.value !== "term-to-definition"
              ? current.answer.term
              : current.answer.definition
          }`,
          "ko"
        );
      }

      updateQuizMeta();
      if (quizState.total >= QUIZ_QUESTION_COUNT) {
        endQuiz();
        return;
      }

      quizNext.disabled = false;
    });
    quizOptions.appendChild(button);
  }

  updateQuizMeta();
}

function resetQuiz() {
  filteredPool = getActivePool();
  const playablePool = quizModeSelect.value === "media-to-term"
    ? filteredPool.filter((item) => item.media_url)
    : filteredPool;
  quizState = {
    index: 0,
    total: 0,
    correct: 0,
    streak: 0,
    usedSlugs: new Set(),
    current: null,
    ended: false
  };

  quizReplay.hidden = true;
  quizNext.disabled = false;
  quizNext.textContent = "Commencer";
  quizQuestion.textContent = "Clique sur « Commencer » pour lancer une manche de 10 questions.";
  quizFigure.innerHTML = "";
  quizFigure.classList.add("hidden");
  quizOptions.textContent = "";
  setQuizMessage("");

  if (playablePool.length < QUIZ_MIN_OPTION_COUNT) {
    quizQuestion.textContent = quizModeSelect.value === "media-to-term"
      ? "Cette catégorie ne contient pas encore assez d’images ou de schémas pour lancer ce mode."
      : "Cette catégorie ne contient pas encore assez de termes pour lancer le quiz.";
    quizNext.disabled = true;
  }

  updateQuizMeta();
}

async function loadQuizTerms() {
  if (!window.DicoArchiApi) {
    quizQuestion.textContent = "Configuration Supabase manquante.";
    return;
  }

  try {
    const response = await fetch("/api/quiz", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "quiz_fetch_failed");
    }

    termPool = normalizeQuizItems(payload.items);

    if (termPool.length < QUIZ_MIN_OPTION_COUNT) {
      quizQuestion.textContent = "Le corpus publié est encore trop petit pour lancer le quiz.";
      return;
    }

    buildCategoryOptions(termPool);
    resetQuiz();
    renderLeaderboard();
  } catch (error) {
    quizQuestion.textContent = `Impossible de charger le quiz : ${error.message}`;
  }
}

quizNext.addEventListener("click", () => {
  if (!quizState) return;
  if (!quizState.total && !quizState.current) {
    renderQuestion();
    return;
  }
  renderQuestion();
});

quizReplay.addEventListener("click", () => {
  resetQuiz();
  renderQuestion();
});

quizModeSelect.addEventListener("change", () => {
  resetQuiz();
});

quizCategorySelect.addEventListener("change", () => {
  resetQuiz();
});

loadQuizTerms();
