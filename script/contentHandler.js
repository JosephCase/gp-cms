document.addEventListener("DOMContentLoaded", addEventListeners);

var content = {};
var newElems = 0;

function addEventListeners() {
	$('.content input, .content select, .content textarea').on("change", editHandler);
	$('.delete').on("click", deleteHandler);
	$('#add').on('click', addNewText)

	$('#update').on('click', update);
}

function addNewText() {

	$newElemt = $("<div id='new_" + (newElems++) + "' data-type='text' class='content'>" +
		"<textarea></textarea><span class='delete'>Delete</span>" +
		"</div>")
	$(this).parent().before($newElemt);
	$newElemt.children('textarea').on("change", editHandler);
	$newElemt.children('.delete').on("click", deleteHandler);
}

function editHandler() {
	if(editContent($(this))) {
		$(this).parent().addClass('edited');
	};
}

function deleteHandler() {
	console.log('delete');
	if(deleteContent($(this))) {
		$(this).parent().addClass('deleted');
	};
}

function editContent($element) {

	var obj = {};

	var $parent = $element.parent();
	
	obj.id = $parent.attr('id');
	obj.type = $parent.attr('data-type');
	obj.data = $element.val();
	obj.action = 'edit';

	content['elem_' + obj.id] = obj;

	return true;

}

function deleteContent($element) {

	var obj = {};

	var $parent = $element.parent();
	
	obj.id = $parent.attr('id');
	obj.type = $parent.attr('data-type');
	obj.action = 'delete';

	content['elem_' + obj.id] = obj;

	return true;

}

function update() {
	console.log(JSON.stringify(content));
	$.ajax({
	    type: "POST",
	    url: "/update",
	    // The key needs to match your method's input parameter (case-sensitive).
	    data: JSON.stringify(content),
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(data){alert('hello');},
	    failure: function(errMsg) {
	        alert(errMsg);
	    }
	});
}