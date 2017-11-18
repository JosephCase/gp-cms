document.addEventListener('DOMContentLoaded', pageReady);

var gPages = [];
var $loader = $('#loader');
var Server;
var pageContainer;
var currentSection;

function pageReady() {

	pageContainer = document.getElementById('pageContainer');
	Server = new _Server();

	if(Cookies.get("selectedSection")) {
		currentSection = Cookies.get("selectedSection");
		Server.getPages(currentSection, renderPageList);
		$('#section_' + currentSection).addClass('selected');
	}

	attachEventListeners();
}

function attachEventListeners() {

	// change section functionality
	var sections = document.getElementsByClassName('section');
	for (var i = 0; i < sections.length; i++) {
		sections[i].addEventListener('click', sectionClickHandler);
	}

	// add edit functionality
	var pages = document.getElementsByClassName('page');
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', pageClickHandler);
	}

	// add 'add' functionality
	var adds = document.getElementsByClassName('add');
	for (var i = 0; i < adds.length; i++) {
		adds[i].addEventListener('click', addClickHandler);
	}

}

function sectionClickHandler() {

	var section_id = this.id.split('_')[1];
	currentSection = section_id;

	Server.getPages(section_id, renderPageList);

	$('h5.section').removeClass('selected');
	$(this).addClass('selected');

	Cookies.set("selectedSection", section_id);
}

function renderPageList(pageHtml) {
	pageContainer.innerHTML = pageHtml;
	pages = pageContainer.getElementsByClassName('page');

	// attach event listeners
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', pageClickHandler);
	}

	gPages = [];	//reset the global pages
	if(pages.length > 1) {
		new DraggableList($(pageContainer).children('.children'), reOrder);
	}
}

function pageClickHandler() {
	var pageId = this.id.split('_')[1];
	window.location.href = 'page/' + pageId;
}
function addClickHandler() {
	console.log('click');
	var parentPage_id = this.getAttribute('data-section_id');
	window.location.href = 'page?id=0&parent_id=' + parentPage_id;
}
function reOrder(id, index, lastIndex) {

	var page_id = id.split('_')[1];

	for (var i = gPages.length - 1; i >= 0; i--) {
		if(gPages[i].id == page_id) {
			gPages.splice(i, 1);
			break;
		}
	}

	gPages.push({id: page_id, position: index});

	if(lastIndex) {
		var section_id = pageContainer.id.split('_')[1];
		Server.update(currentSection, gPages);
	}
}



var _Server = function() {
	


	var $loader = $('#loader');

	this.update = function(section_id, pages) {

		if ($loader.hasClass('loading')) return false;	//stop double update
		$loader.addClass('loading');

		$.ajax({
		    type: "PATCH",
		    url: "/reorderPages/" + section_id,
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(pages),
			processData: false,
			contentType: "application/json; charset=utf-8",
		    success: updateDone,
		    timeout: function() {
		    	alert('timeout!');
		    },
		    failure: function(errMsg) {
		        alert(errMsg);
		    },
		    statusCode: {
		        403: function() {
		            alert("Does not have credentials");
					window.location.replace('/login?forbidden=true');
		        }
		    }
		});
	}

	function updateDone() {
		// location.reload(true);
		$loader.removeClass('loading');
	}

	this.getPages = function(sectionId, callback) {

		$.get("/sections/" + sectionId, callback);

	}

}