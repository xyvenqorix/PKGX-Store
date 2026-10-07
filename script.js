const appsContainer =
    document.getElementById("appsContainer");

const searchInput =
    document.getElementById("searchInput");

const categoriesContainer =
    document.getElementById("categories");

const appCount =
    document.getElementById("appCount");

const noResults =
    document.getElementById("noResults");


const shareModal =
    document.getElementById("shareModal");

const shareTitle =
    document.getElementById("shareTitle");

const shareUrl =
    document.getElementById("shareUrl");

const copyButton =
    document.getElementById("copyButton");

const nativeShareButton =
    document.getElementById("nativeShareButton");

const closeModal =
    document.getElementById("closeModal");

const modalOverlay =
    document.getElementById("modalOverlay");


let apps = [];

let selectedCategory =
    "all";


/* =========================
   CARGAR APLICACIONES
========================= */

async function loadApps() {

    try {

        const response =
            await fetch("/api/apps");


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar las aplicaciones."
            );

        }


        const data =
            await response.json();


        apps =
            Array.isArray(data)
                ? data
                : data.apps || [];


        createCategories();

        renderApps();


        checkHash();


    } catch (error) {

        console.error(error);


        appsContainer.innerHTML = `

            <div class="state">

                <h3>
                    No se pudo cargar el catálogo
                </h3>

                <p>
                    Inténtalo nuevamente más tarde.
                </p>

            </div>

        `;

    }

}


/* =========================
   CATEGORÍAS
========================= */

function createCategories() {

    const categories =
        [
            ...new Set(
                apps
                    .map(app => app.category)
                    .filter(Boolean)
            )
        ]
        .sort();


    categoriesContainer.innerHTML = "";


    addCategoryButton(
        "all",
        "Todas"
    );


    categories.forEach(category => {

        addCategoryButton(
            category,
            category
        );

    });

}


function addCategoryButton(
    value,
    label
) {

    const button =
        document.createElement("button");


    button.className =
        "category-button";


    if (value === selectedCategory) {

        button.classList.add("active");

    }


    button.dataset.category =
        value;


    button.textContent =
        label;


    button.addEventListener(
        "click",
        () => {

            selectedCategory =
                value;


            document
                .querySelectorAll(
                    ".category-button"
                )
                .forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


            button.classList.add(
                "active"
            );


            renderApps();

        }
    );


    categoriesContainer.appendChild(
        button
    );

}


/* =========================
   RENDER
========================= */

