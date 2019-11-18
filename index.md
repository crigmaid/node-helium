---
layout: main
---
<p align="center">
  <img src="img/node-heliumLogo.png">
</p>

# Node Helium {#node-helium}

Node-Helium lets you use Levyx's [Helium](http://www.levyx.com/content/helium-overview) datastore with Node.js.
Using `node-helium` is nearly identical to using Helium, with a few notable quirks.

**This is a trial version**, the package will automatically stop working after two months.

## Supported Operating Systems {#supported-operating-systems}
* CentOS 7.x and RHEL 7.x

## Installing {#installing}
* Install [Node.js](https://nodejs.org/en/download/package-manager/) v10.x (LTS)
* Create a directory for your project.
* To download latest node-helium package: 
{% highlight bash %}
  wget http://packages.levyx.com/public/bindings/node-helium-3.8.2-node-v10.15.3.tar.gz	
{% endhighlight %}
If need older version of node-helium package, you can find it at [here](http://packages.levyx.com/public/bindings/) and use `wget` command to download.
* Then call the following. If you downloaded a package for a different OS or a different version, change the filename after `install`
{% highlight bash %}
npm install node-helium-3.7.0-node-v10.15.3.tar.gz
{% endhighlight %}

* You will be presented with a EULA, you can press `q` to skip to the end. Agree and follow the prompts to continue the installation.

* You should now see the `node_modules` directory with `node-helium` inside it. The module is ready.

---

**For more detailed documentation**, see the `README` inside the `node-helium` package. You may also refer to the `helium.pdf` document. Even though the PDF is for Helium's native C implementation, the functions are the same unless otherwise noted.

## Quick Usage {#quick-usage}
Helium requires a device to write to. If you do not want to use a dedicated device, you can create a file and use it to test. The default test configuration has this file at `/tmp/4g`.

{% highlight bash %}
dd if=/dev/zero of=/tmp/4g bs=1k count=$((4 * 1024 * 1024))
{% endhighlight %}

Now you can write your code, create `example.js` inside your project directory and copy-paste the following examples to it. Run the program with:
{% highlight bash %}
node example.js
{% endhighlight %}


#### Example 1 {#example-1}
Insert and read a simple value.
{% highlight javascript %}
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;

var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer.from( 'peanutbutter', 'utf-8' );
var myVal = new Buffer.from( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

var lookKey = new Buffer.from( 'peanutbutter', 'utf-8' );
var receiveBuf = new Buffer.allocUnsafe( 50 );
var lookupItem = he.make_item( lookKey, receiveBuf, 12, 5 );
he.lookup( myHe, lookupItem, 0, 5 );

console.log( receiveBuf.toString( 'utf-8', 0, 5 ) ); // This will be 'jelly'

he.close( myHe );
{% endhighlight %}
#### Example 2 {#example-2}
Working with transactions. This example has more advanced usage, namely reuse of buffers.
{% highlight javascript %}
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;

var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var keyBuf = new Buffer.alloc( 50 );
var valBuf = new Buffer.allocUnsafe( 50 );

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
{% endhighlight %}

#### REST Example {#rest-example}
See more REST examples [here](https://github.com/levyx/node-helium/tree/master/examples/rest)

## Performance Benchmarking {#performance-benchmarking}
Execute the following to run a performance test with `node-helium`. Substitute `he://.//tmp/4g` with your own Helium URL. Remember that Node.js is always single threaded, so the test always runs on one thread.
{% highlight javascript %}
node node_modules/node-helium/scripts/performanceTest.js -d 'he://.//tmp/4g' -o 1000000 -v 100
{% endhighlight %}

## Performance {#performance}
The following shows some sample performance numbers on Google Cloud.

---

**GCloud n1-highcpu-32** 28.8 GB Memory  
1x 375GB Local SSD  
**1000000** operations | **1KB** obj size

Operations per sec.  
Inserts: **480K**  
Seq Lookup: **800K**  
Rand Lookup: **500K**  
Deletes: **1000K**  

---

**GCloud n1-standard-1** 3.75 GB Memory  
1x 375GB Local SSD  
**1000000** operations | **1KB** obj size

Millions of operations per sec.  
Inserts: **350K**  
Seq Lookup: **750K**  
Rand Lookup: **400K**  
Deletes: **800K**  


## API Usage {#api-usage}
**Look at [Helium.pdf](https://github.com/levyx/node-helium/blob/master/helium.pdf)**, it details how Helium works. Most of `node-helium`'s functions are the same as Helium's native C API, however, there are some important differences:  

1. `node-helium` makes use of a C style api. This means the javascript API looks very similar to Helium's native C API.  
2. Javascript does not have structs. So things that are structs tend to be objects.  
3. Not all objects in `node-helium` are 'real' Javascript objects. They are pointers to special objects that can be passed between Javascript and C, so you cannot directly access their properties, you must use their functions to get and set values. Look at `he_item`.  

Below are specific functions that are different or unique to `node-helium`.

## he_enumerate {#he_enumerate}
Works as expected, just provide a javascript function for the callback.
{% highlight javascript %}
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
{% endhighlight %}

## he_item {#he_item}
`he_item` structs in Helium need to be built by a function in `node-helium`.

{% highlight javascript %}
var he = require( 'node-helium' );

var keyBuf = new Buffer.alloc( 50 );
var valBuf = new Buffer.allocUnsafe( 50 );
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
testItem.key() = new Buffer.from( 'peanutbutter' ); // DO NOT DO THIS!
testItem.key().write( 'peanutbutter' ); // Do this instead.
{% endhighlight %}

## he_iterate {#he_iterate}
The `he_iterate` function is indirectly supported though the `func.iterate` function which implements the iteration logic with the `he_next` Helium command. Even though `he_item` is not returned, `key` and `val` still point to the buffers in the `he_item`, so modifying them will update the underlying `he_item`.
{% highlight javascript %}
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer.from( 'aaaa', 'utf-8' );
var myVal = new Buffer.from( '11111', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 4, 5 );
he.insert( myHe, testItem );

var myKey2 = new Buffer.from( 'bbbb', 'utf-8' );
var myVal2 = new Buffer.from( '22222', 'utf-8' );
var testItem2 = he.make_item( myKey2, myVal2, 4, 5 );
he.insert( myHe, testItem2 );

var myKey3 = new Buffer.from( 'cccc', 'utf-8' );
var myVal3 = new Buffer.from( '33333', 'utf-8' );
var testItem3 = he.make_item( myKey3, myVal3, 4, 5 );
he.insert( myHe, testItem3 );

var counter = 0;
he.func.iterate( myHe, 4, 5, function( keySize, valueSize, key, val ) {
  // This will execute once for every key in the datastore.
  console.log( key.toString() );
});

he.close( myHe );
{% endhighlight %}

## he_open {#he_open}
Use a javascript object for the `he_env` struct options.
{% highlight javascript %}
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, {'fanout': 30, 'retry_count': 400} );

he.close( myHe );
{% endhighlight %}

## he_close {#he_close}
Invalidate all references to a helium datastore.
See he_open above for usage and example.

## he_rename {#he_rename}
Renames a datastore.
{% highlight javascript %}
he.rename( myHe, 'New Name');
{% endhighlight %}

## he_remove {#he_remove}
Remove a datastore.
{% highlight javascript %}
he.remove( myHe );
{% endhighlight %}

## he_remove_volume {#he_remove_volume}
This is the equivalent of truncating a volume and requires both a valid URL and a flagto confirm that this is not done by mistake.
{% highlight javascript %}
he.remove_volume( 'he://.//tmp/4g', he.HE_O_VOLUME_TRUNCATE );
{% endhighlight %}

## he_transaction {#he_transaction}
Returns a handle to a transaction on a datastore.
{% highlight javascript %}
var myTx = he.transaction( myHe );
{% endhighlight %}

## he_transaction_datastore {#he_transaction_datastore}
Reassign a transaction to a new datastore. All previous operations remain on the previous datastore, and all following operations will proceed on the new datastore. 
{% highlight javascript %}
var myTx = he.transaction( myHe1 );
he.transaction_datastore( myTx, myHe2 );
{% endhighlight %}

## he_commit {#he_commit}
This is an operation on a transaction that applies all previous operations on a transaction to the datastore it belongs to.
{% highlight javascript %}
he.commit( myTx );
{% endhighlight %}

## he_discard {#he_discard}
This is an operation that discards all operations on a transaction since the last call to commit.
{% highlight javascript %}
he.discard( myTx );
{% endhighlight %}

## he_update {#he_update}
This operation updates an item with a new value and value length.
Following from the example we have for he_item, lets imagine we have an item testItemA with key KEY and value VALUE already inserted in our datastore. We created a new item testItemB with key KEY and value NEWVALUE 
{% highlight javascript %}
he.update( myHe, testItemB );
{% endhighlight %}
Helium will first check to see if the datastore myHe contains an item with key KEY. If it does not find one, Helium will perform a standard insert, otherwise it will update the item with the new item value.

## he_insert {#he_insert}
This operation inserts an item to a datastore. The operation will return with an error if an item already exists with the same key, as opposed to he_update which will override the original item.
{% highlight javascript %}
he.insert( myHe, testItem );
{% endhighlight %}

## he_replace {#he_replace}
This operation replaces an item with the same key in a datastore. The operation will return with an error if no item exists with the same key, as opposed to he_update which will perform a standard insert.
{% highlight javascript %}
he.replace( myHe, testItem );
{% endhighlight %}

## he_delete {#he_delete}
This operation simply deletes an item from a datastore. The item must be fully populated for this operation to succeed.
{% highlight javascript %}
he.delete( myHe, testItem );
{% endhighlight %}

## he_lookup {#he_lookup}
This method requires the key and key_len to be populated and val to be populated with a buffer. Then the method will search for the item with the proper key and populate the value with the value starting at the byte indicated by the third parameter, with a length indicated by the fourth parameter. The format is therefore datastore, item, offset, length.
{% highlight javascript %}
he.lookup( myHe, testItem, 0, 10 );
{% endhighlight %}

## he_delete_lookup {#he_delete_lookup}
This method performs a lookup and deletes the item found.
{% highlight javascript %}
he.delete_lookup( myHe, testItem, 0, 10 );
{% endhighlight %}

## he_next | he_prev {#he_next}
These methods operate the same as he_lookup, except that the item is populated with the value before (prev) or after (next) the key set in the item.
{% highlight javascript %}
he.prev( myHe, testItem, 0, 10 );
he.next( myHe, testItem, 0, 10 );
{% endhighlight %}

## he_merge {#he_merge}
This method combines the functionality of lookup and update in a single operation. The method requires a datastore, an item populated with its key and key_len, and a callback function to operate on the item before updating it to the datastore.
{% highlight javascript %}
he.func.merge( myHe, testItem, function( item ) { 
    console.log( item.key.toString() );
}); 
{% endhighlight %}

## he_exists {#he_exists}
This operation returns a nonzero value if an item exists in a datastore with a key given by an item as follows.
{% highlight javascript %}
he.exists( myHe, testItem );
{% endhighlight %}

## he_stats {#he_stats}
Returns a javascript object with the info. On error, this function will return an object with `error` property set accordingly.
{% highlight javascript %}
var he = require( 'node-helium' );

var OPEN_SETTINGS = he.HE_O_CREATE | he.HE_O_VOLUME_CREATE | he.HE_O_VOLUME_TRUNCATE;
var myHe = he.open( 'he://.//tmp/4g', 'DATASTORE', OPEN_SETTINGS, null );

var myKey = new Buffer.from( 'peanutbutter', 'utf-8' );
var myVal = new Buffer.from( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

var stats = he.stats( myHe );
console.log( stats ); // Will print out the stats object.
console.log( stats.name ); // Will print out 'DATASTORE'.

he.close( myHe );

var errorStats = he.stats( myHe ); // Calling this again after closing the datastore will fail.
console.log( errorStats.error ); // This will equal the error code
{% endhighlight %}

## he_version {#he_version}
Takes no arguments for simplicity. Will return a string with the version of Helium node-helium is using.

## he_is_valid | he_is_transaction | he_is_read_only {#he_is_read_only}
All of these are validation checks that read a datastore handle return a nonzero value if the handle points to a datastore that is valid, a transaction, or read only, respectively.
{% highlight javascript %}
he.is_valid( myHe );
he.is_transaction( myHe);
he.is_read_only( myHe );
{% endhighlight %}

## he_perror | he_strerror {#he_strerror}
he_perror will convert the value of the variable errno to a printable String. he_strerror will read an int value error and return a printable String.
{% highlight javascript %}
he.perror();
he.strerror(-131);
{% endhighlight %}

## Common Errors {#common-errors}
**I seem to get `HE_ERR_ITEM_NOT_FOUND` when I have bigger/more keys even though my code is the same.**

Make sure you use `item.set_key_len()` if you change the value of an item's key after it is created.
{% highlight javascript %}
for ( var i = 0; i < 1000000; ++i ) {
  var keyString = 'key_' + i.toString();
  testItem.set_key_len( keyString.length ); // THIS LINE IS IMPORTANT!
  myKey.write( keyString, 0 ); // ...Since we are changing the length of the key when `i` gets big.

  //
  // ...
  // rest of code down here


}
{% endhighlight %}

---

Buffers and pointers in Node.js have some quirks. Javascript likes to aggressively garbage collect, so if you reassign the buffer pointer of an item, you will get strange results.
{% highlight javascript %}
var myKey = new Buffer.from( 'peanutbutter', 'utf-8' );
var myVal = new Buffer.from( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );
he.insert( myHe, testItem );

myKey = new Buffer.from( 'peanutbutter', 'utf-8' ); // Do not reassign myKey to a new buffer.
myVal = new Buffer.allocUnsafe( 50 ); // Do not reassign myVal to a new buffer
he.lookup( myHe, testItem, 0, 5 );

console.log( myVal.toString( 'utf-8', 0, 5 ) ); // This will print NOTHING, you would expect 'jelly'
console.log( testItem.val().toString( 'utf-8', 0, 5 ) ); // But this WILL print 'jelly'
{% endhighlight %}
In summary, do not reassign buffers, instead, just rewrite to the buffers you initially assigned (see example 2 above).

---

`key()` and `val()` functions for `he_item` will return a buffer with a length set to the size of the `he_item`'s current `key_len` and `val_len` respectively. But the buffer will still point to the **same** data used to construct the `he_item` initially. The following example illustrates this.
{% highlight javascript %}
var myKey = new Buffer.from( 'peanutbutter', 'utf-8' );
var myVal = new Buffer.from( 'jelly', 'utf-8' );
var testItem = he.make_item( myKey, myVal, 12, 5 );

testItem.set_val_len( 3 );

console.log( testItem.val().toString() ); // This will print 'jel'

testItem.val().write( 'rocks' );

console.log( testItem.val().toString() ); // This will print 'roc' from the `testItem.val()`
console.log( myVal.toString() ); // This will print 'rocly' from the `myVal` buffer....what!?
{% endhighlight %}
Notice how `val()` only returns part of the `he_item` value, but still points to the original data used in `myVal`.
The references are the same, but the objects are not!


# Contact {#contact}

For issues, bugs, or questions, create an issue on this repo, or email us at `nodejs@levyx.com`
