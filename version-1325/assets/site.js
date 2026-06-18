(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector("#mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      var play = function () {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(index);
          play();
        });
      });
      if (slides.length > 1) {
        play();
      }
    }

    var searchGrid = document.querySelector("[data-search-grid]");
    if (searchGrid) {
      var params = new URLSearchParams(window.location.search);
      var input = document.querySelector("#movie-search");
      var category = document.querySelector("#category-filter");
      var year = document.querySelector("#year-filter");
      var empty = document.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(searchGrid.querySelectorAll("[data-movie-card]"));
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      var filter = function () {
        var term = normalize(input && input.value);
        var cat = normalize(category && category.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
          var cardCat = normalize(card.getAttribute("data-category"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = (!term || haystack.indexOf(term) !== -1) && (!cat || cardCat === cat) && (!yearValue || cardYear.indexOf(yearValue) !== -1);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      [input, category, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", filter);
          field.addEventListener("change", filter);
        }
      });
      filter();
    }

    document.querySelectorAll("[data-filter-strip]").forEach(function (strip) {
      var grid = strip.parentElement.querySelector("[data-sort-grid]");
      if (!grid) {
        return;
      }
      var input = strip.querySelector("[data-local-search]");
      var buttons = Array.prototype.slice.call(strip.querySelectorAll("[data-sort]"));
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var filterLocal = function () {
        var term = normalize(input && input.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
          card.style.display = !term || haystack.indexOf(term) !== -1 ? "" : "none";
        });
      };
      var sortCards = function (mode) {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-sort") === mode);
        });
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
          }
          var ay = parseInt(a.getAttribute("data-year"), 10) || 0;
          var by = parseInt(b.getAttribute("data-year"), 10) || 0;
          return by - ay;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      };
      if (input) {
        input.addEventListener("input", filterLocal);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          sortCards(button.getAttribute("data-sort"));
        });
      });
    });
  });
})();
