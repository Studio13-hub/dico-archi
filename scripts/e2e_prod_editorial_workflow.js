const { chromium } = require("playwright");

const BASE_URL = process.env.DICO_E2E_BASE_URL || "https://dico-archi.vercel.app";
const APPRENTI_EMAIL = process.env.DICO_E2E_APPRENTI_EMAIL || "";
const FORMATEUR_EMAIL = process.env.DICO_E2E_FORMATEUR_EMAIL || "";
const APPRENTI_PASSWORD = process.env.DICO_E2E_APPRENTI_PASSWORD || process.env.DICO_E2E_PASSWORD || "";
const FORMATEUR_PASSWORD = process.env.DICO_E2E_FORMATEUR_PASSWORD || process.env.DICO_E2E_PASSWORD || "";
const TEST_TERM = `Workflow réel ${new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-")}`;

function requireEnv(name, value) {
  if (!String(value || "").trim()) {
    throw new Error(`Missing required env ${name}`);
  }
}

function validateConfig() {
  requireEnv("DICO_E2E_APPRENTI_EMAIL", APPRENTI_EMAIL);
  requireEnv("DICO_E2E_FORMATEUR_EMAIL", FORMATEUR_EMAIL);
  requireEnv("DICO_E2E_APPRENTI_PASSWORD or DICO_E2E_PASSWORD", APPRENTI_PASSWORD);
  requireEnv("DICO_E2E_FORMATEUR_PASSWORD or DICO_E2E_PASSWORD", FORMATEUR_PASSWORD);
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/auth.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#auth-form");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("#login");

  const loginResult = await page.evaluate(async () => {
    const start = Date.now();
    while (Date.now() - start < 20000) {
      if (/compte\.html(?:$|\?)/.test(window.location.href)) {
        return { ok: true, href: window.location.href };
      }

      const message = document.querySelector("#auth-message")?.textContent?.trim() || "";
      if (
        message
        && !message.includes("Connexion en cours")
        && !message.includes("Connecté avec succès")
      ) {
        return { ok: false, message };
      }

      await new Promise((resolve) => window.setTimeout(resolve, 150));
    }

    return {
      ok: false,
      message: document.querySelector("#auth-message")?.textContent?.trim() || "login_timeout",
      href: window.location.href
    };
  });

  if (!loginResult?.ok) {
    throw new Error(`Login failed for ${email}: ${loginResult?.message || "unknown_error"}`);
  }

  await page.waitForURL(/compte\.html/, { timeout: 5000 });
  await page.waitForSelector("#account-email");
}

async function ensureText(locator, expected) {
  const text = await locator.textContent();
  if (!String(text || "").includes(expected)) {
    throw new Error(`Expected text to include "${expected}" but got "${text}"`);
  }
}

async function logout(page) {
  const logoutButton = page.locator("button:has-text('Se déconnecter')").last();
  if (await logoutButton.count()) {
    await logoutButton.click();
    await page.waitForLoadState("networkidle");
  }
}

async function apprenticeSubmit(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, APPRENTI_EMAIL, APPRENTI_PASSWORD);
  await page.goto(`${BASE_URL}/contribuer.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#contrib-form");

  await page.fill("#term", TEST_TERM);
  await page.selectOption("#category", { label: "Matériaux" });
  await page.fill("#definition", "Terme de workflow réel pour valider le parcours éditorial complet entre apprenti et formateur.");
  await page.fill("#example", "Ce terme de test sert à vérifier le dépôt, la relecture, la correction puis la resoumission.");
  await page.fill("#rich-explanation", "La fiche sert de témoin de recette pour la présentation du projet au bureau.");
  await page.fill("#rich-applications", "démonstration interne\nvalidation du workflow");
  await page.fill("#rich-drawing-note", "Lecture de contrôle pour vérifier le cycle de relecture.");

  await page.click("#submit");
  await page.waitForTimeout(2500);

  await page.goto(`${BASE_URL}/compte.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#account-submissions-list");
  await ensureText(page.locator("#account-submissions-list"), TEST_TERM);
  const submissions = await page.evaluate(async () => {
    const user = await window.DicoArchiSupabase.getCurrentUser();
    return await window.DicoArchiApi.fetchMySubmissions(user.id);
  });
  const target = Array.isArray(submissions)
    ? submissions.find((item) => item.term === TEST_TERM)
    : null;

  await context.close();
  return target?.id || null;
}

