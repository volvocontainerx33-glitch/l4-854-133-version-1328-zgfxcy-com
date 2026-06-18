(function () {
  function setupPlayer(box) {
    var button = box.querySelector("[data-play-button]");
    if (!button) {
      return;
    }

    var videoId = button.getAttribute("data-video-id");
    var video = document.getElementById(videoId);
    var stream = button.getAttribute("data-stream");
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function bindStream() {
      if (video.getAttribute("data-bound") === "yes") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.setAttribute("data-bound", "yes");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.setAttribute("data-bound", "yes");
        return;
      }

      video.src = stream;
      video.setAttribute("data-bound", "yes");
    }

    function play() {
      bindStream();
      button.classList.add("is-hidden");
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
