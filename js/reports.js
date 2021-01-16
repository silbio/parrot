const fs = require('fs');

module.exports = {
    setUp: function () {
        // let CronJob = require('cron').CronJob;
        // let job = new CronJob('0,30 * * * * *', function() {
        makeReport('2021-01-05');
        //     }, null, true, 'Europe/Madrid');
        //     job.start();
    }
}

function makeReport(date) {
    fs.readFile('logs/silb.' + date + '.log', 'utf8', function (err, logData) {
        if (err) {
            logger.error('Error generating report for: ' + date + '\nError: ' + err);
        } else {
            let reportData = {}
            let parsedData = logData.substring(1).split('\n* ');
            parsedData.forEach((logLine, i) => {
                let regex = /([A-Z]{4,5})\s(\d{4}\/\d{2}\/\d{2}-\d{2}.\d{2}.\d{2})\s(\/.*:\d*)\s(.*)/gs;
                let matches = regex.exec(logLine);
                parsedData[i] = {
                    level: matches[1],
                    timestamp: matches[2],
                    origin: matches[3],
                    message: matches[4]
                }
            })

            let filteredData = sortData(parsedData);

            console.log(parsedData);


        }
    })
}

function sortData(parsedData) {
    let sortedData = {};
    let filters = {
        inits: 'Init sequence called',
        userConnections: 'connected from IP',
        userIterationResultsInit: "has no iteration results"
    }
    parsedData.forEach((line) => {
        for (let key in filters){
            sortedData[key] = sortedData[key] || [];
           if(line.message.indexOf(filters[key]) > -1){
               delete line.level;
               delete line.origin;
               sortedData[key].push(line);
           }
        }
    })

    return sortedData;
}