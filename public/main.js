function addPeerEntry(addr) {
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
	img.src = "/img/hex64.png";
	entry.appendChild(img);

	var textContainer = document.createElement('div');
	textContainer.className = 'peer-text-container';
	textContainer.appendChild(name);
	textContainer.appendChild(desc);

	entry.appendChild(textContainer);

	document.getElementById('peers').appendChild(entry);
}

function clearPeerEntries() {
	var peers = document.getElementById('peers');
	while (peers.firstChild) {
		peers.removeChild(peers.firstChild);
	}
}

function ready() {
	var websocket = openWebSocket("peers");
	websocket.onopen = function(event) {
		console.log('websocket opened');
	};
	websocket.onclose = function(event) { 
		console.log('websocket closed');
	};
	websocket.onmessage = function(event) {
		console.log('websocket message: ' + event.data);
		clearPeerEntries();
		var peers = JSON.parse(event.data);
		for (var addr of peers) {
			addPeerEntry(addr);
		}
	};
	websocket.onerror = function(event) { 
		console.error('websocket error: ' + event.error);
	};
}

$(document).ready(ready);