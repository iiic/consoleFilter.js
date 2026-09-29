const { ConsoleFilter, methods, AsyncLogger } = await import( './consoleFilter.mjs?v=1.0&settings=' + encodeURIComponent( JSON.stringify( {
	appendConsoleIntoBody: true,
} ) ) );
const { applySettings, clearSettings, group, groupClosed, it, assert } = await import( './modules/ictest.mjs?v=0.1&settings=' + JSON.stringify( {
	nastaveni: {
		a: true,
	},
} ) );

const JSON_SETTINGS_ID = 'console-filter-settings';
const OUTPUT_ID = 'console-filter-output';

let markerCount = 0;

/** @returns {string} unique text to find a message in the output mirror in document body */
const createMarker = () => `[marker ${ ++markerCount }]`;

/** @param {string} text @returns {boolean} whether the text is written in the output mirror in document body */
const isInOutput = ( text ) => document.getElementById( OUTPUT_ID )?.textContent?.includes( text ) ?? false;

/** @param {string} title @returns {HTMLElement | null} group (details element) of the output mirror with the title */
const getOutputGroup = ( title ) => [ ...document.querySelectorAll( `#${ OUTPUT_ID } summary` ) ]
	.find( ( summary ) => summary.textContent?.includes( title ) )?.parentElement ?? null;

/** @param {Function} write @returns {boolean} whether calling write() added a line into the output mirror */
const isWritten = ( write ) =>
{
	const linesCount = document.querySelectorAll( `#${ OUTPUT_ID } div` ).length;
	write();
	return document.querySelectorAll( `#${ OUTPUT_ID } div` ).length > linesCount;
};

/** @param {Object} settings @returns {any} new AsyncLogger with the settings, writing into the output mirror */
const createLogger = ( settings ) =>
{
	const logger = new AsyncLogger();
	logger.settings = { appendConsoleIntoBody: true, ...settings };
	return logger;
};

/** @param {Object} settings @param {Function} fn runs synchronous fn with temporarily changed global settings */
const withGlobalSettings = ( settings, fn ) =>
{
	const originalSettings = structuredClone( ConsoleFilter.settings );
	ConsoleFilter.settings = settings;
	try {
		fn();
	} finally {
		ConsoleFilter.settings = originalSettings;
	}
};

console.log( 'All tests are only in browser\'s console… here in document body it\'s mirror' );

await groupClosed( 'Test runtime (ictest)', async () =>
{

	await it( 'Failed negated assertion does not negate following assertions', () =>
	{
		let hasFailed = false;
		try {
			assert( 1 ).not.equal( 1 );
		} catch {
			hasFailed = true;
		}
		assert( hasFailed ).equal( true );
	} );

	await it( 'toBeDefined() accepts falsy values, not.toBeDefined() accepts only undefined', () =>
	{
		assert( 0 ).toBeDefined();
		assert( false ).toBeDefined();
		assert( '' ).toBeDefined();
		assert( null ).toBeDefined();
		assert( undefined ).not.toBeDefined();
	} );

} );

