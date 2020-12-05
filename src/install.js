const crypto = require("crypto");
const extract = require("extract-zip");
const fs = require("fs-extra");
const http = require("http");
const https = require("https");
const path = require("path");
const lockfile = require("proper-lockfile");
const os = require("os");
const URL = require("url");

const dev = process.env.SRTL_DEV;

installScreenReaders().catch((error) => {
	console.error(error);
	process.exit(1);
});

/**
 * @typedef {object} ScreenReaderDescriptor
 * @property {string} name
 * @property {string} revision
 */

/**
 * Installs screen readers that can be used with this library.
 *
 * Based on https://github.com/microsoft/playwright/blob/cdd9fd6b2e9e1c4fc3c4fce696fdfcf30a13c222/src/install/installer.ts
 */
async function installScreenReaders() {
	const packagePath = __dirname;
	const screenReadersPath = getScreenReadersPath();

	await fs.mkdirp(screenReadersPath);
	const lockfilePath = path.join(screenReadersPath, "__dirlock");
	const releaseLock = await lockfile.lock(screenReadersPath, {
		retries: {
			retries: 10,
			// Retry 20 times during 10 minutes with
			// exponential back-off.
			// See documentation at: https://www.npmjs.com/package/retry#retrytimeoutsoptions
			factor: 1.27579,
		},
		onCompromised:
			/**
			 * @param {Error} error
			 */
			(error) => {
				throw new Error(`${error.message} Path: ${lockfilePath}`);
			},
		lockfilePath,
	});

	const linksDir = path.join(screenReadersPath, ".links");
	await fs.mkdirp(linksDir);
	await fs.writeFile(path.join(linksDir, sha1(packagePath)), packagePath);

	await validateCache(packagePath, screenReadersPath, linksDir);
	await releaseLock();
}

/**
 * @param {string} packagePath
 * @returns {Promise<ScreenReaderDescriptor[]>}
 */
async function readScreenReadersToDownload(packagePath) {
	const screenReaders = JSON.parse(
		(await fs.readFile(path.join(packagePath, "screenReaders.json"))).toString()
	)["screenReaders"];
	return screenReaders;
}

/**
 * @param {string} packagePath
 * @param {string} screenReadersPath
 * @param {string} linksDir
 * @returns {Promise<void>}
 */
async function validateCache(packagePath, screenReadersPath, linksDir) {
	// 1. Collect used downloads and package descriptors.
	/**
	 * @type {Set<string>}
	 */
	const usedScreenReaderPaths = new Set();
	for (const fileName of await fs.readdir(linksDir)) {
		const linkPath = path.join(linksDir, fileName);
		let linkTarget = "";
		try {
			linkTarget = (await fs.readFile(linkPath)).toString();
			const screenReadersToDownload = await readScreenReadersToDownload(
				linkTarget
			);
			for (const screenReader of screenReadersToDownload) {
				const usedScreenReaderPath = getScreenReaderDirectory(
					screenReadersPath,
					screenReader
				);
				const screenReaderRevision = parseInt(screenReader.revision, 10);
				const markerFileExists = await fs
					.access(
						getScreenReaderMarkerFilePath(screenReadersPath, screenReader)
					)
					.then(
						() => true,
						() => false
					);
				if (markerFileExists) {
					usedScreenReaderPaths.add(usedScreenReaderPath);
				}
			}
		} catch (e) {
			await fs.unlink(linkPath).catch((e) => {});
		}
	}
	// 2. Delete all unused browsers.
	let downloadedScreenReaders = (await fs.readdir(screenReadersPath)).map(
		(file) => {
			return path.join(screenReadersPath, file);
		}
	);
	downloadedScreenReaders = downloadedScreenReaders.filter((file) => {
		return isScreenReaderDirectory(file);
	});
	/**
	 * @type {Set<string>}
	 */
	const directories = new Set(downloadedScreenReaders);
	for (const screenReaderPath of usedScreenReaderPaths) {
		directories.delete(screenReaderPath);
	}
	for (const directory of directories) {
		await fs.remove(directory).catch((e) => {});
	}

	// 3. Install missing screen readers for this package.
	const myScreenReadersToDownload = await readScreenReadersToDownload(
		packagePath
	);
	const packageVersion = await fs
		.readFile(path.join(packagePath, "package.json"), { encoding: "utf8" })
		.then((packageJson) => {
			return JSON.parse(packageJson)["version"];
		});
	const artifactsUrlBase = `https://github.com/eps1lon/screen-reader-testing-library/releases/download/v${packageVersion}/`;
	for (const screenReader of myScreenReadersToDownload) {
		await downloadScreenReader(
			artifactsUrlBase,
			screenReadersPath,
			screenReader
		);
		await fs.writeFile(
			getScreenReaderMarkerFilePath(screenReadersPath, screenReader),
			""
		);
	}
}

/**
 * @param {string} data
 * @returns {string}
 */
function sha1(data) {
	const sum = crypto.createHash("sha1");
	sum.update(data);
	return sum.digest("hex");
}

