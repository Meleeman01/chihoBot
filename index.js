require('dotenv').config();

const fs = require('fs');
const channel = process.env.CHANNEL;
const client = require('./config/irc-connection');
const chihoPath = __dirname+'/chihobot.js';

//example
// {
//       "intent": "chiho.loveconfession",
//       "utterances": [
//         "i love you",
//         "be my girlfriend",
//         "aishiteru",
//         "daisuki",
//         "daisuke desu"
//       ],
//       "answers": [
//         "kirai desu.",
//			"I hate you.",
//			"no."
//       ]
//     },

const moduleExists = function(path) {
	if(fs.existsSync(path)) {
		return true;
	} else {
		console.log('>>> Error: module'+path+' doesn\'t exist!');
		return false;
	}
};

const unload = async function (path,modules,mod) {
	try{
		await client.say(channel,'unloading chiho for maintenance.');
		if(moduleExists(chihoPath)) {
			modules[mod].unload();
			await delete modules[mod];
			await delete require.cache[require.resolve(chihoPath)];
			
			console.log(require.cache);
			await console.log(`>>> chiho unloaded`);
		}
	}
	catch (e) {
		console.error(e);
	}
};

const load = async function (path,modules,mod) {
	try{
		await client.say(channel,'loading chiho.');
		if(moduleExists(chihoPath)) {
			modules[mod] = await require(chihoPath);
			modules[mod].load();
			await console.log(`>>> chiho loaded`);
		}
	}
	catch (e) {
		console.error(e);
	}
};
//use a modules object to keep track of multiple modules for now it will just be chiho
const modules = {};
let mod;
//use pms to send commands to reload chihobot
client.addListener('pm', async function (from, message) {
	console.log(from + ' => ME: ' + message);
	if (from == 'meleeman' && message == ':unload chiho') {
		unload(chihoPath,modules,mod);
	}
	if (from == 'meleeman' && message == ':load chiho') {
		load(chihoPath,modules,mod);
	}
	if (from == 'meleeman' && message == ':reload chiho') {
		unload(chihoPath,modules,mod);
		load(chihoPath,modules,mod);
	}
});

