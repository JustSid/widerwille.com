
function capitalize(string)
{
	words = string.toLowerCase().split(' ');

	for(var i=0; i<words.length; i++)
	{
		var word = words[i].charAt(0).toUpperCase() + words[i].slice(1);
		words[i] = word;
	}

	return words.join(' ');
}

function generateError(title, message)
{
	var error = {};
	error.title   = (typeof title !== 'undefined') ? title : '';
	error.message = (typeof message !== 'undefined') ? message : '';

	return error;
}

function validateObject(object, key)
{
	if(typeof object !== 'undefined')
	{
		if(typeof object[key] !== 'undefined' && object[key] != null)
			return;
	}

	throw 'Failed to validate key ' + key + ' for ' + object;
}

module.exports.capitalize = capitalize;
module.exports.generateError = generateError;
module.exports.validateObject = validateObject;
