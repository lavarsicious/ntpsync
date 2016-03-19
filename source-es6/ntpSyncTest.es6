var ntpsync = require('./ntpsync');


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
    ],
    fTimeoutLatencyMS: 300,
    fRequestedSuccessfulSampleCount: 8,
    fBurstTimeoutMS: 6000
};

const nistBurstConfig = {
    fServerCarousel: [
        "utcnist.colorado.edu",
        "time-a.nist.gov",
        "time-b.nist.gov",
        "time-c.nist.gov",
        "time-d.nist.gov",
        "time.nist.gov"
    ],
    fTimeoutLatencyMS: 500,
    fRequestedSuccessfulSampleCount: 4,
    fBurstTimeoutMS: 6000
};

const logNTPSyncResult = (iNTPData) => {
    console.log(`"(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms"`);
    console.log(`"Corresponding Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms"`);
    console.log(`"Calculated from ${iNTPData.totalSampleCount} successful NTP Pings"`);

    const localClockTimeMS = Date.now();

    const adjustedClockTimeMS = localClockTimeMS - iNTPData.minimalNTPLatencyDelta;

    var localClockDateString = new Date(localClockTimeMS).toISOString();
    var adjustedlocalClockDateString = new Date(adjustedClockTimeMS).toISOString();

    console.log(`Local UTC Clock Time: ${localClockDateString}`);
    console.log(`Adjusted Local UTC Clock Time: ${adjustedlocalClockDateString}`);

};

const reportNTPSyncError = (iErr) => {
    console.log(iErr);
};

const chainableNTPReport = (iNTPData) => {
    return new Promise((iResolve) => {
        console.log("NTP DATA:")
        logNTPSyncResult(iNTPData);
        iResolve();
    });
}

const chainableNISTReport = (iNTPData) => {
    return new Promise((iResolve) => {
        console.log("NIST DATA:")
        logNTPSyncResult(iNTPData);
        iResolve();
    });
}

const chainableNTPQuery = () => {
    return ntpsync.ntpLocalClockDeltaPromise(ntpBurstConfig);
};
const chainableNISTQuery = () => {
    return ntpsync.ntpLocalClockDeltaPromise(nistBurstConfig);
};
//
chainableNTPQuery()
    .then(chainableNTPReport)
    .then(chainableNISTQuery)
    .then(chainableNISTReport)
    .catch(reportNTPSyncError);

// WARNING: This would get you an error since no concurrent NTPSYNC requests are allowed.

// ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
//     console.log("1 OK");
// }).catch((err) => {
//     console.log("1 failed : " + err);
// });
// ntpsync.ntpLocalClockDeltaPromise().then((iNTPData) => {
//     console.log("2 OK");
// }).catch((err) => {
//     console.log("2 failed : " + err);
// });
