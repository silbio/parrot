const path = require('path');
// App modules

const utils = require('./utils');
utils.connectVpn().then(() => {
    process.on('exit', () => {
        utils.disconnectVpn().then((result) => {
            logger.info(result);
        }).catch((err) => {
            logger.error(err);
        });
    })
}).catch((err) => {
    logger.error(err);
    process.exit(22);
})

//TODO => Split init sequence into separate modules
//Logging
const log4js = require("log4js");
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[%d %p%] %f:%l %m'
            }
        },
        file: {
            type: 'file',
            filename: path.join(__dirname, '../logs/' + utils.getTimeStampInLocaLIso() + '.log'),
            maxLogSize: 2097152,
            backups: 10,
            compress: true,
            layout: {
                type: 'pattern',
                pattern: '* %p %d{yyyy/MM/dd-hh.mm.ss} %f:%l %m'
            }
        }

    },
    categories: {
        default: {appenders: ['console', 'file'], level: 'debug', enableCallStack: true}
    }
});
global.logger = log4js.getLogger();
logger.level = 'debug';


const iterator = require('./iterator');
iterator.init();

const axios = require('axios');




// Express

const express = require('express');
const favicon = require('serve-favicon');

const app = express();
const staticRoot = __dirname + '/../public';
app.use(express.static(staticRoot));
app.use('/healthcheck', require('express-healthcheck')());
app.use(favicon(staticRoot + '/img/favicon.ico'));


const bodyParser = require('body-parser');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession)

//TODO => Switch out Memory store for Mongo Store

app.use(expressSession({
    secret: 'MalagaKabalahMacarena',
    name: 'silbSession',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 86400000},
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));


//  Passport

const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

// Mongoose

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/silbDB',
    {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String,
    admin: Boolean,
    allowedRows: Number,
    lastIp: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');


// PASSPORT LOCAL AUTHENTICATION

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());


// ROUTES
//User management routes
const connectEnsureLogin = require('connect-ensure-login');
//Public routes
app.get('/', (req, res) => {
    res.sendFile('html/index.html', {root: staticRoot})
});
app.get('/login', (req, res) => {
    res.sendFile('html/login.html', {root: staticRoot})
});
app.post('/login', (req, res, next) => {
    passport.authenticate('local',
        (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                let errMsg = 'Error en la autenticación, por favor, inténtelo de nuevo.';
                if (info.name === 'IncorrectPasswordError') {
                    errMsg = 'Nombre de usuario o contraseña incorrecto.'
                }
                return res.redirect('/login?info=' + Buffer.from(errMsg).toString('base64'),
                );
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/controls');
            });

        })(req, res, next);
});

app.get('/error', (req, res) => {
    req.logout();
    res.sendFile('html/error.html', {root: staticRoot});
});

//Private routes
app.get('/controls', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let username = req.user.username;
    if (global.hasOwnProperty('iterationResults')) {
        iterationResults[username] = iterationResults[username] || {};
        res.sendFile('html/controls.html', {root: staticRoot});
    } else {
        res.redirect('/error');
    }

});
app.get('/private', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.sendFile('html/private.html', {root: staticRoot})
});

app.get('/register', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let userName = req.session.passport.user;
    UserDetails.findOne({username: userName}, (err, userDetails) => {
        logger.warn(userDetails.username + ' accessed the registration page.');
        if (userDetails.admin) {
            res.sendFile('html/register.html', {root: staticRoot});
        } else {
            res.send(401);
        }
    })


});


app.post('/register', connectEnsureLogin.ensureAuthenticated(), (req, res) => {
    let userName = req.session.passport.user;
    UserDetails.findOne({username: userName}, (err, userDetails) => {

        if (userDetails.admin) {
            let tempPassword = utils.getRandomAlphanumeric(1, 8);
            UserDetails.register({
                username: req.body.username,
                active: true,
                admin: req.body.admin || false,
                allowedRows: req.body.allowedRows,
                lastIp: '0.0.0.0'
            }, tempPassword).then((result) => {
                console.log('Registered ' + result);
                res.redirect('/register?info=' + Buffer.from(tempPassword).toString('base64'));
            }).catch((err) => {
                console.error('Registration Error: ' + err);
                res.redirect('/register?info=' + Buffer.from(err).toString('base64'));
            });
            logger.warn('Admin ' + userDetails.username + ' registered user ' + req.body.username);
        } else {
            res.send(401);
        }
    })
})
app.post('/changePassword', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let passwordValidation = req.body.passwordValidate;
    let errorMessages = {
        'success':
            Buffer.from('Contraseña Actualizada con éxito').toString('base64'),
        'oldPasswordFail':
            Buffer.from('Contraseña anterior errónea, por favor, inténtelo de nuevo').toString('base64'),
        'noMatch':
            Buffer.from('La nueva contraseña no coincide con el campo de verificación, por favor, inténtelo de nuevo').toString('base64'),
        'samePassword':
            Buffer.from('La nueva contraseña es igual que la anterior, por favor, inténtelo de nuevo').toString('base64'),
    }

    let basePath = '/private?info=';
    if (oldPassword === newPassword) {
        res.redirect(basePath + errorMessages.samePassword);
    } else if (newPassword === passwordValidation) {

        let userName = req.session.passport.user;
        UserDetails.findOne({username: userName}, (err, userDetails) => {
            userDetails.changePassword(oldPassword, newPassword).then(() => {
                res.redirect(basePath + errorMessages.success)
            }).catch((err) => {
                logger.debug('Change password failure: ' + err);
                res.redirect(basePath + errorMessages.oldPasswordFail);
            })
        })
    } else {
        res.redirect(basePath + errorMessages.noMatch)
    }
});
app.get('/user', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let username = req.user.username;
    logger.info("User " + username + " connected from IP " + ip);
    UserDetails.findOne({username: username}, (err, userDetails) => {
        if (err) {
            logger.error("Error getting user details: " + err);
            res.redirect('/error');
        }
        if (userDetails) {
            if (userDetails.lastIp !== ip) {
                logger.error('User ' + username + ' used to connect from IP ' + userDetails.lastIp + ' but is now connecting from ' + ip);
            }
            userDetails.lastIp = ip;
            userDetails.save((err) => {
                if (err) {
                    logger.error('Error saving user details ' + err);
                }
            });

            if (!activeUsers.hasOwnProperty(username)) {
                activeUsers[username] = {}
            }
            activeUsers[username].allowedRows = userDetails.allowedRows;
            let userData = {username: userDetails.username, allowedRows: userDetails.allowedRows}

            res.json(userData);
        }
    })

});
app.get('/logout', (req, res) => {
    connectEnsureLogin.ensureLoggedIn();
    req.logout();
    res.redirect('/');
});


