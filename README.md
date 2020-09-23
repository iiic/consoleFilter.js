# consoleFilter.js
Make native `console.log()` (and other console methods) proxied and filtered by text string

Use
---

Include file `consoleFilter.js` into document. After this script everything in console will be blocked. For filtering place variable:

``` javascript
const consoleFilter = {
	allowlist: [ 'items' ],
	blocklist: [ 'word', 'another', 'word' ],
};
```

before including `consoleFilter.js` into document. And in your logs use format with some identifier into beginig. Like class name or script name. It will be easy to filter that.
So from example `'items'` can also be file name `'myNewScript.js'` or class name `'MyWorker'` or anything. It can be presented once or multiple times.

including should look like:

``` html
<script src="path/to/consoleFilter.js" crossorigin="anonymous" integrity="sha256-uXXs7C2BDEgOxzU68GoX2snxzRxizF6dVw1sdR3rcpw="></script>
```

### a simple example of usage is in the `example-usage.html` file ###

--------------

And your console logs (debugs, …) should look like `console.log( 'myNewScript.js simple console.log()' );`. Lot of examples in file `example-usage.html`.

If you not present variable `consoleFilter` in a global scope so all console commands will be filtered (blocked).

Also not both `allowlist` and `blocklist` are needed. If you need only allow some classNames (file names, identifiers, whatever, …) it could look like:

------------

Services
--------

Unpkg: https://unpkg.com/console-filter-js

NPM: https://www.npmjs.com/package/console-filter-js

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

More info at https://iiic.dev/console-filter-js
