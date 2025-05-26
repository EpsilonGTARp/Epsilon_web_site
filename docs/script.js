document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("dark-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") enableDarkMode();
  else disableDarkMode();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      body.setAttribute("data-theme", isDark ? "dark" : "light");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      toggle.textContent = isDark ? "☀️" : "🌙";
    });
  }

  function enableDarkMode() {
    body.classList.add("dark-mode");
    body.setAttribute("data-theme", "dark");
    if (toggle) toggle.textContent = "☀️";
  }

  function disableDarkMode() {
    body.classList.remove("dark-mode");
    body.setAttribute("data-theme", "light");
    if (toggle) toggle.textContent = "🌙";
  }

  const pages = [
    { title: "01 | LE REGLEMENT DISCORD", href: "sections/01_reglement_discord.html", css: "sections/01_reglement_discord.css" },
    { title: "02 | LE REGLEMENT GENERAL", href: "sections/02_reglement_general.html", css: "sections/02_reglement_general.css" },
    { title: "03 | LE VOCABULAIRE RP", href: "sections/03_vocabulaire.html", css: "sections/03_vocabulaire.css" },
    { title: "04 | LES STREAMERS", href: "sections/04_les_streamers.html", css: "sections/04_les_streamers.css" },
    { title: "05 | LE LEGAL", href: "sections/05_legal.html", css: "sections/05_legal.css" },
    { title: "06 | L'ILLEGAL", href: "sections/06_illegal.html", css: "sections/06_illegal.css" },
    { title: "01 | INFORMATIONS DOUANES", href: "sections/informations_douanes.html", css: "sections/informations_douanes.css" },
    { title: "02 | ACCEDER AU SERVEUR", href: "sections/acceder_au_serveur.html", css: "sections/acceder_au_serveur.css" },
    { title: "01 | AEROPORT", href: "sections/aeroport.html", css: "sections/aeroport.css" },
    { title: "00 | MES DEBUTS", href: "sections/debuts.html", css: "sections/debuts.css" },
    { title: "01 | LES DROGUES", href: "sections/drogues.html", css: "sections/drogues.css" },
    { title: "02 | LES VOLS DE VEHICULES", href: "sections/vols_vehicules.html", css: "sections/vols_vehicules.css" },
    { title: "03 | LES CAMBRIOLAGES", href: "sections/cambriolages.html", css: "sections/cambriolages.css" },
    { title: "04 | LES BRAQUAGES", href: "sections/braquages.html", css: "sections/braquages.css" },
    { title: "05 | LES GO-FAST", href: "sections/gofast.html", css: "sections/gofast.css" },
    { title: "06 | LES STREET RACES", href: "sections/street_races.html", css: "sections/street_races.css" },
    { title: "Création de mon personnage", href: "sections/personnage.html", css: "sections/personnage.css" }
  ];

  const sidebarInput = document.getElementById("searchInputSidebar");
  const overlay = document.getElementById("searchOverlay");
  const overlayInput = document.getElementById("searchInputOverlay");
  const overlayResults = document.getElementById("searchResultsOverlay");
  const closeBtn = document.getElementById("closeOverlay");
  const mainContent = document.querySelector(".main-content");

  // === Gestion de l’overlay de recherche ===
  if (sidebarInput && overlay && overlayInput && overlayResults) {
    sidebarInput.addEventListener("focus", () => {
      overlay.classList.remove("hidden");
      overlayInput.value = "";
      overlayResults.innerHTML = "";
      overlayInput.focus();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlay.classList.add("hidden");
        overlayInput.blur();
      }
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlayInput.value = "";
        overlayResults.innerHTML = "";
      });
    }

    overlayInput.addEventListener("input", async () => {
      const query = overlayInput.value.trim().toLowerCase();
      overlayResults.innerHTML = '';
      if (query.length < 2) return;

      for (const page of pages) {
        try {
          const response = await fetch(page.href);
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          const bodyText = doc.body.textContent.toLowerCase();

          if (bodyText.includes(query)) {
            const snippet = extractSnippet(doc.body.textContent, query);

            const result = document.createElement("div");
            result.classList.add("search-result-item");

            const link = document.createElement("a");
            link.href = page.href;
            link.textContent = page.title;
            link.classList.add("search-result-title");
            link.addEventListener("click", (e) => {
              e.preventDefault();
              overlay.classList.add("hidden");
              loadPage(page.href, query);
            });

            const preview = document.createElement("p");
            preview.classList.add("search-result-snippet");
            preview.textContent = snippet;

            result.appendChild(link);
            result.appendChild(preview);
            overlayResults.appendChild(result);
          }
        } catch (err) {
          console.error(`Erreur de chargement pour ${page.href} :`, err);
        }
      }
    });
  }

  // === Génère un extrait de texte autour du mot-clé ===
  function extractSnippet(text, keyword) {
    const lower = text.toLowerCase();
    const index = lower.indexOf(keyword.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + 100);
    return (start > 0 ? '...' : '') + text.slice(start, end).trim() + (end < text.length ? '...' : '');
  }

  // === Remplissage automatique de la sidebar de droite avec les h2 ===
  function injectHeadingsSidebar() {
    const headingsSidebar = document.getElementById("headingsSidebar");
    if (!headingsSidebar || !mainContent) return;

    headingsSidebar.innerHTML = "";
    const headings = mainContent.querySelectorAll("h2");

    headings.forEach((h2, index) => {
      if (!h2.id) h2.id = `heading-${index}`;

      const link = document.createElement("a");
      link.href = `#${h2.id}`;
      link.textContent = h2.textContent;
      link.classList.add("heading-link");

      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(h2.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      headingsSidebar.appendChild(link);
    });
  }

  // === Chargement dynamique des pages ===
  function loadPage(href, highlight = "") {
    const baseUrl = href.split("#")[0];
    const hash = href.includes("#") ? href.split("#")[1] : null;

    localStorage.setItem("lastPage", baseUrl);

    fetch(baseUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const newContent = doc.querySelector(".main-content");
        if (!newContent || !mainContent) throw new Error("Pas de .main-content trouvé");

        mainContent.innerHTML = newContent.innerHTML;

        if (highlight) {
          const regex = new RegExp(`(${highlight})`, "gi");
          mainContent.innerHTML = mainContent.innerHTML.replace(regex, '<mark>$1</mark>');
        }

        const currentPage = pages.find(p => p.href === baseUrl);
        if (currentPage && currentPage.css) {
          const existingCSS = document.getElementById("dynamic-css");
          if (existingCSS) existingCSS.remove();

          const cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = currentPage.css;
          cssLink.id = "dynamic-css";
          document.head.appendChild(cssLink);
        }

        if (body.classList.contains("dark-mode")) enableDarkMode();
        injectHeadingsSidebar();

        if (hash) {
          setTimeout(() => {
            const anchor = document.getElementById(hash);
            if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement :", err);
        mainContent.innerHTML = `<div class="main-error">Erreur de chargement.<br><small>${err.message}</small></div>`;
      });
  }

  // === Navigation interne depuis les menus ===
  document.querySelectorAll(".gitbook-sidebar a, .next-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && !href.startsWith("#") && !href.includes("index.html")) {
        e.preventDefault();
        loadPage(href);
      }
    });
  });

  // === Gestion historique navigateur ===
  window.addEventListener("popstate", () => {
    loadPage(location.pathname);
  });

  // === Chargement initial ===
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "gitbook.html") {
    const lastPage = localStorage.getItem("lastPage");
    if (lastPage) loadPage(lastPage);
    else loadPage("sections/whitelist.html");
  }
});
