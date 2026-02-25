const cards = document.getElementById("cards");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const randomButton = document.getElementById("random");
const meta = document.getElementById("meta");
const quizToggle = document.getElementById("quiz-toggle");
const quizSection = document.getElementById("quiz");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizScore = document.getElementById("quiz-score");
const quizNext = document.getElementById("quiz-next");
const quizExit = document.getElementById("quiz-exit");

const categories = Array.from(new Set(TERMS.map((t) => t.category))).sort();

for (const category of categories) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
}

function render(list) {
  cards.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `
      <h3>Pas de resultat</h3>
      <div class="example">Essaie un autre mot ou categorie.</div>
    `;
    cards.appendChild(empty);
    meta.textContent = "0 terme";
    return;
  }

  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="tag">${item.category}</span>
      <h3>${item.term}</h3>
      <div>${item.definition}</div>
      <div class="example">${item.example}</div>
      <div class="related">Lie a: ${item.related.join(", ")}</div>
    `;
    cards.appendChild(card);
  }

  meta.textContent = `${list.length} terme${list.length > 1 ? "s" : ""}`;
}

function getFilteredTerms() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  let filtered = TERMS.filter((t) =>
    [t.term, t.definition, t.example, ...t.related]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  if (category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }

  return filtered;
}

function filterTerms() {
  const filtered = getFilteredTerms();
  render(filtered);
}

searchInput.addEventListener("input", filterTerms);
categorySelect.addEventListener("change", filterTerms);

randomButton.addEventListener("click", () => {
  const pool = categorySelect.value === "all"
    ? TERMS
    : TERMS.filter((t) => t.category === categorySelect.value);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  if (!choice) return;
  searchInput.value = choice.term;
  filterTerms();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

render(TERMS);

let quizState = {
  total: 0,
  correct: 0,
  current: null
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function updateScore() {
  quizScore.textContent = `${quizState.correct} / ${quizState.total}`;
}

function buildQuestion() {
  const pool = getFilteredTerms();
  if (pool.length < 2) {
    quizQuestion.textContent = "Ajoute plus de termes pour lancer un quiz.";
    quizOptions.innerHTML = "";
    return;
  }

  const correct = pool[Math.floor(Math.random() * pool.length)];
  const others = shuffle(pool.filter((t) => t.term !== correct.term)).slice(0, 3);
  const options = shuffle([correct, ...others]);

  quizState.current = correct;
  quizQuestion.textContent = `Que veut dire : ${correct.term} ?`;
  quizFeedback.textContent = "";
  quizOptions.innerHTML = "";

  for (const option of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = option.definition;
    btn.addEventListener("click", () => handleAnswer(btn, option.term === correct.term));
    quizOptions.appendChild(btn);
  }
}

function handleAnswer(button, isCorrect) {
  const buttons = quizOptions.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));

  quizState.total += 1;
  if (isCorrect) {
    quizState.correct += 1;
    button.classList.add("correct");
    quizFeedback.textContent = "Correct.";
  } else {
    button.classList.add("wrong");
    quizFeedback.textContent = `Incorrect. La bonne reponse : ${quizState.current.definition}`;
  }

  updateScore();
}

quizToggle.addEventListener("click", () => {
  quizSection.classList.toggle("hidden");
  if (!quizSection.classList.contains("hidden")) {
    quizState = { total: 0, correct: 0, current: null };
    updateScore();
    buildQuestion();
    window.scrollTo({ top: quizSection.offsetTop - 20, behavior: "smooth" });
  }
});

quizNext.addEventListener("click", () => {
  buildQuestion();
});

quizExit.addEventListener("click", () => {
  quizSection.classList.add("hidden");
});