await group( 'Static tests', async () =>
{

	await it( 'ConsoleFilter should have DEFAULT_SETTINGS defined as Object', async () =>
	{
		assert( ConsoleFilter.DEFAULT_SETTINGS ).toBeDefined();
		assert( ConsoleFilter.DEFAULT_SETTINGS ).toBeInstanceOf( Object );
	} );

	await it( 'ConsoleFilter.DEFAULT_SETTINGS should be read only', async () =>
	{
		assert( ConsoleFilter ).hasReadOnlyProperty( 'DEFAULT_SETTINGS' );
	} );

	await it( 'It\'s possible to add static property and new property is NOT read-only', async () =>
	{
		const propertyName = 'nonExistingProperty';
		ConsoleFilter[ propertyName ] = propertyName;
		assert( ConsoleFilter ).not.hasReadOnlyProperty( propertyName );
		assert( ConsoleFilter[ propertyName ] ).equal( propertyName );
	} );

	await group( 'Current static Settings', async () =>
	{

		await it( 'Set static settings directly', async () =>
		{
			const prefixValue = 'first random text prefix for all text messages into console';
			const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
			ConsoleFilter.settings.texts.prefix = prefixValue;
			assert( ConsoleFilter.settings.texts.prefix ).equal( prefixValue );
			ConsoleFilter.settings.texts.prefix = defaultPrefixValue;
			assert( ConsoleFilter.settings.texts.prefix ).equal( defaultPrefixValue );
		} );

		await it( 'Set static settings by json object identified by id', async () =>
		{
			const prefixValue = 'second random text prefix for all text messages into console';
			const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
			applySettings( JSON_SETTINGS_ID, {
				texts: {
					prefix: prefixValue
				}
			} );
			ConsoleFilter.methods.readSettings();
			assert( ConsoleFilter.settings.texts.prefix ).equal( prefixValue );
			ConsoleFilter.settings.texts.prefix = defaultPrefixValue;
			assert( ConsoleFilter.settings.texts.prefix ).equal( defaultPrefixValue );
			clearSettings( JSON_SETTINGS_ID );
		} );

	} );

	await groupClosed( 'Static methods of consoleFilter should not contains deprecated or non-standard methods of native console', async () =>
	{
		await it( 'exception', () =>
		{
			assert( methods.exception ).not.toBeDefined();
		} );
		await it( 'profile', () =>
		{
			assert( methods.profile ).not.toBeDefined();
		} );
		await it( 'profileEnd', () =>
		{
			assert( methods.profileEnd ).not.toBeDefined();
		} );
		await it( 'timeStamp', () =>
		{
			assert( methods.timeStamp ).not.toBeDefined();
		} );
	} );

} );

