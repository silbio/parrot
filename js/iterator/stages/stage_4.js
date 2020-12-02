const utils = require('../../utils')

module.exports = {
    async run(pageId, resolve, reject) {
        try {
                await pages[pageId].page.screenshot({path: 'logs/screenshots/' + utils.getTimeStampInLocaLIso() + '_stage_4_' + pageId + '.png',
                    fullPage: true});
                pages[pageId].page.$eval('#idSede', (officeSelect) => {
                    let officesString = '';
                    for (let i = 0; i < officeSelect.length; i++) {
                        officesString += officeSelect[i].innerText + '\n'
                        if (i === officeSelect.length - 1) {
                            return officesString
                        }
                    }
                }).then((officesString) => {
                    logger.info('Available offices in Stage 4 success \n' + officesString);
                    pages[pageId].page.goto('about:blank').then(() => {
                        resolve({msg: 'success', offices: officesString});
                    })
                });
        } catch (err) {
            reject(err);
        }

    }
}


