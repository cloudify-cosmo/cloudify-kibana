var express = require('express');
var kibana = require('./routes/kibana');
var conf = require('./config/conf.json');

var app = express();
var router = express.Router();
app.use(kibana);

var server = app.listen(conf.port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});
