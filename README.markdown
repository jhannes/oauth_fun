A project to play around with and demonstrate OAuth 2.0 with different
providers using NodeJS and Express.

For now the project supports Google, Linkedin and Facebook.

Developing locally:
-------------------
1. node server.js
2. Visit http://localhost:3000 with a web browser
3. Each of the providers will have a link to create a client id, click these and create clients
4. For Facebook:
   1. Click App > Create on the menu. I have often experienced timeouts here,
      but the app is still created when I refresh the page.
   2. Find the client_id (called App ID) and client_secret (called App secret) under settings
      and copy these into `local.oauth_settings.js`
   3. Add platform Website with URL `http://localhost:3000`
5. For Google:
   1. Click Create Project and enter a name for the project
   2. Click "APIs and auth" and enable "Contacts API"
   3. Click "APIs and auth" > "Credentials" and click "Create new client id"
   4. In "Create Client ID", enter "Authorized JavaScript origins" `http://localhost:3000` 
      and "Authorized redirect URI" `http://localhost:3000/oauth2callback`
   5. Find the client_id and client_secret under "APIs and auth" > "Credentials"
      and copy into `local.oauth_settings.js`
6. For Linkedin
   1. Enter name and contact info as you want. "Oauth 1.0 Accept Redirect URL"
      must be `http://localhost:3000/oauth2callback`
   2. Select to include "Default Scope" `r_emailaddress`
   3. Use API key for client_id and Secret Key for client_secret
   4. Notice the Linkedin often times out the token authentication for non-live applications

Create a file `local.oauth_settings.js` (replace with your own values):

  module.exports = {
    facebook: {
      client_id: '999999999999999',
      client_secret: '1234567890abcdef1234567890abcdef',
    },
    google: {
      client_id: '999999999999-1324567890abcdefghijklmnopqurstu.apps.googleusercontent.com',
      client_secret: 'abcABC1234567890-1234567',
    },
    linkedin: {
      client_id: 'abc123xyz78900',
      client_secret: 'abc123zyxwVUtsrq',
    }
  };
  



Installing and deploying on Heroku:
-----------------------------------

Prerequisites:
* Git
* Node
* Heroku account
* Heroku toolbelt

1. `heroku create` creates a new application
2. `git push heroku master` pushes the master branch to Heroku
3. `heroku open` opens a web looking at the page
4. Create the apps in the providers as above and configure Heroku to use them.
   Be sure to use your Heroku server as the redirect url
   * `heroku config:set FACEBOOK_OAUTH_CLIENT_ID=999999999999999`
   * `heroku config:set FACEBOOK_OAUTH_CLIENT_SECRET=1234567890abcdef1234567890abcdef`
   * `heroku config:set GOOGLE_OAUTH_CLIENT_ID=999999999999-1324567890abcdefghijklmnopqurstu.apps.googleusercontent.com`
   * `heroku config:set GOOGLE_OAUTH_CLIENT_SECRET=abcABC1234567890-1234567`
   * `heroku config:set LINKEDIN_OAUTH_CLIENT_ID=abc123xyz78900`
   * `heroku config:set LINKEDIN_OAUTH_CLIENT_SECRET=abc123zyxwVUtsrq`
5. Refresh the page and you can now authenticate with the different providers
