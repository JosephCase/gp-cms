var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var homePage = require("./homePage");
var contentPage = require("./contentPage");

var handle = {}
handle["/"] = homePage.getPage;
handle["/getPage"] = contentPage.getPage;
handle["/updatePage"] = contentPage.updatePage;
handle["file"] = requestHandlers.file;

server.start(router.route, handle);