await group( 'Dynamic tests', async () =>
{
	const console = new AsyncLogger();
	console.settings.appendConsoleIntoBody = true;

	await it( 'It\'s possible to add dynamic property and new property is NOT read-only', () =>
	{
		const propertyName = 'nonExistingProperty';
		console[ propertyName ] = propertyName;
		assert( console ).not.hasReadOnlyProperty( propertyName );
		assert( console[ propertyName ] ).equal( propertyName );
	} );

	await groupClosed( 'Dynamic methods of consoleFilter should have all methods like native console:', async () =>
	{
		await it( 'assert', () =>
		{
			assert( console.assert ).toBeDefined();
			assert( console.assert ).toBeInstanceOf( Function );
		} );
		await it( 'clear', () =>
		{
			assert( console.clear ).toBeDefined();
			assert( console.clear ).toBeInstanceOf( Function );
		} );
		await it( 'count', () =>
		{
			assert( console.count ).toBeDefined();
			assert( console.count ).toBeInstanceOf( Function );
		} );
		await it( 'countReset', () =>
		{
			assert( console.countReset ).toBeDefined();
			assert( console.countReset ).toBeInstanceOf( Function );
		} );
		await it( 'debug', () =>
		{
			assert( console.debug ).toBeDefined();
			assert( console.debug ).toBeInstanceOf( Function );
		} );
		await it( 'dir', () =>
		{
			assert( console.dir ).toBeDefined();
			assert( console.dir ).toBeInstanceOf( Function );
		} );
		await it( 'dirxml', () =>
		{
			assert( console.dirxml ).toBeDefined();
			assert( console.dirxml ).toBeInstanceOf( Function );
		} );
		await it( 'error', () =>
		{
			assert( console.error ).toBeDefined();
			assert( console.error ).toBeInstanceOf( Function );
		} );
		await it( 'group', () =>
		{
			assert( console.group ).toBeDefined();
			assert( console.group ).toBeInstanceOf( Function );
		} );
		await it( 'groupCollapsed', () =>
		{
			assert( console.groupCollapsed ).toBeDefined();
			assert( console.groupCollapsed ).toBeInstanceOf( Function );
		} );
		await it( 'groupEnd', () =>
		{
			assert( console.groupEnd ).toBeDefined();
			assert( console.groupEnd ).toBeInstanceOf( Function );
		} );
		await it( 'info', () =>
		{
			assert( console.info ).toBeDefined();
			assert( console.info ).toBeInstanceOf( Function );
		} );
		await it( 'log', () =>
		{
			assert( console.log ).toBeDefined();
			assert( console.log ).toBeInstanceOf( Function );
		} );
		await it( 'table', () =>
		{
			assert( console.table ).toBeDefined();
			assert( console.table ).toBeInstanceOf( Function );
		} );
		await it( 'time', () =>
		{
			assert( console.time ).toBeDefined();
			assert( console.time ).toBeInstanceOf( Function );
		} );
		await it( 'timeEnd', () =>
		{
			assert( console.timeEnd ).toBeDefined();
			assert( console.timeEnd ).toBeInstanceOf( Function );
		} );
		await it( 'timeLog', () =>
		{
			assert( console.timeLog ).toBeDefined();
			assert( console.timeLog ).toBeInstanceOf( Function );
		} );
		await it( 'trace', () =>
		{
			assert( console.trace ).toBeDefined();
			assert( console.trace ).toBeInstanceOf( Function );
		} );
		await it( 'warn', () =>
		{
			assert( console.warn ).toBeDefined();
			assert( console.warn ).toBeInstanceOf( Function );
		} );
	} );

	await groupClosed( 'Static methods of consoleFilter should have all methods like native console:', async () =>
	{
		await it( 'assert', () =>
		{
			assert( methods.assert ).toBeDefined();
			assert( methods.assert ).toBeInstanceOf( Function );
		} );
		await it( 'clear', () =>
		{
			assert( methods.clear ).toBeDefined();
			assert( methods.clear ).toBeInstanceOf( Function );
		} );
		await it( 'count', () =>
		{
			assert( methods.count ).toBeDefined();
			assert( methods.count ).toBeInstanceOf( Function );
		} );
		await it( 'countReset', () =>
		{
			assert( methods.countReset ).toBeDefined();
			assert( methods.countReset ).toBeInstanceOf( Function );
		} );
		await it( 'debug', () =>
		{
			assert( methods.debug ).toBeDefined();
			assert( methods.debug ).toBeInstanceOf( Function );
		} );
		await it( 'dir', () =>
		{
			assert( methods.dir ).toBeDefined();
			assert( methods.dir ).toBeInstanceOf( Function );
		} );
		await it( 'dirxml', () =>
		{
			assert( methods.dirxml ).toBeDefined();
			assert( methods.dirxml ).toBeInstanceOf( Function );
		} );
		await it( 'error', () =>
		{
			assert( methods.error ).toBeDefined();
			assert( methods.error ).toBeInstanceOf( Function );
		} );
		await it( 'group', () =>
		{
			assert( methods.group ).toBeDefined();
			assert( methods.group ).toBeInstanceOf( Function );
		} );
		await it( 'groupCollapsed', () =>
		{
			assert( methods.groupCollapsed ).toBeDefined();
			assert( methods.groupCollapsed ).toBeInstanceOf( Function );
		} );
		await it( 'groupEnd', () =>
		{
			assert( methods.groupEnd ).toBeDefined();
			assert( methods.groupEnd ).toBeInstanceOf( Function );
		} );
		await it( 'info', () =>
		{
			assert( methods.info ).toBeDefined();
			assert( methods.info ).toBeInstanceOf( Function );
		} );
		await it( 'log', () =>
		{
			assert( methods.log ).toBeDefined();
			assert( methods.log ).toBeInstanceOf( Function );
		} );
		await it( 'table', () =>
		{
			assert( methods.table ).toBeDefined();
			assert( methods.table ).toBeInstanceOf( Function );
		} );
		await it( 'time', () =>
		{
			assert( methods.time ).toBeDefined();
			assert( methods.time ).toBeInstanceOf( Function );
		} );
		await it( 'timeEnd', () =>
		{
			assert( methods.timeEnd ).toBeDefined();
			assert( methods.timeEnd ).toBeInstanceOf( Function );
		} );
		await it( 'timeLog', () =>
		{
			assert( methods.timeLog ).toBeDefined();
			assert( methods.timeLog ).toBeInstanceOf( Function );
		} );
		await it( 'trace', () =>
		{
			assert( methods.trace ).toBeDefined();
			assert( methods.trace ).toBeInstanceOf( Function );
		} );
		await it( 'warn', () =>
		{
			assert( methods.warn ).toBeDefined();
			assert( methods.warn ).toBeInstanceOf( Function );
		} );
	} );

	await it( 'Settings on ConsoleFilter.settings and (new AsyncLogger).settings are separate', () =>
	{
		const prefixValue = 'third random text prefix for all text messages into console';
		const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
		ConsoleFilter.settings.texts.prefix = prefixValue;
		const newInstance = new AsyncLogger();
		assert( newInstance.settings.texts.prefix ).not.equal( ConsoleFilter.settings.texts.prefix );
		ConsoleFilter.settings.texts.prefix = defaultPrefixValue;
	} );

	await it( 'Instance readSettings should set instance settings', () =>
	{
		const prefixValue = 'instance text prefix';
		const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
		applySettings( JSON_SETTINGS_ID, {
			texts: {
				prefix: prefixValue
			}
		} );
		const newInstance = new ConsoleFilter();
		newInstance.readSettings();
		clearSettings( JSON_SETTINGS_ID );
		const instancePrefixValue = newInstance.settings.texts.prefix;
		// instance without own settings shares global settings, so restore them
		ConsoleFilter.settings.texts.prefix = defaultPrefixValue;
		assert( instancePrefixValue ).equal( prefixValue );
	} );

	await it( 'Force change one console command to another', () =>
	{
		const marker = createMarker();
		applySettings( JSON_SETTINGS_ID, {
			forceConvertFunctions: {
				log: 'warn'
			}
		} );
		const newInstance = new AsyncLogger();
		newInstance.readSettings();
		clearSettings( JSON_SETTINGS_ID );
		newInstance.log( `this console.log() should be changed to console.warn() ${ marker }` );
		assert( isInOutput( `warn: this console.log() should be changed to console.warn() ${ marker }` ) ).equal( true );
	} );

	await it( 'Prefix is added before and suffix after the visible text of a message', () =>
	{
		const marker = createMarker();
		const newInstance = createLogger( {
			texts: {
				prefix: '[prefix] ',
				suffix: ' [suffix]'
			}
		} );
		newInstance.log( `%cstyled ${ marker }`, 'color: red' );
		newInstance.log( `plain ${ marker }`, 'last' );
		assert( isInOutput( `log: [prefix] %cstyled ${ marker } [suffix] color: red` ) ).equal( true );
		assert( isInOutput( `log: [prefix] plain ${ marker } last [suffix]` ) ).equal( true );
	} );

	await it( 'AsyncLogger does not mix groups of asynchronous methods', async () =>
	{
		const C = class
		{

			color;
			label;
			console;
			running;

			constructor ( /** @type {String} */ color, /** @type {String} */ label )
			{
				this.color = `font-weight: strong; color: ${ color }`;
				this.label = label;
				this.console = new AsyncLogger();
				this.console.settings.appendConsoleIntoBody = true;
				this.running = this.run();
			}

			async run ()
			{
				this.console.groupCollapsed( '%c Class C ', this.color, this.label );
				this.console.log( '%c run', this.color, this.label );
				await this.asyncMethod();
				this.syncMethod();
				this.console.groupEnd();
			}

			async asyncMethod ()
			{
				return new Promise( ( resolve ) =>
				{
					setTimeout( () =>
					{
						this.console.log( '%c asyncMethod', this.color, this.label );
						resolve( true );
					}, 99 );
				} );
			}

			syncMethod ()
			{
				this.console.group( '%c syncMethod', this.color, this.label );
				this.subSyncMethod();
				this.console.groupEnd();
			}

			subSyncMethod ()
			{
				this.console.log( '%c subSyncMethod', this.color, this.label );
			}
		};

		const [ redLabel, greenLabel ] = [ createMarker(), createMarker() ];
		const red = new C( 'red', redLabel );
		const green = new C( 'green', greenLabel );
		await Promise.all( [ red.running, green.running ] );
		const redGroupText = getOutputGroup( redLabel )?.textContent ?? '';
		const greenGroupText = getOutputGroup( greenLabel )?.textContent ?? '';
		assert( redGroupText.includes( `asyncMethod font-weight: strong; color: red ${ redLabel }` ) ).equal( true );
		assert( redGroupText.includes( `subSyncMethod font-weight: strong; color: red ${ redLabel }` ) ).equal( true );
		assert( greenGroupText.includes( `asyncMethod font-weight: strong; color: green ${ greenLabel }` ) ).equal( true );
		assert( redGroupText.includes( greenLabel ) ).equal( false );
		assert( greenGroupText.includes( redLabel ) ).equal( false );
	} );

	await it( 'AsyncLogger.readSettings() reads blocklist from JSON element', () =>
	{
		const newInstance = new AsyncLogger();
		assert( isWritten( () => newInstance.log( 'aaa', 'bbb' ) ) ).equal( true );
		applySettings( JSON_SETTINGS_ID, {
			blocklist: [ 'aaa', 'list of strings to be blocked' ]
		} );
		newInstance.readSettings();
		clearSettings( JSON_SETTINGS_ID );
		assert( isWritten( () => newInstance.log( 'aaa', 'bbb' ) ) ).equal( false );
		assert( isWritten( () => newInstance.log( 'bbb', 'aaa' ) ) ).equal( true );
		assert( isWritten( () => newInstance.log( 'list of strings to be blocked' ) ) ).equal( false );
	} );

} );

