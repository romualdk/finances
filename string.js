const CASE_INSENSITIVE = 1
const ACCENT_INSENSITIVE = 2

function stringNormalize (string, options = ACCENT_INSENSITIVE || CASE_INSENSITIVE) {
  let result = string.trim()

  if (options && ACCENT_INSENSITIVE) {
    result = result.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  }

  if (options && CASE_INSENSITIVE) {
    result = result.toLowerCase()
  }

  return result
}

function stringContains (string, key, options = ACCENT_INSENSITIVE || CASE_INSENSITIVE) {
  let stringNormalized = stringNormalize(string, options)
  let keyNormalized = stringNormalize(key, options)

  return stringNormalized.includes(keyNormalized)
}

module.exports = {
  stringNormalize,
  stringContains
}
