const charset = require('superagent-charset')
const superagent= require('superagent')
const request = charset(superagent)
const cheerio = require('cheerio')
const _ = require('loadsh')
const q = require('q')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
// const json = require('./dogs.json')


async function getData() {
  const baseUrl = `https://www.xzw.com/fortune`
  const res = await request(`https://www.xzw.com/fortune/`).charset('utf-8')
  const $ = cheerio.load(res.text)
  // console.log(res);
  const list = _.map($('.alb .al'), (item, i) => {
    return {
      mainImg: baseUrl + $(item).find('dt img').attr('src'),
      detailUrl: baseUrl + $(item).find('dt a').attr('href'),
      name: $(item).find('dd strong').text(),
      date: $(item).find('dd small').text(),
    }
  })
  fs.writeFileSync(path.resolve('./xingzuo.json'), JSON.stringify(list))
  console.log(list);


  const requestList = _.map(list, item => {
    return request(item.detailUrl).charset('utf-8')
  })
  const resList = await q.all(requestList)
  const details = _.map(resList, res => {
    const $ = cheerio.load(res.text)
    return {

    }
  })
}

getData()
