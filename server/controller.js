'use strict';

const swig = require('swig');
const axios = require('axios');
const formidable = require('formidable');

const config = require("../config/config.js");

const apiHost = config.apiHost;

exports.getLoginPage = (req, res) => {
    var html = swig.renderFile(global.appRoute + '/server/views/login.html');
    res.send(html);
}

exports.login = (req, res) => {

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields) {
        if (err) {
        	console.log(`Error parsing login form: ${err}`);
			return res.status(400).send("Unable to parse login form");
        } else {

            let username = fields.username;
            let password = fields.password;

            if (username.length > 0 && password.length > 0) {

                axios.post(`${apiHost}/auth`, { username: username, password: password })
                    .then(api_res => {
                		res.cookie('jwt', api_res.token);
						return res.send('success');
                    })
                    .catch(api_err => {
						return res.send('failure');
                    })

            } else {
				return res.status(400).send("failure");
            }
        }
    });
}