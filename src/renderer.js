const fs = require('fs');

fs.readFile('./config.json', 'utf8', (err, data) => {
  if (err || !data) document.location.replace('./config/config.html');
  else {
    const json = JSON.parse(data)
    sessionStorage.setItem('folder', json.folder);
    document.location.replace('./sync/sync.html');
  }
});