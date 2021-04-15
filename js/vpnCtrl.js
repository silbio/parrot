const exec = require('child_process').exec;

module.exports={
    connectVpn: () => {
        //IP address randomization over ProtonVPN - Use visudo to allow user to run command as root.
        return new Promise((resolve, reject) => {
            resolve()
            //     let startVPN = exec("protonvpn-cli c -r", function (err, stdout, stderr) {
            //         if (err) {
            //             logger.error(stderr);
            //         }
            //         logger.info(stdout);
            //     });
            //
            //     startVPN.on('exit', async (code) => {
            //         if (code === 0) {
            // resolve('VPN started successfully.');
            // } else {
            //     reject('VPN could not be started, exited with code: ' + code);
            //
            // }
            // });
        })
    },
        disconnectVpn: () => {
        return new Promise((resolve, reject) => {
            let stopVPN = exec("sudo protonvpn d", function (err, stdout, stderr) {
                if (err) {
                    logger.error(stderr);
                }
                logger.debug(stdout);
            });

            stopVPN.on('exit', (code) => {
                if (code === 0) {
            resolve('VPN stopped successfully.');
                } else {
                    reject('VPN could not be stopped gracefully, exited with code: ' + code);
                }
            });
        });
    },
}