// source: https://github.com/microsoft/playwright/blob/cdd9fd6b2e9e1c4fc3c4fce696fdfcf30a13c222/src/utils/browserPaths.ts#L122-L132
function getCacheDirectory() {
	if (process.platform === "linux")
		return process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");

	if (process.platform === "darwin")
		return path.join(os.homedir(), "Library", "Caches");

	if (process.platform === "win32")
		return (
			process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local")
		);
	throw new Error("Unsupported platform: " + process.platform);
}

function getPackageCacheDirectory() {
	return path.join(getCacheDirectory(), "screen-reader-testing-library");
}

function getScreenReadersPath() {
	return path.join(getPackageCacheDirectory(), "screen-readers");
}

/**
 * @param {string} screenReadersPath
 * @param {ScreenReaderDescriptor} screenReader
 */
function getScreenReaderDirectory(screenReadersPath, screenReader) {
	return path.join(
		screenReadersPath,
		// screenreadersPath must contain a flat structure
		// we can't nest them like e.g. nvda/2020.3
		`${screenReader.name}-${screenReader.revision}`
	);
}

/**
 * @param {string} screenReaderPath
 * @returns {boolean}
 */
function isScreenReaderDirectory(screenReaderPath) {
	const baseName = path.basename(screenReaderPath);
	return baseName.startsWith("nvda-");
}

/**
 * @param {string} screenReadersPath
 * @param {ScreenReaderDescriptor} screenReader
 */
function getScreenReaderMarkerFilePath(screenReadersPath, screenReader) {
	return path.join(
		getScreenReaderDirectory(screenReadersPath, screenReader),
		"INSTALLATION_COMPLETE"
	);
}

/**
 * @param {string} artifactsUrlBase
 * @param {string} screenReadersPath
 * @param {ScreenReaderDescriptor} screenReader
 * @returns {Promise<void>}
 */
async function downloadScreenReader(
	artifactsUrlBase,
	screenReadersPath,
	screenReader
) {
	const screenReaderPath = getScreenReaderDirectory(
		screenReadersPath,
		screenReader
	);
	const screenReaderExists = await fs.access(screenReaderPath).then(
		() => true,
		() => false
	);
	if (screenReaderExists) {
		return;
	}

	const url = revisionURL(artifactsUrlBase, screenReader);
	const zipPath = path.join(
		os.tmpdir(),
		`screen-reader-testing-library-download-${screenReader.name}-${screenReader.revision}.zip`
	);

	try {
		if (dev) {
			await fs.copy(
				getScreenReaderDirectory(
					path.resolve(__dirname, "../vendor"),
					screenReader
				),
				screenReaderPath,
				{ recursive: true }
			);
		} else {
			await downloadFile(url, zipPath);
			await extract(zipPath, { dir: screenReaderPath });
		}
		// TODO: Do we need to do this?
		// await fs.chmod(browserPaths.executablePath(screenReaderPath, browser)!, 0o755);
	} catch (e) {
		process.exitCode = 1;
		throw e;
	} finally {
		await fs.unlink(zipPath).catch(() => {});
	}
}

/**
 *
 * @param {string} artifactsUrlBase
 * @param {ScreenReaderDescriptor} screenReader
 */
function revisionURL(artifactsUrlBase, screenReader) {
	return new URL.URL(
		`${screenReader.name}-${screenReader.revision}.zip`,
		artifactsUrlBase
	);
}

/**
 * @param {URL} url
 * @param {string} destinationPath
 */
function downloadFile(url, destinationPath) {
	let fulfill = () => {};
	/**
	 * @type {(error: Error) => void}
	 */
	let reject = () => {};

	const promise = new Promise((x, y) => {
		fulfill = x;
		reject = y;
	});

	const request = httpRequest(url, (response) => {
		if (response.statusCode !== 200) {
			const error = new Error(
				`Download failed: server returned code ${response.statusCode}. URL: ${url}`
			);
			// consume response data to free up memory
			response.resume();
			reject(error);
			return;
		}
		const file = fs.createWriteStream(destinationPath);
		file.on("finish", () => fulfill());
		file.on("error", (error) => reject(error));
		response.pipe(file);
	});
	request.on("error", (error) => reject(error));
	return promise;
}

/**
 * @param {URL|string} urlOrString
 * @param {(response: import('http').IncomingMessage) => void} callback+
 */
function httpRequest(urlOrString, callback) {
	const url =
		typeof urlOrString === "string" ? new URL.URL(urlOrString) : urlOrString;
	const requestCallback =
		/**
		 * @param {import('http').IncomingMessage} response
		 */
		(response) => {
			console.log(response.statusCode, urlOrString);
			if (
				response.statusCode !== undefined &&
				response.statusCode >= 300 &&
				response.statusCode < 400 &&
				response.headers.location
			) {
				httpRequest(response.headers.location, callback);
			} else {
				callback(response);
			}
		};
	const request =
		url.protocol === "https:"
			? https.request(url, requestCallback)
			: http.request(url, requestCallback);
	request.end();
	return request;
}
