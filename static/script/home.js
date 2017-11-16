document.addEventListener('DOMContentLoaded', pageReady);

var oPages = {};
var $loader = $('#loader');
var Server;
var pageContainer;

function pageReady() {

	pageContainer = document.getElementById('pageContainer');
	Server = new _Server();

	if(Cookies.get("selectedSection")) {
		var sectionId = Cookies.get("selectedSection");
		Server.getPages(sectionId, renderPageList);
		$('#' + sectionId).addClass('selected');
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

	//reorder functionality
	var sections = document.getElementsByClassName('contentList');

	for (var i = sections.length - 1; i >= 0; i--) {
		if($(sections[i]).find('.children .page').length > 1) {
			new DraggableList($(sections[i]).children('.children'), reOrder);
		}
	}

}

function sectionClickHandler() {
	$('h5.section').removeClass('selected');
	Server.getPages(this.id, renderPageList);
	$(this).addClass('selected');
	Cookies.set("selectedSection", this.id);
}

function renderPageList(pageHtml) {
	pageContainer.innerHTML = pageHtml;
	var pages = pageContainer.getElementsByClassName('page');

	// attach event listeners
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', pageClickHandler);
	}
}

function pageClickHandler() {
	var pageId = this.id;
	window.location.href = 'page/' + pageId;
}
function addClickHandler() {
	console.log('click');
	var parentPage_id = this.getAttribute('data-section_id');
	window.location.href = 'page?id=0&parent_id=' + parentPage_id;
}
function reOrder(id, index, lastIndex) {
	// will add a new object with order, or edit if already exists
	if(!oPages[id]) {
		oPages[id] = {};
		oPages[id].id = id;
	}	
	oPages[id].position = index;
	if(lastIndex) {
		Server.update(oPages);
	}
}



var _Server = function() {
	


	var $loader = $('#loader');

	this.update = function(oPages) {

		if ($loader.hasClass('loading')) return false;	//stop double update
		$loader.addClass('loading');

		console.log($loader.length);

		$.ajax({
		    type: "PUT",
		    url: "/",
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(oPages),
			processData: false,
			contentType: "application/json; charset=utf-8",
		    success: updateDone,
		    timeout: function() {
		    	alert('timeout!');
		    },
		    failure: function(errMsg) {
		        alert(errMsg);
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