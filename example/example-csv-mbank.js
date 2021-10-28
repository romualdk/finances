const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const mbank = require('../src/csv-mbank')

const path = '../test/csv-mbank.csv'

let csv = mbank.decode(fs.readFileSync(path))
let options = mbank.options(csv)

let result = parse(csv, options)

console.log(options)
console.log(result)
