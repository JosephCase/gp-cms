'use strict';

var mysql = require('mysql'),
	querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable"),
	customFunction = require("./customFunction"),
	path = require('path'),
	swig = require('swig');



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


function start2(response) {
	console.log("Request handler 'start2' was called.");

	connection.query(
		'SELECT content.* FROM page as childPage' + 
	    	' inner join content' + 
				' on content.page_id = childPage.id' +
				' and childPage.url = "lightsign_rainbow"',

		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {

				var html = swig.renderFile('template.html', {
				    pageContent: results,
				    contentDirectory: contentDirectory
				});

				response.write(html);
				response.end();
			}
		}
	);
}

function update(response, request) {
	console.log("Request handler 'upload' was called.");

	var form = new formidable.IncomingForm();
	console.log("About to parse");
	form.parse(request, function(error, fields, files) {
		console.log("parsing done");
		
		var oContent = JSON.parse(fields.content);

		console.log(oContent);
		console.log(files);

		if(error) {
			console.log(error);
		} else {
			for(var propertyName in oContent) {
				if(oContent[propertyName].action === 'edit') {
					edit_content(oContent[propertyName]);
				} else if(oContent[propertyName].action === 'delete') {
					delete_content(oContent[propertyName]);
				} else if(oContent[propertyName].action === 'add') {
					if(oContent[propertyName].type == 'img' || oContent[propertyName].type == 'video') {
						add_file(oContent[propertyName], files[propertyName]);
					} else {
						add_content(oContent[propertyName]);
					}
				} else {
					console.log('Unrecognised action: ' + oContent[propertyName].action);
				}
			}			
		}

		response.end();

	});

	

}

function edit_content(obj) {

	connection.query( 
		'UPDATE content' + 
	    	" SET content=\"" + obj.data + "\"" +
	    	", size=\"" + obj.size + "\"" +
	    	", language=\"" + obj.lang + "\"" +
				" WHERE id=" + obj.id,

		sqlErrorHandler
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
			" VALUES (NULL, \"" + obj.type + "\", \"" + obj.data + "\", " + obj.size + ", \"" + obj.lang + "\", 8)",

		sqlErrorHandler
	);
}

function add_file(obj, file) {
	console.log('!! ADD IMAGE !!');
	connection.query( 
		'INSERT INTO content' +
			" VALUES (NULL, \"" + obj.type + "\", '', " + obj.size + ", \"" + obj.lang + "\", 8);" +
		"UPDATE content set content = CONCAT('img_', LAST_INSERT_ID(), '.jpg') where id = LAST_INSERT_ID();" +
		"SELECT content from content where id = LAST_INSERT_ID()",
		function (err, results) {
			saveFile(file, err, results);
		}
	);
}

function deleteFile(file) {
	console.log(file);
	// var filePath = contentDirectory + file;
	fs.unlink(contentDirectory + path.basename(file), function(err) {
		if(err) {
			console.log("Could't delete file: " + err);
		}
	});
}

function saveFile(file, err, results) {
	console.log('//save file')
	console.log(file);
	fs.rename(file.path, contentDirectory + results[2][0].content);
}

function sqlErrorHandler(err, results, fields) {
	if(err) {
		console.log('SQL_ERR: ' + err);
	}
}

function start(response) {
	console.log("Request handler 'start' was called.");

	fs.readFile("uploadForm.html", function(err, html) {
		if (err) {
			console.log(err);
		} else {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(html);
			response.end();
		}
	});
}








function upload(response, request) {
	console.log("Request handler 'upload' was called.");

	var form = new formidable.IncomingForm();
	console.log("About to parse");
	form.parse(request, function(error, fields, files) {
		console.log("parsing done");
		if(error) {
			console.log(error);
		} else if (customFunction.isEmpty(files)) {			
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not found");
			response.end();
		} else {
			fs.rename(files.upload.path, "tmp/test.jpg", function(err) {
				if (err) {
					fs.unlink("tmp/test.jpg");
					fs.rename(files.upload.path, "tmp/test.jpg");
				}
			});
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("received image:<br/>");
			response.write("<img src='/show' />");
			response.end();
		}


	});
}

function show(response) {
	console.log("Request handler 'show' was called.")
	fs.readFile("tmp/test.jpg", "binary", function (error, file) {
		if(error) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(error + "/n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/jpg"});
			response.write(file, "binary");
			response.end();
		}
	});
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

exports.start = start;
exports.start2 = start2;
exports.upload = upload;
exports.update = update;
exports.show = show;
exports.file = file;
