#!/usr/bin/env node

var cluster = require( 'cluster' );
var he = require( 'node-helium' );
var settings = require( './datastoreConfig.json' );

var commandLineArgs = require( 'command-line-args' );
var optionDef = [
  { name: 'cores', alias: 'c', type: Number, defaultValue: 2 },
  { name: 'truncate', alias: 'r', type: Boolean, defaultValue: false }
]
var options = commandLineArgs( optionDef );

if ( cluster.isMaster ) {

  if ( options.truncate ) {
    console.log( 'TRUNCATED DATASTORE' );
    var myHe = he.open( settings.heURL, settings.datastoreName, 1 | 4 | 8, null );
    he.close( myHe );
  }

  // Create a worker for each CPU
  for ( var i = 0; i < options.cores; ++i ) {
      cluster.fork();
  }

  cluster.on( 'online', function( worker ) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on( 'exit', function( worker, code, signal ) {
    console.log( 'Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal );
    console.log( 'Starting a new worker' );
    cluster.fork();
  });

}
else {

  var express = require( 'express' );
  var app = express();
  var bodyParser = require( 'body-parser' );

  var port = process.env.PORT || 8080;

  app.use( bodyParser() );
  require( './routes/routes.js' )( app, options.url ); // routes

  // ------------------------------------------------------------------------
  // Errors and catches
  // ------------------------------------------------------------------------
  // catch 404 and forward to error handler
  app.use( function( req, res, next ) {
    var err = new Error( 'Not Found' );
    err.status = 404;
    next( err );
  });

  // error handler. Render nothing so user never sees stack traces.
  // If you want a stack trace, you would get it here.
  app.use( function( err, req, res, next ) {
    res.status( err.status || 500 );

  });

  // ------------------------------------------------------------------------
  // Start the server
  // ------------------------------------------------------------------------
  app.listen( port );
  console.log( 'Server listening on http://localhost:' + port );

}
