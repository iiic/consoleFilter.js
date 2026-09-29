"use strict";

//@ts-check

/**
 * @class
 * @description internal part, not for exporting
 * @file ictest.mjs
 */
class ictestInternal
{

	process = {
		exitCode: 0
	};

	/** @type {{ passed: number, failed: number, failures: Array<{ test: string, message: string }> }} */
	results = {
		passed: 0,
		failed: 0,
		failures: []
	};

	/** @type {any} */
	asserted;

	groupName = '';

	/** @type {Array.<any>} */
	groupStack = [];

	/** @type {Array.<Function>} */
	beforeEachHooks = [];

	/** @type {Array.<Function>} */
	afterEachHooks = [];

	useNegation = false;

	/** @description value description for error messages */
	formatValue = ( /** @type {any} */ value ) =>
	{
		return typeof value === 'string' ? JSON.stringify( value ) : String( value );
	}

	/** @description runs assertion with negation, negation is turned off again also when assertion fails */
	runNegated = ( /** @type {Function} */ assertion, /** @type {Array.<any>} */ args ) =>
	{
		this.useNegation = true;
		try {
			assertion( ...args );
		} finally {
			this.useNegation = false;
		}
	}

	createGroup = async ( /** @type {String} */ name, /** @type {Function} */ fn, /** @type {Function} */ openGroupFn ) =>
	{
		const group = {
			name,
			beforeEachHooks: [],
			afterEachHooks: []
		};
		this.groupStack.push( group );
		this.groupName = name;
		openGroupFn( name );
		try {
			await fn();
		} finally {
			console.groupEnd();
			this.groupStack.pop();
			this.groupName = this.groupStack[ this.groupStack.length - 1 ]?.name ?? '';
		}
	}

}

/**
 * @class
 * @extends ictestInternal
 * @file ictest.mjs
 * @license CC-BY-SA-4.0
 * @description tests a function and logs result
 */
class ictest extends ictestInternal
{

	constructor ()
	{
		super();
	}

	applySettings = ( /** @type {String} */ elementId, /** @type {Object} */ settingsContent ) =>
	{
		const oldSettingsElement = /** @type {HTMLScriptElement|null} */ ( document.getElementById( elementId ) );
		if ( oldSettingsElement ) {
			oldSettingsElement.parentElement?.removeChild( oldSettingsElement );
		}
		const settingsElement = document.createElement( 'script' );
		settingsElement.type = 'application/json';
		settingsElement.id = elementId;
		settingsElement.appendChild( document.createTextNode( JSON.stringify(
			settingsContent
		) ) );
		document.body.appendChild( settingsElement );
	}

	clearSettings = ( /** @type {String} */ elementId ) =>
	{
		const settingsElement = document.getElementById( elementId );
		if ( settingsElement && settingsElement.parentElement ) {
			settingsElement.parentElement.removeChild( settingsElement );
		}
	}

	/** @description named group of tests */
	group = async ( /** @type {String} */ name, /** @type {Function} */ fn ) =>
	{
		return this.createGroup( name, fn, console.group.bind( console ) );
	}

	/** @description named group of tests (collapsed by default) */
	groupClosed = async ( /** @type {String} */ name, /** @type {Function} */ fn ) =>
	{
		return this.createGroup( name, fn, console.groupCollapsed.bind( console ) );
	}

	it = async ( /** @type {String} */ description, /** @type {Function} */ fn ) =>
	{
		const beforeEachHooks = [ ...this.beforeEachHooks, ...this.groupStack.flatMap( group => group.beforeEachHooks ) ];
		const afterEachHooks = [ ...this.groupStack ].reverse().flatMap( group => group.afterEachHooks ).concat( this.afterEachHooks );
		try {
			for ( const hook of beforeEachHooks ) {
				await hook();
			}
			await fn();
			this.results.passed++;
			console.log( `✓ ${ description }` );
		} catch ( /** @type {any} */ err ) {
			const message = err instanceof Error ? err.message : String( err );
			this.results.failed++;
			this.results.failures.push( {
				test: [ ...this.groupStack.map( group => group.name ), description ].join( ' › ' ),
				message
			} );
			console.error( `✗ ${ description }` );
			console.error( message );
			this.process.exitCode++;
		} finally {
			for ( const hook of afterEachHooks ) {
				await hook();
			}
		}
	}

