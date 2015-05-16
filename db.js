// Helper to initialize the database with test data
var sqlite3 = require( 'sqlite3' ).verbose();
var db = new sqlite3.Database( 'data/groceree_db' );

db.serialize( function() {
    var TABLE_ITEM = "item";
    var COLUMN_ID = "id";
    var COLUMN_ITEM = "item";
    var COLUMN_ISMARKED = "isMarked";
    var COLUMN_ISDELETED = "isDeleted";
    var COLUMN_TIMESTAMP = "timestamp";
    var COLUMN_VERSION = "version";

    db.run( "CREATE TABLE IF NOT EXISTS " + TABLE_ITEM
        + "(" + COLUMN_ID + " text unique primary key, "
        + COLUMN_ITEM + " text unique not null, "
        + COLUMN_ISDELETED + " boolean not null default 0, "    // default to false
        + COLUMN_ISMARKED + " boolean not null default 0, "     // default to false
        + COLUMN_TIMESTAMP + " datetime default (strftime('%s', 'now') ), "
        + COLUMN_VERSION + " integer not null default 0 );" )

    var stmt = db.prepare( "INSERT INTO " + TABLE_ITEM + " (" + COLUMN_ITEM + ") VALUES (?)" );

//    for( var i = 10; i >= 0; i-- ) {
//        stmt.run( "item " + i );
//    }
//
//    stmt.finalize();
} );
