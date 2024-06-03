(function(window, document) {
  var mpq = window.mpq = window.mpq || [];
  var isInitialized = false;

  // Internal method to handle queued method calls
  function processQueue() {
    while (mpq.length) {
      var args = mpq.shift();
      if (typeof args[0] === 'function') {
        args[0].apply(null, args.slice(1));
      }
    }
  }

  // Method to call the tracking functions
  mpq.callMethod = function() {
    var args = arguments;
    if (!isInitialized) {
      mpq.push(args);
    } else {
      if (args[0] === 'track') {
        mpq.track(args[1], args[2]);
      }
    }
  };

  // Initialization method
  mpq.init = function(pixelId, options) {
    mpq.pixelId = pixelId;
    mpq.debug = options && options.debug;
    mpq.endpoint = 'https://cdn.jsdelivr.net/gh/AzimKrishna/custom-pixel-sdk/test2.js';
    isInitialized = true;

    if (mpq.debug) {
      console.log('Custom pixel initialized with ID:', pixelId);
    }

    // Subscribe to Shopify analytics events
    analytics.subscribe('page_viewed', function(event) {
      mpq.track('PageView', { pageEventId: event.id, timeStamp: event.timestamp });
    });

    analytics.subscribe('product_viewed', function(event) {
      mpq.track('ViewContent', {
        content_ids: [event.data?.productVariant?.id],
        content_name: event.data?.productVariant?.title,
        currency: event.data?.productVariant?.price.currencyCode,
        value: event.data?.productVariant?.price.amount,
      });
    });

    analytics.subscribe('search_submitted', function(event) {
      mpq.track('Search', { search_string: event.searchResult.query });
    });

    analytics.subscribe('product_added_to_cart', function(event) {
      mpq.track('AddToCart', {
        content_ids: [event.data?.cartLine?.merchandise?.productVariant?.id],
        content_name: event.data?.cartLine?.merchandise?.productVariant?.title,
        currency: event.data?.cartLine?.merchandise?.productVariant?.price.currencyCode,
        value: event.data?.cartLine?.merchandise?.productVariant?.price.amount,
      });
    });

    analytics.subscribe('payment_info_submitted', function(event) {
      mpq.track('AddPaymentInfo', {});
    });

    analytics.subscribe('checkout_started', function(event) {
      mpq.track('InitiateCheckout', {});
    });

    analytics.subscribe('checkout_completed', function(event) {
      mpq.track('Purchase', {
        currency: event.data?.checkout?.currencyCode,
        value: event.data?.checkout?.totalPrice?.amount,
      });
    });

    // Process any queued calls
    processQueue();
  };

  // Tracking method
  mpq.track = function(event, data) {
    if (!mpq.pixelId) {
      console.error('Pixel not initialized. Call mpq.init() first.');
      return;
    }
    var payload = {
      pixelId: mpq.pixelId,
      event_name: event,
      event_data: data,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
    
    if (mpq.debug) {
      console.log('Event tracked:', payload);
    }

    mpq.sendData(payload);
  };

  // Send data method
  mpq.sendData = function(payload) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', mpq.endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
    } catch (error) {
      console.error('Error sending pixel data:', error);
    }
  };

})(window, document);
