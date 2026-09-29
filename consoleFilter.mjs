"use strict";

//@ts-check

/**
 * @class
 * @file consoleFilter.js
 * @implements {Classes.ConsoleFilterInternal}
 */
class ConsoleFilterInternal
{

	/**
	 * Own settings of the instance, `null` means shared static settings (`ConsoleFilter.settings`)
	 * @type {Types.Settings | null}
	 */
	#ownSettings = null;

	/** @type {Classes.ConsoleFilterInternal['settings']} */
	get settings ()
	{
		return this.#ownSettings ?? ConsoleFilter.settings;
	}
	set settings ( /** @type {Partial<Types.Settings>} */ newSettings )
	{
		if ( this.#ownSettings === null ) {
			ConsoleFilter.settings = newSettings;
			return;
		}
		this.#ownSettings = /** @type {Types.Settings} */ ( ConsoleFilterInternal.deepAssign( this.#ownSettings, newSettings ) );
	}

	/**
	 * @template T
	 * @param {...T} customArgs
	 * @returns {T}
	 * @type {Classes.ConsoleFilterInternal.deepAssign}
	 */
	static deepAssign ( /** @type {Array.<any>} */ ...customArgs )
	{

		/** @type {T & Object<string, any>} */
		let currentLevel = /** @type {T & Object<string, any>} */ ( {} );

		loopThroughAllCustomArgs:
		customArgs.forEach( ( /** @type {Object} */ source ) =>
		{
			if ( source instanceof Array ) {
				currentLevel = /** @type {T & Object<string, any>} */ ( source );
			} else if ( source !== null ) {
				loopThroughKeyValPairsObject:
				Object.entries( source ).forEach( ( [ key, value ] ) =>
				{
					if ( value instanceof Object && key in currentLevel ) {
						value = ConsoleFilterInternal.deepAssign( currentLevel[ key ], value );
					}
					currentLevel = /** @type {T & Object<string, any>} */ ( { ...currentLevel, [ key ]: value } );
				} );
			}
		} );

		return /** @type {T} */ ( currentLevel );
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['parseSettings']} */
	static parseSettings ( json, source )
	{
		if ( json.trim() === '' ) {
			return null;
		}

		/** @type {unknown} */
		let settings;

		try {
			settings = JSON.parse( json );
		} catch ( error ) {
			ConsoleFilterInternal.reportError( `consoleFilter: settings in ${ source } are not valid JSON, they are ignored.`, error );
			return null;
		}
		if ( settings === null || typeof settings !== 'object' || Array.isArray( settings ) ) {
			ConsoleFilterInternal.reportError( `consoleFilter: settings in ${ source } are not JSON object, they are ignored.` );
			return null;
		}
		return /** @type {Partial<Types.Settings>} */ ( settings );
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['reportError']} */
	static reportError ( ...data )
	{
		const nativeError = ConsoleFilterInternal.nativeConsoleMethods.error ?? globalThis.console?.error;
		if ( typeof nativeError === 'function' ) {
			Reflect.apply( nativeError, globalThis.console, data );
		}
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['normalizeText']} */
	static normalizeText ( text )
	{
		return text.replaceAll( '%c', ' ' ).trim().split( ' ' ).filter( word => word !== '' ).join( ' ' );
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['getFilterEntries']} */
	static getFilterEntries ( list )
	{
		return ( Array.isArray( list ) ? list : [ list ] )
			.filter( entry => typeof entry === 'string' )
			.map( entry => ConsoleFilterInternal.normalizeText( entry ) )
			.filter( entry => entry !== '' );
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['isSelectedAll']} */
	static isSelectedAll ( entries )
	{
		return entries.includes( ConsoleFilter.SYMBOLS_FOR_ALL.asterisk ) || entries.includes( ConsoleFilter.SYMBOLS_FOR_ALL.text );
	}

	/** @type {(typeof Classes.ConsoleFilterInternal)['hasMatchingEntry']} */
	static hasMatchingEntry ( entries, text )
	{
		return entries.some( entry => text === entry || text.startsWith( `${ entry } ` ) );
	}

	/** @type {Partial<Record<Types.ConsoleStaticMethods, Function>>} */
	static nativeConsoleMethods = {};

	static consoleIsSetup = false;

	/** @type {Types.OpenedGroup[]} */
	openedGroups = [];

	/** @type {Partial<Record<Types.ConsoleStaticMethods, Function>>} */
	nativeMethods = {};

