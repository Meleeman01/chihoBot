//time and scheduled tasks

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

module.exports = time;