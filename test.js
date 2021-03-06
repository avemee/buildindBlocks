var request = require('supertest');

var app = require('./app');

var redis = require('redis');
var client = redis.createClient();
client.select('test'.length);
client.flushdb();

describe('Requests to the root path', function() {
  it('Returns a 200 status code', function(done) {
    request(app)
      .get('/')
      .expect(200, done)
  });

  it('Returns a HTML format', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/, done)
  });

  it('Returns an index file with Cities', function(done) {
    request(app)
      .get('/')
      .expect(/cities/i, done);
  });
});

describe('Listing cities on /cities', function () {
  it ('Returns 200 status code', function(done) {
      request(app)
        .get('/cities')
        .expect(200, done)
  });

  it('Returns json format', function(done) {
    request(app)
      .get('/cities')
      .expect('Content-Type', /json/, done);
  });

  it('Returns initial cities' , function(done) {
    request(app)
      .get('/cities')
      .expect(JSON.stringify([]), done);
  });
});

describe('Creating new cities', function() {
  it('Returns 201 status code', function(done) {
    request(app)
      .post('/cities')
      .send('name=Springfield&description=what+a+fuck+?')
      .expect(201, done);
  });

  it('Returns created city name', function(done) {
    request(app)
      .post('/cities')
      .send('name=Springfield&description=what+a+fuck+?')
      .expect(/Springfield/i, done);
  });

  it('Validates city name and description', function(done) {
    request(app)
      .post('/cities')
      .send('name=&description=')
      .expect(400, done);
  });
});

describe('Deleting cities', function() {
  before(function() {
    client.hset('cities', 'Banana', 'Some fruit');
  });

  after(function() {
    client.flushdb();
  });

  it('Returns a 204 status code', function(done) {
    request(app)
      .delete('/cities/Banana')
      .expect(204, done)
  });
});

describe('Show city detail', function() {
  before(function() {
    client.hset('cities', 'Banana', 'Some tasty fruit');
  });

  after(function() {
    client.flushdb();
  });

  it('Get status code 200', function(done) {
    request(app)
      .get('/cities/Banana')
      .expect(200, done);
  });

  it('Returns HTML format', function(done) {
      request(app)
        .get('/cities/Banana')
        .expect('Content-Type', /html/, done);
  });

  it('Returns info of city', function(done) {
      request(app)
        .get('/cities/Banana')
        .expect(/tasty/, done);
  });
});
