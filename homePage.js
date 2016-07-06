'use strict';

var mysql = require('mysql'),
	fs = require("fs"),
	formidable = require("formidable"),
	Path = require('path'),
	swig = require('swig'),
	im = require('imagemagick');

var connection;
var contentDirectory = 'content/';

function createConnection () {

	connection = mysql.createConnection({
		host: '50.62.209.149',
		port: '3306',
		user: 'JosephCase',
		password: 'Ls962_aj',
		database: 'giusy_test',
		multipleStatements: true
	});	

	connection.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
		  console.log('error when connecting to db:', err);
		  setTimeout(createConnection, 2000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});

	connection.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
		  createConnection();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
		  throw err;                                  // server variable configures this)
		}
	});
}

createConnection();

// get the page content and send it to the client
function getPage(response) {

	connection.query(
		"SELECT parentPage.id section_id, parentPage.name section_name, parentPage.isParent isParent, page.id page_id, page.name page_name " +
			"FROM page as parentPage " +
				"inner join navigation on navigation.page_id = parentPage.id " +
				"left join page on page.parentPage_id = parentPage.id " +
			"ORDER BY section_id, page_id",
		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {
				console.log(results);
				var nestedResults = nestResults(results);
				console.log(nestedResults);
				var html = swig.renderFile('templates/home.html', {
					sections: nestedResults
				});
				response.write(html);
				response.end();
			}
		}
	);
}

function nestResults(results) {
	var nestedResults = [];
	var section = null;
	for (var i = 0; i < results.length; i++) {
		if(!section || results[i].section_id != section.id) {
			section = {id: results[i].section_id, name: results[i].section_name};
			if(results[i].isParent) {
				section.pages = [{id: results[i].page_id}, {name: results[i].page_name}]
			}
			nestedResults.push(section);
		} else {
			section.pages.push({id: results[i].page_id}, {name: results[i].page_name})
		}
	}
	return nestedResults;
}


exports.getPage = getPage;
