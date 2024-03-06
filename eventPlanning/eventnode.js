var http = require('http');
http.createServer(function(req, result) {
    result.writeHead(200, {'Content-Type': 'text/html'})
    result.end('Hey World\, Hey \n I Love You!');
}).listen(8080);

//node runs on the server, not in browsern