await group( 'Reading settings', async () =>
{

	await it( 'new AsyncLogger() uses settings of the page and does not change global settings', () =>
	{
		const prefixValue = 'async logger prefix';
		const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
		const defaultLogConversion = ConsoleFilter.settings.forceConvertFunctions.log;
		applySettings( JSON_SETTINGS_ID, {
			texts: {
				prefix: prefixValue
			},
			forceConvertFunctions: {
				log: 'warn'
			}
		} );
		const logger = new AsyncLogger();
		clearSettings( JSON_SETTINGS_ID );
		assert( logger.settings.texts.prefix ).equal( prefixValue );
		assert( logger.settings.appendConsoleIntoBody ).equal( true ); // from URL parameter of this spec's import
		assert( ConsoleFilter.settings.texts.prefix ).equal( defaultPrefixValue );
		assert( ConsoleFilter.settings.forceConvertFunctions.log ).equal( defaultLogConversion );
	} );

	await it( 'ConsoleFilter with own settings does not change global settings', () =>
	{
		const prefixValue = 'own settings prefix';
		const defaultPrefixValue = ConsoleFilter.settings.texts.prefix;
		applySettings( JSON_SETTINGS_ID, {
			texts: {
				prefix: prefixValue
			}
		} );
		const newInstance = new ConsoleFilter( JSON_SETTINGS_ID, true );
		clearSettings( JSON_SETTINGS_ID );
		assert( newInstance.settings.texts.prefix ).equal( prefixValue );
		assert( ConsoleFilter.settings.texts.prefix ).equal( defaultPrefixValue );
	} );

	await it( 'Invalid JSON in settings element is reported and ignored', () =>
	{
		const settingsElement = document.createElement( 'script' );
		settingsElement.type = 'application/json';
		settingsElement.id = JSON_SETTINGS_ID;
		settingsElement.textContent = '{ "texts": { "prefix": "invalid", }, }';
		document.body.appendChild( settingsElement );
		let logger;
		try {
			logger = new AsyncLogger();
		} finally {
			clearSettings( JSON_SETTINGS_ID );
		}
		assert( logger.settings.texts.prefix ).equal( '' );
	} );

	await it( 'Settings which are not JSON object are reported and ignored', () =>
	{
		applySettings( JSON_SETTINGS_ID, [ 'not', 'an', 'object' ] );
		let logger;
		try {
			logger = new AsyncLogger();
		} finally {
			clearSettings( JSON_SETTINGS_ID );
		}
		assert( logger.settings.texts.prefix ).equal( '' );
	} );

	await it( 'Script can be imported without document (in a Web Worker)', async () =>
	{
		const moduleUrl = new URL( './consoleFilter.mjs', import.meta.url ).href;
		const workerCode = `import( '${ moduleUrl }' ).then( () => postMessage( 'imported' ), ( error ) => postMessage( String( error ) ) );`;
		const worker = new Worker( URL.createObjectURL( new Blob( [ workerCode ], { type: 'text/javascript' } ) ), { type: 'module' } );
		const result = await new Promise( ( resolve ) =>
		{
			worker.onmessage = ( event ) => resolve( event.data );
			worker.onerror = ( event ) => resolve( `worker error: ${ event.message }` );
			setTimeout( () => resolve( 'timeout' ), 5000 );
		} );
		worker.terminate();
		assert( result ).equal( 'imported' );
	} );

} );

