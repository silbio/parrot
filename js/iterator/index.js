//Puppeteer and plugins
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


//Utils
const {v4: uuidv4} = require('uuid');
const userAgentString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 FS';
const pageMaker = require('./pageMaker');


//Initialize
async function init() {
    return new Promise(async resolve => {
        logger.info('Iterator initialized.');

        global.pages = {};

        let browserOptions = {

            args: [
                `--user-agent=${userAgentString}`
            ],

        }
        if (process.env.NODE_ENV === 'development') {
            browserOptions.headless = false;
            browserOptions.executablePath = '/usr/bin/google-chrome-stable';
        }

        global.browser = await puppeteer.launch(
            browserOptions
        );
        global.iterationResults = {};
        global.activeUsers = {};
        resolve();
    })
}


async function refresh(provincePath, procedureCode, rowId, username) {
    let pageId = await uuidv4();
    pages[pageId] = pages[pageId] || {}
    pages[pageId].rowId = rowId;
    logger.info(username + ' has requested a new Iterator Cycle', {
        username: username,
        reportingGroup: 1,
        groupIndex: 7,
        provincePath: provincePath,
        procedureCode: procedureCode
    });
    pageMaker.run(pageId, provincePath, procedureCode, userAgentString)
        .then((resolution) => {
            logger.info(JSON.stringify(resolution), {
                username: username,
                reportingGroup: 1,
                groupIndex: 8,
                provincePath: provincePath,
                procedureCode: procedureCode
            });

            if (resolution.offices.length > 0) {
                logger.info('Successful Iteration', {
                    username: username,
                    reportingGroup: 1,
                    groupIndex: 9,
                    provincePath: provincePath,
                    procedureCode: procedureCode
                })
            }
            iterationResults[username][rowId].provincePath = provincePath;
            iterationResults[username][rowId].procedureCode = procedureCode;
            iterationResults[username][rowId].offices = resolution.offices;
            iterationResults[username][rowId].finished = true;
            pages[pageId].page.goto('about:blank').then(() => {
                pages[pageId].page.close();
            })

        }).catch(err => {
        logger.warn(JSON.stringify(err));
        iterationResults[username][rowId].finished = true;
        pages[pageId].page.goto('about:blank').then(() => {
            pages[pageId].page.close();
        });
    });
}


module.exports = {init, refresh}