var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    PushServer = require('./pushserver'),
    nl = require('./nodeload');

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});

app.post('/message', function(req, res){
    var redis = require('redis');
    var redisPub = redis.createClient();
    var channel = req.body.channel;
    redisPub.publish(channel, JSON.stringify({ "name": req.body.name, "message": req.body.message}));
});

console.log("Starting server on port " + 3030);
server.listen(3030);

var pushServer = new PushServer({ server: server });

var loadtest = nl.run({
    name: 'Message Testing',
    host: 'localhost',
    port: 3030,
    numRequests: 1000,
    timeLimit: 600,
    stats: ['latency', 'result-codes', { name: 'http-errors', successCodes: [200], log: 'http-errors.log' }],
    method: 'POST',                        
    path: '/message',                             
    requestData: { "name": "LoadTest", "message": "Sending message!" } 
});
loadtest.on('end', function() { process.exit(0); });