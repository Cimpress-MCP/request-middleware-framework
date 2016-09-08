var _      = require("lodash"),
    assert = require("assert-plus");

var RequestInterceptor = function(request, interceptors) {
  if (!(this instanceof RequestInterceptor)) {
    return new RequestInterceptor(request, interceptors);
  }

  assert.func(request, "request");
  this.request = request;

  this.initialInterceptor = function(options, callback) {
    request(options.uri, options, callback);
  };

  this.interceptors = [ ];

  if (interceptors) {
    this.use(interceptors);
  }
};

RequestInterceptor.prototype.use = function(interceptors) {
  this.interceptors = _.concat(this.interceptors, interceptors);
};

RequestInterceptor.prototype.getInterceptedRequest = function() {
  var me = this;
  var intercept = function(options, callback) {
    var interceptors = _.concat(me.interceptors, me.initialInterceptor);
    var next = function(_options, _callback) {
      var nextInterceptor = interceptors.shift();
      nextInterceptor(_options, _callback, next);
    };
    next(options, callback);
  };
  return me.request.defaults(intercept);
};

module.exports = RequestInterceptor;