await group( 'Filtering by allowlist and blocklist', async () =>
{

	await it( 'Without allowlist and blocklist everything is written', () =>
	{
		const logger = createLogger( {} );
		assert( isWritten( () => logger.log( 'items loaded' ) ) ).equal( true );
		assert( isWritten( () => logger.log( { data: true } ) ) ).equal( true );
	} );

	await it( 'Allowlist writes only messages starting with its entries (whole words)', () =>
	{
		const logger = createLogger( { allowlist: [ 'items' ] } );
		assert( isWritten( () => logger.log( 'items loaded' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'items' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'other message' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'itemsLoaded' ) ) ).equal( false );
		assert( isWritten( () => logger.log( { data: true } ) ) ).equal( false );
	} );

	await it( 'Allowlist with "*" or "all" allows everything', () =>
	{
		const asteriskLogger = createLogger( { allowlist: [ '*' ] } );
		const allLogger = createLogger( { allowlist: [ 'all' ] } );
		assert( isWritten( () => asteriskLogger.log( 'other message' ) ) ).equal( true );
		assert( isWritten( () => allLogger.log( 'other message' ) ) ).equal( true );
	} );

	await it( 'Blocklist hides messages starting with its entries (whole words)', () =>
	{
		const logger = createLogger( { blocklist: [ 'word', 'another' ] } );
		assert( isWritten( () => logger.log( 'word' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'another message' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'wordy message' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'other message' ) ) ).equal( true );
		assert( isWritten( () => logger.log( { data: true } ) ) ).equal( true );
	} );

	await it( 'Blocklist with "*" or "all" hides everything except allowlist', () =>
	{
		const logger = createLogger( { allowlist: [ 'items' ], blocklist: [ '*' ] } );
		const allLogger = createLogger( { blocklist: [ 'all' ] } );
		assert( isWritten( () => logger.log( 'items loaded' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'other message' ) ) ).equal( false );
		assert( isWritten( () => allLogger.log( 'items loaded' ) ) ).equal( false );
	} );

	await it( 'Blocklist has priority over allowlist', () =>
	{
		const logger = createLogger( { allowlist: [ 'items' ], blocklist: [ 'items debug' ] } );
		assert( isWritten( () => logger.log( 'items debug message' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'items loaded' ) ) ).equal( true );
	} );

	await it( 'Entry with more words matches the beginning of a message (README "exact string" example)', () =>
	{
		const logger = createLogger( { blocklist: [ 'exact string' ] } );
		assert( isWritten( () => logger.log( 'exact string' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'exact string and more' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'exact' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'exact strings' ) ) ).equal( true );
	} );

	await it( 'Allowlist and blocklist can be a single string', () =>
	{
		const logger = createLogger( { allowlist: 'items', blocklist: 'items debug' } );
		assert( isWritten( () => logger.log( 'items loaded' ) ) ).equal( true );
		assert( isWritten( () => logger.log( 'items debug message' ) ) ).equal( false );
		assert( isWritten( () => logger.log( 'other message' ) ) ).equal( false );
	} );

	await it( '%c directives and repeated spaces are ignored', () =>
	{
		const logger = createLogger( { allowlist: [ 'items loaded' ] } );
		assert( isWritten( () => logger.log( '%citems%c   loaded', 'color: red', 'color: blue' ) ) ).equal( true );
	} );

	await it( 'console.assert() is filtered by its message', () =>
	{
		const logger = createLogger( { blocklist: [ 'hidden' ] } );
		assert( isWritten( () => logger.assert( false, 'hidden message' ) ) ).equal( false );
		assert( isWritten( () => logger.assert( false, 'other message' ) ) ).equal( true );
	} );

	await it( 'Whole content of a group matching allowlist is written, except blocklist', () =>
	{
		const logger = createLogger( { allowlist: [ 'items' ], blocklist: [ 'noise' ] } );
		const [ nestedMarker, detailMarker, objectMarker, noiseMarker, otherMarker ] = [ createMarker(), createMarker(), createMarker(), createMarker(), createMarker() ];
		logger.group( `items group ${ createMarker() }` );
		logger.group( `nested group ${ nestedMarker }` );
		logger.log( `detail ${ detailMarker }` );
		logger.log( objectMarker, { data: true } );
		logger.log( `noise ${ noiseMarker }` );
		logger.groupEnd();
		logger.groupEnd();
		logger.log( `other ${ otherMarker }` );
		assert( isInOutput( nestedMarker ) ).equal( true );
		assert( isInOutput( detailMarker ) ).equal( true );
		assert( isInOutput( objectMarker ) ).equal( true );
		assert( isInOutput( noiseMarker ) ).equal( false );
		assert( isInOutput( otherMarker ) ).equal( false );
	} );

	await it( 'Global console writes content of a group matching allowlist', () =>
	{
		const [ detailMarker, otherMarker ] = [ createMarker(), createMarker() ];
		withGlobalSettings( { allowlist: [ 'items' ] }, () =>
		{
			console.group( `items group ${ createMarker() }` );
			console.log( `detail ${ detailMarker }` );
			console.groupEnd();
			console.log( `other ${ otherMarker }` );
		} );
		assert( isInOutput( detailMarker ) ).equal( true );
		assert( isInOutput( otherMarker ) ).equal( false );
	} );

} );

