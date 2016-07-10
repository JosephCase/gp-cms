var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var homePage = require("./homePage");
var contentPage = require("./contentPage");
var newPage = require("./newPage");

var handle = {}
handle["/"] = homePage.getPage;
handle["/page"] = contentPage.getPage;
handle["/updatePage"] = contentPage.updatePage;
handle["/newPage"] = newPage.getNewPage;
handle["/savePage"] = newPage.saveNewPage;
handle["file"] = requestHandlers.file;

server.start(router.route, handle);