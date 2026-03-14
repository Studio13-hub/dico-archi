const flashcardsCategorySelect = document.getElementById("flashcards-category");
const flashcardsProgress = document.getElementById("flashcards-progress");
const flashcardsKnown = document.getElementById("flashcards-known");
const flashcardsReview = document.getElementById("flashcards-review");
const flashcardsStatusLine = document.getElementById("flashcards-status-line");
const flashcardsStatus = document.getElementById("flashcards-status");
const flashcardsCard = document.getElementById("flashcards-card");
const flashcardsFrontTitle = document.getElementById("flashcards-front-title");
const flashcardsFrontCategory = document.getElementById("flashcards-front-category");
const flashcardsBackTitle = document.getElementById("flashcards-back-title");
const flashcardsBackDefinition = document.getElementById("flashcards-back-definition");
const flashcardsBackExample = document.getElementById("flashcards-back-example");
const flashcardsFlip = document.getElementById("flashcards-flip");
const flashcardsReviewBtn = document.getElementById("flashcards-review-btn");
const flashcardsKnownBtn = document.getElementById("flashcards-known-btn");
const flashcardsExampleBtn = document.getElementById("flashcards-example-btn");
const flashcardsRestart = document.getElementById("flashcards-restart");
const flashcardsSummary = document.getElementById("flashcards-summary");

const FLASHCARDS_STORAGE_KEY = "dico_archi_flashcards_summary_v1";

let flashcardsPool = [];
let flashcardsSession = null;
let touchStartX = 0;

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
      category: String(item.category || "").trim(),
      example: String(item.example || "").trim()
    }))
    .filter((item) => item.term && item.definition);
}

function buildCategoryOptions(items) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "fr"));

  flashcardsCategorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Toutes les catégories";
  flashcardsCategorySelect.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    flashcardsCategorySelect.appendChild(option);
  }
}

function getActivePool() {
  if (!flashcardsCategorySelect.value) return flashcardsPool;
  return flashcardsPool.filter((item) => item.category === flashcardsCategorySelect.value);
}

