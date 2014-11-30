var http = require( 'http' );

var items = [
    {
        item: "bread",
        isMarked: 0,
        isDeleted: 0,
        timestamp: 1416534964
    },
    {
        item: "Toast",
        isMarked: 1,
        isDeleted: 0,
        timestamp: 1416535000
    },
    {
        item: "JELLY",
        isMarked: 0,
        isDeleted: 1,
        timestamp: 1416535042
    },
    {
        item: "item 0",
        isMarked: 0,
        isDeleted: 1,
        timestamp: 1416535042
    }
];

var itemString = JSON.stringify( items );
console.log( itemString );
console.log( "length: " + itemString.length );

var headers = {
    'Content-Type': 'application/json',
    'Content-Length': itemString.length
};

var options = {
  hostname: 'theskyegriffin.com',
  port: 8000,
  path: '/syncItems',
  method: 'POST',
  headers: headers
};

var req = http.request( options, function( res ) {
    console.log( "STATUS: " + res.statusCode );
    console.log( "HEADERS: " + JSON.stringify( res.headers ) );

    res.setEncoding( 'utf8' );

    var responseString = "";

    res.on( 'data', function( chunk ) {
      console.log( "BODY: " + chunk );
      responseString += chunk;
    } );

    res.on( 'end', function() {
        //var result = JSON.parse( responseString );
        console.log( "responseString: " + responseString );
    } );
} );

req.on( 'error', function( e ) {
    console.log( 'problem with request: ' + e.message );
  } );

req.write( itemString );
req.end();
