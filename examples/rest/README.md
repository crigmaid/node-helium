

## Requirements
Must install `node-helium` somehow. Get the file or the tar.gz and npm install it.
```bash
npm install node-helium
```
## Tools
`nodemon` makes developing and testing much easier.
```bash
npm install -g nodemon
```

## Starting and Configuring
First install all dependencies. The `node-helium` dependency must be acquired manually. 
```bash
npm install
```
Then copy `datastoreConfig.json.template`, name it `datastoreConfig.json` and fill it out with your own settings.  
To run the server, use:
```bash
node server.js [ -c n ] [ -r ]
```
**-c** The number of worker processes to run the server with.  
**-r** Specify this to truncate the datastore on open.

Edit the `datastoreConfig.json` file to change the open settings for the Helium datastore.
Make sure there is a Helium server instance running. `helium --server` will start the default Helium server.


# API

#### GET /he/stats
**Parameters**: None.  
**Return**: he stats object.

---

#### PUT /he/update, /he/insert, /he/replace
**Parameters**: { 'key': `String`, 'val': `String` }  
**Return**: { 'return': `Number` }

---

#### POST /he/delete
**Parameters**: { 'key': `String` }  
**Return**: { 'return': `Number` }

---

#### GET /he/lookup, /he/next, /he/prev, /he/delete_lookup
Lookup a value. 'max_len' is the maximum length a value could be, if this is not as large or larger than the length of the value associated with the 'key', behavior will be unexpected.  
You may omit the 'off' and 'len' parameters, in which case the full value will be returned.  
If you include 'off' or 'len', you must include **both**.  

**Parameters**: { 'key': `String`, 'max_len': `Number`, ['off': `Number`, 'len': `Number`] }  
**Return**: { 'return': `Number`, 'val': `String` }

---

#### GET /he/version
Returns a string with the version information.  

**Parameters**: None.  
**Return**: { 'return': `String` }

---

#### GET /he/strerror
Takes an error code and returns a string describing it.  

**Parameters**: { 'err': `Number` }    
**Return**: { 'return': `String` }

---

## Testing
There are 4 main things you need to do before testing.

Copy `testConfig.json.template` to `testConfig.json` and change it as needed.

Make sure there is a device to test on.
```bash
dd if=/dev/zero of=/tmp/4g bs=1k count=$((4 * 1024 * 1024))
```

Make sure the `testConfig.json` has the proper url to the Helium device.

Start the helium server.
```bash
helium --server
```

Start the nodejs server.
```bash
node server.js
```

#### Functional Tests
```bash
mocha
```

#### Performance Tests
```bash
node scripts/performance.js [ -u url ] [ -o operations ] [ -c clients ] [ -v valsize ]
```
**-u** Helium url, defaults to `http://localhost:8080/he`.  
**-o** Number of operations per simulated client, defaults to 100.  
**-c** Number of simulated clients, defaults to 200.  
**-v** Value size, defaults to 50000.  
