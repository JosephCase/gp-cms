// Mixins
var ElemMixin = {
	onSizeChange: function(e) {
		this.props.onSizeChange(this.props.index, e.target.value);
	},
	onLangChange: function(e) {
		this.props.onLangChange(this.props.index, e.target.value);
	},
	onDelete: function() {
		this.props.onDelete(this.props.index);
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

		onChange: React.PropTypes.func.isRequired,
		onSizeChange: React.PropTypes.func.isRequired,
		onLangChange: React.PropTypes.func.isRequired,
		onDelete: React.PropTypes.func.isRequired

	},
	onChange: function(e) {
		var newDesc = this.props.elemDesc;

		//change descriptions value and instruction
		newDesc.content = e.target.value;
		newDesc.instruction = 'edit';

		this.props.onChange(this.props.index, newDesc);
	},

	render: function() {

		var elemDesc = this.props.elemDesc;

		console.log(elemDesc);

		var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
		var deleteText = (elemDesc.instruction && elemDesc.instruction == 'delete') ? 'Undelete' : 'Delete';

		// ...dragProps are those appended by the draggable list

		return(
			<div className={className} {...this.props.dragProps}>
				<textarea value={elemDesc.content} onChange={this.onChange} />

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
	getInitialState: function() {
		return({
			previewImg: null
		})
	},
	mixins: [ElemMixin],
	propTypes: {
		id: React.PropTypes.number.isRequired,
		src: React.PropTypes.string.isRequired,
		size: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		sizeRange: React.PropTypes.array.isRequired,
		language: React.PropTypes.string.isRequired,
		instruction: React.PropTypes.string,

		onChange: React.PropTypes.func.isRequired,
		onSizeChange: React.PropTypes.func.isRequired,
		onLangChange: React.PropTypes.func.isRequired,
		onDelete: React.PropTypes.func.isRequired

	},
	getInitialState: function() {
		return({
			loading: false
		})
	},
	onImgClick: function(e) {
		//the image acts as a psuedo input, when click, passed the click to the actual input
		$(e.target).siblings('input.hidden').click();
	},

	onChange: function(e) {

		this.setState({
			loading: true
		})

	    this.props.onChange(this.props.index, null, file);

		var file = e.target.files[0];

		var reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = function(e) {
	    	this.setState({
	    		previewImg: e.target.result
	    	})
	    }.bind(this); 
	},

	render: function() {

		var className = this.props.instruction ? 'content ' + this.props.instruction : 'content';
		var deleteText = (this.props.instruction && this.props.instruction == 'delete') ? 'Undelete' : 'Delete';

		// the source can be one of 3 things
		var src;
		if(this.state.previewImg) {	//a newly uploaded or edited image
			src = this.state.previewImg;
		} else if(this.state.loading) {	//a loading gif for when the previewing image is rendering
			src = this.props.loadingSrc;
		} else {	//or the image passed down by props
			src = this.props.src;
		}

		
		// ...dragProps are those appended by the draggable list
		return(
			<div className={className} {...this.props.dragProps}>
				
				<img src={src} draggable="false" onClick={this.onImgClick} />
				<input type="file" className='hidden' accept="image/*" onChange={this.onChange} />

				{ /*size select input*/ }
				<SizeSelect value={this.props.size} range={this.props.sizeRange} onChange={this.onSizeChange} />

		  		{/*Language select input*/}
				<LangSelect value={this.props.language} onChange={this.onLangChange} />

		  		<span onClick={this.onDelete}>{deleteText}</span>

			</div>
		)
	}
});

var VideoElem = new React.createClass({
	mixins: [ElemMixin],
	propTypes: {
		id: React.PropTypes.number.isRequired,
		src: React.PropTypes.string.isRequired,
		size: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		sizeRange: React.PropTypes.array.isRequired,
		language: React.PropTypes.string.isRequired,
		instruction: React.PropTypes.string,

		videoFormats: React.PropTypes.array.isRequired,

		onChange: React.PropTypes.func.isRequired,
		onSizeChange: React.PropTypes.func.isRequired,
		onLangChange: React.PropTypes.func.isRequired,
		onDelete: React.PropTypes.func.isRequired

	},
	getInitialState: function() {
		return({
			loading: false
		})
	},
	onVidClick: function(e) {
		//the image acts as a psuedo input, when click, passed the click to the actual input
		$(e.target).siblings('input.hidden').click();
	},

	onChange: function(e) {

		var file = e.target.files[0];
    	this.props.onChange(this.props.index, file);

	},

	render: function() {

		console.log(this.props.src)

		var className = this.props.instruction ? 'content ' + this.props.instruction : 'content';
		var deleteText = (this.props.instruction && this.props.instruction == 'delete') ? 'Undelete' : 'Delete';
		var src = (this.state.loading) ? this.props.loadingSrc : this.props.src

		// ...dragProps are those appended by the draggable list

		var displayElem;
		// if it's a new video, it's too heavy on the DOM to preview, so just show a placeholder img
		if(this.props.newVideo) {
			displayElem = (<img src='/img/video.png' onClick={this.onVidClick} />)
		} else {
			displayElem = (<video controls onClick={this.onVidClick} >
				{	
					this.props.videoFormats.map(function(format) {
						return <source key={format.ext} src={this.props.src + '.' + format.ext} type={'video/' + format.ext} />
					}.bind(this))
				}
	  		</video>)
		}

		return(
			<div className={className} {...this.props.dragProps}>

				{displayElem}
				
				<input type="file" className='hidden' accept="video/*" onChange={this.onChange} />

				{ /*size select input*/ }
				<SizeSelect value={this.props.size} range={this.props.sizeRange} onChange={this.onSizeChange} />

		  		{/*Language select input*/}
				<LangSelect value={this.props.language} onChange={this.onLangChange} />

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