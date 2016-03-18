# ntpSync - nodeJS (LocalClock - NTPTime) delta calculator

## Description

## Installation

```
$ npm install ntpsync
```

## Usage

An example code to use ntpsync with default values:

```
const ntpsync = require('ntpsync');

ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log(`(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms`);
    console.log(`Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms`);
    console.log(`Total ${iNTPData.totalSampleCount} successful NTP Pings`);
}).catch((err) => {
    console.log(err);
});
```

For more examples, see `ntpSyncTest.es6`

## Configuration object

Use the configuration object to fine-tune your time request. **All** of the configuration elements are optional.

### Basic Parameters

   * **fServerCarousel** an Array of Strings, IP Addresses of a server pool. (default: `[
       "0.pool.ntp.org",
       "1.pool.ntp.org",
       "2.pool.ntp.org",
       "3.pool.ntp.org"
   ]`)

   * **fRequestedSuccessfulSampleCount**: How many successful pings do you want to have in your result calculations? (default: 4)

   *  **fTimeoutLatencyMS**: Total allotted time (in milliseconds) for _**a single NTP ping**_ to complete. when to bail on  (default: 500)


   * **fBurstTimeoutMS**: Total allotted time (in milliseconds) for the _**entire burst**_ to complete. If it times out, the promise will reject. (default: 4000)

### Advanced Parameters (Custom Services)

   * **fLocalClockService**: an service object with a `Now()` function that returns current local time in Unix milliseconds. (default: a wrapper for standard `Date.now()`)

   * **fTimeoutService**: Akin to an $AngularJS dependency injection, a service with `setTimeout()` function. (default: a wrapper for standard `setTimeout`)

   * **fSingleNTPRequestService** : A custom service with `ntpDatePromise()` function. This function must take a configuration object as argument, and must returns a promise of completing/failing a single NTP ping. (default: a built-in NTP request function)

## Errors
`ntpsync` does not allow for concurrent NTP requests or chains of NTP requests, so it would throw an error if you attempt a request while another one is in progress. I.e. this code:

```
ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log("1 OK");
}).catch((err) => {
    console.log("1 failed : "+err);
});
ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log("2 OK");
}).catch((err) => {
    console.log("2 failed : "+err);
});
```
would result in:

```
2 failed : Error: ERROR! Tried a ntpsync request concurrently!
1 OK
```

## Testing

To run a small/example test suite, run:
```
$ npm run test
```
The test script (see `**ntpSyncTest.es6**`) performs two requests one after the other. One goes to [NTP server pool](http://www.pool.ntp.org/en/), another to [NIST server pool](http://tf.nist.gov/tf-cgi/servers.cgi). 
Your output should be something like this:
```
NTP DATA:
"(Local Time - NTP Time) Delta = 3.5 ms"
"Corresponding Minimal Ping Latency was 15 ms"
"Calculated from 8 successful NTP Pings"
NIST DATA:
"(Local Time - NTP Time) Delta = 4 ms"
"Corresponding Minimal Ping Latency was 40 ms"
"Calculated from 4 successful NTP Pings"
```


## Building from source

You don't need it, but if you want it, here are the info you need:

Main source files of the github repo are in `/source-es6` (ECMASCRIPT 6 files),
To transcode via `babel (https://babeljs.io/)`:
```
$ npm install
$ npm run build
```

That places all the ECMA-ES5-happy `.js` files into the  `/distribution` folder, you can then run the test suite either via
```
$ npm run test
```
or directly
```
$ node ./distribution/ntpSyncTest.js
```


## References
   1. NIST Internet Time Servers: http://tf.nist.gov/tf-cgi/servers.cgi
   2. NTP: The Network Time Protocol. http://www.ntp.org/
   3. **pool.ntp.org**: Public NTP time server for everyone http://www.pool.ntp.org/en/
   4. Babel: Use next generation JavaScript, today. https://babeljs.io/
   5. How to Build and Publish ES6 npm Modules Today, with Babel. https://booker.codes/how-to-build-and-publish-es6-npm-modules-today-with-babel/
