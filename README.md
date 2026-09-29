# consoleFilter.js

version: 1.0
integrity check sha256: wKBRIpKc5Mls91VCZcaQP1Q4TuCPSpk52HrXblTngs4=

Make native `console.log()` (and other console methods) proxied and filtered by text string.
Only pure javascript with TypeScript annotations, no other dependencies, libraries, frameworks or anything like that. TypeScript what? It's only about annotations, automatic tools can mark this class as a TypeScript library, but it's not true, just an autodetection failure, the script itself is pure javascript, only the annotations, interfaces, variable types described by TypeScript, ...

Use
---

Include file `consoleFilter.mjs` into document. Including should look like:

``` html
<script src="./consoleFilter.mjs?v=1.0" type="module" crossorigin="anonymous" integrity="sha256-wKBRIpKc5Mls91VCZcaQP1Q4TuCPSpk52HrXblTngs4="></script>
```

or inside javascript:

``` javascript
const { ConsoleFilter, methods, AsyncLogger } = await import( './consoleFilter.mjs?v=1.0' );
```

After import all console commands are proxied!

## How to set what to filter?

There are 2 options, and for both the same applies: you only fill in the parts of the settings you want to change; if you do not mention them, the default settings are used. You can find the default settings from the static read-only method `ConsoleFilter.DEFAULT_SETTINGS`. For clarity, that variable contains the default settings, not the current instance settings.

### 1. Configure via a JSON element.

What JSON element? This is a simplified term for `script type="application/json"`, or `script type="text/json"` (even though this syntax is deprecated, it still works). It is important to know that `script type="application/json"` is treated by the browser as ordinary text, not as executable script! That means it does not block page rendering while the script runs; on the contrary, it has no effect on page rendering.

The important attribute here is `id` with the value `console-filter-settings`. The script looks for the element with that `id`. Since the script itself is a module (`type="module"`), it does not matter where in the page the JSON element is placed, whether in the header or at the end of the body.

``` html
<script type="application/json" id="console-filter-settings">
{
	"allowlist": [ "items" ],
	"blocklist": [ "word", "another", "word" ],
}
</script>
```

### 2. Inject settings via an HTTP GET parameter.

The second option is to place them in the HTTP GET parameter named `settings`. (You can find the parameter name from the static read-only method `ConsoleFilter.SETTINGS_URL_PARAMETER`.) The value must be JSON-escaped, for example with `JSON.stringify()`.

The function is asynchronous, so you must wait for the result using await or Promise.

Example:
```html
<script type="module">
	const { ConsoleFilter, methods, AsyncLogger } = await import( './consoleFilter.mjs?v=1.0&settings=' + JSON.stringify( {
		"allowlist": [ "items" ],
		"blocklist": [ "word", "another", "word" ],
	} ) );
</script>
```

Option 1 is slightly less resource-intensive, but the difference is minimal. The two configuration methods cannot be combined; choose one or the other.

### Re-load settings

You can load new settings and the functions will work with it immediately.

Using the `ConsoleFilter.methods.readSettings()` (for static methods) command or the `instanceOfConsoleFilter.readSettings()` command, the script will again search for `<script type="application/json" id="console-filter-settings">` and load the settings from it.

## So what exactly does it do?

As described above, after including the script (in any way), all script commands are now proxied and respond to settings (whitelist and/or blacklist).

So for example `console.log( 'exact string' )` will be wiped out if `settings.blacklist` is set to `['exact string', /* … more possible strings … */]`… or logs into Browser's console normally, if `exact string` is not blacklisted.

But that's not all

When dynamically importing, you can use the `methods` object, it contains all static console methods with the same parameters as in the console object. So you can use, for example, `const specialConsole = methods; specialConsole.log('some string');` what is it for? This is in case you want to keep `console` unchanged and have the filtered commands in another object, in this case it was the object in the `specialConsole` variable. However, in this case, it is necessary to tell ConsoleFilter during import that it should not modify the native `console` object in any way. This can be done using the `bool` setting `autoAppendConsole`, which you can change from the default `true` to `false`. Both settings work (as described above). Then you have (for example) the standard `console.log()` and the filtered `specialConsole.log()` available.

