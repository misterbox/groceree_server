// Helper to initialize the database with test data
var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( 'data/groceree_db' );

db.serialize( function() {
    db.run( 'CREATE TABLE groceree (item TEXT)' );

    var stmt = db.prepare( "INSERT INTO groceree VALUES (?)" );

    for( var i = 0; i < 10; i++ ) {
        stmt.run( "item " + i );
    }

    stmt.finalize();

    //db.each( "SELECT rowid AS id, info FROM lorem", function( err, row ) {
        //console.log( row.id + ": " + row.info );
    //} );
} );
