const ntpBurstRequest = require('./ntpBurstRequest');

/**
 * Creates a promise
 * @return {Promise} Promise that either resolves with an average number of milliseconds
 * local clock (Date.now())  is ahead of NTP or an NTP server communication error
 */
let gPromiseIsRunning = 0;

function ntpLocalClockDeltaPromise(iNTPBurstConfig) {
    return new Promise((iResolve, iReject) => {

        if (gPromiseIsRunning > 0) {
            throw new Error("ERROR! Tried a ntpsync request concurrently!");
        }

        gPromiseIsRunning += 1;
        const burstDataPromise = ntpBurstRequest.ntpDatePromiseBurstTimeout(iNTPBurstConfig);

        burstDataPromise.then((iBurstDataArray) => {

            // console.log("SUCCESS: " + JSON.stringify(iBurstDataArray));
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

            if (gPromiseIsRunning != 1) {
                throw new Error("Synchronization Error");
            }

            gPromiseIsRunning = 0;

            if (totalSampleCount === 0) {
                iReject("No Samples");
            }

            const averageNTPDelta = totalServerNTPDelta / totalSampleCount;
            const averageNTPLatency = totalServerNTPLatency / totalSampleCount;

            // console.log(
            //     `Average Server - NTP Delta is ${averageNTPDelta} ms, ${totalSampleCount} samples,` +
            //     `${averageNTPLatency} ms average latency`
            // );
            // console.log(
            //     `Minimal Latency Server - NTP Delta is ${minimalNTPLatencyDelta} ms, ${totalSampleCount} samples,` +
            //     `${minimalNTPLatency} ms minimum latency`
            // );
            iResolve({
                averageNTPDelta,
                averageNTPLatency,
                minimalNTPLatencyDelta,
                minimalNTPLatency,
                totalSampleCount
            });
        }).catch((err) => {

            if (gPromiseIsRunning != 1) {
                throw new Error("Synchronization Error");
            }
            gPromiseIsRunning = 0;

            iReject(err);
        });
    });
}

module.exports = {
    ntpLocalClockDeltaPromise
};
