var Updater = new function() {

	var formData = new FormData();
	var oContent = {};
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

		oContent[id].type = fileType;
		oContent[id].size = size;
		oContent[id].lang = lang;
		oContent[id].position = index;

		formData.append(id, file);

		return true;

	}

	this.addText = function(id, size, lang, index) {

		addInstruction(id, 'add');

		oContent[id].type = 'text';
		oContent[id].size = size;
		oContent[id].lang = lang;
		oContent[id].position = index;

		return true;
	}

	this.editText = function(id, content) {

		addInstruction(id, 'edit');
		oContent[id].data = content;

		return true;

	}

	this.editFile = function(id, file) {
		
		addInstruction(id, 'edit');
		formData.set(id, file);

		return true;

	}

	this.editSize = function(id, size) {

		addInstruction(id, 'edit');
		oContent[id].size = size;

		return true;
	}

	this.editLanguage = function(id, lang) {

		addInstruction(id, 'edit');
		oContent[id].lang = lang;

		return true;
	}

	this.reOrder = function(id, index) {
		console.log(id, index);
		addInstruction(id, 'edit');
		oContent[id].position = index;
	}

	this.toggleDeleteContent = function(id, type) {

		if(oContent[id] && (oContent[id].action == 'delete' || oContent[id].action == 'add')) {	//undelete
			return removeFromList(id);
		} else {	//edit or create instruction to be delete
			addInstruction(id, 'delete', true);	 //overwrites the previous instuction
			oContent[id].type = type;
			return true;
		}

	}


	/*
	SERVER FUNCTIONS
	*/

	this.update = function() {

		formData.append('content', JSON.stringify(oContent));

		var url;
		if(newPage == 'true') {
			url = "/createPage";
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

	// add an instruction if it doesn't exist
	function addInstruction(id, instruction, overwrite) {
		if(!oContent[id] || overwrite) {
			oContent[id] = {};
			oContent[id].id = id;
			oContent[id].action = instruction;
		}
	}

	// remove an instruction from the instructions
	function removeFromList(id) {
		delete oContent[id];
		return true;
	}

}