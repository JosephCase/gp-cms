var Updater = new function() {

	var formData = new FormData();
	var oContent = {};

	/*
	EDIT CONTENT FUNCTIONS
	*/


	this.addContent = function($element, content) {

		console.log('add');
		

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
			formData.append('elem_' + obj.id, content);
			//remove the file from the content object as this will not pass to the server
			obj.data = null;
		}

		oContent['elem_' + obj.id] = obj;

		return true;

	}

	this.changeNewFile = function($element, file) {
		var id = $element.attr('id');
		console.log(id, file);
		formData.set(id, file);
	}

	this.deleteContent = function($element) {

		var obj = {};
		
		obj.id = $element.attr('id');
		obj.type = $element.attr('data-type');
		if(obj.type == 'img') {
			obj.data = $element.children('img')[0].src;
		}
		obj.action = 'delete';

		oContent['elem_' + obj.id] = obj;

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
		
		formData.append('content', JSON.stringify(oContent));

		for(var pair of formData.entries()) {
		   console.log(pair[0])
		   console.log(pair[1]); 
		}

		$.ajax({
		    type: "POST",
		    url: "/update",
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

		console.log(obj);

		return obj;

	}
}