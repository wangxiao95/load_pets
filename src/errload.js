const charset = require('superagent-charset')
const superagent= require('superagent')
const request = charset(superagent)
const cheerio = require('cheerio')
const _ = require('loadsh')
const q = require('q')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const json = require('./err.json')
const pending = require('./pending.json')

let count = 1

function saveFile(imgObj) {
  const { url, dirName, isMain, index, k } = imgObj
  const dir = dirName.replace('|', '_')
  const basePath = path.resolve(`./images/dogs/${dir}`)
  const isDir = fs.existsSync(basePath)
  if (!isDir) {
    fs.mkdirSync(basePath)
  }
  const resultPath = basePath + (isMain ? `/main.jpg` : `/${index}.jpg`)
  // axios({
  //   method: 'get',
  //   url: url,
  //   responseType: 'stream',
  //   // headers
  // }).then(function(response) {
  //
  //   response.data.pipe(fs.createWriteStream(resultPath))
  //   console.log(resultPath, 'success');
  // }, err => {
  //   console.log(err);
  // })
  console.log(dirName, 'loading')
  var writeStream = fs.createWriteStream(resultPath)
  var readStream = request(url)
  readStream.pipe(writeStream);
  readStream.on('end', function() {
    console.log(dirName, '文件下载成功');
  });
  readStream.on('error', function(err) {
    console.log(dirName, "失败错误信息:" + err)
    // TODO 失败后加入重试队列，重新下载
    errList.push(imgObj)
    fs.writeFileSync(path.resolve('./src/err.json'), JSON.stringify(errList))
  })
  writeStream.on("finish", function() {
    console.log(dirName, "文件写入成功", count++);
    writeStream.end();
  });
}

const arr = json.concat(pending)
console.log(arr.length);
_.forEach(arr, item => {
  saveFile(item)
})

