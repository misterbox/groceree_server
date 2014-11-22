/*
    Node module to support an Item object
*/

// Item object constructor
function Item( id, name, isMarked, isDeleted, timestamp ) {
    this.id = id;
    this.name = name;
    
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
