(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var q = panel.querySelector('[name="q"]');
    var region = panel.querySelector('[name="region"]');
    var year = panel.querySelector('[name="year"]');
    var genre = panel.querySelector('[name="genre"]');
    var note = document.querySelector('[data-filter-note]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && q) {
      q.value = initial;
    }

    function value(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value(q);
      var regionValue = value(region);
      var yearValue = value(year);
      var genreValue = value(genre);
      var filtered = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (regionValue && card.getAttribute('data-region').toLowerCase() !== regionValue) {
          ok = false;
        }
        if (yearValue && card.getAttribute('data-year').toLowerCase() !== yearValue) {
          ok = false;
        }
        if (genreValue && card.getAttribute('data-genre').toLowerCase().indexOf(genreValue) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          filtered += 1;
        }
      });
      if (note) {
        if (keyword || regionValue || yearValue || genreValue) {
          note.textContent = '找到 ' + filtered + ' 部相关影片';
        } else {
          note.textContent = '输入关键词或选择筛选条件，快速定位想看的影片';
        }
      }
    }

    panel.addEventListener('input', apply);
    panel.addEventListener('change', apply);
    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function bindVideo(video, src) {
    if (!video || !src) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = src;
    }
  }

  function initPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-button]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-target');
        var video = document.getElementById(target);
        var src = button.getAttribute('data-src');
        bindVideo(video, src);
        button.classList.add('hidden');
        if (video) {
          video.controls = true;
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.controls = true;
            });
          }
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initPlayers();
  });
})();
