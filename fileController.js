
var fs = require("fs"),
	im = require('imagemagick'),
	config = require('./config'),
	async = require('async');

function deleteFile(fileName, all_done) {
	console.log('DELETING A FILE');
	var filePath = config.contentDirectory + fileName;

	console.log(fileName);

	var tasks = [function(callback){
		fs.unlink(filePath, function(err) {
			if(err) {
				console.log("Could't delete file: " + err);
			}
			callback();
		});
	}]

	for (var i = config.imageSizes.length - 1; i >= 0; i--) {
		(function(_i) {
			tasks.push(function(callback){
				var resizedFilePath = filePath.replace('.jpg', '_x' + config.imageSizes[_i] + '.jpg');
				fs.unlink(resizedFilePath, function(err) {
					if(err) {
						console.log("Could't delete file: " + err);
					}
					callback();
				});
			})
		}(i));	
	}

	async.parallel(tasks, all_done);

}

function deleteFile_handle(err, callback) {
	if(err) {
		console.log("Could't delete file: " + err);
	}
	callback();
}

function saveFile(file, fileName, callback) {
	console.log('//save file');
	console.log(file.path);
	if((typeof fileName) === 'string') {
		var newPath = config.contentDirectory + fileName;
		fs.rename(file.path, newPath, function() {
			resizeImage(newPath, callback)
		});
	} else {
		callback();
		console.log("ERROR, file new is not string! " + fileName);
	}
}

function resizeImage(newPath, all_done_callback) {
	var tasks = [];		
	for (var i = config.imageSizes.length - 1; i >= 0; i--) {
		(function(_i) {
			tasks.push(function(callback) {
				createNewSize(newPath, config.imageSizes[_i], callback);
			});
		}(i));			
	}
	async.parallel(tasks, all_done_callback);
}

function createNewSize(path, size, callback) {

	console.log('//RESIZE');

	var newPath = path.replace('.jpg', '_x' + size + '.jpg');

	console.log(path, newPath);

	im.resize({
	  srcPath: path,
	  dstPath: newPath,
	  width:   size,
	  filter: 'Lanczos'
	}, function(err, stdout, stderr){
	  if (err) throw err;
	  console.log('resized!');
	  callback();
	});
}

exports.saveFile = saveFile;
exports.deleteFile = deleteFile;