//Application Routes

app.post('/getProcedures', connectEnsureLogin.ensureLoggedIn(), (req, res) => {

    let provincePath = req.body.province + '&locale=es';
    logger.debug(provincePath);
    axios.get('https://sede.administracionespublicas.gob.es' + provincePath)
        .then((proceduresResponse) => {

            let optionsString = '';
            let procedureLists = proceduresResponse.data.listaDeGrupos;
            for (let procedureList of procedureLists) {
                let procedureListName = procedureList.nombre;
                for (let procedure of procedureList.listaTramites) {
                    let procedureId = procedure.idTipTramite;
                    let procedureDescription = procedure.desTramiteLargo
                    if (procedureId === -1) procedureDescription = '********* ' + procedureListName + ' *********';
                    optionsString += `<option value="${procedureId}">${procedureDescription}</option>`
                }
            }

            let combinedSelect = `<select> ${optionsString}</select>`
            res.send(combinedSelect);
        }).catch((e) => {
        logger.warn(e);
        res.send(500);
    });

});
app.post('/pollStatus', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let username = req.user.username;
    let activePolls = req.body;
    let activePollsKeys = Object.keys(activePolls);

    if (activePollsKeys.length === activeUsers[username].allowedRows) {
        for (let rowId in activePolls) {
            if (!activePolls.hasOwnProperty(rowId)) {
                continue;
            }
            let provincePath = activePolls[rowId].provincePath;
            let procedureCode = activePolls[rowId].procedureCode;
            let hasProvinceOrProcedureChanged = (iterationResults[username].hasOwnProperty(rowId) && (iterationResults[username][rowId].provincePath !== provincePath || iterationResults[username][rowId].procedureCode !== procedureCode));
            if (!iterationResults[username].hasOwnProperty(rowId)) {
                logger.debug('Username ' + username + ' has no iteration results, adding. ' + JSON.stringify(iterationResults));
                iterationResults[username][rowId] = {
                    provincePath: provincePath,
                    procedureCode: procedureCode,
                    finished: false,
                    offices: []
                }
                iterator.refresh(provincePath, procedureCode, rowId, username);
            } else if (iterationResults[username].hasOwnProperty(rowId) && iterationResults[username][rowId].finished) {
                logger.debug('Username ' + username + ' has finished iteration results. ' + JSON.stringify(iterationResults));
                iterationResults[username][rowId] = {
                    provincePath: provincePath,
                    procedureCode: procedureCode,
                    finished: false,
                    offices: hasProvinceOrProcedureChanged ? [] : iterationResults[username][rowId].offices
                }
                iterator.refresh(provincePath, procedureCode, rowId, username);
            } else if (hasProvinceOrProcedureChanged && !iterationResults[username][rowId].finished) {
                logger.debug('Username ' + username + ' has unfinished iteration results. ' + iterationResults);

                iterationResults[username][rowId] = {
                    provincePath: provincePath,
                    procedureCode: procedureCode,
                    finished: false,
                    offices: []
                }
                iterator.refresh(provincePath, procedureCode, rowId, username);
            }
        }

        //Check if active polling rows match number of items in the iteration results
        let iterationResultsKeys = Object.keys(iterationResults[username])
        iterationResults[username].lastAccess = new Date();
        //TODO=> Correlate between users to make sure we're not iterating over the same province/procedure combos for different users.
        if (iterationResultsKeys.length !== activePollsKeys.length) {
            let difference = iterationResultsKeys.filter(keyName => !activePollsKeys.includes(keyName));
            for (let i = 0; i < difference.length; i++) {
                delete iterationResults[username][difference[i]];
            }
        }
        let rowsResults = {...iterationResults[username]};
        delete rowsResults.lastAccess;
        res.send(rowsResults);
    } else {
        res.redirect('/error?info=' + (Buffer.from('Se han recibido más líneas de las que tiene en su subscripción. Por favor póngase en contacto con nosotros si desea utilizar más alertas en paralelo.').toString('base64')));
    }

});



