var http = require( 'http' );
var utils = require( './utils.js' );

var payload = {
    'timestamp' : utils.getTimestamp(),
    'items' : [
        {
            id: "test-1",
            item: "item 0",
            isMarked: false,
            isDeleted: true,
            timestamp: 1418255736,
            version: 2
        },
        {
            "id": "977be400-a99c-468c-ad05-422416ce4e80",
            "item": "test",
            "version": 3,
            "isMarked": true,
            "isDeleted": false,
            "timestamp": 1433809221
        },
    ]
}

var payloadString = JSON.stringify( payload );
console.log( payloadString );
console.log( "length: " + payloadString.length );

var headers = {
    'Content-Type': 'application/json',
    'Content-Length': payloadString.length
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

req.write( payloadString );
req.end();
