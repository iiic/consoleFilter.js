'use strict';

/**
* @file consoleFilter.js
* @description Make native `console.log()` (and other console methods) proxied and filtered by text string
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/console-filter
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q3 2020
* @version 0.1
*/

// const consoleFilter = {
// 	allowlist: [ … ],
// 	blocklist: [ … ],
// };

( function ()
{

	if ( !( 'console' in window ) ) {
		//@ts-ignore
		window.console = {};
	}

	const methods = [
		'assert',
		'clear',
		'count',
		'countReset',
		'debug',
		'dir',
		'dirxml',
		'error',
		'exception',
		'group',
		'groupCollapsed',
		//'groupEnd',
		'info',
		'log',
		'profile',
		'profileEnd',
		'table',
		'time',
		'timeEnd',
		'timeLog',
		'timeStamp',
		'trace',
		'warn'
	];
	const methodsLength = methods.length - 1;
	for ( let i = methodsLength; i >= 0; i-- ) {
		const proxy = console[ methods[ i ] ];
		console[ methods[ i ] ] = function ( ...args )
		{
			if ( typeof consoleFilter !== 'undefined' ) {
				if ( typeof args[ 0 ] === 'string' ) {
					const SPACE = ' ';
					const ALL_SYMBOL = [ '*', 'all' ];
					const parts = args[ 0 ].replace( '%c', SPACE ).replace( '%c', SPACE ).trim().split( SPACE );
					if (
						( Array.isArray( consoleFilter.allowlist ) && ( consoleFilter.allowlist.length === 0 || ( consoleFilter.allowlist.length === 1 && ALL_SYMBOL.includes( consoleFilter.allowlist[ 0 ] ) ) ) )
						|| ( parts[ 0 ] && consoleFilter.allowlist && consoleFilter.allowlist.includes( parts[ 0 ] ) )
					) {
						if (
							!consoleFilter.blocklist
							|| ( consoleFilter.blocklist && !consoleFilter.blocklist.includes( parts[ 0 ] ) )
						) {
							proxy( ...args );
						}
					}
				}
			}
		};
	}

} )();
