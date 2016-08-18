var express = require('express');
var homePage = require("./homePage");
var page = require("./page");
var cookieParser = require('cookie-parser')

var app = express();

//static files
app.use(express.static('static'));

//session check
app.use(cookieParser("'verde_speranza'"));

app.post("/login", function(req, res) {
	console.log('LOGGED IN!');
	res.cookie('user', 'giusy', { signed: true });
	res.write('success');
	res.end();
});

var sessionChecker = function (req, res, next) {

	console.log('Check session for ' + req.url);

	console.log(req.signedCookies);
	if(req.signedCookies.user == 'giusy') {
		next();
	} else {
		console.log('REDIRECT TO LOGIN');
		res.redirect('/login.html');
	}
};

app.use(sessionChecker);



// Homepage
app.get("/", function(req, res) {
	console.log('GET ME');
	homePage.getPage(res);
});
app.put("/", function(req, res) {
	homePage.reOrderPages(req, res);
});

// Page
app.get("/page", function(req, res) {
	page.getPage(req, res);
});
app.post("/page", function(req, res) {
	page.createPage(req, res);
});
app.patch("/page", function(req, res) {
	page.updatePage(req, res);
});

var server = app.listen(8888, function () {

	console.log("Express Server has started");
	// server.timeout = 0; Not needed as response no longer waits for video

});

