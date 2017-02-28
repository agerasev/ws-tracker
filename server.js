#!/bin/env node

var http = require("http");
var fs = require("fs");
var ws = require("ws");

var static = require("./static");
var tracker = require("./tracker");

function App() {
	var self = this;

	self.setupVars = function() {
		//  Set the environment variables we need.
		self.ipaddr = process.env.OPENSHIFT_NODEJS_IP || process.env.LOCAL_IP || "localhost";
		self.port   = process.env.OPENSHIFT_NODEJS_PORT || process.env.LOCAL_PORT || 8080;
		self.wsport = process.env.LOCAL_WS_PORT;
		console.log("%s: { ipaddr: %s, port: %s, wsport: %s }", Date(Date.now()), self.ipaddr, self.port, self.wsport);
	};

	/**
	 *  terminator === the termination handler
	 *  Terminate server on receipt of the specified signal.
	 *  @param {string} sig  Signal to terminate on.
	 */
	self.terminator = function(sig){
		if (typeof sig === "string") {
			console.log("%s: %s received - terminating ...", Date(Date.now()), sig);
			process.exit(1);
		}
		console.log("%s: server stopped", Date(Date.now()));
	};

	self.setupTermHandlers = function(){
		//  Process on exit and signals.
		process.on("exit", function() { self.terminator(); });

		// Removed "SIGPIPE" from the list - bugz 852598.
		["SIGHUP", "SIGINT", "SIGQUIT", "SIGILL", "SIGTRAP", "SIGABRT",
		 "SIGBUS", "SIGFPE", "SIGUSR1", "SIGSEGV", "SIGUSR2", "SIGTERM"
		].forEach(function(element, index, array) {
			process.on(element, function() { self.terminator(element); });
		});
	};

	self.initTracker = function() {
		self.tracker = new tracker.Tracker();
	};

	self.initHttp = function() {
		self.fileServer = new static.FileServer();
		self.httpServer = http.createServer(function(req, res) {
			self.fileServer.handle(req, res);
		});
	};

	self.initWs = function() {
		self.wsServer = new ws.Server({server: self.httpServer, port: self.wsport});
		self.wsServer.on("connection", function (websocket) {
			self.tracker.connect(websocket);
		});
	};
	

	self.init = function() {
		self.setupVars();
		self.setupTermHandlers();

		self.initTracker();
		self.initHttp();
		self.initWs();
	};

	self.start = function() {
		self.httpServer.listen(self.port, self.ipaddr, function() {
			console.log("%s: server started on %s:%d ...", Date(Date.now()), self.ipaddr, self.port);
		});
	};

};

var app = new App();
app.init();
app.start();

