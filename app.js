var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( 'data/groceree_db' );

var port = 8000
var url = require( 'url' );
var http = require( 'http' );
http.createServer( function ( req, res ) {

    // Parse out the requested path
    // First level will be at urlParts[ 1 ]
    var urlParts = req.url.split( "/" );
    var action = urlParts[ 1 ];
    res.writeHead( 200, { 'Content-Type': 'application/json' } );
    var result;

    switch( req.method ) {
        case "GET":
            if( action == 'list' )
                //console.log( JSON.stringify( req.headers ) );

                // Get rows from our database
                var stmt = "SELECT rowid AS id, item FROM groceree";
                db.all( stmt, function( err, rows ) {
                    //console.log( rows );

                    res.end( JSON.stringify( rows ) );
                } );
            break;
        case "POST":
            if( action == 'list' )
                console.log( req.headers );
            break;
        default:
            console.log( "unknown" );
    }
    
    //console.log( result );
    //var response = JSON.stringify( result );
    //res.end( response );

} ).listen( port, '0.0.0.0' );
console.log( "listening on " + port );
