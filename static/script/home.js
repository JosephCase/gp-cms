/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	var DraggableList = __webpack_require__(1);

	var Content = React.createClass({
		displayName: "Content",

		sectionClick: function sectionClick(sectionId) {
			this.setState({
				selected: sectionId
			});
		},
		getInitialState: function getInitialState() {
			return {
				sections: [],
				selected: 0,
				loading: true
			};
		},
		componentDidMount: function componentDidMount() {
			this.getData();
		},
		getData: function getData() {
			// get the content	    	
			var content = JSON.parse($("#contentJSON").html());

			//set the first section as selected
			var selected;

			if (this.state.selected == 0) {
				//if nothings selected, select the first section
				for (var i = 0; i < content.length; i++) {
					if (content[i].isParent) {
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
		reOrderPages: function reOrderPages(sectionIndex, index1, index2) {

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
			});
		},
		update: function update(sectionIndex) {
			if (this.state.loading) return false; //stop double update
			this.setState({
				loading: true
			});
			var reOrderedPages = this.state.sections[sectionIndex].pages.filter(function (page) {
				return page.newIndex > -1;
			});

			$.ajax({
				type: "PUT",
				url: "/",
				// The key needs to match your method's input parameter (case-sensitive).
				data: JSON.stringify(reOrderedPages),
				processData: false,
				contentType: "application/json; charset=utf-8",
				// if the update is successful it returns the newly updated content
				success: function (jsonContent) {
					var content = JSON.parse(jsonContent);
					this.setState({
						content: content,
						loading: false
					});
				}.bind(this),
				timeout: function timeout() {
					alert('timeout!');
				},
				failure: function failure(errMsg) {
					alert(errMsg);
				}
			});
		},
		render: function render() {
			var loaderClass = this.state.loading ? 'loading' : '';
			return React.createElement(
				"div",
				{ className: "wrapper" },
				React.createElement(Controls, { sections: this.state.sections, selected: this.state.selected, sectionClick: this.sectionClick }),
				this.state.sections.map(function (section, index) {
					if (section.isParent) {
						return React.createElement(PageList, { key: section.id, index: index, id: section.id, selected: section.id == this.state.selected,
							pages: section.pages, reOrderPages: this.reOrderPages, updatePageOrder: this.update });
					}
				}.bind(this)),
				React.createElement("div", { id: "loader", className: loaderClass })
			);
		}
	});

	var Controls = React.createClass({
		displayName: "Controls",

		render: function render() {
			return React.createElement(
				"div",
				{ className: "controls" },
				React.createElement(
					"h1",
					null,
					"Sections"
				),
				this.props.sections.map(function (section) {
					if (section.isParent) {
						return React.createElement(SectionSwitch, { key: section.id, id: section.id, selected: section.id == this.props.selected,
							name: section.name, onClick: this.props.sectionClick });
					} else {
						return React.createElement(Page, { key: section.id, id: section.id, className: "page", name: section.name, visible: section.visible });
					}
				}.bind(this))
			);
		}
	});

	var SectionSwitch = React.createClass({
		displayName: "SectionSwitch",

		//validate props
		//handle click
		click: function click() {
			this.props.onClick(this.props.id);
		},
		render: function render() {
			var className = this.props.selected ? 'section selected' : 'section';
			return React.createElement(
				"h5",
				{ id: this.props.id, className: className, onClick: this.click },
				this.props.name
			);
		}
	});

	var Page = React.createClass({
		displayName: "Page",

		//validate props
		//handle click
		click: function click() {
			window.location.href = '/page?id=' + this.props.id;
		},

		render: function render() {
			var _console;

			var _props = this.props;
			var visible = _props.visible;
			var className = _props.className;
			var name = _props.name;

			var other = _objectWithoutProperties(_props, ["visible", "className", "name"]); //destructure the props


			(_console = console).log.apply(_console, _toConsumableArray(other));
			var className = this.props.visible ? this.props.className : this.props.className + ' hidden';
			return React.createElement(
				"h5",
				_extends({}, this.props.dragProps, { className: className, onClick: this.click }),
				this.props.name
			);
		}
	});

	var PageList = React.createClass({
		displayName: "PageList",

		addPage: function addPage() {
			window.location.href = '/page?id=0&parent_id=' + this.props.id;
		},
		reOrderPages: function reOrderPages(index1, index2) {
			// pass through the index of this page list so that we know which pages to re-order
			this.props.reOrderPages(this.props.index, index1, index2);
		},
		updatePageOrder: function updatePageOrder() {
			this.props.updatePageOrder(this.props.index);
		},
		render: function render() {
			var className = this.props.selected ? 'contentList selected' : 'contentList';
			return React.createElement(
				"div",
				{ className: className },
				React.createElement(
					"p",
					{ className: "content add", onClick: this.addPage },
					"Create new page"
				),
				React.createElement(
					DraggableList,
					{ onReOrder: this.reOrderPages, onDrop: this.updatePageOrder },
					this.props.pages.map(function (page) {
						return React.createElement(Page, { key: page.id, id: page.id, className: "content page", name: page.name, visible: page.visible });
					}.bind(this))
				)
			);
		}
	});

	ReactDOM.render(React.createElement(Content, null), document.getElementById('container'));

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	// For this to work you need to add {...this.props.dragProps} to the childrens root node in their render method

	var DraggableList = React.createClass({
		displayName: 'DraggableList',

		propTypes: {
			onReOrder: React.PropTypes.func.isRequired,
			onDrop: React.PropTypes.func,
			className: React.PropTypes.string
		},
		defaultProps: {
			className: ''
		},
		dragstart: function dragstart(index, e) {
			e.target.style.opacity = 0.5;
			this.draggedIndex = index;
		},

		dragover: function dragover(index, e) {
			if (this.draggedIndex != null) {
				var thisRect = e.target.getBoundingClientRect();
				if (e.clientY < thisRect['top'] + 0.5 * thisRect['height'] && this.draggedIndex > index || e.clientY >= thisRect['top'] + 0.5 * thisRect['height'] && this.draggedIndex < index) {
					this.props.onReOrder(this.draggedIndex, index);
					this.draggedIndex = index;
				}
			}
		},

		dragend: function dragend(e) {
			if (this.draggedIndex != null) {
				e.target.style.opacity = 1;
				this.draggedIndex = null;
			}
			if (this.props.onDrop) {
				this.props.onDrop();
			}
		},
		render: function render() {
			var _this = this;

			console.log(this.props.children);

			//Add drag event props to children
			var childrenWithProps = React.Children.map(this.props.children, function (child, index) {
				return React.cloneElement(child, {
					dragProps: {
						onDragStart: _this.dragstart.bind(_this, index), //	child.key?	||	
						onDragOver: _this.dragover.bind(_this, index), //	child.key?	||	
						onDragEnd: _this.dragend,
						draggable: 'true'
					}
				});
			});
			return React.createElement(
				'div',
				{ className: this.props.className },
				childrenWithProps
			);
		}
	});

	module.exports = DraggableList;

/***/ }
/******/ ]);