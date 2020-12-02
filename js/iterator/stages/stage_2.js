const utils = require('../../utils');

module.exports = {
    run: async function (pageId, resolve, reject) {
        try {
                let tomorrow = new Date();
                let nextYear = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                nextYear.setFullYear(tomorrow.getFullYear() + 1);
                let randomValues = {
                    documentType: 'PASAPORTE',
                    documentNumber: utils.getRandomAlphanumeric(2, 3) + utils.getRandomAlphanumeric(3, 7),
                    fullName: utils.getRandomNames(),
                    nationality: utils.getRandomCountry(),
                    expirationDate: utils.getRandomDate(tomorrow, nextYear)
                }
//Document Type radio
                new Promise(async (formResolve) => {
                    let documentType = randomValues.documentType;
                    await pages[pageId].page.click(`[name="rdbTipoDoc"][value*="${documentType.toLowerCase()}" i]`);
                    // Document Number field
                    await pages[pageId].page.focus('#txtIdCitado');
                    await pages[pageId].page.click('input[id=txtIdCitado]', {clickCount: 3});

                    await pages[pageId].page.keyboard.type(randomValues.documentNumber);
                    // Name field

                    await pages[pageId].page.focus('#txtDesCitado');
                    await pages[pageId].page.click('input[id=txtDesCitado]', {clickCount: 3});
                    let fullName = randomValues.fullName;
                    await pages[pageId].page.keyboard.type(fullName);
                    //Country Select
                    if (await pages[pageId].page.$('#txtPaisNac') !== null) {
                        let nationality = randomValues.nationality;
                        let optionValue = await utils.getOptionValueFromInnerText(pageId, 'txtPaisNac', nationality);
                        await pages[pageId].page.select('#txtPaisNac', optionValue);
                    }
                    if (await pages[pageId].page.$('#txtAnnoCitado') !== null) {
                        await pages[pageId].page.focus('#txtAnnoCitado');
                        await pages[pageId].page.click('input[id=txtAnnoCitado]', {clickCount: 3});
                        await pages[pageId].page.keyboard.type('1977');
                    }

                    if (await pages[pageId].page.$('#txtFecha') !== null) {
                        await pages[pageId].page.focus('#txtFecha');
                        await pages[pageId].page.click('input[id=txtFecha]', {clickCount: 3});
                        await pages[pageId].page.keyboard.type(randomValues.expirationDate);
                    }

                    if (await pages[pageId].page.$('#txtAutActual') !== null) {
                        await pages[pageId].page.evaluate(() => {
                            let authSelect = document.getElementById('txtAutActual');
                            let numberOfOptions = authSelect.childElementCount
                            let randomOption = Math.floor(Math.random() * (numberOfOptions - 2) + 2);
                            authSelect.querySelector(`option:nth-child(${randomOption})`).selected = true;
                        });
                    }
                    formResolve();

                }).then(async () => {
                        await utils.enableAndClick(pageId);
                        resolve({msg: 'Stage 2 done!'});
                    }
                ).catch(err => {
                    reject({message: err});
                });

        } catch (err) {
            reject({message: err});
        }

    }
}


