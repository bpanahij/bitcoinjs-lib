/// Implements Bitcoin's feature for signing arbitrary messages.
var Address = require('./address')
var BigInteger = require('bigi')
var bufferutils = require('./bufferutils')
var crypto = require('./crypto')
var ecdsa = require('./ecdsa')
var networks = require('./networks')

var Address = require('./address')
var ECPubKey = require('./ecpubkey')

var sec = require('./sec')
var ecparams = sec('secp256k1')

function magicHash(message, network) {
  var magicPrefix = new Buffer(network.magicPrefix)
  var messageBuffer = new Buffer(message)
  var lengthBuffer = new Buffer(bufferutils.varIntSize(messageBuffer.length))
  bufferutils.writeVarInt(lengthBuffer, messageBuffer.length, 0)

  var buffer = Buffer.concat([
    magicPrefix, lengthBuffer, messageBuffer
  ])
  return crypto.hash256(buffer)
}

function sign(key, message, network) {
  network = network || networks.bitcoin

  var hash = magicHash(message, network)
  var signature = key.sign(hash)
  var e = BigInteger.fromBuffer(hash)
  var i = ecdsa.calcPubKeyRecoveryParam(ecparams, e, signature, key.pub.Q)

  return ecdsa.serializeSigCompact(signature, i, key.pub.compressed)
}

// TODO: network could be implied from address
function verify(address, compactSig, message, network) {
  if (typeof address === 'string') {
    address = Address.fromBase58Check(address)
  }

  network = network || networks.bitcoin

  var hash = magicHash(message, network)
  var parsed = ecdsa.parseSigCompact(compactSig)
  var e = BigInteger.fromBuffer(hash)
  var Q = ecdsa.recoverPubKey(ecparams, e, parsed.signature, parsed.i)

  var pubKey = new ECPubKey(Q, parsed.compressed)
  return pubKey.getAddress(address.version).toString() === address.toString()
}

module.exports = {
  magicHash: magicHash,
  sign: sign,
  verify: verify
}
