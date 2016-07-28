var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var homePage = require("./homePage");
var contentPage = require("./contentPage");
var newPage = require("./newPage");

var handle = {}

//Hompage
handle["/"] = homePage.getPage;
handle["/reOrderPages"] = homePage.reOrderPages;

// Existing page
handle["/page"] = contentPage.getPage;
handle["/updatePage"] = contentPage.updatePage;

// New page
handle["/newPage"] = newPage.getNewPage;
handle["/savePage"] = newPage.saveNewPage;

//Stactic files
handle["file"] = requestHandlers.file;

server.start(router.route, handle);