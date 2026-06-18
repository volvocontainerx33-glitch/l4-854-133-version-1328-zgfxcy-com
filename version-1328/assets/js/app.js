(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-target") || form.getAttribute("action") || "search.html";

        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var activeIndex = 0;
      var timer = null;

      function activate(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          activate(activeIndex + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          activate(dotIndex);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var keywordInput = document.querySelector("[data-filter-input]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");

    if (keywordInput || regionSelect || yearSelect) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (keywordInput && query) {
        keywordInput.value = query;
      }

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.textContent
        ].join(" "));
      }

      function applyFilters() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");

        cards.forEach(function (card) {
          var text = cardText(card);
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      [keywordInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
