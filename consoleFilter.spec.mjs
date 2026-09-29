const { ConsoleFilter, methods, AsyncLogger } = await import( './consoleFilter.mjs?v=1.0&settings=' + JSON.stringify( {
	appendConsoleIntoBody: true,
} ) );
const { applySettings, clearSettings, group, groupClosed, it, assert, beforeEach, afterEach, not, equal, toBeDefined, toBeInstanceOf } = await import( './modules/ictest.mjs?v=0.1&settings=' + JSON.stringify( {
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
		it( 'exception', () =>
		{
			assert( methods.exception ).not.toBeDefined();
		} );
		it( 'profile', () =>
		{
			assert( methods.profile ).not.toBeDefined();
		} );
		it( 'count', () =>
		{
			assert( methods.profileEnd ).not.toBeDefined();
		} );
		it( 'timeStamp', () =>
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
		it( 'assert', () =>
		{
			assert( console.assert ).toBeDefined();
			assert( console.assert ).toBeInstanceOf( Function );
		} );
		it( 'clear', () =>
		{
			assert( console.clear ).toBeDefined();
			assert( console.clear ).toBeInstanceOf( Function );
		} );
		it( 'count', () =>
		{
			assert( console.count ).toBeDefined();
			assert( console.count ).toBeInstanceOf( Function );
		} );
		it( 'countReset', () =>
		{
			assert( console.countReset ).toBeDefined();
			assert( console.countReset ).toBeInstanceOf( Function );
		} );
		it( 'debug', () =>
		{
			assert( console.debug ).toBeDefined();
			assert( console.debug ).toBeInstanceOf( Function );
		} );
		it( 'dir', () =>
		{
			assert( console.dir ).toBeDefined();
			assert( console.dir ).toBeInstanceOf( Function );
		} );
		it( 'dirxml', () =>
		{
			assert( console.dirxml ).toBeDefined();
			assert( console.dirxml ).toBeInstanceOf( Function );
		} );
		it( 'error', () =>
		{
			assert( console.error ).toBeDefined();
			assert( console.error ).toBeInstanceOf( Function );
		} );
		it( 'group', () =>
		{
			assert( console.group ).toBeDefined();
			assert( console.group ).toBeInstanceOf( Function );
		} );
		it( 'groupCollapsed', () =>
		{
			assert( console.groupCollapsed ).toBeDefined();
			assert( console.groupCollapsed ).toBeInstanceOf( Function );
		} );
		it( 'groupEnd', () =>
		{
			assert( console.groupEnd ).toBeDefined();
			assert( console.groupEnd ).toBeInstanceOf( Function );
		} );
		it( 'info', () =>
		{
			assert( console.info ).toBeDefined();
			assert( console.info ).toBeInstanceOf( Function );
		} );
		it( 'log', () =>
		{
			assert( console.log ).toBeDefined();
			assert( console.log ).toBeInstanceOf( Function );
		} );
		it( 'table', () =>
		{
			assert( console.table ).toBeDefined();
			assert( console.table ).toBeInstanceOf( Function );
		} );
		it( 'time', () =>
		{
			assert( console.time ).toBeDefined();
			assert( console.time ).toBeInstanceOf( Function );
		} );
		it( 'timeEnd', () =>
		{
			assert( console.timeEnd ).toBeDefined();
			assert( console.timeEnd ).toBeInstanceOf( Function );
		} );
		it( 'timeLog', () =>
		{
			assert( console.timeLog ).toBeDefined();
			assert( console.timeLog ).toBeInstanceOf( Function );
		} );
		it( 'trace', () =>
		{
			assert( console.trace ).toBeDefined();
			assert( console.trace ).toBeInstanceOf( Function );
		} );
		it( 'warn', () =>
		{
			assert( console.warn ).toBeDefined();
			assert( console.warn ).toBeInstanceOf( Function );
		} );
	} );

	await groupClosed( 'Static methods of consoleFilter should have all methods like native console:', async () =>
	{
		it( 'assert', () =>
		{
			assert( methods.assert ).toBeDefined();
			assert( methods.assert ).toBeInstanceOf( Function );
		} );
		it( 'clear', () =>
		{
			assert( methods.clear ).toBeDefined();
			assert( methods.clear ).toBeInstanceOf( Function );
		} );
		it( 'count', () =>
		{
			assert( methods.count ).toBeDefined();
			assert( methods.count ).toBeInstanceOf( Function );
		} );
		it( 'countReset', () =>
		{
			assert( methods.countReset ).toBeDefined();
			assert( methods.countReset ).toBeInstanceOf( Function );
		} );
		it( 'debug', () =>
		{
			assert( methods.debug ).toBeDefined();
			assert( methods.debug ).toBeInstanceOf( Function );
		} );
		it( 'dir', () =>
		{
			assert( methods.dir ).toBeDefined();
			assert( methods.dir ).toBeInstanceOf( Function );
		} );
		it( 'dirxml', () =>
		{
			assert( methods.dirxml ).toBeDefined();
			assert( methods.dirxml ).toBeInstanceOf( Function );
		} );
		it( 'error', () =>
		{
			assert( methods.error ).toBeDefined();
			assert( methods.error ).toBeInstanceOf( Function );
		} );
		it( 'group', () =>
		{
			assert( methods.group ).toBeDefined();
			assert( methods.group ).toBeInstanceOf( Function );
		} );
		it( 'groupCollapsed', () =>
		{
			assert( methods.groupCollapsed ).toBeDefined();
			assert( methods.groupCollapsed ).toBeInstanceOf( Function );
		} );
		it( 'groupEnd', () =>
		{
			assert( methods.groupEnd ).toBeDefined();
			assert( methods.groupEnd ).toBeInstanceOf( Function );
		} );
		it( 'info', () =>
		{
			assert( methods.info ).toBeDefined();
			assert( methods.info ).toBeInstanceOf( Function );
		} );
		it( 'log', () =>
		{
			assert( methods.log ).toBeDefined();
			assert( methods.log ).toBeInstanceOf( Function );
		} );
		it( 'table', () =>
		{
			assert( methods.table ).toBeDefined();
			assert( methods.table ).toBeInstanceOf( Function );
		} );
		it( 'time', () =>
		{
			assert( methods.time ).toBeDefined();
			assert( methods.time ).toBeInstanceOf( Function );
		} );
		it( 'timeEnd', () =>
		{
			assert( methods.timeEnd ).toBeDefined();
			assert( methods.timeEnd ).toBeInstanceOf( Function );
		} );
		it( 'timeLog', () =>
		{
			assert( methods.timeLog ).toBeDefined();
			assert( methods.timeLog ).toBeInstanceOf( Function );
		} );
		it( 'trace', () =>
		{
			assert( methods.trace ).toBeDefined();
			assert( methods.trace ).toBeInstanceOf( Function );
		} );
		it( 'warn', () =>
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
		applySettings( JSON_SETTINGS_ID, {
			texts: {
				prefix: prefixValue
			}
		} );
		const newInstance = new ConsoleFilter();
		newInstance.readSettings();
		assert( newInstance.settings.texts.prefix ).equal( prefixValue );
		clearSettings( JSON_SETTINGS_ID );
	} );

	await group( 'Force change one console command to another', () =>
	{
		applySettings( JSON_SETTINGS_ID, {
			forceConvertFunctions: {
				log: 'warn'
			}
		} );
		const newInstance = new AsyncLogger();
		newInstance.readSettings();
		newInstance.log( 'this console.log() should be changed to console.warn()' );
		clearSettings( JSON_SETTINGS_ID );
	} );

	await groupClosed( 'Class test… look into browser\'s console', async () =>
	{
		let C = class
		{

			color;
			colorName;
			console;

			constructor ( /** @type {String} */ color )
			{
				this.color = `font-weight: strong; color: ${ color }`;
				this.colorName = color;
				this.console = new AsyncLogger();
				this.console.settings.appendConsoleIntoBody = false;
				this.run();
			}

			async run ()
			{
				this.console.groupCollapsed( '%c Class C ', this.color, this.colorName );
				this.console.log( '%c run', this.color );
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
						this.console.log( '%c asyncMethod', this.color, this.colorName );
						resolve( true );
					}, 99 );
				} );
			}

			syncMethod ()
			{
				this.console.group( '%c syncMethod', this.color, this.colorName );
				this.subSyncMethod();
				this.console.groupEnd();
			}

			subSyncMethod ()
			{
				this.console.log( '%c subSyncMethod', this.color, this.colorName );
			}
		}

		new C( 'red' );
		new C( 'green' );
	} );

	await group( 'Tests of filtering… look into browser\'s console', async () =>
	{
		const newInstance = new AsyncLogger();
		newInstance.log( 'aaa', 'bbb', 'ccc', 'ddd', 'eee' );
		newInstance.log( 'bbb', 'ccc', 'ddd', 'eee' );
		newInstance.log( 'ccc', 'ddd', 'eee' );
		newInstance.log( 'ddd', 'eee' );
		newInstance.log( 'eee' );
		newInstance.log( 'aaa' );
		applySettings( JSON_SETTINGS_ID, {
			blocklist: [ 'aaa', 'list of strings to be blocked' ]
		} );
		newInstance.readSettings();
		newInstance.log( 'aaa', 'bbb', 'ccc', 'ddd', 'eee' );
		newInstance.log( 'bbb', 'ccc', 'ddd', 'eee' );
		newInstance.log( 'ccc', 'ddd', 'eee' );
		newInstance.log( 'ddd', 'eee' );
		newInstance.log( 'eee' );
		newInstance.log( 'aaa' );
		clearSettings( JSON_SETTINGS_ID );
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
