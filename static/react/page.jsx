var Page = React.createClass({
	sectionClick: function(sectionId) {
		this.setState({
			selected: sectionId
		});
	},
	getInitialState: function() {
		return({
			content: [],
			loading: true
		})
	},
	componentDidMount: function() {
		this.getData();
		this.instructions = {};
	},
	getData: function() {
		// get the content
	    $.get('/page?' + , function (result) {
	    	var content = JSON.parse(result);

	    	//set the first section as selected
	    	var selected;

	    	if(this.state.selected == 0) {	//if nothings selected, select the first section
		    	for (var i = 0; i < content.length; i++) {
		    		if(content[i].isParent) {
		    			selected = content[i].id;
		    			break;
		    		}
		    	}
	    	} else {
	    		selected = this.state.selected;
	    	}
	    	this.setState({
	      		sections: content,
	      		selected: selected,
	      		loading: false
	      	});
	    }.bind(this));
	},
	addInstruction: function(id, index) {
		this.instructions[id] = {id: id, position: index}
	},
	update: function() {
		// if ($loader.hasClass('loading')) return false;	
		// $loader.addClass('loading');
		if(this.state.loading) return false;	//stop double update
		this.setState({
			loading: true
		})

		$.ajax({
		    type: "PUT",
		    url: "/",
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(this.instructions),
			processData: false,
			contentType: "application/json; charset=utf-8",
		    success: this.updateDone,
		    timeout: function() {
		    	alert('timeout!');
		    },
		    failure: function(errMsg) {
		        alert(errMsg);
		    }
		});
	},
	updateDone: function() {
		this.getData();	//get the data from the server to verfify that it has updated correctly
	},
	render: function() {
		var loaderClass = this.state.loading ? 'loading' : '';
		return(
			<div className='wrapper'>
				<Controls sections={this.state.sections} selected={this.state.selected} sectionClick={this.sectionClick} />
				{
					this.state.sections.map(function(section) {
						if(section.isParent) {
							return <PageList key={section.id} id={section.id} selected={section.id == this.state.selected} 
							pages={section.pages} onDrag={this.addInstruction} onDrop={this.update} />
						}
				 	}.bind(this))
				}
				<div id='loader' className={loaderClass}></div>
			</div>
		)
	}
});

var Controls = React.createClass({
	render: function() {
		return(
			<div className='controls'>
			<h1>Sections</h1>

			{
				this.props.sections.map(function(section) {
					if(section.isParent) {
						return <SectionSwitch key={section.id} id={section.id} selected={section.id == this.props.selected} 
						name={section.name} onClick={this.props.sectionClick} />
					} else {
						return <Page key={section.id} id={section.id} className='page' name={section.name} visible={section.visible} />
					}
			 	}.bind(this))
		    }

			</div>
		)
	}
});

var SectionSwitch = React.createClass({
	//validate props
	//handle click
	click: function() {
		this.props.onClick(this.props.id);
	},
	render: function() {
		var className = (this.props.selected) ? 'section selected' : 'section'; 
		return(
			<h5 id={this.props.id} className={className} onClick={this.click}>{this.props.name}</h5>
		)
	}
});

var Page = React.createClass({
	//validate props
	//handle click
	click: function() {
		window.location.href = '/react/page.html?id=' + this.props.id;
	},
	
	render: function() {
		var { visible, className, name, ...other } = this.props; //destructure the props
		console.log(...other);
		var className = this.props.visible ? this.props.className : this.props.className + ' hidden';
		return(
			<h5 {...other} className={className} onClick={this.click}>{this.props.name}</h5>
		)
	}
});

var PageList = React.createClass({
	addPage: function() {
		window.location.href = '/page?id=0&parent_id=' + this.props.id;
	},
	render: function() {		
		var className = (this.props.selected) ? 'contentList selected' : 'contentList'; 
		return(
			<div className={className}>
				<p className='content add' onClick={this.addPage}>Create new page</p>
				<DraggableList onDrag={this.props.onDrag} onDrop={this.props.onDrop}>
					{
						this.props.pages.map(function(page) {
							return <Page key={page.id} id={page.id} className='content page' name={page.name} visible={page.visible} />
					 	}.bind(this))
					}
				</DraggableList>
			</div>
		)
	}
});

var DraggableList = React.createClass({
	dragstart: function(e) {
		this.$elem = $(e.target);
	},

	dragover: function(e) {
		if(this.$elem) {
			var thisRect = e.target.getBoundingClientRect();
			if(e.clientY < thisRect['top'] + 0.5 * thisRect['height']) {
				$(e.target).before(this.$elem);
			} else {
				$(e.target).after(this.$elem);					
			}
			console.log('drag over');
			this.props.onDrag(e.target.id, $(e.target).index());
		}
	},

	dragend: function() {
		// this.props.onReOrder(this.$elem.id, this.$elem.index());
		if(this.$elem) {
			if(this.props.onDrop) {
				this.props.onDrop();
			}
			this.$elem = null;
		}
	},
	render: function() {		
		var className = (this.props.selected) ? 'contentList selected' : 'contentList';

		//Add drag event props to children
		const childrenWithProps = React.Children.map(this.props.children,
			(child) => React.cloneElement(child, {
				onDragStart: this.dragstart,
				onDragOver: this.dragover,
				onDragEnd: this.dragend,
				draggable: 'true'
			})
	    );
		return(
			<div className='children'>{childrenWithProps}</div>
		)
	}
});


ReactDOM.render(<Page />, document.getElementById('container'));

