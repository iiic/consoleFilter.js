"use strict";

//@ts-check

/**
 * @file check-integrity.mjs
 * @description Checks that `integrity` attributes in HTML files and in HTML examples in README match the current
 * content of the referenced local files. Run with `--fix` to rewrite outdated hashes (every occurrence of the old hash
 * in the file).
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath( new URL( '..', import.meta.url ) );
const FILES = [ 'tests-runner.html', 'README.md' ];
const isFixMode = process.argv.includes( '--fix' );

/** @type {( tag: string, name: string ) => string | null} */
const getAttribute = ( tag, name ) =>
{
	const start = tag.indexOf( ` ${ name }="` );
	if ( start === -1 ) {
		return null;
	}
	const valueStart = start + name.length + 3;
	return tag.slice( valueStart, tag.indexOf( '"', valueStart ) );
};

let errorsCount = 0;

for ( const file of FILES ) {
	const filePath = join( ROOT, file );
	let content = await readFile( filePath, 'utf8' );
	const tags = content.split( '<' ).slice( 1 ).map( ( part ) => '<' + part.slice( 0, part.indexOf( '>' ) + 1 ) );
	for ( const tag of tags ) {
		const integrity = getAttribute( tag, 'integrity' );
		const source = getAttribute( tag, 'src' ) ?? getAttribute( tag, 'href' );
		if ( !integrity || !source || source.includes( '://' ) ) {
			continue;
		}
		const localPath = join( ROOT, source.split( '?' )[ 0 ] );
		const algorithm = integrity.split( '-' )[ 0 ];
		const expected = `${ algorithm }-${ createHash( algorithm ).update( await readFile( localPath ) ).digest( 'base64' ) }`;
		if ( expected === integrity ) {
			console.log( `✓ ${ file }: ${ source }` );
		} else if ( isFixMode ) {
			content = content.replaceAll( integrity.slice( algorithm.length + 1 ), expected.slice( algorithm.length + 1 ) );
			console.log( `✎ ${ file }: ${ source } updated to ${ expected }` );
		} else {
			errorsCount++;
			console.error( `✗ ${ file }: ${ source } has integrity ${ integrity }, but file hash is ${ expected }` );
		}
	}
	if ( isFixMode ) {
		await writeFile( filePath, content );
	}
}

if ( errorsCount ) {
	console.error( '\nRun `npm run fix:integrity` to update hashes.' );
	process.exitCode = 1;
}
