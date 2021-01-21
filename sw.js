const version = "v2:", // be sure to update

      // Stuff to load on install
      offline_page = "/offline/",
      preinstall = [
        // images
        "/static/img/favicon-16x16.png",
        "/static/img/favicon-32x32.png",
        "/static/img/favicon-96x96.png",
        // CSS
        // JavaScript
        // Offline
        offline_page
      ],

      // caches
      sw_caches = {
        static: {
          name: `${version}static`
        },
        pages: {
          name: `${version}pages`,
          limit: 5
        },
        other: {
          name: `${version}other`,
          limit: 5
        }
      },

      // Never cache
      ignore = [
        'thanks',
        'submitted',
        'chrome-extension'
      ],

      // How to decide what gets cached and
      // what might not be left out
      high_priority = [
        /webwewant\.fyi/,
        /fonts\.googleapis\.com/
      ],

      fetch_config = {
        images: {
          mode: 'no-cors'
        }
      };

let slow_connection = false,
save_data;

if ( 'connection' in navigator )
{
  slow_connection = ( navigator.connection.downlink < .5 );
  save_data = navigator.connection.saveData;
}
self.addEventListener( "activate", event => {
  
  // console.log('WORKER: activate event in progress.');
  
  // clean up stale caches
  event.waitUntil(
    caches.keys()
      .then( keys => {
        return Promise.all(
          keys
            .filter( key => {
              return ! key.startsWith( version );
            })
            .map( key => {
              return caches.delete( key );
            })
        ); // end promise
      }) // end then
  ); // end event

  
});

addEventListener("message", messageEvent => {
  if (messageEvent.data == "clean up")
  {
    for ( let key in sw_caches )
    {
      if ( sw_caches[key].limit != undefined )
      {
        trimCache( sw_caches[key].name, sw_caches[key].limit );
      }
    }
  }
});

