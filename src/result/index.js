const dogs = require('../dogs.json')
const cats = require('../cats.json')
const Koa = require('koa2')
const _ = require('loadsh')
const fs = require('fs')
const path = require('path')


const app = new Koa()

// app.use(ctx => {
//   ctx.body = format(dogs.slice(0, 1))
// })
//
// app.listen(3000)


function format(list) {
  return _.map(list, (item, id) => {
    const imgs = _.map(item.detail.imgs, (img, imgIndex) => {
      return `${item.name.replace('|', '_')}_${imgIndex}.jpg`
    })
    const attr = _.map(item.detail.attr, at => {
      return {
        label: at.label.replace(/\s/g, '').replace('：', ''),
        value: at.value
      }
    })
    const evaluate = _.map(item.detail.evaluate, at => {
      return {
        label: at.label.replace(/\s/g, '').replace('：', ''),
        value: getStar(at.value)
      }
    })
    const content = _.map(item.detail.content, c => {
      return {
        title: c.title,
        content: {
          title: c.content.title,
          word: c.content.word.replace(/(<\/?a.*?>)/g, '')
        }
      }
    })
    const detail = {
      imgs, attr, evaluate, content
    }
    return _.assign(item, {
      mainId: `dog_${id + 1}`,
      mainImg: `${item.name.replace('|', '_')}_main.jpg`,
      detailId: `dog_${id + 1}`,
      detail: _.assign(item.detail, {
        id: `dog_${id + 1}`,
        ...detail
      })
    })
  })
}

//obj.replace(/\s/g,"");

function getStar(str) {
  switch (str) {
    case '非常友善':
      return '5'
    case '一般友善':
      return '3'
    case '不友善':
      return '1'
    case '':
      return '0'
    case '掉毛多':
      return '5'
    case '掉毛少':
      return '3'
    case '不掉毛':
      return '1'
    default:
      return str
  }
}

console.log('dogs formatting')
const d = format(dogs)
console.log('dogs writing')
fs.writeFileSync(path.resolve('./src/result/dogs.json'), JSON.stringify(d))
console.log('cats formatting')
const c = format(cats)
console.log('cats writing')
fs.writeFileSync(path.resolve('./src/result/cats.json'), JSON.stringify(c))
