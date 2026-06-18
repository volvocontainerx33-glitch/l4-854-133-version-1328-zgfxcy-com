(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === active);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === active);
        });
      };
      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          show(idx);
        });
      });
      setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    filterBars.forEach(function (area) {
      var input = area.querySelector("[data-filter-keyword]");
      var year = area.querySelector("[data-filter-year]");
      var genre = area.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(area.getAttribute("data-filter-area")));
      var apply = function () {
        var key = normalize(input && input.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var okKey = !key || title.indexOf(key) >= 0 || cardGenre.indexOf(key) >= 0 || cardRegion.indexOf(key) >= 0;
          var okYear = !y || cardYear.indexOf(y) >= 0;
          var okGenre = !g || cardGenre.indexOf(g) >= 0;
          card.style.display = okKey && okYear && okGenre ? "" : "none";
        });
      };
      [input, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });

    var searchForm = document.querySelector("#fullSearchForm");
    var searchInput = document.querySelector("#fullSearchInput");
    var searchResults = document.querySelector("#searchResults");
    if (searchForm && searchInput && searchResults && typeof SITE_MOVIES !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      var render = function () {
        var key = normalize(searchInput.value);
        var data = SITE_MOVIES.filter(function (movie) {
          if (!key) {
            return true;
          }
          return normalize(movie.title + " " + movie.genre + " " + movie.region + " " + movie.tags).indexOf(key) >= 0;
        }).slice(0, 240);
        if (!data.length) {
          searchResults.innerHTML = '<div class="empty-note">没有找到匹配的影片。</div>';
          return;
        }
        searchResults.innerHTML = data.map(function (movie) {
          var tags = (movie.genre || "")
            .split(/[，,、/\s]+/)
            .filter(Boolean)
            .slice(0, 3)
            .map(function (tag) {
              return "<span>" + escapeHtml(tag) + "</span>";
            })
            .join("");
          var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
          return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
            '<a class="poster-link" href="./' + movie.file + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span></a>' +
            '<div class="card-body"><div class="card-tags">' + tags + '</div>' +
            '<h2><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>' +
            '<p class="meta">' + escapeHtml(meta) + '</p>' +
            '<p class="summary">' + escapeHtml(movie.desc) + '</p></div></article>';
        }).join("");
      };
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        if (searchInput.value.trim()) {
          url.searchParams.set("q", searchInput.value.trim());
        } else {
          url.searchParams.delete("q");
        }
        history.replaceState(null, "", url.toString());
        render();
      });
      searchInput.addEventListener("input", render);
      render();
    }
  });
})();
