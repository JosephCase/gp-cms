'use strict';

var formidable = require("formidable"),
	swig = require('swig'),
	url = require("url"),
	sqlConnection = require('./sqlConnection'),
	fileController = require('./fileController'),
	config = require('./config'),
	contentPage = require('./contentPage');

var imageSizes = [1000, 700, 500];



var connection = sqlConnection.connection;


// get the page content and send it to the client
function getNewPage(response, request) {

	var parentPage_id = url.parse(request.url).query;

	var html = swig.renderFile('templates/page.html', {
		page: {newPage: true, parentPage_id: parentPage_id, id: 0},
	    pageContent: {},
	    contentDirectory: config.contentDirectory
	});

	response.write(html);
	response.end();
}

//update the page
function saveNewPage(response, request) {

	console.log('saveNewPage');

	var form = new formidable.IncomingForm();

	// allow multiple files to be uploaded
	form.multiples = true;

	form.parse(request, function(error, fields, files) {

		if(error) {
			console.log(error);
			response.end();
		} else {
			console.log('HELLLOOOOO ##1')
			if(fields.pageName && (files['mainImage'] || fields.parentPage_id == 0)) {
				
				console.log('HELLLOOOOO ##1')

				var pageName = fields.pageName;
				var pageUrl = pageName.toLowerCase().replace(/ /g, "_");

				var sql = "INSERT INTO page (name, url, parentPage_id) VALUES(?,?,?); ";
				if(fields.parentPage_id > 0) {
					sql += "UPDATE page set mainImage_url = CONCAT('mainImage_', LAST_INSERT_ID(), '.jpg') where id = LAST_INSERT_ID(); " +
					"select id, mainImage_url from page where id = LAST_INSERT_ID();"
				}

				connection.query( 
					sql,
					[pageName, pageUrl, fields.parentPage_id > 0],
					function(err, results) {
						if(err) {
							console.log('Problem creating new page: ' + err);
						} else {
							//save the image
							if(fields.parentPage_id > 0) {
								fileController.saveFile(files['mainImage'], results[2][0].mainImage_url);
							}
							// contentPage.updatePageContent(oContent, files);
							response.write(JSON.stringify({location: '/page?' + results[2][0].id}));
							response.end();
						}
					}
				);
			}	
		}


	});
}

exports.getNewPage = getNewPage;
exports.saveNewPage = saveNewPage;
