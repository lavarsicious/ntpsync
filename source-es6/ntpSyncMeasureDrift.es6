const ntpsync = require('./ntpsync');
const fs = require('fs');

const Spinner = require('cli-spinner').Spinner;

const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');
spinner.start();

let gStartTime = Date.now();

const logDrift = (iNTPData) => {

    const dateNow = new Date();

    console.log(`"${dateNow.toISOString()}Delta = ${iNTPData.minimalNTPLatencyDelta} ms"`);

    const secondsSinceStart = (dateNow.getTime() - gStartTime) / 1000;

    const driftString = secondsSinceStart.toString() + ", " + iNTPData.minimalNTPLatencyDelta + "\n";

    fs.appendFile('driftlog.csv', driftString, (err) => {
        if (err) {
            throw err;
        }
        console.log(`${driftString}`);
    });
};

const sampleDrift = () => {

    ntpsync.ntpLocalClockDeltaPromise().then(logDrift);

}

sampleDrift();

setInterval(sampleDrift, 60000);
