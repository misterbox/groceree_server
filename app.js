var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( 'data/groceree_db' );

var port = 8000
var url = require( 'url' );
var http = require( 'http' );
var qString = require( 'querystring' );
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
                var stmt = "SELECT rowid AS id, item FROM groceree";
                db.all( stmt, function( err, rows ) {
                    console.log( rows );

                    res.end( JSON.stringify( rows ) );
                } );

                break;
            }
        case "POST":
            if( action == 'addItem' ) {
                var body = "";

                req.on( 'data', function( chunk ) {
                    body += chunk
                } );

                req.on( 'end', function() {
                    // Parse POST data from request body
                    var postData = qString.parse( body );
                    //console.log( postData );

                    // Prepare the db statement
                    var stmt = db.prepare( "INSERT INTO groceree VALUES (?)" );

                    // Insert POST payload in to the db
                    // Only works for item=<value> pairs
                    for( var i = 0; i < postData.item.length; i++ ) {
                        stmt.run( postData.item[ i ] );
                    }

                    stmt.finalize();

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
