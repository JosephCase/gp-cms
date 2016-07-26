'use strict';

var sqlConnection = require('./sqlConnection.js'),
	fileController = require('./fileController'),
	config = require('./config'),
	formidable = require("formidable"),
	Path = require('path'),
	swig = require('swig'),
	url = require("url");



var connection = sqlConnection.createConnection();
var pageId = null;



// get the page content and send it to the client
function getPage(response, request) {

	console.log('GET PAGE');

	pageId = url.parse(request.url).query;

	connection.query(
		"SELECT name, mainImage_url, id, parentPage_id parentPage_id FROM page where id = ?;" +
		'SELECT content.* FROM page' + 
	    	' inner join content' + 
				' on content.page_id = page.id and page.id = ?' +
				' ORDER BY position',
		[pageId, pageId],
		function (err, results, fields) {
			console.log('SQL_DONE');
			if(err) {
				console.log(err);
			} else {
				results[0][0].newPage = false;
				var html = swig.renderFile('templates/page.html', {
					page: results[0][0],
				    pageContent: results[1],
				    contentDirectory: config.contentDirectory
				});

				response.write(html);
				response.end();
			}
		}
	);
}

//update the page
function updatePage(response, request) {

	var form = new formidable.IncomingForm();

	// allow multiple files to be uploaded
	form.multiples = true;

	form.parse(request, function(error, fields, files) {

		// get the page id
		pageId = fields.pageId;
		
		var oContent = JSON.parse(fields.content);

		if(error) {
			console.log(error);
		} else {
			updatePageDetails(fields.pageName, files['mainImage'], response);
			updatePageContent(oContent, files, response);		
		}
		
		response.end();


	});

	

}

// update the main image and page name (also updates url to_match_page_name)
function updatePageDetails(pageName, mainImage, response) {
	// if the page name is set, change it on the server
	if(pageName) {

		var pageUrl = pageName.toLowerCase().replace(/ /g, "_");

		connection.query( 
			"UPDATE page SET name=?, url=? WHERE id=?",
			[pageName, pageUrl, pageId],
			sqlErrorHandler
		);
	}

	//if the image has changed, overwrite the old image
	if(mainImage) {
		connection.query( 
			"select mainImage_url from page where id = ?",
			[pageId],
			function (err, results) {
				if(err) {
					console.log(err)
				} else {
					fileController.saveFile(mainImage, results[0].mainImage_url);
				}
			}
		);
	}

}

// update the content within the page
function updatePageContent(oContent, files, response) {
	for(var propertyName in oContent) {
		if(oContent[propertyName].action === 'edit') {
			if(oContent[propertyName].type == 'img' || oContent[propertyName].type == 'video') {
				edit_file(oContent[propertyName], files[propertyName]);
			} else {
				edit_content(oContent[propertyName]);
			}
		} else if(oContent[propertyName].action === 'delete') {
			delete_content(oContent[propertyName]);
		} else if(oContent[propertyName].action === 'add') {
			if(oContent[propertyName].type == 'img' || oContent[propertyName].type == 'video') {
				add_file(oContent[propertyName], files[propertyName]);
			} else {
				add_content(oContent[propertyName]);
			}
		} else if(oContent[propertyName].action === 'reorder') {
			reOrder_content(oContent[propertyName]);
		} else {
			console.log('Unrecognised action: ' + oContent[propertyName].action);
		}
	}
}

function edit_content(obj) {

	connection.query( 
		"UPDATE content SET content=?, size=?, language=?, position=? WHERE id=?",
		[obj.data, obj.size, obj.lang, obj.position, obj.id],
		sqlErrorHandler
	);	
}

function edit_file(obj, file) {
	connection.query( 
		"select content from content where id = ?",
		[obj.id],
		function (err, results) {
			if(err) {
				console.log(err);
			} else {
				fileController.saveFile(file, results[0].content);
			}
		}
	);
}

function delete_content(obj) {

	var query = 'DELETE FROM content' + 
			" WHERE id=" + obj.id;

	connection.query(query, function(err, results, fields) {
		if(err) {
			console.log(err);
		} else {
			if(obj.type == 'img' || obj.type == 'video') {
				fileController.deleteFile(obj.data)
			}
		}
	});
}

function add_content(obj) {
	connection.query( 
		'INSERT INTO content' +
			" VALUES (NULL, ?, ?, ?, ?, ?, ?)",
		[obj.type, obj.data, obj.size, obj.lang, obj.position, pageId],
		sqlErrorHandler
	);
}

function reOrder_content(obj) {

	connection.query( 
		'UPDATE content SET position=? WHERE id=?',
		[obj.position, obj.id],
		sqlErrorHandler
	);
}

function add_file(obj, file) {
	console.log('!! ADD IMAGE !!');
	connection.query( 
		"INSERT INTO content VALUES (NULL, ?, '', ?, ?, ?, ?);" +
		"UPDATE content set content = CONCAT('file_', LAST_INSERT_ID(), ?) where id = LAST_INSERT_ID();" +
		"SELECT content from content where id = LAST_INSERT_ID()",
		[obj.type, obj.size, obj.lang, obj.position, pageId, ((obj.type == 'img') ? '.jpg' : '.mp4')],
		function (err, results) {
			if(err) {
				console.log(err);
			} else {
				fileController.saveFile(file, results[2][0].content);
			}
		}
	);
}



function sqlErrorHandler(err, results, fields) {
	if(err) {
		console.log('SQL_ERR: ' + err);
	}
}

exports.getPage = getPage;
exports.updatePage = updatePage;
exports.updatePageContent = updatePageContent;
