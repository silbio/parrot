//Puppeteer and plugins
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


//Utils
const {v4: uuidv4} = require('uuid');
const tryInterval = 2000;
const userAgentString = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 FS';
const nodeEnv = process.env.NODE_ENV;
const pageMaker = require('./pageMaker');


//Initialize
async function init() {
    global.pages = {};

    global.browser = await puppeteer.launch(
        {
            headless: nodeEnv !== 'development',
            //slowMo: 100,
            args: [
                `--user-agent=${userAgentString}`
            ]
        }
    );
}


async function start(provincePath, procedureName, rowId) {

    return new Promise(async (resolve, reject) => {
        let pageId = await uuidv4();
        pages[pageId] = pages[pageId] || {}
        pages[pageId].rowId = rowId;
        pageMaker.run(pageId, provincePath, procedureName, userAgentString)
            .then((resolution) => {
                logger.info(resolution);
                if (resolution.msg === 'success') {
                    resolve({rowId: rowId, offices: resolution.offices});
                    logger.info('!!!!!!!!!!' + provincePath + ' ' + procedureName + ' found turns!!!!!!!!!!');
                    pages[pageId].page.waitForTimeout(tryInterval).then(() => {
                        logger.info('Waited for ' + tryInterval + '. Now restarting.')
                        pageMaker.run(pageId, provincePath, procedureName, userAgentString);
                    });
                }
            }).catch(err => {
            if (err.reset) {
                logger.warn(pageId + ' reset' + (err.name === 'TimeoutError' ? ' due to a page timeout.' : ' due to error: ' + err.message));
                pages[pageId].page.waitForTimeout(tryInterval).then(() => {
                    logger.info('Waited for ' + tryInterval + '. Now restarting.')
                    pageMaker.run(pageId, provincePath, procedureName, userAgentString);
                });

            } else if (err.message.indexOf('Navigation failed because browser has disconnected!') > -1) {
                resolve(false);
            } else {
                logger.error(err);
                pages[pageId].page.close();
                reject(err);
            }
        });
    })


}

async function stop(rowId) {


    for (let pageId in pages) {
        if (pages[pageId].rowId === rowId) {
            pages[pageId].page.close();
            logger.warn('pageId: ' + pageId + ' stopped at ' + rowId);
        }
    }


}

module.exports = {init, start, stop}