
var path = require('path');
var cheerio = require('cheerio');
var _ = require('underscore');

var meta = require('./../content/meta.js');
var blog = require('./../controller/blog.js');
var static = require('./../controller/static.js');


// Blog

exports.blog = function(req, res) 
{
	var data = meta.basicData('Blog');

	blog.getPage(0, function(blogData) {
		var temp = _.extend(data, blogData);
		res.render('blog', temp);
	});
};

exports.page = function(req, res) 
{
	var data = meta.basicData('Blog');
	var page = parseInt(req.params.page);

	if(page > 0)
		page --;

	blog.getPage(page, function(blogData) {
		var temp = _.extend(data, blogData);
		res.render('blog', temp);
	});
};

exports.post = function(req, res)
{
	var data = meta.basicData('Blog');

	blog.getPost(req.params.post, function(postData) {

		var temp = _.extend(data, postData);
		temp.title = (typeof data.post !== 'undefined') ? data.post.title : 'Blog';

		res.render('post', temp);
	});
};

exports.tag = function(req, res)
{
	var data = meta.basicData('Blog');

	blog.getTag(req.params.tag, function(postData) {

		var temp = _.extend(data, postData);
		res.render('blog', temp);

	});
};

// Showcase

exports.showcase = function(req, res)
{
	var data = meta.basicData('Showcase');
	res.render('showcase', data);
}

// Static

exports.static = function(req, res, next)
{
	if(req.params.length == 1)
	{
		var name = req.params[0];
		if(path.extname(name) == '')
		{
			static.render(name, res, next);

			return;
		}
	}

	next();
}

