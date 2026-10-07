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

    return `${window.location.origin}${window.location.pathname}#${createSlug(app.name)}`;

}


/* =========================
   COMPARTIR
========================= */

function shareApp(app) {

    const appUrl =
        getAppUrl(app);


    const message =
        `Seguro te puede interesar esta aplicación:\n` +
        `${appUrl}`;


    if (navigator.share) {

        navigator.share({

            title:
                app.name,

            text:
                message,

            url:
                appUrl

        }).catch(() => {});

    } else if (navigator.clipboard) {

        navigator.clipboard
            .writeText(message)
            .then(() => {

                alert(
                    "Enlace copiado para compartir."
                );

            });

    } else {

        prompt(
            "Copia este mensaje:",
            message
        );

    }

}


/* =========================
   PLATAFORMAS / CATEGORÍAS
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


        const share =
            document.createElement(
                "button"
            );

        share.className =
            "btn btn-share";

        share.type =
            "button";

        share.textContent =
            "Compartir";


        share.addEventListener(
            "click",
            () => {

                shareApp(app);

            }
        );


        actions.append(
            download,
            share
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

        checkHash();


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
   HASH
========================= */

function checkHash() {

    const slug =
        window.location.hash
            .replace("#", "")
            .trim();


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

        document
            .getElementById("apps")
            .scrollIntoView({
                behavior: "smooth"
            });

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


window.addEventListener(
    "hashchange",
    checkHash
);


/* =========================
   INICIAR
========================= */

loadApps();
