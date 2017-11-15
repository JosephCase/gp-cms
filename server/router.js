const express = require('express');
const cookieParser = require('cookie-parser');

const config = require('../config/config.js');
const controller = require('./controller.js');

var sessionChecker = function (req, res, next) {

	if(req.cookies.jwt) {
		next();
	} else {
		res.redirect('/login');
	}
};

var app = express();

//static files
app.use(express.static(global.appRoute + '/static'));

//session check
app.use(cookieParser("'blue_sky'"));

app.get("/login", controller.getLoginPage)
app.post("/login", controller.login);


// app.use(sessionChecker);



// // Homepage
// app.get("/", function(req, res) {
// 	homePage.getPage(res);
// });
// app.put("/", function(req, res) {
// 	homePage.reOrderPages(req, res);
// });

// // Page
// app.get("/page", function(req, res) {
// 	page.getPage(req, res);
// });
// app.post("/page", function(req, res) {
// 	page.createPage(req, res);
// });
// app.patch("/page", function(req, res) {
// 	page.updatePage(req, res);
// });

module.exports = app;


