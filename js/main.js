/* ========================================
   AUTO BURNISH
   MAIN JAVASCRIPT
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ========================================
       MOBILE MENU
    ======================================== */

    const menuButton = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", function (e) {

            e.preventDefault();
            e.stopPropagation();

            navLinks.classList.toggle("open");

            menuButton.classList.toggle("open");

        });

    }


    /* ========================================
       SCROLL REVEAL
    ======================================== */

    const revealItems =
        document.querySelectorAll(".reveal");

    if (
        revealItems.length &&
        "IntersectionObserver" in window
    ) {

        const revealObserver = new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -8% 0px",
            }
        );

        revealItems.forEach(function (item) {

            revealObserver.observe(item);

        });

    } else {

        /* No IntersectionObserver support (or nothing
           to reveal) — just show everything */

        revealItems.forEach(function (item) {

            item.classList.add("is-visible");

        });

    }


    /* ========================================
       NAV DROPDOWNS
    ======================================== */

    const dropdowns =
        document.querySelectorAll(".nav-dropdown");


    dropdowns.forEach(function (dropdown) {

        const button =
            dropdown.querySelector(
                ".nav-dropdown-toggle"
            );

        const menu =
            dropdown.querySelector(
                ".nav-dropdown-menu"
            );


        if (!button || !menu) {
            return;
        }


        button.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                /* Close other dropdowns */

                dropdowns.forEach(
                    function (other) {

                        if (other !== dropdown) {

                            other.classList.remove(
                                "open"
                            );

                        }

                    }
                );


                /* Toggle current */

                dropdown.classList.toggle(
                    "open"
                );

            }
        );


        /* Menu links */

        menu.querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        dropdown.classList.remove(
                            "open"
                        );

                        if (navLinks) {

                            navLinks.classList.remove(
                                "open"
                            );

                        }

                    }
                );

            });

    });


    /* Close dropdown when clicking outside */

    document.addEventListener(
        "click",
        function () {

            dropdowns.forEach(
                function (dropdown) {

                    dropdown.classList.remove(
                        "open"
                    );

                }
            );

        }
    );


    /* ========================================
       LANGUAGE / i18n
    ======================================== */

    const LANG_STORAGE_KEY = "autoBurnishLanguage";
    const SUPPORTED_LANGS = ["fr", "en", "ar"];


    function getTranslation(lang, key) {

        const dict =
            (typeof translations !== "undefined" && translations[lang]) ||
            null;

        if (!dict) {
            return null;
        }

        const parts = key.split(".");

        let node = dict;

        for (let i = 0; i < parts.length; i++) {

            if (
                node &&
                Object.prototype.hasOwnProperty.call(node, parts[i])
            ) {

                node = node[parts[i]];

            } else {

                return null;

            }

        }

        return typeof node === "string" ? node : null;

    }


    function translate(key, lang) {

        return (
            getTranslation(lang, key) ??
            getTranslation("fr", key) ??
            key
        );

    }


    function applyLanguage(lang) {

        if (SUPPORTED_LANGS.indexOf(lang) === -1) {
            lang = "fr";
        }


        /* Text content */

        document
            .querySelectorAll("[data-i18n]")
            .forEach(function (el) {

                el.textContent =
                    translate(el.getAttribute("data-i18n"), lang);

            });


        /* HTML content (may contain <em>, <br>, <span>, <strong>) */

        document
            .querySelectorAll("[data-i18n-html]")
            .forEach(function (el) {

                el.innerHTML =
                    translate(el.getAttribute("data-i18n-html"), lang);

            });


        /* Placeholders */

        document
            .querySelectorAll("[data-i18n-placeholder]")
            .forEach(function (el) {

                el.setAttribute(
                    "placeholder",
                    translate(el.getAttribute("data-i18n-placeholder"), lang)
                );

            });


        /* Alt attributes — strip any inline markup, since a
           translation key may be shared with a data-i18n-html
           element (e.g. a title containing <em>/<br>) and alt
           text must always be plain text */

        document
            .querySelectorAll("[data-i18n-alt]")
            .forEach(function (el) {

                const raw =
                    translate(el.getAttribute("data-i18n-alt"), lang);

                el.setAttribute(
                    "alt",
                    raw.replace(/<[^>]+>/g, "").trim()
                );

            });


        /* Aria labels */

        document
            .querySelectorAll("[data-i18n-aria-label]")
            .forEach(function (el) {

                el.setAttribute(
                    "aria-label",
                    translate(el.getAttribute("data-i18n-aria-label"), lang)
                );

            });


        /* Direction / lang / rtl class */

        const isRtl = lang === "ar";

        document.documentElement.lang = lang;

        document.documentElement.dir =
            isRtl ? "rtl" : "ltr";

        document.documentElement.classList.toggle(
            "rtl",
            isRtl
        );


        /* Language button label */

        if (languageButton) {

            const labelNode =
                languageButton.childNodes[0];

            if (labelNode) {

                labelNode.textContent =
                    lang.toUpperCase() + " ";

            }

        }


        /* Selected state inside the dropdown */

        document
            .querySelectorAll(".language-menu button")
            .forEach(function (btn) {

                btn.classList.toggle(
                    "active",
                    btn.dataset.lang === lang
                );

            });


        localStorage.setItem(LANG_STORAGE_KEY, lang);

    }


    const languageButton =
        document.querySelector(".language-btn");

    if (languageButton) {

        const languageMenu =
            document.createElement("div");

        languageMenu.className = "language-menu";


        SUPPORTED_LANGS.forEach(function (lang) {

            const option =
                document.createElement("button");

            option.type = "button";

            option.dataset.lang = lang;

            option.textContent = lang.toUpperCase();


            option.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();

                    applyLanguage(lang);

                    languageMenu.classList.remove("open");

                }
            );


            languageMenu.appendChild(option);

        });


        /* Wrap the button in its own tight-fitting element so
           the dropdown anchors to the button's own box, not
           the taller shared row it sits in (.nav-actions also
           holds the CTA button, which is taller) */

        const languageWrapper =
            document.createElement("span");

        languageWrapper.className = "language-wrapper";

        const buttonParent = languageButton.parentElement;

        if (buttonParent) {

            buttonParent.insertBefore(
                languageWrapper,
                languageButton
            );

            languageWrapper.appendChild(languageButton);

        }

        languageWrapper.appendChild(languageMenu);


        languageButton.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();

                languageMenu.classList.toggle("open");

            }
        );


        /* Close on outside click */

        document.addEventListener(
            "click",
            function (e) {

                if (
                    !languageMenu.contains(e.target) &&
                    e.target !== languageButton
                ) {

                    languageMenu.classList.remove("open");

                }

            }
        );


        /* Close on Escape */

        document.addEventListener(
            "keydown",
            function (e) {

                if (e.key === "Escape") {

                    languageMenu.classList.remove("open");

                }

            }
        );

    }


    /* Initial language: saved choice, else French */

    const savedLang =
        localStorage.getItem(LANG_STORAGE_KEY) || "fr";

    applyLanguage(savedLang);

    /* ========================================
       SMOOTH SCROLL
    ======================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (e) {

                    const id =
                        link.getAttribute("href");


                    if (
                        !id ||
                        id === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(id);


                    if (!target) {
                        return;
                    }


                    e.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });

    
/* ========================================
   HERO SLIDESHOW
======================================== */

