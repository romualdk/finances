const assert = require('assert').strict

const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const mbank = require('../src/csv-mbank')

const path = '../test/csv-mbank.csv'

let csv = mbank.decode(fs.readFileSync(path))
let options = mbank.options(csv)

assert.equal(options.encoding, 'utf8', 'Encoding is UTF-8')
assert.equal(options.delimiter, ';', 'Delimiter is ;')
assert.equal(options.escape, '"', 'Escape character is "')
assert.equal(options.from_line, 27, 'First line with data is 27 (numbering starts with 1)')
assert.equal(options.relax_column_count, true, 'Relax column count enabled')
assert.equal(options.skip_empty_lines, true, 'Skip empty lines enabled')
assert.deepEqual(options.columns, [ 'date', 'description', 'account', 'category', 'value' ], 'Columns set to: date, description, account, category, value')

let transactions = parse(csv, options)

assert.equal(transactions.length, 79, '79 transactions in raw array')
assert.equal(transactions[0].date, '2020-09-30', 'First transaction date is 2020-09-30 in raw array')
assert.equal(transactions[78].date, '2020-09-01', 'Last transaction date is 2020-09-01 in raw array')

let normalized = mbank.normalize(transactions)

assert.equal(normalized.length, 79, '79 transactions in normalized array')
assert.equal(normalized[0].date, '2020-09-01', 'Earliest transaction date is 2020-09-01')
assert.equal(normalized[78].date, '2020-09-30', 'Latest transaction date is 2020-09-30')

assert.equal(normalized[0].description, 'JMP S.A. BIEDRONKA;ZAKUP PRZY UŻYCIU KARTY W KRAJU', 'Earliest transaction description is JMP S.A. BIEDRONKA;ZAKUP PRZY UŻYCIU KARTY W KRAJU')
assert.equal(normalized[0].account, 'mKonto 6011 ... 2216', 'Earliest transaction account is mKonto 6011 ... 2216')
assert.equal(normalized[0].category, 'Żywność i chemia domowa', 'Earliest transaction category is Żywność i chemia domowa')
assert.equal(normalized[0].value, -18.17, 'Earliest transaction value is -18.17')

assert.equal(normalized[78].description, 'ZWROT ZA NETFILX;PRZELEW ZEWNĘTRZNY PRZYCHODZĄCY;50102055581111167869999928', 'Earliest transaction description is ZWROT ZA NETFILX;PRZELEW ZEWNĘTRZNY PRZYCHODZĄCY;50102055581111167869999928')
assert.equal(normalized[78].account, 'mKonto 6011 ... 2216', 'Earliest transaction account is mKonto 6011 ... 2216')
assert.equal(normalized[78].category, 'Wpływy - inne', 'Earliest transaction category is Wpływy - inne')
assert.equal(normalized[78].value, 21.5, 'Earliest transaction value is 21.5')

function sumValue (accumulator, transaction) {
  return accumulator + transaction.value
}

function isExpense (transaction) {
  return transaction.value < 0
}

function isIncome (transaction) {
  return transaction.value > 0
}

function formatValue (value, locale = 'pl-PL') {
  return new Intl.NumberFormat(locale).format(value)
}

function roundMoney (value, decilams = 2) {
  let factor = 10 ** decilams
  let sign = value < 0 ? -1 : 1
  return Math.round(value * factor) / factor * sign
}

let income = roundMoney(normalized.filter(isIncome).reduce(sumValue, 0))
let expense = roundMoney(normalized.filter(isExpense).reduce(sumValue, 0))

assert.equal(income, 21410.29, 'Total income is 21 410.29')
assert.equal(expense, 21607.52, 'Total expense is 21 607.52')

console.log('Incomes: ' + formatValue(income))
console.log('Expenses: ' + formatValue(expense))
