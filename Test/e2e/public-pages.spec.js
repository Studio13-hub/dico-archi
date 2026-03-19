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

async function mockLocalTermApi(page, slug = "bois-lamelle-colle") {
  await page.route(`**/api/terms?slug=${slug}`, async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ error: "term_not_imported_yet" })
    });
  });
}

async function gotoRenderedTerm(page, path = "/term.html?slug=bois-lamelle-colle") {
  await page.goto(path, { waitUntil: "load" });
  await expect(page.locator("body[data-term-ready='ready']")).toBeVisible();
  await expect(page.locator("#term-title")).not.toHaveText("TERME");
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
    selectors: ["h1", ".panel--dictionary", "#terms-list"]
  },
  {
    path: "/category.html",
    title: "Catégorie - Dico-Archi",
    selectors: ["#category-title", ".panel--category", "#category-cards"]
  },
  {
    path: "/term.html",
    title: "Fiche terme - Dico-Archi",
    selectors: ["#term-title", ".panel--term", "#term-definition"]
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
    selectors: [".account", "#account-email", "#account-focus-title", "#account-login-link"]
  },
  {
    path: "/contribuer.html",
    title: "Contribuer - Dico-Archi",
    selectors: ["#contrib-form", "#contrib-basics", "#term", "#submit"]
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

    await page.goto(pageDef.path, { waitUntil: "load" });
    await expect(page).toHaveTitle(pageDef.title);

    for (const selector of pageDef.selectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    expect(consoleErrors, `Console/page errors on ${pageDef.path}`).toEqual([]);
  });

  test(`public visual capture ${pageDef.path}`, async ({ page }, testInfo) => {
    await page.goto(pageDef.path, { waitUntil: "load" });
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

    await page.goto(pageDef.path, { waitUntil: "load" });
    await expect(page).toHaveTitle(pageDef.title);

    for (const selector of pageDef.selectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    expect(consoleErrors, `Console/page errors on ${pageDef.path}`).toEqual([]);
  });
}

test("homepage interactions stay wired", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "load" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await expect(page.locator("[data-menu-panel].is-open")).toBeVisible();
  await expect(page.getByRole("link", { name: "Repères du site" })).toHaveAttribute("href", "#site-reperes");
  await expect(page.locator("[data-contact-link]").first()).toHaveAttribute("href", /^mailto:/);

  const categoriesToggle = page.locator("[data-home-categories-toggle]");
  await categoriesToggle.click();
  await expect(page.locator("#home-hero-categories")).toBeVisible();
  await expect
    .poll(async () => page.locator("#home-hero-categories .home-category-pill").count(), {
      timeout: 10000
    })
    .toBeGreaterThan(0);
  await expect(page.locator("#home-hero-categories .home-category-pill").first()).toBeVisible();

  await expect(page.locator(".home-bottom-link[href='contribuer.html']")).toBeVisible();
  await expect(page.locator(".home-bottom-link[href='category.html']")).toBeVisible();
  await expect(page.locator("[data-contact-link]").last()).toHaveAttribute("href", /^mailto:/);
});

test("rich material term renders from local v2 content", async ({ page }) => {
  const consoleErrors = [];
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (isIgnorableConsoleError(text)) return;
    if (text.includes("Failed to load resource") && text.includes("404 (Not Found)")) return;
    consoleErrors.push(text);
  });

  await mockLocalTermApi(page);
  await gotoRenderedTerm(page);

  await expect(page).toHaveTitle("Bois lamellé-collé - Dico-Archi");
  await expect(page.locator("#term-title")).toHaveText("Bois lamellé-collé");
  await expect(page.locator("#term-profile-label")).toHaveText("Fiche matériau");
  await expect(page.locator("#term-orientation-block")).toBeVisible();
  await expect(page.locator("#term-orientation-uses")).toContainText("poutres");
  await expect(page.locator("#term-orientation-contrast")).toContainText("CLT");
  await expect(page.locator("#term-next-category-link")).toHaveAttribute("href", /category\.html\?slug=materiaux/);
  await expect(page.locator("#term-detail-tabs")).toBeVisible();
  await expect(page.locator("#term-detail-sections")).toContainText("Identification");
  await page.getByRole("button", { name: "Propriétés" }).click();
  await expect(page.locator("#term-detail-sections")).toContainText("bonne résistance mécanique");
  await page.getByRole("button", { name: "Vigilance" }).click();
  await expect(page.locator("#term-detail-sections")).toContainText("protection durable indispensable");

  expect(consoleErrors, "Console/page errors on rich material term page").toEqual([]);
});

