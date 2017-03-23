function PeerTable(htmlContainer) {
	var self = this;

	self.table = {};

	self.htmlContainer = htmlContainer;

	self.add = function(peer) {
		if (self.table.hasOwnProperty(peer.addr)) {
			return false;
		} else {
			self.table[peer.addr] = peer;
			self.htmlContainer.appendChild(peer.html);
			return true;
		}
	}

	self.del = function(addr) {
		if (self.table.hasOwnProperty(addr)) {
			var peer = self.table[addr];
			peers.removeChild(peer.html);
			delete self.table[addr];
			return true;
		} else {
			return false;
		}
	}

	self.mod = function(addr) {
		if (self.table.hasOwnProperty(addr)) {
			return true;
		} else {
			return false;
		}
	}
}

function Peer(addr) {
	var self = this;

	self.addr = addr;

	var entry = document.createElement('div');
	entry.className = 'peer';

	var name = document.createElement('div');
	name.className = 'peer-name';
	name.innerHTML = addr;

	var desc = document.createElement('div');
	desc.className = 'peer-desc';
	desc.innerHTML = "";

	var img = document.createElement('img');
	img.className = 'peer-image';
	img.src = "/img/hex48.png";
	entry.appendChild(img);

	var textContainer = document.createElement('div');
	textContainer.className = 'peer-text-container';
	textContainer.appendChild(name);
	textContainer.appendChild(desc);

	entry.appendChild(textContainer);

	self.html = entry;
}

function ready() {
	var peers = new PeerTable(document.getElementById("peers"));

	var websocket = openWebSocket("track");
	websocket.onopen = function(event) {
		console.log('websocket opened');
	};
	websocket.onclose = function(event) { 
		console.log('websocket closed');
	};
	websocket.onmessage = function(event) {
		console.log('websocket message: ' + event.data);
		var message = JSON.parse(event.data);
		if (message.method == "add") {
			for (var addr of message.peers) {
				peers.add(new Peer(addr));
			}
		} else if (message.method == "del") {
			for (var addr of message.peers) {
				peers.del(addr);
			}
		} else if (message.method == "mod") {
			for (var addr of message.peers) {
				peers.mod(addr);
			}
		}
	};
	websocket.onerror = function(event) { 
		console.error('websocket error: ' + event.error);
	};
}

$(document).ready(ready);