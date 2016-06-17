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

		oContent['elem_' + obj.id] = obj;

		return true;

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

	// takes a {} object and returns a FormData object
	var objectToFormData = function(obj, form, namespace) {
	    
	  var fd = form || new FormData();
	  var formKey;
	  
	  for(var property in obj) {
	    if(obj.hasOwnProperty(property)) {
	      
	      if(namespace) {
	        formKey = namespace + '[' + property + ']';
	      } else {
	        formKey = property;
	      }
	     
	      // if the property is an object, but not a File,
	      // use recursivity.
	      if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
	        
	        objectToFormData(obj[property], fd, property);
	        
	      } else {
	        
	        // if it's a string or a File object
	        fd.append(formKey, obj[property], 'test');
	      }
	      
	    }
	  }
	  
	  return fd;
	    
	};

}