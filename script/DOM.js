var DOM = new function() {

	document.addEventListener("DOMContentLoaded", addEventListeners);

	var newElems = 0;

	function addEventListeners() {
		$('.content input, .content select, .content textarea').on("change", editHandler);
		$('.delete').on("click", deleteHandler);
		$('#add').on('click', addNewHandler)

		$('#update').on('click', updateHandler);
	}



	/*
	EVENT HANDLERS
	*/


	function editHandler() {

		var $element = $(this).parent();

		// check to see if this is newly added item. If it is we don't send it to the server
		if($element[0].hasAttribute('data-new')) {
			if(Updater.addContent($element, $(this).val())) {
				$element.addClass('edited');
			}
		} else {
			if(Updater.editContent($element, $(this).val())) {
				$element.addClass('edited');
			}
		}
	}

	function addNewHandler() {

		$newElemt = $("<div id='new_" + (newElems++) + "' data-type='text' data-new class='content'>" +
			"<textarea></textarea><span class='delete'>Delete</span>" +
			"</div>")
		$(this).parent().before($newElemt);
		$newElemt.children('textarea').on("change", editHandler);
		$newElemt.children('.delete').on("click", deleteHandler);
	}

	function deleteHandler() {

		var $element = $(this).parent();

		// check to see if this is newly added item. If it is we don't send it to the server
		console.log($element);
		if($element[0].hasAttribute('data-new')) {
			if(Updater.removeFromList($element[0].getAttribute('id'))) {
				$element.remove();
			}
		} else {		
			if(Updater.deleteContent($element)) {
				$element.addClass('deleted');
			};
		}
	}

	function updateHandler() {
		Updater.update();
	}	
}
