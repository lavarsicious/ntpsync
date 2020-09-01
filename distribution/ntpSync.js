"use strict";

var ntpBurstRequest = require('./ntpBurstRequest');

/**
 * Creates a promise
 * @return {Promise} Promise that either resolves with an average number of milliseconds
 * local clock (Date.now())  is ahead of NTP or an NTP server communication error
 */
var gPromiseIsRunning = 0;

function ntpLocalClockDeltaPromise(iNTPBurstConfig) {
    return new Promise(function (iResolve, iReject) {

        if (gPromiseIsRunning > 0) {
            throw new Error("ERROR! Tried a ntpsync request concurrently!");
        }

        gPromiseIsRunning += 1;
        var burstDataPromise = ntpBurstRequest.ntpDatePromiseBurstTimeout(iNTPBurstConfig);

        burstDataPromise.then(function (iBurstDataArray) {

            // console.log("SUCCESS: " + JSON.stringify(iBurstDataArray));
            var totalServerNTPDelta = 0;
            var totalServerNTPLatency = 0;
            var totalSampleCount = 0;

            var minimalNTPLatency = 1000000000;
            var minimalNTPLatencyDelta = 0;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = iBurstDataArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var b = _step.value;

                    var ntpAdjustedTime = b.ntpRaw + b.ntpLatency * 0.5;
                    totalServerNTPDelta += b.localClockNow - ntpAdjustedTime;
                    totalSampleCount += 1;
                    totalServerNTPLatency += b.ntpLatency;

                    if (b.ntpLatency < minimalNTPLatency) {
                        minimalNTPLatency = b.ntpLatency;
                        minimalNTPLatencyDelta = b.localClockNow - ntpAdjustedTime;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (gPromiseIsRunning != 1) {
                throw new Error("Synchronization Error");
            }

            gPromiseIsRunning = 0;

            if (totalSampleCount === 0) {
                iReject("No Samples");
            }

            var averageNTPDelta = totalServerNTPDelta / totalSampleCount;
            var averageNTPLatency = totalServerNTPLatency / totalSampleCount;

            // console.log(
            //     `Average Server - NTP Delta is ${averageNTPDelta} ms, ${totalSampleCount} samples,` +
            //     `${averageNTPLatency} ms average latency`
            // );
            // console.log(
            //     `Minimal Latency Server - NTP Delta is ${minimalNTPLatencyDelta} ms, ${totalSampleCount} samples,` +
            //     `${minimalNTPLatency} ms minimum latency`
            // );
            iResolve({
                averageNTPDelta: averageNTPDelta,
                averageNTPLatency: averageNTPLatency,
                minimalNTPLatencyDelta: minimalNTPLatencyDelta,
                minimalNTPLatency: minimalNTPLatency,
                totalSampleCount: totalSampleCount
            });
        }).catch(function (err) {

            if (gPromiseIsRunning != 1) {
                throw new Error("Synchronization Error");
            }
            gPromiseIsRunning = 0;

            iReject(err);
        });
    });
}

module.exports = {
    ntpLocalClockDeltaPromise: ntpLocalClockDeltaPromise
};