const heroSlides = document.querySelectorAll(
    ".hero-slide"
);

if (heroSlides.length > 1) {

    let heroIndex = 0;

    setInterval(() => {

        heroSlides[heroIndex].classList.remove(
            "active"
        );

        heroIndex++;

        if (heroIndex >= heroSlides.length) {
            heroIndex = 0;
        }

        heroSlides[heroIndex].classList.add(
            "active"
        );

    }, 4500);

}

    /* ========================================
       BEFORE / AFTER
    ======================================== */

    const comparisons =
        document.querySelectorAll(
            ".comparison"
        );

    const number =
        document.querySelector(
            ".comparison-number"
        );

    const prevButton =
        document.querySelector(
            ".comparison-prev"
        );

    const nextButton =
        document.querySelector(
            ".comparison-next"
        );


    let currentIndex = 0;


    if (comparisons.length) {


        /* ---------- SLIDER ---------- */

        comparisons.forEach(
            function (comparison) {

                const before =
                    comparison.querySelector(
                        ".comparison-before"
                    );

                const slider =
                    comparison.querySelector(
                        ".comparison-slider"
                    );


                if (!before || !slider) {
                    return;
                }


                let dragging = false;


                function moveSlider(clientX) {

                    const rect =
                        comparison.getBoundingClientRect();


                    if (!rect.width) {
                        return;
                    }


                    let percentage =
                        (
                            (clientX - rect.left)
                            / rect.width
                        ) * 100;


                    percentage =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                percentage
                            )
                        );


                    before.style.width =
                        percentage + "%";

                    slider.style.left =
                        percentage + "%";

                }


                comparison.addEventListener(
                    "pointerdown",
                    function (e) {

                        dragging = true;

                        comparison.classList.add(
                            "is-dragging"
                        );

                        /* Keep receiving move/up events on this
                           element even if the cursor leaves its
                           bounds mid-drag — without this, a fast
                           drag past the edge "drops" the slider
                           and can leave it stuck mid-transition */

                        if (comparison.setPointerCapture) {

                            try {

                                comparison.setPointerCapture(
                                    e.pointerId
                                );

                            } catch (err) {}

                        }

                        moveSlider(
                            e.clientX
                        );

                        e.preventDefault();

                    }
                );


                comparison.addEventListener(
                    "pointermove",
                    function (e) {

                        if (!dragging) {
                            return;
                        }

                        moveSlider(
                            e.clientX
                        );

                        e.preventDefault();

                    }
                );


                comparison.addEventListener(
                    "pointerup",
                    function (e) {

                        dragging = false;

                        comparison.classList.remove(
                            "is-dragging"
                        );

                        if (
                            comparison.releasePointerCapture &&
                            comparison.hasPointerCapture &&
                            comparison.hasPointerCapture(e.pointerId)
                        ) {

                            try {

                                comparison.releasePointerCapture(
                                    e.pointerId
                                );

                            } catch (err) {}

                        }

                    }
                );


                comparison.addEventListener(
                    "pointercancel",
                    function () {

                        dragging = false;

                        comparison.classList.remove(
                            "is-dragging"
                        );

                    }
                );


                /* Failsafe: if pointer capture isn't supported
                   and the pointer is released outside the
                   element, this guarantees dragging state and
                   the transition-disabling class never get
                   stuck permanently */

                document.addEventListener(
                    "pointerup",
                    function () {

                        if (!dragging) {
                            return;
                        }

                        dragging = false;

                        comparison.classList.remove(
                            "is-dragging"
                        );

                    }
                );

            }
        );


        /* ---------- SHOW PROJECT ---------- */

        function showComparison(index) {

            if (
                index < 0 ||
                index >= comparisons.length
            ) {
                return;
            }


            comparisons.forEach(
                function (comparison, i) {

                    comparison.classList.toggle(
                        "active",
                        i === index
                    );

                }
            );


            currentIndex = index;


            if (number) {

                number.textContent =
                    String(index + 1)
                        .padStart(2, "0")
                    + " / "
                    + String(comparisons.length)
                        .padStart(2, "0");

            }


            const active =
                comparisons[index];


            const before =
                active.querySelector(
                    ".comparison-before"
                );

            const slider =
                active.querySelector(
                    ".comparison-slider"
                );


            if (before && slider) {

                before.style.width = "50%";

                slider.style.left = "50%";

            }

        }


        /* ---------- PREVIOUS ---------- */

        if (prevButton) {

            prevButton.addEventListener(
                "click",
                function () {

                    currentIndex--;

                    if (currentIndex < 0) {

                        currentIndex =
                            comparisons.length - 1;

                    }

                    showComparison(
                        currentIndex
                    );

                }
            );

        }


        /* ---------- NEXT ---------- */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function () {

                    currentIndex++;

                    if (
                        currentIndex >=
                        comparisons.length
                    ) {

                        currentIndex = 0;

                    }

                    showComparison(
                        currentIndex
                    );

                }
            );

        }


        showComparison(0);

    }


  /* ========================================
       GALLERY FILTER
    ======================================== */
    
    const filterButtons = document.querySelectorAll(
        ".gallery-filter"
    );
    
    const galleryItems = document.querySelectorAll(
        ".gallery-item"
    );
    
    
    /* ----------------------------------------
       CHECK
    ---------------------------------------- */
    
    if (filterButtons.length && galleryItems.length) {
    
    
        /* ----------------------------------------
           FILTER FUNCTION
        ---------------------------------------- */
    
        function showCategory(category) {

            galleryItems.forEach(function (item) {

                const itemCategory =
                    item.dataset.category;

                const showInAll =
                    item.dataset.showAll === "true";

                const shouldShow =
                    category === "all"
                        ? showInAll
                        : itemCategory === category;


                /* ================================
                   SHOW — bring back into the grid,
                   then fade/scale it in
                ================================= */

                if (shouldShow) {

                    item.classList.remove(
                        "gallery-removed"
                    );

                    /* Let the browser register the
                       display change before removing
                       gallery-hidden, so the fade-in
                       transition actually plays */

                    requestAnimationFrame(function () {

                        requestAnimationFrame(function () {

                            item.classList.remove(
                                "gallery-hidden"
                            );

                        });

                    });

                    return;
                }


                /* ================================
                   HIDE — fade/scale out, then pull
                   it out of the grid flow
                ================================= */

                item.classList.add("gallery-hidden");

                window.setTimeout(function () {

                    if (
                        item.classList.contains(
                            "gallery-hidden"
                        )
                    ) {

                        item.classList.add(
                            "gallery-removed"
                        );

                    }

                }, 400);

            });

        }
    
    
        /* ----------------------------------------
           BUTTONS
        ---------------------------------------- */
    
        filterButtons.forEach(function (button) {
    
            button.addEventListener(
                "click",
                function (e) {
    
                    e.preventDefault();
    
    
                    const category =
                        this.dataset.filter;
    
    
                    /* Remove active */
    
                    filterButtons.forEach(
                        function (btn) {
    
                            btn.classList.remove(
                                "active"
                            );
    
                        }
                    );
    
    
                    /* Add active */
    
                    this.classList.add("active");
    
    
                    /* Filter */
    
                    showCategory(category);
    
                }
            );
    
        });
    
    
        /* ----------------------------------------
           INITIAL STATE
        ---------------------------------------- */
    
        showCategory("all");
    
    }

    /* =====================================================
       BOOKING — VEHICLE PHOTO PREVIEW
    ===================================================== */
    
    const vehiclePhotos = document.getElementById("vehiclePhotos");
    const photoPreview = document.getElementById("photoPreview");
    
    if (vehiclePhotos && photoPreview) {
    
        vehiclePhotos.addEventListener("change", function () {
    
            photoPreview.innerHTML = "";
    
            const files = Array.from(this.files);
    
            files.forEach(function (file) {
    
                if (!file.type.startsWith("image/")) {
                    return;
                }
    
                const reader = new FileReader();
    
                reader.onload = function (e) {
    
                    const previewItem =
                        document.createElement("div");
    
                    previewItem.className =
                        "photo-preview-item";
    
                    previewItem.innerHTML = `
                        <img
                            src="${e.target.result}"
                            alt="Photo du véhicule"
                        >
    
                        <button
                            type="button"
                            class="photo-remove"
                            aria-label="Supprimer la photo"
                        >
                            ×
                        </button>
                    `;
    
                    const removeButton =
                        previewItem.querySelector(".photo-remove");
    
                    removeButton.addEventListener(
                        "click",
                        function () {
    
                            previewItem.remove();
    
                        }
                    );
    
                    photoPreview.appendChild(previewItem);
    
                };
    
                reader.readAsDataURL(file);
    
            });
    
        });
    
    }


});