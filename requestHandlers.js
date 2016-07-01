'use strict';

var mysql = require('mysql'),
	querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable"),
	customFunction = require("./customFunction"),
	Path = require('path'),
	swig = require('swig'),
	im = require('imagemagick');

var imageSizes = [1000, 700, 500];



var connection;
var contentDirectory = 'content/';
var pageId = null;

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
		"SELECT name, mainImage_url, id FROM page where id = ?;" +
		'SELECT content.* FROM page' + 
	    	' inner join content' + 
				' on content.page_id = page.id and page.id = ?' +
				' ORDER BY position',
		[8, 8],
		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {

				var html = swig.renderFile('templates/page.html', {
					page: results[0][0],
				    pageContent: results[1],
				    contentDirectory: contentDirectory
				});

				response.write(html);
				response.end();
			}
		}
	);
}

//update the page
function updatePage(response, request) {
	console.log("Request handler 'upload' was called.");

	var form = new formidable.IncomingForm();

	// allow multiple files to be uploaded
	form.multiples = true;

	console.log("About to parse");
	form.parse(request, function(error, fields, files) {

		// get the page id
		pageId = fields.pageId;
		
		var oContent = JSON.parse(fields.content);

		if(error) {
			console.log(error);
		} else {
			updatePageDetails(fields.pageName, files['mainImage']);
			updatePageContent(oContent, files);		
		}

		response.end();

	});

	

}

// update the main image and page name (also updates url to_match_page_name)
function updatePageDetails(pageName, mainImage) {
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
				console.log(results);
				if(err) {
					console.log(err)
				} else {
					var newPath = contentDirectory + results[0].mainImage_url;
					fs.rename(mainImage.path, newPath, function() {
						resizeImage(newPath);
					});
				}
			}
		);
	}

}

// update the content within the page
function updatePageContent(oContent, files) {
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
	console.log(obj);
	connection.query( 
		"select content from content where id = ?",
		[obj.id],
		function (err, results) {
			console.log(results);
			saveFile(file, err, results[0].content);
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
				deleteFile(obj.data)
			}
		}
	});
}

function add_content(obj) {
	connection.query( 
		'INSERT INTO content' +
			" VALUES (NULL, ?, ?, ?, ?, ?, 8)",
		[obj.type, obj.data, obj.size, obj.lang, obj.position],
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
		"INSERT INTO content VALUES (NULL, ?, '', ?, ?, ?, 8);" +
		"UPDATE content set content = CONCAT('file_', LAST_INSERT_ID(), ?) where id = LAST_INSERT_ID();" +
		"SELECT content from content where id = LAST_INSERT_ID()",
		[obj.type, obj.size, obj.lang, obj.position, ((obj.type == 'img') ? '.jpg' : '.mp4')],
		function (err, results) {
			saveFile(file, err, results[2][0].content);
		}
	);
}

function deleteFile(file) {
	var filePath = contentDirectory + Path.basename(file);
	fs.unlink(filePath, deleteFile_handle);
	for (var i = imageSizes.length - 1; i >= 0; i--) {
		var resizedFilePath = filePath.replace('.jpg', '_x' + imageSizes[i] + '.jpg');
		fs.unlink(resizedFilePath, deleteFile_handle);	
	}
}

function deleteFile_handle(err) {
	if(err) {
		console.log("Could't delete file: " + err);
	}
}

function saveFile(file, err, fileName) {
	console.log('//save file')
	var newPath = contentDirectory + fileName;
	fs.rename(file.path, newPath, function() {
		resizeImage(newPath);
	});
}

function resizeImage(path) {
	for (var i = imageSizes.length - 1; i >= 0; i--) {		
		createNewSize(path, imageSizes[i]);
	}
}

function createNewSize(path, size) {

	var newPath = path.replace('.jpg', '_x' + size + '.jpg');

	im.resize({
	  srcPath: path,
	  dstPath: newPath,
	  width:   size,
	  filter: 'Lanczos'
	}, function(err, stdout, stderr){
	  if (err) throw err;
	  console.log('resized!');
	});
} 

function sqlErrorHandler(err, results, fields) {
	if(err) {
		console.log('SQL_ERR: ' + err);
	}
}

function file(response, pathname, suffix){
	fs.readFile('.' + pathname, function(err, fileContent) {
		console.log(fileContent);
		if (err) {
			console.log('READ FILE ERROR: ' + err);
		} else {
			response.writeHead(200);
			response.write(fileContent);
			response.end();
		}
	});
}

exports.getPage = getPage;
exports.updatePage = updatePage;
exports.file = file;
