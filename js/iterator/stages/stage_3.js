const utils = require('../../utils');
module.exports = {
    async run(pageId, resolve, reject) {
        try {
           await utils.enableAndClick(pageId);
           resolve({msg: 'Stage 3 done!'});
        } catch (err) {
            reject({message: err});
        }

    }
}
