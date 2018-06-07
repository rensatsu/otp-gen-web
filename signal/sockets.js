const socketIO = require('socket.io');
const colors = require('colors');

module.exports = function (server, config) {
	const io = socketIO.listen(server);

	io.sockets.on('connection', function (client) {
		console.log(colors.white("Client connected. ID: %s"), client.id);

		client.info = {
			id: '',
			joinedAt: 0
		}

		function removeFeed(type) {
			if (client.room) {
				io.sockets.in(client.room).emit('device-disconnected', {
					id: client.id,
					type: type
				});
				if (!type) {
					client.leave(client.room);
					client.room = undefined;
				}
			}
		}

		function join(name, cb) {
			// sanity check
			if (typeof name !== 'string') return;
			// check if maximum number of clients reached
			const clientsNum = clientsInRoom(name);
			if (config.rooms && config.rooms.maxClients > 0 &&
				clientsNum > config.rooms.maxClients) {
				console.log(colors.red(`User ${client.id} is not allowed to join ${name}, room is full.`));
				safeCb(cb)('full');
				return;
			}

			console.log(`User ${client.id} joined into room ${name}`);

			removeFeed();
			client.join(name);
			client.room = name;
			client.info.id = client.id;
			client.info.joinedAt = 1 * (new Date);

			io.sockets.in(client.room).emit('device-connected', {
				room: name,
				clients: clientsNum
			});
		}

		// we don't want to pass "leave" directly because the
		// event type string of "socket end" gets passed too.
		client.on('disconnect', function () {
			removeFeed();
		});

		client.on('leave', function () {
			removeFeed();
		});

		/* *************** */
		client.emit('ping', { rooms: io.nsps['/'].adapter.rooms });

		client.on('get-room', function (data, fn) {
			let roomId = '';
			while (1) {
				roomId = 'sync_' + ("0000" + Math.floor(Math.random() * 10000)).substr(-4);
				if (typeof io.nsps['/'].adapter.rooms[roomId] === 'undefined') break;
			}
			join(roomId);
			console.log(colors.yellow(`Sending user '${client.id}' to room '${roomId}'`));
			fn(roomId);
		});

		client.on('send-verification', function (data, fn) {
			// join(roomId);
			console.log(colors.yellow(`Client ${client.id} sent verification '${data}' to room ${client.room}`));
			io.sockets.in(client.room).emit('handle-verification', {
				room: client.room,
				code: data
			});
			// fn(roomId);
		});

		client.on('data-export', function (data, fn) {
			console.log(colors.green(`Client ${client.id} sent exported data to room ${client.room}`));
			io.sockets.in(client.room).emit('data-import', {
				room: client.room,
				data: data
			});
			fn({
				result: 'ok'
			});
		});

		client.on('check-room', function (data, fn) {
			if (typeof data.room !== 'string') {
				fn({
					room: roomId,
					accepted: false
				});
				return;
			}
			const roomId = data.room;

			if (typeof io.nsps['/'].adapter.rooms[roomId] !== 'undefined') {
				console.log(colors.yellow(`Accepting user ${client.id} to room ${roomId}`));
				join(roomId);
				fn({
					room: roomId,
					accepted: true
				});
			} else {
				fn({
					room: roomId,
					accepted: false
				});
			}
		});

		client.on('test', function (e) {
			console.log("Got test: ", e);
		});
	});


	function describeRoom(name) {
		var adapter = io.nsps['/'].adapter;
		var clients = adapter.rooms[name] || {};
		var result = {
			clients: {},
			length: 0
		};
		Object.keys(clients).forEach(function (id) {
			result.clients[id] = adapter.nsp.connected[id];
			result.length = result.length + 1;
		});
		return result;
	}

	function clientsInRoom(name) {
		return describeRoom(name).length;
	}

};

function safeCb(cb) {
	if (typeof cb === 'function') {
		return cb;
	} else {
		return _ => { };
	}
}
