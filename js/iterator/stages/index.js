const path = require('path');
const utils = require("../../utils");
const captchaControl = require("../captchaControl");

let processes = [];
let numberOfStages = 0;
let stageSuccessCriteria = [
    {
        urls: ['https://sede.administracionespublicas.gob.es/icpplustie/citar',
            'https://sede.administracionespublicas.gob.es/icpplus/citar',
            'https://sede.administracionespublicas.gob.es/icpco/citar',
            'https://sede.administracionespublicas.gob.es/icpplustiem/citar'],
        idTraits: {selector: 'select[id="tramiteGrupo[0]"]', contents: 'despliegue'},
        stage: 0
    },
    {
        urls: ['https://sede.administracionespublicas.gob.es/icpplus/acInfo',
            'https://sede.administracionespublicas.gob.es/icpplustieb/acInfo',
            'https://sede.administracionespublicas.gob.es/icpplustiem/acInfo',
            'https://sede.administracionespublicas.gob.es/icpco/acInfo',
            'https://sede.administracionespublicas.gob.es/icpplustie/acInfo'],
        idTraits: {selector: 'form[action^="acEntrada"]', contents: ''},
        stage: 1
    },
    {
        urls: ['https://sede.administracionespublicas.gob.es/icpplus/acEntrada',
            'https://sede.administracionespublicas.gob.es/icpplustieb/acEntrada',
            'https://sede.administracionespublicas.gob.es/icpplustiem/acEntrada',
            'https://sede.administracionespublicas.gob.es/icpco/acEntrada'
        ],
        idTraits: {selector: 'input[id="txtDesCitado"]', contents: ''},
        stage: 2
    },
    {
        urls: ['https://sede.administracionespublicas.gob.es/icpplus/acValidarEntrada',
            'https://sede.administracionespublicas.gob.es/icpplustieb/acValidarEntrada'],
        idTraits: {selector: 'input[id="btnConsultar"]', contents: ''},
        stage: 3
    },
    {
        urls: ['https://sede.administracionespublicas.gob.es/icpplus/acCitar',
            'https://sede.administracionespublicas.gob.es/icpplustieb/acCitar',
            'https://sede.administracionespublicas.gob.es/icpplustiem/acCitar',
            'https://sede.administracionespublicas.gob.es/icpco/acCitar'
        ],
        idTraits: {selector: 'select[id="idSede"]', contents: ''},
        stage: 4
    },
    {
        urls: ['about:blank'],
        idTraits: {selector: '', contents: ''},
        stage: 5
    }
]
// let errorPages = [
//     'https://sede.administracionespublicas.gob.es/icpplus/infogenerica'
// ]
let normalizedPath = path.join(__dirname, '.');
require("fs").readdirSync(normalizedPath).forEach(function (file) {

    if (file.indexOf('stage_') >= 0) {
        numberOfStages++;
        processes[file.split(/[_.]/)[1]] = require(path.join(normalizedPath, file));
    }
});
let pageMakerPromises = {}

function init(pageId, procedureCode, resolve, reject) {
    pages[pageId].reloadCounter = 0;
    iterate(pageId, 0, procedureCode);
    pageMakerPromises[pageId] = {resolve: resolve, reject: reject}

}


