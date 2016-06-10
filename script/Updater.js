var Updater = new function() {

	var oContent = {};

	/*
	EDIT CONTENT FUNCTIONS
	*/


	this.addContent = function($element, content) {

		console.log('add');
		
		obj = populateContentObject($element, content);
		
		obj.action = 'add';

		console.log(obj);

		oContent[obj.id] = obj;

		console.log(content);

		return true;
	}

	this.editContent = function($element, content) {

		console.log('edit');

		obj = populateContentObject($element, content);
		
		obj.action = 'edit';

		oContent['elem_' + obj.id] = obj;

		return true;

	}

	this.deleteContent = function($element) {

		var obj = {};
		
		obj.id = $element.attr('id');
		obj.type = $element.attr('data-type');
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
		console.log(oContent);
		$.ajax({
		    type: "POST",
		    url: "/update",
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(oContent),
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(data){alert('hello');},
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