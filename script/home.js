document.addEventListener('DOMContentLoaded', pageReady);

var oPages = {}

function pageReady() {
	attachEventListeners();
}

function attachEventListeners() {

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
	var sections = document.getElementsByClassName('section');

	for (var i = sections.length - 1; i >= 0; i--) {
		if($(sections[i]).find('.children .page').length > 1) {
			Toolbox.createDraggableList($(sections[i]).find('.children .page'), reOrder);
		}
	}

}

function pageClickHandler() {
	var pageId = this.id;
	window.location.href = 'page?' + pageId;
}
function addClickHandler() {
	console.log('click');
	var parentPage_id = this.getAttribute('data-section_id');
	window.location.href = 'newPage?' + parentPage_id;
}
function reOrder($element, lastIndex) {
	// will add a new object with order, or edit if already exists
	var id = $element.attr('id')
	if(!oPages[id]) {
		oPages[id] = {};
		oPages[id].id = id;
	}	
	oPages[id].position = $element.index();
	if(lastIndex) {
		Server.update(oPages);
	}
}

function refresh() {
	location.reload(true);
}

var Server = new function() {

	this.update = function(oPages) {

		console.log('update');

		$.ajax({
		    type: "POST",
		    url: "/reOrderPages",
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(oPages),
			processData: false,
			contentType: "application/json; charset=utf-8",
		    success: refresh,
		    failure: function(errMsg) {
		        alert(errMsg);
		    }
		});


		


	}

}