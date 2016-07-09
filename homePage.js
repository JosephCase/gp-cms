'use strict';

var sqlConnection = require('./sqlConnection.js'),
	swig = require('swig');

var connection = sqlConnection.createConnection();
var contentDirectory = 'content/';

// get the page content and send it to the client
function getPage(response) {

	connection.query(
		"select parentPage.id section_id, parentPage.name section_name, parentPage.isParent, childPage.id page_id, childPage.name page_name " +
			"from navigation " +
		    	"INNER JOIN page as parentPage " +
		        	"on parentPage.id = navigation.page_id " +
		    	"left join page as childPage " +
		        	"on childPage.parentPage_id = parentPage.id " +
		        "order by section_id, page_id",
		function (err, results, fields) {
			if(err) {
				console.log(err);
			} else {
				console.log(results);
				var nestedResults = nestResults(results);
				console.log(nestedResults);
				var html = swig.renderFile('templates/home.html', {
					sections: nestedResults
				});
				response.write(html);
				response.end();
			}
		}
	);
}

function nestResults(results) {
	var nestedResults = [];
	var section = null;
	for (var i = 0; i < results.length; i++) {
		console.log(results[i]);
		if(!section || results[i].section_id != section.id) {
			section = {id: results[i].section_id, name: results[i].section_name, isParent: results[i].isParent};
			if(results[i].page_id && results[i].page_name) {
				section.pages = [{id: results[i].page_id, name: results[i].page_name}];
			}
			nestedResults.push(section);
		} else {
			section.pages.push({id: results[i].page_id, name: results[i].page_name});
		}
	}
	return nestedResults;
}


exports.getPage = getPage;