async function formateurReview(browser, submissionId) {
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await login(page, FORMATEUR_EMAIL, FORMATEUR_PASSWORD);
  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#submissions");

  const targetRow = page.locator("#submissions .admin__row").filter({ hasText: TEST_TERM }).first();
  await targetRow.getByRole("button", { name: "Ouvrir" }).click();

  await page.fill("#reviewer-comment", "Bonne base. Merci de rendre l’exemple plus concret, de mieux expliciter l’usage métier et de clarifier la note de lecture.");
  await page.getByRole("tab", { name: "Vue d’ensemble" }).click();

  const refreshedRow = page.locator("#submissions .admin__row").filter({ hasText: TEST_TERM }).first();
  await refreshedRow.getByRole("button", { name: "Refuser" }).click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE_URL}/admin.html?section=submission&submission=${submissionId}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#submission-message-body");
  await page.waitForFunction(() => {
    const termNode = document.querySelector("#submission-dossier-term");
    const sendButton = document.querySelector("#submission-send-message");
    return Boolean(
      termNode
      && termNode.textContent
      && termNode.textContent.trim() !== "-"
      && sendButton
      && !sendButton.disabled
    );
  }, { timeout: 20000 });
  await page.fill("#submission-message-body", "Peux-tu reprendre la proposition avec un exemple de bureau plus précis, une explication plus pédagogique et une formulation plus directe pour un apprenti ?");
  await page.click("#submission-send-message");
  await page.waitForFunction(() => {
    const adminMessage = document.querySelector("#admin-message");
    return Boolean(adminMessage && adminMessage.textContent && adminMessage.textContent.includes("message envoyé au contributeur"));
  }, { timeout: 20000 });

  await context.close();
  return submissionId;
}

async function apprenticeResubmit(browser, submissionId) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, APPRENTI_EMAIL, APPRENTI_PASSWORD);
  await page.goto(`${BASE_URL}/compte.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#account-inbox-list");
  await ensureText(page.locator("#account-inbox-list"), TEST_TERM);
  await ensureText(page.locator("#account-messages-list"), "Peux-tu reprendre la proposition");

  await page.goto(`${BASE_URL}/contribuer.html?submission=${submissionId}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#contrib-form");
  await page.waitForFunction((expectedTerm) => {
    const resume = document.querySelector("#contrib-resume-copy");
    const category = document.querySelector("#category");
    return Boolean(
      resume
      && resume.textContent
      && resume.textContent.includes(expectedTerm)
      && category
      && category.value
    );
  }, TEST_TERM, { timeout: 20000 });

  await page.fill("#example", "En bureau, cette fiche sert de support de recette pour vérifier qu’un apprenti peut déposer puis corriger une proposition après relecture.");
  await page.fill("#rich-explanation", "Après retour formateur, la fiche est clarifiée puis renvoyée en relecture pour validation.");
  await page.fill("#rich-drawing-note", "Lecture revue: terme, usage métier, puis correction demandée avant publication.");
  await page.click("#submit");
  await page.waitForTimeout(2500);

  await page.goto(`${BASE_URL}/compte.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#account-submissions-list");
  await ensureText(page.locator("#account-submissions-list"), TEST_TERM);
  await ensureText(page.locator("#account-submissions-list"), "Resoumise");

  await context.close();
}

async function formateurVerifyResubmission(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page, FORMATEUR_EMAIL, FORMATEUR_PASSWORD);
  await page.goto(`${BASE_URL}/admin.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#submissions");

  const targetRow = page.locator("#submissions .admin__row").filter({ hasText: TEST_TERM }).first();
  await ensureText(targetRow, "Retour apprenti");
  await ensureText(targetRow, "Resoumise");

  await context.close();
}

async function main() {
  validateConfig();
  const browser = await chromium.launch({ headless: true });
  try {
    const submissionId = await apprenticeSubmit(browser);
    if (!submissionId) {
      throw new Error("Unable to extract submission id from apprentice account view.");
    }

    await formateurReview(browser, submissionId);
    await apprenticeResubmit(browser, submissionId);
    await formateurVerifyResubmission(browser);

    console.log(JSON.stringify({
      ok: true,
      term: TEST_TERM,
      submissionId
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
