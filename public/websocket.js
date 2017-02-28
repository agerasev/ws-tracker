// This function opens websocket on ports suitable for OpenShift
function openWebSocket(path) {
	var wsProto = 'ws:', wsPort = 8000;
	if(window.location.protocol == 'https:') { wsProto = 'wss:'; wsPort = 8443; }
	var websocket = new WebSocket(wsProto + '//' + window.location.hostname + ':' + wsPort + '/' + path);
	return websocket;
}