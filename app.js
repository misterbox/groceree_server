var port = 8000
var url = require( 'url' );
var http = require( 'http' );
var qString = require( 'querystring' );

var utils = require( './utils.js' );

// Array to hold all items and item names in memory
var allItems = new Array();
var allItemNames = new Array();

var itemDataSource = require( './itemDataSource.js' );
var dataSource = new itemDataSource( allItems, allItemNames );
dataSource.open();

http.createServer( function ( req, res ) {
    console.log( "Items loaded in to memory: " + allItems.length );

    // Parse out the requested path
    // First level will be at urlParts[ 1 ]
    var urlParts = req.url.split( "/" );
    var action = urlParts[ 1 ];
    res.writeHead( 200, { 'Content-Type': 'application/json' } );

    switch( req.method ) {
        case "GET":
            if( action == 'list' ) {
                var resObj = {
                    'timestamp': utils.getTimestamp(),
                    'items': allItems
                }
                res.end( JSON.stringify( resObj ) );
                break;
            }
        case "POST":
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
                    
                    /*
                     Pre-work:
                        Set all item names in postData to lower case
                        Sort the 'postData' array
                    */

                    console.log( "Lower-casing postData" );
                    postItems.forEach( function( itemObj, i, items ) {
                        itemObj.item = itemObj.item.toLowerCase();
                    } );

                    console.log( "Sorting postData" );
                    postItems.sort( function( a, b ) {
                        if( a.item.localeCompare( b.item ) < 0 ) {
                            return -1;
                        } else if( a.item.localeCompare( b.item ) > 0 ) {
                            return 1;
                        }

                        return 0;
                    } );

                     /*
                     For each itemObj sent in postData:
                      First check if itemObj is in our current list
                      If not, add to list and insert in to db
                      If so, compare timestamps of the two versions
                          If our timestamp is greater, discard postData version
                          If timestamp of postData version is greater, replace our version with it
                              Update this item's row in the db
                    */
                    // We're going to need an array of Item name strings to do this.
                    // Search allItemNames for the occurrece of itemObj.item. The index
                    // returned will correspond to the index to use in the allItems array.
                    postItems.forEach( function( newItem, i, items ) {
                        // Check if itemObj is an Item we already have
                        index = allItemNames.indexOf( newItem.item );
                        console.log( "item: %s, index: %d", newItem.item, index );

                        // UPDATE ITEM
                        // If itemObj is found
                        if( index >= 0 && newItem.timestamp > allItems[ index ].timestamp ) {
                            console.log( "item updated: " + JSON.stringify( allItems[ index ] ) );
                            dataSource.updateItem( newItem, index );
                        } else if( index < 0 ) { // INSERT NEW ITEM
                            console.log( "item %s not found. Adding.", newItem.item );
                            dataSource.addItem( newItem );
                        }
                    } );

                    // Build an object with items that have changed since 'postTimestamp'
                    resObj = dataSource.getItemsSince( postTimestamp );
                    console.log( "Response: " + JSON.stringify( resObj ) );
                    res.write( JSON.stringify( resObj ) );
                    res.writeHead( 200 );
                    res.end();
                } );

                break;
            }

            // If none of the above conditions are met, we will end up here.
            res.writeHead( 404, { 'Content-Type': 'text/plain' } );
            res.end( "Endpoint not found" );
            break;
        default:
            res.writeHead( 501, { 'Content-Type': 'text/plain' } );
            res.end( "Request not understood" );
    }
    
    //console.log( result );
    //var response = JSON.stringify( result );
    //res.end( response );

} ).listen( port, '0.0.0.0' );
console.log( "listening on " + port );
