const assert = require('chai').assert;
const expect = require('chai').expect;
const chai = require('chai');
const chaiHttp = require('chai-http');
import eventHelper from '../src/helpers/event.helper';

chai.use(chaiHttp);
const host = 'http://localhost:8080';
const ValidateJson = require('../src/helpers/event.helper').ValidateJson;
describe('Event', () => {
  describe('helper', () => {
    describe('validatejson', () => {
      it('empty string test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, "")).to.throw("Dates and votes must be an array with string dates!");
      })
      it('undefined test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, undefined)).to.throw("Dates and votes must be an array with string dates!");
      })
      it('empty object test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, {})).to.throw("Dates and votes must be an array with string dates!");
      })
      it('without name test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "noname": "noname", "dates": ["2016-03-03"] })).to.throw("Dates and votes must be an array with string dates!");
      })
      it('invalid day test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "name": "name", "dates": ["2016-03-32"] })).to.throw("Dates and votes must be an array with string dates!");
      })
      it('invalid month test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "name": "name", "dates": ["2016-13-03"] })).to.throw("Dates and votes must be an array with string dates!");
      })
      it('date outside an array test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "name": "name", "dates": "2016-01-03" })).to.throw("Dates and votes must be an array with string dates!");
      })
      it('number inside array test', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, {
          name: "Pekka",
          votes: [1234]
        })).to.throw("Dates and votes must be an array with string dates!");
      })
      it('valid data with dates', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "name": "name", "dates": ["2016-01-03"] })).to.not.throw();
      })
      it('valid data with votes', () => {
        expect(eventHelper.ValidateJson.bind(eventHelper, { "name": "name", "votes": ["2016-01-03"] })).to.not.throw();
      })
    })
    describe('AddVotes', () => {
      let event = {
        "id": 0,
        "name": "Jake's secret party",
        "dates": {
          "dates": [
            "2014-01-01",
            "2014-01-05",
            "2014-01-12"
          ]
        },
        "votes": {
          "votes": [
            {
              "date": "2014-01-01",
              "people": [
                "John",
                "Julia",
                "Paul",
                "Daisy"
              ]
            }
          ]
        }
      }
      it('Votes are added correctly test', () => {
        event.dates = JSON.stringify(event.dates);
        event.votes = JSON.stringify(event.votes);
        const votes = eventHelper.AddVotes(event, "Ilari", ["2014-01-01", "2014-01-05"]);
        assert.equal(votes, JSON.stringify({
          "votes": [
            {
              "date": "2014-01-01",
              "people": [
                "John",
                "Julia",
                "Paul",
                "Daisy",
                "Ilari"
              ]
            },
            {
              "date": "2014-01-05",
              "people": [
                "Ilari"
              ]
            }
          ]
        }));
      })
    })
    describe('EventToResult', () => {
      const event = {
        "id": 0,
        "name": "Jake's secret party",
        "dates": [
          "2014-01-01",
          "2014-01-05",
          "2014-01-12"
        ],
        "votes": {
          "votes": [
            {
              "date": "2014-01-01",
              "people": [
                "John",
                "Julia",
                "Paul",
                "Daisy",
                "Dick"
              ]
            },
            {
              "date": "2014-01-05",
              "people": [
                "Dick"
              ]
            }
          ]
        }
      }
      it('', () => {
        const expected = {
          "id": 0,
          "name": "Jake's secret party",
          "suitableDates": [
            {
              "date": "2014-01-01",
              "people": [
                "John",
                "Julia",
                "Paul",
                "Daisy",
                "Dick"
              ]
            }
          ]
        }
        event.votes = JSON.stringify(event.votes);
        const actual = eventHelper.EventToResults(event);
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
      })
    })
  })
  describe('http requests', () => {
    it('add event correctly test', (done) => {
      chai.request(host)
        .post('/api/v1/event')
        .send({
          "name": "Jake's secret party",
          "dates": [
            "2014-01-01",
            "2014-01-05",
            "2014-01-12"
          ]
        }).end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    })
    it('add event with bad syntax test', (done) => {
      chai.request(host)
        .post('/api/v1/event')
        .type('application/json')
        .set({
          "wrongname": "Jake's secret party",
          "dates": [
            "2014-01-01",
            "2014-01-05",
            "2014-01-12"
          ]
        }).end((err, res) => {
          expect(res).to.have.status(400);
          done();
        })
    })
    it('add votes correctly test', (done) => {
      chai.request(host)
        .post('/api/v1/event/1/vote')
        .type('application/json')
        .send({
          "name": "Dick",
          "votes": [
            "2014-01-01",
            "2014-01-05"
          ]
        }).end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    })
    it('add votes with bad syntax test', (done) => {
      chai.request(host)
        .post('/api/v1/event/1/vote')
        .type('application/json')
        .send({
          "name": "Dick",
          "votes": [
            "2014-01-100",
            "2014-00-05"
          ]
        }).end((err, res) => {
          expect(res).to.have.status(400);
          done();
        })
    })
    it('get list test', (done) => {
      chai.request(host)
        .get('/api/v1/event/list')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    })
    it('get id in position 1 test', (done) => {
      chai.request(host)
        .get('/api/v1/event/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        })
    })
    it('get id in position which does not exist test', (done) => {
      chai.request(host)
        .get('/api/v1/event/0')
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        })
    })
  })
});

