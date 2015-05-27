'use strict';

var request = require('supertest'),
    app     = require('./app'),
    expect  = require('expect.js');

xdescribe('body validation', function () {
    it('happy day', function (done) {
        request(app)
            .post('/login')
            .send({identification: 'tz', password: 'test'})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                expect(response.identification).to.equal("tz");
                expect(response.password).to.equal("test");
                done();
            });
    });

    it('should 400 on missing id', function (done) {
        request(app)
            .post('/login')
            .send({identification: 'tz'})
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                expect(response.message).to.equal('Bad Request');
                expect(response.errors.body.length).to.equal(1);
                done();
            });
    });

    it('should update the request body to use the defaults', function (done) {
        request(app)
            .post('/search')
            .send({q: 'test'})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                expect(response.q).to.equal('test');
                expect(response.limit).to.equal(10);
                expect(response.to).to.be.ok();
                done();
            });
    });

    it('should fail with invalid limit', function (done) {
        request(app)
            .post('/search')
            .send({q: 'test', limit: 100})
            .expect('Content-Type', /json/)
            .expect(400)
            .end(function (err, res) {
                var response = JSON.parse(res.text);
                expect(response.errors.body.length).to.equal(1);
                expect(response.errors.body[0]).to.match(/limit/);
                done();
            });
    });
});