//chihobot
require('dotenv').config();

const channel = process.env.CHANNEL;

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}
const brain = requireUncached('brain.js');

const chiho = {
	searchCount:0,
	fetch: require('node-fetch'),
	uriEncode: require('strict-uri-encode'),
	client: require('./config/irc-connection'),
	config: require('./config/server'),
	time: requireUncached('./modules/time'),
	crypto: requireUncached('./modules/crypto'),
	dockStart:requireUncached('@nlpjs/basic'),
	corpus:requireUncached('./corpus-en.json'),
	brainCorpus:requireUncached('./chiho-corpus'),
	init: async function init() {
		console.log(chiho.crypto);
		chiho.listen();
	},
	listen: async function () {
		const net = await new brain.recurrent.LSTM({hiddenLayers:[20]});
				await net.train(chiho.brainCorpus, {
  // Defaults values --> expected validation
  iterations: 1000, // the maximum times to iterate the training data --> number greater than 0
  errorThresh: 0.01, // the acceptable error percentage from training data --> number between 0 and 1
  log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
  logPeriod: 10, // iterations between logging out --> number greater than 0
  learningRate: 0.005, // scales with delta to effect training rate --> number between 0 and 1
  momentum: 0.0001, // scales with next layer's change value --> number between 0 and 1
  callback: null, // a periodic call back that can be triggered while training --> null or function
  callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
  timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
});
		await chiho.client.join(channel, function(){
			chiho.client.say(channel,'hello, my name is Chiho, i\'m here to help search and hopefully someday hold a conversation in a bucket. a data bucket.');
		});
		//listen to messages from users
		await chiho.client.addListener('message', async function message(from, to, message) {
		
			console.log(from + ' => ' + to + ': ' + message);
			message = message.toLowerCase();
			//brain.js 
			

			if (message.startsWith('testbrain')) {
				console.log(output);
				await chiho.client.say(channel, from+' '+'you sound '+output);
			}
			
			//if i'm being addressed run the following
			if ( message.startsWith(chiho.config.name.toLowerCase())) {
				//const response = await nlp.process('en', message);

				let output = await net.run(message);
				console.log(output);

				if (output.includes('search')) {
					chiho.searchCount++;
					console.log(message.split(''));
					//'http://api.duckduckgo.com/?q=x&format=json'
					
					let query = message.replace('search','');
					console.log(query);
					let response = await chiho.fetch('https://api.duckduckgo.com/?q='+chiho.uriEncode(query)+'&format=json')
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
				else if (output.includes('crypto')) {
					//parse what the user said

					let cryptoPrice = await chiho.crypto.find(message);
					if (!cryptoPrice) {
						chiho.client.say(channel,"sorry i don't know that one yet contact meleeman to add it");
					}
					else {
						chiho.client.say(channel,"The price of "+cryptoPrice.name+" is "+cryptoPrice.price+" USD");
					}
					
				}
				else if(output == "day"){
					const day = chiho.time('day');
					chiho.client.say(channel, from+' '+ day);
				}
				else if(output == "date") {
					chiho.client.say(channel, from+' '+ await chiho.time('date'));
				}
				else if(output == "time") {
					chiho.client.say(channel, from+' '+ await chiho.time('time'));
				}
				else if (output == 'None') {
					chiho.client.say(channel, from+' '+'I\'m not sure what to say to that just yet. sorry...');
				}
				else{
					
					chiho.client.say(channel, "I'm sorry "+from+' '+"I'm afaid I can't do that.");
				}
				//put in dave command.
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