function iterate(pageId, stage, procedureCode = null) {

    logger.debug('Iterating stage ' + stage + ' of pageId ' + pageId)
    let navPromise = pages[pageId].page.waitForNavigation();
    let processPromise = new Promise((resolve, reject) => {
        let runArgs = [pageId, resolve, reject];
        if (procedureCode) {
            runArgs.push(procedureCode)
        }
        processes[stage].run(...runArgs);
    })
    // let pageMetrics = pages[pageId].page.metrics();

    Promise.all([processPromise, navPromise])
        .then(async (results) => {

            //Get resolutions
            let processResolution = results[0];
            let navigationResolution = results[1];
            logger.debug('Stage ' + stage + ' for pageId ' + pageId + ' finished with resolution: ' + processResolution.msg + '.');
            pages[pageId].isReload = false;

            stage++;

            if (stage === numberOfStages) {
                pageMakerPromises[pageId].resolve(processResolution);
                await pages[pageId].page.screenshot({path: 'logs/screenshots/success-' + utils.getTimeStampInLocaLIso() + pageId + '.png',
                    fullPage: true});
                logger.info('HAR File recorded for pageId: ' + pageId);
                await pages[pageId].har.stop();
                return true;
            }

            let pageUrl = navigationResolution._url.split(/[?;]/)[0];
            let successUrls = stageSuccessCriteria[stage].urls;
            let successUrlIsValid = successUrls.includes(pageUrl);


            //Check if page is correct by matching traits
            let matchesStageTraits = await utils.checkPageIdTraits(pageId, stageSuccessCriteria[stage].idTraits.selector, stageSuccessCriteria[stage].idTraits.contents);

            //Look for captchas

            let captchaOptions = await captchaControl.detect(pageId);


//Check for exceptions
            let matchesPreviousStageTraits = await utils.checkPageIdTraits(pageId, stageSuccessCriteria[stage - 1].idTraits.selector, stageSuccessCriteria[stage - 1].idTraits.contents);
            let urlMatchesPreviousStage = stageSuccessCriteria[stage - 1].urls.includes(pageUrl);


//First option checks for success urls in which the content from the last step is held, usually due to captcha failures.
            //Second option checks if the page was reloaded.
            if (matchesPreviousStageTraits || urlMatchesPreviousStage) {
                pages[pageId].isReload = true;
                if (captchaOptions.siteKey) {
                    logger.info('Captcha Failed, page reloaded.', {reportingGroup: 2, groupIndex:2, siteKey: captchaOptions.siteKey});

//TODO => Change attempt at invisible captcha to simple click, so that it fails and brings up the visible one.
                    captchaControl.reportIncorrect(pageId);
                    await captchaControl.request(pageId, captchaOptions).catch((err) => {
                        logger.error(err);
                        pageMakerPromises[pageId].reject(
                            {
                                message: err.message,
                                stack: err.stack,
                                reset: true,
                                name: err.name,
                                stage: stage

                            }
                        )
                    });
                    let captchaCode = await captchaControl.getSolved(pageId);
                    await captchaControl.fillField(captchaCode, pageId);
                }
                stage--;
                iterate(pageId, stage);
            }
            //Bump up stage if URL is valid success
            else if (successUrlIsValid && matchesStageTraits) {

                pages[pageId].reloadCounter = 0;
                //On last loop succeed, if not iterate.
                if (stage !== numberOfStages) {


                    //Solve captcha before running stage code.
                    if (captchaOptions.siteKey) {

                        await captchaControl.request(pageId, captchaOptions).catch((err) => {
                            logger.error(err);
                            pageMakerPromises[pageId].reject(
                                {
                                    message: err.message,
                                    stack: err.stack,
                                    reset: true,
                                    name: err.name,
                                    stage: stage

                                }
                            )
                        });
                        let captchaCode = await captchaControl.getSolved(pageId);
                        await captchaControl.fillField(captchaCode, pageId);

                        iterate(pageId, stage);
                    }
                    //If no captcha, iterate
                    else {
                        iterate(pageId, stage);
                    }

                }
            } else {
                logger.debug('Unsuccessful finish: ' + pageId);
                if (stage > 4) {
                    logger.info('HAR File recorded for pageId: ' + pageId);
                    await pages[pageId].har.stop();
                }
                pageMakerPromises[pageId].resolve({offices: []});
            }


        }).catch((err) => {

        pageMakerPromises[pageId].reject(
            {
                message: `
                Error running stage ${stage} for pageId ${pageId}.
                Error Message: 
                    ${err.message}`,
                stack: err.stack,
                name: err.name,
                stage: stage

            }
        )
    })
}

module.exports = {init}