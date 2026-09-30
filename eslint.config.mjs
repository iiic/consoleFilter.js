"use strict";

//@ts-check

/**
 * @file eslint.config.mjs
 * @description Lint rules, mostly derived from the code style described in AGENTS.md
 */

import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: [ 'node_modules/**' ],
	},
	js.configs.recommended,
	{
		files: [ '**/*.mjs', '**/*.js' ],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
		rules: {
			'eqeqeq': [ 'error', 'always' ],
			'no-var': 'error',
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-with': 'error',
			'no-proto': 'error',
			'no-caller': 'error',
			'radix': [ 'error', 'always' ],
			'prefer-object-has-own': 'error',
			'no-prototype-builtins': 'error',
			'prefer-const': 'warn',
			'no-unused-vars': [ 'error', { args: 'none' } ], // parameters are often present only for JSDoc typing
			'no-unused-labels': 'off', // labels are used as self-describing names of loops
			'no-restricted-globals': [ 'error',
				{ name: 'isNaN', message: 'Use Number.isNaN() instead.' },
				{ name: 'escape', message: 'Deprecated, see AGENTS.md.' },
				{ name: 'unescape', message: 'Deprecated, see AGENTS.md.' },
				{ name: 'uneval', message: 'Non-standard, see AGENTS.md.' },
				{ name: 'InternalError', message: 'Non-standard, see AGENTS.md.' },
				{ name: 'DOMError', message: 'Deprecated, see AGENTS.md.' },
				{ name: 'XSLTProcessor', message: 'Forbidden, see AGENTS.md.' },
				{ name: 'AudioProcessingEvent', message: 'Deprecated, see AGENTS.md.' },
			],
			'no-restricted-properties': [ 'error',
				...[ 'getYear', 'setYear', 'toGMTString', 'substr', 'anchor', 'big', 'blink', 'bold', 'fixed', 'fontcolor',
					'fontsize', 'italics', 'link', 'strike', 'small', 'sub', 'sup', 'compile', 'createScriptProcessor',
					'__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'hasOwnProperty',
					'isPrototypeOf', 'execCommand', 'queryCommandEnabled', 'queryCommandState', 'queryCommandSupported',
					'createEvent', 'createNSResolver', 'createTouch', 'createTouchList', 'enableStyleSheetsForSet',
					'requestStorageAccessFor', 'onafterscriptexecute', 'onbeforescriptexecute', 'onbeforeunload',
				].map( ( property ) => ( { property, message: 'Forbidden by AGENTS.md.' } ) ),
				...[ 'all', 'anchors', 'applets', 'alinkColor', 'bgColor', 'fgColor', 'linkColor', 'vlinkColor', 'cookie',
					'domain', 'featurePolicy', 'fullscreen', 'lastStyleSheetSet', 'preferredStyleSheetSet', 'rootElement',
					'selectedStyleSheetSet', 'styleSheetSets', 'xmlEncoding', 'xmlVersion', 'clear', 'close', 'open',
					'write', 'writeln',
				].map( ( property ) => ( { object: 'document', property, message: 'Forbidden by AGENTS.md.' } ) ),
				{ object: 'location', property: 'reload', message: 'Forbidden by AGENTS.md.' },
				...[ 'input', 'lastMatch', 'lastParen', 'leftContext', 'rightContext' ]
					.map( ( property ) => ( { object: 'RegExp', property, message: 'Forbidden by AGENTS.md.' } ) ),
			],
			'no-restricted-syntax': [ 'error',
				{
					// single quotes, except of the "use strict" directive
					selector: 'Literal[raw=/^"/]:not(Program > ExpressionStatement > Literal)',
					message: 'Strings must use single quotes.',
				},
				{
					selector: 'CallExpression[callee.property.name="addEventListener"][arguments.0.value=/^(afterscriptexecute|beforescriptexecute|beforeunload|onbeforeunload)$/]',
					message: 'Forbidden event by AGENTS.md.',
				},
			],
		},
	},
	{
		files: [ '**/*.spec.mjs' ],
		rules: {
			'no-unused-vars': [ 'warn', { args: 'none' } ], // spec imports the whole test API
		},
	},
	{
		files: [ 'scripts/**/*.mjs', 'eslint.config.mjs' ],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
];
