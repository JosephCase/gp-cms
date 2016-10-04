// Mixins
var ElemMixin = {
	onSizeChange: function(e) {
		var newDesc = this.props.elemDesc;

		//change descriptions value and instruction
		newDesc.size = e.target.value;
		if(newDesc.instruction != 'add') {
			newDesc.instruction = 'edit';
		}

		this.props.onChange(this.props.index, newDesc);
	},
	onLangChange: function(e) {
		var newDesc = this.props.elemDesc;

		//change descriptions value and instruction
		newDesc.language = e.target.value;
		if(newDesc.instruction != 'add') {
			newDesc.instruction = 'edit';
		}

		this.props.onChange(this.props.index, newDesc);
	},
	onDelete: function() {
		var newDesc = this.props.elemDesc;

		if (newDesc.instruction == 'delete') {	//toggle the delete off

			//if there's an old instruction re-instate this, otherwise remove the instruction 
			if(newDesc.instruction_old) {
				newDesc.instruction = newDesc.instruction_old;
				delete newDesc.instruction_old;
			} else {
				newDesc.instruction;
			}

		} else if (newDesc.instruction == 'edit') {	//replace edit instruction but remember it incase we revert
			newDesc.instruction_old = newDesc.instruction;
			newDesc.instruction = 'delete';
		// } else if (newElems[index].instruction == 'add') {	//if it's new just remove it
			// newElems.splice(index, 1);
		} else {
			newDesc.instruction = 'delete';
		}

		this.props.onChange(this.props.index, newDesc);
	}
}
// <img src="{{ contentDirectory + content.content.replace('.jpg', '_x' + previewSize + '.jpg') }}" draggable="false"  />
// 						<input type="file" class='hidden' accept="image/*" />


var TextElem = new React.createClass({
	mixins: [ElemMixin],
	propTypes: {
		elemDesc: React.PropTypes.shape({
			id: React.PropTypes.number.isRequired,
			content: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.number
			]),
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,
	    }).isRequired,	

		sizeRange: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired

	},
	onChange: function(e) {
		var newDesc = this.props.elemDesc;

		//change descriptions value and instruction
		newDesc.content = e.target.value;
		if(newDesc.instruction != 'add') {
			newDesc.instruction = 'edit';
		}

		this.props.onChange(this.props.index, newDesc);
	},
	componentDidMount: function() {
		console.log(this.props.elemDesc.instruction);
		if(this.props.elemDesc.instruction == 'add') {
			console.log('set the focus');
			console.log(this.refs)
			ReactDOM.findDOMNode(this.refs.textArea).focus();
		}
	},
	//this stops the text area being draggable and therefor highlightable
	preventDefault: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},

	render: function() {

		var elemDesc = this.props.elemDesc;

		var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
		var deleteText = (elemDesc.instruction && elemDesc.instruction == 'delete') ? 'Undelete' : 'Delete';

		// ...dragProps are those appended by the draggable list

		return(
			<div className={className} {...this.props.dragProps}>
				<textarea ref='textArea' value={elemDesc.content} onChange={this.onChange} draggable='true' onDragStart={this.preventDefault} />

				{ /*size select input*/ }
				<SizeSelect value={elemDesc.size} range={this.props.sizeRange} onChange={this.onSizeChange} />

		  		{/*Language select input*/}
				<LangSelect value={elemDesc.language} onChange={this.onLangChange} />

		  		<span onClick={this.onDelete}>{deleteText}</span>

			</div>
		)
	}
});

