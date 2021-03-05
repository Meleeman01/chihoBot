//chihobot
const irc = require('irc-upd')
const fetch = require('node-fetch')
const uriEncode = require('strict-uri-encode')
const config = require('./config/server')
const channel = "#botspam"
const time = require('./modules/time')
const crypto = require('./modules/crypto')
let searchCount = 0
const client = new irc.Client(config.server, config.name, {
	channels:[channel],
	port:config.port,
	secure:config.secure,
	debug:false,
})

client.addListener('error', function(message) {
	console.log('error: ', message)
})

const { dockStart } = require('@nlpjs/basic')

const chiho = {
	path:'lol',
	init: async function init() {
		chiho.listen()
	},
	listen: async function () {
		const dock = await dockStart({ use: ['Basic']})
		const nlp = dock.get('nlp')
		nlp.addLanguage('en')
		await nlp.addCorpus('./corpus-en.json')
		await nlp.train()
		await client.join(channel, function(){
			client.say(channel,'hello, my name is Chiho, i\'m here to help search and hopefully someday hold a conversation in a bucket. a data bucket.')
		});
		//listen to messages from users
		client.addListener('message', async function message(from, to, message) {
		
			console.log(from + ' => ' + to + ': ' + message)
			message = message.toLowerCase()

			if (message == ':unload chiho' && from == 'meleeman') {
				try{
					await client.say(channel,'shutting down chihobot for maintenance.');
					await client.removeListener('message',client._events.message);
					console.log(client._events);
					chiho.maintenance();
				}
				catch (e) {
					console.error(e);
				}
				
			}
			
			
			//if i'm being addressed run the following
			if ( message.startsWith(config.name.toLowerCase())) {
				const response = await nlp.process('en', message)
				console.log(response);

				if (response.intent == 'search' ) {
					searchCount++
					console.log(message.split(" "))
					//'http://api.duckduckgo.com/?q=x&format=json'
					
					let query = message.replace("chiho search","")
					console.log(query)
					let response = await fetch('https://api.duckduckgo.com/?q='+uriEncode(query)+'&format=json')
						.then(response => response.json())
						.then((data) => {
							console.log(data)
							
							if (searchCount < 5) {
								if (data.Abstract != '') {
									client.say(channel,from+' here you go: '+data.Abstract)
								}
								else {
									client.say(channel,from+' here you go: '+data.Abstract)
								}
								
							}
							else {
								searchCount = 0
								client.say(channel,'Let me duckduckgo that for you '+from+' ;)'+'here you go: '+' https://lmddgtfy.net/?q='+uriEncode(query))
							}
						})
					
					
					
				}
				else if (response.intent == "chiho.crypto") {
					let cryptoPrice = await crypto.find(response.utterance)
					if (!cryptoPrice) {
						client.say(channel,"sorry i don't know that one yet contact meleeman to add it")
					}
					else {
						client.say(channel,"The price of "+cryptoPrice.name+" is "+cryptoPrice.price+" USD")
					}
					
				}
				else if(response.intent == "chiho.time.day"){
					const day = await time('day')
					client.say(channel, from+' '+response.answer+' '+day)
				}
				else if(response.intent == "chiho.time.date") {
					client.say(channel, from+' '+response.answer+' '+await time('date'))
				}
				else if(response.intent == "chiho.time") {
					client.say(channel, from+' '+response.answer+' '+await time('time'))
				}
				else if (response.intent == 'None') {
					client.say(channel, from+' '+'I\'m not sure what to say to that just yet. sorry...')
				}
				else{
					
					client.say(channel, from+' '+response.answer)
				}
			}


			if (from == 'fishy') {
				if (message.includes('dong') || message.includes('dick')||message.includes('butt')) {
					client.say(channel,'fuck off '+from +' ur gross')
				}
			}

		})
	},
	maintenance: async function () {
		client.addListener('message',async function(from, to, message){
			{console.log(from + ' ::Debug=> ' + to + ': ' + message)}
			if (message == ':load chiho' && from == 'meleeman') {
				try{
					await client.say(channel,'loading chiho.');
					await client.removeListener('message',client._events.message);
					console.log(client._events);
					chiho.init();
				}
				catch (e) {
					console.error(e);
				}
			}
		})
	},
	load: async function () {

	},
	unload: async function() {
		console.log(chiho.path);
	}
};

module.exports = chiho