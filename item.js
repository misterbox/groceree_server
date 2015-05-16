/*
    Node module to support an Item object
*/

// Item object constructor
function Item( id, item, isMarked, isDeleted, timestamp, version ) {
    this.id = id;
    this.item = item;
    this.version = version;
    
    if( isMarked ) {
        this.isMarked = true;
    } else {
        this.isMarked = false;
    }

    if( isDeleted ) {
        this.isDeleted = true;
    } else {
        this.isDeleted = false;
    }

    this.timestamp = timestamp;
}

module.exports = Item;
