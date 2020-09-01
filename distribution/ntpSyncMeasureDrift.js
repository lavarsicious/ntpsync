'use strict';

var ntpsync = require('./ntpsync');
var fs = require('fs');

var Spinner = require('cli-spinner').Spinner;

var spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
spinner.start();

var gStartTime = Date.now();

var logDrift = function logDrift(iNTPData) {

    var dateNow = new Date();

    console.log('"' + dateNow.toISOString() + 'Delta = ' + iNTPData.minimalNTPLatencyDelta + ' ms"');

    var secondsSinceStart = (dateNow.getTime() - gStartTime) / 1000;

    var driftString = secondsSinceStart.toString() + ", " + iNTPData.minimalNTPLatencyDelta + "\n";

    fs.appendFile('driftlog.csv', driftString, function (err) {
        if (err) {
            throw err;
        }
        console.log('' + driftString);
    });
};

var sampleDrift = function sampleDrift() {

    ntpsync.ntpLocalClockDeltaPromise().then(logDrift);
};

sampleDrift();

setInterval(sampleDrift, 60000);