
var LoginBox = React.createClass({
	getInitialState: function() {
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
		}
	},
	getInputClass: function(name) {
		return this.state[name].invalid ? 'error' : '';
	},
	focusHandler: function(e) {
		console.log('focus');
		var newState = this.state;
		newState[e.target.id].invalid = false;
		this.setState(newState);
	},
	changeHander: function(e) {
		console.log('on change');
		var newState = this.state;
		newState[e.target.id].value = e.target.value;
		this.setState(newState);
	},
	submitHandler: function() {
		

		if(this.validate()) {			
			this.submit()
		} else {
			this.setState({
				errorMsg: {
					class: 'error',
					message: 'Please enter a valid username and password.'
				}
			});		
		}
			
	},
	validate: function() {
		
		var newState = this.state;
		var valid = true;

		console.log(this.state);
		
		// validate username
		if(this.state.username.value.trim() == '') {
			valid = false
			newState.username.invalid = true;
		}

		// validate password
		if(this.state.password.value.trim() == '') { 
			valid = false;		
			newState.password.invalid = true;
		}

		this.setState(newState);

		return valid;

	},
	submit: function() {	//submit to the server
		console.log('Submit: ' + this.state.username.value + ', ' + this.state.password.value);
		var me = this;
		$.post( "/login", { username: this.state.username.value, password: this.state.password.value}, function( data ) {
			console.log(this);
			if(data === 'success') {
				window.location.replace('/');
			} else if (data === 'failure') {
				this.loginFailed();
			} else {
				alert('ERROR: There was a problem with your login. Please contact support.')
			}
		}.bind(this));
	},
	loginFailed: function() {

		var newState = this.state;

		newState.username.invalid = true;
		newState.password.invalid = true;

		newState.errorMsg = {
			class: 'error',
			message: 'Incorrect username and or password. Please enter a valid username and password.'
		}
		
		this.setState(newState);

	},
	render: function() {
		return(
			<div className='loginBox'>
				<input type='username' id='username' value={this.state.username.value} placeholder={'Enter your username'} className={this.getInputClass('username')} onFocus={this.focusHandler} onChange={this.changeHander} />
				<input type='password' id='password' value={this.state.password.value} placeholder={'Enter your password'} className={this.getInputClass('password')} onFocus={this.focusHandler} onChange={this.changeHander} />
				<p id='errorMsg' className={this.state.errorMsg.class}>{this.state.errorMsg.message}</p>			
				<input type='button' value='Login' onClick={this.submitHandler} />		
			</div>
		);
	}
});

ReactDOM.render(<LoginBox />, document.getElementById('container'));