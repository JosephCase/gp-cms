var Content = React.createClass({
	sectionClick: function(sectionId) {
		this.setState({
			selected: sectionId
		});
	},
	getInitialState: function() {
		return({
			sections: [],
			selected: 0
		})
	},
	componentDidMount: function() {

		// get the content
	    $.get('/homeContent', function (result) {
	    	var content = JSON.parse(result);

	    	//set the first section as selected
	    	var selected;
	    	for (var i = 0; i < content.length; i++) {
	    		if(content[i].isParent && this.state.selected == 0) {
	    			selected = content[i].id;
	    			break;
	    		}
	    	}
	    	this.setState({
	      		sections: content,
	      		selected: selected
	      	});
	    }.bind(this));
	},
	render: function() {
		return(
			<div className='wrapper'>
				<Controls sections={this.state.sections} selected={this.state.selected} sectionClick={this.sectionClick} />
				{
					this.state.sections.map(function(section) {
						if(section.isParent) {
							return <PageList key={section.id} id={section.id} selected={section.id == this.state.selected} 
							pages={section.pages} />
						}
				 	}.bind(this))
				}
				<div id='loader'></div>
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
						return <SectionPage key={section.id} id={section.id} className='page' name={section.name} visible={section.visible} />
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

var SectionPage = React.createClass({
	//validate props
	//handle click
	click: function() {
		window.location.href = '/page?id=' + this.props.id;
	},
	render: function() {
		console.log(this.props)
		var className = this.props.visible ? this.props.className : this.props.className + ' hidden';
		return(
			<h5 id={this.props.id} className={className} onClick={this.click} draggable='true'>{this.props.name}</h5>
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
				{
					this.props.pages.map(function(page) {
						return <SectionPage key={page.id} id={page.id} className='content page' name={page.name} visible={page.visible} />
				 	}.bind(this))
				}
			</div>
		)
	}
})


React.render(<Content />, document.body);

