const fs = require('fs')

const delimeter = ';'

function getAccounts (path) {
  let accounts = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
  accounts = accounts.split('\n')
    .map(el => el.split(delimeter)[1])
    .filter(el => el !== 'full_name' && typeof el !== 'undefined' && el.includes(':'))
    .map(el => el.replace('"', ''))
    .map(el => {
      let arr = el.split(':')
      return arr.pop()
    })

  return accounts
}

function matchAccount (key, accounts) {
  for (let i in accounts) {
    if (accounts[i].includes(key)) {
      return accounts[i]
    }
  }

  return ''
}

module.exports = {
  getAccounts,
  matchAccount
}
