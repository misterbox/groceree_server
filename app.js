var port = 8000
var url = require( 'url' );
var http = require( 'http' );
var qString = require( 'querystring' );

var itemObj = require( './item.js' );

var utils = require( './utils.js' );

var TABLE_ITEM = "item";
var COLUMN_ID = "id";
var COLUMN_ITEM = "item";
var COLUMN_ISMARKED = "isMarked";
var COLUMN_ISDELETED = "isDeleted";
var COLUMN_TIMESTAMP = "timestamp";

// Array to hold all items and item names in memory
var allItems = new Array();
var allItemNames = new Array();

// Generic statement to get all columns of all rows
var stmtAllRows = "SELECT " + COLUMN_ID + ", " + COLUMN_ITEM
    + ", " + COLUMN_ISMARKED + ", " + COLUMN_ISDELETED + ", "
    + COLUMN_TIMESTAMP + " FROM " + TABLE_ITEM + " ORDER BY " + COLUMN_ITEM;

// Insert Item statement
var stmtInsItem = "INSERT INTO " + TABLE_ITEM + " (" + COLUMN_ITEM + ", " + COLUMN_ISMARKED
    + ", " + COLUMN_ISDELETED + ", " + COLUMN_TIMESTAMP + ") VALUES (?,?,?,?)"

// Select item by id statement
var stmtRowById = "SELECT " + COLUMN_ID + ", " + COLUMN_ITEM
    + ", " + COLUMN_ISMARKED + ", " + COLUMN_ISDELETED + ", "
    + COLUMN_TIMESTAMP + " FROM " + TABLE_ITEM + " WHERE " + COLUMN_ID + " = ?";

var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.cached.Database( 'data/groceree_db', function( err ) {

    if( !err ) {
        // Get all rows from Item database
        db.each( stmtAllRows, function( err, row ) {
            if( err ) {
                console.log( "Error retrieving items: " + err.message );
            } else {
                allItems.push( new itemObj( row.id, row.item, row.isMarked, row.isDeleted, row.timestamp ) );
                allItemNames.push( row.item );
            }
        } );
    } else {
        console.log( "Error opening the database: " + err.message );
    }
} );

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
                res.end( JSON.stringify( allItems ) );
                break;
            }
        case "POST":
            if( action == 'syncItems' ) {
                var body = "";

                req.on( 'data', function( chunk ) {
                    console.log( "chunk: " + chunk );
                    body += chunk
                } );

                req.on( 'end', function() {
                    // Parse POST data from request body
                    var postData = JSON.parse( body );

                    // Number of items sent
                    console.log( "body length: " + body.length );
                    
                    /*
                     Pre-work:
                        Set all item names in postData to lower case
                        Sort the 'postData' array
                    */

                    console.log( "Lower-casing postData" );
                    postData.forEach( function( itemObj, i, items ) {
                        itemObj.item = itemObj.item.toLowerCase();
                    } );

                    console.log( "Sorting postData" );
                    postData.sort( function( a, b ) {
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
                    postData.forEach( function( item, i, items ) {
                        // Check if itemObj is an Item we already have
                        index = allItemNames.indexOf( item.item );
                        console.log( "item: %s, index: %d", item.item, index );

                        // UPDATE ITEM
                        // If itemObj is found
                        if( index >= 0 ) {
                            allItems[ index ].isMarked = item.isMarked;
                            allItems[ index ].isDeleted = item.isDeleted;
                            allItems[ index ].timestamp = utils.getTimeStamp();

                            console.log( "item updated: " + JSON.stringify( allItems[ index ] ) );
                        } else { // INSERT NEW ITEM
                            console.log( "item %s not found. Adding.", item.item );
                            
                            // Insert items in to db, then immediately retrieve this row turning it into an Item object
                            db.run( stmtInsItem, item.item, item.isMarked, item.isDeleted, item.timestamp, function( err ) {
                                if( err ) {
                                    console.log( "Error inserting new item: " + err.message );
                                } else {
                                    var insertId = this.lastID;

                                    // Build Item object from row just inserted
                                    db.get( stmtRowById, insertId, function( err, row ) {
                                        if( err ) {
                                            console.log( "Error selecting row ID %d: %s", insertId, err.message );
                                        } else {
                                            allItems.push( new itemObj( row.id, row.item, row.isMarked, row.isDeleted, row.timestamp ) );
                                            allItemNames.push( row.item );
                                        }
                                    } );
                                }
                            } );
                        }
                    } );

                    // Prepare the db statement
                    //var stmt = db.prepare( "INSERT INTO groceree VALUES (?)" );

                    // Insert POST payload in to the db
                    // Only works for item=<value> pairs
                    /*
                    for( var i = 0; i < postData.item.length; i++ ) {
                        //stmt.run( postData.item[ i ] );
                    }
                    */

                    //body = JSON.parse( postData );

                    //stmt.finalize();

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
