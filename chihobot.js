//chihobot
require('dotenv').config();

const channel = process.env.CHANNEL;

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

const chiho = {
	searchCount:0,
	fetch: require('node-fetch'),
	uriEncode: require('strict-uri-encode'),
	client: require('./config/irc-connection'),
	config: require('./config/server'),
	time: requireUncached('./modules/time'),
	crypto: requireUncached('./modules/crypto'),
	dockStart:requireUncached('./node_modules/@nlpjs/basic'),
	init: async function init() {
		console.log(chiho.crypto);
		chiho.listen();
	},
	listen: async function () {
		const dock = await chiho.dockStart.dockStart({ use: ['Basic']}); //this is ugly. but allows us to use nlp within an object.
		const nlp = dock.get('nlp');
		nlp.addLanguage('en');
		await nlp.addCorpus('./corpus-en.json');
		await nlp.train();
		chiho.client.join(channel, function(){
			chiho.client.say(channel,'hello, my name is Chiho, i\'m here to help search and hopefully someday hold a conversation in a bucket. a data bucket.');
		});
		//listen to messages from users
		chiho.client.addListener('message', async function message(from, to, message) {
		
			console.log(from + ' => ' + to + ': ' + message);
			message = message.toLowerCase();
			
			//if i'm being addressed run the following
			if ( message.startsWith(chiho.config.name.toLowerCase())) {
				const response = await nlp.process('en', message);
				console.log(response);

				if (response.intent == 'search' ) {
					chiho.searchCount++;
					console.log(message.split(''));
					//'http://api.duckduckgo.com/?q=x&format=json'
					
					let query = message.replace('chiho search','');
					console.log(query);
					let response = await fetch('https://api.duckduckgo.com/?q='+chiho.uriEncode(query)+'&format=json')
						.then(response => response.json())
						.then((data) => {
							console.log(data);
							
							if (chiho.searchCount < 5) {
								if (data.Abstract != '') {
									chiho.client.say(channel,from+' here you go: '+data.Abstract);
								}
								else {
									chiho.client.say(channel,from+' here you go: '+data.Abstract);
								}
								
							}
							else {
								chiho.searchCount = 0;
								chiho.client.say(channel,'Let me duckduckgo that for you '+from+' ;)'+'here you go: '+' https://lmddgtfy.net/?q='+uriEncode(query));
							}
						});
					
					
					
				}
				else if (response.intent == "chiho.crypto") {
					let cryptoPrice = await chiho.crypto.find(response.utterance);
					if (!cryptoPrice) {
						chiho.client.say(channel,"sorry i don't know that one yet contact meleeman to add it");
					}
					else {
						chiho.client.say(channel,"The price of "+cryptoPrice.name+" is "+cryptoPrice.price+" USD");
					}
					
				}
				else if(response.intent == "chiho.time.day"){
					const day = await chiho.time('day');
					chiho.client.say(channel, from+' '+response.answer+' '+day);
				}
				else if(response.intent == "chiho.time.date") {
					chiho.client.say(channel, from+' '+response.answer+' '+await chiho.time('date'));
				}
				else if(response.intent == "chiho.time") {
					chiho.client.say(channel, from+' '+response.answer+' '+await chiho.time('time'));
				}
				else if (response.intent == 'None') {
					chiho.client.say(channel, from+' '+'I\'m not sure what to say to that just yet. sorry...');
				}
				else{
					
					chiho.client.say(channel, from+' '+response.answer);
				}
			}


			if (from == 'fishy') {
				if (message.includes('dong') || message.includes('dick')||message.includes('butt')) {
					chiho.client.say(channel,'fuck off '+from +' ur gross');
				}
			}

		});
	},
	load: async function () {
		await chiho.init();
	},
	unload: async function() {
		await chiho.client.removeListener('message',chiho.client._events.message);
	}
};

module.exports = chiho;