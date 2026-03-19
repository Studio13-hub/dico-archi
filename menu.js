function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-menu-panel]");
  if (!toggle || !panel) return;

  function closeMenu() {
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    const open = panel.classList.contains("is-open");
    if (open) closeMenu();
    else openMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!panel.contains(target) && !toggle.contains(target)) closeMenu();
  });
}

function setupBadgeHomeLink() {
  const badge = document.querySelector(".badge");
  if (!badge) return;
  if (badge.closest("a")) return;

  badge.setAttribute("role", "link");
  badge.setAttribute("tabindex", "0");
  badge.setAttribute("aria-label", "Retour à la page de bienvenue");

  const goHome = () => {
    window.location.href = "index.html";
  };

  badge.addEventListener("click", goHome);
  badge.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goHome();
    }
  });
}

function getCurrentPath() {
  const path = window.location.pathname || "";
  const fileName = path.split("/").filter(Boolean).pop() || "index.html";
  return fileName;
}

function createQuickLink({ label, href, current = false }) {
  const node = current ? document.createElement("span") : document.createElement("a");
  node.className = `page-quicklink${current ? " is-current" : ""}`;
  node.textContent = label;
  if (!current) node.href = href;
  return node;
}

function appendQuickLink(target, item, index, total) {
  target.appendChild(createQuickLink(item));
  if (index >= total - 1) return;

  const separator = document.createElement("span");
  separator.className = "page-quicklink-separator";
  separator.textContent = "/";
  target.appendChild(separator);
}

function buildQuickAccessItems() {
  const path = getCurrentPath();
  const slug = new URLSearchParams(window.location.search).get("slug") || "";

  const items = [{ label: "Accueil", href: "index.html" }];

  if (path === "index.html") {
    items.push({ label: "Bienvenue", current: true });
    return items;
  }

  if (path === "dictionnaire.html") {
    items.push({ label: "Dictionnaire", current: true });
    return items;
  }

  if (path === "category.html") {
    items.push({ label: "Dictionnaire", href: "dictionnaire.html" });
    items.push({ label: "Catégories", current: !slug });
    if (slug === "materiaux") {
      items.push({ label: "Matériaux", current: true });
    }
    return items;
  }

  if (path === "term.html") {
    const title = (document.getElementById("term-title")?.textContent || "").trim();
    items.push({ label: "Dictionnaire", href: "dictionnaire.html" });
    if (slug) {
      if (slug === "bois-lamelle-colle") {
        items.push({ label: "Matériaux", href: "category.html?slug=materiaux" });
      } else {
        items.push({ label: "Fiche terme", href: "dictionnaire.html" });
      }
      items.push({ label: title && title !== "TERME" ? title : "Fiche terme", current: true });
    } else {
      items.push({ label: "Fiche terme", current: true });
    }
    return items;
  }

  if (path === "games.html") {
    items.push({ label: "Jeux", current: true });
    return items;
  }

  if (["quiz.html", "flashcards.html", "match.html", "daily.html", "memory.html"].includes(path)) {
    items.push({ label: "Jeux", href: "games.html" });
    const labels = {
      "quiz.html": "Quiz",
      "flashcards.html": "Swipe",
      "match.html": "Rush",
      "daily.html": "Défi du jour",
      "memory.html": "Duel"
    };
    items.push({ label: labels[path], current: true });
    return items;
  }

  if (path === "methodologie.html") {
    items.push({ label: "Méthodologie", current: true });
    return items;
  }

  if (path === "contribuer.html") {
    items.push({ label: "Contribuer", current: true });
    return items;
  }

  if (path === "auth.html") {
    items.push({ label: "Connexion", current: true });
    return items;
  }

  if (path === "compte.html") {
    items.push({ label: "Mon compte", current: true });
    return items;
  }

  if (path === "admin.html") {
    items.push({ label: "Administration", current: true });
    return items;
  }

  return items;
}

function setupQuickAccess() {
  const heroContent = document.querySelector(".hero__content");
  if (!heroContent) return;
  if (heroContent.querySelector("[data-page-quicklinks]")) return;
  if (document.getElementById("term-quicklinks")) return;

  const title = heroContent.querySelector("h1");
  if (!title) return;

  const wrapper = document.createElement("div");
  wrapper.className = "page-quicklinks";
  wrapper.setAttribute("data-page-quicklinks", "true");

  const items = buildQuickAccessItems();
  items.forEach((item, index) => appendQuickLink(wrapper, item, index, items.length));

  title.insertAdjacentElement("afterend", wrapper);
}

setupMenu();
setupBadgeHomeLink();
setupQuickAccess();
