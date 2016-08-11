'use strict';

var db = require('./sqlConnection.js'),
	fileController = require('./fileController'),
	config = require('./config'),
	formidable = require("formidable"),
	Path = require('path'),
	swig = require('swig'),
	url = require("url"),
	async = require('async'),
	querystring = require('querystring');

var pageId = null;

// get the page content and send it to the client
function getPage(response, request) {

	console.log('GET PAGE');

	var query = url.parse(request.url).query;
	pageId = querystring.parse(query)['id'];

	// if the page id is 0 it means it's a new page
	if(pageId != 0) {
		getExistingPage(response);
	} else {
		getNewPage(response, querystring.parse(query)['parent_id']);
	}	
}

function getExistingPage(response) {
	db.connection.query(
		"SELECT name, mainImage_url, id, parentPage_id, visible FROM page where id = ?;" +
		'SELECT content.* FROM page' + 
	    	' inner join content' + 
				' on content.page_id = page.id and page.id = ?' +
				' ORDER BY position',
		[pageId, pageId],
		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {
				results[0][0].newPage = false;
				var html = swig.renderFile('templates/page.html', {
					page: results[0][0],
				    pageContent: results[1],
				    contentDirectory: config.contentDirectory,
				    videoFormats: config.videoFormats
				});

				response.write(html);
				response.end();
			}
		}
	);
}

function getNewPage(response, parent_id) {

	var html = swig.renderFile('templates/page.html', {
		page: {newPage: true, parentPage_id: parent_id, id: 0},
	    pageContent: {},
	    contentDirectory: config.contentDirectory,
		videoFormats: config.videoFormats
	});

	response.write(html);
	response.end();
}

//Create a new page
function createPage(response, request) {

	console.log('//CREATE A NEW PAGE');

	var form = new formidable.IncomingForm();
	
	form.multiples = true; // allow multiple files to be uploaded

	form.parse(request, function(error, fields, files) {

		if(error) {
			console.log(error);
			response.end();
		} else {

			var pageName = 'NO NAME';
			var pageUrl = '';			
			var visible = (fields.visible && fields.visible.toLowerCase() === 'true');

			if(fields.pageName) {
				var pageName = fields.pageName;
				var pageUrl = pageName.toLowerCase().replace(/ /g, "_");
			}

			var sql = "INSERT INTO page (name, url, parentPage_id, visible) VALUES(?,?,?,?); " +
				"select LAST_INSERT_ID() id;";
			if(fields.parentPage_id > 0) {
				sql += "UPDATE page set mainImage_url = CONCAT('mainImage_', LAST_INSERT_ID(), '.jpg') where id = LAST_INSERT_ID(); " +
				"select mainImage_url from page where id = LAST_INSERT_ID();"
			}

			db.connection.query( 
				sql,
				[pageName, pageUrl, fields.parentPage_id, visible],
				function(err, results) {
					if(err) {
						console.log('Problem creating new page: ' + err);
					} else {

						pageId = results[1][0].id;

						// tasks to execture in parallel
						var tasks = [
							function(callback){
								//save the image
								if(files && files['mainImage']) {
									fileController.saveFile(files['mainImage'], results[3][0].mainImage_url, callback);
								}
							},
							function(callback) {
								// update page content
								if(fields.content) {
									var oContent = JSON.parse(fields.content);
									updatePageContent(oContent, files, callback);
								}
							}
						];

						async.parallel(tasks,
						// optional callback
						function(err) {
							//response with the new page url
							response.write(JSON.stringify({location: '/page?id=' + pageId}));
							response.end();
						});	

						
					}
				}
			);
		}


	});
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

			var tasks = [
				function(callback){
					updatePageDetails(fields.pageName, files['mainImage'], fields.visible, callback)
				},
				function(callback) {
					updatePageContent(oContent, files, callback);
				}
			];

			async.parallel(tasks,
			// optional callback
			function(err, results) {
			    console.log('***DONE DONE DONE***');
				response.end();
			});					
		}
	});
}

