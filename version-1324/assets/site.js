(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const nav = document.getElementById("mainNav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", nav.classList.contains("is-open"));
        });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            const url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
            window.location.href = url;
        });
    });

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const next = hero.querySelector("[data-hero-next]");
        const prev = hero.querySelector("[data-hero-prev]");
        let index = 0;
        let timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function run() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5600);
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                run();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                run();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
                run();
            });
        });

        activate(0);
        run();
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
        const searchInput = form.querySelector("[data-filter-search]");
        const genreSelect = form.querySelector("[data-filter-genre]");
        const yearSelect = form.querySelector("[data-filter-year]");
        const grid = document.querySelector("[data-card-grid]");
        const empty = document.querySelector("[data-empty-state]");
        const cards = grid ? Array.from(grid.querySelectorAll(".movie-card")) : [];
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            const query = normalize(searchInput ? searchInput.value : "");
            const genre = normalize(genreSelect ? genreSelect.value : "");
            const year = normalize(yearSelect ? yearSelect.value : "");
            let shown = 0;

            cards.forEach(function (card) {
                const text = normalize(card.dataset.search);
                const cardGenre = normalize(card.dataset.genre);
                const cardYear = normalize(card.dataset.year);
                const matched = (!query || text.indexOf(query) !== -1) && (!genre || cardGenre.indexOf(genre) !== -1) && (!year || cardYear === year);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        [searchInput, genreSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    });
})();
