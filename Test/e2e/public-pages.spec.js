const { test, expect } = require("@playwright/test");

function isIgnorableConsoleError(message) {
  const text = String(message || "");
  return text.includes("Unsupported method ('POST')");
}

const mockQuizItems = [
  {
    term: "Acrotère",
    slug: "acrotere",
    definition: "Petit mur en bord de toiture qui permet de relever l’etancheite.",
    category: "Toitures",
    example: "L'acrotere sert souvent de support au releve d'etancheite."
  },
  {
    term: "Béton",
    slug: "beton",
    definition: "Materiau compose de ciment, d'eau, de sable et de granulats.",
    category: "Matériaux",
    example: "Le beton arme est courant dans les structures porteuses."
  },
  {
    term: "Façade",
    slug: "facade",
    definition: "Face exterieure d'un batiment, souvent traitee comme une composition.",
    category: "Façades",
    example: "La facade principale donne l'identite du projet."
  },
  {
    term: "Coupe-feu",
    slug: "coupe-feu",
    definition: "Element ou disposition limitant la propagation du feu pendant un temps donne.",
    category: "Sécurité incendie",
    example: "La porte coupe-feu se ferme automatiquement en cas d'alerte."
  }
];

async function mockQuizApi(page) {
  await page.route("**/api/quiz", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ items: mockQuizItems })
    });
  });
}

const pages = [
  {
    path: "/index.html",
    title: "Dico-Archi - Bienvenue",
    selectors: [".home-featured-card", ".home-bottom-links", ".home-bottom-panel"]
  },
  {
    path: "/dictionnaire.html",
    title: "Dico-Archi - Dictionnaire simple d'architecture",
    selectors: [".hero-ribbon", ".panel--dictionary", "#terms-list"]
  },
  {
    path: "/category.html",
    title: "Catégorie - Dico-Archi",
    selectors: [".hero-ribbon", ".panel--category", "#category-cards"]
  },
  {
    path: "/term.html",
    title: "Fiche terme - Dico-Archi",
    selectors: [".hero-ribbon", ".panel--term", ".term-intro-grid"]
  }
];

const secondaryPages = [
  {
    path: "/auth.html",
    title: "Connexion - Dico-Archi",
    selectors: ["#auth-form", "#login", "#signup"]
  },
  {
    path: "/compte.html",
    title: "Mon compte - Dico-Archi",
    selectors: [".account", "#account-email", "#account-login-link"]
  },
  {
    path: "/contribuer.html",
    title: "Contribuer - Dico-Archi",
    selectors: ["#contrib-form", "#term", "#submit"]
  },
  {
    path: "/methodologie.html",
    title: "Méthodologie - Dico-Archi",
    selectors: [".section-eyebrow", ".section-split", "footer .footer__inner"]
  },
  {
    path: "/games.html",
    title: "Jeux - Dico-Archi",
    selectors: [".panel--games", ".games-grid", ".game-card"]
  },
  {
    path: "/quiz.html",
    title: "Quiz - Dico-Archi",
    selectors: [".quiz", "#quiz-score", "#quiz-next"]
  },
  {
    path: "/flashcards.html",
    title: "Swipe - Dico-Archi",
    selectors: [".flashcards", "#flashcards-card", "#flashcards-flip"]
  },
  {
    path: "/match.html",
    title: "Rush - Dico-Archi",
    selectors: [".match", "#match-score", "#match-start"]
  },
  {
    path: "/daily.html",
    title: "Défi du jour - Dico-Archi",
    selectors: [".quiz", "#daily-title", "#daily-start"]
  },
  {
    path: "/memory.html",
    title: "Duel Beta - Dico-Archi",
    selectors: [".memory", "#memory-score", "#memory-start"]
  }
];

for (const pageDef of pages) {
  test(`public smoke ${pageDef.path}`, async ({ page }) => {
    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (isIgnorableConsoleError(text)) return;
      consoleErrors.push(text);
    });

    await page.goto(pageDef.path, { waitUntil: "networkidle" });
    await expect(page).toHaveTitle(pageDef.title);

    for (const selector of pageDef.selectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    expect(consoleErrors, `Console/page errors on ${pageDef.path}`).toEqual([]);
  });

  test(`public visual capture ${pageDef.path}`, async ({ page }, testInfo) => {
    await page.goto(pageDef.path, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.screenshot({
      path: testInfo.outputPath(`${pageDef.path.replace(/[/.]+/g, "-")}-desktop.png`),
      fullPage: true,
      animations: "disabled"
    });
  });
}

for (const pageDef of secondaryPages) {
  test(`secondary smoke ${pageDef.path}`, async ({ page }) => {
    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (isIgnorableConsoleError(text)) return;
      consoleErrors.push(text);
    });

    if (["/quiz.html", "/flashcards.html", "/match.html", "/daily.html", "/memory.html"].includes(pageDef.path)) {
      await mockQuizApi(page);
    }

    await page.goto(pageDef.path, { waitUntil: "networkidle" });
    await expect(page).toHaveTitle(pageDef.title);

    for (const selector of pageDef.selectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    expect(consoleErrors, `Console/page errors on ${pageDef.path}`).toEqual([]);
  });
}

test("homepage interactions stay wired", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "networkidle" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.locator("[data-menu-panel].is-open")).toBeVisible();
  await expect(page.getByRole("link", { name: "Repères du site" })).toHaveAttribute("href", "#site-reperes");
  await expect(page.locator("[data-contact-link]").first()).toHaveAttribute("href", /^mailto:/);

  const categoriesToggle = page.locator("[data-home-categories-toggle]");
  await categoriesToggle.click();
  await expect(page.locator("#home-hero-categories")).toBeVisible();
  await expect(page.locator("#home-hero-categories .home-category-pill").first()).toBeVisible();

  await expect(page.locator(".home-bottom-link[href='contribuer.html']")).toBeVisible();
  await expect(page.locator(".home-bottom-link[href='category.html']")).toBeVisible();
  await expect(page.locator("[data-contact-link]").last()).toHaveAttribute("href", /^mailto:/);
});