function getStoredSummary() {
  try {
    const raw = window.localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function saveSummary(summary) {
  try {
    window.localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(summary));
  } catch (_error) {
    // Ignore storage failures.
  }
}

function renderSummary() {
  const summary = getStoredSummary();
  if (!summary) {
    flashcardsSummary.textContent = "Aucune session terminée.";
    return;
  }

  flashcardsSummary.textContent = `Dernière session : ${summary.known} connues · ${summary.review} à revoir · ${summary.categoryLabel}`;
}

function setStatus(text, tone = "") {
  flashcardsStatus.textContent = text;
  flashcardsStatus.classList.remove("ok", "ko");
  if (tone) flashcardsStatus.classList.add(tone);
}

function updateMeta() {
  if (!flashcardsSession) return;
  const seenCount = Math.min(flashcardsSession.index + 1, flashcardsSession.cards.length);
  flashcardsProgress.textContent = `${seenCount} / ${flashcardsSession.cards.length}`;
  flashcardsKnown.textContent = `Je connais : ${flashcardsSession.known}`;
  flashcardsReview.textContent = `À revoir : ${flashcardsSession.review}`;
  flashcardsStatusLine.textContent = `Carte ${seenCount}`;
}

function setCardFace(isBack) {
  flashcardsCard.classList.toggle("is-flipped", isBack);
  const [front, back] = flashcardsCard.querySelectorAll(".flashcards__face");
  front.classList.toggle("hidden", isBack);
  back.classList.toggle("hidden", !isBack);
}

function renderCurrentCard() {
  if (!flashcardsSession || !flashcardsSession.cards.length) {
    flashcardsFrontTitle.textContent = "Aucune carte";
    flashcardsFrontCategory.textContent = "";
    flashcardsBackDefinition.textContent = "";
    flashcardsBackExample.textContent = "";
    flashcardsFlip.disabled = true;
    flashcardsReviewBtn.disabled = true;
    flashcardsKnownBtn.disabled = true;
    flashcardsExampleBtn.disabled = true;
    return;
  }

  const card = flashcardsSession.cards[flashcardsSession.index];
  flashcardsFrontTitle.textContent = card.term;
  flashcardsFrontCategory.textContent = card.category || "Sans catégorie";
  flashcardsBackTitle.textContent = card.term;
  flashcardsBackDefinition.textContent = card.definition;
  flashcardsBackExample.textContent = card.example ? `Exemple : ${card.example}` : "Aucun exemple disponible pour cette carte.";
  setCardFace(flashcardsSession.showBack);
  flashcardsFlip.disabled = false;
  flashcardsReviewBtn.disabled = false;
  flashcardsKnownBtn.disabled = false;
  flashcardsExampleBtn.disabled = false;
  updateMeta();
}

function finishSession() {
  flashcardsSession.finished = true;
  flashcardsFlip.disabled = true;
  flashcardsReviewBtn.disabled = true;
  flashcardsKnownBtn.disabled = true;
  flashcardsExampleBtn.disabled = true;

  setStatus("Session terminée. Recommence ou change de catégorie pour continuer.", "ok");
  saveSummary({
    known: flashcardsSession.known,
    review: flashcardsSession.review,
    categoryLabel: flashcardsCategorySelect.value || "Toutes catégories",
    createdAt: new Date().toISOString()
  });
  renderSummary();
}

function advanceCard(result) {
  if (!flashcardsSession || flashcardsSession.finished) return;

  if (result === "known") {
    flashcardsSession.known += 1;
    setStatus("Carte validée. Tu peux avancer.", "ok");
  } else if (result === "review") {
    flashcardsSession.review += 1;
    setStatus("Carte envoyée dans « À revoir ».", "ko");
  }

  if (flashcardsSession.index >= flashcardsSession.cards.length - 1) {
    updateMeta();
    finishSession();
    return;
  }

  flashcardsSession.index += 1;
  flashcardsSession.showBack = false;
  renderCurrentCard();
}

function createSession() {
  const activePool = shuffle(getActivePool());
  if (!activePool.length) {
    flashcardsSession = null;
    flashcardsProgress.textContent = "0 / 0";
    flashcardsKnown.textContent = "Je connais : 0";
    flashcardsReview.textContent = "À revoir : 0";
    flashcardsStatusLine.textContent = "Carte 0";
    setStatus("Cette catégorie ne contient pas encore de cartes.", "ko");
    renderCurrentCard();
    return;
  }

  flashcardsSession = {
    cards: activePool,
    index: 0,
    known: 0,
    review: 0,
    showBack: false,
    finished: false
  };

  setStatus("Touchez la carte ou le bouton « Retourner » pour voir la définition.");
  renderCurrentCard();
}

async function loadFlashcards() {
  try {
    const response = await fetch("/api/quiz", {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "flashcards_fetch_failed");
    }

    flashcardsPool = normalizeItems(payload.items);
    buildCategoryOptions(flashcardsPool);
    createSession();
    renderSummary();
  } catch (error) {
    setStatus(`Impossible de charger les flashcards : ${error.message}`, "ko");
  }
}

function flipCard() {
  if (!flashcardsSession || flashcardsSession.finished) return;
  flashcardsSession.showBack = !flashcardsSession.showBack;
  setCardFace(flashcardsSession.showBack);
}

flashcardsCard.addEventListener("click", () => {
  flipCard();
});

flashcardsCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    flipCard();
  }
});

flashcardsCard.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0]?.clientX || 0;
});

flashcardsCard.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0]?.clientX || 0;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) < 40) {
    flipCard();
    return;
  }

  if (deltaX > 0) {
    advanceCard("known");
  } else {
    advanceCard("review");
  }
});

flashcardsFlip.addEventListener("click", () => {
  flipCard();
});

flashcardsReviewBtn.addEventListener("click", () => {
  advanceCard("review");
});

flashcardsKnownBtn.addEventListener("click", () => {
  advanceCard("known");
});

flashcardsExampleBtn.addEventListener("click", () => {
  if (!flashcardsSession || flashcardsSession.finished) return;
  flashcardsSession.showBack = true;
  setCardFace(true);
  const card = flashcardsSession.cards[flashcardsSession.index];
  setStatus(
    card.example
      ? `Exemple affiché pour « ${card.term} ».`
      : "Cette carte n’a pas encore d’exemple.",
    card.example ? "ok" : "ko"
  );
});

flashcardsRestart.addEventListener("click", () => {
  createSession();
});

flashcardsCategorySelect.addEventListener("change", () => {
  createSession();
});

loadFlashcards();
