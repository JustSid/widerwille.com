
var config = require('config');
var _ = require('underscore');
var navbar = new Array();

function basicData(entry)
{
	var data = {};
	data.title  = config.site.title + ' - ' + entry;
	data.navbar = getNavbar(entry);
	data.metas  = new Array();
	data.footer = config.footer;
	data.disqus = config.disqus;
	data.analytics = config.analytics;

	_.each(config.site, function(value, key) {
		if(key !== 'title')
			data.metas.push({ name: key, content: value });
	});

	return data;
}

function getNavbar(sel) {
	var ret = { selected: sel.toLowerCase(), entries: navbar };
	return ret;
}

function createNavbarEntry(title, target)
{
	var ret = {};
	ret.title = title;
	ret.target = '/' + target;

	navbar.push(ret);
}

createNavbarEntry('Blog', 'blog');
createNavbarEntry('About', 'about');
createNavbarEntry('Imprint', 'imprint');


module.exports.basicData = basicData;
