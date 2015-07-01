[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][dependency-image]][dependency-url]
[![DevDependencies Status][dev-dependency-image]][dev-dependency-url]

# validate-express

A thin middleware for express applications that handles validation.

The code is pretty minimal and only depends on the [joi](https://github.com/hapijs/joi) package for the schema definition and validation logic.

After successful validation, the request object is modified to contain the validated/updated values.

## Installing

```javascript
npm install --save validate-express
```

## Example

```javascript

var express    = require('express'),
    bodyParser = require('body-parser'),
    validate   = require('validate-express'),
    joi        = require('joi');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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
            body: {
                q    : joi.string().required(),
                to   : joi.date().default(function () {
                    return new Date();
                }, 'to date'),
                limit: joi.number().max(20).min(10).default(10)
            },
            transform: {
                // demonstrates providing a custom transform that is called prior to validation
                to: function (value) {
                    return value === 'now' ? new Date() : value;
                }
            }
        }
    },
    me    : {
        get: {
            headers: {
                apikey      : joi.string().required(),
                'user-agent': joi.string().required().regex(/chrome/)
            }
        }
    }
};

app.post('/login', validate(validation.login.post), function (req, res) {
    // ...
});

app.post('/search', validate(validation.search.post), function (req, res) {
    // ...
    // NOTE - req.body will contain the validated/udpated values
    // e.g. if the user did not provide 'to' or 'limit' fields in the request, they now exist
    // ALSO, if the user specified to==='now', then a new Date() will be created via the transform
});

app.get('/me', validate(validation.me.get), function (req, res) {
    // ...
});

// NOTE: don't forget to provide error middleware
app.use(function (err, req, res, next) {
    if (err.name === 'ValidationError') {
        res.status(err.status).json(err);
    }
});

```

## License

validate-express is released under the MIT license.

[npm-image]: https://img.shields.io/npm/v/validate-express.svg
[npm-url]: https://www.npmjs.com/package/validate-express
[dependency-image]: https://david-dm.org/tzellman/validate-express.svg
[dependency-url]: https://david-dm.org/tzellman/validate-express
[dev-dependency-image]: https://david-dm.org/tzellman/validate-express/dev-status.svg
[dev-dependency-url]: https://david-dm.org/tzellman/validate-express/#info=devDependencies
[travis-url]: http://travis-ci.org/tzellman/validate-express
[travis-image]: https://secure.travis-ci.org/tzellman/validate-express.svg
