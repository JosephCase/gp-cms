var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.getPage;
handle["/update"] = requestHandlers.updatePage;
handle["file"] = requestHandlers.file;

server.start(router.route, handle);