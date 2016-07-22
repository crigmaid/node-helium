#!/usr/bin/env node

var argParser = require( 'command-line-args' );
var request = require( 'request' );

var optionDef = [
  { name: 'url', alias: 'u', type: String, defaultValue: 'http://localhost:8080/he' },
  { name: 'operations', alias: 'o', type: Number, defaultValue: 100 },
  { name: 'clients', alias: 'c', type: Number, defaultValue: 200 },
  { name: 'valsize', alias: 'v', type: Number, defaultValue: 50000 }
]
var options = argParser( optionDef );
var NUM_OPERATIONS = options.operations;
var VAL_SIZE = options.valsize;
var CONCURRENT_CLIENTS = options.clients; // Simulate how many clients are making requests
var RESULT_UNITS = 1; // Show results in operations per sec.

// Utility functions
// -----------------------------------------------------------------------------
var timeStart = [];
var timeEnd = [];
var getOpsPerSec = function( startTime, endTime, numOps ) {
  var sec = endTime[0] - startTime[0];
  var nano = endTime[1] - startTime[1];
  var sec = ( sec + nano/1000000000 );
  return numOps / sec;
}
var printOpsPerSec = function( prefixString, ops ) {
   var amount = ops / RESULT_UNITS;
   console.log( prefixString + amount.toString() );
}
// -----------------------------------------------------------------------------


// First generate a string to use for values
var insertVal = '';
for ( var s = 0; s < VAL_SIZE; ++s ) {
  // Generate the value
  insertVal += 'a';
}

//console.log( 'Results are in million operations per sec' );
console.log( 'Running: ' + NUM_OPERATIONS + ' operations per ' + CONCURRENT_CLIENTS + ' clients...' );

/*
// -----------------------------------------------------------------------------
 ###
  #  #    #  ####  ###### #####  #####  ####
  #  ##   # #      #      #    #   #   #
  #  # #  #  ####  #####  #    #   #    ####
  #  #  # #      # #      #####    #        #
  #  #   ## #    # #      #   #    #   #    #
 ### #    #  ####  ###### #    #   #    ####
// -----------------------------------------------------------------------------
*/
var insertFinished = function( clientId ) {
  if ( clientId == CONCURRENT_CLIENTS ) {
    console.timeEnd( 'inserts' ); // Only the last client stops the timer
    doLookups(); // DO LOOKUPS NEXT
  }

}

var sendInsertRequest = function( counter, clientId ) {
  var keyString = 'key_' + i.toString(); //This is more like a sprintf
  var insertOptions = {
    url: options.url + '/insert',
    method: 'PUT',
    json: { 'key': keyString, 'val': insertVal }
  };
  request( insertOptions, function( err, res, body ) {
    if ( err ) {
      console.log( 'ERROR! ' + err );
    }
    insertResponseCounter += 1;
    if ( insertResponseCounter >= NUM_OPERATIONS ) {
      insertFinished( clientId );
    }
    else {
      sendInsertRequest( counter + 1, clientId ); // Go again
    }
  });
}

console.time( 'inserts' );
var insertResponseCounter = 0;
for ( var i = 0; i < CONCURRENT_CLIENTS; ++i ) {
  sendInsertRequest( 0, i + 1 );
}

/*
// -----------------------------------------------------------------------------
 #
 #        ####   ####  #    # #    # #####   ####
 #       #    # #    # #   #  #    # #    # #
 #       #    # #    # ####   #    # #    #  ####
 #       #    # #    # #  #   #    # #####       #
 #       #    # #    # #   #  #    # #      #    #
 #######  ####   ####  #    #  ####  #       ####
// -----------------------------------------------------------------------------
*/
var lookupFinished = function( clientId ) {
  if ( clientId == CONCURRENT_CLIENTS ) {
    console.timeEnd( 'lookups' ); // Only the last client stops the timer
  }
}

var sendLookupRequest = function( counter, clientId ) {
  var keyString = 'key_' + i.toString(); //This is more like a sprintf
  var lookupOptions = {
    url: options.url + '/lookup',
    method: 'GET',
    json: { 'key': keyString, 'max_len': VAL_SIZE }
  };
  request( lookupOptions, function( err, res, body ) {
    if ( err ) {
      console.log( 'ERROR! ' + err );
    }
    lookupResponseCounter += 1;
    if ( lookupResponseCounter >= NUM_OPERATIONS ) {
      lookupFinished( clientId );
    }
    else {
      sendLookupRequest( counter + 1, clientId ); // Go again
    }
  });
}

var lookupResponseCounter = 0;
var doLookups = function() {
  console.time( 'lookups' );
  for ( var i = 0; i < CONCURRENT_CLIENTS; ++i ) {
    sendLookupRequest( 0, i + 1 );
  }
}
