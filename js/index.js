const path = require('path');
// App modules

const iterator = require('./iterator');
iterator.init();

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
    cookie: { maxAge: 86400000 },
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
    admin: Boolean

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
                let errMsg = 'Error en la autenticaciónm, por favor, inténtelo de nuevo.';
                if (info.name === 'IncorrectPasswordError') {
                    errMsg = 'Nombre de usuario o contraseña incorrecto.'
                }
                return res.redirect('/login?info=' + errMsg);
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/controls');
            });

        })(req, res, next);
});

//Private routes
app.get('/controls', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let username = req.user.username;
    iterationResults[username] = iterationResults[username] || {};
    res.sendFile('html/controls.html', {root: staticRoot})
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
                admin: false
            }, tempPassword).then((result) => {
                console.log('Registered ' + result);
                res.redirect('/register?info=' + tempPassword);
            }).catch((err) => {
                console.error('Registration Error: ' + err);
                res.redirect('/register?info=' + err);
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
            'Contraseña Actualizada con éxito',
        'oldPasswordFail':
            'Contraseña anterior errónea, por favor, inténtelo de nuevo',

        'noMatch':
            'La nueva contraseña no coincide con el campo de verificación, por favor, inténtelo de nuevo',

        'samePassword':
            'La nueva contraseña es igual que la anterior, por favor, inténtelo de nuevo',
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
    res.send(req.user.username);
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
        });

});
app.post('/pollStatus', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    let username = req.user.username;
    let activePolls = req.body;
    for (let rowId in activePolls) {
        if (!activePolls.hasOwnProperty(rowId)) {
            continue;
        }
        let provincePath = activePolls[rowId].provincePath;
        let procedureCode = activePolls[rowId].procedureCode;
        let hasProvinceOrProcedureChanged = (iterationResults[username].hasOwnProperty(rowId) && (iterationResults[username][rowId].provincePath !== provincePath || iterationResults[username][rowId].procedureCode !== procedureCode));
        if (!iterationResults[username].hasOwnProperty(rowId)) {
            iterationResults[username][rowId] = {
                provincePath: provincePath,
                procedureCode: procedureCode,
                finished: false,
                offices: []
            }
            iterator.refresh(provincePath, procedureCode, rowId, username);
        } else if (iterationResults[username].hasOwnProperty(rowId) && iterationResults[username][rowId].finished) {
            iterationResults[username][rowId] = {
                provincePath: provincePath,
                procedureCode: procedureCode,
                finished: false,
                offices: hasProvinceOrProcedureChanged ? [] : iterationResults[username][rowId].offices
            }
            iterator.refresh(provincePath, procedureCode, rowId, username);
        } else if (hasProvinceOrProcedureChanged && !iterationResults[username][rowId].finished) {
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
    let activePollsKeys = Object.keys(activePolls);
    //TODO => Figure out a way of pruning off different users when their polling requests have stopped.
    //TODO => Attach session data to user on DB so that is can be restored after reload.
    // TODO=> Keep daily timer for each user to track how many hours they are using, and reset every day at 00:00. Make mechanism to stop polling after user's number of hours have been consumed. Reform front end to handle going over the limit, with the same modal as the 500 error.
    if (iterationResultsKeys.length !== activePollsKeys.length) {
        let difference = iterationResultsKeys.filter(x => !activePollsKeys.includes(x));
        for (let i = 0; i < difference.length; i++) {
            delete iterationResults[username][difference[i]];
        }
    }
    res.send(iterationResults[username]);

});



