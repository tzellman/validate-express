'use strict';

var joi = require('joi');
var hop = Object.prototype.hasOwnProperty;

function extend(target /* sources */) {
    return Array.prototype.slice.call(arguments, 1).reduce(function (map, obj) {
        return Object.keys(obj).reduce(function (m, key) {
            if (!hop.call(m, key) && obj[key] !== undefined) {
                m[key] = obj[key];
            }
            return m;
        }, map);
    }, target || {});
}

function whitelist(source, keys) {
    return keys.reduce(function (map, key) {
        if (hop.call(source, key)) {
            map[key] = source[key];
        }
        return map;
    }, {});
}

// default options for joi - you can override these
var joiDefaults = {
    abortEarly   : false,
    convert      : true,
    allowUnknown : true,
    skipFunctions: false,
    stripUnknown : false,
    presence     : 'optional',
    language     : {},
    context      : {}
};

// default options for the ValidationError - you can override these
var errorDefaults = {
    message: 'Bad Request',
    status : 400
};


function ValidationError(errors, options) {
    options      = extend(options, errorDefaults);
    this.name    = 'ValidationError';
    this.errors  = errors;
    this.message = options.message;
    this.status  = options.status;
}

ValidationError.prototype             = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.toJSON      = function () {
    return {status: this.status, message: this.message, errors: this.errors};
};
ValidationError.prototype.toString    = function () {
    return JSON.stringify(this.toJSON());
};


/**
 * This method returns a middleware function that will do the following:
 *
 * - Validate requests against a validation schema
 * - If no validation errors occur, the request is updated to reflect any validation changes
 * - On an error, a new ValidationError is created and passed to the next() callback
 *
 * @param {Object} schema The joi schema to use
 * @param {Object} options A hash of options to override any defaults. This includes both joi and validation options.
 * @returns {Function} The middleware function
 */
module.exports = function (schema, options) {

    // set the defaults
    options = whitelist(extend(options, joiDefaults), Object.keys(joiDefaults));

    function validate(req, field) {
        if (schema && hop.call(schema, field) && hop.call(req, field)) {
            var result = joi.validate(req[field], schema[field], options);
            // redefine the request field with the validated results
            if (!result.error || !result.error.details) {
                req[field] = result.value;
            }
            return (result.error || {}).details;
        }
        return null;
    }

    return function (req, res, next) {
        var errors = 'body params query headers'.split(' ').reduce(function (errs, field) {
            var errors = validate(req, field);
            if (errors && errors.length > 0) {
                errs[field] = errors.map(function (e) {
                    return e.message;
                });
            }
            return errs;
        }, {});
        if (Object.keys(errors).length) {
            next(new ValidationError(errors, options));
        } else {
            next();
        }
    };
};
