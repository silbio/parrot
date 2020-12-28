const exec = require('child_process').exec;
// TODO => Restart server at 7:00 and 19:00. This should also create a report on the logged in time and usage of each user.
// Use visudo to allow user to run command as root.
//     exec('sudo reboot now', function(error, stdout, stderr){ ... });
module.exports = {
    getRandomAlphanumeric: (type, length) => {
        //type 1 is alphanumeric
        //type 2 only letters
        //type 3 only numbers
        let result = '';
        let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let numbers = '0123456789';
        let characters = (type > 1) ? (type > 2 ? numbers : letters) : (letters + numbers);
        let typeLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * typeLength));
        }
        return result;
    },
    getRandomNames: () => {
        let names = ['Antonio', 'Manuel', 'Jose', 'Francisco', 'David', 'Juan', 'José Antonio', 'Javier', 'Daniel', 'José Luis', 'Francisco Javier', 'Carlos', 'Jesús', 'Alejandro', 'Miguel', 'José Manuel', 'Rafael', 'Miguel Ángel', 'Pedro', 'Pablo']
        let surnames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez']
        return names[(Math.floor(Math.random() * names.length))] + ' ' + surnames[(Math.floor(Math.random() * surnames.length))] + ' ' + surnames[(Math.floor(Math.random() * surnames.length))];
    },
    getRandomCountry: () => {
        let countries = ['ARGENTINA', 'BOLIVIA', 'CHILE', 'COLOMBIA', 'COSTA RICA', 'CUBA', 'DOMINICANA REPUBLICA', 'ECUADOR', 'EL SALVADOR', 'GUATEMALA', 'HONDURAS', 'MEJICO', 'NICARAGUA', 'PANAMA', 'PARAGUAY', 'PERU', 'URUGUAY', 'VENEZUELA']
        return countries[(Math.floor(Math.random() * countries.length))]
    },
    getTimeStampInLocaLIso: () => {
        return (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1)
    },
    getRandomDate: (min, max) => {
        return new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime())).toJSON().slice(0, 10).split('-').reverse().join('/')
    },
    getOptionValueFromInnerText: async (pageId, selectId, textToFind) => {
        const optionWanted = (
            await pages[pageId].page.$x(`//*[@id = "${selectId}"]/option[text() = "${textToFind}"]`))[0];
        return await (
            await optionWanted.getProperty('value')
        ).jsonValue();
    },
    checkPageIdTraits: async (pageId, selector, expectedContent) => {
        try {
            if (selector) {
                let element = await pages[pageId].page.$(selector);
                let elementProperty = await element.getProperty('innerText');
                let elementContent = elementProperty._remoteObject.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return elementContent.indexOf(expectedContent) > -1
            } else {
                return true;
            }
        } catch (e) {
            return false;
        }
    },
    connectVpn: () => {
        //TODO => Test access with VPN randomization
        //
        //IP address randomization over ProtonVPN - Use visudo to allow user to run command as root.
        return new Promise((resolve, reject) => {
            //     let startVPN = exec("sudo protonvpn c -r", function (err, stdout, stderr) {
            //         if (err) {
            //             logger.error(stderr);
            //         }
            //         console.log(stdout);
            //     });
            //
            //     startVPN.on('exit', async (code) => {
            //         if (code === 0) {
            resolve('VPN started successfully.');
            // } else {
            //     reject('VPN could not be started, exited with code: ' + code);
            //
            // }
            // });
        })
    },
    disconnectVpn: () => {
        return new Promise((resolve, reject) => {
            // let stopVPN = exec("sudo protonvpn d", function (err, stdout, stderr) {
            //     if (err) {
            //         logger.error(stderr);
            //     }
            //     logger.debug(stdout);
            // });
            //
            // stopVPN.on('exit', (code) => {
            //     if (code === 0) {
            resolve('VPN stopped successfully.');
            //     } else {
            //         reject('VPN could not be stopped gracefully, exited with code: ' + code);
            //     }
            // });
        });
    },
    enableAndClick: (pageId) => {
        return new Promise(async (resolve, reject) => {
            pages[pageId].page.evaluate(() => {
                let sendBtn = document.getElementById('btnEnviar');
                console.log('Enabling Button! ' + ' Type of enableBtn: ' + typeof window.enableBtn)
                if (window.hasOwnProperty('enableBtn')) {
                    window.enableBtn();
                    window.enableBtn = function () {
                        console.log('enableBtn ran');

                            return true;


                    }
                } else {
                    console.log('enableBtn not on page.');
                        return true;
                }
            }).then(async () => {


                await pages[pageId].page.focus('#btnEnviar');
                await pages[pageId].page.click('#btnEnviar', {clickCount:3, delay: 1000});
                logger.debug('Enable and click done!')
                resolve();
            }).catch((err) => {
                reject(err);
            });
        })

    }
}

