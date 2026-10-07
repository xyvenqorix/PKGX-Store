const grid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

let apps = [];

// Crear slug para la URL
function createSlug(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Cargar aplicaciones
async function loadApps() {
    try {
        const response = await fetch("/api/apps");

        if (!response.ok) {
            throw new Error("No se pudieron cargar las aplicaciones");
        }

        apps = await response.json();

        renderApps();

        // Si la URL tiene ?app=..., abrir directamente esa aplicación
        const params = new URLSearchParams(window.location.search);
        const appSlug = params.get("app");

        if (appSlug) {
            const app = apps.find(
                item => createSlug(item.name) === appSlug
            );

            if (app) {
                openAppDetails(app);
            }
        }

    } catch (error) {
        console.error(error);

        grid.innerHTML = `
            <div class="empty">
                No se pudieron cargar las aplicaciones.
            </div>
        `;
    }
}

// Renderizar tarjetas
function renderApps() {
    const search = searchInput.value
        .toLowerCase()
        .trim();

    const category = categorySelect.value;

    const filtered = apps.filter(app => {
        const matchesSearch =
            String(app.name)
                .toLowerCase()
                .includes(search);

        const matchesCategory =
            !category ||
            String(app.category).toLowerCase() ===
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
        const slug = createSlug(app.name);

        return `
            <article class="app-card">

                <img
                    src="${escapeHtml(app.image)}"
                    alt="${escapeHtml(app.name)}"
                    class="app-image"
                    loading="lazy"
                    onclick="openAppDetailsBySlug('${slug}')"
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

// Abrir detalles por slug
function openAppDetailsBySlug(slug) {
    const app = apps.find(
        item => createSlug(item.name) === slug
    );

    if (app) {
        openAppDetails(app);
    }
}

// Mostrar detalles de la aplicación
function openAppDetails(app) {

    const oldModal = document.getElementById("appModal");

    if (oldModal) {
        oldModal.remove();
    }

    const slug = createSlug(app.name);

    const modal = document.createElement("div");

    modal.id = "appModal";
    modal.className = "app-modal";

    modal.innerHTML = `
        <div class="app-modal-overlay" onclick="closeAppDetails()"></div>

        <div class="app-modal-content">

            <button
                class="modal-close"
                onclick="closeAppDetails()"
                aria-label="Cerrar"
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

    // Actualizar URL sin usar #
    const newUrl =
        `${window.location.origin}${window.location.pathname}?app=${encodeURIComponent(slug)}`;

    window.history.pushState(
        { app: slug },
        "",
        newUrl
    );
}

// Cerrar detalles
function closeAppDetails() {

    const modal = document.getElementById("appModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove("modal-open");

    // Volver a la URL normal
    window.history.pushState(
        {},
        "",
        window.location.pathname
    );
}

// Compartir aplicación
async function shareApp(slug) {

    const app = apps.find(
        item => createSlug(item.name) === slug
    );

    if (!app) return;

    const shareUrl =
        `${window.location.origin}${window.location.pathname}?app=${encodeURIComponent(slug)}`;

    const shareText =
        `Seguro te puede interesar esta aplicación:\n${app.name}\n\n${shareUrl}`;

    try {

        if (navigator.share) {

            await navigator.share({
                title: app.name,
                text: shareText,
                url: shareUrl
            });

        } else {

            await navigator.clipboard.writeText(shareUrl);

            alert("Enlace copiado correctamente.");

        }

    } catch (error) {

        // El usuario canceló el menú de compartir.
        console.log("Compartir cancelado.");

    }
}

// Cerrar con ESC
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeAppDetails();
    }

});

// Si el usuario usa atrás/adelante del navegador
window.addEventListener("popstate", () => {

    const params = new URLSearchParams(
        window.location.search
    );

    const slug = params.get("app");

    if (!slug) {
        const modal = document.getElementById("appModal");

        if (modal) {
            modal.remove();
        }

        document.body.classList.remove("modal-open");

        return;
    }

    const app = apps.find(
        item => createSlug(item.name) === slug
    );

    if (app) {
        openAppDetailsWithoutHistory(app);
    }

});

// Abrir detalles sin volver a modificar el historial
function openAppDetailsWithoutHistory(app) {

    const oldModal = document.getElementById("appModal");

    if (oldModal) {
        oldModal.remove();
    }

    const slug = createSlug(app.name);

    const modal = document.createElement("div");

    modal.id = "appModal";
    modal.className = "app-modal";

    modal.innerHTML = `
        <div class="app-modal-overlay" onclick="closeAppDetails()"></div>

        <div class="app-modal-content">

            <button
                class="modal-close"
                onclick="closeAppDetails()"
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
}

// Evitar HTML malicioso en nombres/URLs
function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Búsqueda
searchInput.addEventListener(
    "input",
    renderApps
);

// Categorías
categorySelect.addEventListener(
    "change",
    renderApps
);

// Iniciar
loadApps();
