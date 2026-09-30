"use strict";

//@ts-check

/**
 * @file run-browser-tests.mjs
 * @description Runs `tests-runner.html` in headless browser and fails when any test fails. Used by `npm test` and CI.
 * Test results are read from `window.ictestResults` published by `modules/ictest.mjs`.
 * Browser is selected by `BROWSER` env variable (`chromium` (default), `firefox`, `webkit`),
 * `BROWSER_PATH` env variable can point to custom browser executable.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, firefox, webkit } from 'playwright';

const ROOT = fileURLToPath( new URL( '..', import.meta.url ) );
const RUNNER_PAGE = 'tests-runner.html';
const SPEC_URL = './consoleFilter.spec.mjs?v=1.0';
const TESTS_TIMEOUT_MS = 60000;
const BROWSERS = { chromium, firefox, webkit };
const browserName = /** @type {keyof typeof BROWSERS} */ ( process.env.BROWSER ?? 'chromium' );

if ( !Object.hasOwn( BROWSERS, browserName ) ) {
	console.error( `Unknown browser "${ browserName }", use one of: ${ Object.keys( BROWSERS ).join( ', ' ) }` );
	process.exit( 1 );
}

/** @type {Record<string, string>} */
const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
};

/** @type {import('node:http').RequestListener} */
const serveStatic = async ( request, response ) =>
{
	const pathname = decodeURIComponent( new URL( request.url ?? '/', 'http://localhost' ).pathname );
	const filePath = normalize( join( ROOT, pathname ) );
	if ( !filePath.startsWith( ROOT.endsWith( sep ) ? ROOT : ROOT + sep ) ) {
		response.writeHead( 403 ).end();
		return;
	}
	try {
		const body = await readFile( filePath );
		response.writeHead( 200, { 'Content-Type': MIME_TYPES[ extname( filePath ) ] ?? 'application/octet-stream' } ).end( body );
	} catch {
		response.writeHead( 404 ).end();
	}
};

const server = createServer( serveStatic );
await new Promise( ( resolve ) => server.listen( 0, '127.0.0.1', () => resolve( true ) ) );
const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;

const browser = await BROWSERS[ browserName ].launch( process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {} );

/** @type {string[]} */
const failures = [];

let summary = '';

try {
	const page = await browser.newPage();
	page.on( 'console', ( message ) =>
	{
		console.log( `[browser ${ message.type() }] ${ message.text() }` );
	} );
	page.on( 'pageerror', ( error ) =>
	{
		failures.push( `Uncaught error: ${ error.message }` );
	} );
	page.on( 'requestfailed', ( request ) =>
	{
		failures.push( `Request failed: ${ request.url() } (${ request.failure()?.errorText })` );
	} );

	await page.goto( `http://127.0.0.1:${ port }/${ RUNNER_PAGE }` );

	// Same URL as in tests-runner.html => same module instance, promise resolves after its top-level await finishes
	const testsRun = page.evaluate( ( specUrl ) => import( specUrl ), SPEC_URL );
	testsRun.catch( () => undefined ); // rejection after timeout (closed browser) is not important
	const timeout = delay( TESTS_TIMEOUT_MS, 'timeout', { ref: false } );
	if ( await Promise.race( [ testsRun, timeout ] ) === 'timeout' ) {
		throw new Error( `Tests did not finish within ${ TESTS_TIMEOUT_MS / 1000 } s` );
	}

	// Give not awaited async parts of the spec (timeouts) time to finish
	await page.waitForTimeout( 500 );

	const results = await page.evaluate( () => Reflect.get( globalThis, 'ictestResults' ) ?? null );
	if ( !results ) {
		failures.push( 'No test results found (window.ictestResults is missing)' );
	} else {
		summary = `${ results.passed } passed, ${ results.failed } failed`;
		/** @type {Array<{ test: string, message: string }>} */
		const failedTests = results.failures;
		failedTests.forEach( ( failure ) => failures.push( `✗ ${ failure.test }: ${ failure.message }` ) );
		if ( results.passed + results.failed === 0 ) {
			failures.push( 'No tests were run' );
		}
	}
} catch ( /** @type {any} */ error ) {
	failures.push( `Runner error: ${ error.message }` );
} finally {
	await browser.close();
	server.close();
}

console.log( `\n${ browserName }: ${ summary || 'no results' }` );

if ( failures.length ) {
	console.error( `\n${ failures.length } failure(s) in ${ browserName }:` );
	failures.forEach( ( failure ) => console.error( `  ${ failure }` ) );
	process.exitCode = 1;
} else {
	console.log( `\nAll tests passed in ${ browserName }` );
}
