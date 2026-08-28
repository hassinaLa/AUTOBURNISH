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
   LANGUAGE DROPDOWN
======================================== */

const languageButton =
    document.querySelector(".language-btn");

if (languageButton) {

    const languageMenu =
        document.createElement("div");

    languageMenu.className =
        "js-language-menu";


    languageMenu.style.cssText = `
        position: fixed;
        min-width: 90px;
        padding: 6px 0;
        background: #111;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        display: none;
        z-index: 99999;
    `;

    function positionLanguageMenu() {

        const rect =
            languageButton.getBoundingClientRect();
    
        languageMenu.style.left =
            rect.left + "px";
    
        languageMenu.style.top =
            (rect.bottom + 15) + "px";
    
    }

    ["FR", "EN", "AR"].forEach(function (lang) {

        const option =
            document.createElement("button");

        option.type = "button";

        option.textContent = lang;

        option.style.cssText = `
            display: block;
            width: 100%;
            padding: 11px 18px;
            border: none;
            background: transparent;
            color: #aaa;
            font-family: inherit;
            font-size: 11px;
            text-align: left;
            cursor: pointer;
        `;


        option.addEventListener(
            "mouseenter",
            function () {
                option.style.color = "#d4af37";
            }
        );


        option.addEventListener(
            "mouseleave",
            function () {
                option.style.color = "#aaa";
            }
        );


        option.addEventListener(
            "click",
            function (e) {

                e.stopPropagation();

                /* Change displayed language */

                languageButton.firstChild.textContent =
                    lang + " ";

                languageMenu.style.display =
                    "none";

            }
        );


        languageMenu.appendChild(option);

    });


    /* Make the language button's parent relative */

    const parent =
        languageButton.parentElement;

    if (parent) {

        parent.style.position =
            "relative";

        parent.appendChild(
            languageMenu
        );

    }


    /* Open / close */

    languageButton.addEventListener(
        "click",
        function (e) {
    
            e.preventDefault();
            e.stopPropagation();
    
    
            const isOpen =
                languageMenu.style.display === "block";
    
    
            if (isOpen) {
    
                languageMenu.style.display = "none";
    
            } else {
    
                positionLanguageMenu();
    
                languageMenu.style.display = "block";
    
            }
    
        }
    );


    /* Close when clicking elsewhere */

    document.addEventListener(
        "click",
        function () {

            languageMenu.style.display =
                "none";

        }
    );

}

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
                    function () {

                        dragging = false;

                    }
                );


                comparison.addEventListener(
                    "pointercancel",
                    function () {

                        dragging = false;

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
       GALLERY FILTERS
    ======================================== */

    const galleryFilters =
        document.querySelectorAll(
            ".gallery-filter"
        );

    const galleryItems =
        document.querySelectorAll(
            ".gallery-item"
        );


    function showGalleryCategory(category) {

        galleryItems.forEach(
            function (item) {

                const itemCategory =
                    item.dataset.category;

                const showInAll =
                    item.dataset.showAll === "true";


                if (category === "all") {

                    item.style.display =
                        showInAll
                            ? ""
                            : "none";

                    return;

                }


                item.style.display =
                    itemCategory === category
                        ? ""
                        : "none";

            }
        );

    }


    galleryFilters.forEach(
        function (filter) {

            filter.addEventListener(
                "click",
                function () {

                    const category =
                        filter.dataset.filter;


                    galleryFilters.forEach(
                        function (button) {

                            button.classList.remove(
                                "active"
                            );

                        }
                    );


                    filter.classList.add(
                        "active"
                    );


                    showGalleryCategory(
                        category
                    );

                }
            );

        }
    );


    if (galleryItems.length) {

        showGalleryCategory("all");

    }

});