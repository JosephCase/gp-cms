var Server = new function() {

	var formData = new FormData();
	var instructions = {};
	var pageId = null;

	//SET THE PAGE ID
	this.setPageId = function(id) {
		pageId = id;
	}

	// EDIT PAGE DETAILS
	this.editPageName = function() {
		formData.set('pageName', this.value);
	}
	this.changeMainImage = function(file) {
		formData.set('mainImage', file);
		return true;
	}
	this.editVisible = function() {
		formData.set('visible', this.checked);
	}

	/*
	EDIT CONTENT FUNCTIONS
	*/
	this.addFile = function(id, size, lang, index, file) {

		console.log(file.type);

		var fileType;

		if(file.type.indexOf('image') != -1) {
			fileType = 'image';
		} else if (file.type.indexOf('video') != -1) {
			fileType = 'video';
		} else {
			return false;
		}
		
		addInstruction(id, 'create');

		instructions[id].type = fileType;
		instructions[id].size = size;
		instructions[id].language = lang;
		instructions[id].position = index;

		formData.append(id, file);

		return true;

	}

	this.addText = function(id, size, lang, index) {

		addInstruction(id, 'create');

		instructions[id].type = 'text';
		instructions[id].size = size;
		instructions[id].language = lang;
		instructions[id].position = index;

		return true;
	}

	this.editText = function(id, content) {

		addInstruction(id, 'update');
		instructions[id].type = 'text';
		instructions[id].data = content;

		return true;

	}

	this.editFile = function(id, file) {
		
		addInstruction(id, 'update');
		formData.set(id, file);

		return true;

	}

	this.editSize = function(id, size, type) {

		addInstruction(id, 'update');
		instructions[id].size = size;
		instructions[id].type = type;


		return true;
	}

	this.editLanguage = function(id, lang, type) {

		addInstruction(id, 'update');
		instructions[id].language = lang;
		instructions[id].type = type;

		return true;
	}

	this.reOrder = function(id, index, type) {
		addInstruction(id, 'update');
		instructions[id].position = index;
		instructions[id].type = type;
	}

	this.toggleDeleteContent = function(id, type) {

		if(instructions[id] && (instructions[id].action == 'delete' || instructions[id].action == 'create')) {	//undelete
			if(instructions[id].oldAction) {
				//Work around so that elements that have been edited -> delete -> undeleted will revent back to edit
				instructions[id].action = instructions[id].oldAction;
				delete instructions[id].oldAction;
				return true;
			} else {
				formData.delete(id);	//if there is a saved file, delete it
				return removeFromList(id);
			}
		} else {	//edit or set instruction to be delete
			addInstruction(id, 'delete', true);	 //overwrites the previous instuction
			instructions[id].type = type;
			return true;
		}

	}


	/*
	SERVER FUNCTIONS
	*/

	this.update = function() {

		formData.append('content', JSON.stringify(instructions));

		$.ajax({
		    type: "PATCH",
		    url: '/pages/' + pageId,
		    data: formData,
			processData: false,
			contentType: false,
		    success: DOM.refresh,
		    error: function(err) {
		    	console.log(err.statusText);
		        switch(err.status) {
		        	case 401:
		        	case 403:
		        		alert('It appears there is a problem with your login, it may have expired, please try logging in again :)');
		        		window.location.href = '/login'
		        		break;
		        	default:
		        		alert('There was a problem updating this page. Please contact support.');
		        		DOM.refresh();
		        }
		    }
		});		
	}



	/*
	TOOLS/MISC
	*/

	// add an instruction if it doesn't exist
	function addInstruction(id, instruction, overwrite) {
		if(!instructions[id]) {
			instructions[id] = {};
			instructions[id].id = id;
			instructions[id].action = instruction;
		} else if(overwrite) {
			instructions[id].oldAction = instructions[id].action;	//if ovewriting, remember what the old action was
			instructions[id].action = instruction;
		}
	}

	// remove an instruction from the instructions
	function removeFromList(id) {
		delete instructions[id];
		return true;
	}

	

}