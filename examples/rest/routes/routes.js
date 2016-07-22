
module.exports = function( app, url ) {

  var heREST = require( '../src/restHelium.js' );
  heREST.setup( url );

  var logMessage = function( message ) {
    console.log( message );
  }

  // middleware to use for all requests
  app.use( function( req, res, next ) {
    // do logging
    //console.log( 'Something is happening.' );
    next(); // make sure we go to the next routes and don't stop here
  });


/*
// -----------------------------------------------------------------------------
 #     #
 #     #   ##   #      # #####  # ##### #   #
 #     #  #  #  #      # #    # #   #    # #
 #     # #    # #      # #    # #   #     #
  #   #  ###### #      # #    # #   #     #
   # #   #    # #      # #    # #   #     #
    #    #    # ###### # #####  #   #     #
// -----------------------------------------------------------------------------
*/
// is_valid
// is_transaction
/*
// -----------------------------------------------------------------------------
  ######
  #     #   ##   #####   ##    ####  #####  ####  #####  ######
  #     #  #  #    #    #  #  #        #   #    # #    # #
  #     # #    #   #   #    #  ####    #   #    # #    # #####
  #     # ######   #   ######      #   #   #    # #####  #
  #     # #    #   #   #    # #    #   #   #    # #   #  #
  ######  #    #   #   #    #  ####    #    ####  #    # ######
// -----------------------------------------------------------------------------
*/
// enumerate
// open
// close
// remove
// rename
app.get( '/he/stats', function( req, res ) {
  try {
    var statsObj = heREST.stats();
    res.status( 200 ).send( statsObj );
  }
  catch( err ) {
    logMessage( 'ERROR in stats ' + err );
  }
});
/*
// -----------------------------------------------------------------------------
 #     #
 #     # #####  #####    ##   ##### ######
 #     # #    # #    #  #  #    #   #
 #     # #    # #    # #    #   #   #####
 #     # #####  #    # ######   #   #
 #     # #      #    # #    #   #   #
  #####  #      #####  #    #   #   ######
// -----------------------------------------------------------------------------
*/
app.put( '/he/update', function( req, res ) {
  try {
    var result = heREST.update( req.body.key, req.body.val );
    res.status( 200 ).send( { 'return': result } );
  }
  catch( err ) {
    logMessage( 'ERROR in update ' + err );
  }
});
app.put( '/he/insert', function( req, res ) {
  try {
    var result = heREST.insert( req.body.key, req.body.val );
    res.status( 200 ).send( { 'return': result } );
  }
  catch( err ) {
    logMessage( 'ERROR in insert ' + err );
  }
});
app.put( '/he/replace', function( req, res ) {
  try {
    var result = heREST.replace( req.body.key, req.body.val );
    res.status( 200 ).send( { 'return': result } );
  }
  catch( err ) {
    logMessage( 'ERROR in replace ' + err );
  }
});
app.post( '/he/delete', function( req, res ) {
  try {
    var result = heREST.delete( req.body.key );
    res.status( 200 ).send( { 'return': result } );
  }
  catch( err ) {
    logMessage( 'ERROR in replace ' + err );
  }
});
app.get( '/he/delete_lookup', function( req, res ) {
  executeLookupFunction( heREST.deleteLookup, req, res );
});
/*
// -----------------------------------------------------------------------------
 #
 #        ####   ####  #    # #    # #####
 #       #    # #    # #   #  #    # #    #
 #       #    # #    # ####   #    # #    #
 #       #    # #    # #  #   #    # #####
 #       #    # #    # #   #  #    # #
 #######  ####   ####  #    #  ####  #
// -----------------------------------------------------------------------------
*/
// exists
var executeLookupFunction = function( func, req, res ) {
  try {
    var off = 0;
    var len = req.body.max_len;
    if ( req.body.off ) { off = req.body.off; }
    if ( req.body.len ) { len = req.body.len; }

    var retObj = func( req.body.key, req.body.max_len, off, len );
    res.status( 200 ).send( { 'val': retObj.val.toString(), 'return': retObj.return } );
  }
  catch( err ) {
    logMessage( 'ERROR in lookup ' + err );
  }
}
app.get( '/he/lookup', function( req, res ) {
  executeLookupFunction( heREST.lookup, req, res );
});
app.get( '/he/next', function( req, res ) {
  executeLookupFunction( heREST.next, req, res );
});
app.get( '/he/prev', function( req, res ) {
  executeLookupFunction( heREST.prev, req, res );
});

// iterate
/*
// -----------------------------------------------------------------------------
  #####
 #     # #    # #####  #####   ####  #####  #####
 #       #    # #    # #    # #    # #    #   #
  #####  #    # #    # #    # #    # #    #   #
       # #    # #####  #####  #    # #####    #
 #     # #    # #      #      #    # #   #    #
  #####   ####  #      #       ####  #    #   #
// -----------------------------------------------------------------------------
*/
app.get( '/he/version', function( req, res ) {
  try {
    var version = heREST.version();
    res.status( 200 ).send( { 'return': version } );
  }
  catch( err ) {
    logMessage( 'ERROR in version ' + err );
  }
});
// perror
app.get( '/he/strerror', function( req, res ) {
  try {
    var errorMessage = heREST.strerror( req.body.err );
    res.status( 200 ).send( { 'return': errorMessage } );
  }
  catch( err ) {
    logMessage( 'ERROR in strerror ' + err );
  }
});



}
