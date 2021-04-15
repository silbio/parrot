const path = require('path');

//Logging
const log4js = require("log4js");
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[%d %p%] %f:%l %x{reportingCode}',
                tokens: {
                    reportingCode: logEvent => {
                        return logEvent.data[0] + (logEvent.data.length > 1 ? ' ~#~' + JSON.stringify(logEvent.data[1]) : '')
                    }
                }
            }
        },
        file: {
            type: 'dateFile',
            filename: path.join(__dirname, '../logs/silb.log'),
            keepFileExt: true,
            compress: false,
            layout: {
                type: 'pattern',
                pattern: '* %p %d{yyyy/MM/dd-hh.mm.ss} %f:%l %x{reportingCode}',
                tokens: {
                    reportingCode: logEvent => {
                        return logEvent.data[0] + (logEvent.data.length > 1 ? ' ~#~' + JSON.stringify(logEvent.data[1]) : '')
                    }

                }
            }
        }

    },
    categories: {
        default: {appenders: ['console', 'file'], level: 'debug', enableCallStack: true}
    }
});
global.logger = log4js.getLogger();
logger.level = 'debug';