And finally, the `AsyncLogger` class, which is used for logging inside asynchronous methods called immediately after each other. Otherwise, commands inside groups (`console.group()` and `console.groupCollapsed()`) could be mixed up. How to do that? For example, `const consoleA = new AsyncLogger();` and `const consoleB = new AsyncLogger()`. Now, if `consoleA` and `consoleB` have an open group (`.group()`), their output will not mix and will be output only after each group is closed (using `.groupClose()`).

In addition, `groupA` and `groupB` now each have their own settings, if I want to prefix all records in the console view with a string. This is possible by changing the settings of each group. For example: `groupA.settings.texts.prefix = 'a: '`, now all records in `groupA` will be prefixed with `'a: '`, if I write the command `groupA.log('some text')`, the record in the console will be: `'a: some text'`. At the same time, `groupB.log('some text')` will only log `'some text'`, the setting was for groupA, not for groupB.

## All settings:

The settings are described by this annotation:

```typescript
type Settings = {

	/** Messages or patterns that are allowed */
	allowlist?: string | string[],

	/** Messages or patterns that are blocked */
	blocklist?: string | string[],

	/** Automatically appends the console to the document */
	autoAppendConsole: boolean,

	/** Write console logs also into document.body */
	appendConsoleIntoBody: boolean,

	/** Possible to change some console function to another. Null means not convert. */
	forceConvertFunctions: {

		/** Rewrite console.log() into… */
		log: null

		/** Rewrite console.info() into… */
		info: null

		/** Rewrite console.warn() into… */
		warn: null

		/** Rewrite console.error() into… */
		error: null

	},

	/** All written text in this class */
	texts: {

		/** Text added before each console message */
		prefix: string,

		/** Text added after each console message */
		suffix: string,

	},

}
```

To set a property, it is not necessary to insert the entire settings object, just the value you want to change and the rest will remain in the default state.

## What are the other files for?

- `consoleFilter.globals.d.ts`, interface with all types and annotations for script. This will help your editor (or your AI agent) to understand the script, know what each method does, what the input parameters are, what data types the variables have, ... However, it is not needed for the script to function properly. If you delete the file, everything will work as before (just your IDE or AI agent may not work as well as it could).
- `consoleFilter.spec.mjs`, Unit tests for main script. It is not needed for the script's functionality itself. If you delete this file, nothing will happen, everything will work. For programmers or AI agents, however, unit tests will help to find out if their changes broke something.
- `modules/ictest.mjs`, Tests runtime. Used **only** for the above mentioned unit test file. Not needed for the script itself.
- `tests-runner.html` HTML file used for run tests in Browser. It is also not needed for the script itself.
- `scripts/run-browser-tests.mjs` runs `tests-runner.html` in headless browser (Playwright) and fails when any test fails. Used by `npm test` and CI. Not needed for the script itself.
- `scripts/check-integrity.mjs` checks that SRI `integrity` hashes in `tests-runner.html` match the current files. Not needed for the script itself.
- `eslint.config.mjs` lint rules derived from the code style in `AGENTS.md`.
- `.github/workflows/` GitHub Actions (CI) running all checks after every push and pull request.
- `package.json` command for NPM ( [npm.js](https://www.npmjs.com/) ) catalog.
- `ADENTS.md` commands for AI agents, description how to work with this repository. Something like Readme for AI.
- `README.md` class description in Markdown.

## Development checks

After every push and pull request, GitHub Actions runs:

- syntax check of all JavaScript files (`node --check`)
- ESLint (`npm run lint`)
- TypeScript type check of JSDoc annotations against `consoleFilter.globals.d.ts` (`npm run typecheck`)
- check of SRI `integrity` hashes in `tests-runner.html` (`npm run check:integrity`)
- `npm pack --dry-run` and `npm audit`
- unit tests in headless Chromium, Firefox and WebKit (`npm test`)
- CodeQL security analysis

Locally: `npm ci`, `npx playwright install chromium` and then `npm run check` runs everything.
After changing `consoleFilter.spec.mjs` run `npm run fix:integrity` to update its hash in `tests-runner.html`.

## Common gotchas

- The `.mjs` file must be served with a JavaScript MIME type. If imports fail, check your server configuration.

Services
--------

Unpkg: https://unpkg.com/console-filter-js

NPM: https://www.npmjs.com/package/console-filter-js

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

More info at https://iiic.dev/console-filter-js