	/** @type {HTMLElement[]} */
	bodyConsoleGroups = [];

	useAsyncLogger = false;

	/** @type { Classes.ConsoleFilterInternal[ 'constructor' ] } */
	constructor ( settingsElementId = 'console-filter-settings', hasOwnSettings = false )
	{
		if ( hasOwnSettings ) {
			this.#ownSettings = /** @type {Types.Settings} */ ( ConsoleFilterInternal.deepAssign( {}, ConsoleFilter.DEFAULT_SETTINGS ) );
		}
		this.readSettings( settingsElementId );
		this.setupConsole();
	}

	/** @type {Classes.ConsoleFilterInternal['readSettings']} */
	readSettings ( settingsElementId = 'console-filter-settings' )
	{
		ConsoleFilter.methods.readSettings.call( this, settingsElementId );
	}

	/** @type {Classes.ConsoleFilterInternal['setupConsole']} */
	setupConsole ()
	{
		if ( typeof window !== 'undefined' && !( 'console' in window ) ) {
			/** @type {{ console: Console }} */ ( window ).console = /** @type {Console} */ ( {} );
		}
		if ( typeof console === 'undefined' ) {
			return;
		}
		if ( ConsoleFilterInternal.consoleIsSetup ) {
			this.nativeMethods = ConsoleFilterInternal.nativeConsoleMethods;
			return;
		}

		/** @type {Types.ConsoleStaticMethods[]} */
		const methods = /** @type {Types.ConsoleStaticMethods[]} */ ( Object.keys( ConsoleFilter.methods ) );

		methods.forEach( method =>
		{
			const proxy = /** @type {Record<string, unknown>} */ ( /** @type {unknown} */ ( console ) )[ method ];
			const nativeMethod = typeof proxy === 'function' ? proxy : () => { };
			this.nativeMethods[ method ] = nativeMethod;
			ConsoleFilterInternal.nativeConsoleMethods[ method ] = nativeMethod;
			if ( this.settings.autoAppendConsole ) {
				( /** @type {Record<string, unknown>} */ ( /** @type {unknown} */ ( console ) ) )[ method ] = /** @param {...*} args */ ( ...args ) => this.handleConsoleMethod( method, nativeMethod, args );
			}
		} );
		ConsoleFilterInternal.consoleIsSetup = true;
	}

	/** @type {Classes.ConsoleFilterInternal['isAllowedMessage']} */
	isAllowedMessage ( importantPart )
	{
		const allowlist = ConsoleFilterInternal.getFilterEntries( this.settings.allowlist );
		return ConsoleFilterInternal.isSelectedAll( allowlist ) || ConsoleFilterInternal.hasMatchingEntry( allowlist, importantPart );
	}

	/** @type {Classes.ConsoleFilterInternal['isHiddenMessage']} */
	isHiddenMessage ( importantPart, isInsideAllowedGroup = false )
	{
		const allowlist = ConsoleFilterInternal.getFilterEntries( this.settings.allowlist );
		const blocklist = ConsoleFilterInternal.getFilterEntries( this.settings.blocklist );
		if ( ConsoleFilterInternal.hasMatchingEntry( blocklist, importantPart ) ) {
			return true;
		}
		const isRestricted = ConsoleFilterInternal.isSelectedAll( blocklist ) || ( allowlist.length > 0 && !ConsoleFilterInternal.isSelectedAll( allowlist ) );
		return isRestricted && !isInsideAllowedGroup && !this.isAllowedMessage( importantPart );
	}

	/** @type {Classes.ConsoleFilterInternal['getImportantPart']} */
	getImportantPart ( args )
	{
		return typeof args[ 0 ] === 'string' ? ConsoleFilterInternal.normalizeText( args[ 0 ] ) : '';
	}

	/** @type {Classes.ConsoleFilterInternal['callNativeMethod']} */
	callNativeMethod ( method, args = [] )
	{
		const argumentsList = Array.isArray( args ) ? args : [ args ];
		const stringIndexes = argumentsList.reduce( ( indexes, argument, index ) =>
		{
			if ( typeof argument === 'string' ) {
				indexes.push( index );
			}
			return indexes;
		}, [] );
		const outputArguments = argumentsList.slice();
		if ( stringIndexes.length ) {
			const firstStringIndex = stringIndexes[ 0 ];
			const lastStringIndex = stringIndexes[ stringIndexes.length - 1 ];
			outputArguments[ firstStringIndex ] = this.settings.texts.prefix + outputArguments[ firstStringIndex ];
			outputArguments[ lastStringIndex ] += this.settings.texts.suffix;
		}
		const convertedMethod = this.settings.forceConvertFunctions[ method ] ?? method;
		const nativeMethod = this.nativeMethods[ convertedMethod ];
		if ( typeof nativeMethod === 'function' ) {
			Reflect.apply( nativeMethod, console, outputArguments );
		}
		this.appendConsoleMessage( convertedMethod, outputArguments );
	}

