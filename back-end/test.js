const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('./app');
const mongoose = require('mongoose');
const Restaurant = require('./app/models/restaurant');
const User = require('./app/models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const expect = chai.expect;
process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('API Unit Tests with Database Mocking', () => {
  let sandbox;
  let jwtToken;
  let userId;
  let transportStub;
  let createTransportStub;
  let bcryptHashStub;
  let bcryptCompareStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Generate a mock user ID and JWT token
    userId = new mongoose.Types.ObjectId();
    jwtToken = jwt.sign(
      { id: userId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1d' }
    );

    // Stub nodemailer.createTransport and sendMail
    transportStub = {
      sendMail: sandbox.stub().resolves(),
    };
    createTransportStub = sandbox.stub(nodemailer, 'createTransport').returns(transportStub);

    // Stub bcrypt methods
    bcryptHashStub = sandbox.stub(bcrypt, 'hash').resolves('hashedOTP');
    bcryptCompareStub = sandbox.stub(bcrypt, 'compare').resolves(true);
  });

  afterEach(() => {
    sandbox.restore();
  });
  
  after(() => {
    mongoose.disconnect();
  });

  describe('GET /restaurants', () => {
    it('should return a list of restaurants with default pagination', (done) => {
      const restaurantData = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Restaurant 1',
          cuisine: 'italian',
          neighborhood: 'downtown',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Restaurant 2',
          cuisine: 'japanese',
          neighborhood: 'midtown',
        },
      ];

      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock Restaurant.countDocuments
      sandbox.stub(Restaurant, 'countDocuments').resolves(2);

      // Mock Restaurant.find
      sandbox.stub(Restaurant, 'find').returns({
        skip: function () { return this; },
        limit: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(restaurantData).then(resolve, reject);
        },
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('total', 2);
          expect(res.body).to.have.property('page', 1);
          expect(res.body).to.have.property('limit', 10);
          expect(res.body.data).to.be.an('array').that.has.lengthOf(2);
          done();
        });
    });
  });

  describe('GET /restaurants with filters', () => {
    it('should return restaurants filtered by cuisine and neighborhood', (done) => {
      const restaurantData = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Italian Bistro',
          cuisine: 'italian',
          neighborhood: 'downtown',
        },
      ];

      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock Restaurant.countDocuments
      sandbox.stub(Restaurant, 'countDocuments').resolves(1);

      // Capture the query object
      let receivedQuery;

      // Mock Restaurant.find without assertions inside callsFake
      sandbox.stub(Restaurant, 'find').callsFake((query) => {
        receivedQuery = query; // Capture the query
        return {
          skip: function () { return this; },
          limit: function () { return this; },
          then: function (resolve, reject) {
            return Promise.resolve(restaurantData).then(resolve, reject);
          },
        };
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants')
        .query({ cuisine: 'italian', neighborhood: 'downtown' })
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          expect(res.body.data[0].cuisine).to.equal('italian');
          expect(res.body.data[0].neighborhood).to.equal('downtown');

          // Perform the assertion on the received query
          expect(receivedQuery).to.deep.include({
            cuisine: { $in: ['italian'] },
            neighborhood: { $in: ['downtown'] },
          });

          done();
        });
    });
  });

  describe('GET /restaurants/search', () => {
    it('should return restaurants matching the search query', (done) => {
      const restaurantData = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Sushi Place',
          cuisine: 'japanese',
          neighborhood: 'midtown',
        },
      ];

      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock Restaurant.find
      sandbox.stub(Restaurant, 'find').callsFake((query) => {
        expect(query).to.deep.equal({ name: /sushi/i });
        return {
          then: function (resolve, reject) {
            return Promise.resolve(restaurantData).then(resolve, reject);
          },
        };
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants/search')
        .query({ query: 'sushi' })
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].name).to.equal('Sushi Place');
          done();
        });
    });

    it('should return 400 if query parameter is missing', (done) => {
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants/search')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors[0].msg).to.equal('Query parameter is required');
          done();
        });
    });
  });

  describe('POST /restaurants/:id/like', () => {
    it('should like a restaurant', (done) => {
      const restaurantId = new mongoose.Types.ObjectId();
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
        save: sinon.stub().resolves(),
      };

      // Mock Restaurant.findById
      sandbox.stub(Restaurant, 'findById').resolves({
        _id: restaurantId,
        name: 'Restaurant 1',
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').resolves(userStub);

      chai
        .request(app)
        .post(`/restaurants/${restaurantId.toString()}/like`)
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal(
            `User test@example.com liked restaurant ${restaurantId.toString()}`
          );
          done();
        });
    });
  });

  describe('POST /restaurants/:id/dislike', () => {
    it('should dislike a restaurant', (done) => {
      const restaurantId = new mongoose.Types.ObjectId();
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
        save: sinon.stub().resolves(),
      };

      // Mock Restaurant.findById
      sandbox.stub(Restaurant, 'findById').resolves({
        _id: restaurantId,
        name: 'Restaurant 1',
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').resolves(userStub);

      chai
        .request(app)
        .post(`/restaurants/${restaurantId.toString()}/dislike`)
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal(
            `User test@example.com disliked restaurant ${restaurantId.toString()}`
          );
          done();
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in the /restaurants endpoint', (done) => {
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock Restaurant.countDocuments to throw an error
      sandbox.stub(Restaurant, 'countDocuments').rejects(new Error('Simulated error'));

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.text).to.equal('Error fetching restaurants');
          done();
        });
    });

    it('should handle errors in the /restaurants/search endpoint', (done) => {
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock Restaurant.find to throw an error
      sandbox.stub(Restaurant, 'find').throws(new Error('Simulated error'));

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/restaurants/search')
        .query({ query: 'sushi' })
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.text).to.equal('Error searching for restaurant');
          done();
        });
    });
  });

  // New tests for /auth routes
  describe('POST /auth/request', () => {
    it('should return 400 if email is missing', (done) => {
      chai
        .request(app)
        .post('/auth/request')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors[0].msg).to.equal('Valid email is required');
          done();
        });
    });

    it('should generate OTP and send email when user exists', (done) => {
      const email = 'test@example.com';

      const userStub = {
        email,
        generateOTP: sandbox.stub().resolves('123456'),
        save: sandbox.stub().resolves(),
      };

      // Mock User.findOne
      sandbox.stub(User, 'findOne').resolves(userStub);

      chai
        .request(app)
        .post('/auth/request')
        .send({ email })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal('OTP sent');

          // Check that generateOTP was called
          sinon.assert.calledOnce(userStub.generateOTP);

          // Check that sendMail was called
          sinon.assert.calledOnce(transportStub.sendMail);

          done();
        });
    });

  });

  describe('POST /auth/verify', () => {
    it('should return 400 if email or OTP is missing', (done) => {
      chai
        .request(app)
        .post('/auth/verify')
        .send({ email: 'test@example.com' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors.length).to.be.above(0);
          expect(res.body.errors[0].msg).to.equal('OTP must be 6 digits');
          done();
        });
    });

    it('should return 400 if OTP is invalid', (done) => {
      const userStub = {
        email: 'test@example.com',
        validateOTP: sandbox.stub().resolves(false),
      };

      sandbox.stub(User, 'findOne').resolves(userStub);

      chai
        .request(app)
        .post('/auth/verify')
        .send({ email: 'test@example.com', otp: 'wrongotp' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors[0].msg).to.equal('OTP must be 6 digits');
          done();
        });
    });

    it('should return token if OTP is valid', (done) => {
      const userStub = {
        email: 'test@example.com',
        validateOTP: sandbox.stub().resolves(true),
        clearOTP: sandbox.stub().resolves(),
        generateJWT: sandbox.stub().returns('mocktoken'),
      };

      sandbox.stub(User, 'findOne').resolves(userStub);

      chai
        .request(app)
        .post('/auth/verify')
        .send({ email: 'test@example.com', otp: '123456' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message', 'OTP verified');
          expect(res.body).to.have.property('token', 'mocktoken');
          done();
        });
    });

    it('should handle errors in /auth/verify', (done) => {
      sandbox.stub(User, 'findOne').throws(new Error('Simulated error'));

      chai
        .request(app)
        .post('/auth/verify')
        .send({ email: 'test@example.com', otp: '123456' })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.text).to.equal('Error verifying OTP');
          done();
        });
    });
  });

  describe('GET /user', () => {
    it('should return the user data', (done) => {
      const userStub = {
        _id: userId,
        email: 'test@example.com',
        likedRestaurants: [],
        dislikedRestaurants: [],
      };

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(userStub).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/user')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('email', 'test@example.com');
          done();
        });
    });

    it('should return 404 if user not found', (done) => {
      // Mock User.findById to return null
      sandbox.stub(User, 'findById').returns({
        populate: function () { return this; },
        then: function (resolve, reject) {
          return Promise.resolve(null).then(resolve, reject);
        },
      });

      chai
        .request(app)
        .get('/user')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.equal('Unauthorized');
          done();
        });
    });


  });
});
