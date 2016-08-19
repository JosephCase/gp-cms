var express = require('express');
var homePage = require("./homePage");
var page = require("./page");
var cookieParser = require('cookie-parser');
var config = require('./config');
var formidable = require("formidable");

var app = express();

//static files
app.use(express.static('static'));
app.use('/content', express.static('content'));

//session check
app.use(cookieParser("'verde_speranza'"));

app.post("/login", function(req, res) {
	
	var form = new formidable.IncomingForm();

	form.parse(req, function(error, fields) {
		if(error) {
			res.write('error');
		} else {

			if(fields.username == config.login.username && fields.password == config.login.password) {
				res.cookie('user', 'giusy', { signed: true });
				res.write('success');		
			} else {
				res.write('failure');
			}

		}

		res.end();

	});

});

var sessionChecker = function (req, res, next) {

	console.log('Check session for ' + req.url);

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
	server.timeout = 300000;

});

