var _ = require("lodash");

module.exports = function(num) {
  return function(options, callback, next) {
    console.log(`Intercepting request with middleware ${num}.`);
    if (_.at(options, "qs.message")) {
      options.qs.message += ` (intercepted at request time by middleware ${num})`;
    }
    var _callback = function(err, response, body) {
      response.body += ` (intercepted at response time by middleware ${num})`;
      callback(err, response, response.body);
    };
    next(options, _callback);
  };
};