test("rich material term stays readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await mockLocalTermApi(page);
  await gotoRenderedTerm(page);

  await expect(page.locator("#term-title")).toHaveText("Bois lamellé-collé");
  await expect(page.locator("#term-quicklinks")).toBeVisible();
  await expect(page.locator("#term-details-block")).toBeVisible();
  await expect(page.locator("#term-visual-block")).toBeVisible();
  await expect(page.locator("#term-detail-tabs")).toBeVisible();

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(390);
});

test("desktop menu toggle stays visible on key pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const path of ["/index.html", "/dictionnaire.html", "/category.html?slug=materiaux"]) {
    await page.goto(path, { waitUntil: "load" });
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toBeVisible();
  }

  await mockLocalTermApi(page);
  await gotoRenderedTerm(page);
  await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toBeVisible();
});

test("quick access appears on core pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/dictionnaire.html", { waitUntil: "load" });
  await expect(page.locator("[data-page-quicklinks]")).toBeVisible();
  await expect(page.locator("[data-page-quicklinks]")).toContainText("Accueil");
  await expect(page.locator("[data-page-quicklinks]")).toContainText("Dictionnaire");

  await page.goto("/category.html?slug=materiaux", { waitUntil: "load" });
  await expect(page.locator("[data-page-quicklinks]")).toBeVisible();
  await expect(page.locator("[data-page-quicklinks]")).toContainText("Matériaux");

  await mockLocalTermApi(page);
  await gotoRenderedTerm(page);
  await expect(page.locator("#term-quicklinks")).toBeVisible();
  await expect(page.locator("#term-quicklinks")).toContainText("Accueil");
  await expect(page.locator("#term-quicklinks")).toContainText("Matériaux");
});

test("auth form submits on Enter from password field", async ({ page }) => {
  await page.goto("/auth.html", { waitUntil: "load" });

  await page.evaluate(() => {
    window.__authSubmitCount = 0;
    const form = document.getElementById("auth-form");
    form?.addEventListener("submit", () => {
      window.__authSubmitCount += 1;
    });
  });

  await page.locator("#email").fill("test@example.com");
  await page.locator("#password").fill("secret123");
  await page.locator("#password").press("Enter");

  await expect.poll(async () => page.evaluate(() => window.__authSubmitCount)).toBeGreaterThan(0);
});

test("term page exposes allophone assist and renders translation", async ({ page }) => {
  await mockLocalTermApi(page);

  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({
        translation: {
          language: "en",
          languageLabel: "Anglais",
          translatedTerm: "Glulam",
          translatedDefinition: "Engineered timber made from glued wood lamellas.",
          translatedExample: "Glulam is used for long-span roof structures.",
          pronunciationGuide: "bwah la-may-lay koh-lay"
        }
      })
    });
  });

  await gotoRenderedTerm(page);

  await expect(page.locator("#term-assist-block")).toBeVisible();
  await expect(page.locator("#term-pronounce-button")).toBeVisible();
  await page.locator("#term-translation-language").selectOption("en");
  await page.locator("#term-translate-button").click();
  await expect(page.locator("#term-translation-output")).toBeVisible();
  await expect(page.locator("#term-translation-term")).toHaveText("Glulam");
  await expect(page.locator("#term-translation-definition")).toContainText("Engineered timber");
  await expect(page.locator("#term-pronounce-translation-button")).toBeVisible();
  await expect(page.locator("#term-pronunciation-guide")).toContainText("bwah la-may-lay koh-lay");
});
