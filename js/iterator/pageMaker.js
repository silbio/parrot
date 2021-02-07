const utils = require('../utils');
const stages = require("./stages");
const PuppeteerHar = require('puppeteer-har');

module.exports = {
    run(pageId, provincePath, procedureName, userAgentString) {
        return new Promise(async (mainResolve, mainReject)=>{
            let context = await browser.createIncognitoBrowserContext();
            pages[pageId].page =  await context.newPage();
            pages[pageId].har = new PuppeteerHar(pages[pageId].page);
            await pages[pageId].har.start({path: './logs/hars/' + utils.getTimeStampInLocaLIso() + '_' + pageId + '.har'});
            logger.info('pageId ' + pageId + ' assigned to ' + provincePath + ' - ' + procedureName);

            //Change user agent

            await pages[pageId].page.setUserAgent(userAgentString);

            //Change Navigator object values
            await pages[pageId].page.evaluateOnNewDocument((userAgentString) => {
                let open = window.open;

                window.open = (...args) => {
                    let newPage = open(...args);
                    Object.defineProperty(newPage.navigator, 'userAgent', {get: () => userAgentString});
                    return newPage;
                }
                window.open.toString = () => 'function open() { [native code] }'
                Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
                Object.defineProperty(navigator, 'productSub', {get: () => '20030107'});
                Object.defineProperty(navigator, 'vendor', {get: () => 'Google Inc.'});
                Object.defineProperty(navigator, 'oscpu', {get: () => undefined});
                Object.defineProperty(navigator, 'cpuClass', {get: () => undefined});
            }, userAgentString);

            // if(!global.captchaServiceDown) {
            //     captchaControl.request(pageId).catch((err) => {
            //         mainReject(err);
            //     });
            // }

            pages[pageId].page.on('console', (msg) => {
                let msgText = msg.text();
                if (msgText !== 'Failed to load resource: net::ERR_FAILED') {
                    logger.debug('Log from page ' + 'pageId: ' + pageId + ' msgText: ' + msgText);
                }
            });
            pages[pageId].page.on('dialog', async dialog => {
                let clickResult = await dialog.accept();
            });
            await pages[pageId].page.setDefaultNavigationTimeout(process.env.NODE_ENV === "development" ? 0 : 20000);
            await pages[pageId].page.setRequestInterception(true);
            pages[pageId].page.on('request', (request) => {
                if (['image', 'stylesheet', 'font', 'x-icon'].indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });
            await pages[pageId].page.goto('https://sede.administracionespublicas.gob.es'+ provincePath);

            new Promise(((stagesResolve, stagesReject) => {
                stages.init(pageId, procedureName, stagesResolve, stagesReject)
            }))
                .then((results) => {
                    mainResolve(results);
                }).catch(async (err) => {
                mainReject(err);
            })
        })

    }
}