var http = require("http");
var url = require("url");

function start(route, handle) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received @ " + (Date.now() / 1000));

		route(handle, pathname, response, request);
	}

	var server = http.createServer(onRequest).listen(8888);
	server.timeout = 0;
	console.log("Server has started.");
}

exports.start = start;
