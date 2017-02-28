var fs = require("fs");
var path = require("path");

var serveStatic = require("serve-static");
var finalhandler = require("finalhandler");

function FileServer() {
	var self = this;

	var public_dir = "./public";

	fs.createReadStream("./node_modules/jquery/dist/jquery.min.js").pipe(fs.createWriteStream(path.join(public_dir, "jquery.min.js")));

	self.serveStatic = serveStatic(public_dir);

	self.handle = function(req, res) {
		self.serveStatic(req, res, finalhandler(req, res));
	}
}

module.exports.FileServer = FileServer;