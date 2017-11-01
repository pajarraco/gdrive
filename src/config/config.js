const fs = require('fs');

const folder = document.getElementById('folder');
const btnSave = document.getElementById('btn-save');
const ctrl = document.getElementById('ctrl');

ctrl.onchange = ((event) => {
  folder.value = ctrl.files[0].path;
})

btnSave.onclick = ((event) => {
  const config = {
    folder: folder.value
  }
  fs.writeFile('./config.json', JSON.stringify(config), (err) => {
    if (err) window.alert(err);
    else {
      console.log('ok');
      document.location.replace('sync.html')
    }
  });

});