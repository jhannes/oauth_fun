var express = require('express');
var app = express();

var oauth_settings = require('./oauth_settings');
var decode_token = require('./decode_token');

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

var auth_url = function(provider) {
  var parts = url.parse(oauth_settings[provider].auth_url, true);
  parts.query['response_type'] = 'code';
  parts.query['client_id'] = oauth_settings[provider].client_id;
  parts.query['redirect_uri'] = oauth_settings[provider].redirect_uri;
  parts.query['scope'] = oauth_settings[provider].scope;
  parts.query['state'] = provider + ' random-123';
  return url.format(parts);
}

app.get('/fetch_profile', function(req, res) {
  req.session['authentication'] = req.session['authentication'] || {};
  var parts = url.parse(req.url, true);
  var provider = parts.query['provider'];

  if (!req.session['authentication'][provider]) {
    console.log("Not logged in with", provider, "redirect");
    return res.redirect(auth_url(provider));
  }

  var access_token = req.session['authentication'][provider]['access_token'];
  var request_url = url.parse(oauth_settings[provider].profile_url(access_token));
  console.log('fetching profile from', oauth_settings[provider].profile_url(access_token));

  var request = https_request({
    hostname: request_url.hostname,
    path: request_url.path,
    headers: { 
      'Accept': 'application/json',
      'Content-type': 'application/json'
    }
  }, function(response_data) {
    console.log(request_url.href, 'response', response_data);
    var response_object = JSON.parse(response_data);
    req.session['authentication'][provider].profile = oauth_settings[provider].get_profile(response_object);
    res.redirect('/');
  });
  request.end();
});

app.get('/', function(req, res) {
  req.session['authentication'] = req.session['authentication'] || {};

  var providers = [];
  for (var p in oauth_settings) {
    var entry = {name: oauth_settings[p].name, url: auth_url(p)};
    entry.fetch_profile = '/fetch_profile?provider=' + p;
    entry.logged_in = !!req.session['authentication'][p];
    if (req.session['authentication'][p]) {
      var id_token = decode_token(req.session['authentication'][p]['id_token']);
      if (id_token) {
        entry.id_token = "id: " + id_token.payload.id + ' ' + ' ' + id_token.payload.email
            + (id_token.payload.email_verified ? ' (verified)' : ' (not verified)');
         if (id_token.payload.cid !== oauth_settings[p].client_id) {
           entry.id_token = "Invalid id_token";
         }
      }
      entry.profile = req.session['authentication'][p].profile;
    }
    providers.push(entry);
  }

  var locals = { title: 'This is a sample app', providers: providers };
  res.render('index.jade', locals);    
});


app.get('/oauth2callback', function(req, res) {
  req.session['authentication'] = req.session['authentication'] || {};
  console.log('/oauth2callback url', req.url);

  var parts = url.parse(req.url, true);
  var code = parts.query['code'];
  var provider = parts.query['state'].split(' ')[0];

  var post_params = {
    code: code,
    client_id: oauth_settings[provider].client_id,
    client_secret: oauth_settings[provider].client_secret,
    redirect_uri: oauth_settings[provider].redirect_uri,
    grant_type: 'authorization_code',
  };

  var request_url = url.parse(oauth_settings[provider].token_url);
  var request = https_request({
    hostname: request_url.hostname,
    path: request_url.path + "?" + querystring.stringify(post_params),
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, function(response_data) {
    var response_object;
    try {
      response_object = JSON.parse(response_data);
    } catch (err) {
      // Facebook
      response_object = querystring.parse(response_data, true);
    }

    if (response_object["error"]) {
      var locals = { error: response_object["error"], oauth_url: auth_url(provider) };
      res.render('error.jade', locals);
      return;
    }

    req.session['authentication'][provider] = response_object;
    res.redirect('/');
  });

  request.on('error', function(e) { console.log("problems", e); });
  request.write(querystring.stringify(post_params));
  request.end();
});

var server = app.listen(process.env.PORT || 3000);
