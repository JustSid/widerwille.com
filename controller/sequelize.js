
var Sequelize = require('sequelize');
var path      = require('path');

var database  = path.join(__dirname, '../content/data.sqlite');

var sequelize = new Sequelize('data', 'username', null, {
	dialect: 'sqlite',
	storage: database,
	logging: false
});


var Commit = sequelize.define('Commit', {
	hash: Sequelize.STRING
});

var Tag = sequelize.define('Tag', {
	title: Sequelize.STRING
});

var Post = sequelize.define('Post', {
	title: Sequelize.STRING,
	puuid: Sequelize.STRING,
	date: Sequelize.DATE,
	text: Sequelize.TEXT,
	preview: Sequelize.TEXT
});

Post.hasMany(Tag, {as: 'Tags'});
Tag.hasMany(Post, {as: 'Posts'});


sequelize.sync();


module.exports = 
{
	sequelize: sequelize,
	Tag: Tag,
	Post: Post,
	Commit: Commit
}
