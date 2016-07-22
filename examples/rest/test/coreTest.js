var assert = require( 'chai' ).assert;
var supertest = require('supertest');
var settings = require( './testConfig.json' );

server = supertest( settings.url );

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe( '/he', function() {
  it( 'should do insert', function( done ) {
    var data = { 'key': 'peanutbutter', 'val': 'jelly' };

    server
      .put( '/insert' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        done()
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do lookup', function( done ) {
    var data = { 'key': 'peanutbutter', 'max_len': 100 };

    server
      .get( '/lookup' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.val, 'jelly' );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do update', function( done ) {
    var data = { 'key': 'peanutbutter', 'val': 'jelly2' };

    server
      .put( '/update' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        var data2 = { 'key': 'peanutbutter', 'max_len': 6 };
        server
          .get( '/lookup' )
          .send( data2 )
          .expect( 200 )
          .end( function( err, res ) {
            assert.equal( res.body.val, 'jelly2' );
            done();
          });
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do replace', function( done ) {
    var data = { 'key': 'peanutbutter', 'val': 'avocado' };

    server
      .put( '/replace' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        var data2 = { 'key': 'peanutbutter', 'max_len': 7 };
        server
          .get( '/lookup' )
          .send( data2 )
          .expect( 200 )
          .end( function( err, res ) {
            assert.equal( res.body.val, 'avocado' );
            done();
          });
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do another update/insert', function( done ) {
    var data = { 'key': 'cherry', 'val': 'lemon' };

    server
      .put( '/update' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        var data2 = { 'key': 'cherry', 'max_len': 5 };
        server
          .get( '/lookup' )
          .send( data2 )
          .expect( 200 )
          .end( function( err, res ) {
            assert.equal( res.body.val, 'lemon' );
            assert.equal( res.body.return, 0 );
            done();
          });

      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do lookup with offset', function( done ) {
    var data = { 'key': 'cherry', 'max_len': 100, 'off': 1, 'len': 3 };

    server
      .get( '/lookup' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.val, 'emo' );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do lookup next', function( done ) {
    var data = { 'key': 'cherry', 'max_len': 100 };

    server
      .get( '/next' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.val, 'avocado' );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do lookup prev', function( done ) {
    var data = { 'key': 'peanutbutter', 'max_len': 100 };

    server
      .get( '/prev' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.val, 'lemon' );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should get version', function( done ) {

    server
      .get( '/version' )
      .expect( 200 )
      .end( function( err, res ) {
        assert.isDefined( res.body.return );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should get strerror', function( done ) {

    server
      .get( '/strerror' )
      .send( { 'err': -121 } )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 'HE_ERR_ITEM_NOT_FOUND' );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should get stats', function( done ) {
    server
      .get( '/stats' )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.name, 'DATASTORE' );
        assert.equal( res.body.valid_items, 2 );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do delete', function( done ) {
    var data = { 'key': 'cherry' };

    server
      .post( '/delete' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        var data2 = { 'key': 'cherry', 'max_len': 5 };
        server
          .get( '/lookup' )
          .send( data2 )
          .expect( 200 )
          .end( function( err, res ) {
            assert.notEqual( res.body.return, 0 );
            done();
          });
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do new update/insert', function( done ) {
    var data = { 'key': 'aaa', 'val': 'bbb' };

    server
      .put( '/update' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        done();
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should do delete_lookup', function( done ) {
    var data = { 'key': 'aaa', 'max_len': 10 };

    server
      .get( '/delete_lookup' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        assert.equal( res.body.val, 'bbb' );
        // Check to make sure the item was actually deleted.
        var data2 = { 'key': 'aaa', 'max_len': 5 };
        server
          .get( '/lookup' )
          .send( data2 )
          .expect( 200 )
          .end( function( err, res ) {
            assert.notEqual( res.body.return, 0 );
            done();
          });
      });
  });

  // ---------------------------------------------------------------------------
  it( 'should delete old value', function( done ) {
    var data = { 'key': 'peanutbutter' };

    server
      .post( '/delete' )
      .send( data )
      .expect( 200 )
      .end( function( err, res ) {
        assert.equal( res.body.return, 0 );
        done();
      });
  });


});
