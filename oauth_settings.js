var fs = require('fs');

if (fs.existsSync('./local.oauth_settings.js')) {
	module.exports = require('./local.oauth_settings');
}


var defaults = {};

defaults.facebook = {
  name: 'Facebook',
  client_id: process.env.FACEBOOK_OAUTH_CLIENT_ID,
  client_secret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
  redirect_uri: process.env.FACEBOOK_OAUTH_REDIRECT_URI,
  scope: 'email',
  auth_url: 'https://www.facebook.com/dialog/oauth',
  token_url: "https://graph.facebook.com/oauth/access_token",
  profile_url: function(access_token) {
    return "https://graph.facebook.com/me?access_token=" + access_token;
  },
  get_profile: function(response_object) {
    return response_object.name + " <" + response_object.email + ">";
  }
};


defaults.google = {
  name: 'Google',
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
  scope: 'profile email',
  auth_url: "https://accounts.google.com/o/oauth2/auth",
  token_url: "https://accounts.google.com/o/oauth2/token",
  profile_url: function(access_token) {
    return "https://www.googleapis.com/plus/v1/people/me?access_token=" + access_token;
  },
  get_profile: function(response_object) {
    return response_object.displayName + " <" + response_object.emails[0].value + ">";
  }
};

defaults.linkedin = {
  name: 'LinkedIn',
  client_id: process.env.LINKEDIN_OAUTH_CLIENT_ID,
  client_secret: process.env.LINKEDIN_OAUTH_CLIENT_SECRET,
  redirect_uri: process.env.LINKEDIN_OAUTH_REDIRECT_URI,
  scope: 'r_basicprofile r_emailaddress',
  auth_url: "https://www.linkedin.com/uas/oauth2/authorization",
  token_url: 'https://www.linkedin.com/uas/oauth2/accessToken',
  profile_url: function(access_token) {
    return "https://api.linkedin.com/v1/people/~:(formatted-name,first-name,last-name,email-address)?format=json&oauth2_access_token=" + access_token;
  },
  get_profile: function(response_object) {
    return response_object.formattedName + " <" + response_object.emailAddress + ">";
  }
};

for (var provider in defaults) {
  for (var key in defaults[provider]) {
    module.exports[provider][key] = module.exports[provider][key] || defaults[provider][key];
  }
}
