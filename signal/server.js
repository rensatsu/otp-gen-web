/*global console*/
var config = {
	"server": {
		"port": 16771
	},
	"rooms": {
		"maxClients": 2
	},
	"stunservers": []
};

// var config = require('getconfig');
var fs = require('fs'),
    sockets = require('./sockets'),
    port = parseInt(process.env.PORT || config.server.port, 10),
    server_handler = function (req, res) {
        res.writeHead(404);
        res.end();
    },
    server = null;

server = require('http').Server(server_handler);
server.listen(port);

sockets(server, config);

if (config.uid) process.setuid(config.uid);

const httpUrl = "http://localhost:" + port;
console.log('SignalMaster is running at: ' + httpUrl);
