var express = require('express');
var kibana = require('./kibana');
var conf = require('./conf.json');

var app = express();
var router = express.Router();
app.use(kibana);

var server = app.listen(conf.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
