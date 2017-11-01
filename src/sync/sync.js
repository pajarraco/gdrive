const chokidar = require('chokidar');

const watcher = chokidar.watch(sessionStorage.folder, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher
  .on('all', (event, path) => {
    console.log(event, path);
  })
  .on('add', path => {
    append(`File ${path} has been added`);
  })
  .on('change', path => {
    append(`File ${path} has been changed`);
  })
  .on('unlink', path => {
    append(`File ${path} has been removed`);
  })
  .on('addDir', path => {
    append(`Directory ${path} has been added`);
  })
  .on('unlinkDir', path => {
    append(`Directory ${path} has been removed`);
  });

const append = (text) => {
  const divLog = document.getElementById('log');
  const node = document.createElement('P');
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  divLog.appendChild(node);
}

// More possible events.
const log = console.log.bind(console);
watcher
  .on('error', error => log(`Watcher error: ${error}`))
  .on('ready', () => log('Initial scan complete. Ready for changes'))

// 'add', 'addDir' and 'change' events also receive stat() results as second
// argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
watcher.on('change', (path, stats) => {
  if (stats) console.log(`File ${path} changed size to ${stats.size}`);
});