var Content = React.createClass({
	sectionClick: function(sectionId) {
		this.setState({
			selected: sectionId
		});
	},
	getInitialState: function() {
		return({
			sections: [],
			selected: 0,
			loading: true
		})
	},
	componentDidMount: function() {
		this.getData();
	},
	getData: function() {
		// get the content	    	
    	var content = JSON.parse($("#contentJSON").html());

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
	},
	reOrderPages: function(sectionIndex, index1, index2) {

		var newSections = this.state.sections;

		// swap the indexes
		var swapTemp = newSections[sectionIndex].pages[index1];
		newSections[sectionIndex].pages[index1] = newSections[sectionIndex].pages[index2];
		newSections[sectionIndex].pages[index2] = swapTemp;

		// explicitly set a new index property equal to the new index
		newSections[sectionIndex].pages[index1].newIndex = index1;
		newSections[sectionIndex].pages[index2].newIndex = index2;

		this.setState({
			sections: newSections
		})
		
	},
	update: function(sectionIndex) {
		if(this.state.loading) return false;	//stop double update
		this.setState({
			loading: true
		});
		var reOrderedPages = this.state.sections[sectionIndex].pages.filter(function(page) {
			return page.newIndex > -1;
		})

		$.ajax({
		    type: "PUT",
		    url: "/",
		    // The key needs to match your method's input parameter (case-sensitive).
		    data: JSON.stringify(reOrderedPages),
			processData: false,
			contentType: "application/json; charset=utf-8",
			// if the update is successful it returns the newly updated content
		    success: function(jsonContent) {
		    	var content = JSON.parse(jsonContent);
		    	this.setState({
		    		content: content,
		    		loading: false
		    	})
		    }.bind(this),
		    timeout: function() {
		    	alert('timeout!');
		    },
		    failure: function(errMsg) {
		        alert(errMsg);
		    }
		});
	},
	render: function() {
		var loaderClass = this.state.loading ? 'loading' : '';
		return(
			<div className='wrapper'>
				<Controls sections={this.state.sections} selected={this.state.selected} sectionClick={this.sectionClick} />
				{
					this.state.sections.map(function(section, index) {
						if(section.isParent) {
							return <PageList key={section.id} index={index} id={section.id} selected={section.id == this.state.selected} 
							pages={section.pages} reOrderPages={this.reOrderPages} updatePageOrder={this.update} />
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
	reOrderPages: function(index1, index2) {
		// pass through the index of this page list so that we know which pages to re-order
		this.props.reOrderPages(this.props.index, index1, index2);
	},
	updatePageOrder: function() {
		this.props.updatePageOrder(this.props.index);
	},
	render: function() {		
		var className = (this.props.selected) ? 'contentList selected' : 'contentList'; 
		return(
			<div className={className}>
				<p className='content add' onClick={this.addPage}>Create new page</p>
				<DraggableList onReOrder={this.reOrderPages} onDrop={this.updatePageOrder}>
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
		console.log('dragend');
		if(this.draggedIndex != null) {
			e.target.style.opacity = 1;
			this.draggedIndex = null;
		}
		if(this.props.onDrop) {
			this.props.onDrop();
		}
	},
	render: function() {		
		var className = (this.props.selected) ? 'contentList selected' : 'contentList';

		//Add drag event props to children
		const childrenWithProps = React.Children.map(this.props.children,
			(child, index) => React.cloneElement(child, {
				onDragStart: this.dragstart.bind(this, index), //	child.key?	||	
				onDragOver: this.dragover.bind(this, index), //	child.key?	||	
				onDragEnd: this.dragend,
				draggable: 'true'
			})
	    );
		return(
			<div className='children'>{childrenWithProps}</div>
		)
	}
});


ReactDOM.render(<Content />, document.getElementById('container'));