await group( 'Groups and time of output', async () =>
{

	await it( 'Global console writes messages inside a group immediately', () =>
	{
		const marker = createMarker();
		console.group( `immediate group ${ createMarker() }` );
		console.log( `inside group ${ marker }` );
		const isWrittenBeforeGroupEnd = isInOutput( marker );
		console.groupEnd();
		assert( isWrittenBeforeGroupEnd ).equal( true );
	} );

	await it( 'Static methods write messages inside a group immediately', () =>
	{
		const marker = createMarker();
		methods.group( `static methods group ${ createMarker() }` );
		methods.log( `inside group ${ marker }` );
		const isWrittenBeforeGroupEnd = isInOutput( marker );
		methods.groupEnd();
		assert( isWrittenBeforeGroupEnd ).equal( true );
	} );

	await it( 'Hidden group hides its content and does not close its parent group', () =>
	{
		const [ parentMarker, hiddenMarker, afterMarker ] = [ createMarker(), createMarker(), createMarker() ];
		withGlobalSettings( { blocklist: [ 'hidden' ] }, () =>
		{
			console.group( `parent group ${ parentMarker }` );
			console.group( 'hidden group' );
			console.log( `inside hidden group ${ hiddenMarker }` );
			console.groupEnd();
			console.log( `after hidden group ${ afterMarker }` );
			console.groupEnd();
		} );
		assert( isInOutput( hiddenMarker ) ).equal( false );
		assert( getOutputGroup( parentMarker )?.textContent?.includes( afterMarker ) ).equal( true );
	} );

	await it( 'AsyncLogger writes content of a group only after the outermost group is closed', () =>
	{
		const logger = new AsyncLogger();
		const [ groupMarker, innerMarker ] = [ createMarker(), createMarker() ];
		logger.settings.appendConsoleIntoBody = true;
		logger.group( `async group ${ groupMarker }` );
		logger.group( 'nested async group' );
		logger.log( `inside nested group ${ innerMarker }` );
		logger.groupEnd();
		const isWrittenBeforeGroupEnd = isInOutput( groupMarker ) || isInOutput( innerMarker );
		logger.groupEnd();
		assert( isWrittenBeforeGroupEnd ).equal( false );
		assert( getOutputGroup( groupMarker )?.textContent?.includes( innerMarker ) ).equal( true );
	} );

	await it( 'AsyncLogger hides content of a hidden group', () =>
	{
		const logger = new AsyncLogger();
		const [ hiddenMarker, afterMarker ] = [ createMarker(), createMarker() ];
		logger.settings = { appendConsoleIntoBody: true, blocklist: [ 'hidden' ] };
		logger.group( 'hidden group' );
		logger.log( `inside hidden group ${ hiddenMarker }` );
		logger.groupEnd();
		logger.log( `after hidden group ${ afterMarker }` );
		assert( isInOutput( hiddenMarker ) ).equal( false );
		assert( isInOutput( afterMarker ) ).equal( true );
	} );

} );
