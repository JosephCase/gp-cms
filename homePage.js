'use strict';

var db = require('./sqlConnection.js'),
	swig = require('swig'),
	formidable = require("formidable");

// get the page content and send it to the client
function getPage(callback) {

	console.log("Get the homepage")

	getPageContent(function(content){
		var html = swig.renderFile(__dirname + '/templates/home.html', {
			content: content
		});
		callback(html)
	});	

}
function getPageContent(callback) {
	console.log("Get the homepage content")

	db.connection.query(
		"select parentPage.id section_id, parentPage.name section_name, parentPage.isParent, parentPage.visible sectionVisible, parentPage.position parent_position, " + 
		"childPage.id page_id, childPage.name page_name, childPage.visible pageVisible, childPage.position child_position " +
			"from navigation " +
		    	"INNER JOIN page as parentPage " +
		        	"on parentPage.id = navigation.page_id " +
		    	"left join page as childPage " +
		        	"on childPage.parentPage_id = parentPage.id " +
		        "order by parent_position, section_id, child_position, page_id desc",
		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {
				var nestedResults = nestResults(results);
				callback(nestedResults);
			}
		}
	);
}

function reOrderPages(request, callback) {

	console.log('Re-order the pages');

	var form = new formidable.IncomingForm();

	form.parse(request, function(error, fields, files) {
		
		if(error) {
			console.log(error);
		} else {

			var sql = '';
			var params = [];

			// loop through the reordered pages building up sql query with params
			for(var page in fields) {
				sql += 'UPDATE page SET position=? WHERE id=?;'
				params.push(fields[page].newIndex, fields[page].id)
			}

			db.connection.query(
				sql, params,
				function (err, results, fields) {
					if(err) {
						console.log(err);
					}
					callback();
				}
			);		
		}		

	});	
}

function nestResults(results) {
	var nestedResults = [];
	var section = null;
	for (var i = 0; i < results.length; i++) {
		if(!section || results[i].section_id != section.id) {
			section = {id: results[i].section_id, name: results[i].section_name,
				isParent: results[i].isParent, visible: results[i].sectionVisible};
			if(results[i].page_id) {
				section.pages = [{id: results[i].page_id, name: results[i].page_name, visible: results[i].pageVisible}];
			}
			nestedResults.push(section);
		} else {
			section.pages.push({id: results[i].page_id, name: results[i].page_name, visible: results[i].pageVisible});
		}
	}
	return nestedResults;
}


exports.getPage = getPage;
exports.getPageContent = getPageContent;
exports.reOrderPages = reOrderPages;