// update the main image and page name (also updates url to_match_page_name)
function updatePageDetails(pageName, mainImage, visible, parent_callback) {
	
	// add task to async.parallel to callback once all have been completed
	var tasks = [function(callback){
		// if the page name is set, change it on the server
		if(pageName) {

			var pageUrl = pageName.toLowerCase().replace(/ /g, "_");
			db.connection.query( 
				"UPDATE page SET name=?, url=? WHERE id=?",
				[pageName, pageUrl, pageId],
				callback
			)
		} else {
			callback();
		}
	}, function(callback) {
		//if the image has changed, overwrite the old image
		if(mainImage) {
			db.connection.query( 
				"select mainImage_url from page where id = ?",
				[pageId],
				function (err, results) {
					if(err) {
						console.log(err)
					} else {
						fileController.saveFile(mainImage, results[0].mainImage_url, callback);
					}
				}
			);
		} else {
			callback();
		}
	}, function(callback) {
		if(visible) {
			visible = (visible.toLowerCase() === 'true');
			console.log(visible);
			db.connection.query( 
				"UPDATE page SET visible=? WHERE id=?",
				[visible, pageId],
				callback
			);
		} else {
			callback();
		}
	}];

	async.parallel(tasks, parent_callback);

}

// update the content within the page
function updatePageContent(oContent, files, all_done_callback) {

	var tasks = [];

	for(var propertyName in oContent) {
		(function(content, file){
			if(content.action === 'edit') {
				tasks.push(function(callback) {
					edit_content(content, file, callback);
				})
			} else if(content.action === 'delete') {
				tasks.push(function(callback) {
					delete_content(content, callback);
				})
			} else if(content.action === 'add') {
				if(content.type == 'img' || content.type == 'video') {
					tasks.push(function(callback) {
						add_file(content, file, callback);
					})
				} else {
					tasks.push(function(callback) {
						add_content(content, callback);
					})
				}
			} else {
				console.log('Unrecognised action: ' + content.action);
			}
		}(oContent[propertyName], files[propertyName]));

	}

	async.parallel(tasks, all_done_callback);

}

function edit_content(obj, file, callback) {

	db.connection.query( 
		"UPDATE content SET content=COALESCE(?,content), size=COALESCE(?,size), language=COALESCE(?,language), position=COALESCE(?,position) WHERE id=?;" +
		"select content from content where id = ?", //this is only useful when editing a file
		[obj.data, obj.size, obj.lang, obj.position, obj.id, obj.id],
		function (err, results) {
			if(err) {
				console.log(err);
				callback(err);
			} else if(file) {
				fileController.saveFile(file, results[1][0].content, callback);
			} else {
				callback();
			}
		}
	);	
}

function delete_content(obj, callback) {

	var query = "SELECT content FROM content WHERE id=?;" +
				"DELETE FROM content WHERE id=?;"

	db.connection.query(query, 
		[obj.id, obj.id],
		function(err, results, fields) {
		if(err) {
			console.log(err);
			callback(err);
		} else {
			console.log(results[0][0].content);
			if(obj.type == 'img' || obj.type == 'video') {
				fileController.deleteFile(results[0][0].content, obj.type, callback);
			} else {
				callback();
			}
		}
	});
}

function add_content(obj, callback) {

	console.log(obj.type, obj.data, obj.size, obj.lang, obj.position, pageId);

	db.connection.query( 
		'INSERT INTO content' +
			" VALUES (NULL, ?, ?, ?, ?, ?, ?)",
		[obj.type, obj.data, obj.size, obj.lang, obj.position, pageId],
		callback
	);
}

function add_file(obj, file, callback) {
	console.log('!! ADD FILE !!');
	db.connection.query( 
		"INSERT INTO content VALUES (NULL, ?, '', ?, ?, ?, ?);" +
		"UPDATE content set content = CONCAT('file_', LAST_INSERT_ID(), ?) where id = LAST_INSERT_ID();" +
		"SELECT content from content where id = LAST_INSERT_ID()",
		[obj.type, obj.size, obj.lang, obj.position, pageId, ((obj.type == 'img') ? '.jpg' : '')],
		function (err, results) {
			if(err) {
				console.log(err);
				callback(err);
			} else {
				fileController.saveFile(file, results[2][0].content, callback);
			}
		}
	);
}

exports.getPage = getPage;
exports.createPage = createPage;
exports.updatePage = updatePage;
