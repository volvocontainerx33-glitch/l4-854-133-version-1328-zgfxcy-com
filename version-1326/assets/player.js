(function () {
  window.initMoviePlayer = function (videoSrc) {
    var video = document.querySelector("#movieVideo");
    var overlay = document.querySelector("#playOverlay");
    if (!video || !overlay || !videoSrc) {
      return;
    }
    var prepared = false;
    var prepare = function () {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
      } else if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else {
        video.src = videoSrc;
      }
    };
    var start = function () {
      prepare();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