	/** @type {Classes.ConsoleFilterInternal['appendConsoleMessage']} */
	appendConsoleMessage ( method, args )
	{
		if ( !this.settings.appendConsoleIntoBody || typeof document === 'undefined' || !document.body ) {
			return;
		}
		const outputId = 'console-filter-output';
		let output = document.getElementById( outputId );
		if ( !output ) {
			output = document.createElement( 'div' );
			output.id = outputId;
			document.body.appendChild( output );
		}
		if ( method === 'clear' ) {
			output.textContent = '';
			this.bodyConsoleGroups = [];
			return;
		}
		const message = args.map( argument =>
		{
			if ( typeof argument === 'string' ) {
				return argument;
			}
			try {
				return JSON.stringify( argument );
			} catch {
				return String( argument );
			}
		} ).join( ' ' ); /// @todo divider dát do settings.texts
		if ( method === ConsoleFilter.GROUP_OPENERS.group || method === ConsoleFilter.GROUP_OPENERS.groupCollapsed ) {
			const details = document.createElement( 'details' );
			details.open = method === ConsoleFilter.GROUP_OPENERS.group;
			const summary = document.createElement( 'summary' );
			summary.textContent = `${ method }: ${ message }`;
			details.appendChild( summary );
			const parent = this.bodyConsoleGroups[ this.bodyConsoleGroups.length - 1 ] ?? output;
			parent.appendChild( details );
			this.bodyConsoleGroups.push( details );
			return;
		}
		if ( method === 'groupEnd' ) {
			this.bodyConsoleGroups.pop();
			return;
		}
		const line = document.createElement( 'div' );
		line.textContent = `${ method }: ${ message }`;
		const parent = this.bodyConsoleGroups[ this.bodyConsoleGroups.length - 1 ] ?? output;
		parent.appendChild( line );
	}

	/** @type {Classes.ConsoleFilterInternal['outputCommand']} */
	outputCommand ( command )
	{
		const currentGroup = this.openedGroups[ this.openedGroups.length - 1 ];
		if ( this.useAsyncLogger && currentGroup ) {
			currentGroup.commands.push( command );
			return;
		}
		this.callNativeMethod( command.method, command.args );
	}

	/** @type {Classes.ConsoleFilterInternal['openGroup']} */
	openGroup ( command, isVisible, isAllowed )
	{

		/** @type {Types.OpenedGroup} */
		const group = { visible: isVisible, allowed: isAllowed, commands: [] };

		if ( isVisible && this.useAsyncLogger ) {
			group.commands.push( command );
		} else if ( isVisible ) {
			this.callNativeMethod( command.method, command.args );
		}
		this.openedGroups.push( group );
	}

	/** @type {Classes.ConsoleFilterInternal['closeGroup']} */
	closeGroup ( command )
	{
		const group = this.openedGroups.pop();
		if ( !group ) {
			// group was not opened through this filter (e.g. before import of this script)
			this.callNativeMethod( command.method, command.args );
			return;
		}
		if ( !group.visible ) {
			return;
		}
		if ( !this.useAsyncLogger ) {
			this.callNativeMethod( command.method, command.args );
			return;
		}
		group.commands.push( command );
		const parentGroup = this.openedGroups[ this.openedGroups.length - 1 ];
		if ( parentGroup ) {
			parentGroup.commands.push( ...group.commands );
			return;
		}
		group.commands.forEach( queuedCommand => this.callNativeMethod( queuedCommand.method, queuedCommand.args ) );
	}

