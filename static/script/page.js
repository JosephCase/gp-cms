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

	'use strict';

	var DraggableList = __webpack_require__(1);

	var TextElem = __webpack_require__(2).TextElem;
	var ImgElem = __webpack_require__(2).ImgElem;
	var VideoElem = __webpack_require__(2).VideoElem;

	var PageWrapper = React.createClass({
		displayName: 'PageWrapper',


		textSizes: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
		imgSizes: [1, 2, 3, 4],
		videoFormats: [{ ext: 'webm' }, { ext: 'mp4' }],
		elemsAdded: 0,

		getInitialState: function getInitialState() {
			return {
				elements: []
			};
		},
		componentDidMount: function componentDidMount() {

			this.formData = new FormData();

			var content = JSON.parse($("#contentJSON").html());

			this.setState({
				elements: content
			});
		},

		onChange: function onChange(index, newElem) {
			var newElems = this.state.elements;
			newElems[index] = newElem;
			this.setState({
				elements: newElems
			});
		},
		uploadFile: function uploadFile(id, file) {

			// add the file to the form data object, with the element id so that it can be referenced by the element on the server
			this.formData.set(id, file);
		},

		onReOrderElems: function onReOrderElems(index1, index2) {
			var newElems = this.state.elements;

			// swap the indexes
			var swapTemp = newElems[index1];
			newElems[index1] = newElems[index2];
			newElems[index2] = swapTemp;

			// explicitly set a new index property equal to the new index
			newElems[index1].position = index1;
			// only add the edit instruction if the element doesn't already have an instruction (or if it's already edit)
			if (!newElems[index1].instruction) {
				newElems[index1].instruction = 'edit';
			}

			newElems[index2].position = index2;
			// only add the edit instruction if the element doesn't already have an instruction (or if it's already edit)
			if (!newElems[index2].instruction) {
				newElems[index2].instruction = 'edit';
			}

			this.setState({
				elements: newElems
			});
		},

		getContent: function getContent() {},

		// Add text element
		addText: function addText() {
			var newElem = {
				id: 'n' + this.elemsAdded,
				type: 'text',
				content: '',
				size: 16,
				language: 'NULL',
				instruction: 'add',
				position: this.state.elements.length
			};
			var newElems = this.state.elements;
			newElems.push(newElem);
			console.log(newElems);
			this.setState({
				elements: newElems
			});
			this.elemsAdded += 1;
		},

		id: React.PropTypes.number.isRequired,
		content: React.PropTypes.string.isRequired,
		size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
		language: React.PropTypes.string.isRequired,
		instruction: React.PropTypes.string,

		//Submit changes
		submit: function submit() {
			console.log('Submit to server');
			var changes = this.state.elements.filter(function (elem) {
				return elem.instruction;
			});

			//get the page id from hidden input
			var pageId = document.getElementById('pageId').value;
			this.formData.set('pageId', pageId);

			this.formData.set('content', JSON.stringify(changes));

			var method = "PATCH"; //hardcode to edit

			$.ajax({
				type: method,
				url: '/page',
				// The key needs to match your method's input parameter (case-sensitive).
				data: this.formData,
				processData: false,
				contentType: false,
				// success: DOM.refresh,
				error: function error(errMsg) {
					console.log(errMsg);
					alert('There was a problem updating this page. Please contact support.');
					// DOM.refresh();
				}
			});
		},

		render: function render() {
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					{ className: 'controls' },
					React.createElement(
						'h4',
						null,
						React.createElement(
							'a',
							{ href: '/' },
							'Home'
						)
					),
					React.createElement(
						'p',
						{ className: 'btn', onClick: this.addText },
						'Add text'
					),
					React.createElement(
						'p',
						{ id: 'update', className: 'btn', onClick: this.submit },
						'Save'
					)
				),
				React.createElement(
					DraggableList,
					{ className: 'contentList', onReOrder: this.onReOrderElems },
					this.state.elements.map(function (elem, i) {
						if (elem.type == 'text') {
							return React.createElement(TextElem, { key: elem.id, index: i, sizeRange: this.textSizes,
								onChange: this.onChange, elemDesc: elem });
						} else if (elem.type == 'img') {
							return React.createElement(ImgElem, { key: elem.id, index: i, sizeRange: this.imgSizes,
								onChange: this.onChange, onFileUpload: this.uploadFile,
								loadingSrc: '/img/loading.gif', elemDesc: elem });
						} else if (elem.type == 'video') {
							return React.createElement(VideoElem, { key: elem.id, index: i, sizeRange: this.imgSizes,
								onChange: this.onChange, onFileUpload: this.uploadFile,
								loadingSrc: '/img/loading.gif', videoFormats: this.videoFormats,
								videoPlaceholder: '/img/video.png', elemDesc: elem });
						}
					}.bind(this))
				)
			);
		}
	});

	ReactDOM.render(React.createElement(PageWrapper, null), document.getElementById('container'));

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
			console.log('elem drag');
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

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	// Mixins
	var ElemMixin = {
		onSizeChange: function onSizeChange(e) {
			var newDesc = this.props.elemDesc;

			//change descriptions value and instruction
			newDesc.size = e.target.value;
			if (newDesc.instruction != 'add') {
				newDesc.instruction = 'edit';
			}

			this.props.onChange(this.props.index, newDesc);
		},
		onLangChange: function onLangChange(e) {
			var newDesc = this.props.elemDesc;

			//change descriptions value and instruction
			newDesc.language = e.target.value;
			if (newDesc.instruction != 'add') {
				newDesc.instruction = 'edit';
			}

			this.props.onChange(this.props.index, newDesc);
		},
		onDelete: function onDelete() {
			var newDesc = this.props.elemDesc;

			if (newDesc.instruction == 'delete') {
				//toggle the delete off

				//if there's an old instruction re-instate this, otherwise remove the instruction 
				if (newDesc.instruction_old) {
					newDesc.instruction = newDesc.instruction_old;
					delete newDesc.instruction_old;
				} else {
					newDesc.instruction;
				}
			} else if (newDesc.instruction == 'edit') {
				//replace edit instruction but remember it incase we revert
				newDesc.instruction_old = newDesc.instruction;
				newDesc.instruction = 'delete';
				// } else if (newElems[index].instruction == 'add') {	//if it's new just remove it
				// newElems.splice(index, 1);
			} else {
				newDesc.instruction = 'delete';
			}

			this.props.onChange(this.props.index, newDesc);
		}
	};
	// <img src="{{ contentDirectory + content.content.replace('.jpg', '_x' + previewSize + '.jpg') }}" draggable="false"  />
	// 						<input type="file" class='hidden' accept="image/*" />


	var TextElem = new React.createClass({
		mixins: [ElemMixin],
		propTypes: {
			elemDesc: React.PropTypes.shape({
				id: React.PropTypes.number.isRequired,
				content: React.PropTypes.string.isRequired,
				size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
				language: React.PropTypes.string.isRequired,
				instruction: React.PropTypes.string
			}).isRequired,

			sizeRange: React.PropTypes.array.isRequired,
			onChange: React.PropTypes.func.isRequired

		},
		onChange: function onChange(e) {
			var newDesc = this.props.elemDesc;

			//change descriptions value and instruction
			newDesc.content = e.target.value;
			if (newDesc.instruction != 'add') {
				newDesc.instruction = 'edit';
			}

			this.props.onChange(this.props.index, newDesc);
		},
		componentDidMount: function componentDidMount() {
			console.log(this.props.elemDesc.instruction);
			if (this.props.elemDesc.instruction == 'add') {
				console.log('set the focus');
				console.log(this.refs);
				ReactDOM.findDOMNode(this.refs.textArea).focus();
			}
		},
		//this stops the text area being draggable and therefor highlightable
		preventDefault: function preventDefault(e) {
			e.preventDefault();
			e.stopPropagation();
		},

		render: function render() {

			var elemDesc = this.props.elemDesc;

			var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
			var deleteText = elemDesc.instruction && elemDesc.instruction == 'delete' ? 'Undelete' : 'Delete';

			// ...dragProps are those appended by the draggable list

			return React.createElement(
				'div',
				_extends({ className: className }, this.props.dragProps),
				React.createElement('textarea', { ref: 'textArea', value: elemDesc.content, onChange: this.onChange, draggable: 'true', onDragStart: this.preventDefault }),
				React.createElement(SizeSelect, { value: elemDesc.size, range: this.props.sizeRange, onChange: this.onSizeChange }),
				React.createElement(LangSelect, { value: elemDesc.language, onChange: this.onLangChange }),
				React.createElement(
					'span',
					{ onClick: this.onDelete },
					deleteText
				)
			);
		}
	});

	var ImgElem = new React.createClass({
		mixins: [ElemMixin],
		propTypes: {
			elemDesc: React.PropTypes.shape({
				id: React.PropTypes.number.isRequired,
				content: React.PropTypes.string.isRequired,
				size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
				language: React.PropTypes.string.isRequired,
				instruction: React.PropTypes.string
			}).isRequired,

			sizeRange: React.PropTypes.array.isRequired,

			onChange: React.PropTypes.func.isRequired,
			onFileUpload: React.PropTypes.func.isRequired

		},
		getInitialState: function getInitialState() {
			return {
				tempImg: null
			};
		},
		onImgClick: function onImgClick(e) {
			//the image acts as a psuedo input, when click, passed the click to the actual input
			$(e.target).siblings('input.hidden').click();
		},

		onChange: function onChange(e) {

			// show the loading gif while the image is loading for preview
			this.setState({
				tempImg: this.props.loadingSrc
			});

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
			reader.onload = function (e) {

				this.setState({
					tempImg: e.target.result
				});
			}.bind(this);
		},

		render: function render() {

			var elemDesc = this.props.elemDesc;

			var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
			var deleteText = elemDesc.instruction && elemDesc.instruction == 'delete' ? 'Undelete' : 'Delete';

			// the source can be one of 3 things
			var src;
			if (this.state.tempImg) {
				//a loading gif for when the previewing image is rendering
				src = this.state.tempImg;
			} else {
				//or the image passed down by props
				src = elemDesc.content;
			}

			// ...dragProps are those appended by the draggable list
			return React.createElement(
				'div',
				_extends({ className: className }, this.props.dragProps),
				React.createElement('img', { src: src, draggable: 'false', onClick: this.onImgClick }),
				React.createElement('input', { type: 'file', className: 'hidden', accept: 'image/*', onChange: this.onChange }),
				React.createElement(SizeSelect, { value: elemDesc.size, range: this.props.sizeRange, onChange: this.onSizeChange }),
				React.createElement(LangSelect, { value: elemDesc.language, onChange: this.onLangChange }),
				React.createElement(
					'span',
					{ onClick: this.onDelete },
					deleteText
				)
			);
		}
	});

	var VideoElem = new React.createClass({
		mixins: [ElemMixin],
		propTypes: {
			elemDesc: React.PropTypes.shape({
				id: React.PropTypes.number.isRequired,
				content: React.PropTypes.string.isRequired,
				size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
				language: React.PropTypes.string.isRequired,
				instruction: React.PropTypes.string
			}).isRequired,

			sizeRange: React.PropTypes.array.isRequired,

			onChange: React.PropTypes.func.isRequired,
			onFileUpload: React.PropTypes.func.isRequired,

			videoFormats: React.PropTypes.array.isRequired

		},
		getInitialState: function getInitialState() {
			return {
				tempImg: null
			};
		},
		onVidClick: function onVidClick(e) {
			//the image acts as a psuedo input, when click, passed the click to the actual input
			$(e.target).siblings('input.hidden').click();
		},

		onChange: function onChange(e) {

			// show the loading gif while the image is loading for preview
			this.setState({
				tempImg: this.props.loadingSrc
			});

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
			});
		},

		render: function render() {

			var elemDesc = this.props.elemDesc;

			var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
			var deleteText = elemDesc.instruction && elemDesc.instruction == 'delete' ? 'Undelete' : 'Delete';

			console.log(this.state.tempImg);

			var displayElem;
			// if it's a new video, it's too heavy on the DOM to preview, so just show a placeholder img
			if (this.state.tempImg) {
				displayElem = React.createElement('img', { src: this.state.tempImg, onClick: this.onVidClick });
			} else {
				displayElem = React.createElement(
					'video',
					{ controls: true, onClick: this.onVidClick },
					this.props.videoFormats.map(function (format) {
						return React.createElement('source', { key: format.ext, src: elemDesc.content + '.' + format.ext, type: 'video/' + format.ext });
					}.bind(this))
				);
			}

			return React.createElement(
				'div',
				_extends({ className: className }, this.props.dragProps),
				displayElem,
				React.createElement('input', { type: 'file', className: 'hidden', accept: 'video/*', onChange: this.onChange }),
				React.createElement(SizeSelect, { value: elemDesc.size, range: this.props.sizeRange, onChange: this.onSizeChange }),
				React.createElement(LangSelect, { value: elemDesc.language, onChange: this.onLangChange }),
				React.createElement(
					'span',
					{ onClick: this.onDelete },
					deleteText
				)
			);
		}
	});

	// Shared compontents
	var SizeSelect = React.createClass({
		displayName: 'SizeSelect',

		propTypes: {
			value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
			range: React.PropTypes.array.isRequired,
			onChange: React.PropTypes.func.isRequired

		},
		render: function render() {
			return React.createElement(
				'div',
				null,
				React.createElement(
					'span',
					null,
					'Size'
				),
				React.createElement(
					'select',
					{ value: this.props.value, onChange: this.props.onChange },
					this.props.range.map(function (size) {
						return React.createElement(
							'option',
							{ key: size, value: size },
							size
						);
					})
				)
			);
		}
	});

	var LangSelect = React.createClass({
		displayName: 'LangSelect',

		propTypes: {
			value: React.PropTypes.string,
			onChange: React.PropTypes.func.isRequired
		},
		render: function render() {
			return React.createElement(
				'div',
				null,
				React.createElement(
					'span',
					null,
					'Language'
				),
				React.createElement(
					'select',
					{ value: this.props.value, onChange: this.props.onChange },
					React.createElement(
						'option',
						{ value: 'NULL' },
						'All'
					),
					React.createElement(
						'option',
						{ value: 'eng' },
						'English'
					),
					React.createElement(
						'option',
						{ value: 'ita' },
						'Italian'
					)
				)
			);
		}
	});

	module.exports.TextElem = TextElem;
	module.exports.ImgElem = ImgElem;
	module.exports.VideoElem = VideoElem;

/***/ }
/******/ ]);