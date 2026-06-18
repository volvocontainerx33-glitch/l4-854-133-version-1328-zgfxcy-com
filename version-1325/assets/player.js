(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var url = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    var existing = document.querySelector("script[src='" + url + "']");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      existing.addEventListener("error", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.addEventListener("load", callback, { once: true });
    script.addEventListener("error", callback, { once: true });
    document.head.appendChild(script);
  }

  function bindPlayer(shell) {
    var video = shell.querySelector("video");
    var layer = shell.querySelector(".play-layer");
    var stream = shell.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;
    if (!video || !stream) {
      return;
    }

    function attach(done) {
      if (attached) {
        done();
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        done();
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            done();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = stream;
              done();
            }
          });
        } else {
          video.src = stream;
          done();
        }
      });
    }

    function start() {
      shell.classList.add("is-loading");
      attach(function () {
        shell.classList.add("is-playing");
        shell.classList.remove("is-loading");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-loading");
          });
        }
      });
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!shell.classList.contains("is-playing")) {
        start();
      }
    });
  }

  ready(function () {
    document.querySelectorAll(".player-shell").forEach(bindPlayer);
  });
})();
