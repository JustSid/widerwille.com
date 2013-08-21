
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var marked = require('marked');
var moment = require('moment');
var cheerio = require('cheerio');

var sequelize = require('./sequelize.js');
var git = require('./git.js');
var utility = require('./../content/utility.js');
var basedir = path.join(git.repository, 'content/');

function generateCleanID(title, date)
{
	var id = date.format('MM-DD-YYYY');
	id = id + '-' + title.toLowerCase();
	id = id.replace(/[^a-zA-Z0-9\-]/g, '-');

	return id;
}

function generatePreview(text)
{
	var dom = cheerio.load(text);
	var paragraph = dom('p').first();

	return paragraph.html();
}



function importPost(post, postsLeft)
{
	if(typeof post.title === 'undefined')
	{
		console.error('Post doesn\'t have a title!');
		importPosts(postsLeft);
		return;
	}

	if(typeof post.date === 'undefined')
	{
		console.error('Post doesn\'t have a date!');
		importPosts(postsLeft);
		return;
	}

	var date;
	var text;

	var file = path.join(basedir, 'articles/' + post.file);
	var title = post.title;

	var tags = (typeof post.tags !== 'undefined') ? post.tags : [];
	var chainer = new Sequelize.Utils.QueryChainer();

	try
	{
		date = moment(post.date, 'DD.MM.YYYY HH:mm:ss Z');
		text = marked(fs.readFileSync(file, 'utf-8'));
	}
	catch(e)
	{
		console.error('Failed to parse date/file: ' + e);
		importPosts(postsLeft);
		return;
	}


	var postID  = generateCleanID(title, date);
	var preview = generatePreview(text);

	for(var i=0; i<tags.length; i++)
	{
		var tag = tags[i].toLowerCase();

		(function(tag) {
			chainer.add(sequelize.Tag.findOrCreate({ title: tag }));
		})(tag);
	}

	chainer.run().success(function(results) {

		sequelize.Post.findOrCreate({ puuid: postID }).success(function(entry) {
			entry.updateAttributes({
				title: title,
				date: date.toDate(),
				text: text,
				preview: preview
			});

			entry.setTags(results);
			importPosts(postsLeft);

		}).error(function(error) {
			console.error(error);
			importPosts(postsLeft);
		});
	}).error(function(error) {
		console.error(error);
		importPosts(postsLeft);
	});
}

function importPosts(posts)
{
	if(posts.length == 0)
		return;

	var post = posts.pop();
	importPost(post, posts);
}



function cleanTag(tag)
{
	try
	{
		return { title: utility.capitalize(tag.values.title), url: '/blog/tag/' + tag.values.title };
	}
	catch(e)
	{
		return { title: e, url: '#' };
	}
}

function cleanTags(tags)
{
	var cleaned = new Array();
	for(var j = 0; j < tags.length; j ++)
	{
		var tag = tags[j];
		cleaned.push(cleanTag(tag));
	}

	cleaned.sort(function(a, b) {
		if(a.title < b.title) 
			return -1;
		if(a.title > b.title) 
			return 1;

		return 0;
	});

	return cleaned;
}

function processPosts(posts, preview, callback)
{
	var cleanPosts = new Array();
	var chainer    = new Sequelize.Utils.QueryChainer();

	for(var i = 0; i < posts.length; i ++)
	{
		var post = posts[i];
		var date = moment(post.values.date).fromNow();
		var html = preview ? post.values.preview : post.values.text;

		var cleanPost = { title: post.values.title, html: html, date: date, url: '/blog/' + post.values.puuid };
		cleanPosts.push(cleanPost);

		chainer.add(post.getTags());
	}
	
	chainer.run().success(function(result) {

		for(var i = 0; i < cleanPosts.length; i ++)
		{
			var post = cleanPosts[i];
			var tags = result[i];

			post.tags = cleanTags(tags);
		}

		callback(cleanPosts);
	});
}

function getPage(page, callback)
{
	var limit = 8;
	var start = page * limit;

	sequelize.Post.findAndCountAll({ order: 'date DESC', offset: start, limit: limit }).success(function(result) {

		var count = result.count;
		var posts = result.rows;

		if(posts.length == 0)
		{
			var data = {};

			data.infos = new Array(utility.generateError('Oh dear!', 'It appears like this page doesn\'t exist!'));
			callback(data);
			return;
		}

		var pages = Math.ceil(count / limit);

		processPosts(posts, true, function(cleanPosts) {

			var data   = {};
			data.posts = cleanPosts;
			data.page  = page;
			data.pages = pages;

			callback(data);
		});
	});
}

function getPost(post, callback)
{
	var data = {};

	sequelize.Post.find({ where: { puuid: post }}).success(function(post) {

		if(post == null)
		{
			data.infos = new Array(utility.generateError('Oh dear!', 'Couldn\'t find the post you were looking for!'));
			callback(data);
			return;
		}

		processPosts([post], false, function(cleanPosts) {

			var data = { post: cleanPosts[0] };
			callback(data);
		})
	});
}

function getTag(name, callback)
{
	sequelize.Tag.find({ where: {title: name.toLowerCase() }}).success(function(tag) {

		if(tag == null)
		{
			var data = {};
			data.infos = new Array(utility.generateError('Oh dear!', 'There is not a single post with that tag!'));

			callback(data);
			return;
		}

		tag.getPosts({ order: 'date DESC' }).success(function(posts) {

			var data = {};

			if(posts == null || posts.length == 0)
			{
				data.infos = new Array(utility.generateError('Oh dear!', 'There is not a single post with that tag!'));
				callback(data);
				return;
			}

			processPosts(posts, true, function(cleanPosts) {

				data.posts = cleanPosts;
				callback(data);

			});

		});
	});
}



function importData()
{
	console.log('Importing data');

	var articlesPath = path.join(basedir, 'articles/!content.json');
	var articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

	importPosts(articles);
}

function importCommits(commits)
{
	var chainer = new Sequelize.Utils.QueryChainer();

	for(var i = 0; i < commits.length; i ++)
	{
		var commit = commits[i];
		chainer.add(sequelize.Commit.create({ hash: commit }));
	}

	chainer.runSerially();
}

function cleanImport()
{
	var chainer = new Sequelize.Utils.QueryChainer;

	chainer.add(sequelize.sequelize.drop());
	chainer.add(sequelize.sequelize.sync());

	chainer.runSerially().success(function() {
		importData();

		git.commits(undefined, function(commits) {
			importCommits(commits);
		});
	});
}

function importFromRepository()
{
	sequelize.Commit.find({ order: 'ROWID DESC' }).success(function(commit) {
		if(commit == null)
		{
			cleanImport();
			return;
		}

		git.commits(commit.values.hash, function(commits) {

			if(commits.length > 0)
			{
				importData();
				importCommits(commits);
			}
		});
	});
}

module.exports = {
	import: importFromRepository,
	getPage: getPage,
	getPost: getPost,
	getTag: getTag
}
