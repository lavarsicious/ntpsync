# ntpSync - nodeJS (LocalClock - NTPTime) delta calculator

## Description

## Installation

```
$ npm install ntpsync
```

## Distribution
the package distribution is `/distribution` folder, however github Main source files are in `/source-es6` (ECMASCRIPT 6 files),  transcoded via `babel (https://babeljs.io/)`. If git clone instead of installing, transcode via:
```
$ npm run build
```
## Usage

```
const ntpsync = require('ntpsync');

ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log(`"(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms"`);
    console.log(`"Corresponding Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms"`);
    console.log(`"Calculated from ${iNTPData.totalSampleCount} successful NTP Pings"`);
}).catch((err) => {
    console.log(err);
});
```

## Configuration object

Use the configuration object to fine-tune your time request. All of the configuration elements are optional.

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

## Testing

To run a small/example test suite, run:
```
$ npm run test
```



## References
   1. NIST Internet Time Servers: http://tf.nist.gov/tf-cgi/servers.cgi
   2. NTP: The Network Time Protocol. http://www.ntp.org/
   3. **pool.ntp.org**: Public NTP time server for everyone http://www.pool.ntp.org/en/
   4. Babel: Use next generation JavaScript, today. https://babeljs.io/
   5. How to Build and Publish ES6 npm Modules Today, with Babel. https://booker.codes/how-to-build-and-publish-es6-npm-modules-today-with-babel/
