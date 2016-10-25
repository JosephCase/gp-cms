var ImageUploadButton = React.createClass({
	propTypes: {
		onChange: React.PropTypes.func.isRequired
	},
	onClick: function() {
		ReactDOM.findDOMNode(this.refs.fileInput).click();
	},
	onChange: function(e) {
		this.props.onChange(e.target.files);
	},
	render: function() {
		return(
			<div>
				<p onClick={this.onClick} className='btn'>{this.props.children}</p>
				<input ref='fileInput' onChange={this.onChange} type="file" className='hidden' multiple accept="image/*" />
			</div>
		)	
	}
})


module.exports.ImageUploadButton = ImageUploadButton;