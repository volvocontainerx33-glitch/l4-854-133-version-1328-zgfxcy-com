
(function () {
  function selectAll(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll(hero, '[data-hero-slide]');
    var dots = selectAll(hero, '[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(index);
        restart();
      });
    });

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    selectAll(document, '[data-tools]').forEach(function (tools) {
      var section = tools.parentElement;
      var cards = selectAll(section, '[data-card]');
      var input = tools.querySelector('[data-search-input]');
      var chips = selectAll(tools, '[data-filter]');
      var empty = section.querySelector('[data-empty-state]');
      var activeFilter = 'all';

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var queryMatch = !query || text.indexOf(query) !== -1;
          var filterMatch = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
          var show = queryMatch && filterMatch;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          activeFilter = chip.getAttribute('data-filter') || 'all';
          apply();
        });
      });
      apply();
    });
  }

  function initPlayers() {
    selectAll(document, '.player-shell[data-stream]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      var source = shell.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      if (!video || !button || !source) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              shell.classList.add('has-error');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          shell.classList.add('has-error');
        }
      }

      function play() {
        attach();
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {
            shell.classList.add('has-error');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
