var express                    = require("express"),
    RequestMiddlewareFramework = require("request-middleware-framework");

var middleware = [ require("./testmiddleware.js")(1), require("./testmiddleware.js")(2) ];
var requestMiddlewareFramework = new RequestMiddlewareFramework(require("request"), middleware);
var request = requestMiddlewareFramework.getMiddlewareEnabledRequest();
var app = express();

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
