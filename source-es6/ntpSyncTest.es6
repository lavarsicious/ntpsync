var ntpsync = require('./ntpSync');


const ntpBurstConfig = {
    fServerCarousel: [
        "0.pool.ntp.org",
        "1.pool.ntp.org",
        "2.pool.ntp.org",
        "3.pool.ntp.org",
        "0.us.pool.ntp.org",
        "1.us.pool.ntp.org",
        "2.us.pool.ntp.org",
        "3.us.pool.ntp.org",
        "0.europe.pool.ntp.org",
        "1.europe.pool.ntp.org",
        "2.europe.pool.ntp.org",
        "3.europe.pool.ntp.org"
    ], // Server pool for NTP Requests (default [*.pool.ntp.org] (4 servers)
    fTimeoutLatencyMS: 300, // NULL for default single-NTP request timeout: (Default: 500ms)
    fRequestedSuccessfulSampleCount: 8, // successful request count: (Default: 4)
    fBurstTimeoutMS: 6000, // Total burst timeout: (Default: 4000 ms)
    // Advanced settings: connect custom services if needed
    fSingleNTPRequestService: null, // wrapper for ntpDatePromise service (default one is in ntpSingleRequest.es6)
    fTimeoutService: null, // wrapper for setTimeout service
    fLocalClockService: null // wrapper for Date.now() service
};

ntpsync.ntpLocalClockDeltaPromise(ntpBurstConfig).then((iNTPData) => {
    console.log(
        `"(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms"`);
    console.log(`"Corresponding Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms"`);
    console.log(`"Calculated from ${iNTPData.totalSampleCount} successful NTP Pings"`);
}).catch((err) => {
    console.log(err);
});
