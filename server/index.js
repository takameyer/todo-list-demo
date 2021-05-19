const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const getMostRecentFile = (dir) => {
  const files = orderRecentFiles(dir);
  return files.length ? files[0] : undefined;
};

const orderRecentFiles = (dir) => {
  return fs
    .readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
    .map((file) => ({file, mtime: fs.lstatSync(path.join(dir, file)).mtime}))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};

app.use(bodyParser.json());

app.get('/sync', (req, res, next) => {
  console.log('get /sync request received: ', req.query);
  if (req.query.updatedAt == null || parseInt(req.query.updatedAt) == NaN) {
    throw new Error('please set updatedAt param to valid timestamp');
  } else if (!fs.existsSync('./tmp')) {
    // No data has been synced yet
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({data: '', isNewer: false}));
  } else {
    const lastUpdatedAt = req.query.updatedAt;
    const dataPath = getMostRecentFile('./tmp');
    // We are assuming the filename is the timestamp for when it was last updated
    const lastSync = parseInt(dataPath.file);
    const isNewer = lastSync > lastUpdatedAt;
    if (isNewer) {
      fs.readFile(`./tmp/${dataPath.file}`, 'utf8', function (err, data) {
        if (err) {
          next(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({data, isNewer}));
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify({data: '', isNewer}));
    }
  }
});

app.post('/sync', (req, res, next) => {
  console.log('post /sync request received: ', req.body);
  if (req.body != null && req.body.data != null && req.body.updatedAt != null) {
    if (!fs.existsSync('./tmp')) {
      fs.mkdirSync('./tmp');
    }
    fs.writeFile(
      `./tmp/${req.body.updatedAt}`,
      req.body.data,
      'utf8',
      function (err, data) {
        if (err) {
          next(err);
        }
        res.status(200).send('SUCCESS');
      },
    );
  } else {
    throw new Error('body must contain {data, updatedAt}');
  }
});

app.listen(port, () => {
  console.log(`Sync server is listening at http://localhost:${port}`);
});
