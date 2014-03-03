var fs = require('fs');

if (fs.existsSync('./local.oauth_settings.js')) {
	module.exports = require('./local.oauth_settings');
} else {
  module.exports = {
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI
  };
}

