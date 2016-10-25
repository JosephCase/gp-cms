/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	var LoginBox = React.createClass({
		displayName: 'LoginBox',
	
		getInitialState: function getInitialState() {
			console.log('get initial state');
			return {
				username: {
					invalid: false,
					value: ''
				},
				password: {
					invalid: false,
					value: ''
				},
				errorMsg: {
					message: '',
					class: ''
				}
			};
		},
		getInputClass: function getInputClass(name) {
			return this.state[name].invalid ? 'error' : '';
		},
		focusHandler: function focusHandler(e) {
			console.log('focus');
			var newState = this.state;
			newState[e.target.id].invalid = false;
			this.setState(newState);
		},
		changeHander: function changeHander(e) {
			console.log('on change');
			var newState = this.state;
			newState[e.target.id].value = e.target.value;
			this.setState(newState);
		},
		submitHandler: function submitHandler() {
	
			if (this.validate()) {
				this.submit();
			} else {
				this.setState({
					errorMsg: {
						class: 'error',
						message: 'Please enter a valid username and password.'
					}
				});
			}
		},
		validate: function validate() {
	
			var newState = this.state;
			var valid = true;
	
			console.log(this.state);
	
			// validate username
			if (this.state.username.value.trim() == '') {
				valid = false;
				newState.username.invalid = true;
			}
	
			// validate password
			if (this.state.password.value.trim() == '') {
				valid = false;
				newState.password.invalid = true;
			}
	
			this.setState(newState);
	
			return valid;
		},
		submit: function submit() {
			//submit to the server
			console.log('Submit: ' + this.state.username.value + ', ' + this.state.password.value);
			var me = this;
			$.post("/login", { username: this.state.username.value, password: this.state.password.value }, function (data) {
				console.log(this);
				if (data === 'success') {
					window.location.replace('/');
				} else if (data === 'failure') {
					this.loginFailed();
				} else {
					alert('ERROR: There was a problem with your login. Please contact support.');
				}
			}.bind(this));
		},
		loginFailed: function loginFailed() {
	
			var newState = this.state;
	
			newState.username.invalid = true;
			newState.password.invalid = true;
	
			newState.errorMsg = {
				class: 'error',
				message: 'Incorrect username and or password. Please enter a valid username and password.'
			};
	
			this.setState(newState);
		},
		render: function render() {
			return React.createElement(
				'div',
				{ className: 'loginBox' },
				React.createElement('input', { type: 'username', id: 'username', value: this.state.username.value, placeholder: 'Enter your username', className: this.getInputClass('username'), onFocus: this.focusHandler, onChange: this.changeHander }),
				React.createElement('input', { type: 'password', id: 'password', value: this.state.password.value, placeholder: 'Enter your password', className: this.getInputClass('password'), onFocus: this.focusHandler, onChange: this.changeHander }),
				React.createElement(
					'p',
					{ id: 'errorMsg', className: this.state.errorMsg.class },
					this.state.errorMsg.message
				),
				React.createElement('input', { type: 'button', value: 'Login', onClick: this.submitHandler })
			);
		}
	});
	
	ReactDOM.render(React.createElement(LoginBox, null), document.getElementById('container'));

/***/ }
/******/ ]);
//# sourceMappingURL=login.js.map