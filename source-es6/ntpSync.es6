const ntpBurstRequest = require('./ntpBurstRequest');

/**
 * Creates a promise
 * @return {Promise} Promise that either resolves with an average number of milliseconds
 * local clock (Date.now())  is ahead of NTP or an NTP server communication error
 */
function ntpLocalClockDeltaPromise() {
    return new Promise((iResolve, iReject) => {

        // Sample Config Object
        const ntpBurstConfig = {
            fServerCarousel: null, // Server set for NTP Requests (see ntpSingleRequest.es6 for default list)
            fTimeoutLatencyMS: null, // NULL for default single-NTP request timeout: (Default: 500ms)
            fRequestedSuccessfulSampleCount: 15, // successful request count: (Default: 10)
            fBurstTimeoutMS: 5000, // Total burst timeout: (Default: 4000 ms)
            // Advanced settings: connect custom services if needed
            fSingleNTPRequestService: null, // wrapper for ntpDatePromise service
            fTimeoutService: null, // wrapper for setTimeout service
            fLocalClockService: null // wrapper for Date.now() service
        };

        const burstDataPromise = ntpBurstRequest.ntpDatePromiseBurstTimeout(ntpBurstConfig);

        burstDataPromise.then((iBurstDataArray) => {

            console.log("SUCCESS: " + JSON.stringify(iBurstDataArray));
            let totalServerNTPDelta = 0;
            let totalServerNTPLatency = 0;
            let totalSampleCount = 0;

            let minimalNTPLatency = 1000000000;
            let minimalNTPLatencyDelta = 0;

            for (let b of iBurstDataArray) {
                const ntpAdjustedTime = b.ntpRaw + b.ntpLatency * 0.5;
                totalServerNTPDelta += (b.localClockNow - ntpAdjustedTime);
                totalSampleCount += 1;
                totalServerNTPLatency += b.ntpLatency;

                if (b.ntpLatency < minimalNTPLatency) {
                    minimalNTPLatency = b.ntpLatency;
                    minimalNTPLatencyDelta = (b.localClockNow - ntpAdjustedTime);
                }
            }

            if (totalSampleCount === 0) {
                iReject("No Samples");
            }

            const averageNTPDelta = totalServerNTPDelta / totalSampleCount;
            const averageNTPLatency = totalServerNTPLatency / totalSampleCount;

            console.log(
                `Average Server - NTP Delta is ${averageNTPDelta} ms, ${totalSampleCount} samples,` +
                `${averageNTPLatency} ms average latency`
            );
            console.log(
                `Minimal Latency Server - NTP Delta is ${minimalNTPLatencyDelta} ms, ${totalSampleCount} samples,` +
                `${minimalNTPLatency} ms minimum latency`
            );
            iResolve({
                averageNTPDelta,
                averageNTPLatency,
                minimalNTPLatencyDelta,
                minimalNTPLatency,
                totalSampleCount
            });
        }).catch((err) => {
            iReject(err);
        });
    });
}

module.exports = {
    ntpLocalClockDeltaPromise
};
