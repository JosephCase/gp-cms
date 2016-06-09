'use strict';

var mysql = require('mysql'),
	querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable"),
	customFunction = require("./customFunction"),
	swig = require('swig');



var connection;

function createConnection () {

	connection = mysql.createConnection({
		host: '50.62.209.149',
		port: '3306',
		user: 'JosephCase',
		password: 'Ls962_aj',
		database: 'giusy_test'
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
				    pageContent: results
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
		if(error) {
			console.log(error);
		} else {
			for(var propertyName in fields) {
				if(fields[propertyName].action === 'edit') {
					edit_content(fields[propertyName]);
				} else if(fields[propertyName].action === 'delete') {
					delete_content(fields[propertyName]);
				} else if(fields[propertyName].action === 'add') {
					add_content(fields[propertyName]);
				} else {
					console.log('Unrecognised action: ' + fields[propertyName].action);
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

	connection.query( 
		'DELETE FROM content' + 
			" WHERE id=" + obj.id,

		sqlErrorHandler
	);
}

function add_content(obj) {
	connection.query( 
		'INSERT INTO content' +
			" VALUES (NULL, \"" + obj.type + "\", \"" + obj.data + "\", " + obj.size + ", \"" + obj.lang + "\", 8)",

		sqlErrorHandler
	);
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
			console.log(err);
		} else {
			response.writeHead(200, {"Content-Type": "text/javascript"});
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
