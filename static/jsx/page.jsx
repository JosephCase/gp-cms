var DraggableList = require('./draggableList.jsx');

var TextElem = require('./Elems.jsx').TextElem;
var ImgElem = require('./Elems.jsx').ImgElem;
var VideoElem = require('./Elems.jsx').VideoElem;





var PageWrapper = React.createClass({

	textSizes: [1,2,3,4,5],	
	imgSizes: [1,2,3,4],
	videoFormats: [{ext: 'webm'}, {ext: 'mp4'}],
	contentDirectory: 'content/',
	size: '_x500',

	getInitialState: function() {
		return({
			elements: []
		})
	},
	componentDidMount: function() {

		this.formData = new FormData();

		var content = JSON.parse($("#contentJSON").html());

		console.log(content);

		this.setState({
			elements: content
		})
	},

	onChangeText: function(index, newElem) {
		var newElems = this.state.elements;
		newElems[index] = newElem;
		this.setState({
			elements: newElems
		});
	},
	onImgChange(index, value, file) {
		var newElems = this.state.elements;
		// newElems[index].content = value;
		newElems[index].instruction = 'edit';

		// add the file to the form data object, with the element id so that it can be referenced by the element on the server
		this.formData.set(newElems[index].id, file);

		this.setState({
			elements: newElems
		});
	},
	onVideoChange(index, file) {
		var newElems = this.state.elements;
		newElems[index].content = '';
		newElems[index].newVideo = index;
		newElems[index].instruction = 'edit';

		// add the file to the form data object, with the element id so that it can be referenced by the element on the server
		this.formData.set(newElems[index].id, file);

		this.setState({
			elements: newElems
		});
	},
	onSizeChange: function(index, value) {
		console.log(index);
		var newElems = this.state.elements;
		newElems[index].size = value;
		newElems[index].instruction = 'edit';
		this.setState({
			elements: newElems
		});
	},
	onLangChange: function(index, value) {
		var newElems = this.state.elements;
		newElems[index].language = value;
		newElems[index].instruction = 'edit';
		this.setState({
			elements: newElems
		});
	},
	onReOrderElems: function(index1, index2) {
		var newElems = this.state.elements;

		// swap the indexes
		var swapTemp = newElems[index1];
		newElems[index1] = newElems[index2];
		newElems[index2] = swapTemp;

		// explicitly set a new index property equal to the new index
		newElems[index1].position = index1;
		newElems[index1].instruction = 'edit';

		newElems[index2].position = index2;
		newElems[index2].instruction = 'edit';

		this.setState({
			elements: newElems
		})
	},
	onDelete: function(index) {
		var newElems = this.state.elements;
		if (newElems[index].instruction == 'delete') {	//toggle the delete off

			//if there's an old instruction re-instate this, otherwise remove the instruction 
			if(newElems[index].instruction_old) {
				newElems[index].instruction = newElems[index].instruction_old;
				delete newElems[index].instruction_old;
			} else {
				delete newElems[index].instruction;
			}

		} else if (newElems[index].instruction == 'edit') {	//replace edit instruction but remember it incase we revert
			newElems[index].instruction_old = newElems[index].instruction;
			newElems[index].instruction = 'delete';
		} else if (newElems[index].instruction == 'add') {	//if it's new just remove it
			newElems.splice(index, 1);
		} else {
			newElems[index].instruction = 'delete';
		}
		this.setState({
			elements: newElems
		});
	},

	getContent: function() {

	},

	// Add text element
	addText: function() {

	},

	//Submit changes
	submit: function() {
		console.log('Submit to server');
		var changes = this.state.elements.filter(function(elem) {
			return elem.instruction
		});

		//get the page id from hidden input
		var pageId = document.getElementById('pageId').value;
		this.formData.set('pageId', pageId);

		this.formData.append('content', JSON.stringify(changes));

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
								 onChange={this.onChangeText} onSizeChange={this.onSizeChange} 
								 onLangChange={this.onLangChange} onDelete={this.onDelete} elemDesc={elem} />
							} else if(elem.type == 'img') {
								return <ImgElem key={elem.id} index={i} sizeRange={this.imgSizes} 
								 onChange={this.onImgChange} onSizeChange={this.onSizeChange} 
								 onLangChange={this.onLangChange} onDelete={this.onDelete} 
								 src={this.contentDirectory + elem.content + this.size} loadingSrc='/img/loading.gif' {...elem} />
							} else if(elem.type == 'video') {
								return <VideoElem key={elem.id} index={i} sizeRange={this.imgSizes} 
								 onChange={this.onVideoChange} onSizeChange={this.onSizeChange} 
								 onLangChange={this.onLangChange} onDelete={this.onDelete} 
								 src={elem.content} loadingSrc='/img/loading.gif' videoFormats={this.videoFormats} {...elem} />
							}
					 	}.bind(this))
					}
				</DraggableList>
			</div>
		)
	}
});

ReactDOM.render(<PageWrapper />, document.getElementById('container'));
