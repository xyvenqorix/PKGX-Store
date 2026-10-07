const appsGrid =
    document.getElementById("appsGrid");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");


let apps = [];


/* =========================
   SLUG
========================= */

function createSlug(name) {

    return String(name || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            "");

}


/* =========================
   URL
========================= */

function getAppUrl(app) {

    return (
        window.location.origin +
        window.location.pathname +
        "?app=" +
        encodeURIComponent(
            createSlug(app.name)
        )
    );

}


/* =========================
   ESTILOS DEL EMERGENTE
========================= */

const popupStyle =
    document.createElement("style");

popupStyle.textContent = `

#pkgxAppPopup {

    position: fixed;

    inset: 0;

    z-index: 999999;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

    background: rgba(0,0,0,.82);

    backdrop-filter: blur(8px);

}

#pkgxAppPopup .popup-box {

    width: min(430px, 100%);

    max-height: 90vh;

    overflow-y: auto;

    background: #101722;

    border: 1px solid #263242;

    border-radius: 18px;

    box-shadow:
        0 25px 80px rgba(0,0,0,.55);

    overflow: hidden;

    position: relative;

}

#pkgxAppPopup .popup-image {

    width: 100%;

    display: block;

    max-height: 330px;

    object-fit: cover;

}

#pkgxAppPopup .popup-content {

    padding: 20px;

}

#pkgxAppPopup .popup-category {

    display: inline-block;

    padding: 5px 10px;

    border-radius: 999px;

    background: rgba(57,255,136,.10);

    color: #39ff88;

    font-size: 12px;

    margin-bottom: 10px;

}

#pkgxAppPopup h2 {

    margin: 0 0 8px;

    color: #ffffff;

    font-size: 24px;

}

#pkgxAppPopup .popup-version {

    color: #9da8b7;

    font-size: 14px;

    margin-bottom: 20px;

}

#pkgxAppPopup .popup-download {

    display: block;

    width: 100%;

    box-sizing: border-box;

    text-align: center;

    text-decoration: none;

    padding: 12px 16px;

    border-radius: 10px;

    background: #39ff88;

    color: #07100b;

    font-weight: 700;

}

#pkgxAppPopup .popup-close {

    position: absolute;

    top: 12px;

    right: 12px;

    width: 36px;

    height: 36px;

    border: 0;

    border-radius: 50%;

    background: rgba(0,0,0,.65);

    color: white;

    font-size: 24px;

    line-height: 36px;

    cursor: pointer;

    z-index: 2;

}

#pkgxAppPopup .popup-close:hover {

    background: rgba(0,0,0,.85);

}

body.pkgx-popup-open {

    overflow: hidden;

}

`;

document.head.appendChild(
    popupStyle
);


/* =========================
   ABRIR EMERGENTE
========================= */

function openAppPopup(app) {

    closeAppPopup();


    const popup =
        document.createElement("div");

    popup.id =
        "pkgxAppPopup";


    popup.innerHTML = `

        <div class="popup-box">

            <button
                class="popup-close"
                type="button"
                aria-label="Cerrar"
            >
                ×
            </button>

            <img
                class="popup-image"
                src="${app.image || "https://placehold.co/900x500/101722/39ff88?text=PKGX+STORE"}"
                alt="${app.name || "Aplicación"}"
            >

            <div class="popup-content">

                <span class="popup-category">
                    ${app.category || "Otros"}
                </span>

                <h2>
                    ${app.name || "Aplicación sin nombre"}
                </h2>

                <div class="popup-version">
                    Versión ${app.version || "N/A"}
                </div>

                <a
                    class="popup-download"
                    href="${app.download || "#"}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Descargar
                </a>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    document.body.classList.add(
        "pkgx-popup-open"
    );


    /* Cerrar con X */

    popup
        .querySelector(".popup-close")
        .addEventListener(
            "click",
            closeAppPopup
        );


    /* Cerrar tocando fuera */

    popup.addEventListener(
        "click",
        function(event) {

            if (
                event.target === popup
            ) {

                closeAppPopup();

            }

        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        popupEscHandler
    );


    /*
     * Cambiar URL sin recargar
     */

    history.pushState(
        {
            app:
                createSlug(app.name)
        },
        "",
        getAppUrl(app)
    );

}


/* =========================
   CERRAR EMERGENTE
========================= */

function closeAppPopup() {

    const popup =
        document.getElementById(
            "pkgxAppPopup"
        );


    if (popup) {

        popup.remove();

    }


    document.body.classList.remove(
        "pkgx-popup-open"
    );


    document.removeEventListener(
        "keydown",
        popupEscHandler
    );


    /*
     * Volver a la URL normal
     */

    if (
        window.location.search
    ) {

        history.replaceState(
            {},
            "",
            window.location.pathname
        );

    }

}


function popupEscHandler(event) {

    if (
        event.key === "Escape"
    ) {

        closeAppPopup();

    }

}


/* =========================
   ABRIR DESDE URL
========================= */

function checkSharedApp() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const slug =
        params.get("app");


    if (!slug) {

        return;

    }


    const app =
        apps.find(item => {

            return (
                createSlug(item.name) ===
                slug
            );

        });


    if (app) {

        openAppPopupFromUrl(app);

    }

}


/*
 * Igual que el popup normal,
 * pero no vuelve a modificar la URL.
 */

function openAppPopupFromUrl(app) {

    closePopupOnly();


    const popup =
        document.createElement("div");

    popup.id =
        "pkgxAppPopup";


    popup.innerHTML = `

        <div class="popup-box">

            <button
                class="popup-close"
                type="button"
            >
                ×
            </button>

            <img
                class="popup-image"
                src="${app.image || "https://placehold.co/900x500/101722/39ff88?text=PKGX+STORE"}"
                alt="${app.name || "Aplicación"}"
            >

            <div class="popup-content">

                <span class="popup-category">
                    ${app.category || "Otros"}
                </span>

                <h2>
                    ${app.name || "Aplicación sin nombre"}
                </h2>

                <div class="popup-version">
                    Versión ${app.version || "N/A"}
                </div>

                <a
                    class="popup-download"
                    href="${app.download || "#"}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Descargar
                </a>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    document.body.classList.add(
        "pkgx-popup-open"
    );


    popup
        .querySelector(".popup-close")
        .addEventListener(
            "click",
            function() {

                closeAppPopup();

            }
        );


    popup.addEventListener(
        "click",
        function(event) {

            if (
                event.target === popup
            ) {

                closeAppPopup();

            }

        }
    );


    document.addEventListener(
        "keydown",
        popupEscHandler
    );

}


