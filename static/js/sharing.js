/* ! Sharing popup */
(function( window, document ){
  'use strict';

  // Filter older browsers
  if ( ! ( 'querySelectorAll' in document ) )
  {
      return;
  }

  // gather the links container
  var share_links = document.querySelectorAll('.share, .button--vote'),
      watcher_count = share_links.length,
      w_threshold = 540,
      h_threshold = 340;
  
  // event handler
  function click(e)
  {
      var target = e.target;

      // target must be an anchor and the inner width threshold must be met
      if ( ( target.matches( 'a *' ) || target.matches( '.button' ) ) &&
           window.innerWidth >= w_threshold &&
           window.innerHeight >= h_threshold )
      {
          // prevent the default link click
          e.preventDefault();

          while ( target.nodeName.toLowerCase() != 'a' )
          {
            target = target.parentNode;
          }

          // open the link in a popup
          window.open( target.href, 'share-this', 'height=300,width=500,status=no,toolbar=no' );

          // return
          return false;
      }
  }

  // watcher
  while ( watcher_count-- )
  {
    share_links[watcher_count].addEventListener( 'click', click, false );
  }

}( this, this.document ));