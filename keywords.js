const fs = require('fs')
const { stringContains } = require('./string')

function getKeywords (path) {
  let keywords = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
  keywords = keywords.split('\n\n').map(el => {
    return el.split('\n')
  })

  return keywords
}

function matchKeyword (string, keywords) {
  for (let c in keywords) {
    for (let k in keywords[c]) {
      let key = keywords[c][k]
      if (stringContains(string, key)) {
        return {
          category: keywords[c][0],
          keyword: keywords[c][k]
        }
      }
    }
  }
}

module.exports = {
  getKeywords,
  matchKeyword
}