function closePopupOnly() {

    const popup =
        document.getElementById(
            "pkgxAppPopup"
        );


    if (popup) {

        popup.remove();

    }

}


/* =========================
   CATEGORÍAS
========================= */

function loadCategories() {

    const categories = [
        ...new Set(
            apps
                .map(app => app.category)
                .filter(Boolean)
        )
    ].sort();


    categoryFilter.innerHTML = `
        <option value="">
            Todas las categorías
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category;

        option.textContent =
            category;

        categoryFilter.appendChild(
            option
        );

    });

}


/* =========================
   RENDER
========================= */

function renderApps() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const filtered =
        apps.filter(app => {

            const name =
                String(
                    app.name || ""
                ).toLowerCase();


            const appCategory =
                String(
                    app.category || ""
                );


            return (

                name.includes(search) &&

                (
                    !category ||
                    appCategory === category
                )

            );

        });


    appsGrid.innerHTML = "";


    if (!filtered.length) {

        appsGrid.innerHTML = `
            <div class="empty">
                No se encontraron aplicaciones.
            </div>
        `;

        return;

    }


    filtered.forEach(app => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "app-card";


        const image =
            document.createElement(
                "img"
            );

        image.className =
            "app-image";


        image.src =
            app.image ||
            "https://placehold.co/900x500/101722/39ff88?text=PKGX+STORE";


        image.alt =
            app.name ||
            "Aplicación";


        image.loading =
            "lazy";


        image.onerror =
            function () {

                this.onerror =
                    null;

                this.src =
                    "https://placehold.co/900x500/101722/39ff88?text=PKGX+STORE";

            };


        /*
         * LA IMAGEN ABRE EL EMERGENTE
         */

        image.style.cursor =
            "pointer";


        image.addEventListener(
            "click",
            function() {

                openAppPopup(app);

            }
        );


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "app-content";


        const categoryTag =
            document.createElement(
                "span"
            );

        categoryTag.className =
            "category";

        categoryTag.textContent =
            app.category ||
            "Otros";


        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            app.name ||
            "Aplicación sin nombre";


        const version =
            document.createElement(
                "div"
            );

        version.className =
            "version";

        version.textContent =
            `Versión ${app.version || "N/A"}`;


        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "card-actions";


        const download =
            document.createElement(
                "a"
            );

        download.className =
            "btn btn-download";

        download.textContent =
            "Descargar";

        download.href =
            app.download ||
            "#";

        download.target =
            "_blank";

        download.rel =
            "noopener noreferrer";


        actions.append(
            download
        );


        content.append(
            categoryTag,
            title,
            version,
            actions
        );


        card.append(
            image,
            content
        );


        appsGrid.appendChild(
            card
        );

    });

}


/* =========================
   API
========================= */

async function loadApps() {

    try {

        const response =
            await fetch(
                "/api/apps"
            );


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar las aplicaciones"
            );

        }


        apps =
            await response.json();


        if (!Array.isArray(apps)) {

            apps = [];

        }


        loadCategories();

        renderApps();

        /*
         * Si viene ?app=
         * abrir automáticamente
         */

        checkSharedApp();


    } catch (error) {

        console.error(error);


        appsGrid.innerHTML = `
            <div class="empty">
                No se pudieron cargar las aplicaciones.
                Intenta nuevamente.
            </div>
        `;

    }

}


/* =========================
   EVENTOS
========================= */

searchInput.addEventListener(
    "input",
    renderApps
);


categoryFilter.addEventListener(
    "change",
    renderApps
);


/* =========================
   ATRÁS / ADELANTE
========================= */

window.addEventListener(
    "popstate",
    function() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const slug =
            params.get("app");


        if (!slug) {

            closePopupOnly();

            document.body.classList.remove(
                "pkgx-popup-open"
            );

            return;

        }


        const app =
            apps.find(item => {

                return (
                    createSlug(item.name) ===
                    slug
                );

            });


        if (app) {

            openAppPopupFromUrl(app);

        }

    }
);


/* =========================
   INICIAR
========================= */

loadApps();
