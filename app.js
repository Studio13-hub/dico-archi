const cards = document.getElementById("cards");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const randomButton = document.getElementById("random");
const meta = document.getElementById("meta");
const syncStatus = document.getElementById("sync-status");
const quizToggle = document.getElementById("quiz-toggle");
const quizSection = document.getElementById("quiz");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizScore = document.getElementById("quiz-score");
const quizNext = document.getElementById("quiz-next");
const quizExit = document.getElementById("quiz-exit");

let allTerms = [];

function hasSupabaseConfig() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
}

function setSyncStatus(text) {
  if (!syncStatus) return;
  syncStatus.textContent = text;
}

function normalizeTerm(item) {
  const related = Array.isArray(item.related)
    ? item.related
    : item.related
      ? String(item.related).split("|").map((value) => value.trim()).filter(Boolean)
      : [];

  return {
    term: item.term || "",
    category: item.category || "Non classe",
    definition: item.definition || "",
    example: item.example || "",
    related,
    image_url: item.image_url || ""
  };
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function buildCategoryOptions(terms) {
  const categories = Array.from(new Set(terms.map((t) => t.category))).sort();
  clearChildren(categorySelect);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Toutes les categories";
  categorySelect.appendChild(allOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }
}

function render(list) {
  clearChildren(cards);

  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    const title = document.createElement("h3");
    title.textContent = "Pas de resultat";
    const example = document.createElement("div");
    example.className = "example";
    example.textContent = "Essaie un autre mot ou categorie.";
    empty.appendChild(title);
    empty.appendChild(example);
    cards.appendChild(empty);
    meta.textContent = "0 terme";
    return;
  }

  for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.category;

    const title = document.createElement("h3");
    title.textContent = item.term;

    if (item.image_url) {
      const image = document.createElement("img");
      image.className = "card__image";
      image.src = item.image_url;
      image.alt = item.term;
      card.appendChild(image);
    }

    const definition = document.createElement("div");
    definition.textContent = item.definition;

    const example = document.createElement("div");
    example.className = "example";
    example.textContent = item.example;

    const related = document.createElement("div");
    related.className = "related";
    related.textContent = item.related.length ? `Lie a: ${item.related.join(", ")}` : "";

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(definition);
    if (item.example) card.appendChild(example);
    if (item.related.length) card.appendChild(related);

    cards.appendChild(card);
  }

  meta.textContent = `${list.length} terme${list.length > 1 ? "s" : ""}`;
}

function getFilteredTerms() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  let filtered = allTerms.filter((t) =>
    [t.term, t.definition, t.example, ...(t.related || [])]
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
    ? allTerms
    : allTerms.filter((t) => t.category === categorySelect.value);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  if (!choice) return;
  searchInput.value = choice.term;
  filterTerms();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let quizState = {
  total: 0,
  correct: 0,
  current: null
};

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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

async function loadTerms() {
  const localTerms = Array.isArray(window.TERMS) ? window.TERMS.map(normalizeTerm) : [];

  if (!hasSupabaseConfig()) {
    allTerms = localTerms;
    buildCategoryOptions(allTerms);
    render(allTerms);
    setSyncStatus("Mode local: configure Supabase pour la synchro.");
    return;
  }

  try {
    const supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabaseClient
      .from("terms")
      .select("term, category, definition, example, related, image_url")
      .order("term", { ascending: true });

    if (error) throw error;

    allTerms = (data || []).map(normalizeTerm);
    if (!allTerms.length && localTerms.length) {
      allTerms = localTerms;
      setSyncStatus("Supabase vide: affichage local en secours.");
    } else {
      setSyncStatus("Donnees synchronisees depuis Supabase.");
    }
  } catch (err) {
    console.error(err);
    allTerms = localTerms;
    setSyncStatus("Erreur de synchro Supabase: affichage local.");
  }

  buildCategoryOptions(allTerms);
  render(allTerms);
}

loadTerms();
