
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var _ = require('underscore');

var meta = require('./../content/meta.js');
var git = require('./git.js');

var basedir = path.join(git.repository, 'content');

function render(name, res, next)
{
	var directory = path.join(basedir, name);
	fs.exists(directory, function(exists) {

		if(exists)
		{
			var info = path.join(directory, 'info.json');
			var jade = path.join(directory, name + '.jade');
			var markdown = path.join(directory, name + '.md');

			var infoExists = fs.existsSync(info);
			var jadeExists = fs.existsSync(jade);
			var markdownExists = fs.existsSync(markdown);

			if(jadeExists)
			{
				var data = { title: name };

				if(infoExists)
					data = JSON.parse(fs.readFileSync(info, 'utf-8'));

				if(markdownExists)
					data.html = marked(fs.readFileSync(markdown, 'utf-8'));


				data = _.extend(data,  meta.basicData(data.title));
				res.render(jade, data);
				return;
			}
		}

		next();
	});
}

module.exports.render = render;
