var url = require('url');
var path = require('path');

function Peer(websocket) {
	var self = this;
	
	self.websocket = websocket;

	self.ip = websocket.upgradeReq.connection.remoteAddress;
	self.port = websocket.upgradeReq.connection.remotePort;
	self.addr = self.ip + ":" + self.port;

	self.name = undefined;
	self.image = undefined;
}

function PeerTable(callbacks) {
	var self = this;

	self.table = {};

	self.callbacks = callbacks;

	self.add = function (peer) {
		console.log("peer.add %s", peer.addr);
		if (self.table.hasOwnProperty(peer.addr)) {
			return false;
		} else {
			self.table[peer.addr] = peer;
			self.callbacks.add(self.table, peer.addr);
			return true;
		}
	}

	self.del = function (addr) {
		if (self.table.hasOwnProperty(addr)) {
			var peer = self.table[addr];
			delete self.table[addr];
			peer.websocket.close();
			self.callbacks.del(self.table, addr);
			return true;
		} else {
			return false;
		}
	}

	self.mod = function (addr, modifier) {
		if (self.table.hasOwnProperty(addr)) {
			modifier(self.table[addr]);
			self.callbacks.mod(self.table, addr);
			return true;
		} else {
			return false;
		}
	}
}

function Tracker() {
	var self = this;

	self.peers = new PeerTable({
		add: function(table, addr) {
			for (var key in table) { if (table.hasOwnProperty(key)) {
				if (key == addr) {
					table[key].websocket.send(JSON.stringify({
						method: "add",
						peers: Object.keys(table)
					}));
				} else {
					table[key].websocket.send(JSON.stringify({
						method: "add",
						peers: [addr]
					}));
				}
			}}
		},
		del: function(table, addr) {
			for (var key in table) { if (table.hasOwnProperty(key)) {
				table[key].websocket.send(JSON.stringify({
					method: "del",
					peers: [addr]
				}));
			}}
		},
		mod: function(table, addr) {
			for (var key in table) { if (table.hasOwnProperty(key)) {
				table[key].websocket.send(JSON.stringify({
					method: "mod",
					peers: [addr]
				}));
			}}
		}
	});

	self.channels = {
		track: function(peer) {
			self.peers.add(peer);

			peer.websocket.on("message", function (message, flags) {
				console.log("websocket message: {message: %s, flags: %s}", message, flags);
			});

			peer.websocket.on("close", function (code, message) {
				console.log("websocket close: {code: %s, message: %s}", code, message);
				self.peers.del(peer.addr);
			});

			peer.websocket.on("error", function (error) {
				console.log("websocket error: {error: %s}", error);
				self.peers.del(peer.addr);
			});
		}
	};

	self.connect = function(websocket) {
		var channel = url.parse(websocket.upgradeReq.url).pathname.replace(/^\/|\/$/g, '');
		var peer = new Peer(websocket);
		console.log("websocket opened from '%s' to '%s' channel", peer.addr, channel);
		self.channels[channel](peer);
	};
}

module.exports.Tracker = Tracker;