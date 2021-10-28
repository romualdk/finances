const iconv = require('iconv-lite')

/* Decode from Windows-1250 to UTF-8 */
function decode (csv) {
  return iconv.decode(csv, 'windows-1250')
}

/* Get CSV options from UTF-8 encoded string  */
function options (csv) {
  let options = {
    encoding: 'utf8',
    delimiter: ';',
    escape: '"',
    from_line: 0,
    relax_column_count: true,
    skip_empty_lines: true,
    columns: [
      'date',
      'description',
      'account',
      'category',
      'value'
    ]
  }

  let lines = csv.split('\n')

  if (lines.length === 0 || !lines[0].includes('mBank S.A.')) {
    return false
  }

  let i = 1
  while (options.from_line === 0 && i < lines.length) {
    if (lines[i].includes('#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota')) {
      options.from_line = i + 2
    }
    i++
  }

  return options
}

function normalizeDescription (description) {
  let result = description.trim()
  result = result.replace(/\s{2,}/g, ';')
  result = result.replace(/\s\s+/g, ' ')
  return result
}

function normalizeValue (value) {
  return value.replace(' ', '').replace('PLN', '').trim().replace(',', '.') * 1
}

function normalize (transactions) {
  // Normalize description and value fields
  let result = transactions.map(el => {
    el.description = normalizeDescription(el.description)
    el.value = normalizeValue(el.value)
    return el
  })

  // Sort by date ascending
  result = result.sort((a, b) => {
    let date1 = new Date(a.date)
    let date2 = new Date(b.date)

    return date1 > date2 ? 1 : -1
  })

  return result
}

module.exports = {
  decode: decode,
  options: options,
  normalize: normalize
}
