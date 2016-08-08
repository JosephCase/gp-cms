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
	}
	this.editVisible = function() {
		console.log(this.checked);
		formData.set('visible', this.checked);
		console.log(formData.get('visible'));
	}

	/*
	EDIT CONTENT FUNCTIONS
	*/
	this.addFile = function(id, file) {
		
		addInstruction(id, 'add');
		oContent[id].type = 'img';
		formData.append(id, file);
		return true;

	}

	this.addText = function(id, index) {
		addInstruction(id, 'add');
		oContent[id].type = 'text';
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
		addInstruction(id, 'edit');
		oContent[id].position = index;
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
	function addInstruction(id, instruction) {
		if(!oContent[id]) {
			oContent[id] = {};
			oContent[id].id = id;
			oContent[id].action = instruction;
		}
	}
}