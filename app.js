var port = 8000
var url = require( 'url' );
var http = require( 'http' );
var qString = require( 'querystring' );
var utils = require( './utils.js' );
var bunyan = require( 'bunyan' );

// Set up logging
function reqSerializer( req ) {
  return {
    client: req.connection.remoteAddress,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  }
}

function postItemsSerializer( postItems ) {
  return {
    items: postItems,
    length: postItems.length
  }
}

var log = new bunyan( {
  name: 'groceree',
  serializers: {
    req: reqSerializer,
    postItems: postItemsSerializer
  }
} );

// Array to hold all items and item names in memory
var allItems = new Array();
var allItemIDs = new Array();

var itemDataSource = require( './itemDataSource.js' );
var dataSource = new itemDataSource( allItems, allItemIDs );
dataSource.open();

log.info( "Server starting up on port %d", port );

http.createServer( function ( req, res ) {
    //console.log( "Items loaded in to memory: " + allItems.length );
    log.info( { req: req } );

    // Parse out the requested path
    // First level will be at urlParts[ 1 ]
    var urlParts = req.url.split( "/" );
    var action = urlParts[ 1 ];

    switch( req.method ) {
        case "GET":
            console.time( 'GET request' );
            if( action == 'list' ) {
                var curTimestamp = utils.getTimestamp();

                // Build response object as the current timestamp and all items
                var resObj = {
                    'timestamp': curTimestamp,
                    'items': allItems
                }

                var resString = JSON.stringify( resObj );

                var headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength( resString )
                };

                res.writeHead( 200, headers );
                res.end( resString );
            } else if( action == 'dump' ) {
                resString = JSON.stringify( allItems ) + JSON.stringify( allItemIDs );
                var headers = {
                    'Content-Type': 'text/plain',
                    'Content-Length':   Buffer.byteLength( resString )
                }

                res.writeHead( 200, headers );
                res.end( resString );
            }

            console.timeEnd( 'GET request' );
            break;
        case "POST":
            console.time( 'POST request' );

            // TODO: Gracefully handle malformed requests
            if( action == 'syncItems' ) {
                var body = "";

                req.on( 'data', function( chunk ) {
                    body += chunk
                } );

                req.on( 'end', function() {
                    // Parse POST data from request body
                    var postData = JSON.parse( body );
                    var postItems = postData.items;
                    var postTimestamp = postData.timestamp;

                    // If items were actually sent
                    //console.log( "POST request timestamp: " + postTimestamp ); 
                    //console.log( "postItems length: " + postItems.length );
                    //console.log( "postItems: " + JSON.stringify( postItems ) );
                    log.info( { postItems: postItems } );

                    // If the request payload was not empty
                    if( postItems.length ) {
                        /*
                        Pre-work:
                            Set all item names in postData to lower case
                            Sort the 'postData' array
                        */

                        postItems.forEach( function( itemObj, i, items ) {
                            itemObj.item = itemObj.item.toLowerCase();
                        } );

                        // Sort on item ID
                        postItems.sort( function( a, b ) {
                            if( a.id.localeCompare( b.id ) < 0 ) {
                                return -1;
                            } else if( a.id.localeCompare( b.id ) > 0 ) {
                                return 1;
                            }

                            return 0;
                        } );

                        var itemsUpdated = 0;
                        var itemsAdded = 0;
                        /*
                        For each itemObj sent in postData:
                        First check if itemObj is in our current list by ID
                        If not, add to list and insert in to db
                        If so, compare versions of the two objects
                            If our version is greater, discard postData object
                            If version of postData object is greater or equal, replace our object with it
                                Update this item's row in the db
                        */
                        // We're going to need an array of Item name strings to do this.
                        // Search allItemIDs for the occurrece of itemObj.id. The index
                        // returned will correspond to the index to use in the allItems array.
                        postItems.forEach( function( newItem, i, items ) {
                            // Check if itemObj is an Item we already have
                            index = allItemIDs.indexOf( newItem.id );
                            //console.log( "item: %s, index: %d", newItem.item, index );

                            // UPDATE ITEM
                            // If itemObj is found and of newer or equal version.
                            if( index >= 0 && newItem.version >= allItems[ index ].version ) {
                              // Don't keep older items of same version.
                              if( ( newItem.version == allItems[ index ].version ) && ( newItem.timestamp < allItems[ index ].timestamp ) ) {
                                return;
                              } else {
                                log.info( "Item updated: " + JSON.stringify( newItem ) );
                                dataSource.updateItem( newItem, index );
                                itemsUpdated++;
                              }
                            } else if( index < 0 ) { // INSERT NEW ITEM
                                log.info( "Item not found. Adding: ", JSON.stringify( newItem ) );
                                dataSource.addItem( newItem );
                                itemsAdded++;
                            }
                        } );
                    }

                    // Build an object with items that have changed since 'postTimestamp'
                    var resObj = dataSource.getItemsSince( postTimestamp, postItems );
                    var resString = JSON.stringify( resObj );

                    log.info( "Responding with %d items", resObj.items.length );
                    log.info( "%d items added. %d items updated", itemsAdded, itemsUpdated );

                    //console.log( "POST response timestamp: " + resObj.timestamp );

                    var headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength( resString )
                    };

                    res.writeHead( 200, headers );
                    res.write( resString );
                    res.end();

                    console.timeEnd( 'POST request' );
                } );
                break;
            }

            // If none of the above conditions are met, we will end up here.
            res.writeHead( 404, { 'Content-Type': 'text/plain' } );
            res.end( "Endpoint not found" );
        default:
            res.writeHead( 501, { 'Content-Type': 'text/plain' } );
            res.end( "Request not understood" );
    }
} ).listen( port, '0.0.0.0' );
