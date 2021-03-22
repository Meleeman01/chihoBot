//crypto
const fetch = require('node-fetch');
//crypto module
const crypto = {
	find:async function (utterance) {
		const link = await process.env.CRYPTO_COMPARE;
		if (utterance.includes('bitcoin') || utterance.includes('btc')) {
			return {price:await crypto.fetch(link+'fsym=BTC&tsyms=USD'),name: 'bitcoin'};
		}
		else if (utterance.includes('litecoin')|| utterance.includes('ltc')) {
			return {price:await crypto.fetch(link+'fsym=LTC&tsyms=USD'),name: 'litecoin'};
		}
		else if (utterance.includes('eth')) {
			return {price:await crypto.fetch(link+'fsym=ETH&tsyms=USD'),name:'ethereum'};
		}
		else if (utterance.includes('dash')) {
			return {price:await crypto.fetch(link+'fsym=DASH&tsyms=USD'),name:'dash'};
		}
		else if (utterance.includes('eos')) {
			return {price:await crypto.fetch(link+'fsym=EOS&tsyms=USD'),name:'eos'};
		}
		else if (utterance.includes('doge')) {
			return {price:await crypto.fetch(link+'fsym=DOGE&tsyms=USD'),name:'doge'};
		}
		else {
			return false;
		}
	},
	fetch:async function(link) {
		const response = await fetch(link)
			.then(response => response.json())
			.then((data) => {
				console.log(data);
				return data['USD']; //returns only the price according to api
			});
		console.log(response);
		return response;
	}
};




module.exports = crypto;