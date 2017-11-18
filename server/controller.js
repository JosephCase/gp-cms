'use strict';

const swig = require('swig');
const axios = require('axios');
const formidable = require('formidable');
const querystring = require('querystring');

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
                        res.cookie('jwt', api_res.data.token);
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

exports.getNavPage = (req, res) => {

    axios.get(`${apiHost}/navigation`)
        .then(api_res => {           
		    var html = swig.renderFile(global.appRoute + '/server/views/home.html', {
				sections: api_res.data
			});
		    res.send(html);
        })
        .catch(api_err => {
            return res.redirect('/login');
        })
}

exports.getSectionPages = (req, res) => {

	var sectionId = req.params.id;

	axios.get(`${apiHost}/sections/${sectionId}/pages`)
        .then(api_res => {           
		    var html = swig.renderFile(global.appRoute + '/server/views/partials/pages.html', {
		    	section_id: sectionId,
				pages: api_res.data
			});
		    res.send(html);
        })
        .catch(api_err => {
            return res.status(500).send();
        })
}

exports.getPage = (req, res) => {

    var pageId = req.params.id;

    axios.get(`${apiHost}/pages/${pageId}?embed=content`)
        .then(api_res => {           
            var html = swig.renderFile(global.appRoute + '/server/views/page.html', {
                page: api_res.data,
                contentDirectory: apiHost + '/content/',
                imagePreviewSize: config.imagePreviewSize,
                videoFormats: config.videoFormats
            });
            res.send(html);
        })
        .catch(api_err => {
            return res.status(500).send();
        })
}

exports.reOrderPages = (req, res) => {

    let sectionId = req.params.id;
    let pages = req.body;
    let jwt = req.jwt;

    axios({
            method: 'patch',
            url: `${apiHost}/sections/${sectionId}/pages`,
            headers: { 'x-access-token': jwt },
            data: pages
        })
        .then(api_res => {
            exports.getSectionPages(req, res);
        })
        .catch(api_err => {
                return res.status(500).send();
        })

}