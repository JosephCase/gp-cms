'use strict';

const swig = require('swig');
const formidable = require('formidable');
const request = require('request');

const config = require("../config/config.js");


const apiHost = config.apiHost;
const apiRequest = request.defaults({
    baseUrl: apiHost,
    json: true
})
const templateDir = `${global.appRoute}/server/views`;

exports.getLoginPage = (req, res) => {
    var html = swig.renderFile(`${templateDir}/login.html`);
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

                let reqOptions = {
                    url: '/auth',
                    body: {
                        username: username, 
                        password: password
                    }
                }

                apiRequest.post(reqOptions, (err, api_res, body) => {
                    if(err) {
                        return res.status(500).send();
                    }
                    if(body.success !== true){
                        return res.send('failure');
                    } else {
                        res.cookie('jwt', body.token);
                        return res.send('success');
                    }
                })

            } else {
                return res.status(400).send("failure");
            }
        }
    });
}

exports.getNavPage = (req, res) => {

    apiRequest.get(`/navigation`, (err, api_res, body) => {
        if(err) {
            return res.redirect('/login');
        }
        var html = swig.renderFile(`${templateDir}/home.html`, {
            sections: body
        });
        res.send(html);
    })
}

exports.getSectionPages = (req, res) => {

	var sectionId = req.params.id;

    apiRequest.get(`/sections/${sectionId}/pages`, (err, api_res, body) => {
        if(err) {
            console.log(`API Error getting section pages, ${err}`);
            return res.status(500).send();
        }
        var html = swig.renderFile(`${templateDir}/partials/pages.html`, {
            section_id: sectionId,
            pages: body
        });
        res.send(html);
    })
}

exports.getPage = (req, res) => {

    var pageId = req.params.id;

    apiRequest.get(`/pages/${pageId}?embed=content`, (err, api_res, body) => {
        if(err) {
            console.log(`API Error getting page, ${err}`);
            return res.status(500).send();
        }
        var html = swig.renderFile(`${templateDir}/page.html`, {
            page: body,
            contentDirectory: apiHost + '/content/',
            imagePreviewSize: config.imagePreviewSize,
            videoFormats: config.videoFormats
        });
        res.send(html);
    })

}

exports.reOrderPages = (req, res) => {

    let sectionId = req.params.id;

    let reqOptions = {
        url: `/sections/${sectionId}/pages`,
        body: req.body,
        headers: {
            'x-access-token': req.headers['x-access-token']
        }
    }

    apiRequest.patch(reqOptions, (err, api_res, body) => {
        if(err) {
            console.log(`API Error re-ordering pages, ${err}`);
            return res.status(500).send();
        }
        exports.getSectionPages(req, res);
    })
}

exports.createPage = (req, res) => {

    let sectionId = req.params.id;

    let reqOptions = {
        url: `/sections/${sectionId}/pages`,
        json: false //for apiRequest we have set this to true
    }

    req.pipe(apiRequest.post(reqOptions, (err, api_res, body) => {
        if(err) {
            console.log(`API Error creating new page, ${err}`);
            return res.status(500).end();
        }

        exports.getSectionPages(req, res);

    }));
}
