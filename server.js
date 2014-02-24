var express = require('express');
var app = express();

var client = '762489067147-pl5ejenj16n0ktk01mlbouv69v6ejtsj.apps.googleusercontent.com';
var secret = '9KiyTCNxpgXBsEHZ1fDUhQI6';
var redirect = 'http://mysterious-citadel-5909.herokuapp.com/oauth2callback';

var https = require('https');
var url = require('url');
var querystring = require('querystring');

app.configure(function() {
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.session({secret: '1234567890QWERTY'}));
});


var https_request = function(options, callback) {
	var request = https.request(options, function(response) {
	 	response.setEncoding('utf-8');
	 	var response_data = "";
	 	response.on('data', function(chunk) {
	 		response_data += chunk;
	 	});
	 	response.on('end', function() {
	 		callback(response_data);
	 	});

	});
	return request;
};

var auth_url = function() {
	var parts = url.parse('https://accounts.google.com/o/oauth2/auth', true);
	parts.query['response_type'] = 'code';
	parts.query['client_id'] = client;
	parts.query['redirect_uri'] = redirect;
	parts.query['scope'] = 'profile email';
	return url.format(parts);
}

app.get('/', function(req, res) {
	var locals = { title: 'This is a sample app', oauth_url: auth_url() };

	if (req.session['authentication'] && req.session['authentication']["access_token"]) {
		var request = https_request({
			hostname: 'www.googleapis.com',
			path: '/plus/v1/people/me',
			headers: { 'Authorization': "Bearer " + req.session['authentication']["access_token"] }
		 }, function(response_data) {
	 		console.log(response_data);
	 		var response_object = JSON.parse(response_data);
			locals['title'] = 'Authenticated as ' + response_object['displayName'];
			res.render('index.jade', locals);		
		 });
		 request.end();
	} else {
		res.render('index.jade', locals);		
	}
});


app.get('/oauth2callback', function(req, res) {
	var parts = url.parse(req.url, true);
	console.log(req.url);
	var code = parts.query['code'];

	var post_params = {
		code: code,
		client_id: client,
		client_secret: secret,
		redirect_uri: redirect,
		grant_type: 'authorization_code',
	};

	var request = https_request({
		hostname: 'accounts.google.com',
		path: '/o/oauth2/token',
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	 }, function(response_data) {
 		console.log(response_data);
 		var response_object = JSON.parse(response_data);
 		if (response_object["error"]) {
			var locals = { error: response_object["error"], oauth_url: auth_url() };
			res.render('error.jade', locals);
 		} else {
 			req.session['authentication'] = response_object;
 			res.redirect('/');
 		}
	 });

	request.on('error', function(e) { console.log("problems", e); });
	request.write(querystring.stringify(post_params));
	request.end();
});


var server = app.listen(process.env.PORT || 3000);