var ImgElem = new React.createClass({
	mixins: [ElemMixin],
	propTypes: {
		elemDesc: React.PropTypes.shape({
			id: React.PropTypes.number.isRequired,
			content: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.number
			]),
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,
	    }).isRequired,

		sizeRange: React.PropTypes.array.isRequired,

		onChange: React.PropTypes.func.isRequired,
		onFileUpload: React.PropTypes.func.isRequired

	},
	getInitialState: function() {
		return({
			tempImg: null
		})
	},
	onImgClick: function(e) {
		//the image acts as a psuedo input, when click, passed the click to the actual input
		$(e.target).siblings('input.hidden').click();
	},

	onChange: function(e) {

		// show the loading gif while the image is loading for preview
		this.setState({
			tempImg: this.props.loadingSrc
		})

		
		//set the new instruction as edit
		var newDesc = this.props.elemDesc;
		newDesc.instruction = 'edit';

		this.props.onChange(this.props.index, newDesc);

		//send the new file
		var file = e.target.files[0];
		this.props.onFileUpload(newDesc.id, file);

		//preview the newly uploaded image
		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {

	    	this.setState({
				tempImg: e.target.result
			});


	    }.bind(this); 
	},

	render: function() {

		var elemDesc = this.props.elemDesc;

		var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
		var deleteText = (elemDesc.instruction && elemDesc.instruction == 'delete') ? 'Undelete' : 'Delete';

		// the source can be one of 3 things
		var src;
		if(this.state.tempImg) {	//a loading gif for when the previewing image is rendering
			src = this.state.tempImg;
		} else {	//or the image passed down by props
			src = elemDesc.content;
		}

		
		// ...dragProps are those appended by the draggable list
		return(
			<div className={className} {...this.props.dragProps}>
				
				<img src={src} draggable="false" onClick={this.onImgClick} />
				<input type="file" className='hidden' accept="image/*" onChange={this.onChange} />

				{ /*size select input*/ }
				<SizeSelect value={elemDesc.size} range={this.props.sizeRange} onChange={this.onSizeChange} />

		  		{/*Language select input*/}
				<LangSelect value={elemDesc.language} onChange={this.onLangChange} />

		  		<span onClick={this.onDelete}>{deleteText}</span>

			</div>
		)
	}
});

var VideoElem = new React.createClass({
	mixins: [ElemMixin],
	propTypes: {
		elemDesc: React.PropTypes.shape({
			id: React.PropTypes.number.isRequired,
			content: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.number
			]),
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,
	    }).isRequired,

		sizeRange: React.PropTypes.array.isRequired,

		onChange: React.PropTypes.func.isRequired,
		onFileUpload: React.PropTypes.func.isRequired,

		videoFormats: React.PropTypes.array.isRequired,

	},
	getInitialState: function() {
		return({
			tempImg: null
		})
	},
	onVidClick: function(e) {
		//the image acts as a psuedo input, when click, passed the click to the actual input
		$(e.target).siblings('input.hidden').click();
	},

	onChange: function(e) {

		// show the loading gif while the image is loading for preview
		this.setState({
			tempImg: this.props.loadingSrc
		})
		
		//set the new instruction as edit
		var newDesc = this.props.elemDesc;
		newDesc.instruction = 'edit';

		this.props.onChange(this.props.index, newDesc);

		//send the new file
		var file = e.target.files[0];
		this.props.onFileUpload(newDesc.id, file);

		//preview the video placeholder image
    	this.setState({
			tempImg: this.props.videoPlaceholder
		})
	},

	render: function() {

		var elemDesc = this.props.elemDesc;

		var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
		var deleteText = (elemDesc.instruction && elemDesc.instruction == 'delete') ? 'Undelete' : 'Delete';

		console.log(this.state.tempImg);

		var displayElem;
		// if it's a new video, it's too heavy on the DOM to preview, so just show a placeholder img
		if(this.state.tempImg) {
			displayElem = (<img src={this.state.tempImg} onClick={this.onVidClick} />)
		} else {
			displayElem = (<video controls onClick={this.onVidClick} >
				{	
					this.props.videoFormats.map(function(format) {
						return <source key={format.ext} src={elemDesc.content + '.' + format.ext} type={'video/' + format.ext} />
					}.bind(this))
				}
	  		</video>)
		}

		return(
			<div className={className} {...this.props.dragProps}>

				{displayElem}
				
				<input type="file" className='hidden' accept="video/*" onChange={this.onChange} />

				{ /*size select input*/ }
				<SizeSelect value={elemDesc.size} range={this.props.sizeRange} onChange={this.onSizeChange} />

		  		{/*Language select input*/}
				<LangSelect value={elemDesc.language} onChange={this.onLangChange} />

		  		<span onClick={this.onDelete}>{deleteText}</span>

			</div>
		)
	}
});


// Shared compontents
var SizeSelect = React.createClass({
	propTypes: {
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		range: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired

	},
	render: function() {
		return(
			<div>
				<span>Size</span>
				<select value={this.props.value} onChange={this.props.onChange}>						
					{
						this.props.range.map(function(size) {
							return <option key={size} value={size}>{size}</option>
					 	})
					}				
		  		</select>
			</div>
		)	
	}
})

var LangSelect = React.createClass({
	propTypes: {
		value: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired
	},
	render: function() {
		return(
			<div>
				<span>Language</span>
		  		<select value={this.props.value} onChange={this.props.onChange}>
		  			<option value='NULL'>All</option>
		  			<option value='eng'>English</option>
		  			<option value='ita'>Italian</option>
		  		</select>
			</div>
		)	
	}
})

module.exports.TextElem = TextElem;
module.exports.ImgElem = ImgElem;
module.exports.VideoElem = VideoElem;