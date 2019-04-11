"use strict";

console.log('[ServiceWorker]', 'WORKER: starting');
const version = 'v37::';

const offlineFundamentals = [
	'assets/scss/app.scss',
	'assets/img/icon/icon256.png',
	'assets/img/icon/icon48.png',
	'assets/img/icon/icon16.png',
	'assets/img/icon/icon.svg',
	'assets/img/icon/icon20.png',
	'assets/img/icon/icon64.png',
	'assets/img/icon/icon32.png',
	'assets/img/icon/icon128.png',
	'assets/img/icon/icon24.png',
	'assets/img/icon/icon512.png',
	'assets/img/logo.svg',
	'assets/img/new.svg',
	'assets/img/sites/google.svg',
	'assets/img/sites/microsoft.svg',
	'assets/img/sites/teamviewer.svg',
	'assets/img/sites/github.svg',
	'assets/img/sites/facebook.svg',
	'assets/img/sites/cloudflare.svg',
	'assets/img/sites/dropbox.svg',
	'assets/img/sites/discord.svg',
	'assets/img/sites/digitalocean.svg',
	'assets/img/sites/vk.svg',
	'assets/img/sites/arenanet.svg',
	'assets/img/sites/bitbucket.svg',
	'assets/img/sites/vultr.svg',
	'assets/img/sites/aws.svg',
	'assets/img/sites/twitter.svg',
	'assets/img/sites/reddit.svg',
	'assets/img/sites/rencloud.svg',
	'assets/img/sites/reporturi.svg',
	'assets/img/sites/namecheap.svg',
	'assets/img/sites/gitlab.svg',
	'assets/img/sync.svg',
	'assets/js/storage.js',
	'assets/js/app.js',
	'assets/js/socket.io.min.js',
	'assets/js/jsOTP.min.js',
	'assets/js/totp.js',
	'assets/css/app.css',
	'index.html',
	'manifest.json',
	''
];

const ignoreCacheEvent = request => {
	if (request.method !== 'GET') return true;
	if (request.url.indexOf('/socket.io/') >= 0) return true;

	return false;
}

self.addEventListener("install", event => {
	console.info('[ServiceWorker]', 'WORKER: install event in progress.');
	event.waitUntil(
		caches
			.open(version + 'assets')
			.then(cache => cache.addAll(offlineFundamentals))
			.then(_ => console.log('[ServiceWorker]', 'WORKER: install completed'))
	);
});

self.addEventListener("fetch", event => {
	if (ignoreCacheEvent(event.request)) {
		console.info(
			'[ServiceWorker]',
			'WORKER: fetch event ignored',
			{ method: event.request.method, url: event.request.url }
		);

		return;
	}

	console.info('[ServiceWorker]', 'WORKER: fetch event', event.request.url, event);

	event.respondWith(
		fetch(event.request).catch(function () {
			return caches.match(event.request);
		})
	);
});

self.addEventListener("activate", event => {
	console.log('[ServiceWorker]', 'WORKER: activate event in progress', event);

	event.waitUntil(
		caches
			.keys()
			.then(keys => Promise.all(
				keys
					.filter(key => !key.startsWith(version))
					.map(key => {
						console.warn('[ServiceWorker]', 'WORKER: Removing cache key', key);
						return caches.delete(key);
					})
			))
			.then(_ => console.log('[ServiceWorker]', 'WORKER: activate completed'))
	);
});
