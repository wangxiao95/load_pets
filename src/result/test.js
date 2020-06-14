const dogs = require('../dogs.json')
let count = 0
dogs.map(item => {
  count++
  item.detail.imgs.map(img => {
    count++
  })
})
console.log(count);