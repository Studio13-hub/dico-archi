(function initAccountPage() {
  const accountMessage = document.getElementById("account-message");
  const accountEmail = document.getElementById("account-email");
  const accountRole = document.getElementById("account-role");
  const accountActive = document.getElementById("account-active");
  const accountLoginLink = document.getElementById("account-login-link");
  const accountContribLink = document.getElementById("account-contrib-link");
  const accountGamesLink = document.getElementById("account-games-link");
  const accountAdminLink = document.getElementById("account-admin-link");
  const accountLogout = document.getElementById("account-logout");
  const accountAccessLabel = document.getElementById("account-access-label");
  const accountAccessCopy = document.getElementById("account-access-copy");
  const accountNextStepTitle = document.getElementById("account-next-step-title");
  const accountNextStepCopy = document.getElementById("account-next-step-copy");
  const accountFocusTitle = document.getElementById("account-focus-title");
  const accountFocusAction = document.getElementById("account-focus-action");
  const accountFocusCopy = document.getElementById("account-focus-copy");
  const accountFocusDestination = document.getElementById("account-focus-destination");
  const accountFocusDestinationCopy = document.getElementById("account-focus-destination-copy");
  const accountFocusNote = document.getElementById("account-focus-note");
  const accountFocusNoteCopy = document.getElementById("account-focus-note-copy");
  const accountSubmissionCount = document.getElementById("account-submission-count");
  const accountSubmissionCopy = document.getElementById("account-submission-copy");
  const accountSubmissionsPanel = document.getElementById("account-submissions-panel");
  const accountSubmissionsEmpty = document.getElementById("account-submissions-empty");
  const accountSubmissionsList = document.getElementById("account-submissions-list");
  const accountMessagesEmpty = document.getElementById("account-messages-empty");
  const accountMessagesList = document.getElementById("account-messages-list");
  const accountReplySubmission = document.getElementById("account-reply-submission");
  const accountReplyBody = document.getElementById("account-reply-body");
  const accountSendReply = document.getElementById("account-send-reply");
  const accountResubmit = document.getElementById("account-resubmit");
  const accountInboxCount = document.getElementById("account-inbox-count");
  const accountInboxEmpty = document.getElementById("account-inbox-empty");
  const accountInboxList = document.getElementById("account-inbox-list");
  const accountInboxFilters = Array.from(document.querySelectorAll("[data-inbox-filter]"));
  const accountSupabaseHelpers = window.DicoArchiSupabase;
  let inboxItems = [];
  let currentInboxFilter = "all";
  let currentUserId = "";
  let currentSubmissions = [];

  function bindButtonLikeLinkKeyboard(root = document) {
    const links = root.querySelectorAll(".auth__actions a.link-button");
    for (const link of links) {
      if (link.dataset.keyboardBound === "true") continue;
      link.dataset.keyboardBound = "true";
      link.addEventListener("keydown", (event) => {
        if (event.key !== " " && event.key !== "Spacebar") return;
        event.preventDefault();
        link.click();
      });
    }
  }

  function setMessage(text, isError = false) {
    if (!accountMessage) return;
    accountMessage.textContent = text;
    accountMessage.style.color = isError ? "#d94e2b" : "#1f7a70";
  }

  function setAccountAdminVisibility(visible) {
    if (!accountAdminLink) return;
    accountAdminLink.hidden = !visible;
    accountAdminLink.style.display = visible ? "" : "none";
    accountAdminLink.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function normalizeProfile(profile) {
    return accountSupabaseHelpers?.normalizeProfile(profile) || { role: "apprenti", active: true };
  }

  function roleLabel(role) {
    return accountSupabaseHelpers?.getRoleLabel(role) || "Apprenti";
  }

  function getSubmissionLabel(status) {
    if (status === "accepted") return "Acceptée";
    if (status === "rejected") return "Refusée";
    if (status === "resubmitted") return "Resoumise";
    if (status === "validated") return "À relire";
    if (status === "submitted") return "Envoyée";
    return "Brouillon";
  }

  function getNotificationLabel(kind) {
    if (kind === "submission_accepted") return "Acceptée";
    if (kind === "submission_rejected") return "Refusée";
    if (kind === "submission_feedback") return "À corriger";
    if (kind === "role_updated") return "Rôle";
    return "Info";
  }

  function getNotificationSeverityLabel(severity) {
    if (severity === "success") return "Validation";
    if (severity === "warning") return "Relecture";
    if (severity === "danger") return "Refus";
    return "Information";
  }

  function filterNotifications(items) {
    if (currentInboxFilter === "unread") return items.filter((item) => !item.read_at);
    if (currentInboxFilter === "decisions") {
      return items.filter((item) => ["submission_accepted", "submission_rejected", "submission_feedback"].includes(item.kind));
    }
    if (currentInboxFilter === "account") {
      return items.filter((item) => item.kind === "role_updated");
    }
    return items;
  }

  function syncInboxFilterButtons() {
    for (const button of accountInboxFilters) {
      const active = button.dataset.inboxFilter === currentInboxFilter;
      button.classList.toggle("chip--active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function formatNotificationDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("fr-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function setFocusPanel({ title, action, copy, destination, destinationCopy, note, noteCopy }) {
    if (accountFocusTitle) accountFocusTitle.textContent = title;
    if (accountFocusAction) accountFocusAction.textContent = action;
    if (accountFocusCopy) accountFocusCopy.textContent = copy;
    if (accountFocusDestination) accountFocusDestination.textContent = destination;
    if (accountFocusDestinationCopy) accountFocusDestinationCopy.textContent = destinationCopy;
    if (accountFocusNote) accountFocusNote.textContent = note;
    if (accountFocusNoteCopy) accountFocusNoteCopy.textContent = noteCopy;
  }

  function renderSubmissions(items, isGuest = false) {
    if (!accountSubmissionsPanel || !accountSubmissionsEmpty || !accountSubmissionsList) return;

    accountSubmissionsList.innerHTML = "";

    if (isGuest) {
      accountSubmissionsEmpty.style.display = "block";
      accountSubmissionsEmpty.textContent =
        "Connectez-vous pour suivre vos propositions et leur état de validation.";
      return;
    }

    if (!items.length) {
      accountSubmissionsEmpty.style.display = "block";
      accountSubmissionsEmpty.textContent = "Aucune proposition enregistrée pour l’instant.";
      return;
    }

    accountSubmissionsEmpty.style.display = "none";

    for (const item of items.slice(0, 5)) {
      const row = document.createElement("div");
      row.className = "admin__row";

      const title = document.createElement("div");
      title.className = "admin__row-title";
      title.textContent = item.term || "Proposition";

      const info = document.createElement("div");
      info.className = "admin__row-info";
      info.textContent = `${item.category || "Sans catégorie"} · ${getSubmissionLabel(item.status)}`;

      const meta = document.createElement("div");
      meta.className = "admin__row-meta";
      const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString("fr-CH") : "-";
      const reviewerComment = item.reviewer_comment ? ` · Note : ${item.reviewer_comment}` : "";
      const mediaCount = Array.isArray(item.media_urls) ? item.media_urls.length : 0;
      const mediaLabel = mediaCount ? ` · ${mediaCount} média proposé${mediaCount > 1 ? "s" : ""}` : "";
      meta.textContent = `Envoyée le ${createdAt}${mediaLabel}${reviewerComment}`;

      row.appendChild(title);
      row.appendChild(info);
      row.appendChild(meta);
      if (item.status === "rejected" || item.status === "resubmitted") {
        const actions = document.createElement("div");
        actions.className = "admin__row-actions";

        const openLink = document.createElement("a");
        openLink.className = "link-button";
        openLink.href = `contribuer.html?submission=${encodeURIComponent(item.id)}`;
        openLink.textContent = item.status === "rejected" ? "Corriger dans Contribuer" : "Voir la correction";
        actions.appendChild(openLink);
        row.appendChild(actions);
      }
      accountSubmissionsList.appendChild(row);
    }
  }

  function renderEditorialMessages(items, isGuest = false) {
    if (!accountMessagesEmpty || !accountMessagesList) return;
    accountMessagesList.innerHTML = "";

    if (isGuest) {
      accountMessagesEmpty.style.display = "block";
      accountMessagesEmpty.textContent = "Connectez-vous pour voir les échanges de relecture.";
      return;
    }

    if (!items.length) {
      accountMessagesEmpty.style.display = "block";
      accountMessagesEmpty.textContent = "Aucun échange éditorial pour l’instant.";
      return;
    }

    accountMessagesEmpty.style.display = "none";

    for (const item of items.slice(0, 12)) {
      const row = document.createElement("article");
      row.className = "account-inbox__item";

      const top = document.createElement("div");
      top.className = "account-inbox__top";

      const title = document.createElement("strong");
      title.textContent = item.submission?.term || "Proposition";

      const state = document.createElement("span");
      state.className = "account-inbox__state";
      state.textContent = item.author?.display_name || item.author?.email || "Équipe éditoriale";

      top.appendChild(title);
      top.appendChild(state);

      const meta = document.createElement("div");
      meta.className = "account-inbox__meta";
      meta.textContent = `${formatNotificationDate(item.created_at)} · ${item.submission?.status || "suivi"}`;

      const body = document.createElement("p");
      body.className = "account-inbox__body";
      body.textContent = item.body || "";

      row.appendChild(top);
      row.appendChild(meta);
      row.appendChild(body);
      accountMessagesList.appendChild(row);
    }
  }

  function renderReplyTargets(items, isGuest = false) {
    if (!accountReplySubmission || !accountSendReply || !accountResubmit) return;
    accountReplySubmission.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir une proposition refusée / à corriger";
    accountReplySubmission.appendChild(placeholder);

    if (isGuest) {
      accountReplySubmission.disabled = true;
      accountSendReply.disabled = true;
      accountResubmit.disabled = true;
      return;
    }

    const replyable = items.filter((item) => item.status === "rejected");
    for (const item of replyable) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.term || "Proposition"} · ${getSubmissionLabel(item.status)}`;
      accountReplySubmission.appendChild(option);
    }

    const disabled = replyable.length === 0;
    accountReplySubmission.disabled = disabled;
    accountSendReply.disabled = disabled;
    accountResubmit.disabled = disabled;
  }

  async function sendReply({ resubmit = false } = {}) {
    const submissionId = accountReplySubmission?.value || "";
    const body = accountReplyBody?.value.trim() || "";
    if (!submissionId) {
      setMessage("Choisissez d’abord une proposition à corriger.", true);
      return;
    }
    if (!body) {
      setMessage("Écrivez un message avant l’envoi.", true);
      return;
    }
    if (!currentUserId) {
      setMessage("Session utilisateur manquante.", true);
      return;
    }

    const submission = currentSubmissions.find((item) => item.id === submissionId);
    if (!submission) {
      setMessage("Proposition introuvable dans votre suivi.", true);
      return;
    }

    const button = resubmit ? accountResubmit : accountSendReply;
    button.disabled = true;
    const idleLabel = button.textContent;
    button.textContent = resubmit ? "Resoumission..." : "Envoi...";

    try {
      await window.DicoArchiApi.createSubmissionMessage({
        submission_id: submissionId,
        author_id: currentUserId,
        audience: "submitter",
        body
      });

      if (resubmit) {
        await window.DicoArchiApi.updateOwnSubmission(submissionId, {
          status: "resubmitted",
          reviewer_comment: null
        });
      }

      accountReplyBody.value = "";
      setMessage(resubmit ? "Réponse envoyée et proposition remise en relecture." : "Réponse envoyée à l’équipe éditoriale.");
      loadAccount();
    } catch (error) {
      setMessage(`Réponse : ${error.message || error}`, true);
    } finally {
      button.disabled = false;
      button.textContent = idleLabel;
    }
  }

  async function markNotificationRead(notificationId, row) {
    if (!notificationId || !window.DicoArchiApi?.markNotificationRead) return;
    try {
      await window.DicoArchiApi.markNotificationRead(notificationId);
      if (row) row.classList.remove("account-inbox__item--unread");
      const pill = row?.querySelector("[data-notification-state]");
      if (pill) pill.textContent = "Lu";
      inboxItems = inboxItems.map((item) => (
        item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
      ));
      const unreadRows = accountInboxList
        ? accountInboxList.querySelectorAll(".account-inbox__item--unread").length
        : 0;
      if (accountInboxCount) {
        accountInboxCount.textContent = unreadRows > 0 ? `${unreadRows} non lu${unreadRows > 1 ? "s" : ""}` : "Tout lu";
      }
    } catch (_error) {
      setMessage("Boîte de réception : impossible de marquer ce message comme lu.", true);
    }
  }

  function renderNotifications(items, isGuest = false) {
    if (!accountInboxEmpty || !accountInboxList || !accountInboxCount) return;

    inboxItems = Array.isArray(items) ? items.slice() : [];
    accountInboxList.innerHTML = "";
    syncInboxFilterButtons();

    if (isGuest) {
      accountInboxEmpty.style.display = "block";
      accountInboxEmpty.textContent =
        "Connectez-vous pour consulter les retours de validation et les messages du workflow éditorial.";
      accountInboxCount.textContent = "0 non lu";
      if (accountInboxFilters.length) {
        for (const button of accountInboxFilters) button.disabled = true;
      }
      return;
    }

    if (accountInboxFilters.length) {
      for (const button of accountInboxFilters) button.disabled = false;
    }

    const filteredItems = filterNotifications(inboxItems);

    if (!filteredItems.length) {
      accountInboxEmpty.style.display = "block";
      accountInboxEmpty.textContent = inboxItems.length
        ? "Aucun message dans ce filtre."
        : "Aucun message pour l’instant.";
      accountInboxCount.textContent = inboxItems.some((item) => !item.read_at) ? "Filtrer les non lus" : "Tout lu";
      return;
    }

    accountInboxEmpty.style.display = "none";
    const unreadCount = inboxItems.filter((item) => !item.read_at).length;
    accountInboxCount.textContent = unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : "Tout lu";

    for (const item of filteredItems) {
      const row = document.createElement("article");
      row.className = "account-inbox__item";
      if (!item.read_at) row.classList.add("account-inbox__item--unread");
      row.classList.add(`account-inbox__item--${item.severity || "info"}`);

      const top = document.createElement("div");
      top.className = "account-inbox__top";

      const title = document.createElement("strong");
      title.textContent = item.title || "Notification";

      const state = document.createElement("span");
      state.className = "account-inbox__state";
      state.dataset.notificationState = "true";
      state.textContent = item.read_at ? "Lu" : "Nouveau";

      top.appendChild(title);
      top.appendChild(state);

      const meta = document.createElement("div");
      meta.className = "account-inbox__meta";
      const actorLabel = item.actor_label ? ` · par ${item.actor_label}` : "";
      meta.textContent = `${getNotificationLabel(item.kind)} · ${formatNotificationDate(item.created_at)}${actorLabel}`;

      const badges = document.createElement("div");
      badges.className = "account-inbox__badges";

      const typeBadge = document.createElement("span");
      typeBadge.className = "account-inbox__badge";
      typeBadge.textContent = getNotificationSeverityLabel(item.severity);
      badges.appendChild(typeBadge);

      if (item.metadata?.term) {
        const termBadge = document.createElement("span");
        termBadge.className = "account-inbox__badge";
        termBadge.textContent = item.metadata.term;
        badges.appendChild(termBadge);
      }

      if (item.metadata?.next_role) {
        const roleBadge = document.createElement("span");
        roleBadge.className = "account-inbox__badge";
        roleBadge.textContent = `Rôle: ${item.metadata.next_role}`;
        badges.appendChild(roleBadge);
      }

      const body = document.createElement("p");
      body.className = "account-inbox__body";
      body.textContent = item.body || "";

      row.appendChild(top);
      row.appendChild(meta);
      row.appendChild(badges);
      row.appendChild(body);

      if (item.metadata?.reviewer_comment) {
        const reviewNote = document.createElement("div");
        reviewNote.className = "account-inbox__note";
        reviewNote.textContent = `Commentaire: ${item.metadata.reviewer_comment}`;
        row.appendChild(reviewNote);
      }

      if (item.metadata?.category || item.metadata?.previous_role || item.metadata?.previous_active !== undefined) {
        const detail = document.createElement("div");
        detail.className = "account-inbox__detail";
        const detailParts = [];
        if (item.metadata?.category) detailParts.push(`Catégorie: ${item.metadata.category}`);
        if (item.metadata?.previous_role && item.metadata?.next_role) {
          detailParts.push(`Accès: ${item.metadata.previous_role} -> ${item.metadata.next_role}`);
        }
        if (item.metadata?.previous_active !== undefined && item.metadata?.next_active !== undefined) {
          detailParts.push(`État: ${item.metadata.previous_active ? "actif" : "inactif"} -> ${item.metadata.next_active ? "actif" : "inactif"}`);
        }
        detail.textContent = detailParts.join(" · ");
        row.appendChild(detail);
      }

      if (!item.read_at) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ghost";
        button.textContent = "Marquer comme lu";
        button.addEventListener("click", () => markNotificationRead(item.id, row));
        row.appendChild(button);
      }

      accountInboxList.appendChild(row);
    }
  }

  function renderGuestState() {
    if (accountEmail) accountEmail.textContent = "-";
    if (accountRole) accountRole.textContent = "Public";
    if (accountActive) accountActive.textContent = "Consultation";
    if (accountAccessLabel) accountAccessLabel.textContent = "Consultation publique";
    if (accountAccessCopy) {
      accountAccessCopy.textContent =
        "Lecture libre du dictionnaire, des catégories, des fiches et des jeux pédagogiques.";
    }
    if (accountNextStepTitle) accountNextStepTitle.textContent = "Se connecter";
    if (accountNextStepCopy) {
      accountNextStepCopy.textContent =
        "Connectez-vous pour être orienté vers le bon espace: suivi du compte, dépôt ou validation selon votre rôle.";
      }
    if (accountSubmissionCount) accountSubmissionCount.textContent = "0";
    if (accountSubmissionCopy) accountSubmissionCopy.textContent = "Aucun suivi disponible sans session ouverte.";
    setFocusPanel({
      title: "Commencer par se connecter",
      action: "Ouvrir la connexion",
      copy: "Sans session, cette page reste un point d’orientation public.",
      destination: "Authentification",
      destinationCopy: "Connecte-toi pour voir ton niveau d’accès réel.",
      note: "Mon compte oriente",
      noteCopy: "Le dépôt reste dans Contribuer, la validation reste dans Administration."
    });
    if (accountLoginLink) {
      accountLoginLink.hidden = false;
      accountLoginLink.textContent = "Se connecter";
      accountLoginLink.href = "auth.html";
    }
    if (accountContribLink) accountContribLink.hidden = false;
    if (accountGamesLink) accountGamesLink.hidden = false;
    setAccountAdminVisibility(false);
    if (accountLogout) accountLogout.hidden = true;
    renderSubmissions([], true);
    renderEditorialMessages([], true);
    renderReplyTargets([], true);
    renderNotifications([], true);
    bindButtonLikeLinkKeyboard();
    setMessage("Tu es en mode Public: consultation libre des définitions.");
  }

  async function loadAccount() {
    if (!accountSupabaseHelpers || !accountSupabaseHelpers.hasConfig()) {
      setMessage("Configuration Supabase manquante.", true);
      return;
    }

    setMessage("Chargement du compte...");
    const client = accountSupabaseHelpers.getClient();
    await accountSupabaseHelpers.waitForInitialSession?.();
    const user = await accountSupabaseHelpers.getCurrentUser();
    if (!user) {
      renderGuestState();
      return;
    }

    const normalized = normalizeProfile(await accountSupabaseHelpers.getProfile(user.id));
    currentUserId = user.id;
    const isStaff = accountSupabaseHelpers.isStaffProfile(normalized);
    const submissions = await window.DicoArchiApi.fetchMySubmissions(user.id).catch(() => []);
    currentSubmissions = submissions.slice();
    const editorialMessages = await window.DicoArchiApi.fetchSubmissionMessagesForUser(user.id).catch(() => []);
    const notifications = await window.DicoArchiApi.fetchMyNotifications(user.id).catch(() => []);

    if (accountEmail) accountEmail.textContent = user.email || "-";
    if (accountRole) accountRole.textContent = roleLabel(normalized.role);
    if (accountActive) accountActive.textContent = normalized.active ? "Actif" : "Inactif";
    if (accountSubmissionCount) accountSubmissionCount.textContent = String(submissions.length);
    if (accountLoginLink) {
      accountLoginLink.hidden = false;
      accountLoginLink.textContent = "Changer de compte";
      accountLoginLink.href = "auth.html";
    }
    if (accountContribLink) accountContribLink.hidden = false;
    if (accountGamesLink) accountGamesLink.hidden = false;
    setAccountAdminVisibility(isStaff);
    if (accountLogout) accountLogout.hidden = false;

    if (normalized.role === "super_admin") {
      setFocusPanel({
        title: "Piloter la plateforme",
        action: "Ouvrir l’administration",
        copy: "Le rôle Administration doit aller directement au pilotage du corpus, des comptes et du suivi.",
        destination: "Administration",
        destinationCopy: "Validation, rôles, structure du corpus et supervision globale.",
        note: "Mon compte sert de synthèse",
        noteCopy: "Tes dépôts personnels restent visibles ici, mais ce n’est pas ton espace principal d’action."
      });
      if (accountAccessLabel) accountAccessLabel.textContent = "Pilotage complet";
      if (accountAccessCopy) {
        accountAccessCopy.textContent =
          "Gestion des contenus, des utilisateurs, des validations, des accès et des zones sensibles.";
      }
      if (accountNextStepTitle) accountNextStepTitle.textContent = "Ouvrir l’admin";
      if (accountNextStepCopy) {
        accountNextStepCopy.textContent =
          "Passez par Administration pour le pilotage: validation, rôles, structure du corpus et supervision globale.";
      }
      if (accountSubmissionCopy) {
        accountSubmissionCopy.textContent =
          "Vos propositions personnelles restent visibles ici, mais votre rôle principal est le pilotage.";
      }
      if (accountInboxCount && !notifications.length) accountInboxCount.textContent = "Pilotage";
      if (accountContribLink) accountContribLink.textContent = "Ouvrir Contribuer";
    } else if (normalized.role === "formateur") {
      setFocusPanel({
        title: "Relire puis guider",
        action: "Passer en relecture",
        copy: "Le rôle Formateur doit surtout revenir aux propositions à corriger ou à valider.",
        destination: "Administration",
        destinationCopy: "Relecture, commentaires éditoriaux et validation sans repasser par le dépôt.",
        note: "Mon compte reste le tableau de bord",
        noteCopy: "Ici tu lis la synthèse; l’action métier se fait ensuite dans Administration."
      });
      if (accountAccessLabel) accountAccessLabel.textContent = "Relecture éditoriale";
      if (accountAccessCopy) {
        accountAccessCopy.textContent =
          "Correction, validation et relecture des contenus en attente avant publication, sans mélanger cela avec le dépôt.";
      }
      if (accountNextStepTitle) accountNextStepTitle.textContent = "Relire ou corriger";
      if (accountNextStepCopy) {
        accountNextStepCopy.textContent =
          "Passez par Administration pour relire les propositions, corriger le contenu et valider sans repasser par la page de dépôt.";
      }
      if (accountSubmissionCopy) {
        accountSubmissionCopy.textContent = submissions.length
          ? `${submissions.length} proposition(s) personnelle(s) enregistrée(s).`
          : "Aucune proposition personnelle enregistrée pour l’instant.";
      }
      if (accountInboxCount && !notifications.length) accountInboxCount.textContent = "Retour éditorial";
      if (accountContribLink) accountContribLink.textContent = "Déposer si besoin";
    } else {
      setFocusPanel({
        title: submissions.length ? "Suivre ou corriger une proposition" : "Déposer une première proposition",
        action: submissions.some((item) => item.status === "rejected") ? "Reprendre une correction" : "Ouvrir Contribuer",
        copy: submissions.some((item) => item.status === "rejected")
          ? "Au moins une proposition attend une correction avant nouvelle relecture."
          : "Le rôle Apprenti dépose dans Contribuer puis revient ici pour suivre les retours.",
        destination: submissions.some((item) => item.status === "rejected") ? "Contribuer" : "Contribuer",
        destinationCopy: submissions.some((item) => item.status === "rejected")
          ? "Rouvre la proposition refusée, corrige puis remets-la en relecture."
          : "Crée la proposition dans la page de dépôt, pas dans Mon compte.",
        note: "Mon compte sert au suivi",
        noteCopy: "Le dépôt et la correction détaillée se font ailleurs; ici tu vérifies l’état et les retours."
      });
      if (accountAccessLabel) accountAccessLabel.textContent = "Contribution encadrée";
      if (accountAccessCopy) {
        accountAccessCopy.textContent =
          "Mon compte sert au suivi. Le dépôt se fait dans Contribuer, puis la validation passe par le formateur.";
      }
      if (accountNextStepTitle) accountNextStepTitle.textContent = "Envoyer une proposition";
      if (accountNextStepCopy) {
        accountNextStepCopy.textContent =
          "Utilisez Contribuer pour déposer. Revenez ici ensuite pour suivre l’état de vos propositions.";
      }
      if (accountSubmissionCopy) {
        accountSubmissionCopy.textContent = submissions.length
          ? `${submissions.length} proposition(s) en suivi sur votre compte.`
          : "Aucune proposition envoyée pour l’instant.";
      }
      if (accountContribLink) accountContribLink.textContent = "Déposer une proposition";
    }

    renderSubmissions(submissions);
    renderEditorialMessages(editorialMessages);
    renderReplyTargets(submissions);
    renderNotifications(notifications);
    bindButtonLikeLinkKeyboard();

    if (normalized.active) {
      setMessage("Compte chargé. Cet espace t’oriente vers le bon niveau d’action selon ton rôle.");
    } else {
      setMessage("Compte inactif. Contactez un super admin.", true);
    }

    if (accountLogout) {
      accountLogout.addEventListener("click", async () => {
        await client.auth.signOut();
        window.location.href = "index.html";
      });
    }

    accountSupabaseHelpers.onAuthStateChange((_event, _session, nextUser) => {
      if (!nextUser) renderGuestState();
    });
  }

  for (const button of accountInboxFilters) {
    button.addEventListener("click", () => {
      currentInboxFilter = button.dataset.inboxFilter || "all";
      renderNotifications(inboxItems);
    });
  }
  if (accountSendReply) {
    accountSendReply.addEventListener("click", () => sendReply({ resubmit: false }));
  }
  if (accountResubmit) {
    accountResubmit.addEventListener("click", () => sendReply({ resubmit: true }));
  }

  loadAccount();
})();
