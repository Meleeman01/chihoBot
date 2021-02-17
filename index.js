require('dotenv').config()

const irc = require('irc-upd')
const fetch = require('node-fetch')
const uriEncode = require('strict-uri-encode')
const config = require('./config/server')
const channel = "#botspam"

let searchCount = 0

const { dockStart } = require('@nlpjs/basic')




const client = new irc.Client(config.server, config.name, {
	channels:[channel,],
	port:config.port,
	secure:config.secure,
	debug:false,
})
//console.log(client)
client.addListener('error', function(message) {
	console.log('error: ', message)
})

//time sensitive tasks 
function time(format) {
	let currentDate = new Date()
	let day = currentDate.getDay()
	let hour = currentDate.getHours() 
	const days = {1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday',0:'sunday'}

	if (typeof format == 'string') {
		if (format == 'day') {
			return days[day]
		}
		else if (format == 'hour') {
			return hour + 1 //hours counted from 0-23
		}
		else if (format == 'date') {
			return new Date().toLocaleDateString("en-US")
		}
		else if (format == 'time') {
			return new Date().toLocaleTimeString("en-US")
		}
		else throw new Error('String entered doesn\'t match any case in the time function, try passing in day, hour, date, or time.') //update this as needed. 
	}
	
	else throw new TypeError('You need to pass in a string to the time function like this: time("day")')
}

//tasks to be run daily
function daily() {
	//day in millisecs
	let timer = setTimeout(function(arg){
		console.log('i ran');
		const btc = crypto('bitcoin')
		const ltc = crypto('litecoin')
		const eth = crypto('eth')
		const dash = crypto('dash')
		const eos = crypto('eos')
		client.say(channel,"The price of "+btc.name+" is "+btc.price+" USD")
		client.say(channel,"The price of "+ltc.name+" is "+ltc.price+" USD")
		client.say(channel,"The price of "+eth.name+" is "+eth.price+" USD")
		client.say(channel,"The price of "+dash.name+" is "+dash.price+" USD")
		client.say(channel,"The price of "+eos.name+" is "+eos.price+" USD")
	},86400000);
	//get the current time 
}

//crypto module
async function crypto(utterance) {
	const link = await process.env.CRYPTO_COMPARE
	if (utterance.includes('bitcoin') || utterance.includes('btc')) {
		return {price:await fetchCrypto(link+'fsym=BTC&tsyms=USD'),name: 'bitcoin'}
	}
	else if (utterance.includes('litecoin')|| utterance.includes('ltc')) {
		return {price:await fetchCrypto(link+'fsym=LTC&tsyms=USD'),name: 'litecoin'}
	}
	else if (utterance.includes('eth')) {
		return {price:await fetchCrypto(link+'fsym=ETH&tsyms=USD'),name:'ethereum'}
	}
	else if (utterance.includes('dash')) {
		return {price:await fetchCrypto(link+'fsym=DASH&tsyms=USD'),name:'dash'}
	}
	else if (utterance.includes('eos')) {
		return {price:await fetchCrypto(link+'fsym=EOS&tsyms=USD'),name:'eos'}
	}
	else if (utterance.includes('doge')) {
		return {price:await fetchCrypto(link+'fsym=DOGE&tsyms=USD'),name:'doge'}
	}
	else {
		return false
	}
}

async function fetchCrypto(link) {
	const response = await fetch(link)
		.then(response => response.json())
		.then((data) => {
			console.log(data)
			return data['USD'] //returns only the price according to api
		})
	console.log(response)
	return response
}

async function animeAnnouncement() {
	if (await time('hour') == 20 && await time('day') == 'monday') {
		console.log('LOLOLOLLOLOLOL')
		client.say('#wetfish','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#dryfish','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#freefish','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#crypto','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#botspam','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#poomp','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#botspam','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#botspam','OMFG anime is starting soon! Get in and/or join #anime losers!')
		client.say('#botspam','OMFG anime is starting soon! Get in and/or join #anime losers!')
	}
}

//main business end of the bot.
const chiho = {
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
			//check anime announcement here

			animeAnnouncement();
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
					let cryptoPrice = await crypto(response.utterance)
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
	}
};


chiho.init();
