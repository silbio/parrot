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
    logger.info('Init sequence called.');
    global.pages = {};
    global.browser = await puppeteer.launch(
        {
            headless: process.env.NODE_ENV !== 'development',
            args: [
                `--user-agent=${userAgentString}`
            ]
        }
    );
    global.iterationResults = {};
    global.activeUsers = {};
    logger.debug('iterationResults initialized. ' + JSON.stringify(iterationResults) );
}


async function refresh(provincePath, procedureCode, rowId, username) {
    let pageId = await uuidv4();
    pages[pageId] = pages[pageId] || {}
    pages[pageId].rowId = rowId;
    pageMaker.run(pageId, provincePath, procedureCode, userAgentString)
        .then((resolution) => {
            logger.info(resolution);
            iterationResults[username][rowId].provincePath = provincePath;
            iterationResults[username][rowId].procedureCode = procedureCode;
            iterationResults[username][rowId].offices = resolution.offices;
            iterationResults[username][rowId].finished = true;
            logger.info('returning Iteration result');
            pages[pageId].page.goto('about:blank').then(() => {
                pages[pageId].page.close();
            })

        }).catch(err => {
        logger.warn(err);
        iterationResults[username][rowId].finished = true;
        pages[pageId].page.goto('about:blank').then(() => {
            pages[pageId].page.close();
        });
    });
}


module.exports = {init, refresh}