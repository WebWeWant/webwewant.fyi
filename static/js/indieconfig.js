window.loadIndieConfig = (function () {
  'use strict';

  // Indie-Config Loading script
  // by Pelle Wessman, voxpelli.com
  // MIT-licensed
  // http://indiewebcamp.com/indie-config

  var config, configFrame, configTimeout,
    callbacks = [],
    handleConfig, parseConfig;

  // When the configuration has been loaded – deregister all loading mechanics and call all callbacks
  handleConfig = function () {
    config = config || {};

    configFrame.parentNode.removeChild(configFrame);
    configFrame = undefined;

    window.removeEventListener('message', parseConfig);

    clearTimeout(configTimeout);

    while (callbacks[0]) {
      callbacks.shift()(config);
    }
  };

  // When we receive a message, check if the source is right and try to parse it
  parseConfig = function (message) {
    var correctSource = (configFrame && message.source === configFrame.contentWindow);

    if (correctSource && config === undefined) {
      try {
        config = JSON.parse(message.data);
      } catch (ignore) {}

      handleConfig();
    }
  };

  if (!window.navigator.registerProtocolHandler) {
    config = {};
  }

  return function (callback) {
    // If the config is already loaded, call callback right away
    if (config) {
      callback(config);
      return;
    }

    // Otherwise add the callback to the queue
    callbacks.push(callback);

    // Are we already trying to load the Indie-Config, then wait
    if (configFrame) {
      return;
    }

    // Create the iframe that will load the Indie-Config
    configFrame = document.createElement('iframe');
    configFrame.src = 'web+action:load';
    document.getElementsByTagName('body')[0].appendChild(configFrame);
    configFrame.style.display = 'none';

    // Listen for messages so we will catch the Indie-Config message
    window.addEventListener('message', parseConfig);

    // And if no such Indie-Config message has been loaded in a while, abort the loading
    configTimeout = setTimeout(handleConfig, 3000);
  };
}());