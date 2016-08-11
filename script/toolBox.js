var Toolbox = new function() {
	

	this.createDraggableList = function($container, callback) {

		var $elements;

		getElements();

		console.log($elements);

		$elements.attr("draggable", "true");

		var $elem;
		var startIndex;

		function getElements() {
			$elements = $container.children();
		}

		$elements.on("dragstart", function() {
			$elem = $(this);
			startIndex = $elem.index();
		});
		$elements.on("dragover", function(e) {
			console.log($elements.index($elem));
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
				if(startIndex < $elem.index()) {
					for (var i = $elem.index(); i >= startIndex; i--) {
						var last = (i == startIndex? true : false);
						callback($elements.eq(i).attr('id'), $elements.eq(i).index(), last);
					}
				} else if (startIndex > $elem.index()) {
					for (var i = startIndex; i >= $elem.index(); i--) {
						var last = (i == $elem.index()? true : false);
						callback($elements.eq(i).attr('id'), $elements.eq(i).index(), last);
					}					
				}
				getElements();
			}
		});
	}
}


