(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = qs(".nav-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
        qsa(".mobile-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
            });
        });
    }

    function initHero() {
        var root = qs(".hero-carousel");
        if (!root) {
            return;
        }
        var slides = qsa(".hero-slide", root);
        var dots = qsa(".hero-dot", root);
        var prev = qs(".hero-control.prev", root);
        var next = qs(".hero-control.next", root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initCategoryFilters() {
        var grid = qs(".filter-grid");
        if (!grid) {
            return;
        }
        var input = qs(".filter-input");
        var region = qs(".filter-region");
        var type = qs(".filter-type");
        var cards = qsa(".movie-card", grid);

        function value(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = value(input);
            var regionValue = value(region);
            var typeValue = value(type);
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" ").toLowerCase();
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && (card.dataset.region || "").toLowerCase() !== regionValue) {
                    ok = false;
                }
                if (typeValue && (card.dataset.type || "").toLowerCase() !== typeValue) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
            });
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster\" href=\"./" + escapeHtml(movie.url) + "\">" +
            "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-gradient\"></span>" +
            "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<a class=\"movie-title\" href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var input = qs("#searchPageInput");
        var results = qs("#search-results");
        var status = qs("#search-status");
        if (!input || !results || !status || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;

        function render(query) {
            var keyword = query.trim().toLowerCase();
            var source = window.SITE_MOVIES;
            var filtered = keyword ? source.filter(function (movie) {
                return [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }) : source.slice(0, 48);
            var visible = filtered.slice(0, 120);
            status.textContent = keyword ? "搜索结果" : "热门内容";
            results.innerHTML = visible.length ? visible.map(cardHtml).join("") : "<p class=\"search-status\">没有找到匹配内容</p>";
        }

        input.addEventListener("input", function () {
            render(input.value);
        });
        render(q);
    }

    function initPlayer(source) {
        var video = qs("#movieVideo");
        var overlay = qs("#playerOverlay");
        if (!video || !source) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        function bindSource() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }
            video.src = source;
            playVideo();
        }

        if (overlay) {
            overlay.addEventListener("click", bindSource);
        }
        video.addEventListener("click", function () {
            if (!started) {
                bindSource();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initPlayer = initPlayer;

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHero();
        initCategoryFilters();
        initSearchPage();
    });
})();
