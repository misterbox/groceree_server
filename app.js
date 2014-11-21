var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( 'data/groceree_db' );

var port = 8000
var url = require( 'url' );
var http = require( 'http' );
var qString = require( 'querystring' );

var TABLE_ITEM = "item";
var COLUMN_ID = "id";
var COLUMN_ITEM = "item";
var COLUMN_ISMARKED = "isMarked";
var COLUMN_ISDELETED = "isDeleted";
var COLUMN_TIMESTAMP = "timestamp";

http.createServer( function ( req, res ) {

    // Parse out the requested path
    // First level will be at urlParts[ 1 ]
    var urlParts = req.url.split( "/" );
    var action = urlParts[ 1 ];
    res.writeHead( 200, { 'Content-Type': 'application/json' } );

    switch( req.method ) {
        case "GET":
            if( action == 'list' ) {
                //console.log( JSON.stringify( req.headers ) );

                // Get rows from our database
                var stmt = "SELECT " + COLUMN_ID + ", " + COLUMN_ITEM
                    + ", " + COLUMN_ISMARKED + ", " + COLUMN_ISDELETED + ", "
                    + COLUMN_TIMESTAMP + " FROM " + TABLE_ITEM;

                db.all( stmt, function( err, rows ) {
                    console.log( rows );

                    res.end( JSON.stringify( rows ) );
                } );

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
                    
                    // For each item sent in postData:
                    //  First check if item is in our current list
                    //  If not, add to list and insert in to db
                    //  If so, compare timestamps of the two versions
                    //      If our timestamp is greater, discard postData version
                    //      If payload timestamp is greater, replace our version with it
                    //          Update this item's row in the db
                    postData.forEach( function( item, i, items ) {
                        console.log( "postData[" + i + "].item: " + item.item );
                    } );

                    console.log( postData.length );
                    //console.log( postData );

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
