document.addEventListener('DOMContentLoaded', pageReady);

function pageReady() {
	attachEventListeners();
}

function attachEventListeners() {
	var pages = document.getElementsByClassName('page');
	console.log(pages);
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', pageClickHandler);
	}
}

function pageClickHandler() {
	console.log('click');
	var pageId = this.id;
	window.location.href = 'page?' + pageId;
}