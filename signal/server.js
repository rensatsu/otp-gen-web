const config = {
    "server": {
        "port": 16771
    },
    "rooms": {
        "maxClients": 2
    },
    "stunservers": []
};

const sockets = require('./sockets');
const port = parseInt(process.env.PORT || config.server.port, 10);

const server_handler = (req, res) => {
    res.writeHead(404);
    res.end();
};

let server = null;

server = require('http').Server(server_handler);
server.listen(port);

sockets(server, config);

if (config.uid) process.setuid(config.uid);

const httpUrl = "http://localhost:" + port;
console.log('SignalMaster is running at: ' + httpUrl);
