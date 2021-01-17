const irc = require('irc-upd')
const fetch = require('node-fetch')
const uriEncode = require('strict-uri-encode')
const config = require('./config/server')
const channel = "#botspam"
let searchCount = 0

const { dockStart } = require('@nlpjs/basic')




const client = new irc.Client(config.server, config.name, {
	channels:['#botspam',],
	port:config.port,
	secure:config.secure,
	debug:false,
})
//console.log(client)
client.addListener('error', function(message) {
	console.log('error: ', message)
})
client.addListener('ping', function(server) {
	console.log(server)
	animeAnnouncement()
})

client.join(channel, function(){
	client.say(channel,'hello, my name is Chiho, i\'m here to help search and hopefully someday hold a conversation in a bucket. a data bucket.')
});
//time sensitive tasks 
function time(format) {
	let currentDate = new Date()
	let day = currentDate.getDay()
	let hour = currentDate.getHours()
	let date = currentDate.getDate()
	let time = currentDate.getTime()
	const days = {1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday',0:'sunday'}
	const hours = {0:1,1:2,2:3,3:4,4:5,5:6,6:7,7:8,8:9,9:10,10:11,11:12,12:13,13:14,14:15,15:16,16:17,17:18,18:19,19:20,20:21,21:22,22:23,23:24}
	if (typeof format == 'string' && format == 'day') {
		return days[day]
	}
	else if (typeof format == 'string' && format == 'hour') {
		return hours[hour]
	}
	else if (typeof format == 'string' && format == 'date') {
		return new Date().toLocaleDateString("en-US")
	}
	else if (typeof format == 'string' && format == 'time') {
		return time
	}
	else console.log(format)
}

async function animeAnnouncement() {
	if (await time('hour') == 19 && await time('day') == 1) {
		console.log('LOLOLOLLOLOLOL')
		client.say(channel,'OMFG anime is starting soon! Get in and/or join #anime losers!')
	}
}

//main business end of the bot.
(async () => {
	const dock = await dockStart({ use: ['Basic']})
	const nlp = dock.get('nlp')
	nlp.addLanguage('en')
	await nlp.addCorpus('./corpus-en.json')
	await nlp.train()
	
	//listen to messages from users
	client.addListener('message', async function (from, to, message) {
		//check anime announcement here

		animeAnnouncement();
		console.log(from + ' => ' + to + ': ' + message)
		message = message.toLowerCase()
		

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
						
						if (searchCount<5) {
					
					client.say(channel,from+' here you go: '+data.Abstract)
				}
				else {
					client.say(channel,'Let me duckduckgo that for you '+from+' ;)'+'here you go: '+' https://lmddgtfy.net/?q='+uriEncode(query))
				}
					})
				
				
				
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
				client.say(channel,'fuck off '+from +'ur gross')
			}
		}

	})
})();