'use strict';

var http       = require('http'),
    express    = require('express'),
    bodyParser = require('body-parser'),
    validate   = require('../index'),
    joi        = require('joi');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('port', 1337);


var validation = {
    login : {
        post: {
            body: {
                identification: joi.string().required(),
                password      : joi.string().required()
            }
        }
    },
    search: {
        post: {
            body  : {
                q    : joi.string().required(),
                to   : joi.date().default(function () {
                    return new Date();
                }, 'to date'),
                limit: joi.number().max(20).min(10).default(10)
            },
            before: {
                // demonstrates providing a custom transform that is called prior to validation
                to: function (value) {
                    return value === 'now' ? new Date() : value;
                }
            },
            after : {
                q: function (value) {
                    return value.toUpperCase();
                }
            }
        }
    },
    me    : {
        get: {
            headers: {
                apikey      : joi.string().required(),
                'user-agent': joi.string().required().regex(/superagent/)
            }
        }
    }
};

app.post('/login', validate(validation.login.post), function (req, res) {
    res.json(req.body);
});

app.post('/search', validate(validation.search.post), function (req, res) {
    res.json(req.body);
});

app.get('/me', validate(validation.me.get), function (req, res) {
    res.json(req.body);
});

app.use(function (err, req, res, next) {
    if (err.name === 'ValidationError') {
        res.status(err.status).json(err);
    }
});

http.createServer(app);
module.exports = app;
