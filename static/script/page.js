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

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var DraggableList = __webpack_require__(1);

	var TextElem = __webpack_require__(2).TextElem;
	var ImgElem = __webpack_require__(2).ImgElem;
	var VideoElem = __webpack_require__(2).VideoElem;

	var PageWrapper = React.createClass({
		displayName: 'PageWrapper',


		textSizes: [1, 2, 3, 4, 5],
		imgSizes: [1, 2, 3, 4],
		videoFormats: [{ ext: 'webm' }, { ext: 'mp4' }],
		contentDirectory: 'content/',
		size: '_x500',

		getInitialState: function getInitialState() {
			return {
				elements: []
			};
		},
		componentDidMount: function componentDidMount() {

			this.formData = new FormData();

			var content = JSON.parse($("#contentJSON").html());

			console.log(content);

			this.setState({
				elements: content
			});
		},

		onChangeText: function onChangeText(index, newElem) {
			var newElems = this.state.elements;
			newElems[index] = newElem;
			this.setState({
				elements: newElems
			});
		},
		onImgChange: function onImgChange(index, value, file) {
			var newElems = this.state.elements;
			// newElems[index].content = value;
			newElems[index].instruction = 'edit';

			// add the file to the form data object, with the element id so that it can be referenced by the element on the server
			this.formData.set(newElems[index].id, file);

			this.setState({
				elements: newElems
			});
		},
		onVideoChange: function onVideoChange(index, file) {
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

		onSizeChange: function onSizeChange(index, value) {
			console.log(index);
			var newElems = this.state.elements;
			newElems[index].size = value;
			newElems[index].instruction = 'edit';
			this.setState({
				elements: newElems
			});
		},
		onLangChange: function onLangChange(index, value) {
			var newElems = this.state.elements;
			newElems[index].language = value;
			newElems[index].instruction = 'edit';
			this.setState({
				elements: newElems
			});
		},
		onReOrderElems: function onReOrderElems(index1, index2) {
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
			});
		},
		onDelete: function onDelete(index) {
			var newElems = this.state.elements;
			if (newElems[index].instruction == 'delete') {
				//toggle the delete off

				//if there's an old instruction re-instate this, otherwise remove the instruction 
				if (newElems[index].instruction_old) {
					newElems[index].instruction = newElems[index].instruction_old;
					delete newElems[index].instruction_old;
				} else {
					delete newElems[index].instruction;
				}
			} else if (newElems[index].instruction == 'edit') {
				//replace edit instruction but remember it incase we revert
				newElems[index].instruction_old = newElems[index].instruction;
				newElems[index].instruction = 'delete';
			} else if (newElems[index].instruction == 'add') {
				//if it's new just remove it
				newElems.splice(index, 1);
			} else {
				newElems[index].instruction = 'delete';
			}
			this.setState({
				elements: newElems
			});
		},

		getContent: function getContent() {},

		// Add text element
		addText: function addText() {},

		//Submit changes
		submit: function submit() {
			console.log('Submit to server');
			var changes = this.state.elements.filter(function (elem) {
				return elem.instruction;
			});

			//get the page id from hidden input
			var pageId = document.getElementById('pageId').value;
			this.formData.set('pageId', pageId);

			this.formData.append('content', JSON.stringify(changes));

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
								onChange: this.onChangeText, onSizeChange: this.onSizeChange,
								onLangChange: this.onLangChange, onDelete: this.onDelete, elemDesc: elem });
						} else if (elem.type == 'img') {
							return React.createElement(ImgElem, _extends({ key: elem.id, index: i, sizeRange: this.imgSizes,
								onChange: this.onImgChange, onSizeChange: this.onSizeChange,
								onLangChange: this.onLangChange, onDelete: this.onDelete,
								src: this.contentDirectory + elem.content + this.size, loadingSrc: '/img/loading.gif' }, elem));
						} else if (elem.type == 'video') {
							return React.createElement(VideoElem, _extends({ key: elem.id, index: i, sizeRange: this.imgSizes,
								onChange: this.onVideoChange, onSizeChange: this.onSizeChange,
								onLangChange: this.onLangChange, onDelete: this.onDelete,
								src: elem.content, loadingSrc: '/img/loading.gif', videoFormats: this.videoFormats }, elem));
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

	var _ref;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	// Mixins
	var ElemMixin = {
		onSizeChange: function onSizeChange(e) {
			this.props.onSizeChange(this.props.index, e.target.value);
		},
		onLangChange: function onLangChange(e) {
			this.props.onLangChange(this.props.index, e.target.value);
		},
		onDelete: function onDelete() {
			this.props.onDelete(this.props.index);
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

			onChange: React.PropTypes.func.isRequired,
			onSizeChange: React.PropTypes.func.isRequired,
			onLangChange: React.PropTypes.func.isRequired,
			onDelete: React.PropTypes.func.isRequired

		},
		onChange: function onChange(e) {
			var newDesc = this.props.elemDesc;

			//change descriptions value and instruction
			newDesc.content = e.target.value;
			newDesc.instruction = 'edit';

			this.props.onChange(this.props.index, newDesc);
		},

		render: function render() {

			var elemDesc = this.props.elemDesc;

			console.log(elemDesc);

			var className = elemDesc.instruction ? 'content ' + elemDesc.instruction : 'content';
			var deleteText = elemDesc.instruction && elemDesc.instruction == 'delete' ? 'Undelete' : 'Delete';

			// ...dragProps are those appended by the draggable list

			return React.createElement(
				'div',
				_extends({ className: className }, this.props.dragProps),
				React.createElement('textarea', { value: elemDesc.content, onChange: this.onChange }),
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

	var ImgElem = new React.createClass((_ref = {
		getInitialState: function getInitialState() {
			return {
				previewImg: null
			};
		},
		mixins: [ElemMixin],
		propTypes: {
			id: React.PropTypes.number.isRequired,
			src: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
			sizeRange: React.PropTypes.array.isRequired,
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,

			onChange: React.PropTypes.func.isRequired,
			onSizeChange: React.PropTypes.func.isRequired,
			onLangChange: React.PropTypes.func.isRequired,
			onDelete: React.PropTypes.func.isRequired

		}
	}, _defineProperty(_ref, 'getInitialState', function getInitialState() {
		return {
			loading: false
		};
	}), _defineProperty(_ref, 'onImgClick', function onImgClick(e) {
		//the image acts as a psuedo input, when click, passed the click to the actual input
		$(e.target).siblings('input.hidden').click();
	}), _defineProperty(_ref, 'onChange', function onChange(e) {

		this.setState({
			loading: true
		});

		this.props.onChange(this.props.index, null, file);

		var file = e.target.files[0];

		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function (e) {
			this.setState({
				previewImg: e.target.result
			});
		}.bind(this);
	}), _defineProperty(_ref, 'render', function render() {

		var className = this.props.instruction ? 'content ' + this.props.instruction : 'content';
		var deleteText = this.props.instruction && this.props.instruction == 'delete' ? 'Undelete' : 'Delete';

		// the source can be one of 3 things
		var src;
		if (this.state.previewImg) {
			//a newly uploaded or edited image
			src = this.state.previewImg;
		} else if (this.state.loading) {
			//a loading gif for when the previewing image is rendering
			src = this.props.loadingSrc;
		} else {
			//or the image passed down by props
			src = this.props.src;
		}

		// ...dragProps are those appended by the draggable list
		return React.createElement(
			'div',
			_extends({ className: className }, this.props.dragProps),
			React.createElement('img', { src: src, draggable: 'false', onClick: this.onImgClick }),
			React.createElement('input', { type: 'file', className: 'hidden', accept: 'image/*', onChange: this.onChange }),
			React.createElement(SizeSelect, { value: this.props.size, range: this.props.sizeRange, onChange: this.onSizeChange }),
			React.createElement(LangSelect, { value: this.props.language, onChange: this.onLangChange }),
			React.createElement(
				'span',
				{ onClick: this.onDelete },
				deleteText
			)
		);
	}), _ref));

	var VideoElem = new React.createClass({
		mixins: [ElemMixin],
		propTypes: {
			id: React.PropTypes.number.isRequired,
			src: React.PropTypes.string.isRequired,
			size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
			sizeRange: React.PropTypes.array.isRequired,
			language: React.PropTypes.string.isRequired,
			instruction: React.PropTypes.string,

			videoFormats: React.PropTypes.array.isRequired,

			onChange: React.PropTypes.func.isRequired,
			onSizeChange: React.PropTypes.func.isRequired,
			onLangChange: React.PropTypes.func.isRequired,
			onDelete: React.PropTypes.func.isRequired

		},
		getInitialState: function getInitialState() {
			return {
				loading: false
			};
		},
		onVidClick: function onVidClick(e) {
			//the image acts as a psuedo input, when click, passed the click to the actual input
			$(e.target).siblings('input.hidden').click();
		},

		onChange: function onChange(e) {

			var file = e.target.files[0];
			this.props.onChange(this.props.index, file);
		},

		render: function render() {

			console.log(this.props.src);

			var className = this.props.instruction ? 'content ' + this.props.instruction : 'content';
			var deleteText = this.props.instruction && this.props.instruction == 'delete' ? 'Undelete' : 'Delete';
			var src = this.state.loading ? this.props.loadingSrc : this.props.src;

			// ...dragProps are those appended by the draggable list

			var displayElem;
			// if it's a new video, it's too heavy on the DOM to preview, so just show a placeholder img
			if (this.props.newVideo) {
				displayElem = React.createElement('img', { src: '/img/video.png', onClick: this.onVidClick });
			} else {
				displayElem = React.createElement(
					'video',
					{ controls: true, onClick: this.onVidClick },
					this.props.videoFormats.map(function (format) {
						return React.createElement('source', { key: format.ext, src: this.props.src + '.' + format.ext, type: 'video/' + format.ext });
					}.bind(this))
				);
			}

			return React.createElement(
				'div',
				_extends({ className: className }, this.props.dragProps),
				displayElem,
				React.createElement('input', { type: 'file', className: 'hidden', accept: 'video/*', onChange: this.onChange }),
				React.createElement(SizeSelect, { value: this.props.size, range: this.props.sizeRange, onChange: this.onSizeChange }),
				React.createElement(LangSelect, { value: this.props.language, onChange: this.onLangChange }),
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