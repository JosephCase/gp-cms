var Server = new function() {

	var formData = new FormData();
	var instructions = {};
	var newPage = false;

	//SET THE PAGE ID
	this.setPageId = function(id) {
		formData.set('pageId', id);
		console.log(id);
	}
	this.setParentPageId = function(id) {
		formData.set('parentPage_id', id);
		console.log(id);
	}
	this.setNewPage = function(_newPage) {
		console.log('setNewPage');
		newPage = _newPage;
		console.log(newPage);
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
		console.log(this.checked);
		formData.set('visible', this.checked);
		console.log(formData.get('visible'));
	}

	/*
	EDIT CONTENT FUNCTIONS
	*/
	this.addFile = function(id, size, lang, index, file) {

		console.log(file.type);

		var fileType;

		if(file.type.indexOf('image') != -1) {
			fileType = 'img';
		} else if (file.type.indexOf('video') != -1) {
			fileType = 'video';
		} else {
			return false;
		}
		
		addInstruction(id, 'add');

		instructions[id].type = fileType;
		instructions[id].size = size;
		instructions[id].lang = lang;
		instructions[id].position = index;

		formData.append(id, file);

		return true;

	}

	this.addText = function(id, size, lang, index) {

		addInstruction(id, 'add');

		instructions[id].type = 'text';
		instructions[id].size = size;
		instructions[id].lang = lang;
		instructions[id].position = index;

		return true;
	}

	this.editText = function(id, content) {

		addInstruction(id, 'edit');
		instructions[id].data = content;

		return true;

	}

	this.editFile = function(id, file) {
		
		addInstruction(id, 'edit');
		formData.set(id, file);

		return true;

	}

	this.editSize = function(id, size) {

		addInstruction(id, 'edit');
		instructions[id].size = size;

		return true;
	}

	this.editLanguage = function(id, lang) {

		addInstruction(id, 'edit');
		instructions[id].lang = lang;

		return true;
	}

	this.reOrder = function(id, index) {
		console.log(id, index);
		addInstruction(id, 'edit');
		instructions[id].position = index;
	}

	this.toggleDeleteContent = function(id, type) {

		if(instructions[id] && (instructions[id].action == 'delete' || instructions[id].action == 'add')) {	//undelete
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

		var method;
		if(newPage == 'true') {
			method = "POST";
		} else {
			method = "PATCH";
		}

		$.ajax({
		    type: method,
		    url: '/page',
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: formData,
			processData: false,
			contentType: false,
		    success: DOM.refresh,
		    error: function(errMsg) {
		    	console.log(errMsg);
		        alert('There was a problem updating this page. Please contact support.');
		        DOM.refresh();
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