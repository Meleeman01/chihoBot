//irc-connection
require('dotenv').config();
const irc = require('irc-upd');
const config = require('./server');
const channel = process.env.CHANNEL;

const client = new irc.Client(config.server, config.name, {
	channels:[channel,],
	port:config.port,
	secure:config.secure,
	debug:false,
});
client.addListener('error', function(message) {
	console.log('error: ', message);
});


module.exports = client;