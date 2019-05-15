"use strict";

const CACHE_NAME = 'otp-gen-v5';
const LOG_PREFIX = '[worker]';

console.info(LOG_PREFIX, 'starting');

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
	'.'
];

self.addEventListener("install", event => {
	console.info(LOG_PREFIX, 'install event in progress.');
	self.skipWaiting();

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(cache => cache.addAll(offlineFundamentals))
			.then(_ => console.log(LOG_PREFIX, 'install completed'))
	);
});

self.addEventListener("fetch", event => {
	if (event.request.method !== 'GET') return;

	event.respondWith(
		caches
			.match(event.request)
			.then(response => {
				// cached
				if (response) return response;

				// online - internal
				return fetch(event.request)
					.then(response => {
						// response validation
						const validResponse = () => {
							if (!response) return false;
							if (response.status !== 200) return false;
							if (response.type !== 'basic') return false;
						};

						if (validResponse()) {
							console.log(
								LOG_PREFIX,
								'fetch validation failed',
								{
									response,
									url: response.url,
									status: response.status,
									type: response.type,
									request: event.request
								}
							);

							return response || new Response('Service unavailable', { status: 503, statusText: 'Service unavailable' });
						}

						const responseToCache = response.clone();
						caches.open(CACHE_NAME)
							.then(cache => {
								cache.put(event.request, responseToCache);
							});

						return response || new Response('Service unavailable', { status: 503, statusText: 'Service unavailable' });
					})
					.catch(e => console.error(LOG_PREFIX, 'fetch failed', { event, request: event.request, e }));
			})
	);
});

self.addEventListener("activate", event => {
	console.info(LOG_PREFIX, 'activate event in progress', event);

	event.waitUntil(
		caches
			.keys()
			.then(keys => Promise.all(
				keys
					.filter(key => key !== CACHE_NAME)
					.map(key => caches.delete(key))
			))
			.then(_ => console.info(LOG_PREFIX, 'activate completed'))
	);
});
