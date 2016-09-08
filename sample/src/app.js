var express                   = require("express"),
    RequestInterceptor        = require("request-interceptor");

var interceptors = [ require("./testinterceptor.js")(1), require("./testinterceptor.js")(2) ];
var requestInterceptor = new RequestInterceptor(require("request"), interceptors);
var request = requestInterceptor.getInterceptedRequest();
var app = express();

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.get("/echo", function(req, res) {
  if (req.query.message) {
    var message = req.query.message;
    res.send(message);
  } else {
    res.status(400).send("No message specified.");
  }
});

app.get("/remote/echo", function(req, res) {
  if (req.query.message) {
    var options = {
      uri: "http://localhost:3000/echo",
      qs: {
        message: req.query.message
      }
    };
    request(options, function(err, response, body) {
      res.send(body);
    });
  } else {
    res.status(400).send("No message specified.");
  }
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
