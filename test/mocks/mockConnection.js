'use strict'
const EventEmitter = require('events')
const log = require('debug')('connection')

class MockConnection extends EventEmitter {

  constructor (config) {
    super()

    this.config = config
    this.name = config.other.name
    this.token = config.token
    this.channels = config.other.channels
    this.connected = false

    this.client = null
    this._listener = (channel, data) => {
      if (!this.connected) return
      this._log('received on ' + this.isNoob)
      // don't let errors in the handler affect the connection
      try {
        this.emit('receive', JSON.parse(data))
      } catch (err) {
        this._log(err)
      }
    }

    this.isNoob = (this.name !== 'nerd')

    this._log('listening on channel ' + (this.isNoob ? 'noob': 'nerd'))
    this.recvChannel = this.channels[(this.isNoob ? 'noob' : 'nerd')]
    this.sendChannel = this.channels[(this.isNoob ? 'nerd' : 'noob')]
  }

  _log (msg) {
    log(this.name + ': ' + msg)
  }

  _handle (err) {
    log(this.name + ': ' + err)
  }

  connect () {
    this._log('connecting to host `' + this.host + '`...')
    this._log('connected! subscribing to channel `' + this.isNoob + '`')
    this.connected = true
    this.emit('connect')

    this.recvChannel.on('message', this._listener)

    return Promise.resolve(null)
  }

  disconnect () {
    this.connected = false
    this.recvChannel.removeListener('message', this._listener)
    return Promise.resolve(null)
  }

  send (msg) {
    return new Promise((resolve) => {
      this._log('sending on ' + this.isNoob)
      // asyncronously runs function and swallows
      // the errors, just like a network connection
      setTimeout(() => {
        this.sendChannel.emit(
          'message',
          this.sendChannel,
          JSON.stringify(msg))
      }, 10)
      resolve()
    })
  }

}
module.exports = {
  MockConnection: MockConnection,
  MockChannels: {
    'noob': new EventEmitter(),
    'nerd': new EventEmitter()
  }
}