function trimCache( cache_name, limit )
{
  caches.open( cache_name )
    .then( cache => {
      cache.keys()
        .then( items => {
          if ( items.length > limit ) {
            cache.delete( items[0] )
              .then(
                trimCache( cache_name, limit)
              ); // end delete
          } // end if
        }); // end keys
    }); // end open
}
self.addEventListener( "fetch", event => {
  
  // console.log( "WORKER: fetch event in progress." );
  
  const request = event.request,
        url = request.url;
  
  if ( request.method !== "GET" || shouldBeIgnored( url ) )
  {
    // console.log( "ignoring " + url );
    return;
  }

  if ( save_data == undefined )
  {
    save_data = request.headers.get("save-data");
  }

  // console.log(request.url, request.headers);

  // JSON & such
  if ( /\.json$/.test( url ) ||
       /jsonp\=/.test( url ) )
  {
    event.respondWith(
      caches.match( request )
        .then( cached_result => {
          // cached first
          if ( cached_result )
          {
            // Update the cache in the background, but only if we’re not trying to save data
            if ( ! save_data && ! slow_connection )
            {
              event.waitUntil(
                refreshCachedCopy( request, sw_caches.other.name )
              );
            }
            return cached_result;
          }
          // fallback to network
          return fetch( request )
              .then( response => {
                const copy = response.clone();
                event.waitUntil(
                  saveToCache( sw_caches.other.name, request, copy )
                );
                return response;
              })
              // fallback to offline page
              .catch(
                respondWithServerOffline
              );
        })
    );
  }

  // JavaScript
  else if ( /\.js$/.test( url ) && isHighPriority( url ) )
  {
    event.respondWith(
      caches.match( request )
      .then( cached_result => {
        // cached first
        if ( cached_result )
        {
          // Update the cache in the background, but only if we’re not trying to save data
          if ( ! save_data && ! slow_connection )
          {
            event.waitUntil(
              refreshCachedCopy( request, sw_caches.static.name )
            );
          }
          return cached_result;
        }
        // fallback to network
        return fetch( request )
            .then( response => {
              const copy = response.clone();
              event.waitUntil(
                saveToCache( sw_caches.static.name, request, copy )
              );
              return response;
            })
            // fallback to offline page
            .catch(
              respondWithServerOffline
            );
      })
    );
  }
  
  // Wants
  else if ( /wants/.test( url ) )
  {
    event.respondWith(
      fetch( request )
        .then( response => {
          const copy = response.clone();
          event.waitUntil(
            saveToCache( sw_caches.pages.name, request, copy )
          ); // end waitUntil
          return response;
        })
        // fallback to offline page
        .catch(
          caches.match( request )
            .then( cached_result => {
              return cached_result;
            })
            .catch(
              respondWithOfflinePage
            )
        )
    );
  }

  // Other HTML
  else if ( ( request.headers.get("Accept") &&
              request.headers.get("Accept").includes("text/html") ) ||
            requestIsLikelyForHTML( url ) )
  {
    event.respondWith(
      // check the cache first
      caches.match( request )
        .then( cached_result => {
          if ( cached_result )
          {
            // Update the cache in the background, but only if we’re not trying to save data
            if ( ! save_data && ! slow_connection )
            {
              event.waitUntil(
                refreshCachedCopy( request, sw_caches.pages.name )
              );
            }
            return cached_result;
          }
          // fallback to network, but cache the result
          return fetch( request )
            .then( response => {
              const copy = response.clone();
              event.waitUntil(
                saveToCache( sw_caches.pages.name, request, copy )
              ); // end waitUntil
              return response;
            })
            // fallback to offline page
            .catch(
              respondWithOfflinePage
            );
        })
    );
  }

  // images - cache first, then determine if we should request form the network & cache, fallbacks
  else if ( request.headers.get("Accept").includes("image") )
  {
    event.respondWith(
      // check the cache first
      caches.match( request )
        .then( cached_result => {
          if ( cached_result )
          {
            return cached_result;
          }

          // high priority imagery
          if ( isHighPriority( url ) )
          {
            return fetch( request, fetch_config.images )
              .then( response => {
                const copy = response.clone();
                event.waitUntil(
                  saveToCache( sw_caches.static.name, request, copy )
                ); // end waitUntil
                return response;
              });
          }
          // all others
          else
          {
            // console.log('other images', url);
            // save data?
            if ( save_data || slow_connection )
            {
              return new Response( "", {
                status: 408,
                statusText: "This request was ignored to save data."
              });
            }

            // normal operation
            else
            {
              // console.log('fetching');
              return fetch( request, fetch_config.images )
                .then( response => {
                  const copy = response.clone();
                  event.waitUntil(
                    saveToCache( sw_caches.static.name, request, copy )
                  );
                  return response;
                });
            }
          }
        })
    );
  }

  // everything else - cache first, then network
  else
  {
    event.respondWith(
      // check the cache first
      caches.match( request )
        .then( cached_result => {
          if ( cached_result )
          {
            return cached_result;
          }

          // save data?
          if ( save_data || slow_connection )
          {
            return new Response( "", {
              status: 408,
              statusText: "This request was ignored to save data."
            });
          }
          
          // normal operation
          else
          {
            return fetch( request )
              .then( response => {
                const copy = response.clone();
                if ( isHighPriority( url ) )
                {
                  event.waitUntil(
                    saveToCache( sw_caches.static.name, request, copy )
                  );
                }
                else
                {
                  event.waitUntil(
                    saveToCache( sw_caches.other.name, request, copy )
                  );
                }
                return response;
              })
              // fallback to offline image
              .catch(
                respondWithServerOffline
              );
          }
        })
    );
  }

});

self.addEventListener( "install", function( event ){

  // console.log( "WORKER: install event in progress." );

  // immediately take over
  self.skipWaiting();

  event.waitUntil(
    caches.open( sw_caches.static.name )
      .then(function( cache ){
        return cache.addAll( preinstall );
      })
  );

});

function saveToCache( cache_name, request, response )
{
  // console.log( 'saving a copy of', request.url );
  caches.open( cache_name )
    .then( cache => {
      return cache.put( request, response );
    });
}

function refreshCachedCopy( the_request, cache_name )
{
  fetch( the_request )
    .then( the_response => {
      caches.open( cache_name )
        .then( the_cache => {
          return the_cache.put( the_request, the_response );
        });
    });
}

function shouldBeIgnored( url )
{
  let i = ignore.length;
  while( i-- )
  {
    if ( url.indexOf( ignore[i] ) > -1 )
    {
      // console.log( "found", ignore[i], 'in', url );
      return true;
    }
  }
  return false;
}

function isHighPriority( url )
{
  let i = high_priority.length;
  while ( i-- )
  {
    if ( high_priority[i].test( url ) )
    {
      return true;
    }
  }
  return false;
}

function respondWithOfflinePage()
{
  return caches.match( offline_page )
           .catch(
             respondWithServerOffline
           );
}

function respondWithServerOffline(){
  return new Response( "", {
    status: 408,
    statusText: "The server appears to be offline."
  });
}

function requestIsLikelyForHTML( url )
{
  const final_segment = url.split("/").pop();
  if ( final_segment == "" ||
       /.+\.html$/.test( final_segment ) ||
       ! (/\..+$/.test( final_segment ) ) )
  {
    return true;
  }
  return false;
}