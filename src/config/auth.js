const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const BrowserWindow = require('electron').remote.BrowserWindow
const parse = require('url').parse;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('src/config/client_id.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials, callback) => {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = (oauth2Client, callback) => {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });


  // open windows
  let win = new BrowserWindow({
    width: 800,
    height: 600
  });

  const handleNavigation = (url) => {
    console.log(url);
    const query = parse(url, true).query
    if (query) {
      if (query.error) {
        console.log(new Error(`There was an error: ${query.error}`))
      } else if (query.code) {
        // Login is complete
        win.removeAllListeners('closed')
        setImmediate(() => win.close())

        // This is the authorization code we need to request tokens
        console.log(query.code)
        oauth2Client.getToken(query.code, function (err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
          }
          oauth2Client.credentials = token;
          storeToken(token);
          callback(oauth2Client);
        });

      }
    }
  }

  win.on('closed', () => {
    // TODO: Handle this smoothly
    console.log('Auth window was closed by user')
  })

  win.webContents.on('will-navigate', (event, url) => {
    handleNavigation(url)
  })

  win.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
    handleNavigation(newUrl)
  })

  win.loadURL(authUrl)



  // console.log('Authorize this app by visiting this url: ', authUrl);
  // var rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout
  // });

  // rl.question('Enter the code from that page here: ', function (code) {
  //   console.log(code);
  //   rl.close();
  //   oauth2Client.getToken(code, function (err, token) {
  //     if (err) {
  //       console.log('Error while trying to retrieve access token', err);
  //       return;
  //     }
  //     oauth2Client.credentials = token;
  //     storeToken(token);
  //     callback(oauth2Client);
  //   });
  // });
}



/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) console.log(err);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  var service = google.drive('v3');
  service.files.list({
    auth: auth,
    pageSize: 10,
    fields: "nextPageToken, files(id, name)"
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
      }
    }
  });
}