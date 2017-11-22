const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const config = require('../config/config.js');
const controller = require('./controller.js');

var sessionChecker = function (req, res, next) {

	if(req.cookies.jwt) {
		req.headers['x-access-token'] = req.cookies.jwt;
		next();
	} else {
		if(req.xhr) {
			res.status(403).send();
		} else {
			res.redirect('/login');
		}
	}
};

var app = express();

//static files
app.use(express.static(global.appRoute + '/static'));

app.get("/login", controller.getLoginPage)
app.post("/login", controller.login);

app.get("/", controller.getNavPage);
app.get("/sections/:id", controller.getSectionPages)
app.get("/pages/:id", controller.getPage);

// Homepage
app.use(cookieParser("'blue_sky'"));
app.use(sessionChecker);
app.use(bodyParser.json());

// sections
app.patch("/reorderPages/:id", controller.reOrderPages)
app.post("/sections/:id/pages", controller.createPage)
// app.put("/", function(req, res) {
// 	homePage.reOrderPages(req, res);
// });

// // Page
// app.post("/page", function(req, res) {
// 	page.createPage(req, res);
// });
// app.patch("/page", function(req, res) {
// 	page.updatePage(req, res);
// });

module.exports = app;


