module.exports = {
    async run(pageId, resolve, reject, procedureCode) {
        try {

            let btnAceptar = '#btnAceptar';
            await pages[pageId].page.waitForSelector(btnAceptar);

            let markSelectedProcess = await pages[pageId].page.evaluate(
                (pCode) => {
                    let optionsArray = document.querySelectorAll('select[class="mf-input__l"] > option');
                    for (let optionsIndex = 0; optionsIndex < optionsArray.length; optionsIndex++) {
                        let option = optionsArray[optionsIndex];
                        if (option.value === pCode) {
                            option.selected = true;
                            return true;
                        } else if (optionsIndex === optionsArray.length - 1) {
                            return false
                        }
                    }


                }, procedureCode
            );
            await pages[pageId].page.click('#cookie_action_close_header');


            if (markSelectedProcess) {
                await pages[pageId].page.click(btnAceptar);
                resolve({msg: 'Stage 0 done!'});
            } else {
                reject({message: 'Selected process is not available in this province, please check your data.', reset: false});
            }

        } catch (err) {
            reject({message: err, reset: false});
        }

    }
}
