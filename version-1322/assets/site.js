(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var searchInput = document.querySelector('[data-search-input]');

  if (searchInput && queryFromUrl) {
    searchInput.value = queryFromUrl;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var empty = document.querySelector('[data-empty-result]');
    var keyword = normalize(searchInput ? searchInput.value : '');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var active = {};
    var visible = 0;

    selects.forEach(function (select) {
      active[select.getAttribute('data-filter-select')] = normalize(select.value);
    });

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      Object.keys(active).forEach(function (key) {
        if (!active[key]) {
          return;
        }

        var value = normalize(card.getAttribute('data-' + key));
        if (value.indexOf(active[key]) === -1) {
          matched = false;
        }
      });

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-filter-select]'), function (select) {
    select.addEventListener('change', applyFilters);
  });

  if (searchInput || document.querySelector('[data-filter-select]')) {
    applyFilters();
  }

  function initializePlayer() {
    var shell = document.querySelector('.player-shell');
    var video = document.querySelector('.player-video');
    var overlay = document.querySelector('.player-overlay');
    var hlsInstance = null;
    var loaded = false;
    var source = window.currentStreamUrl || '';

    if (!shell || !video || !source) {
      return;
    }

    function startPlayback() {
      shell.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadVideo() {
      if (loaded) {
        startPlayback();
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', startPlayback, { once: true });
        startPlayback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
        return;
      }

      video.src = source;
      startPlayback();
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        loadVideo();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }

      loadVideo();
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  initializePlayer();
})();
