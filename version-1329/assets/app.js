(function () {
    var nav = document.querySelector('[data-nav]');
    var menuButton = document.querySelector('[data-menu-button]');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.image-frame img').forEach(function (img) {
        img.addEventListener('error', function () {
            var frame = img.closest('.image-frame');
            if (frame) {
                frame.classList.add('no-image');
            }
        });
        if (img.complete && img.naturalWidth === 0) {
            var frame = img.closest('.image-frame');
            if (frame) {
                frame.classList.add('no-image');
            }
        }
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var sortSelect = document.querySelector('[data-sort]');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty]');
    var cards = cardList ? Array.prototype.slice.call(cardList.querySelectorAll('[data-card]')) : [];
    var normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };
    var filterCards = function () {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var category = categorySelect ? categorySelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var cardCategory = card.getAttribute('data-category') || '';
            var matched = (!query || text.indexOf(query) !== -1) && (!category || cardCategory === category);
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };
    if (searchInput || categorySelect) {
        var params = new URLSearchParams(window.location.search);
        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }
        if (searchInput) {
            searchInput.addEventListener('input', filterCards);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', filterCards);
        }
        filterCards();
    }
    if (sortSelect && cardList && cards.length) {
        sortSelect.addEventListener('change', function () {
            var sorted = cards.slice();
            if (sortSelect.value === 'year-desc') {
                sorted.sort(function (a, b) {
                    return (b.getAttribute('data-search-text') || '').localeCompare(a.getAttribute('data-search-text') || '', 'zh-Hans');
                });
            }
            if (sortSelect.value === 'title-asc') {
                sorted.sort(function (a, b) {
                    var aTitle = a.querySelector('h3') ? a.querySelector('h3').textContent : '';
                    var bTitle = b.querySelector('h3') ? b.querySelector('h3').textContent : '';
                    return aTitle.localeCompare(bTitle, 'zh-Hans');
                });
            }
            sorted.forEach(function (card) {
                cardList.appendChild(card);
            });
            cards = sorted;
            filterCards();
        });
    }

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var stream = player.getAttribute('data-stream');
        var setMessage = function (text) {
            if (message) {
                message.textContent = text;
                message.hidden = !text;
            }
        };
        var start = function () {
            if (!video) {
                return;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('请再次点击播放');
                });
            }
        };
        if (video && stream) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setMessage('播放加载失败，请稍后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                setMessage('播放加载失败，请更换浏览器');
            }
        }
        if (playButton) {
            playButton.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
                setMessage('');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('playing');
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }
    }
}());
