var assert = require('assert')
var Crypto = require('crypto-js')
var WordArray = Crypto.lib.WordArray

function bytesToWords(bytes) {
  assert(Array.isArray(bytes) || Buffer.isBuffer(bytes), 'Input must be a byte array')
  var words = []
  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
    words[b >>> 5] |= bytes[i] << (24 - b % 32)
  }
  return words
}

function wordsToBytes(words) {
  var bytes = []
  for (var b = 0; b < words.length * 32; b += 8) {
    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF)
  }
  return bytes
}

function bytesToWordArray(bytes) {
  return new WordArray.init(bytesToWords(bytes), bytes.length)
}

function wordArrayToBytes(wordArray) {
  return wordsToBytes(wordArray.words)
}

function reverseEndian(hex) {
  var buffer = new Buffer(hex, 'hex')
  Array.prototype.reverse.call(buffer)

  return buffer.toString('hex')
}

module.exports = {
  bytesToWords: bytesToWords,
  wordsToBytes: wordsToBytes,
  bytesToWordArray: bytesToWordArray,
  wordArrayToBytes: wordArrayToBytes,
  reverseEndian: reverseEndian
}
