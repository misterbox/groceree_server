var sqlite3 = require( 'sqlite3' ).verbose();
var itemObj = require( './item.js' );
var utils = require( './utils.js' );

var TABLE_ITEM = "item";
var COLUMN_ID = "id";
var COLUMN_ITEM = "item";
var COLUMN_ISMARKED = "isMarked";
var COLUMN_ISDELETED = "isDeleted";
var COLUMN_TIMESTAMP = "timestamp";

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

// Update item by name
var stmtUpdItem = "UPDATE " + TABLE_ITEM + " SET " + COLUMN_ISMARKED + " = ?, " +
    COLUMN_ISDELETED + " = ?, " + COLUMN_TIMESTAMP + " = ? WHERE " + COLUMN_ITEM +
    " = ?";

// Select rows by timestamp
var stmtRowByTime = "SELECT * FROM " + TABLE_ITEM + " WHERE " + COLUMN_TIMESTAMP +
    " > ?";

// Array to hold all items and item names in memory
var allItems;
var allItemNames;

var db;

var itemDataSource = function(itemsAry, itemNamesAry ) {
    allItems = itemsAry;
    allItemNames = itemNamesAry;
};

itemDataSource.prototype.open = function() {
    db = new sqlite3.cached.Database( 'data/groceree_db', function( err ) {
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
};

itemDataSource.prototype.addItem = function( newItem ) {
    var curTimestamp = utils.getTimestamp();
    allItems.push( new itemObj( newItem.id, newItem.item, newItem.isMarked, newItem.isDeleted, curTimestamp ) );
    var itemIndex = allItems.length - 1;
    allItemNames.push( newItem.item );

    // Insert items in to db, then immediately retrieve this row turning it into an Item object
    db.run( stmtInsItem, newItem.item, newItem.isMarked, newItem.isDeleted, curTimestamp, function( err ) {
        if( err ) {
            console.log( "Error inserting new item: " + err.message );
        } else {
            var insertId = this.lastID;

            db.get( stmtRowById, insertId, function( err, row ) {
                if( err ) {
                    console.log( "Error selecting row ID %d: %s", insertId, err.message );
                } else {
                    allItems[ itemIndex ].id = insertId;
                }
            } );
        }
    } );
};

itemDataSource.prototype.updateItem = function( item, index ) {
    var curTimestamp = utils.getTimestamp();
    allItems[ index ].isMarked = item.isMarked;
    allItems[ index ].isDeleted = item.isDeleted;
    allItems[ index ].timestamp = curTimestamp;

    db.run( stmtUpdItem, item.isMarked, item.isDeleted, curTimestamp, item.item, function( err ) {
        if( err ) {
            console.log( "Error updating item %d: %s", allItems[ index ].id, allItems[ index ].item );
        }
    } );
};

itemDataSource.prototype.getItemsSince = function( postTimestamp, postItems ) {
    resObj = {
        'timestamp': utils.getTimestamp(),
        'items': allItems.filter( function( item ){
                    console.log( "item: %s", JSON.stringify( item ) );
                    if( item.timestamp > postTimestamp && ( arrayObjectIndexOf( postItems, item.item, "item" ) == -1 ) ) {
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
