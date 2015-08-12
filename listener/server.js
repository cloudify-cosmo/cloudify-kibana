var http = require('http');
var httpProxy = require('http-proxy');
var fs = require('fs');

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    var fullUrl = req.headers.host + req.url;
    req.on('data',function(chunk){
        var stuffIWant = '['+req.method+'] '+'Url: '+fullUrl+" Body: "+chunk+"\n";
        console.log(stuffIWant);
        fs.appendFile("/Users/Eden/dev_env/projects_git/cloudify-kibana/listener/test", stuffIWant, function(err) {
            if(err) {
                console.log(err);
            }
        });

    });
});


var server = http.createServer(function(req, res) {
    proxy.web(req, res, { target: 'http://localhost:9200' });
});

console.log("listening on port 9201")
server.listen(9201);
