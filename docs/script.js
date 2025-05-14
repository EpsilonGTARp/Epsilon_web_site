document.addEventListener("DOMContentLoaded", () => {
  // === THÈME SOMBRE/LUMINEUX ===
  const toggle = document.getElementById("dark-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    body.setAttribute("data-theme", "dark");
    toggle.textContent = "☀️";
  } else {
    body.setAttribute("data-theme", "light");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      body.setAttribute("data-theme", isDark ? "dark" : "light");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      toggle.textContent = isDark ? "☀️" : "🌙";
    });
  }

  // === BARRE DE RECHERCHE DE LA SIDEBAR DROITE ===
  const pages = [
    { title: "01 | LE REGLEMENT DISCORD", href: "sections/01_reglement_discord.html" },
    { title: "02 | LE REGLEMENT GENERAL", href: "sections/02_reglement_general.html" },
    { title: "03 | LE VOCABULAIRE RP", href: "sections/03_vocabulaire.html" },
    { title: "04 | LES STREAMERS", href: "sections/04_les_streamers.html" },
    { title: "05 | LE LEGAL", href: "sections/05_legal.html" },
    { title: "06 | L'ILLEGAL", href: "sections/06_illegal.html" },
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

  function loadPage(url) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('.main-content');

        if (newContent && mainContent) {
          mainContent.innerHTML = newContent.innerHTML;
          window.history.pushState(null, '', url);
          window.scrollTo(0, 0);
        } else {
          console.warn('Aucun .main-content trouvé dans la page chargée');
        }
      })
      .catch(error => console.error('Erreur de chargement :', error));
  }

  // Sidebar gauche + liens next
  document.querySelectorAll('.gitbook-sidebar a, .next-link').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && !href.startsWith('#')) {
        e.preventDefault();
        loadPage(href);
      }
    });
  });

  // Bouton retour navigateur
  window.addEventListener('popstate', () => {
    loadPage(location.pathname);
  });
});
