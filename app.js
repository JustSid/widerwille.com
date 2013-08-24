
var express = require('express');
var config  = require('config');
var routes  = require('./routes');
var utility = require('./content/utility.js');

var http = require('http')
var path = require('path');

// Validate the config
utility.validateObject(config, 'git');
utility.validateObject(config.git, 'repository');
utility.validateObject(config.git, 'branch');

utility.validateObject(config, 'site');
utility.validateObject(config.site, 'title');

utility.validateObject(config, 'footer');

// Configure the server
var git  = require('./controller/git.js');
var blog = require('./controller/blog.js');

var app = express();

var publicPath = path.join(__dirname, 'public');
var blogPublic = path.join(git.repository, '/media');
var maxCacheAge = 120;

app.configure(function() {
	app.set('port', process.env.PORT || 23857);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function() {
	app.use(express.errorHandler());
	app.use(express.logger('dev'));
});

app.configure('production', function() {
	app.enable('trust proxy');
	app.use(express.logger('[:date] :method :url :status :response-time ms - ":referrer" ":user-agent"'));
});

app.configure(function() {
	app.use(require('less-middleware')({ src: publicPath }));
	app.use(express.static(publicPath, { maxAge: maxCacheAge }));
	app.use(express.static(blogPublic, { maxAge: maxCacheAge }));

	if(typeof config.public !== 'undefined')
	{
		var folders = config.public;
		for(var i = 0; i < folders.length; i ++)
		{
			var folder = folders[i];
			app.use(express.static(folder, { maxAge: maxCacheAge }));
		}
	}
});

app.locals.basedir = path.join(__dirname, 'views');

app.get('/', routes.blog);
app.get('/blog', routes.blog);
app.get('/blog/page/:page', routes.page);
app.get('/blog/tag/:tag', routes.tag);
app.get('/blog/:post', routes.post);
app.get('*', routes.static);

app.post('/post-receive', function(req, res) {
	res.send(200);

	git.pull(function() {
		blog.import();
	});
});

app.use(function(req, res) {
	res.status(404);
	res.render('404.jade');
});

// Initialize git, import new posts and start the server
git.init(function() {

	blog.import(function() {

		http.createServer(app).listen(app.get('port'), function(){
		 	console.log("Jublog up and running on port " + app.get('port'));
		});
		
	});

});
