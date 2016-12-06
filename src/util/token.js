const sodium = require('chloride')
const crypto = require('crypto') // sodium doesn't have HMAC
const base64url = require('base64url')

const TOKEN_HMAC_INPUT = 'token'

// use ECDH and HMAC to get the channel's token
module.exports = {

  publicKey: (seed) => {
    // seed should be a base64url string
    const seedBuffer = base64url.toBuffer(seed)

    return base64url(sodium.crypto_scalarmult_base(
      sodium.crypto_hash_sha256(seedBuffer)
    ))
  },
  
  token: (seed, publicKey) => {
    // seed and public key should be stored as base64url strings
    const seedBuffer = base64url.toBuffer(seed)
    const publicKeyBuffer = base64url.toBuffer(publicKey)

    const sharedSecretBuffer = sodium.crypto_scalarmult(
      sodium.crypto_hash_sha256(seedBuffer),
      publicKeyBuffer
    )

    // token is created by feeding the string 'token' into
    // an HMAC, using the shared secret as the key.
    return base64url(
      crypto.createHmac('sha256', sharedSecretBuffer)
        .update(TOKEN_HMAC_INPUT, 'ascii')
        .digest()
    )
  }
}