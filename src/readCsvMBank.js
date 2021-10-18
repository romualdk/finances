const fs = require('fs')
const iconv = require('iconv-lite')

function fixEncodingMBank (string) {
  const from = ['\x9C', '\x8C']
  const to = ['ś', 'Ś']

  let result = string

  for (let i in from) {
    result = result.split(from[i]).join(to[i])
  }

  return result
}

function extractAccountNumber (string) {
  let shortNumber = string.match(/([0-9]{4} \.{3} [0-9]{4})/g)
  if (shortNumber) {
    return shortNumber[0]
  }

  let longNumber = string.match(/\d{26}/)
  if (longNumber) {
    return longNumber[0].substring(0, 4) + ' ... ' + longNumber[0].substring(22, 26)
  }
}

function replaceDelimiterInsideQuotes (string) {
  return string.replace(/"[^"]+"/g, function (v) {
    return v.replace(/;/g, ',')
  })
}

function convertCsvMBank (csv) {
  const delimeter = ';'
  const headerLine = 26
  const dateIndex = 0
  const titleIndex = 1
  const accountIndex = 2
  const categoryIndex = 3
  const valueIndex = 4

  csv = replaceDelimiterInsideQuotes(csv)
  let lines = csv.split('\n').splice(headerLine + 1)
  let data = lines.map((ln) => ln.trim().split(delimeter))

  data = data.filter(el => el.length > 1).map(el => {
    const date = el[dateIndex]
    const account = extractAccountNumber(el[accountIndex])
    const transfer = extractAccountNumber(el[titleIndex]) || ''
    const title = fixEncodingMBank(el[titleIndex].replace(/\s+/g, ' ').replace('"', '').substring(0, 250)).replace('"', '').trim()
    const category = fixEncodingMBank(el[categoryIndex].replace('"', '').replace('"', ''))
    const value = el[valueIndex].replace(' ', '').replace('PLN', '').trim().replace(',', '.')

    return {
      type: value > 0 ? 'INCOME' : 'EXPENSE',
      date: date,
      account: account,
      transfer: transfer,
      category: category,
      title: title,
      income: value > 0 ? Math.abs(value) : 0,
      expense: value < 0 ? Math.abs(value) : 0,
      value: value * 1
    }
  })

  return data
}

function readCsvMBank (path) {
  let csv = fs.readFileSync(path, { encoding: null, flag: 'r' })
  csv = iconv.decode(Buffer.from(csv), 'ISO-8859-2')
  return convertCsvMBank(csv)
}

module.exports = {
  readCsvMBank
}
