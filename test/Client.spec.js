var co = require("co");
var expect = require("chai").expect;
var Client = require("../lib/Client");


describe("Client", function () {
  it("should make a call to the server", function (done) {
    co(function* () {
      var client = new Client("http://localhost:5004");
      var shows = yield client.call("findShows");
      expect(shows.length).to.be.above(0);
    })(done);
  });
});