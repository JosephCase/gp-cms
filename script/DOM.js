var DOM = new function() {

	document.addEventListener("DOMContentLoaded", pageReadyHandler);

	var newElems = 0;

	function pageReadyHandler() {
		Updater.setPageId(document.getElementById('pageId').value);
		Updater.setParentPageId(document.getElementById('parentPage_id').value);
		Updater.setNewPage(document.getElementById('newPage').value);

		// if the image src doesn't exist. Replace it with a placeholder image
		$('img').on('error', function() {
		    this.onerror = "";
		    this.src = "/img/placeholder.gif";
		    return true;
		});

		$('img').on('error', function() {
		    this.onerror = "";
		    this.wallpaper = "/img/placeholder.gif";
		    return true;
		});

		addEventListeners();

	}

	function addEventListeners() {

		// edit page details
		$('#pageName').on('change', Updater.editPageName);

		$('#mainImage img').on('click', changeFile);
		$('#mainImage input').on('change', editFile);

		$('#show').on('click', Updater.editVisible);

		// Add content
		$('#add_text').on('click', createNewTextElement);

		$('#add_image').on('click', selectNewImageHandler);
		$('#add_video').on('click', selectNewVideoHandler);
		$('#imageInput, #videoInput').on('change', addNewFilesHandler);

		// edit content
		$('.content textarea').on("change", editTextHandler);

		$('.content img, .content video').on('click', changeFile);
		$('.content input').on('change', editFile);

		$('.content .size').on("change", editSizeHandler);
		$('.content .lang').on("change", editLangHandler);

		// delete content
		$('.delete').on("click", deleteHandler);

		//re-order functionality
		Toolbox.createDraggableList($('.contentList'), Updater.reOrder);


		//Send all the info to the server
		$('#update').on('click', updateHandler);

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
		displayElem.src = 'img/loading.gif';

		var file = this.files[0];

		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {

	    	if($parent.attr('id') == 'mainImage') {
				Updater.changeMainImage(file);   		
	    	} else if(Updater.editFile($parent.attr('id'), file)) {
		    		setTimeout(function() {		//timeout just to improve user inter
			    		if($parent.attr('id') == 'img') {
				    		displayElem.src = e.target.result;
			    		} else {
			    			displayElem.src = 'img/video.png';
			    		}
		    		}, 1000);	    	
				$parent.addClass('edited');
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

	function createNewTextElement() {

		var elemHTML = "<div id='new_" + (newElems++) + "' data-type='text' draggable='true' data-new class='content'>" +
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

		Toolbox.createDraggableList($('.contentList'), Updater.reOrder);

		if(Updater.addText($newElemt.attr('id'), $newElemt.children('.size').val(), 
				$newElemt.children('.lang').val(), $newElemt.index())) {
			$newElemt.addClass('new');
		}

		$newElemt.children('textarea').focus();

	}

	function addNewFilesHandler() {
		var newFiles = this.files;
		for (var i = 0; i < newFiles.length; i++) {
			$newElem = createNewFileElement(newFiles[i], i);
			if(Updater.addFile($newElemt.attr('id'), $newElemt.children('.size').val(), 
				$newElemt.children('.lang').val(), $newElemt.index(), newFiles[i])) {
				$newElemt.addClass('new');
			};

			previewFile($newElem, newFiles[i]);

			$newElemt.children('img, video').on('click', changeFile);
			$newElemt.children('input').on('change', editFile);
			$newElemt.children('.size').on("change", editSizeHandler);
			$newElemt.children('.lang').on("change", editLangHandler);

			$newElemt.children('.delete').on("click", deleteHandler);
		}
		
		Toolbox.createDraggableList($('.contentList'), Updater.reOrder);
	}

	//creates a new element on the page
	function createNewFileElement(file, j) {

		console.log(file);

		var elemHTML;

		if(file.type.indexOf('image') != -1) {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='img' data-new draggable='true' class='content'>";
			elemHTML += "<img src='img/loading.gif' draggable='false' />";
			elemHTML += "<input type='file' class='hidden' accept='image/*' />";
		} else {
			elemHTML = "<div id='new_" + (newElems++) + "' data-type='video' data-new draggable='true' class='content'>";
			elemHTML += "<img src='img/loading.gif' draggable='false' />";
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

		if(j == 0) {
			scrollTo($newElemt);
		}

		return $newElemt

	}

	//previews the uploaded image on the page
	function previewFile($newElemt, file) {

		if($newElemt.attr('data-type') == 'img') {
			var reader = new FileReader();
			reader.addEventListener('load', function(e) {

				$newElemt.children('img')[0].src = e.target.result;

		    });
		    setTimeout(function() {
		    	reader.readAsDataURL(file);
		    }, 500);
		} else {
			$newElemt.children('img')[0].src = 'img/video.png';
		}

		
		
	}

	

	function deleteHandler() {

		var $element = $(this).parent();

		// check to see if this is newly added item. If it is we don't send it to the server
		if($element[0].hasAttribute('data-new')) {
			if(Updater.toggleDeleteContent($element[0].getAttribute('id'))) {
				$element.remove();
			}
		} else {		
			if(Updater.toggleDeleteContent($element[0].getAttribute('id'))) {
				$element.removeClass('edited');
				$element.toggleClass('deleted');
			};
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
