"use strict";

const CACHE_NAME = 'otp-gen-v9';
const LOG_PREFIX = '[worker]';

console.info(LOG_PREFIX, 'starting');

const offlineFundamentals = [
	'src/scss/app.scss',
	'src/img/icon/icon256.png',
	'src/img/icon/icon48.png',
	'src/img/icon/icon16.png',
	'src/img/icon/icon.svg',
	'src/img/icon/icon20.png',
	'src/img/icon/icon64.png',
	'src/img/icon/icon32.png',
	'src/img/icon/icon128.png',
	'src/img/icon/icon24.png',
	'src/img/icon/icon512.png',
	'src/img/logo.svg',
	'src/img/new.svg',
	'src/img/sites/google.svg',
	'src/img/sites/microsoft.svg',
	'src/img/sites/teamviewer.svg',
	'src/img/sites/github.svg',
	'src/img/sites/facebook.svg',
	'src/img/sites/cloudflare.svg',
	'src/img/sites/dropbox.svg',
	'src/img/sites/discord.svg',
	'src/img/sites/digitalocean.svg',
	'src/img/sites/vk.svg',
	'src/img/sites/arenanet.svg',
	'src/img/sites/bitbucket.svg',
	'src/img/sites/vultr.svg',
	'src/img/sites/aws.svg',
	'src/img/sites/twitter.svg',
	'src/img/sites/reddit.svg',
	'src/img/sites/rencloud.svg',
	'src/img/sites/reporturi.svg',
	'src/img/sites/namecheap.svg',
	'src/img/sites/gitlab.svg',
	'src/img/sites/paypal.svg',
	'src/img/sync.svg',
	'src/js/storage.js',
	'src/js/app.js',
	'src/js/socket.io.min.js',
	'src/js/wc-otp.js',
	'src/js/totp.js',
	'src/css/app.css',
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
