var sqlite3 = require( 'sqlite3' ).verbose();
var itemObj = require( './item.js' );
var utils = require( './utils.js' );

var TABLE_ITEM = "item";
var ROW_ID = "rowid";
var COLUMN_ID = "id";
var COLUMN_ITEM = "item";
var COLUMN_ISMARKED = "isMarked";
var COLUMN_ISDELETED = "isDeleted";
var COLUMN_TIMESTAMP = "timestamp";
var COLUMN_VERSION = "version";

// Generic statement to get all columns of all rows
var stmtAllRows = "SELECT " + COLUMN_ID + ", " + COLUMN_ITEM
    + ", " + COLUMN_ISMARKED + ", " + COLUMN_ISDELETED + ", "
    + COLUMN_TIMESTAMP + ", " + COLUMN_VERSION + " FROM " + TABLE_ITEM
    + " ORDER BY " + COLUMN_ITEM;

// Insert Item statement
var stmtInsItem = "INSERT INTO " + TABLE_ITEM + " (" + COLUMN_ID + ", " + COLUMN_ITEM + ", " + COLUMN_ISMARKED 
    + ", " + COLUMN_ISDELETED + ", " + COLUMN_TIMESTAMP + ", " + COLUMN_VERSION + ") VALUES (?,?,?,?,?,?)";

// Select item by id statement
var stmtRowById = "SELECT " + COLUMN_ID + ", " + COLUMN_ITEM
    + ", " + COLUMN_ISMARKED + ", " + COLUMN_ISDELETED + ", "
    + COLUMN_TIMESTAMP + ", " + COLUMN_VERSION + " FROM " + TABLE_ITEM
    + " WHERE " + ROW_ID + " = ?";

// Update item by id
var stmtUpdItem = "UPDATE " + TABLE_ITEM + " SET " + COLUMN_ITEM + " = ?, " + COLUMN_ISMARKED + " = ?, "
    + COLUMN_ISDELETED + " = ?, " + COLUMN_TIMESTAMP + " = ?, " + COLUMN_VERSION + " =? WHERE " + COLUMN_ID + " = ?";

// Select rows by timestamp
var stmtRowByTime = "SELECT * FROM " + TABLE_ITEM + " WHERE " + COLUMN_TIMESTAMP
    + " > ?";

// Array to hold all items and item names in memory
var allItems; // All item objects
var allItemIDs; // Array of strictly IDs

var db;

var itemDataSource = function( itemsAry, itemIDAry ) {
    allItems = itemsAry;
    allItemIDs = itemIDAry;
};

itemDataSource.prototype.open = function() {
    db = new sqlite3.cached.Database( 'data/groceree_db', function( err ) {
        if( !err ) {
            // Get all rows from Item database
            db.each( stmtAllRows, function( err, row ) {
                if( err ) {
                    console.log( "Error retrieving items: " + err.message );
                } else {
                    allItems.push( new itemObj( row.id, row.item, row.isMarked, row.isDeleted, row.timestamp, row.version ) );
                    allItemIDs.push( row.id );
                }
            } );
        } else {
            console.log( "Error opening the database: " + err.message );
        }
    } );
};

itemDataSource.prototype.addItem = function( newItem ) {
    var curTimestamp = utils.getTimestamp();
    allItems.push( new itemObj( newItem.id, newItem.item, newItem.isMarked, newItem.isDeleted, curTimestamp, newItem.version ) );
    var itemIndex = allItems.length - 1;
    allItemIDs.push( newItem.id );

    // Insert items in to db, then immediately retrieve this row turning it into an Item object
    db.run( stmtInsItem, newItem.id, newItem.item, newItem.isMarked, newItem.isDeleted, curTimestamp, newItem.version, function( err ) {
        if( err ) {
            console.log( "Error inserting new item: " + err.message );
        } else {
            var insertId = this.lastID;

            db.get( stmtRowById, insertId, function( err, row ) {
                if( err ) {
                    console.log( "Error selecting row ID %d: %s", insertId, err.message );
                } else {
                    allItems[ itemIndex ].id = row.id;
                }
            } );
        }
    } );
};

itemDataSource.prototype.updateItem = function( item, index ) {
    allItems[ index ].isMarked = item.isMarked;
    allItems[ index ].isDeleted = item.isDeleted;
    allItems[ index ].timestamp = item.timestamp;
    allItems[ index ].version = item.version;

    db.run( stmtUpdItem, item.isMarked, item.isDeleted, item.timestamp, item.item, item.version, function( err ) {
        if( err ) {
            console.log( "Error updating item %d: %s", allItems[ index ].id, allItems[ index ].item );
        }
    } );
};

itemDataSource.prototype.getItemsSince = function( postTimestamp, postItems ) {
    resObj = {
        'timestamp': utils.getTimestamp(),
        'items': allItems.filter( function( item ){
                    if( item.timestamp >= postTimestamp ) {
                        return item;
                    }
                 } )
    };

    return resObj;
};

function arrayObjectIndexOf( array, searchTerm, searchProperty ) {
    for( var i = 0, len = array.length; i < len; i++ ) {
        if( array[ i ][ searchProperty ] == searchTerm )
            return i;
    }
    
    return -1;
};

module.exports = itemDataSource;
