(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function activate(next) {
      index = next;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5600);
    }
  }

  function initSearchPage() {
    var list = document.querySelector("[data-search-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var status = document.getElementById("search-status");

    if (input) {
      input.value = q;
      input.addEventListener("input", function () {
        filter(input.value.trim());
      });
    }

    function filter(value) {
      var keyword = value.toLowerCase();
      var matched = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var show = !keyword || haystack.indexOf(keyword) !== -1;
        card.hidden = !show;
        if (show) {
          matched += 1;
        }
      });
      if (status) {
        status.textContent = matched ? "已显示相关影片" : "没有找到匹配影片";
      }
    }

    filter(q);
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-hls");
    var loaded = false;
    var instance = null;

    function loadStream() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      loadStream();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    player.addEventListener("click", function (event) {
      if (event.target.closest("button") || event.target.closest("a")) {
        return;
      }
      start();
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });

    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchPage();
    initPlayer();
  });
})();
