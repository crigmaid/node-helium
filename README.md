# Node-Helium
Node-Helium lets you use Levyx's [Helium](http://www.levyx.com/content/helium-overview) datastore with Node.js.
Using `node-helium` is nearly identical to using Helium, with a few notable quirks.

## Installing
Download the `node-helium.tar.gz` file [here](http://packages.levyx.com/public/bindings), selecting the particular build for your operating system, then call the following.
```bash
npm install node-helium_[your os].tar.gz
```

---

**For more detailed documentation**, see the `README` inside the `node-helium` package.

## Quick Usage
Helium requires a device to write to. If you do not want to use a dedicated device, you can create a file and use it to test. The default test configuration has this file at `/tmp/4g`.

Linux:
```bash
truncate -s 4g /tmp/4g
```

Mac, BSD, misc. POSIX:
```bash
dd if=/dev/zero of=/tmp/4g bs=1k count=$((4 * 1024 * 1024))
```

Windows
```batch
fsutil file createnew C:\\tmp\\4g 4194304
```

## API
The details of the API are located in the `docs` directory.

Now you can write your code:
#### Example 1
Insert and read a simple value.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;

var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer( 'peanutbutter', 'utf-8' );
var myVal = new Buffer( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

var lookKey = new Buffer( 'peanutbutter', 'utf-8' );
var receiveBuf = new Buffer( 50 );
var lookupItem = he.make_item( lookKey, receiveBuf, 12, 5 );
he.lookup( myHe, lookupItem, 0, 5 );

console.log( receiveBuf.toString( 'utf-8', 0, 5 ) ); // This will be 'jelly'

he.close( myHe );
```
#### Example 2
Working with transactions. This example has more advanced usage, namely reuse of buffers.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;

var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var keyBuf = new Buffer( 50 );
var valBuf = new Buffer( 50 );

keyBuf.write( 'peanutbutter', 'utf-8' );
valBuf.write( 'jelly', 'utf-8' );
var testItem = he.make_item( keyBuf, valBuf, 12, 5 );

he.insert( myHe, testItem );

var myTransaction = he.transaction( myHe );

valBuf.write( 'avocado', 'utf-8' );
testItem.set_val_len( 7 );
he.update( myTransaction, testItem );

he.commit( myTransaction );

var ret = he.lookup( myHe, testItem, 0, 7 );

console.log( testItem.val().toString() ); // Prints 'avocado'

he.close( myHe );
```

## Performance Benchmarking
Execute the following to run a performance test with `node-helium`. Substitute `he://.//tmp/4g` with your own Helium URL. Remember that Node.js is always single threaded, so the test always runs on one thread.
```javascript
node scripts/performanceTest.js -d 'he://.//tmp/4g' -o 1000000 -v 100
```

## Performance  
The following shows some sample performance numbers on Google Cloud.

---

**GCloud n1-highcpu-32** 28.8 GB Memory  
1x 375GB Local SSD  
**1000000** operations | **1KB** obj size

Millions of operations per sec.  
Inserts: **0.48**  
Seq Lookup: **0.8**  
Rand Lookup: **0.5**  
Deletes: **1.0**  

---

**GCloud n1-standard-1** 3.75 GB Memory  
1x 375GB Local SSD  
**1000000** operations | **1KB** obj size

Millions of operations per sec.  
Inserts: **0.35**  
Seq Lookup: **0.75**  
Rand Lookup: **0.4**  
Deletes: **0.8**  
