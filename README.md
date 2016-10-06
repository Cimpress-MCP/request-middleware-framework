# request-middleware-framework

A framework to intercept HTTP calls made via the request HTTP client.

## Installation

    npm install request-middleware-framework

## Middleware Definition

The framework simply expects any middleware to be a function of form:
```
function(options, callback, next) {
  // Add custom logic here.
  next(options, callback);
}
```

The ``next()`` call will call the next middleware in the chain. To add any logic on the response, you can modify the callback as follows:
```
function(options, callback, next) {
  var _callback = function(err, response, body) {
    // Add custom response logic here.
    callback(err, response, body);
  };
  next(options, _callback);
}
```

If instead you want to completely short-circuit the HTTP call, you can simply call the callback and provide your own error or response:
```
function(options, callback, next) {
  var body = "Everything's fine."
  callback(null, { statusCode: 200, body: body }, body);
}
```

## Examples

Once you've defined your middleware, you can simply register it by creating a new framework object, and then getting the request object:
```
var requestMiddlewareFramework = new RequestMiddlewareFramework(require("request"), middleware);
var request = requestMiddlewareFramework.getMiddlewareEnabledRequest();
```

You can then use returned ``request`` object just like you normally would.

For a full example inside an express app, see the [sample](sample) directory within this repository.

## License

[MIT](LICENSE)
