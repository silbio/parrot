const fs = require('fs');
const path = require('path');

module.exports = {
    make: function (date) {
        return new Promise((resolve, reject) => {
            date = !date ? '' : date + '.';
            let reportPath = path.join(__dirname, '../logs/reports/') + 'report' + date + 'txt'
            if(fs.existsSync(reportPath)){
                resolve(reportPath);
            }
            else {
                fs.readFile('logs/silb.' + date + 'log', 'utf8', function (err, logData) {
                    if (err) {
                        logger.error('Error generating report for: ' + date + '\nError: ' + err);
                        reject('Report unavailable');
                    } else {
                        let reportIndecesMap = {
                            'system':
                                {
                                    'ServiceStarted': 0,
                                    'CaptchaRequested': 0,
                                    'CaptchaReceived': 0,
                                    'CaptchaFailed': 0
                                },
                            'user':
                                {
                                    'FailLogin': 0,
                                    'SuccessLogin': 0,
                                    'NewRegistration': 0,
                                    'FailPasswordReset': 0,
                                    'SuccessPasswordReset': 0,
                                    'IPSwitch': 0,
                                    'UserBeginIteratorSession': 0,
                                    'UserRequestsIteratorCycle': 0,
                                    'UserReceiveIterationResults': 0,
                                    'UserReceiveSuccessfulIterationResult':0,
                                    'UserLogout': 0,
                                    'UserErrorOut': 0
                                }
                        }

                        let userCount = {};

                        let systemKeys = Object.keys(reportIndecesMap.system);
                        let userKeys = Object.keys(reportIndecesMap.user);
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
                                    currentLineObj.provincePath = reportObj.provincePath
                                }
                                if (reportObj.hasOwnProperty('procedureCode')) {
                                    currentLineObj.procedureCode = reportObj.procedureCode
                                }

                                switch (reportObj.reportingGroup) {
                                    case 0:

                                        reportIndecesMap.system[systemKeys[reportObj.groupIndex]]++
                                        break;
                                    case 1:
                                        if (!userCount.hasOwnProperty(reportObj.username)) {
                                            userCount[reportObj.username] = {...reportIndecesMap.user};
                                        }
                                        userCount[reportObj.username][userKeys[reportObj.groupIndex]]++
                                        break;
                                }

                            }
                        })


                        let reportString = `
System stats:
            ServiceStarted ${reportIndecesMap.system.ServiceStarted} times.
            CaptchaRequested ${reportIndecesMap.system.CaptchaRequested} times.
            CaptchaReceived ${reportIndecesMap.system.CaptchaReceived} times.
            CaptchaFailed ${reportIndecesMap.system.CaptchaFailed} times.
User stats:
            ${JSON.stringify(userCount, null, 4).replace(/[{},]/gs, '')};
`

                        fs.writeFileSync(reportPath, reportString);
                        resolve(reportPath);
                    }
                })
            }


        })
    }
}

