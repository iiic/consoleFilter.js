# consoleFilter.js
Make native `console.log()` (and other console methods) proxied and filtered by text string

Include file `consoleFilter.js` into document. After this script everything in console will be blocked. For filtering place variable:

	const consoleFilter = {
		allowlist: [ 'items' ],
		blocklist: [ 'word', 'another', 'word' ],
	};

before including `consoleFilter.js` into document. And in your logs use format with some identifier into beginig. Like class name or script name. It will be easy to filter that.
