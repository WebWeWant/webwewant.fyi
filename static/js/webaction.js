(function () {
  'use strict';

  var loadingClassRegexp = /(^|\s)indieconfig-loading(\s|$)/;

  var doTheAction = function (indieConfig) {
    var href, action, anchors;

    // Don't block the tag anymore as the queued action is now handled
    this.className = this.className.replace(loadingClassRegexp, ' ');

    // Pick the correct endpoint for the correct action
    action = this.getAttribute('do');

    if ((action === 'reply' || action === 'post') && indieConfig.reply) {
      href = indieConfig.reply;
    } else if (action === 'like' && indieConfig.like) {
      href = indieConfig.like;
    } else if (action === 'repost' && indieConfig.repost) {
      href = indieConfig.repost;
    } else if (action === 'tip' && indieConfig.tip) {
      href = indieConfig.tip;
    }

    // If no endpoint is found, try the URL of the first a-tag within it
    if (!href) {
      anchors = this.getElementsByTagName('a');
      if (anchors[0]) {
        href = anchors[0].href;
      }
    }

    // We have found an endpoint!
    if (href) {
      //Resolve a relative target
      var target = document.createElement('a');
      target.href = this.getAttribute('with');
      target = target.href;

      // Insert the target into the endpoint
      href = href.replace('{url}', encodeURIComponent(target || window.location.href));

      // And redirect to it
      window.location = href;
    }
  };

  // Event handler for a click on an indie-action tag
  var handleTheAction = function (e) {
    // Prevent the default of eg. any a-tag fallback within the indie-action tag
    e.preventDefault();

    // Make sure this tag hasn't already been queued for the indieconfig-load
    if (window.loadIndieConfig && !loadingClassRegexp.test(this.className)) {
      this.className += ' indieconfig-loading';
      // Set "doTheAction" to be called when the indie-config has been loaded
      window.loadIndieConfig(doTheAction.bind(this));
    }
  };

  // Used to activate all webactions in a context
  var activateWebActionElements = function (context) {
    var actions = context.querySelectorAll('indie-action'),
      i,
      length = actions.length;

    for (i = 0; i < length; i++) {
      actions[i].addEventListener('click', handleTheAction);
    }
  };

  window.activateWebActionElements = activateWebActionElements;

  // Once the page is loaded add click event listeners to all indie-action tags
  if (document.body) {
    activateWebActionElements(document);
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      activateWebActionElements(document);
    });
  }
}());