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

function attachSectionEventListeners() {
	var pages = pageContainer.getElementsByClassName('page');

	//page click
	for (var i = 0; i < pages.length; i++) {
		pages[i].addEventListener('click', pageClickHandler);
	}

	//page re-order
	gPages = [];	//reset the global pages
	if(pages.length > 1) {
		new DraggableList($(pageContainer).children('.children'), reOrder);
	}

	//new page functionlity
	document.getElementById('addPage').addEventListener('click', function() {
		$('#newPage').addClass('show');
	})

	$('#newPage .bg').on('click', function() {
		$('#newPage').removeClass('show');
	})

	$('#newPage #mainImage img').on('click', function() {
		$(this).siblings('input').click();
	});
	$('#newPage #mainImage input').on('change', function() {
		var displayElem = $(this).siblings('img')[0];
		displayElem.src = 'img/loading.gif';

		var file = this.files[0];

		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {
    		setTimeout(function() {		//timeout just to improve UX	    		
		    	displayElem.src = e.target.result;
    		}, 500);	  	
	    };
	});

	$('#newPage #create').on('click', function() {

		$('#newPage .errorMsg').addClass('hide');

		var pageName = $('#newPage #pageName').val().trim();		
		if(pageName == '') {
			$('#newPage .errorMsg').removeClass('hide');
			return;
		}

		var sectionId = $('#newPage #section_id').val();
		var mainImage = $('#newPage #mainImage input')[0].files[0];

		Server.addPage(sectionId, pageName, mainImage);	

	})


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
	attachSectionEventListeners();
}

function pageClickHandler() {
	var pageId = this.id.split('_')[1];
	window.location.href = '/pages/' + pageId;
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
		    data: JSON.stringify(pages),
			processData: false,
			contentType: "application/json; charset=utf-8",
		    statusCode: {
		    	200: updateDone,
		        401: function() {
		            alert("Oops.. your login credentials may have expired. Please try logging in again.");
					window.location.replace('/login');
		        },
		        403: function() {
		            alert("Oops.. your login credentials may have expired. Please try logging in again.");
					window.location.replace('/login');
		        },
		        500: function() {
		            alert("There was a problem. Please try again.");
		        }
		    }

		});
	}

	function updateDone(sectionHTML) {
		// location.reload(true);
		renderPageList(sectionHTML);
		$loader.removeClass('loading');
	}

	this.getPages = function(sectionId, callback) {

		if ($loader.hasClass('loading')) return false;	//stop double update
		$loader.addClass('loading');

		$.get("/sections/" + sectionId, updateDone);

	}

	this.addPage = function(sectionId, pageName, mainImage) {

		if ($loader.hasClass('loading')) return false;	//stop double update
		$loader.addClass('loading');

		var formData = new FormData();

		formData.append('name', pageName);
		if(mainImage) formData.append('mainImage', mainImage);		

		$.ajax({
		    type: "POST",
		    url: "/sections/" + sectionId + "/pages",
		    data: formData,
			processData: false,
			contentType: false,
		    statusCode: {
		    	200: updateDone,
		        401: function() {
		            alert("Oops.. your login credentials may have expired. Please try logging in again.");
					window.location.replace('/login');
		        },
		        403: function() {
		            alert("Oops.. your login credentials may have expired. Please try logging in again.");
					window.location.replace('/login');
		        },
		        500: function() {
		            alert("There was a problem. Please try again.");
		        }
		    }
		});
	}

}