	assert = ( /** @type {any} */ actual ) =>
	{
		this.asserted = actual;
		return this;
	}

	beforeEach = ( /** @type {Function} */ fn ) =>
	{
		const group = this.groupStack[ this.groupStack.length - 1 ];
		( group ? group.beforeEachHooks : this.beforeEachHooks ).push( fn );
	}

	afterEach = ( /** @type {Function} */ fn ) =>
	{
		const group = this.groupStack[ this.groupStack.length - 1 ];
		( group ? group.afterEachHooks : this.afterEachHooks ).push( fn );
	}

	equal = ( /** @type {any} */ expected, /** @type {String} */ possibleErrorText ) =>
	{
		if ( this.useNegation ? this.asserted === expected : this.asserted !== expected ) {
			throw new Error( possibleErrorText ?? ( this.useNegation
				? `Expected value different from ${ this.formatValue( expected ) }`
				: `Expected ${ this.formatValue( expected ) }, but got ${ this.formatValue( this.asserted ) }` ) );
		}
	}

	toBeDefined = ( /** @type {String} */ possibleErrorText ) =>
	{
		const isDefined = this.asserted !== undefined;
		if ( this.useNegation ? isDefined : !isDefined ) {
			throw new Error( possibleErrorText ?? ( this.useNegation
				? `Expected undefined, but got ${ this.formatValue( this.asserted ) }`
				: 'Expected defined value, but got undefined' ) );
		}
	}

	toBeInstanceOf = ( /** @type {any} */ instance, /** @type {String} */ possibleErrorText ) =>
	{
		const isInstance = this.asserted instanceof instance;
		if ( this.useNegation ? isInstance : !isInstance ) {
			throw new Error( possibleErrorText ?? ( this.useNegation
				? `Expected value not to be instance of ${ instance.name }`
				: `Expected instance of ${ instance.name }, but got ${ this.formatValue( this.asserted ) }` ) );
		}
	}

	hasReadOnlyProperty = ( /** @type {String} */ propertyName ) =>
	{
		if ( !( propertyName in this.asserted ) ) {
			throw new Error( 'Property not in object' );
		}
		let descriptor = Reflect.getOwnPropertyDescriptor( this.asserted, propertyName );
		if ( !descriptor ) {
			let prototype = Reflect.getPrototypeOf( this.asserted );
			while ( prototype ) {
				descriptor = Reflect.getOwnPropertyDescriptor( prototype, propertyName );
				if ( descriptor ) {
					break;
				}
				prototype = Reflect.getPrototypeOf( prototype );
			}
		}
		const result = Boolean( descriptor && ( 'writable' in descriptor ? descriptor.writable : descriptor.set !== undefined ) );
		if ( this.useNegation ? !result : result ) {
			throw new Error( this.useNegation ? `Property "${ propertyName }" is read-only` : `Property "${ propertyName }" is not read-only` );
		}
	}

	/** @type {Object<string, (...args: any[]) => void>} */
	not = {

		equal: ( ...args ) => this.runNegated( this.equal, args ),

		toBeDefined: ( ...args ) => this.runNegated( this.toBeDefined, args ),

		toBeInstanceOf: ( ...args ) => this.runNegated( this.toBeInstanceOf, args ),

		hasReadOnlyProperty: ( ...args ) => this.runNegated( this.hasReadOnlyProperty, args )

	}

}

const ict = new ictest();

// Results for automated test runners (scripts/run-browser-tests.mjs), console output can be changed by tested code
/** @type {typeof globalThis & { ictestResults?: typeof ict.results }} */ ( globalThis ).ictestResults = ict.results;

const { applySettings, clearSettings, group, groupClosed, it, assert, beforeEach, afterEach, not, equal, toBeDefined, toBeInstanceOf } = ict;
export { applySettings, clearSettings, group, groupClosed, it, assert, beforeEach, afterEach, not, equal, toBeDefined, toBeInstanceOf };


/** @example

function add(a, b) {
	return a + b;
}

// --- testy ---
it('add(2, 3) by mělo vrátit 5', () => {
	assertEqual(add(2, 3), 5);
});

it('add(-1, 1) by mělo vrátit 0', () => {
	assertEqual(add(-1, 1), 0);
});

 */
