const util = require('util');
const glob = require('glob');
const fs = require('fs/promises');
const throat = require('throat').default;
const zip = require('just-zip-it');

/**
 * Find files
 * @param {String} globPattern
 * @returns {Promise<String[]>}
 */
function findFiles(globPattern) {
	const globPromise = util.promisify(glob);
	return globPromise(globPattern);
}

/**
 * Load files
 * @param {String[]} filePaths
 * @returns {Promise<String[]>}
 */
function loadFiles(filePaths = []) {
	const throttle = throat(2);

	const queue = filePaths.map(filePath => {
		return throttle(() => fs.readFile(filePath, 'utf-8'));
	});

	return Promise.all(queue);
}

/**
 * Get files
 * @param {String} globPattern
 * @returns {Promise<Array<String[]>>}
 */
async function getFiles(globPattern) {
	const files = await findFiles(globPattern);
	const contents = await loadFiles(files);

	return zip(files, contents);
}

module.exports = { findFiles, loadFiles, getFiles };
