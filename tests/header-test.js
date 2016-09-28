'use strict';

var request = require('supertest'),
    app = require('./app'),
    expect = require('expect.js');

describe('headers validation', function () {
    it('happy day', function (done) {
        request(app)
            .get('/me')
            .set('apiKey', '12345')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('fail with missing header', function (done) {
        request(app)
            .get('/me')
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                expect(response.errors.headers
                    .length).to.equal(1);
                expect(response.errors.headers[0]).to.match(/apikey/);
                done();
            });
    });

});