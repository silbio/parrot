
module.exports = {
    async run(pageId, resolve, reject) {
        try {
                pages[pageId].page.$eval('#idSede', (officeSelect) => {
                    let officesString = '';
                    for (let i = 0; i < officeSelect.length; i++) {
                        officesString += officeSelect[i].innerText + '\n'
                        if (i === officeSelect.length - 1) {
                            return officesString
                        }
                    }
                }).then((officesString) => {
                    pages[pageId].page.goto('about:blank').then(() => {
                        resolve({msg: 'success', offices: officesString});
                    })
                });
        } catch (err) {
            reject(err);
        }

    }
}


