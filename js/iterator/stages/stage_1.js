module.exports = {
    async run(pageId, resolve, reject) {
        try {

            let enterBtn = '#btnEntrar';

            await pages[pageId].page.waitForSelector(enterBtn);
            await pages[pageId].page.click(enterBtn);
           resolve({msg: 'Stage 1 done!'});

        } catch (err) {
            reject({message: err, reset: false});
        }

    }
}
