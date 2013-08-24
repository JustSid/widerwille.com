
var fs     = require('fs');
var path   = require('path');
var exec   = require('child_process').exec;
var config = require('config');

var sequelize = require('./sequelize.js');
var blog = require('./blog.js');

var local      = path.join(__dirname, '../content/git');
var branch     = config.git.branch;
var repository = config.git.repository;

function changedFiles(commit, callback)
{
	var command = 'cd ' + local + '; git show --pretty="format:" --name-only ' + commit;
	exec(command, function(error, stdout, stderr) {
		var changes = stdout.split('\n');
		callback(changes);
	});
}

function commitList(since, callback)
{
	var command = 'cd ' + local + '; git log --branches=' + branch + ' --pretty="format:%H" --reverse';
	exec(command, function(error, stdout, stderr) {

		var commits = stdout.split('\n');

		if(since != undefined)
		{
			var length = commits.length;
			var newCommits = new Array();

			for(var i = length - 1; i >= 0; i --)
			{
				var commit = commits[i];
				if(commit === since)
				{
					commits = newCommits;
					break;
				}

				newCommits.push(commit);
			}
		}

		callback(commits);
	});
}

function pull(callback)
{
	console.log('git pull');

	var command = 'cd ' + local + '; git pull origin ' + branch;
	exec(command, function(error, stdout, stderr) {

		if(error)
		{
			console.log('Failed to update from remote repository: ' + error);
			callback();
			return;
		}

		callback();
	});
}

function cloneRepository(callback)
{
	console.log('git clone');

	var command = 'rm -rf ' + repository + '; git clone -b ' + branch + ' ' + repository + ' ' + local;
	exec(command, function(error, stdout, stderr) {

		if(error)
		{
			console.error('Failed to clone remote repository: ' + error);
			process.exit(-1);
		}

		callback();
	});
}



function init(callback)
{
	console.log('Initializing git');

	try
	{
		var exists = fs.existsSync(local);
		if(!exists)
		{
			cloneRepository(callback);
			return;
		}
	}
	catch(e)
	{
		console.log(e);

		cloneRepository(callback);
		return;
	}

	pull(callback);
}

module.exports = {
	init: init,
	clone: cloneRepository,
	pull: pull,
	commits: commitList,
	changes: changedFiles,
	repository: local
};
