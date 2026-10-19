
const API_URL = "/api/apps";
const PAGE_SIZE = 12;

const grid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const pagination = document.getElementById("pagination");
const totalCount = document.getElementById("totalCount");
const catalogStatus = document.getElementById("catalogStatus");

const modal = document.getElementById("appModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalVersion = document.getElementById("modalVersion");
const downloadButton = document.getElementById("downloadButton");
const shareButton = document.getElementById("shareButton");
const closeModalButton = document.getElementById("closeModal");

let allApps = [];
let filteredApps = [];
let currentPage = 1;
let selectedApp = null;

const categoryNames = {
  android: "Android",
  pc: "PC",
  roms_isos_games: "ROMs / ISOs / Games"
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getAppName(app) {
  return app.name ?? app.title ?? "Sin nombre";
}

function getAppImage(app) {
  return app.image ?? app.imageUrl ?? app.imageURL ?? app.photo ?? "";
}

function getAppCategory(app) {
  return app.category ?? app.platform ?? "android";
}

function getAppVersion(app) {
  return app.version ?? "";
}

function getDownloadURL(app) {
  return app.url ?? app.downloadUrl ?? app.downloadURL ?? app.link ?? "";
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getAppSlug(app) {
  return slugify(app.slug || getAppName(app));
}

function getShareURL(app) {
  const url = new URL(window.location.href);
  url.searchParams.set("app", getAppSlug(app));
  url.hash = "catalogo";
  return url.href;
}

function isSafeWebURL(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeImageURL(value) {
  return isSafeWebURL(value) ? value : "";
}

function getCategoryLabel(category) {
  return categoryNames[category] || String(category || "Aplicación");
}

async function loadApps() {
  catalogStatus.textContent = "Cargando catálogo...";
  grid.innerHTML = "";
  pagination.innerHTML = "";

  try {
    const response = await fetch(API_URL, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    // Acepta una respuesta en forma de array o { apps: [...] }.
    const apps = Array.isArray(data)
      ? data
      : Array.isArray(data.apps)
        ? data.apps
        : Array.isArray(data.titles)
          ? data.titles
          : null;

    if (!apps) {
      throw new Error("La API no devolvió una lista de aplicaciones.");
    }

    allApps = apps;
    catalogStatus.textContent = "";

    applyFilters();

    // Abre una aplicación si se entra con ?app=nombre
    const requestedSlug = new URLSearchParams(window.location.search).get("app");

    if (requestedSlug) {
      const app = allApps.find(item => getAppSlug(item) === requestedSlug);

      if (app) {
        openModal(app, false);
      }
    }
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);

    allApps = [];
    filteredApps = [];
    currentPage = 1;

    totalCount.textContent = "Sin datos";
    catalogStatus.textContent =
      "No se pudo cargar el catálogo. Comprueba que /api/apps esté funcionando.";
    grid.innerHTML = "";
    pagination.innerHTML = "";
  }
}

function applyFilters() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const category = categoryFilter.value;

  filteredApps = allApps.filter(app => {
    const name = getAppName(app).toLocaleLowerCase();
    const appCategory = String(getAppCategory(app)).toLowerCase();

    const matchesSearch = name.includes(query);
    const matchesCategory =
      category === "all" || appCategory === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  currentPage = 1;
  renderCatalog();
}

function renderCatalog() {
  const total = filteredApps.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  if (totalPages === 0) {
    currentPage = 1;
  }

  totalCount.textContent =
    `${total} ${total === 1 ? "resultado" : "resultados"}`;

  if (total === 0) {
    grid.innerHTML = "";
    pagination.innerHTML = "";

    if (allApps.length === 0) {
      catalogStatus.textContent = "Todavía no hay aplicaciones en el catálogo.";
    } else {
      catalogStatus.textContent =
        "No se encontraron resultados. Prueba otra búsqueda o categoría.";
    }

    return;
  }

  catalogStatus.textContent = "";

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageApps = filteredApps.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageApps.map((app, index) => {
    const name = getAppName(app);
    const category = getAppCategory(app);
    const version = getAppVersion(app);
    const image = safeImageURL(getAppImage(app));
    const download = getDownloadURL(app);
    const appIndex = start + index;
    const safeDownload = isSafeWebURL(download) ? download : "";

    return `
      <article class="app-card">
        <button
          class="app-image-wrap"
          type="button"
          data-open-app="${appIndex}"
          aria-label="Ver detalles de ${escapeHTML(name)}"
        >
          <img
            class="app-image"
            src="${escapeHTML(image)}"
            alt="${escapeHTML(name)}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.style.opacity='0';"
          >
          <span class="image-overlay">
            <span>Ver detalles ↗</span>
          </span>
        </button>

        <div class="app-info">
          <div class="app-meta">
            <span class="app-category">${escapeHTML(getCategoryLabel(category))}</span>
            <span class="app-version">${escapeHTML(version)}</span>
          </div>

          <h3 class="app-title" title="${escapeHTML(name)}">
            ${escapeHTML(name)}
          </h3>

          <div class="app-actions">
            ${
              safeDownload
                ? `<a
                    class="download-link"
                    href="${escapeHTML(safeDownload)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Descargar ↗</a>`
                : `<button
                    class="download-link"
                    type="button"
                    disabled
                    title="No hay un enlace de descarga válido"
                    style="opacity:.45;cursor:not-allowed"
                  >Sin enlace</button>`
            }

            <button
              class="share-link"
              type="button"
              data-share-app="${appIndex}"
              aria-label="Compartir ${escapeHTML(name)}"
              title="Compartir"
            >↗</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const fragment = document.createDocumentFragment();

  function addButton(label, page, options = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "page-button";
    button.textContent = label;
    button.disabled = Boolean(options.disabled);

    if (options.active) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    button.setAttribute("aria-label", options.ariaLabel || `Página ${page}`);

    button.addEventListener("click", () => {
      if (page === currentPage || page < 1 || page > totalPages) {
        return;
      }

      currentPage = page;
      renderCatalog();

      document.getElementById("catalogo").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    fragment.appendChild(button);
  }

  function addEllipsis() {
    const span = document.createElement("span");
    span.className = "page-ellipsis";
    span.textContent = "…";
    span.setAttribute("aria-hidden", "true");
    fragment.appendChild(span);
  }

  addButton("←", currentPage - 1, {
    disabled: currentPage === 1,
    ariaLabel: "Página anterior"
  });

  // Muestra un máximo de 5 números de página cuando el catálogo crece.
  let pages = [];

  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  } else {
    const first = Math.max(2, currentPage - 1);
    const last = Math.min(totalPages - 1, currentPage + 1);

    pages = [1];

    if (first > 2) {
      pages.push("ellipsis-left");
    }

    for (let page = first; page <= last; page++) {
      pages.push(page);
    }

    if (last < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    pages.push(totalPages);
  }

  pages.forEach(page => {
    if (typeof page !== "number") {
      addEllipsis();
      return;
    }

    addButton(String(page), page, {
      active: page === currentPage
    });
  });

  addButton("→", currentPage + 1, {
    disabled: currentPage === totalPages,
    ariaLabel: "Página siguiente"
  });

  pagination.appendChild(fragment);
}

function openModal(app, updateURL = true) {
  selectedApp = app;

  const name = getAppName(app);
  const image = safeImageURL(getAppImage(app));
  const category = getAppCategory(app);
  const version = getAppVersion(app);
  const download = getDownloadURL(app);

  modalTitle.textContent = name;
  modalCategory.textContent = getCategoryLabel(category);
  modalVersion.textContent = version ? `Versión ${version}` : "";
  modalImage.src = image;
  modalImage.alt = name;

  if (isSafeWebURL(download)) {
    downloadButton.href = download;
    downloadButton.style.display = "inline-flex";
  } else {
    downloadButton.removeAttribute("href");
    downloadButton.style.display = "none";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (updateURL) {
    const url = new URL(window.location.href);
    url.searchParams.set("app", getAppSlug(app));
    url.hash = "catalogo";
    history.pushState({ app: getAppSlug(app) }, "", url);
  }
}

function closeModal(updateURL = true) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  selectedApp = null;

  if (updateURL) {
    const url = new URL(window.location.href);
    url.searchParams.delete("app");
    history.pushState({}, "", url);
  }
}

async function shareApp(app) {
  const url = getShareURL(app);
  const title = getAppName(app);

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `Mira ${title} en PKGX Store`,
        url
      });
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("¡Enlace copiado! Ya puedes compartirlo.");
  } catch {
    window.prompt("Copia este enlace para compartir:", url);
  }
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

grid.addEventListener("click", event => {
  const openButton = event.target.closest("[data-open-app]");
  const shareButtonElement = event.target.closest("[data-share-app]");

  if (openButton) {
    const index = Number(openButton.dataset.openApp);
    const app = filteredApps[(currentPage - 1) * PAGE_SIZE + index -
      (currentPage - 1) * PAGE_SIZE];

    // El índice guardado en cada tarjeta es el de la lista filtrada.
    const appIndex = Number(openButton.dataset.openApp);
    if (filteredApps[appIndex]) {
      openModal(filteredApps[appIndex]);
    }
  }

  if (shareButtonElement) {
    const index = Number(shareButtonElement.dataset.shareApp);
    if (filteredApps[index]) {
      shareApp(filteredApps[index]);
    }
  }
});

closeModalButton.addEventListener("click", () => closeModal());

modal.addEventListener("click", event => {
  if (event.target.matches("[data-close-modal]")) {
    closeModal();
  }
});

shareButton.addEventListener("click", () => {
  if (selectedApp) {
    shareApp(selectedApp);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }

  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    searchInput.focus();
  }
});

window.addEventListener("popstate", () => {
  const slug = new URLSearchParams(window.location.search).get("app");

  if (slug) {
    const app = allApps.find(item => getAppSlug(item) === slug);
    if (app) {
      openModal(app, false);
    }
  } else if (modal.classList.contains("open")) {
    closeModal(false);
  }
});

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

loadApps();
