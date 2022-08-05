var express = require('express');
var app = express();
require('dotenv').config();
var routes = require('./routes/route.js');
var port = process.env.port;
app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});

var routesObj = new routes(app);
routesObj.init();
