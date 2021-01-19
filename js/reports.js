const fs = require('fs');

module.exports = {
    setUp: function () {
        return new Promise(resolve => {
            logger.info('Reporting initialized')
            let CronJob = require('cron').CronJob;
            let job = new CronJob('0 48 22 * * *', function() {
                let d = new Date();
                d.setDate(d.getDate()-1);

               let yesterday=  (d.getFullYear() + '-' + (('0' + (d.getMonth()+1)).slice(-2)) + '-'+ ('0' + d.getDate()).slice(-2))
            makeReport(yesterday);

                }, null, true, 'Europe/Madrid');
                job.start();
                resolve();
        })
    }
}

function makeReport(date) {
    fs.readFile('logs/silb.' + date + '.log', 'utf8', function (err, logData) {
        if (err) {
            logger.error('Error generating report for: ' + date + '\nError: ' + err);
        } else {
            let reportingGroups = [
                //System
                [
                    //'ServiceStarted':
                    []
                ]
                ,
                //User
                [
                    // 'FailLogin':
                    [],
                    // 'SuccessLogin':
                    [],
                    // 'NewRegistration':
                    [],
                    // 'FailPasswordReset':
                    [],
                    // 'SuccessPasswordReset':
                    [],
                    // 'IPSwitch':
                    [],
                    // 'UserBeginIteratorSession':
                    [],
                    // 'UserRequestsIteratorCycle':
                    [],
                    // 'UserReceiveIterationResults':
                    [],
                    // 'UserLogout':
                    [],
                    // 'UserErrorOut':
                    []
                ],
                //Captcha
                [
                    // 'CaptchaRequested':
                    [],
                    // 'CaptchaReceived':
                    [],
                    // 'CaptchaFailed':
                    []
                ]
            ]
            let parsedData = logData.substring(1).split('\n* ');
            parsedData.forEach((logLine, i) => {
                console.log(i);
                if (logLine.indexOf('~#~') > -1) {
                    let regex = /([A-Z]{4,5})\s(\d{4}\/\d{2}\/\d{2}-\d{2}.\d{2}.\d{2})\s(\/.*:\d*)\s(\D.*)~#~(\{.*})/gs;
                    let matches = regex.exec(logLine);
                    let reportObj = JSON.parse(matches[5]);

                    let currentLineObj = {
                        level: matches[1],
                        timestamp: matches[2],
                        origin: matches[3],
                        message: matches[4],
                        reportingGroup: reportObj.reportingGroup,
                        groupIndex: reportObj.groupIndex
                    }
                    if (reportObj.hasOwnProperty('username')) {
                        currentLineObj.username = reportObj.username;

                    }
                    if (reportObj.hasOwnProperty('siteKey')) {
                        currentLineObj.siteKey = reportObj.siteKey
                    }
                    if (reportObj.hasOwnProperty('provincePath')) {
                        currentLineObj.provincePath = reportObj.username
                    }
                    if (reportObj.hasOwnProperty('procedureCode')) {
                        currentLineObj.procedureCode = reportObj.procedureCode
                    }

                    reportingGroups[reportObj.reportingGroup][reportObj.groupIndex].push(currentLineObj);
                }
            })




            console.log(reportingGroups);


        }
    })
}

