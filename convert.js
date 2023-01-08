const fs = require('fs')
const { readCsvMBank } = require('./src/readCsvMBank')
const { getKeywords, matchKeyword } = require('./src/keywords')
const { getAccounts, matchAccount } = require('./src/accounts')

const now = new Date()
const currentDate = now.toISOString().split('T')[0]

const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 <command> [options]')
  .command('gnucash', 'Convert bank transactions csv file to GnuCash csv file')
  .example('$0 gnucash -f lista_operacji.csv', 'Convert using example files')
  // Input file
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'Input file')
  .demandOption(['f'])
  // Directory
  .alias('d', 'dir')
  .nargs('d', 2)
  .describe('d', 'Directory')
  // Output file
  .alias('o', 'output')
  .nargs('o', 3)
  .describe('o', 'Output file')
  // Keywords file
  .alias('k', 'keywords')
  .nargs('k', 4)
  .describe('k', 'Keywords file')
  // Accounts file
  .alias('a', 'accounts')
  .nargs('a', 5)
  .describe('a', 'Accounts csv exported from GnuCash')
  // Defaults
  .default({
    d: 'data',
    o: 'gnucash-' + currentDate + '.csv',
    k: 'keywords.txt',
    a: 'accounts.csv'
  })
  .help('h')
  .alias('h', 'help')
  .argv

const PATH_KEYWORDS = argv.dir + '/' + argv.keywords
const PATH_ACCOUNTS = argv.dir + '/' + argv.accounts

let keywords = getKeywords(PATH_KEYWORDS)
let accounts = getAccounts(PATH_ACCOUNTS)

let inputPath = argv.dir + '/' + argv.file
let data = readCsvMBank(inputPath)

data.map(el => {
  el.fromAccount = el.account.length > 0 ? matchAccount(el.account, accounts) : ''
  el.toAccount = el.transfer.length > 0 ? matchAccount(el.transfer, accounts) : ''

  let keyword = matchKeyword(el.title, keywords)

  if (keyword) {
    el.keyword = keyword.keyword
    el.category = keyword.category
  } else {
    el.keyword = ''
  }

  if (el.toAccount.length === 0) {
    el.toAccount = matchAccount(el.category, accounts)
  }

  if (el.toAccount.length === 0 && el.type === 'INCOME') {
    el.toAccount = matchAccount('Przychód inny', accounts)
  }

  if (el.toAccount.length === 0 && el.type === 'EXPENSE') {
    el.toAccount = matchAccount('Inne', accounts)
  }

  if (el.fromAccount === el.toAccount) {
    el.category = 'BILANS'
  }
})

data = data.filter(el => el.fromAccount !== el.toAccount)

// let todo = data.filter(el => el.toAccount.length === 0 || (el.income === 0 && el.expense === 0))

function toGnuCashCsv (data) {
  let result = []

  result.push([
    'Type',
    'Date',
    'Account Name',
    'Description',
    'Full Category Path',
    'Deposit',
    'Withdrawal'
  ])

  for (let i in data) {
    result.push([
      data[i].type,
      data[i].date,
      data[i].fromAccount,
      data[i].keyword.length > 0 ? data[i].keyword : data[i].category,
      data[i].toAccount,
      data[i].income,
      data[i].expense
    ])
  }

  result = result.map(el => {
    return '"' + el.join('","') + '"'
  })

  result = result.join('\n')

  return result
}

const outputPath = argv.dir + '/' + argv.output

var gnucash = toGnuCashCsv(data)
fs.writeFile(outputPath, gnucash, 'utf8', (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('Converted file: ' + outputPath)
  }
})
