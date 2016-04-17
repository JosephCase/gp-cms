document.addEventListener("DOMContentLoaded", addEventListeners);

var aContent = {};

function addEventListeners() {
	$('#update').on('click', update);
	$('.content input, .content select, .content textarea').on("change", updateHandler);
}

function updateHandler() {
	if(addObject($(this))) {

	};
}

function addObject($element) {

	var obj = {};

	var $parent = $element.parent();
	
	obj.id = $parent.attr('id');
	obj.type = $parent.attr('data-type');
	obj.data = $element.val();

	aContent['elem_' + obj.id] = obj;

	console.log(aContent);

}

function update() {
	console.log(JSON.stringify(aContent));
	$.ajax({
	    type: "POST",
	    url: "/update",
	    // The key needs to match your method's input parameter (case-sensitive).
	    data: JSON.stringify(aContent),
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(data){alert(data);},
	    failure: function(errMsg) {
	        alert(errMsg);
	    }
	});
}



