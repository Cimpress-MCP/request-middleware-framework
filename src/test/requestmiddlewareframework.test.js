var chai                       = require("chai"),
    expect                     = require("chai").expect,
    RequestMiddlewareFramework = require("../index.js"),
    spies                      = require("chai-spies"),
    uuid                       = require("node-uuid");

chai.use(spies);

describe("RequestMiddlewareFramework", function() {
  var context;

  beforeEach(function() {
    context = { };

    context.responseBody = uuid.v4();
    context.mockedRequest = chai.spy(function(uri, options, callback) {
      if (typeof options === "function" && typeof uri === "object") {
        callback = options;
        options = uri;
      }
      var response = { body: context.responseBody };
      callback(null, response, response.body);
    });
    context.mockedRequest.defaults = chai.spy(function(requester) {
      context.overriddenRequest = chai.spy(function(options, callback) {
        requester(options, callback);
      });
      return context.overriddenRequest;
    });

    context.middleware = chai.spy(function(options, callback, next) {
      context.middlewareCallback = chai.spy(function(err, response, body) {
        callback(err, response, response.body);
      });
      next(options, context.middlewareCallback);
    });

    var rmf = new RequestMiddlewareFramework(context.mockedRequest, context.middleware);
    context.request = rmf.getMiddlewareEnabledRequest();

    context.options = {
      uri: `http://${uuid.v4()}`
    };
  });

  describe("Executing a request with middleware", function() {
    it("should execute the middleware appropriately before and after the request is made", function() {
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(context.responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(context.responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.have.been.called();
        expect(context.mockedRequest).to.have.been.called();
        expect(context.middlewareCallback).to.have.been.called();
      });
    });
  });

  describe("Executing a request with multiple middleware passed as arguments", function() {
    it("should execute the middleware appropriately before and after the request is made", function() {
      context.middleware2 = chai.spy(function(options, callback, next) {
        context.middlewareCallback2 = chai.spy(function(err, response, body) {
          callback(err, response, response.body);
        });
        next(options, context.middlewareCallback2);
      });
      var rmf = new RequestMiddlewareFramework(context.mockedRequest, context.middleware, context.middleware2);
      context.request = rmf.getMiddlewareEnabledRequest();
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(context.responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(context.responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.have.been.called();
        expect(context.middleware2).to.have.been.called();
        expect(context.mockedRequest).to.have.been.called();
        expect(context.middlewareCallback2).to.have.been.called();
        expect(context.middlewareCallback).to.have.been.called();
      });
    });
  });

  describe("Executing a request with multiple middleware passed as an array", function() {
    it("should execute the middleware appropriately before and after the request is made", function() {
      context.middleware2 = chai.spy(function(options, callback, next) {
        context.middlewareCallback2 = chai.spy(function(err, response, body) {
          callback(err, response, response.body);
        });
        next(options, context.middlewareCallback2);
      });
      var rmf = new RequestMiddlewareFramework(context.mockedRequest, [ context.middleware, context.middleware2 ]);
      context.request = rmf.getMiddlewareEnabledRequest();
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(context.responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(context.responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.have.been.called();
        expect(context.middleware2).to.have.been.called();
        expect(context.mockedRequest).to.have.been.called();
        expect(context.middlewareCallback2).to.have.been.called();
        expect(context.middlewareCallback).to.have.been.called();
      });
    });
  });

  describe("Short-circuiting a request with middleware", function() {
    it("should execute the middleware appropriately but not make the actual request", function() {
      var responseBody = uuid.v4();
      context.middleware = chai.spy(function(options, callback, next) {
        callback(null, { body: responseBody }, responseBody);
      });
      var rmf = new RequestMiddlewareFramework(context.mockedRequest, context.middleware);
      context.request = rmf.getMiddlewareEnabledRequest();
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.have.been.called();
        expect(context.mockedRequest).to.not.have.been.called();
        expect(context.middlewareCallback).to.not.exist;
      });
    });
  });

  describe("Executing a request with undefined middleware", function() {
    it("should execute not execute any middleware but the request should be executed successfully", function() {
      var rmf = new RequestMiddlewareFramework(context.mockedRequest);
      context.request = rmf.getMiddlewareEnabledRequest();
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(context.responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(context.responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.not.have.been.called();
        expect(context.mockedRequest).to.have.been.called();
        expect(context.middlewareCallback).to.not.exist;
      });
    });
  });

  describe("Executing a request with an empty array of middleware", function() {
    it("should execute not execute any middleware but the request should be executed successfully", function() {
      var rmf = new RequestMiddlewareFramework(context.mockedRequest, [ ]);
      context.request = rmf.getMiddlewareEnabledRequest();
      context.request(context.options, function(err, response, body) {
        expect(err).to.not.exist;
        expect(response).to.exist.and.be.an("object");
        expect(response).to.have.property("body").and.equal(context.responseBody);
        expect(body).to.exist.and.be.a("string").and.equal(context.responseBody);
        expect(context.mockedRequest.defaults).to.have.been.called();
        expect(context.overriddenRequest).to.have.been.called();
        expect(context.middleware).to.not.have.been.called();
        expect(context.mockedRequest).to.have.been.called();
        expect(context.middlewareCallback).to.not.exist;
      });
    });
  });
});
