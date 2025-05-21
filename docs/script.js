document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("dark-toggle");
  const body = document.body;

  // === INITIALISATION DU THÈME ===
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }

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

  // === BARRE DE RECHERCHE ===
  const pages = [
    { title: "01 | LE REGLEMENT DISCORD", href: "pages/gitbook/sections/01_reglement_discord.html", css: "pages/gitbook/sections/01_reglement_discord.css" },
    { title: "02 | LE REGLEMENT GENERAL", href: "pages/gitbook/sections/02_reglement_general.html", css: "pages/gitbook/sections/02_reglement_general.css" },
    { title: "03 | LE VOCABULAIRE RP", href: "pages/gitbook/sections/03_vocabulaire.html", css: "pages/gitbook/sections/03_vocabulaire.css" },
    { title: "04 | LES STREAMERS", href: "pages/gitbook/sections/04_les_streamers.html", css: "pages/gitbook/sections/04_les_streamers.css" },
    { title: "05 | LE LEGAL", href: "pages/gitbook/sections/05_legal.html", css: "pages/gitbook/sections/05_legal.css" },
    { title: "06 | L'ILLEGAL", href: "pages/gitbook/sections/06_illegal.html", css: "pages/gitbook/sections/06_illegal.css" },
  ];

  const input = document.getElementById('searchInput');
  const resultsBox = document.getElementById('searchResults');

  if (input && resultsBox) {
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      resultsBox.innerHTML = '';
      if (query.length < 2) return;

      const filtered = pages.filter(p => p.title.toLowerCase().includes(query));
      filtered.forEach(page => {
        const link = document.createElement('a');
        link.href = page.href;
        link.textContent = page.title;
        link.addEventListener('click', function (e) {
          e.preventDefault();
          loadPage(this.href);
        });
        resultsBox.appendChild(link);
      });
    });
  }

  // === CHARGEMENT DYNAMIQUE DES PAGES ===
  const mainContent = document.querySelector('.main-content');

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
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      headingsSidebar.appendChild(link);
    });
  }

  function loadPage(url) {
    const baseUrl = url.split("#")[0];
    const hash = url.includes("#") ? url.split("#")[1] : null;

    //  Sauvegarder la page visitée
    localStorage.setItem("lastPage", baseUrl);

    fetch(baseUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('.main-content');

        if (!newContent || !mainContent) throw new Error("Pas de .main-content trouvé");

        mainContent.innerHTML = newContent.innerHTML;

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

        if (body.classList.contains("dark-mode")) {
          enableDarkMode();
        }

        injectHeadingsSidebar();

        if (hash) {
          setTimeout(() => {
            const anchor = document.getElementById(hash);
            if (anchor) {
              anchor.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 50);
        }
      })
      .catch(error => {
        console.error('Erreur de chargement :', error);
        mainContent.innerHTML = `<div class="main-error">Erreur de chargement de la page.<br><small>${error.message}</small></div>`;
      });
  }

  // Navigation dynamique
  document.querySelectorAll('.gitbook-sidebar a, .next-link').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.includes("index.html")) return;
      if (href && !href.startsWith('#')) {
        e.preventDefault();
        loadPage(href);
      }
    });
  });

  // Gestion bouton retour
  window.addEventListener('popstate', () => {
    loadPage(location.pathname);
  });

  // === Page par défaut ===
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "gitbook.html") {
    const lastPage = localStorage.getItem("lastPage");
    if (lastPage) {
      loadPage(lastPage);
    } else {
      loadPage("sections/whitelist.html");
    }
  }
});
