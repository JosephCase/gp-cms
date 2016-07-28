
var fs = require("fs"),
	im = require('imagemagick'),
	config = require('./config');

function deleteFile(fileName) {
	console.log('DELETING A FILE');
	var filePath = config.contentDirectory + fileName;
	fs.unlink(filePath, deleteFile_handle);
	for (var i = config.imageSizes.length - 1; i >= 0; i--) {
		var resizedFilePath = filePath.replace('.jpg', '_x' + config.imageSizes[i] + '.jpg');
		fs.unlink(resizedFilePath, deleteFile_handle);	
	}
}

function deleteFile_handle(err) {
	if(err) {
		console.log("Could't delete file: " + err);
	}
}

function saveFile(file, fileName) {
	console.log(file, fileName);
	console.log('//save file')
	if((typeof fileName) === 'string') {
		var newPath = config.contentDirectory + fileName;
		fs.rename(file.path, newPath, function() {
			resizeImage(newPath);
		});		
	} else {
		console.log("ERROR, file new is not string! " + fileName);
	}
}

function resizeImage(path) {
	for (var i = config.imageSizes.length - 1; i >= 0; i--) {		
		createNewSize(path, config.imageSizes[i]);
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

exports.saveFile = saveFile;
exports.deleteFile = deleteFile;