var fs = require('fs');

// console.log(fs.realpathSync(__dirname);

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
config.contentDirectory = __dirname + '/' + contentDirectory;
// var config = {};

module.exports = config;