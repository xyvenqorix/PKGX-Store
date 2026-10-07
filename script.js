const grid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

let apps = [];

// Crear slug
function slugify(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Escapar HTML
function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Cargar aplicaciones desde MongoDB mediante la API
async function loadApps() {
    try {
        const response = await fetch("/api/apps");

        if (!response.ok) {
            throw new Error("Error HTTP " + response.status);
        }

        apps = await response.json();

        renderApps();

        // Revisar si viene una aplicación en ?app=
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("app");

        if (slug) {
            const app = apps.find(
                item => slugify(item.name) === slug
            );

            if (app) {
                openDetails(app, false);
            }
        }

    } catch (error) {
        console.error("Error cargando aplicaciones:", error);

        grid.innerHTML = `
            <div class="empty">
                No se pudieron cargar las aplicaciones.
            </div>
        `;
    }
}

// Mostrar aplicaciones
function renderApps() {

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const category = categorySelect
        ? categorySelect.value
        : "";

    const filtered = apps.filter(app => {

        const name = String(app.name || "").toLowerCase();

        const matchesSearch =
            name.includes(search);

        const matchesCategory =
            !category ||
            String(app.category || "").toLowerCase() ===
            category.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {

        grid.innerHTML = `
            <div class="empty">
                No se encontraron aplicaciones.
            </div>
        `;

        return;
    }

    grid.innerHTML = filtered.map(app => {

        const slug = slugify(app.name);

        return `
            <article class="app-card">

                <img
                    src="${escapeHtml(app.image)}"
                    alt="${escapeHtml(app.name)}"
                    class="app-image"
                    onclick="openApp('${slug}')"
                    loading="lazy"
                >

                <div class="app-content">

                    <div class="app-category">
                        ${escapeHtml(app.category)}
                    </div>

                    <h3>
                        ${escapeHtml(app.name)}
                    </h3>

                    <div class="app-version">
                        Versión ${escapeHtml(app.version)}
                    </div>

                    <div class="app-actions">

                        <a
                            href="${escapeHtml(app.download)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="download-btn"
                        >
                            Descargar
                        </a>

                        <button
                            type="button"
                            class="share-btn"
                            onclick="shareApp('${slug}')"
                        >
                            Compartir
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}

// Buscar una app y abrir sus detalles
function openApp(slug) {

    const app = apps.find(
        item => slugify(item.name) === slug
    );

    if (app) {
        openDetails(app, true);
    }
}

// Abrir detalles
function openDetails(app, changeUrl = true) {

    const existing = document.getElementById("appModal");

    if (existing) {
        existing.remove();
    }

    const slug = slugify(app.name);

    const modal = document.createElement("div");

    modal.id = "appModal";
    modal.className = "app-modal";

    modal.innerHTML = `
        <div
            class="app-modal-overlay"
            onclick="closeDetails()"
        ></div>

        <div class="app-modal-content">

            <button
                type="button"
                class="modal-close"
                onclick="closeDetails()"
            >
                ×
            </button>

            <img
                src="${escapeHtml(app.image)}"
                alt="${escapeHtml(app.name)}"
                class="modal-image"
            >

            <div class="modal-info">

                <div class="app-category">
                    ${escapeHtml(app.category)}
                </div>

                <h2>
                    ${escapeHtml(app.name)}
                </h2>

                <div class="modal-version">
                    Versión ${escapeHtml(app.version)}
                </div>

                <div class="modal-actions">

                    <a
                        href="${escapeHtml(app.download)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="download-btn"
                    >
                        Descargar
                    </a>

                    <button
                        type="button"
                        class="share-btn"
                        onclick="shareApp('${slug}')"
                    >
                        Compartir
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document.body.classList.add("modal-open");

    // Cambiar URL solamente si venimos desde la página
    if (changeUrl) {

        const url =
            window.location.pathname +
            "?app=" +
            encodeURIComponent(slug);

        history.pushState(
            { app: slug },
            "",
            url
        );
    }
}

// Cerrar detalles
function closeDetails() {

    const modal = document.getElementById("appModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove("modal-open");

    // Quitar ?app=
    history.pushState(
        {},
        "",
        window.location.pathname
    );
}

// Compartir
async function shareApp(slug) {

    const app = apps.find(
        item => slugify(item.name) === slug
    );

    if (!app) {
        return;
    }

    // ESTA es la URL que se comparte
    const shareUrl =
        window.location.origin +
        window.location.pathname +
        "?app=" +
        encodeURIComponent(slug);

    const text =
        `Seguro te puede interesar esta aplicación:\n${app.name}`;

    try {

        if (navigator.share) {

            await navigator.share({
                title: app.name,
                text: text,
                url: shareUrl
            });

        } else {

            await navigator.clipboard.writeText(shareUrl);

            alert("Enlace copiado correctamente.");

        }

    } catch (error) {

        console.log("Compartir cancelado.");

    }
}

// Botón atrás/adelante del navegador
window.addEventListener("popstate", function () {

    const params =
        new URLSearchParams(window.location.search);

    const slug = params.get("app");

    if (!slug) {

        const modal =
            document.getElementById("appModal");

        if (modal) {
            modal.remove();
        }

        document.body.classList.remove("modal-open");

        return;
    }

    const app = apps.find(
        item => slugify(item.name) === slug
    );

    if (app) {
        openDetails(app, false);
    }
});

// ESC para cerrar
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeDetails();
    }

});

// Eventos de búsqueda
if (searchInput) {
    searchInput.addEventListener(
        "input",
        renderApps
    );
}

// Evento de categoría
if (categorySelect) {
    categorySelect.addEventListener(
        "change",
        renderApps
    );
}

// Iniciar
loadApps();
