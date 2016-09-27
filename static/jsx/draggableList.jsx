// For this to work you need to add {...this.props.dragProps} to the childrens root node in their render method

var DraggableList = React.createClass({
	propTypes: {
		onReOrder: React.PropTypes.func.isRequired,
		onDrop: React.PropTypes.func,
		className: React.PropTypes.string
	},
	defaultProps: {
		className: ''
	},
	dragstart: function(index, e) {
		e.target.style.opacity = 0.5;
		this.draggedIndex = index;
	},

	dragover: function(index, e) {
		if(this.draggedIndex != null) {
			var thisRect = e.target.getBoundingClientRect();
			if((e.clientY < thisRect['top'] + 0.5 * thisRect['height'] && this.draggedIndex > index) 
			|| (e.clientY >= thisRect['top'] + 0.5 * thisRect['height'] && this.draggedIndex < index)) {
				this.props.onReOrder(this.draggedIndex, index);
				this.draggedIndex = index;		
			}
		}
	},

	dragend: function(e) {
		if(this.draggedIndex != null) {
			e.target.style.opacity = 1;
			this.draggedIndex = null;
		}
		if(this.props.onDrop) {
			this.props.onDrop();
		}
	},
	render: function() {

		console.log(this.props.children)

		//Add drag event props to children
		const childrenWithProps = React.Children.map(this.props.children,
			(child, index) => React.cloneElement(child, {
				dragProps: {
					onDragStart: this.dragstart.bind(this, index), //	child.key?	||	
					onDragOver: this.dragover.bind(this, index), //	child.key?	||	
					onDragEnd: this.dragend,
					draggable: 'true'
				}				
			})
	    );
		return(
			<div className={this.props.className}>{childrenWithProps}</div>
		)
	}
});

module.exports = DraggableList;