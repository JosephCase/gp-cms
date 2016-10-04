var DraggableList = require('./draggableList.jsx');

var TextElem = require('./Elems.jsx').TextElem;
var ImgElem = require('./Elems.jsx').ImgElem;
var VideoElem = require('./Elems.jsx').VideoElem;

var PageWrapper = React.createClass({

	textSizes: [10,11,12,13,14,15,16,17,18,19,20],	
	imgSizes: [1,2,3,4],
	videoFormats: [{ext: 'webm'}, {ext: 'mp4'}],
	elemsAdded: 0,

	getInitialState: function() {
		return({
			elements: []
		})
	},
	componentDidMount: function() {

		this.formData = new FormData();

		var content = JSON.parse($("#contentJSON").html());

		this.setState({
			elements: content
		})
	},

	onChange: function(index, newElem) {
		var newElems = this.state.elements;
		newElems[index] = newElem;
		this.setState({
			elements: newElems
		});
	},
	uploadFile(id, file) {

		// add the file to the form data object, with the element id so that it can be referenced by the element on the server
		this.formData.set(id, file);

	},
	onReOrderElems: function(index1, index2) {
		var newElems = this.state.elements;

		// swap the indexes
		var swapTemp = newElems[index1];
		newElems[index1] = newElems[index2];
		newElems[index2] = swapTemp;

		// explicitly set a new index property equal to the new index
		newElems[index1].position = index1;
		// only add the edit instruction if the element doesn't already have an instruction (or if it's already edit)
		if(!newElems[index1].instruction) {
			newElems[index1].instruction = 'edit';
		}

		newElems[index2].position = index2;
		// only add the edit instruction if the element doesn't already have an instruction (or if it's already edit)
		if(!newElems[index2].instruction) {
			newElems[index2].instruction = 'edit';
		}

		this.setState({
			elements: newElems
		})
	},

	getContent: function() {

	},

	// Add text element
	addText: function() {
		var newElem = {
			id: 'n' + this.elemsAdded,
			type: 'text',
			content: '',
			size: 16,
			language: 'NULL',
			instruction: 'add',
			position: this.state.elements.length
		}
		var newElems = this.state.elements;
		newElems.push(newElem);
		console.log(newElems)
		this.setState({
			elements: newElems
		});
		this.elemsAdded += 1;
	},

	id: React.PropTypes.number.isRequired,
			content: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.number
			]),
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,

	//Submit changes
	submit: function() {
		console.log('Submit to server');
		var changes = this.state.elements.filter(function(elem) {
			return elem.instruction
		});

		//get the page id from hidden input
		var pageId = document.getElementById('pageId').value;
		this.formData.set('pageId', pageId);

		this.formData.set('content', JSON.stringify(changes));

		var method = "PATCH";	//hardcode to edit

		$.ajax({
		    type: method,
		    url: '/page',
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: this.formData,
			processData: false,
			contentType: false,
		    // success: DOM.refresh,
		    error: function(errMsg) {
		    	console.log(errMsg);
		        alert('There was a problem updating this page. Please contact support.');
		        // DOM.refresh();
		    }
		});	

	},

	render: function() {
		return(

			<div>
				<div className='controls'>
					<h4><a href="/">Home</a></h4>					
					<p className='btn' onClick={this.addText}>Add text</p>					
					<p id="update" className='btn' onClick={this.submit}>Save</p>	
				</div>
				<DraggableList className='contentList' onReOrder={this.onReOrderElems}>
					{
						this.state.elements.map(function(elem, i) {
							if(elem.type == 'text') {
								return <TextElem key={elem.id} index={i} sizeRange={this.textSizes} 
								 onChange={this.onChange} elemDesc={elem} />
							} else if(elem.type == 'img') {
								return <ImgElem key={elem.id} index={i} sizeRange={this.imgSizes} 
								 onChange={this.onChange} onFileUpload={this.uploadFile}
							     loadingSrc='/img/loading.gif' elemDesc={elem} />
							} else if(elem.type == 'video') {
								return <VideoElem key={elem.id} index={i} sizeRange={this.imgSizes} 
								 onChange={this.onChange} onFileUpload={this.uploadFile}
								 loadingSrc='/img/loading.gif' videoFormats={this.videoFormats} 
								 videoPlaceholder='/img/video.png' elemDesc={elem} />
							}
					 	}.bind(this))
					}
				</DraggableList>
			</div>
		)
	}
});

ReactDOM.render(<PageWrapper />, document.getElementById('container'));
