var sqlite3 = require( 'sqlite3' ).verbose();

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

var itemDataSource = function() {

};

modules.exports = itemDataSource;
