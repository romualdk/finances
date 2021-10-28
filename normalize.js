const fs = require('fs')
const iconv = require('iconv-lite')

const encoding = 'cp1250'
const newLine = '\n'
const delimter = ';'
const quoteMark = '"'
const header = '#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;'

const verbose = true

var txt = fs.readFileSync(0)
txt = iconv.decode(txt, encoding)

var lines = txt.split(newLine)

let foundHeader = false
let columns = header.split(delimter).filter(v => v.length > 0)
let transactions = []

let headerLine = 0
let dataStartLine = 0
let dataEndLine = 0

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].replace(/\s+/g, ' ').trim()

  if (!foundHeader && line.includes(header)) {
    foundHeader = true
    headerLine = i + 1
    dataStartLine = headerLine + 1
    dataEndLine = dataStartLine
  } else if (foundHeader && line.length > 0) {
    dataEndLine += 1
    transactions.push(processTransaction(line, i))
  }
}

if (verbose && !foundHeader) {
  console.log(`ERROR: Transactions header not found`)
}

if (verbose) {
  console.log(`Header line: ${headerLine}`)
  console.log(`Data start line: ${dataStartLine}`)
  console.log(`Data end line: ${dataEndLine}`)
  console.log(`Data lines: ${dataEndLine - dataStartLine}`)
  console.log(`Transactions: ${transactions.length}`)
}

function processTransaction (line, lineNumber) {
  let string = replaceDelimiterInsideQuotes(line)
  let row = string.split(delimter).slice(0, columns.length)

  row = row.map(e => e.replace(new RegExp(quoteMark, 'g'), '').trim())

  if (verbose && row.length !== columns.length) {
    console.log(`WARNING: Incorrect number of columns on line ${lineNumber}: `)
  }

  return row
}

function replaceDelimiterInsideQuotes (string) {
  let quotesRegExp = new RegExp('/"[^"]+"/g')
  let delimRegExp = new RegExp('/;/g')
  let replacement = ','

  return string.replace(quotesRegExp, function (v) {
    return v.replace(delimRegExp, replacement)
  })
}

console.log(transactions)
