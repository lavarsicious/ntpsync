"use strict";

var ntpClient = require('ntp-client');
var gReq = 0;

var kDefaultLocalClockService = {
    Now: function Now() {
        return Date.now();
    }
};

var kDefaultServerCarousel = ["0.pool.ntp.org", "1.pool.ntp.org", "2.pool.ntp.org", "3.pool.ntp.org"];

var kDefaultTimeoutLatencyMS = 500;

/**
 * Creates a promise that resolves with an Date object after a successful NTP server query
 * @param {Object} iNTPSingleRequestConfig: Optional Custom Parameters object
 *  {fLocalClockService: , fServerCarousel: ,fTimeoutLatencyMS: }:
 *
 *  fLocalClockService: an service object with a Now() function that returns current local time in Unix milliseconds.
 *  Default value: kDefaultLocalClockService, which is just a wrapper for Date.now();
 *
 *  fServerCarousel: an Array of Strings, IP Addresses of a server pool
 *  Default value: kDefaultServerCarousel
 *
 *  fTimeoutLatencyMS: a timeout in milliseconds, when to bail on an NTP request
 *  Default value: kDefaultTimeoutLatencyMS
 *
 * @return {Promise} Promise that either resolves with successful Date object or an NTP server communication
 * error
 */
function ntpDatePromise(iNTPSingleRequestConfig) {

    var customClockService = iNTPSingleRequestConfig && iNTPSingleRequestConfig.fLocalClockService;
    var customServerCarousel = iNTPSingleRequestConfig && iNTPSingleRequestConfig.fServerCarousel;
    var customTimeoutLatencyMS = iNTPSingleRequestConfig && iNTPSingleRequestConfig.fTimeoutLatencyMS;

    // TIME-server query via ntp: https://github.com/moonpyk/node-ntp-client
    var clockService = customClockService || kDefaultLocalClockService;
    var serverCarousel = customServerCarousel || kDefaultServerCarousel;
    var timeoutLatency = customTimeoutLatencyMS || kDefaultTimeoutLatencyMS;

    return new Promise(function (iResolveFunc, iRejectFunc) {

        // See http://www.pool.ntp.org/en/ for usage information
        // http://www.ntp.org/ About NTP protocol
        // Or just google for "gps clock time server"
        var serverAddress = serverCarousel[gReq % serverCarousel.length];
        // console.log(`NTP Req ${gReq}: Pinging ${serverAddress}`);

        // const startedReq = gReq;
        gReq += 1;
        var localClockStart = clockService.Now();

        ntpClient.ntpReplyTimeout = timeoutLatency;
        ntpClient.getNetworkTime(serverAddress, 123, function (iError, iDate) {

            if (iError) {
                iRejectFunc(iError);
                return;
            }

            var localClockNow = clockService.Now();
            var latency = localClockNow - localClockStart;

            iResolveFunc({
                localClockNow: localClockNow,
                ntpRaw: iDate.getTime(),
                ntpLatency: latency
            });
        });
    });
}

module.exports = {
    ntpDatePromise: ntpDatePromise
};