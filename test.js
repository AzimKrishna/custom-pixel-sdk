(function (window, document) {
  var mpq = (window.mpq = window.mpq || []);

  mpq.callMethod = function () {
    mpq.push(arguments);
  };

  mpq.init = function (pixelId, options) {
    mpq.pixelId = pixelId;
    mpq.debug = options && options.debug;
    mpq.queue = [];
    mpq.batchInterval = (options && options.batchInterval) || 10000;

    if (mpq.debug) {
      console.log("Custom pixel initialized with ID:", pixelId);
    }

    if (options && options.batch) {
      setInterval(function () {
        if (mpq.queue.length > 0) {
          var batch = mpq.queue.splice(0, mpq.queue.length);
          mpq.sendBatch(batch);
        }
      }, mpq.batchInterval);
    }
  };

  mpq.track = function (event, data) {
    if (!mpq.pixelId) {
      console.error("Pixel not initialized. Call mpq.init() first.");
      return;
    }
    var payload = {
      pixelId: mpq.pixelId,
      event: event,
      data: data,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    if (mpq.debug) {
      console.log("Event tracked:", payload);
    }

    if (mpq.batch) {
      mpq.queue.push(payload);
    } else {
      mpq.sendData(payload);
    }
  };

  mpq.sendData = function (payload) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://custom-pixel-sdk.onrender.com/pixel", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(payload));
    } catch (error) {
      console.error("Error sending pixel data:", error);
    }
  };

  mpq.sendBatch = function (batch) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://custom-pixel-sdk.onrender.com/pixel", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(batch));
      if (mpq.debug) {
        console.log("Batch sent:", batch);
      }
    } catch (error) {
      console.error("Error sending batch pixel data:", error);
    }
  };
})(window, document);