function renderApps() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        apps.filter(app => {

            const name =
                String(
                    app.name || ""
                ).toLowerCase();


            const category =
                String(
                    app.category || ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                category.includes(search);


            const matchesCategory =
                selectedCategory === "all" ||
                app.category === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    appCount.textContent =
        filtered.length === 1
            ? "1 aplicación"
            : `${filtered.length} aplicaciones`;


    appsContainer.innerHTML = "";


    if (!filtered.length) {

        noResults.classList.remove(
            "hidden"
        );

        return;

    }


    noResults.classList.add(
        "hidden"
    );


    filtered.forEach(
        (app, index) => {

            const card =
                createAppCard(
                    app,
                    index
                );


            appsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================
   CARD
========================= */

function createAppCard(
    app,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "app-card";


    card.style.animationDelay =
        `${Math.min(index * 45, 300)}ms`;


    const slug =
        createSlug(
            app.name
        );


    card.id =
        slug;


    const imageWrap =
        document.createElement(
            "div"
        );


    imageWrap.className =
        "app-image-wrap";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "app-image";


    image.src =
        app.image;


    image.alt =
        app.name;


    image.loading =
        "lazy";


    image.onerror =
        function () {

            this.src =
                createFallbackImage();

        };


    const category =
        document.createElement(
            "span"
        );


    category.className =
        "app-category-badge";


    category.textContent =
        app.category ||
        "Other";


    imageWrap.appendChild(
        image
    );

    imageWrap.appendChild(
        category
    );


    const body =
        document.createElement(
            "div"
        );


    body.className =
        "app-body";


    const name =
        document.createElement(
            "h3"
        );


    name.className =
        "app-name";


    name.textContent =
        app.name;


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "app-meta";


    const version =
        document.createElement(
            "span"
        );


    version.className =
        "app-version";


    version.textContent =
        "v" +
        (
            app.version ||
            "Sin versión"
        );


    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "meta-dot";


    const categoryText =
        document.createElement(
            "span"
        );


    categoryText.className =
        "app-category";


    categoryText.textContent =
        app.category ||
        "Other";


    meta.appendChild(
        version
    );

    meta.appendChild(
        dot
    );

    meta.appendChild(
        categoryText
    );


    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "app-actions";


    const download =
        document.createElement(
            "a"
        );


    download.className =
        "download-button";


    download.href =
        app.download;


    download.target =
        "_blank";


    download.rel =
        "noopener noreferrer";


    download.textContent =
        "Descargar";


    const share =
        document.createElement(
            "button"
        );


    share.className =
        "share-button";


    share.type =
        "button";


    share.title =
        "Compartir";


    share.textContent =
        "↗";


    share.addEventListener(
        "click",
        () => openShare(app)
    );


    actions.appendChild(
        download
    );

    actions.appendChild(
        share
    );


    body.appendChild(
        name
    );

    body.appendChild(
        meta
    );

    body.appendChild(
        actions
    );


    card.appendChild(
        imageWrap
    );

    card.appendChild(
        body
    );


    return card;

}


/* =========================
   BUSCADOR
========================= */

searchInput.addEventListener(
    "input",
    renderApps
);


/* =========================
   COMPARTIR
========================= */

function openShare(app) {

    const slug =
        createSlug(
            app.name
        );


    const url =
        `${window.location.origin}${window.location.pathname}#${slug}`;


    shareTitle.textContent =
        `Compartir ${app.name}`;


    shareUrl.value =
        url;


    shareModal.classList.remove(
        "hidden"
    );


    nativeShareButton.onclick =
        async () => {

            if (
                navigator.share
            ) {

                try {

                    await navigator.share({

                        title:
                            app.name,

                        text:
                            `Seguro te gusta este juego descargalo aqui: ${url}`,

                        url:
                            url

                    });

                } catch (error) {

                    // Cancelado por el usuario.

                }

            } else {

                copyToClipboard(
                    url
                );

            }

        };

}


function closeShare() {

    shareModal.classList.add(
        "hidden"
    );

}


closeModal.addEventListener(
    "click",
    closeShare
);


modalOverlay.addEventListener(
    "click",
    closeShare
);


/* =========================
   COPIAR
========================= */

copyButton.addEventListener(
    "click",
    async () => {

        await copyToClipboard(
            shareUrl.value
        );


        copyButton.textContent =
            "Copiado";


        setTimeout(
            () => {

                copyButton.textContent =
                    "Copiar";

            },
            1500
        );

    }
);


async function copyToClipboard(
    text
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

    } catch {

        shareUrl.select();

        document.execCommand(
            "copy"
        );

    }

}


/* =========================
   HASH
========================= */

function checkHash() {

    const hash =
        window.location.hash
            .replace(
                "#",
                ""
            );


    if (!hash) {
        return;
    }


    const target =
        document.getElementById(
            hash
        );


    if (target) {

        setTimeout(
            () => {

                target.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "center"
                });

            },
            300
        );

    }

}


window.addEventListener(
    "hashchange",
    checkHash
);


/* =========================
   SLUG
========================= */

function createSlug(
    value
) {

    return String(value)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================
   IMAGEN FALLBACK
========================= */

function createFallbackImage() {

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="800"
                height="450"
            >

                <rect
                    width="800"
                    height="450"
                    fill="#0b0f14"
                />

                <text
                    x="400"
                    y="225"
                    text-anchor="middle"
                    fill="#697582"
                    font-family="Arial"
                    font-size="30"
                >
                    PKGX STORE
                </text>

            </svg>

        `)
    );

}


/* =========================
   INICIAR
========================= */

loadApps();
