document.addEventListener('DOMContentLoaded', pageReady);

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