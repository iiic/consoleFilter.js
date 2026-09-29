/**
 * @file consoleFilter.globals.d.ts
 * @description TypeScript global declarations for ConsoleFilter.
 * @version 1.0
 * @since Q3 2026
 * @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
 * @author ic<ic.czech+console-filter@gmail.com>
 * @see {@link https://github.com/iiic/consoleFilter.js|GitHub}
 * @see {@link https://iiic.dev/console-filter#github|homepage}
 */

declare global {
	namespace Types {

		/** Names of block html elements (element 'a' can be both, block or inline depends on its content) */
		type BlockHTMLElements = 'body' | 'a' | 'address' | 'article' | 'aside' | 'blockquote' | 'dd' | 'div' | 'dl' | 'dt' | 'figcaption' | 'figure' | 'footer' | 'form' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'header' | 'hgroup' | 'hr' | 'main' | 'menu' | 'nav' | 'ol' | 'p' | 'pre' | 'search' | 'section' | 'ul' | 'canvas' | 'noscript' | 'details' | 'dialog' | 'table';

		/** Names of inline html elements (element 'a' can be both, block or inline depends on its content) */
		type InlineHTMLElements = 'a' | 'abbr' | 'b' | 'bdi' | 'bdo' | 'br' | 'cite' | 'code' | 'data' | 'dfn' | 'em' | 'i' | 'kbd' | 'mark' | 'q' | 'ruby' | 'rp' | 'rt' | 's' | 'samp' | 'small' | 'span' | 'strong' | 'sub' | 'sup' | 'time' | 'u' | 'var' | 'wbr' | 'area';

		/** Names of special html elements (all other elements that are neither block nor inline) */
		type SpecialHTMLElements = 'html' | 'base' | 'head' | 'link' | 'meta' | 'script' | 'style' | 'title' | 'svg' | 'math' | 'caption' | 'col' | 'colgroup' | 'tbody' | 'td' | 'tfoot' | 'th' | 'thead' | 'tr' | 'datalist' | 'fieldset' | 'legend' | 'optgroup' | 'option' | 'selectedcontent' | 'slot' | 'summary' | 'template' | 'geolocation';

		/** Names of static methods of the regular console object (in window) */
		type ConsoleStaticMethods = 'assert' | 'clear' | 'count' | 'countReset' | 'debug' | 'dir' | 'dirxml' | 'error' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'table' | 'time' | 'timeEnd' | 'timeLog' | 'trace' | 'warn';

		/** All console method names including custom readSettings */
		type ConsoleMethodNames = ConsoleStaticMethods | 'readSettings';

		/** Settings for ConsoleFilter */
		type Settings = {

			/**
			 * Beginnings of messages (whole words) that are allowed, when not empty only they are written.
			 * '*' or 'all' allows everything
			 */
			allowlist?: string | string[],

			/**
			 * Beginnings of messages (whole words) that are hidden, it has priority over allowlist.
			 * '*' or 'all' hides everything except allowlist
			 */
			blocklist?: string | string[],

			/** Automatically appends the console to the document */
			autoAppendConsole: boolean,

			/** Write console logs also into document.body */
			appendConsoleIntoBody: boolean,

			/** Possible to change some console function to another. Null means not convert. */
			forceConvertFunctions: Partial<Record<ConsoleStaticMethods, ConsoleStaticMethods | null>>,

			/** All written text in this class */
			texts: {

				/** Text added before each console message */
				prefix: string,

				/** Text added after each console message */
				suffix: string,

			},
		};

		/** Names and values used to select all console messages */
		type SymbolsForAll = {

			/** Symbol used to select all messages */
			asterisk: '*',

			/** Text value used to select all messages */
			text: 'all',

		};

		/** Base console methods without this context */
		type ConsoleMethodsBase = {

			/** Reads filtering settings from the settings element */
			readSettings: ( settingsElementId?: string ) => void,

			/** Tests a condition and logs data when it is false */
			assert: ( condition: boolean, ...data: any[] ) => void,

			/** Clears the console */
			clear: () => void,

			/** Increments and displays a counter */
			count: ( label?: string ) => void,

			/** Resets a counter */
			countReset: ( label?: string ) => void,

			/** Logs a debug message */
			debug: ( ...data: any[] ) => void,

			/** Displays an interactive object representation */
			dir: ( item: any, options?: any ) => void,

			/** Displays an XML representation of an object */
			dirxml: ( ...data: any[] ) => void,

			/** Logs an error message */
			error: ( ...data: any[] ) => void,

			/** Starts a console group */
			group: ( label?: string ) => void,

			/** Starts a collapsed console group */
			groupCollapsed: ( label?: string ) => void,

			/** Ends the current console group */
			groupEnd: () => void,

			/** Logs an informational message */
			info: ( ...data: any[] ) => void,

			/** Logs a general message */
			log: ( ...data: any[] ) => void,

			/** Displays tabular data */
			table: ( tabularData: any, properties?: any ) => void,

			/** Starts a timer */
			time: ( label?: string ) => void,

			/** Stops a timer and displays its duration */
			timeEnd: ( label?: string ) => void,

			/** Displays a timer value without stopping the timer */
			timeLog: ( label?: string, ...data: any[] ) => void,

			/** Logs a stack trace */
			trace: ( ...data: any[] ) => void,

			/** Logs a warning message */
			warn: ( ...data: any[] ) => void,

		};

		/** Methods exposed by a ConsoleFilter logger with this context */
		type ConsoleMethods = {
			[K in keyof ConsoleMethodsBase]: ( this: any, ...args: Parameters<ConsoleMethodsBase[K]> ) => ReturnType<ConsoleMethodsBase[K]>
		};

		/** Map of native console methods */
		type NativeMethods = Partial<Record<ConsoleStaticMethods, Function>>;

		/** One call of a console method */
		type ConsoleCommand = {

			/** Name of the console method */
			method: ConsoleStaticMethods,

			/** Native console method (can be missing in some environments) */
			proxy: Function | undefined,

			/** Arguments passed to the method */
			args: any[],

		};

		/** State of an opened console group */
		type OpenedGroup = {

			/** Whether the group (and its content) is visible */
			visible: boolean,

			/** Whether the group matches allowlist (or is inside such group), its whole content is allowed then */
			allowed: boolean,

			/** Commands held until the group is closed (only for asynchronous logger) */
			commands: ConsoleCommand[],

		};

		namespace Getters {

			/** Names of methods that open console groups */
			type GROUP_OPENERS = {

				/** Opens an expanded console group */
				group: 'group';

				/** Opens a collapsed console group */
				groupCollapsed: 'groupCollapsed';

			};


			/** Symbols used to select all messages from the getter namespace */
			type SYMBOLS_FOR_ALL = {

				/** Asterisk symbol used to select all messages */
				asterisk: '*';

				/** Text value used to select all messages */
				text: 'all';

			};

			/** This returns string possible to place into url get parameter to set settings */
			type SETTINGS_URL_PARAMETER = 'settings';

		};
	};

	namespace Classes {

		/** Internal class, not accessible from outside the script */
		class ConsoleFilterInternal {

			/** Captured native console methods shared by all instances */
			static nativeConsoleMethods: Types.NativeMethods;

			/** Whether the global console has been configured */
			static consoleIsSetup: boolean;

			/** Recursively merges settings and other objects */
			static deepAssign<T>( ...customArgs: Array.<any> ): T;

			/** Text used for filtering: without `%c` directives, whitespace at the ends and repeated spaces */
			static normalizeText( text: string ): string;

			/** Normalized non-empty entries of allowlist or blocklist */
			static getFilterEntries( list: string | string[] | undefined ): string[];

			/** Whether entries contain symbol for all messages ('*' or 'all') */
			static isSelectedAll( entries: string[] ): boolean;

			/** Whether text starts with some of the entries (as whole words) */
			static hasMatchingEntry( entries: string[], text: string ): boolean;

			/** Current settings (returned throw getter function) */
			get settings(): Types.Settings;

			/** Current settings (with setter function for safety) */
			set settings( newSettings: Partial<Types.Settings> );

			/** Currently opened console groups (the last one is the innermost group) */
			openedGroups: Types.OpenedGroup[];

			/** Captured native console methods */
			nativeMethods: Types.NativeMethods;

			/** Open groups currently rendered in document.body */
			bodyConsoleGroups: HTMLElement[];

			/** Whether content of groups is held until the group is closed (true for ConsoleFilter instances) */
			useAsyncLogger: boolean;

			/** Constructor for ConsoleFilterInternal */
			constructor ( settingsElementId?: string );

			/** Reads filtering settings from the settings element */
			readSettings( settingsElementId?: string ): void;

			/** Replaces the global console methods with filtered methods */
			setupConsole(): void;

			/** Whether message matches allowlist (or allowlist allows everything) */
			isAllowedMessage( importantPart: string ): boolean;

			/** Whether message should be hidden according to blocklist and allowlist */
			isHiddenMessage( importantPart: string, isInsideAllowedGroup?: boolean ): boolean;

			/** Text used for filtering: normalized first argument when it is a string, otherwise empty string */
			getImportantPart( args: any[] ): string;

			/** Calls a captured native console method */
			callNativeMethod( method: Types.ConsoleStaticMethods, args?: any[] | any ): void;

			/** Appends a console message to the document body */
			appendConsoleMessage( method: Types.ConsoleStaticMethods, args: any[] ): void;

			/** Writes a visible command, or holds it in the current group of asynchronous logger */
			outputCommand( command: Types.ConsoleCommand ): void;

			/** Opens a console group, content of an invisible group is hidden, content of an allowed group is allowed */
			openGroup( command: Types.ConsoleCommand, isVisible: boolean, isAllowed: boolean ): void;

			/** Closes the innermost console group (asynchronous logger writes held content of the outermost group) */
			closeGroup( command: Types.ConsoleCommand ): void;

			/** Handles a call to a console method */
			handleConsoleMethod( method: Types.ConsoleStaticMethods, proxy: Function | undefined, args: any[] ): void;

		}

		/** Public exportable part */
		class ConsoleFilter extends ConsoleFilterInternal {

			/** Current shared settings */
			static get settings(): Types.Settings;
			static set settings( newSettings: Partial<Types.Settings> );

			/** Methods exposed by ConsoleFilter */
			static methods: Types.ConsoleMethods;

			/** Get list */
			static get GROUP_OPENERS(): Types.Getters.GROUP_OPENERS;

			/** Returns symbols used to select all messages */
			static get SYMBOLS_FOR_ALL(): Types.Getters.SYMBOLS_FOR_ALL;

			/** Returns name of settings get http parameter */
			static get SETTINGS_URL_PARAMETER(): Types.Getters.SETTINGS_URL_PARAMETER;

			/** Constructor for ConsoleFilter */
			constructor ( settingsElementId?: string );

			/** Creates an asynchronous console logger */
			createAsyncLogger(): Types.ConsoleMethods;

			/** Returns default settings for ConsoleFilter */
			static get DEFAULT_SETTINGS(): Types.Settings;

		}

		namespace ConsoleFilter {

			type SYMBOLS_FOR_ALL = Types.SymbolsForAll;

			type GROUP_OPENERS = Types.Getters.GROUP_OPENERS;

			type SETTINGS_URL_PARAMETER = Types.Getters.SETTINGS_URL_PARAMETER;

			type methods = Types.ConsoleMethods;

			type DEFAULT_SETTINGS = Types.Settings;

		}
	};

};

declare const ConsoleFilter: typeof Classes.ConsoleFilter;

/** Default ConsoleFilter methods */
declare const methods: Types.ConsoleMethods;

/** Constructor for an asynchronous console logger */
declare const AsyncLogger: {

	/** Creates an asynchronous console logger */
	new( settingsElementId?: string ): Types.ConsoleMethods & {
		settings: Types.Settings;
	};

};

export { ConsoleFilter, methods, AsyncLogger };
