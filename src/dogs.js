const charset = require('superagent-charset')
const superagent= require('superagent')
const request = charset(superagent)
const cheerio = require('cheerio')
const _ = require('loadsh')
const q = require('q')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const json = require('./dogs.json')



const getDogs = async function () {
  if (json) {
    // json.map((k,i) => {
    //   console.log('c', i);
    // })
    saveImgs(json)
    return json
  }
  let dogs = []

  const requests = _.map([...new Array(4)], (item, i) => {
    return request(`https://www.ixiupet.com/mmpz/list_9_${i + 1}.html`).charset('gbk')
  })
  try {
    const resList = await q.all(requests)
    console.log('一级数据success')

    // 所有狗的数据
    dogs = await formatData(resList)
    console.log('data success')
    fs.writeFileSync(path.resolve('./src/cats.json'), JSON.stringify(dogs))
    saveImgs(dogs)
    return dogs
  } catch (e) {
    // console.log(e)
    return []
  }

}


async function formatData(list) {
  let dogs = []
  // _.forEach(list, res => {
  //   let $ = cheerio.load(res.text)
  //   _.forEach($('.tiyan-bd-sml ul li'), async item => {
  //     const detailLink = $(item).find('.tiyan-smll-li').attr('href')
  //     const detail = await getDetail(detailLink)
  //     dogs.push({
  //       name: $(item).find('.tiyan-smll-det a').text(),
  //       detailLink,
  //       mainImg: $(item).find('img').attr('src'),
  //       detail,
  //     })
  //   })
  // })
  const doms = _.map(list, res => {
    return cheerio.load(res.text)
  })
  const details = []
  for(let i = 0; i < doms.length; i++) {
    let $ = doms[i]
    for (let j = 0; j < $('.tiyan-bd-sml ul li').length; j++) {
      let item = $('.tiyan-bd-sml ul li')[j]
      const detailLink = $(item).find('.tiyan-smll-li').attr('href')
      details.push(await getDetail(detailLink, $(item).find('.tiyan-smll-li').next('.tiyan-smll-det').find('a').text(), $('.tiyan-bd-sml ul li').length + '/' + i + '/' + doms.length))
    }
  }
  _.forEach(doms, ($, i) => {
    _.forEach($('.tiyan-bd-sml ul li'), item => {
      const detailLink = $(item).find('.tiyan-smll-li').attr('href')
      // const detail = details[i]
      dogs.push({
        name: $(item).find('.tiyan-smll-det a').text(),
        detailLink,
        mainImg: $(item).find('img').attr('src'),
        detail: _.find(details, item => item.link === detailLink),
      })
    })
  })
  return dogs
}

async function getDetail(link, name, index) {
  console.log(link, name, 'loading');
  const data = await request(link).charset('gbk')
  console.log(link, name, 'success', index);
  let $ = cheerio.load(data.text)
  const detail = {
    link,
    name: $('.con1text .c1text1 h1').text(),
    imgs: _.map($('ul.scrollPic li a.fancybox img'), item => {
      return $(item).attr('src')
    }),
    price: $('.con1text .c1text2 strong').text(),
    attr: _.map($('.con1text .c1text3 li'), item => {
      return {
        label: _.trim($(item).children()[0].prev.data.replace('：', '')),
        value: $(item).find('a').text(),
      }
    }),
    evaluate: _.map($('.con1text .c1text4 .pingjialist li'), item => {
      return {
        label: _.trim($(item).find('.revtit').text()),
        value: $(item).find('.revinp').attr('class').replace('revinp start', '')
      }
    }),
    content: _.map([...new Array(6)], (item, index) => {
      const title = $($('.con2 .con2list').children('li')[index]).find('a').text()
      const content = {
        title: $($('.con2 .con2neirong').children('.neirong')[index]).find('.neirongs .quanjieshao1 h4').text(),
        word: $($('.con2 .con2neirong').children('.neirong')[index]).find('.neirongs .quanjieshao1 .word').html(),
      }

      return {
        title,
        content,
      }
    })
  }
  return detail
}

function saveImgs(list) {
  // if (list instanceof Array === false) {
  //   list = [list]
  // }
  _.forEach(list, (item, k) => {
    saveFile({
      url: item.mainImg,
      dirName: item.name,
      isMain: true,
      k
    })
    // _.delay(() => {
    //   _.forEach(item.detail.imgs, (img, i) => {
    //     saveFile({
    //       url: img,
    //       dirName: item.name,
    //       isMain: false,
    //       index: i,
    //       k
    //     })
    //   })
    // }, 2000)
  })

}
let u = 1
let errList = []
let all = []

async function saveFile(imgObj) {
  all.push(imgObj)
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
  var writeStream = await fs.createWriteStream(resultPath)
  var readStream = request(url)
  await readStream.pipe(writeStream);
  console.log('成功', k)
  readStream.on('end', function() {
    // console.log(dirName, '文件下载成功');
  });
  readStream.on('error', function(err) {
    console.log(dirName, "失败错误信息:" + err)
    // TODO 失败后加入重试队列，重新下载
    errList.push(imgObj)
    fs.writeFileSync(path.resolve('./src/err.json'), JSON.stringify(errList))
  })
  writeStream.on("finish", function(res) {
    console.log(dirName, "文件写入成功", u++);
    _.remove(all, item => item.url === url)
    fs.writeFileSync(path.resolve('./src/pending.json'), JSON.stringify(all))
    console.log(all.length);
    writeStream.end();
  });
}

module.exports = {
  getDogs
}