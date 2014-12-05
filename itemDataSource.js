var sqlite3 = require( 'sqlite3' ).verbose();
var itemObj = require( './item.js' );

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

itemDataSource.prototype.addItem = function( item ) {
    allItems.push( new itemObj( item.id, item.item, item.isMarked, item.isDeleted, item.timestamp ) );
    var itemIndex = allItems.length - 1;
    allItemNames.push( item.item );

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
                    allItems[ itemIndex ].id = insertId;
                }
            } );
        }
    } );
};

module.exports = itemDataSource;
