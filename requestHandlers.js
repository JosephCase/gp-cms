'use strict';

var	fs = require("fs");

function file(response, pathname, suffix){
	fs.readFile('.' + pathname, function(err, fileContent) {
		console.log(fileContent);
		if (err) {
			console.log('READ FILE ERROR: ' + err);
			response.writeHead(404);
		} else {
			response.writeHead(200);
			response.write(fileContent);
		}
		response.end();
	});
}

exports.file = file;
