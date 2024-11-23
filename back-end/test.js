const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('./app');
const mongoose = require('mongoose');
const Restaurant = require('./app/models/restaurant');
const User = require('./app/models/User');
const jwt = require('jsonwebtoken');
const expect = chai.expect;

chai.use(chaiHttp);

describe('API Unit Tests with Database Mocking', () => {
  let sandbox;
  let jwtToken;
  let userId;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Generate a mock user ID and JWT token
    userId = new mongoose.Types.ObjectId();
    jwtToken = jwt.sign(
      { id: userId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1d' }
    );
  });

  afterEach(() => {
    sandbox.restore();
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
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(restaurantData),
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
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

      // Mock Restaurant.find with expected query parameters
      sandbox.stub(Restaurant, 'find').callsFake((query) => {
        expect(query).to.include({
          cuisine: { $in: ['italian'] },
          neighborhood: { $in: ['downtown'] },
        });
        return {
          skip: sinon.stub().returnsThis(),
          limit: sinon.stub().returnsThis(),
          exec: sinon.stub().resolves(restaurantData),
        };
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
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
          exec: sinon.stub().resolves(restaurantData),
        };
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
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
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
      });

      chai
        .request(app)
        .get('/restaurants/search')
        .set('Authorization', `JWT ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing query parameter');
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
      sandbox.stub(Restaurant, 'findById').returns({
        exec: sinon.stub().resolves({
          _id: restaurantId,
          name: 'Restaurant 1',
        }),
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        exec: sinon.stub().resolves(userStub),
      });

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
      sandbox.stub(Restaurant, 'findById').returns({
        exec: sinon.stub().resolves({
          _id: restaurantId,
          name: 'Restaurant 1',
        }),
      });

      // Mock User.findById
      sandbox.stub(User, 'findById').returns({
        exec: sinon.stub().resolves(userStub),
      });

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
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
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
        populate: sinon.stub().returns({
          exec: sinon.stub().resolves(userStub),
        }),
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
});
