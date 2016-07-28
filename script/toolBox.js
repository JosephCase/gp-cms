var Toolbox = new function() {
	

	this.createDraggableList = function($elements, callback) {

		$elements.attr("draggable", "true");

		console.log('dragDrop');

		var $elem;
		var startIndex;

		$elements.on("dragstart", function() {
			$elem = $(this);
			startIndex = $elem.index();
		});
		$elements.on("dragover", function(e) {
			if($elem && $elements.index($elem) > -1) {
				var thisRect = this.getBoundingClientRect();
				if(e.clientY < thisRect['top'] + 0.5 * thisRect['height']) {
					$(this).before($elem);
				} else {
					$(this).after($elem);					
				}				
			}
		});
		$elements.on('dragend', function() {
			if($elem) {
				console.log($elements);
				if(startIndex < $elem.index()) {
					for (var i = $elem.index(); i >= startIndex; i--) {
						callback($elements.eq(i));
					}
				} else if (startIndex > $elem.index()) {
					for (var i = startIndex; i >= $elem.index(); i--) {
						callback($elements.eq(i));
					}					
				}
			}
		});
	}
}