	/** @type {Classes.ConsoleFilterInternal['handleConsoleMethod']} */
	handleConsoleMethod ( method, proxy, args )
	{

		/** @type {Types.ConsoleCommand} */
		const command = { method, proxy, args };

		if ( method === 'groupEnd' ) {
			this.closeGroup( command );
			return;
		}
		const parentGroup = this.openedGroups[ this.openedGroups.length - 1 ];
		const isInsideAllowedGroup = parentGroup?.allowed ?? false;
		// message of console.assert() starts after the condition
		const importantPart = this.getImportantPart( method === 'assert' ? args.slice( 1 ) : args );
		const isVisible = ( parentGroup?.visible ?? true ) && ( method === 'clear' || !this.isHiddenMessage( importantPart, isInsideAllowedGroup ) );
		if ( method === ConsoleFilter.GROUP_OPENERS.group || method === ConsoleFilter.GROUP_OPENERS.groupCollapsed ) {
			this.openGroup( command, isVisible, isInsideAllowedGroup || this.isAllowedMessage( importantPart ) );
			return;
		}
		if ( isVisible ) {
			this.outputCommand( command );
		}
	}
}

/**
 * @class
 * @extends ConsoleFilterInternal
 * @implements {Classes.ConsoleFilter}
 * @version 1.0
 * @since Q3 2026
 * @file consoleFilter.js
 * @description Make native `console.log()` (and other console methods) proxied and filtered by text string
 * @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
 * @author ic<ic.czech+console-filter@gmail.com>
 * @see {@link https://github.com/iiic/consoleFilter.js|GitHub}
 * @see {@link https://iiic.dev/console-filter#github|homepage}
 */
class ConsoleFilter extends ConsoleFilterInternal
{

	/** @type {Types.Settings | null} */
	static #staticSettings = null;

	/** @type { Classes.ConsoleFilter.SYMBOLS_FOR_ALL } */
	static get SYMBOLS_FOR_ALL ()
	{
		return {
			asterisk: /** @type {'*'} */ '*',
			text: /** @type {'all'} */ 'all'
		};
	}

	/** @type { Classes.ConsoleFilter.GROUP_OPENERS } */
	static get GROUP_OPENERS ()
	{
		return {
			group: /** @type {'group'} */ 'group',
			groupCollapsed: /** @type {'groupCollapsed'} */ 'groupCollapsed'
		};
	}

	/** @type {Classes.ConsoleFilter.SETTINGS_URL_PARAMETER } */
	static get SETTINGS_URL_PARAMETER ()
	{
		return 'settings';
	}

	/** @type {Types.Settings} */
	static get settings ()
	{
		if ( ConsoleFilter.#staticSettings === null ) {
			ConsoleFilter.#staticSettings = /** @type {Types.Settings} */ ( ConsoleFilterInternal.deepAssign( {}, ConsoleFilter.DEFAULT_SETTINGS ) );
		}
		return ConsoleFilter.#staticSettings;
	}
	static set settings ( /** @type {Partial<Types.Settings>} */ newSettings )
	{
		if ( ConsoleFilter.#staticSettings === null ) {
			ConsoleFilter.#staticSettings = /** @type {Types.Settings} */ ( ConsoleFilterInternal.deepAssign( {}, ConsoleFilter.DEFAULT_SETTINGS ) );
		}
		ConsoleFilter.#staticSettings = /** @type {Types.Settings} */ ( ConsoleFilterInternal.deepAssign( ConsoleFilter.#staticSettings, newSettings ) );
	}

