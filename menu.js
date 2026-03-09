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
  badge.setAttribute("aria-label", "Retour au dictionnaire");

  const goHome = () => {
    window.location.href = "dictionnaire.html";
  };

  badge.addEventListener("click", goHome);
  badge.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goHome();
    }
  });
}

setupMenu();
setupBadgeHomeLink();
