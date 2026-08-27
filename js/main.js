/* ========================================
   AUTO BURNISH
   MAIN JAVASCRIPT
======================================== */


/* ---------- MOBILE MENU ---------- */

const menuButton = document.querySelector(".menu-btn");

menuButton.addEventListener("click", () => {

    console.log("Mobile menu clicked");

});


/* ---------- LANGUAGE ---------- */

const languageButton = document.querySelector(".language-btn");

languageButton.addEventListener("click", () => {

    console.log("Language selector clicked");

});

/* ========================================
   BEFORE / AFTER GALLERY
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const comparisons =
        document.querySelectorAll(".comparison");

    const number =
        document.querySelector(".comparison-number");

    const prevButton =
        document.querySelector(".comparison-prev");

    const nextButton =
        document.querySelector(".comparison-next");


    if (!comparisons.length) return;


    let currentIndex = 0;


    /* ========================================
       SLIDER
    ======================================== */

    comparisons.forEach((comparison) => {

        const before =
            comparison.querySelector(".comparison-before");

        const slider =
            comparison.querySelector(".comparison-slider");


        if (!before || !slider) return;


        let isDragging = false;


        function moveSlider(clientX) {

            const rect =
                comparison.getBoundingClientRect();


            let percentage =
                ((clientX - rect.left) / rect.width) * 100;


            percentage =
                Math.max(
                    0,
                    Math.min(100, percentage)
                );


            before.style.width =
                `${percentage}%`;


            slider.style.left =
                `${percentage}%`;

        }


        function startDragging(event) {

            isDragging = true;

            try {
                comparison.setPointerCapture(
                    event.pointerId
                );
            } catch (error) {}

            moveSlider(event.clientX);

            event.preventDefault();

        }


        function drag(event) {

            if (!isDragging) return;

            moveSlider(event.clientX);

            event.preventDefault();

        }


        function stopDragging(event) {

            isDragging = false;

            try {

                comparison.releasePointerCapture(
                    event.pointerId
                );

            } catch (error) {}

        }


        comparison.addEventListener(
            "pointerdown",
            startDragging
        );


        comparison.addEventListener(
            "pointermove",
            drag
        );


        comparison.addEventListener(
            "pointerup",
            stopDragging
        );


        comparison.addEventListener(
            "pointercancel",
            stopDragging
        );


        comparison.addEventListener(
            "pointerleave",
            () => {

                if (isDragging) {
                    isDragging = false;
                }

            }
        );


        /* Prevent mobile scrolling */

        comparison.addEventListener(
            "touchstart",
            (event) => {
                event.preventDefault();
            },
            { passive: false }
        );

    });


    /* ========================================
       SHOW PROJECT
    ======================================== */

    function showComparison(index) {

        if (
            index < 0 ||
            index >= comparisons.length
        ) {
            return;
        }


        comparisons.forEach(
            (comparison, i) => {

                comparison.classList.toggle(
                    "active",
                    i === index
                );

            }
        );


        currentIndex = index;


        /* Update counter */

        if (number) {

            number.textContent =
                `${String(index + 1).padStart(2, "0")} / ${String(comparisons.length).padStart(2, "0")}`;

        }


        /* Reset slider */

        const activeComparison =
            comparisons[index];


        const before =
            activeComparison.querySelector(
                ".comparison-before"
            );


        const slider =
            activeComparison.querySelector(
                ".comparison-slider"
            );


        if (before && slider) {

            before.style.width = "50%";

            slider.style.left = "50%";

        }

    }


    /* ========================================
       PREVIOUS
    ======================================== */

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            () => {

                currentIndex--;

                if (currentIndex < 0) {

                    currentIndex =
                        comparisons.length - 1;

                }

                showComparison(currentIndex);

            }
        );

    }


    /* ========================================
       NEXT
    ======================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                currentIndex++;

                if (
                    currentIndex >=
                    comparisons.length
                ) {

                    currentIndex = 0;

                }

                showComparison(currentIndex);

            }
        );

    }


    /* ========================================
       CHECK IMAGES
    ======================================== */

    comparisons.forEach(
        (comparison, index) => {

            const images =
                comparison.querySelectorAll("img");


            images.forEach((img) => {

                img.addEventListener(
                    "error",
                    () => {

                        console.error(
                            `Before/After image error in project ${index + 1}:`,
                            img.src
                        );

                    }
                );

            });

        }
    );


    /* ========================================
       INITIAL STATE
    ======================================== */

    showComparison(0);

});