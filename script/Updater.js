var Updater = new function() {

	var formData = new FormData();
	var oContent = {};
	var newPage = false;

	//SET THE PAGE ID
	this.setPageId = function(id) {
		console.log(id);
		formData.set('pageId', id);
	}
	this.setParentPageId = function(id) {
		formData.set('parentPage_id', id);
	}
	this.setNewPage = function(_newPage) {
		newPage = _newPage;
		console.log(newPage);
	}

	// EDIT PAGE DETAILS
	this.editPageName = function() {
		formData.set('pageName', this.value);
	}
	this.changeMainImage = function(file) {		
		formData.set('mainImage', file);
	}

	/*
	EDIT CONTENT FUNCTIONS
	*/
	this.addContent = function($element, content) {		

		obj = populateContentObject($element, content);
		
		obj.action = 'add';


		// if it's an file, add the file seperately to the form data object
		if(obj.type == 'img' || obj.type == 'video') {
			formData.append(obj.id, content);
			//remove the file from the content object as this will not pass to the server
			obj.data = null;
		}

		oContent[obj.id] = obj;

		return true;
	}

	this.editContent = function($element, content) {

		console.log('edit');

		obj = populateContentObject($element, content);
		
		obj.action = 'edit';

		// if it's an file, add the file seperately to the form data object
		if(obj.type == 'img' || obj.type == 'video') {
			formData.append(obj.id, content);
			//remove the file from the content object as this will not pass to the server
			obj.data = null;
		}

		oContent[obj.id] = obj;

		return true;

	}

	this.changeNewFile = function($element, file) {
		var id = $element.attr('id');
		console.log(id, file);
		formData.set(id, file);
	}

	this.reOrder = function($element) {
		// will add a new object with order, or edit if already exists
		var id = $element.attr('id')
		if(!oContent[id]) {
			oContent[id] = {};
			oContent[id].id = id;
			oContent[id].action = 'reorder';
		}	
		oContent[id].position = $element.index();
	}

	this.deleteContent = function($element) {

		var obj = {};
		
		obj.id = $element.attr('id');
		obj.type = $element.attr('data-type');
		if(obj.type == 'img') {
			obj.data = $element.children('img')[0].src;
		}
		obj.action = 'delete';

		oContent[obj.id] = obj;

		return true;

	}

	this.removeFromList = function(id) {
		delete oContent[id];
		return true;
	}

	/*
	SERVER FUNCTIONS
	*/

	this.update = function() {

		console.log(oContent);
		
		formData.append('content', JSON.stringify(oContent));

		var url;
		if(newPage == true) {
			url = "/savePage";
		} else {
			url = "/updatePage";
		}

		$.ajax({
		    type: "POST",
		    url: url,
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: formData,
			processData: false,
			contentType: false,
		    success: DOM.refresh,
		    failure: function(errMsg) {
		        alert(errMsg);
		    }
		});
	}

	/*
	TOOLS/MISC
	*/

	function populateContentObject($element, content) {
		
		var obj = {};
		
		obj.id = $element.attr('id');
		obj.type = $element.attr('data-type');
		obj.data = content;
		obj.position = $element.index();

		if($element.children('.size').length > 0) {
			obj.size = $element.children('.size').val();
		} else{
			obj.size = 0;
		}
		if($element.children('.lang').length > 0) {
			obj.lang = $element.children('.lang').val();
		} else {
			obj.lang = NULL;
		}

		return obj;

	}
}