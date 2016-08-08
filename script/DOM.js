var DOM = new function() {

	document.addEventListener("DOMContentLoaded", pageReadyHandler);

	var newElems = 0;

	function pageReadyHandler() {
		Updater.setPageId(document.getElementById('pageId').value);
		Updater.setParentPageId(document.getElementById('parentPage_id').value);
		Updater.setNewPage(document.getElementById('newPage').value);
		addEventListeners();
	}

	function addEventListeners() {

		// edit page details
		$('#pageName').on('change', Updater.editPageName);

		$('#mainImage img').on('click', changeFile);
		$('#mainImage input').on('change', editFile);

		$('#show').on('click', Updater.editVisible);

		// page content
		$('.content textarea').on("change", editTextHandler);
		$('.content .size').on("change", editSizeHandler);
		$('.content .lang').on("change", editLangHandler);

		$('.delete').on("click", deleteHandler);
		$('#add_text').on('click', function() {
			console.log('add text');
			addNewTextHandler('text', this);
		});

		$('.content img, .content video').on('click', changeFile);
		$('.content input').on('change', editFile);

		$('#add_image').on('click', selectNewImageHandler);
		$('#add_video').on('click', selectNewVideoHandler);

		$('#imageInput, #videoInput').on('change', addNewFilesHandler);

		$('#update').on('click', updateHandler);
		
		// if the image src doesn't exist. Replace it with a placeholder image
		$('img').on('error', function() {
		    this.onerror = "";
		    this.src = "/img/placeholder.gif";
		    return true;
		});

		Toolbox.createDraggableList($('.content'), Updater.reOrder);

	}

	



	/*
	EVENT HANDLERS
	*/

	function editTextHandler() {

		var id = $(this).parent().attr('id');
		var content = $(this).val();

		if(Updater.editText(id, content)) {
			$(this).parent().addClass('edited');
		}
	}

	function editSizeHandler() {

		var id = $(this).parent().attr('id');
		var size = $(this).val();		
		if(Updater.editSize(id, size)) {
			$(this).parent().addClass('edited');
		}
	}

	function editLangHandler() {

		var id = $(this).parent().attr('id');
		var lang = $(this).val();		
		if(Updater.editLanguage(id, lang)) {
			$(this).parent().addClass('edited');
		}
	}

	function changeFile() {
		$(this).siblings('input').click();
	}

	function editFile(e) {

		$elem = $(this);
		$parent = $elem.parent();

		var displayElem = $elem.siblings('img, video')[0];
		var file = this.files[0];

		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {
	    	displayElem.src = e.target.result;

	    	if($parent.attr('id') == 'mainImage') {
				Updater.changeMainImage(file);   		
	    	} else {
	    		Updater.editFile($parent.attr('id'), file);
			}	

	    }; 
	}

	function selectNewImageHandler(e) {
		var imgInput = document.getElementById('imageInput');
		imgInput.click();
		e.preventDefault();
	}

	function selectNewVideoHandler(e) {
		var imgInput = document.getElementById('videoInput');
		imgInput.click();
		e.preventDefault();
	}

	function addNewTextHandler(type, elem) {

		console.log(type);

		var elemHTML = "<div id='new_" + (newElems++) + "' data-type='" + type + "' draggable='true' data-new class='content'>" +
			"<textarea></textarea>";

		// size input	
		elemHTML += "<span>Size</span><select class='size'>";
		for (var i = 10; i <= 20; i++) {
			elemHTML += "<option" + ((i == 16) ? ' selected' : '') + " value='" + i + "'>" + i + "</option>";
		}
		elemHTML += "</select>";

		// Language input
		elemHTML = elemHTML + "<span>Language</span><select class='lang'>" +
			"<option selected value='NULL'>None</option>" +
  			"<option value='eng'>English</option>" +
  			"<option value='ita'>Italian</option>" +
  		"</select>";
		
  		elemHTML = elemHTML + "<span class='delete'>Delete</span>" +
		"</div>";

		$newElemt = $(elemHTML);

		$('.contentList').append($newElemt);
		$newElemt.children('textarea').on("change", editTextHandler);

		$newElemt.children('.size').on("change", editSizeHandler);
		$newElemt.children('.lang').on("change", editLangHandler);
		$newElemt.children('.delete').on("click", deleteHandler);

		scrollTo($newElemt);

		Toolbox.createDraggableList($('.content'), Updater.reOrder);

		if(Updater.addText($newElemt.attr('id'), $newElemt.index())) {
			$newElemt.addClass('new');
		}

		$newElemt.children('textarea').focus();

	}

	function addNewFilesHandler() {
		var newFiles = this.files;
		console.log(newFiles.length);
		for (var i = 0; i < newFiles.length; i++) {
			$newElem = addNewFileHandler(newFiles[i], i);
			if(Updater.addFile($newElemt.attr('id'), newFiles[i])) {
				$newElemt.addClass('new');
			};			
			previewFile($newElem, newFiles[i]);
		}
		
		Toolbox.createDraggableList($('.content'), Updater.reOrder);
	}

	//creates a new element on the page
	function addNewFileHandler(file, j) {

		console.log(file);

		var elemHTML;

		if(file.type.indexOf('image') != -1) {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='img' data-new draggable='true' class='content'>";
			elemHTML += "<img src='img/loading.gif' draggable='false' />";
			elemHTML += "<input type='file' class='hidden' accept='image/*' />";
		} else {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='video' data-new draggable='true' class='content'>";
			elemHTML += "<video controls poster='img/loading.gif'></video>";
			elemHTML += "<input type='file' class='hidden' accept='video/*' />";
		}

		elemHTML += "<span>Size</span><select class='size'>";

		for (var i = 1; i <= 4; i++) {
			elemHTML += "<option" + ((i == 1) ? ' selected' : '') + " value='" + i + "'>" + i + "</option>";
		}
		elemHTML += "</select>";

		elemHTML = elemHTML + "<span>Language</span><select class='lang'>" +
			"<option selected value='NULL'>None</option>" +
  			"<option value='eng'>English</option>" +
  			"<option value='ita'>Italian</option>" +
  		"</select>";
		
  		elemHTML = elemHTML + "<span class='delete'>Delete</span>" +
		"</div>";

		$newElemt = $(elemHTML);

		$('.contentList').append($newElemt);

		console.log(j);

		if(j == 0) {
			scrollTo($newElemt);
		}

		return $newElemt

	}

	//previews the uploaded image on the page
	function previewFile($newElemt, file) {

		var reader = new FileReader();
		reader.addEventListener('load', function(e) {

			$newElemt.children('img, video')[0].src = e.target.result;
			$newElemt.children('img, video')[0].removeAttribute('poster');

			$newElemt.children('img, video').on('click', changeFile);
			$newElemt.children('input').on('change', editFile);
			$newElemt.children('.size').on("change", editSizeHandler);
			$newElemt.children('.lang').on("change", editLangHandler);

			$newElemt.children('.delete').on("click", deleteHandler);

	    });
	    setTimeout(function() {
	    	reader.readAsDataURL(file);
	    }, 500);
		
	}

	

	function deleteHandler() {

		var $element = $(this).parent();

		//if element has already been selected to be deleted 'undelete'
		if($element.hasClass('deleted')) {
			if(Updater.removeFromList('elem_' + $element[0].getAttribute('id'))) {
				$element.removeClass('deleted');
			}
		} else {
			// check to see if this is newly added item. If it is we don't send it to the server
			if($element[0].hasAttribute('data-new')) {
				if(Updater.removeFromList($element[0].getAttribute('id'))) {
					$element.remove();
				}
			} else {		
				if(Updater.deleteContent($element)) {
					$element.addClass('deleted');
				};
			}			
		}
	}

	function updateHandler() {
		Updater.update();
	}



	// public functions
	this.refresh = function(response) {
		if(response) {
			oResponse = JSON.parse(response);
			window.location.replace(oResponse.location);
		} else {
			location.reload(true);
		}
	}


	// tools
	function scrollTo(elem) {
		$('html, body').animate({
	        scrollTop: elem.offset().top
	    }, 500);
	}

}
