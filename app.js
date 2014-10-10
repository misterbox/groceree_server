var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( ':memory:' );

//db.serialize( function() {
//    db.run( 'CREATE TABLE lorem (info TEXT)' );
//
//    var stmt = db.prepare( "INSERT INTO lorem VALUES (?)" );
//
//    for( var i = 0; i < 10; i++ ) {
//        stmt.run( "ipsum " + i );
//    }
//
//    stmt.finalize();
//
//    db.each( "SELECT rowid AS id, info FROM lorem", function( err, row ) {
//        console.log( row.id + ": " + row.info );
//    } );
//} );

var port = 8000
var url = require( 'url' );
var http = require( 'http' );
http.createServer( function ( req, res ) {

    // Parse out the requested path
    // First level will be at urlParts[ 1 ]
    var urlParts = req.url.split( "/" );
    var action = urlParts[ 1 ];
    res.writeHead( 200, { 'Content-Type': 'application/json' } );
    console.log( urlParts );

    switch( req.method ) {
        case "GET":
            if( action == 'list' )
                console.log( JSON.stringify( req.headers ) );
            break;
        case "POST":
            if( action == 'list' )
                console.log( req.headers );
            break;
        default:
            console.log( "unknown" );
    }
    
    var response = JSON.stringify( req.method );
    res.end( response );

} ).listen( port, '127.0.0.1' );
console.log( "listening on " + port );
