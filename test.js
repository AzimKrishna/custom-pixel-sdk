(function(window, document) {
  var mpq = window.mpq = window.mpq || [];

  mpq.callMethod = function() {
    mpq.push(arguments);
  };

  mpq.init = function(pixelId) {
    mpq.pixelId = pixelId;
    mpq.queue = [];
    mpq.endpoint = "https://custom-pixel-sdk.onrender.com/pixel";

    function sendEvent(eventName, eventData) {
      var payload = {
        pixelId: mpq.pixelId,
        event_name: eventName,
        event_data: eventData,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      };

      fetch(mpq.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(console.error);
    }

    analytics.subscribe('page_viewed', function(event) {
      sendEvent('PageView', { pageEventId: event.id, timeStamp: event.timestamp });
    });

    analytics.subscribe('product_viewed', function(event) {
      sendEvent('ViewContent', {
        content_ids: [event.data?.productVariant?.id],
        content_name: event.data?.productVariant?.title,
        currency: event.data?.productVariant?.price.currencyCode,
        value: event.data?.productVariant?.price.amount,
      });
    });

    analytics.subscribe('search_submitted', function(event) {
      sendEvent('Search', { search_string: event.searchResult.query });
    });

    analytics.subscribe('product_added_to_cart', function(event) {
      sendEvent('AddToCart', {
        content_ids: [event.data?.cartLine?.merchandise?.productVariant?.id],
        content_name: event.data?.cartLine?.merchandise?.productVariant?.title,
        currency: event.data?.cartLine?.merchandise?.productVariant?.price?.currencyCode,
        value: event.data?.cartLine?.merchandise?.productVariant?.price.amount,
      });
    });

    analytics.subscribe('payment_info_submitted', function(event) {
      sendEvent('AddPaymentInfo', {});
    });

    analytics.subscribe('checkout_started', function(event) {
      sendEvent('InitiateCheckout', {});
    });

    analytics.subscribe('checkout_completed', function(event) {
      sendEvent('Purchase', {
        currency: event.data?.checkout?.currencyCode,
        value: event.data?.checkout?.totalPrice?.amount,
      });
    });
  };
})(window, document);
