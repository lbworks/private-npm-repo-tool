// Copyright 2021 baiziyu
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');

const fs = require('fs');
const uuid = require('uuid');
const rimraf = require('rimraf');
const exec = require('child_process').exec;

const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const moment = require('moment');

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname));

app.get('/', (req, res, next) => {
  res.render('index', {});
});

app.get('/api/projects', (req, res, next) => {
  let projects = fs.readdirSync(__dirname + '/resources/projects');
  projects = projects.filter(item => item !== '.DS_Store');
  res.json({
    projects
  });
});

app.get('/api/projects/:project', (req, res, next) => {
  const projectPath = __dirname + `/resources/projects/${req.params.project}`;
  const packageJsonFilePath = __dirname + `/resources/projects/${req.params.project}/package.json`;
  const packageLockJsonFilePath = __dirname + `/resources/projects/${req.params.project}/package-lock.json`;
  if (!fs.existsSync(projectPath)) {
    res.status(404).json({
      msg: 'no such project.'
    });
  } else {
    if (!fs.existsSync(packageJsonFilePath)) {
      fs.writeFileSync(packageJsonFilePath, '');
    }
    if (!fs.existsSync(packageLockJsonFilePath)) {
      fs.writeFileSync(packageLockJsonFilePath, '');
    }
    let packagejson = fs.readFileSync(packageJsonFilePath, 'utf-8');
    let packagelockjson = fs.readFileSync(packageLockJsonFilePath, 'utf-8');
    res.json({
      packagejson: packagejson,
      packagelockjson: packagelockjson
    });
  }
});

app.post('/api/projects/:project', (req, res, next) => {
  const dirPath = __dirname + `/resources/projects/${req.params.project}`;
  const packageJsonFilePath = `${dirPath}/package.json`;
  const packageLockJsonFilePath = `${dirPath}/package-lock.json`;
  if (!fs.existsSync(packageJsonFilePath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  let packagejson = req.body.packagejson;
  let packagelockjson = req.body.packagelockjson;
  fs.writeFileSync(packageJsonFilePath, packagejson);
  fs.writeFileSync(packageLockJsonFilePath, packagelockjson);
  res.json({});
});

app.delete('/api/projects/:project', (req, res, next) => {
  const dirPath = __dirname + `/resources/projects/${req.params.project}`;
  if (!fs.existsSync(dirPath)) {
    res.status(404).json({
      msg: 'no such file.'
    });
  } else {
    rimraf.sync(dirPath);
    res.json({});
  }
});

app.post('/api/start_tasks', (req, res, next) => {
  let id = uuid.v4();
  let projects = req.body.projects;
  setTimeout(() => {
    fs.writeFileSync(__dirname + `/resources/tasks/${id}.log`, '');
    startTasks(id, projects);
  }, 0);
  res.json({
    id: id
  });
});

app.post('/api/all_tasks', (req, res, next) => {
  let id = uuid.v4();
  setTimeout(() => {
    fs.writeFileSync(__dirname + `/resources/tasks/${id}.log`, '');
    startAllTasks(id);
  }, 0);
  res.json({
    id: id
  });
});

app.get('/api/tasks/:id', (req, res, next) => {
  const logPath = __dirname + `/resources/tasks/${req.params.id}.log`;
  if (!fs.existsSync(logPath)) {
    res.status(404).json({
      msg: 'no such task.'
    });
  } else {
    let content = fs.readFileSync(logPath, 'utf-8');
    res.json({
      content: content
    });
  }
});

app.post('/api/genStorageTarball', async (req, res, next) => {
  const conn = await ssh.connect({
    host: process.env.VERDACCIO_SERVER_HOSTNAME,
    username: process.env.VERDACCIO_SERVER_USERNAME,
    password: process.env.VERDACCIO_SERVER_PASSWORD
  });
  let date = moment().local().format('YYYYMMDD-HHmmss');
  let filename = `storage-${date}.tar`;
  await ssh.execCommand(`cd /var/lib/verdaccio && tar -cvf /root/${filename} ./storage`);
  await ssh.getFile(__dirname + `/public/files/${filename}`, `/root/${filename}`);
  await ssh.execCommand(`rm -f /root/${filename}`);
  res.json({});
});

app.get('/api/listStorageTarball', (req, res, next) => {
  let files = fs.readdirSync(__dirname + '/public/files/');
  files = files.filter(item => item.endsWith('.tar'));
  res.json({
    files
  });
});

function startTasks(id, projects) {
  exec(`nohup ./scripts/start_tasks.sh http://${process.env.VERDACCIO_SERVER_HOSTNAME}:${process.env.VERDACCIO_PORT} ${projects.join(' ')} > ./resources/tasks/${id}.log &`);
}

function startAllTasks(id) {
  exec(`nohup ./scripts/start_all_tasks.sh http://${process.env.VERDACCIO_SERVER_HOSTNAME}:${process.env.VERDACCIO_PORT} > ./resources/tasks/${id}.log &`);
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
