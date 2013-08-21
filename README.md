This is the node.js app that powers most of [widerwille.com](http://widerwille.com). It should run on node.js 0.6+, though I have only tested it on node.js 0.8.17+. I've tried to make some things modular and customizable, but it's essentially tailored to run my site and not arbitrary sites, so if you want to use it, you may have to edit some parts of it.

Basically what it does is simply displaying the content of another git repository, containing all the data and meta data to power the blog and static sites, cached in a local sqlite3 database. When a push is made to the content repository, the app automatically pulls the data and integrates it into the database.

## Acknowledgments
The node app and the contents its generate wouldn't be possible without the help of third party modules, scripts, etc (some used directly, some just used in parts where it seemed fit), in no particular order:

  * [lightbox 2](https://github.com/lokesh/lightbox2) by [Lokesh Dhakar](http://www.lokeshdhakar.com/), released under Creative Commons 2.5 
  * [Twitter Bootstrap](http://getbootstrap.com), released under the Apache License 2.0
  * [jQuery 2](http://jquery.com/), released under the MIT license
  * [prettyprint](http://google-code-prettify.googlecode.com/), released under the Apache License 2.0
  
## License
All non third party code is released under the MIT license, basically: Do whatever you want with it. See also the LICENSE.md file.