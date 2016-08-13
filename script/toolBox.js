var DraggableList = function($container, callback) {

	var $elements;
	var $elem;
	var startIndex;

	getElements();
	addEventListeners();

	function getElements() {
		$elements = $container.children();
	}

	function addEventListeners() {

		$elements.attr("draggable", "true");

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

	this.update = function() {
		getElements();
		addEventListeners();
	}
}

	


