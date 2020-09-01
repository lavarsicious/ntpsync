'use strict';

var Q = require('q');
var ntpSingleRequest = require('./ntpSingleRequest');

/**
 * Creates a promise that resolves whenever iTimeMS milliseconds pass.
 * @param {Number} iTimeMS: Time To Pass.
 * @param {Object} iTimeoutService: a wrapper for setTimeout
 * @return {Promise} Promise that resolves with nothing, after iTimeMS milliseconds after instantiation
 * NOTE: Promise does not reject.
 */
function delay(iTimeMS, iTimeoutService) {
    return new Promise(function (iResolve) {
        iTimeoutService.setTimeout(iResolve, iTimeMS);
    });
}

var kDefaultRequestedSuccessfulSampleCount = 4;
var kDefaultBurstTimeoutMS = 4000;
var kDefaultTimeoutService = {
    setTimeout: setTimeout /* Default Node.JS timeout */
};

var kDefaultSingleNTPRequestService = {
    ntpDatePromise: ntpSingleRequest.ntpDatePromise
};

/**
 * Same as ntpDatePromiseBurst, but with added timeout for rejection.
 * Creates a promise that resolves with an Date object after a successful burst of X NTP server queries, or
 * rejects if operation does not complete in the alloted time.
 * @param {Object} iMultiNTPRequestConfig: an optional config object
 *
 * {iNTPSingleRequestConfig} - all the fields of the single-request config, see ntpSingleRequest.es6 for details
 *
 * fRequestedSuccessfulSampleCount: How many successful pings do you want to have in your result calculations?
 * Default value: kDefaultRequestedSuccessfulSampleCount
 *
 * fBurstTimeoutMS: Total allotted timeout for the entire burst to execute. If it times out, the promise rejects.
 * Default value: kDefaultBurstTimeoutMS
 *
 * fTimeoutService: Akin to an $AngularJS dependency injection, a service with setTimeout() function
 * Default value: kDefaultTimeoutService, which is just the wrapper for standard setTimeout
 *
 * fSingleNTPRequestService : Akin to an $AngularJS dependency injection, a service with ntpDatePromise() function.
 * A function returns a promise of completing/failing a single NTP ping.
 * See ntpDatePromise() in ntpSingleRequest.es6 for parameter description.
 *
 * @return {Promise} Promise that resolves with array of X elements of NTP dates , latencies and local times
 * after a successful completion of X NTP pings.
 * Promise rejects, rejects if the burst operation does not complete in the alloted time (iTimeoutMS milliseconds).
 */
function ntpDatePromiseBurstTimeout(iMultiNTPRequestConfig) {

    var indefiniteNTPPingSequencePromise = function indefiniteNTPPingSequencePromise(iNTPSingleRequestPromiseFunc, iNTPSingleRequestConfig, iRequestedSuccessfulSampleCount) {

        // This function executes NTP pings in sequence till we reach the quota of successful pings
        // Using a pattern described here: http: //stackoverflow.com/questions/17217736/while-loop-with-promises

        var deferred = Q.defer();

        var burstArray = []; //Result array to keep all of our successful NTP ping results
        var singleNTPRequestInnerPromise = function singleNTPRequestInnerPromise() {
            return new Promise(function (iResolve /* , iReject */) {

                // This inner Promise function does not reject any promises, nor does it resolve with any data.
                // When an NTP request completes, if successful, the result is added to burstArray.
                // the iResolve() callback is only used to signal the outer mechanism
                // (see below) that the operation is complete.

                iNTPSingleRequestPromiseFunc(iNTPSingleRequestConfig).then(function (data) {
                    // Success: add the result to samples
                    // console.log("OK " + JSON.stringify(data));
                    burstArray.push(data);
                    iResolve();
                }).catch(function (err) {
                    // Failure: Move on to the next one
                    // console.log("ERR " + JSON.stringify(err));
                    iResolve();
                });
            });
        };

        var needMoreNTPRequestsCondition = function needMoreNTPRequestsCondition() {
            return burstArray.length < iRequestedSuccessfulSampleCount;
        };

        var loop = function loop() {
            // When the result of calling `needMoreNTPRequests` is no longer true, we are
            // done.
            if (needMoreNTPRequestsCondition() === false) {
                return deferred.resolve(burstArray);
            }
            // Use `when`, in case `body` does not return a promise.
            // When it completes loop again otherwise, if it fails, reject the
            // done promise
            Q.when(singleNTPRequestInnerPromise(), loop, deferred.reject);
        };

        // Start running the loop in the next tick so that this function is
        // completely async. It would be unexpected if `singleNTPRequest` was called
        // synchronously the first time.
        Q.nextTick(loop);

        // The promise is returned
        return deferred.promise;
    };

    var singleRequestConfig = {
        fLocalClockService: iMultiNTPRequestConfig && iMultiNTPRequestConfig.fLocalClockService,
        fServerCarousel: iMultiNTPRequestConfig && iMultiNTPRequestConfig.fServerCarousel,
        fTimeoutLatencyMS: iMultiNTPRequestConfig && iMultiNTPRequestConfig.fTimeoutLatencyMS
    };

    var customRequestedSuccessfulSampleCount = iMultiNTPRequestConfig && iMultiNTPRequestConfig.fRequestedSuccessfulSampleCount;
    var requestedSuccessfulSampleCount = customRequestedSuccessfulSampleCount || kDefaultRequestedSuccessfulSampleCount;

    var customBurstTimeoutMS = iMultiNTPRequestConfig && iMultiNTPRequestConfig.fBurstTimeoutMS;
    var burstTimeoutMS = customBurstTimeoutMS || kDefaultBurstTimeoutMS;

    var customTimeoutService = iMultiNTPRequestConfig && iMultiNTPRequestConfig.fTimeoutService;
    var timeoutService = customTimeoutService || kDefaultTimeoutService;

    var customSingleNTPRequestService = iMultiNTPRequestConfig && iMultiNTPRequestConfig.fSingleNTPRequestService;
    var singleNTPRequestService = customSingleNTPRequestService || kDefaultSingleNTPRequestService;

    var indefinitentpDatePromiseBurst = indefiniteNTPPingSequencePromise(singleNTPRequestService.ntpDatePromise, singleRequestConfig, requestedSuccessfulSampleCount);

    var throwTimeoutErrorFunc = function throwTimeoutErrorFunc() {
        throw new Error('Operation timed out');
    };

    return Promise.race([indefinitentpDatePromiseBurst, delay(burstTimeoutMS, timeoutService).then(throwTimeoutErrorFunc)]);
}

module.exports = {
    ntpDatePromiseBurstTimeout: ntpDatePromiseBurstTimeout
};