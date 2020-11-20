const path = require('path');
const utils = require('./utils');
utils.connectVpn().then(()=>{
    process.on('exit', () => {
        utils.disconnectVpn().then((result) => {
            logger.info(result);
        }).catch((err) => {
            logger.error(err);
        });
    })
}).catch((err)=>{
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

// Fetch and parser
const parser = require('node-html-parser');
const fetch = require('node-fetch');

// Express

const express = require('express');
const app = express();
const staticRoot = __dirname + '/../html';
app.use(express.static(staticRoot));
app.use('/healthcheck', require('express-healthcheck')());

const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'MalagaKabalahMacarena',
    resave: false,
    saveUninitialized: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSession);

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
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

// PASSPORT LOCAL AUTHENTICATION

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

// App modules
let rowStatus = {};
const iterator = require('./iterator');
let pollingIdleTimer = 0;
setInterval(() => {
    if (pollingIdleTimer > 30) {
        for (let rowId in rowStatus) {
            iterator.stop(rowId);
            delete rowStatus[rowId];
            pollingIdleTimer = 0;
        }
    }
    pollingIdleTimer++;
}, 1000);
iterator.init();



// ROUTES
//User management routes
const connectEnsureLogin = require('connect-ensure-login');

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

                return res.redirect('/dashboard');
            });

        })(req, res, next);
});

app.get('/login',
    (req, res) => res.sendFile('login.html', {root: staticRoot}
        )
);
app.get('/',
    //connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
        res.sendFile('index.html', {root: staticRoot})
    }
);
app.get('/dashboard',
    //connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
        res.sendFile('dashboard.html', {root: staticRoot})
    }
);

app.get('/private',
    //connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
        res.sendFile('private.html', {root: staticRoot})
    }
);
app.post('/changePassword',
    //connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
        let oldPassword = req.body.oldPassword;
        let newPassword = req.body.newPassword;
        let passwordValidation = req.body.passwordValidate;
        if (oldPassword === newPassword) {
            res.redirect('/private?info=samePassword')
        } else if (newPassword === passwordValidation) {

            let userName = req.session.passport.user;
            UserDetails.findOne({username: userName}, (err, userDetails) => {
                userDetails.changePassword(oldPassword, newPassword).then(() => {
                    res.redirect('/private?info=success',)
                }).catch((err) => {
                    res.redirect('/private?info=oldPasswordFail')
                })
            })
        } else {
            res.redirect('/private?info=noMatch')
        }
    }
);

app.get('/user',
    //connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
        res.send({user: req.user});

    }
);

app.get('/logout', (req, res) => {
    //connectEnsureLogin.ensureLoggedIn();
    req.logout();
    res.redirect('/login');
});


//Application Routes

app.get('/getProcedures', (req, res) => {
    //connectEnsureLogin.ensureLoggedIn();
    let path = req.query.province + '&locale=es';
    logger.debug(path);
    //TODO => Swap in axios for fetch
    fetch('https://sede.administracionespublicas.gob.es' + path)
        .then((fetchResponse) => {
            fetchResponse.text().then((body) => {
                body = parser.parse(body);
                let selectOptions = body.querySelectorAll('option');
                let optionsStringArray = [];
                let hasEmptyOptionBeenSet = false;
                for (let selectOption of selectOptions) {
                    if (selectOption.getAttribute('value') === '-1') {
                        if (hasEmptyOptionBeenSet) {
                            optionsStringArray.push('<option value="-1">-----------------</option>');
                        } else {
                            optionsStringArray.push(selectOption.toString());
                            hasEmptyOptionBeenSet = true;
                        }
                    } else {
                        optionsStringArray.push(selectOption.toString());
                    }
                }
                let combinedSelect = `<select> ${optionsStringArray.join()}</select>`
                res.send({options: combinedSelect});
            });
        })
});

app.get('/iterate', (req, res) => {
    //connectEnsureLogin.ensureLoggedIn();

    let qsData = req.query;
    rowStatus[qsData.rowId] = false;
    iterator.start(qsData.province, qsData.procedure, qsData.rowId).then((iterationResponse) => {
        logger.info(iterationResponse);
        if(iterationResponse.rowId) {
            rowStatus[iterationResponse.rowId] = iterationResponse.offices;
        }
    }).catch((err)=>{
        logger.error(err);
    });
    res.send({iterating: qsData.rowId})

})

app.get('/stopIteration', (req, res) => {
    //connectEnsureLogin.ensureLoggedIn();
    let qsData = req.query;
    iterator.stop(qsData.rowId);
    delete rowStatus[qsData.rowId];
    res.send({msg: 'polling stopped successfully'})

})

app.get('/pollStatus', (req, res) => {
    //connectEnsureLogin.ensureLoggedIn();
    res.send(rowStatus);
    pollingIdleTimer = 0;
    //TODO => Check for consistency with currently running alerts.
});


