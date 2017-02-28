var url = require('url');
var path = require('path');

function Peer(websocket) {
	var self = this;
	
	self.websocket = websocket;

	self.ip = websocket.upgradeReq.connection.remoteAddress;
	self.port = websocket.upgradeReq.connection.remotePort;
	self.addr = self.ip + ":" + self.port;
}

function Tracker() {
	var self = this;

	self.peers = {};

	self.channels = {
		"peers": {
			subscribe: function(peer) {
				console.log("websocket open from '%s' at '%s'", peer.addr, "peers");

				var send = function () {
					var msg = JSON.stringify(Object.keys(self.peers));
					for (var key in self.peers) {
						if (self.peers.hasOwnProperty(key)) {
							self.peers[key].websocket.send(msg);
						}
					}
				}

				self.peers[peer.addr] = peer;
				send();

				peer.websocket.on("message", function (message, flags) {
					console.log("websocket message: {message: %s, flags: %s}", message, flags);
				});

				peer.websocket.on("close", function (code, message) {
					console.log("websocket close: {code: %s, message: %s}", code, message);
					delete self.peers[peer.addr];
					send();
				});

				peer.websocket.on("error", function (error) {
					console.log("websocket error: {error: %s}", error);
					delete self.peers[peer.addr];
					send();
				});
			}
		}
	};

	self.connect = function(websocket) {
		var channel = url.parse(websocket.upgradeReq.url).pathname.replace(/^\/|\/$/g, '');
		var peer = new Peer(websocket);
		self.channels[channel].subscribe(peer);
	};
}

module.exports.Tracker = Tracker;