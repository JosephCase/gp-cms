var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var homePage = require("./homePage");
var page = require("./page");

var handle = {}

//Hompage
handle["/"] = homePage.getPage;
handle["/reOrderPages"] = homePage.reOrderPages;

// Existing page
handle["/page"] = page.getPage;
handle["/createPage"] = page.createPage;
handle["/updatePage"] = page.updatePage;

// New page

//Stactic files
handle["file"] = requestHandlers.file;

server.start(router.route, handle);