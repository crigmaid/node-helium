
var settings = require( '../datastoreConfig.json' );
var he = require( 'node-helium' );

var heHandle = null;


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
exports.setup = function() {
  if ( heHandle === null ) {
    heHandle = he.open( settings.heURL, settings.datastoreName, settings.openFlags, settings.openOptions );
    he.perror( 'he_open' );
  }
}
exports.close = function() {
  if ( heHandle ) {
    he.close( heHandle );
  }
}
// remove
// rename
exports.stats = function() {
  return he.stats( heHandle );
}
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
exports.insert = function( key, val ) {
  var myKey = new Buffer( key, 'utf-8' );
  var myVal = new Buffer( val, 'utf-8' );

  var item = he.make_item( myKey, myVal, myKey.length, myVal.length );
  return he.insert( heHandle, item );
}

exports.update = function( key, val ) {
  var myKey = new Buffer( key, 'utf-8' );
  var myVal = new Buffer( val, 'utf-8' );

  var item = he.make_item( myKey, myVal, myKey.length, myVal.length );
  return he.update( heHandle, item );
}

exports.replace = function( key, val ) {
  var myKey = new Buffer( key, 'utf-8' );
  var myVal = new Buffer( val, 'utf-8' );

  var item = he.make_item( myKey, myVal, myKey.length, myVal.length );
  return he.replace( heHandle, item );
}

exports.delete = function( key ) {
  var myKey = new Buffer( key, 'utf-8' );
  var myVal = new Buffer( 0, 'utf-8' );

  var item = he.make_item( myKey, myVal, myKey.length, myVal.length );
  return he.delete( heHandle, item );
}

exports.deleteLookup = function( key, maxSize, offset, len ) {
  return executeLookupFunction( he.delete_lookup, key, maxSize, offset, len );
}
// delete
// delete_lookup
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
var executeLookupFunction = function( func, key, maxSize, offset, len ) {
  var lookKey = new Buffer( key, 'utf-8' );
  var receiveBuf = new Buffer( maxSize );

  var lookupItem = he.make_item( lookKey, receiveBuf, lookKey.length, maxSize );
  var ret = func( heHandle, lookupItem, offset, len );

  if ( len == maxSize || offset == 0 ) {
    // If the fancy things are not being used, assume user wants everything
    return { 'val': lookupItem.val(), 'return': ret };
  }
  else {
    return { 'val': lookupItem.val( len ), 'return': ret };
  }
}
exports.lookup = function( key, maxSize, offset, len ) {
  return executeLookupFunction( he.lookup, key, maxSize, offset, len );
}

exports.next = function( key, maxSize, offset, len ) {
  return executeLookupFunction( he.next, key, maxSize, offset, len );
}

exports.prev = function( key, maxSize, offset, len ) {
  return executeLookupFunction( he.prev, key, maxSize, offset, len );
}
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
exports.version = function() {
  return he.version();
}
// perror
exports.strerror = function( error ) {
  return he.strerror( error );
}
