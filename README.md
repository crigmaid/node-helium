![Node-Helium logo](node-heliumLogo.png)
# Node-Helium
Node-Helium lets you use Levyx's [Helium](http://www.levyx.com/content/helium-overview) datastore with Node.js.
Using `node-helium` is nearly identical to using Helium, with a few notable quirks.

**This is only a demo**, the package will automatically stop working after two months.

## Supported Operating Systems
* CentOS 7

## Installing
1. Install [Node.js](https://nodejs.org/en/download/package-manager/)
2. Create a directory for your project.
3. Download the `node-helium.tar.gz` file [here](http://packages.levyx.com/public/bindings), selecting the particular build for your operating system, then call the following.
```bash
npm install node-helium_[your os].tar.gz
```
You should see the `node-modules` directory with `node-helium` inside it. The module is now ready.

---

**For more detailed documentation**, see the `README` inside the `node-helium` package. You may also refer to the `helium.pdf` document. Even though the PDF is for Helium's native C implementation, the functions are the same unless otherwise noted.

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

Now you can write your code, create `example.js` inside your project directory and copy-paste the following examples to it. Run the program with `node example.js`


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


## API Usage
`node-helium` shares most of its documentation with the Helium library it is based on. Use Helium's documentation for the full details on individual functions.  
However, there are some important differences in the Node.js API. Keep the following concepts in mind:
1. `node-helium` makes use of a C style api. This means the javascript API looks very similar to Helium's native C API.
2. Javascript does not have structs. So things that are structs tend to be objects.
3. Not all objects in `node-helium` are 'real' Javascript objects. They are pointers to special objects that can be passed between Javascript and C, so you cannot directly access their properties, you must use their functions to get and set values. Look at `he_item`.

Each of the API items are located in their respective documentation files. (e.g. details on `he_item` are in `he_item.md`)

---

Buffers and pointers in Node.js have some quirks. Javascript likes to aggressively garbage collect, so if you reassign the buffer pointer of an item, you will get strange results.
```javascript
var myKey = new Buffer( 'peanutbutter', 'utf-8' );
var myVal = new Buffer( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

myKey = new Buffer( 'peanutbutter', 'utf-8' ); // CAUTION
myVal = new Buffer( 50 ); // CAUTION
he.lookup( myHe, testItem, 0, 5 );

console.log( myVal.toString( 'utf-8', 0, 5 ) ); // This will print NOTHING, you would expect 'jelly'
console.log( testItem.val().toString( 'utf-8', 0, 5 ) ); // But this WILL print 'jelly'
```

---

`key()` and `val()` functions for `he_item` will return a buffer with a length set to the size of the `he_item`'s current `key_len` and `val_len` respectively. But the buffer will still point to the **same** data used to construct the `he_item` initially. The following example illustrates this.
```javascript
var myKey = new Buffer( 'peanutbutter', 'utf-8' );
var myVal = new Buffer( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );

testItem.set_val_len( 3 );

console.log( testItem.val().toString() ); // This will print 'jel'

testItem.val().write( 'rocks' );

console.log( testItem.val().toString() ); // This will print 'roc' from the `testItem.val()`
console.log( myVal.toString() ); // This will print 'rocly' from the `myVal` buffer....what!?
```
Notice how `val()` only returns part of the `he_item` value, but still points to the original data used in `myVal`.
The references are the same, but the objects are not!
## he\_enumerate
Works as expected, just provide a javascript function for the callback.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATA1', OPEN_SETTINGS, null );
var myHe2 = he.open( 'he://.//tmp/4g', 'DATA2', he.HE_O_CREATE | he.HE_O_VOLUME_CREATE, null );

var callback = function( err, datastoreList ) {
  console.log( datastoreList ); // datastoreList is a list of datastore names.
}

var ret = he.enumerate( 'he://.//tmp/4g', callback );

he.close( myHe );
he.close( myHe2 );
```

## he\_item
`he_item` structs in Helium need to be built by a function in `node-helium`.

```javascript
var keyBuf = new Buffer( 50 );
var valBuf = new Buffer( 50 );
keyBuf.write( 'peanutbutter', 'utf-8' );
valBuf.write( 'jelly', 'utf-8' );
var testItem = he.make_item( keyBuf, valBuf, 12, 5 ); // testItem can be used like he_item

testItem.key(); // Gets the key buffer, size determined by the key_len value of the item.
testItem.val(); // Gets the value buffer, size determined by the val_len value of the item.
testItem.key( 5 ); // Gets 5 bytes of the key buffer.
testItem.val( 5 ); // Gets 5 bytes of the val buffer.
testItem.key_len(); // Gets the key length associated with the item.
testItem.val_len(); // Gets the val length associated with the item.
testItem.set_key_len( 5 ); // Set the key length to 5.
testItem.set_val_len( 5 ); // Set the val length to 5.

// Only write to buffers you get with key() or val(), do not set them.
testItem.key() = new Buffer( 'peanutbutter' ); // DO NOT DO THIS!
testItem.key().write( 'peanutbutter' ); // Do this instead.
```

## he\_iterate
The `he_iterate` function is indirectly supported though the `func.iterate` function which implements the iteration logic with the `he_next` Helium command. Even though `he_item` is not returned, `key` and `val` still point to the buffers in the `he_item`, so modifying them will update the underlying `he_item`.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer( 'aaaa', 'utf-8' );
var myVal = new Buffer( '11111', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 4, 5 );
he.insert( myHe, testItem );

var myKey2 = new Buffer( 'bbbb', 'utf-8' );
var myVal2 = new Buffer( '22222', 'utf-8' );
var testItem2 = he.make_item( myKey2, myVal2, 4, 5 );
he.insert( myHe, testItem2 );

var myKey3 = new Buffer( 'cccc', 'utf-8' );
var myVal3 = new Buffer( '33333', 'utf-8' );
var testItem3 = he.make_item( myKey3, myVal3, 4, 5 );
he.insert( myHe, testItem3 );

var counter = 0;
he.func.iterate( myHe, 4, 5, function( keySize, valueSize, key, val ) {
  // This will execute once for every key in the datastore.
  console.log( key.toString() );
});

he.close( myHe );
```

## he\_open
Use a javascript object for the `he_env` struct options.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, {'fanout': 30, 'retry_count': 400} );

he.close( myHe );
```

## he\_stats
Returns a javascript object with the info. On error, this function will return an object with `error` property set accordingly.
```javascript
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer( 'peanutbutter', 'utf-8' );
var myVal = new Buffer( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

var stats = he.stats( myHe );
console.log( stats ); // Will print out the stats object.
console.log( stats.name ); // Will print out 'DATASTORE'.

he.close( myHe );

var errorStats = he.stats( myHe ); // Calling this again after closing the datastore will fail.
console.log( errorStats.error ); // This will equal the error code
```

## he\_version
Takes no arguments for simplicity. Will return a string with the version of Helium node-helium is using.

## Common Errors
#### I seem to get `HE_ERR_ITEM_NOT_FOUND` when I have bigger/more keys even though my code is the same.
Make sure you use `item.set_key_len()` if you change the value of an item's key after it is created.
```javascript
for ( var i = 0; i < 1000000; ++i ) {
  var keyString = 'key_' + i.toString();
  testItem.set_key_len( keyString.length ); // THIS LINE IS IMPORTANT!
  myKey.write( keyString, 0 ); // ...Since we are changing the length of the key when `i` gets big.

  //
  // ...
  // rest of code down here

}
```