	/** @type { Classes.ConsoleFilter.methods } */
	static methods = {
		readSettings: function ( /** @type {string} */ settingsElementId = 'console-filter-settings' )
		{
			const settingsTarget = this instanceof ConsoleFilterInternal ? this : ConsoleFilter;
			const jsonInUrl = new URL( import.meta.url ).searchParams.get( ConsoleFilter.SETTINGS_URL_PARAMETER );
			const settingsFromUrl = jsonInUrl
				? ConsoleFilterInternal.parseSettings( jsonInUrl, `URL parameter "${ ConsoleFilter.SETTINGS_URL_PARAMETER }"` )
				: null;
			if ( settingsFromUrl ) {
				settingsTarget.settings = settingsFromUrl;
			}
			if ( typeof document === 'undefined' ) {
				return;
			}
			const settingsElement = document.getElementById( settingsElementId );
			const settingsFromElement = settingsElement instanceof HTMLScriptElement
				? ConsoleFilterInternal.parseSettings( settingsElement.text, `element #${ settingsElementId }` )
				: null;
			if ( settingsFromElement ) {
				settingsTarget.settings = settingsFromElement;
			}
		},
		assert: function ( /** @type {boolean} */ condition, /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'assert', [ condition, ...data ] ); },
		clear: function () { callConsoleMethod( this, 'clear', [] ); },
		count: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'count', Array.from( arguments ) ); },
		countReset: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'countReset', Array.from( arguments ) ); },
		debug: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'debug', data ); },
		dir: function ( /** @type {any} */ item, /** @type {any} */ options ) { callConsoleMethod( this, 'dir', Array.from( arguments ) ); },
		dirxml: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'dirxml', data ); },
		error: function ( /** @type {any[]} */...data ) { callConsoleMethod( this, 'error', data ); },
		group: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'group', Array.from( arguments ) ); },
		groupCollapsed: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'groupCollapsed', Array.from( arguments ) ); },
		groupEnd: function () { callConsoleMethod( this, 'groupEnd', [] ); },
		info: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'info', data ); },
		log: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'log', data ); },
		table: function ( /** @type {any} */ tabularData, /** @type {any} */ properties ) { callConsoleMethod( this, 'table', Array.from( arguments ) ); },
		time: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'time', Array.from( arguments ) ); },
		timeEnd: function ( /** @type {string | undefined} */ label ) { callConsoleMethod( this, 'timeEnd', Array.from( arguments ) ); },
		timeLog: function ( /** @type {string | undefined} */ label, /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'timeLog', [ label, ...data ] ); },
		trace: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'trace', data ); },
		warn: function ( /** @type {any[]} */ ...data ) { callConsoleMethod( this, 'warn', data ); }
	};

	/** @type {Classes.ConsoleFilter['constructor']} */
	constructor ( settingsElementId = 'console-filter-settings', hasOwnSettings = false )
	{
		super( settingsElementId, hasOwnSettings );
		this.useAsyncLogger = true;
	}

	/** @type {Classes.ConsoleFilter['createAsyncLogger']} */
	createAsyncLogger ()
	{
		const logger = Object.create( console );

		/** @type {Types.ConsoleMethodNames[]} */
		const methods = /** @type {Types.ConsoleMethodNames[]} */ ( Object.keys( ConsoleFilter.methods ) );

		methods.forEach( method =>
		{
			const methodFunc = ConsoleFilter.methods[ method ];
			if ( typeof methodFunc === 'function' ) {
				logger[ method ] = methodFunc.bind( this );
			}
		} );

		return logger;
	}
}

/** @type {Classes.ConsoleFilter.DEFAULT_SETTINGS} */
Object.defineProperty( ConsoleFilter, 'DEFAULT_SETTINGS', {
	get: function ()
	{
		return {
			allowlist: [],
			blocklist: [],
			autoAppendConsole: true,
			appendConsoleIntoBody: false,
			forceConvertFunctions: { // Possible to change some console function to another. Null means not convert
				log: null,
				warn: null,
				error: null,
				info: null,
			},
			texts: {
				prefix: '',
				suffix: '',
			}
		};
	},
	configurable: false,
	enumerable: true,
} );

/** @param {ConsoleFilterInternal|typeof ConsoleFilter.methods} context @param {Types.ConsoleStaticMethods} method @param {unknown[]} args */
function callConsoleMethod ( context, method, args )
{
	const instance = context instanceof ConsoleFilterInternal ? context : defaultConsoleFilter;
	instance.handleConsoleMethod( method, instance.nativeMethods[ method ], args );
}

class AsyncLogger
{
	constructor ( settingsElementId = 'console-filter-settings' )
	{
		// own settings, read from default settings, URL parameter and JSON element of the page
		const cf = new ConsoleFilter( settingsElementId, true );

		/** @type {Types.ConsoleMethodNames[]} */
		const methods = /** @type {Types.ConsoleMethodNames[]} */ ( Object.keys( ConsoleFilter.methods ) );

		/** @type {Object<string, any>} */
		const logger = {};

		methods.forEach( method =>
		{
			const methodFunc = ConsoleFilter.methods[ method ];
			if ( typeof methodFunc === 'function' ) {
				logger[ method ] = methodFunc.bind( cf );
			}
		} );

		Object.defineProperty( logger, 'settings', {
			get: () => cf.settings,
			set: ( newSettings ) => { cf.settings = newSettings; },
			enumerable: true,
			configurable: true
		} );

		return logger;
	}
}

// Filter for native console and static methods, with settings loaded during module import. It writes messages
// immediately, only AsyncLogger (ConsoleFilter instances) holds content of groups until the group is closed.
const defaultConsoleFilter = new ConsoleFilterInternal();

const { methods } = ConsoleFilter;

export { ConsoleFilter, methods, AsyncLogger };
