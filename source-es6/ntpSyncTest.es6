var ntpsync = require('./ntpSync');

ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
    console.log("iNTPData.minimalNTPLatencyDelta " + iNTPData.minimalNTPLatencyDelta);
    console.log("iNTPData.minimalNTPLatency " + iNTPData.minimalNTPLatency);
    console.log("iNTPData.totalSampleCount " + iNTPData.totalSampleCount);
}).catch((err) => {
    console.log(err);
});
