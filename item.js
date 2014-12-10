/*
    Node module to support an Item object
*/

// Item object constructor
function Item( id, item, isMarked, isDeleted, timestamp ) {
    this.id = id;
    this.item = item;
    
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
