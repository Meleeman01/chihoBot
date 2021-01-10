const irc = require('irc-upd')
const uriEncode = require('strict-uri-encode')
const config =require('./config/server')

const client = new irc.Client(config.server, config.name, {
	channels:['#botspam'],
})
console.log(client)
client.addListener('error', function(message) {
	console.log('error: ', message)
})
client.addListener('message', function (from, to, message) {
	console.log(from + ' => ' + to + ': ' + message)
})

client.say('hi, my name is chiho')