"use strict";

import Storage from './js/storage.js';
import io from 'socket.io-client';
import { TOTP, TOTPRemaining } from './js/totp.js';
import './scss/app.scss';

const IO_SERVER = 'https://rensatsu.xyz';
const IO_PATH = '/apps/otp/';
const LS = new Storage('otp');

const SWIPE_THRESHOLD = 0.15;
const SWIPE_SUCCESS_THRESHOLD = 0.35;
const SWIPE_SCROLL_THRESHOLD = 0.15;

const hasClassInPath = (className, path) => {
	for (let i in path) {
		if (typeof path[i].classList !== 'undefined') {
			if (path[i].classList.contains(className)) {
				return path[i];
			}
		}
	};

	return false;
}

const $ = sel => {
	const res = document.querySelectorAll(sel);

	if (!res || res.length === 0) {
		return false;
	} else if (res.length === 1) {
		return res[0];
	} else {
		return res;
	}
}

import websiteList from './js/websites-list.js';

const getImageForItem = item => {
	for (let site of websiteList()) {
		if (item.title.toLowerCase().indexOf(site.title) !== -1) {
			return `./img/sites/${site.image}`;
		}

		if (item.account.toLowerCase().indexOf(site.title) !== -1) {
			return `./img/sites/${site.image}`;
		}

		if (typeof site.match != 'undefined') {
			for (let m in site.match) {
				const match = site.match[m];

				if (item.title.toLowerCase().indexOf(match) !== -1) {
					return `./img/sites/${site.image}`;
				}

				if (item.account.toLowerCase().indexOf(match) !== -1) {
					return `./img/sites/${site.image}`;
				}
			}
		}
	};

	return `./img/icon/icon.svg`;
}

const Message = {
	hideTimer: false,

	init: function() {
		$('#message').addEventListener('click', e => {
			e.preventDefault();
			Message.hide();
		});
	},

	hide: function() {
		$('#message').classList.remove('show');

		if (this.hideTimer) {
			clearTimeout(this.hideTimer);
		}
	},

	show: function (text, duration = 4000) {
		$('#message').classList.add('show');
		$('#message-inner').innerHTML = text;

		if (this.hideTimer) {
			clearTimeout(this.hideTimer);
		}

		this.hideTimer = setTimeout(_ => {
			$('#message').classList.remove('show');
		}, duration);
	}
}

const copyText = text => {
	const tempElem = document.createElement('input');
	tempElem.value = text;
	tempElem.style.opacity = 0;
	tempElem.style.position = 'fixed';
	tempElem.style.left = '-1000px';
	document.body.appendChild(tempElem);
	tempElem.select();
	document.execCommand('copy');
	tempElem.parentNode.removeChild(tempElem);

	Message.show("✅ Text copied", 2000);
}

const deleteAccount = (id) => {
	if (confirm("Do you really want to delete this account?")) {
		App.secrets.splice(id, 1);
		LS.set('accounts', JSON.stringify(App.secrets));
		App.render();

		return true;
	}

	return false;
};

const getScreenThresholdValue = (threshold) => {
	return threshold * screen.availWidth;
};

const checkScreenThreshold = (x, threshold) => {
	return x > getScreenThresholdValue(threshold);
};

const checkScrollThreshold = (x1, x2) => {
	return Math.abs(x1 - x2) > SWIPE_SCROLL_THRESHOLD * screen.availHeight;
}

document.addEventListener('click', e => {
	const eventPath = e.path || (e.composedPath && e.composedPath());
	const cardElem = hasClassInPath('card', eventPath);

	if (typeof e.target.dataset.copy !== 'undefined') {
		e.preventDefault();
		copyText(e.target.dataset.otp);

		if (cardElem) {
			cardElem.classList.remove('active');
		}
		return true;
	}

	if (typeof e.target.dataset.delete !== 'undefined') {
		e.preventDefault();

		deleteAccount(e.target.dataset.delete);

		return true;
	}
});

import IconFont from './js/icon-font.js';

const App = {
	refreshTimer: false,
	secrets: [],
	cardElements: [],

	templates: {
		card: `
			<div class='card-image'></div>

			<h2>%title%</h2>
			<button type='button' class='button-del-float' data-delete='%id%' title='Delete'>&times;</button>
			<p class='class-subtext'>%account%</p>
			<p class='card-token'>
				<span data-copy='' data-otp='%token%' data-otp-inner='true'>
					%token-show%
				</span>
			</p>
		`,

		empty: `
			<div class='splash-empty'>
				<div><span data-icon='logo'></span></div>
				<p>There are no accounts</p>
			</div>
		`
	},

	getSecrets: _ => {
		const secrets = LS.get('accounts');
		if (secrets !== null) {
			return JSON.parse(secrets);
		} else {
			return [];
		}
	},

	render: function () {
		this.secrets = this.getSecrets();
		this.cardElements = [];

		if (this.secrets.length > 0) {
			$('#app').innerHTML = '';

			this.secrets.forEach(async (item, id) => {
				const card = document.createElement('div');
				card.classList.add('card');
				card.dataset.secret = item.secret;
				const token = await TOTP(item.secret);
				const iconSrc = getImageForItem(item);

				card.innerHTML = this.templates.card
					.replace(/%id%/g, id)
					.replace(/%title%/g, item.title)
					.replace(/%account%/g, item.account)
					.replace(/%token%/g, token)
					.replace(/%token-show%/g, token.replace(/(\d{3})(.*)/g, "$1 $2"));

				const icon = document.createElement('img');
				import(/* webpackMode: "eager" */ `${iconSrc}`).then(module => {
					icon.alt = item.title;
					icon.src = module.default;

					card.querySelector('.card-image').append(icon);

					$('#app').appendChild(card);
					this.cardElements.push(card);
				});

				card.addEventListener('touchstart', e => {
					if (!('changedTouches' in e) || e.changedTouches.length === 0) {
						return;
					}

					card.dataset.swipeIsActive = true;
					card.dataset.swipeStartX = e.changedTouches[0].clientX;
					card.dataset.swipeStartY = e.changedTouches[0].clientY;
				});

				card.addEventListener('touchmove', e => {
					if (!card.dataset.swipeIsActive) {
						return;
					}

					if (!('changedTouches' in e) || e.changedTouches.length === 0) {
						return;
					}

					const origX = parseFloat(card.dataset.swipeStartX);
					const currX = parseFloat(e.changedTouches[0].clientX);

					const delta = currX - origX;

					if (delta < 0) {
						return;
					}

					if (!checkScreenThreshold(delta, SWIPE_THRESHOLD)) {
						return;
					}

					const offset = getScreenThresholdValue(SWIPE_THRESHOLD);

					card.style.setProperty('--card-swipe-x', `${delta - offset}px`);
				});

				card.addEventListener('touchend', e => {
					let isSuccess = false;

					const origX = parseFloat(card.dataset.swipeStartX);
					const currX = parseFloat(e.changedTouches[0].clientX);

					const origY = parseFloat(card.dataset.swipeStartY);
					const currY = parseFloat(e.changedTouches[0].clientY);

					const delta = currX - origX;

					if (delta < 0) {
						isSuccess = false;
					} else if (!checkScreenThreshold(delta, SWIPE_THRESHOLD)) {
						isSuccess = false;
					} else if (!checkScreenThreshold(delta, SWIPE_SUCCESS_THRESHOLD)) {
						isSuccess = false;
					} else {
						isSuccess = true;
					}

					if (checkScrollThreshold(origY, currY)) {
						isSuccess = false;
					}

					if (isSuccess) {
						card.style.setProperty('--card-swipe-x', '100%');
					} else {
						card.style.setProperty('--card-swipe-x', 0);
					}

					delete card.dataset.swipeIsActive;
					delete card.dataset.swipeStartX;
					delete card.dataset.swipeStartY;

					if (isSuccess) {
						const result = deleteAccount(id);

						if (!result) {
							card.style.setProperty('--card-swipe-x', 0);
						}
					}
				});
			});

			this.setRemaining();

			if (this.refreshTimer) {
				clearInterval(this.refreshTimer);
			}

			setInterval(_ => {
				this.refreshTimer = this.setRemaining();
			}, 1000);
		} else {
			$('#app').innerHTML = this.templates.empty;
		}

		new IconFont();
	},

	setRemaining: function () {
		const remain = TOTPRemaining();
		$('#app-timer').style.width = (remain * 100 / 30) + '%';

		if (remain === 30) {
			this.refresh();
		}
	},

	refresh: function () {
		this.cardElements.forEach(async (card) => {
			const token = await TOTP(card.dataset.secret);
			card.querySelectorAll('[data-otp]').forEach(oel => {
				oel.dataset.otp = token;
				if (typeof oel.dataset.copy !== 'undefined') {
					oel.dataset.copy = token;
				}

				if (typeof oel.dataset.otpInner !== 'undefined') {
					oel.innerHTML = token.replace(/(\d{3})(.*)/g, "$1 $2");
				}
			});
		});
	}
}

const Modal = {
	init: function () {
		document.addEventListener('click', e => {
			if (typeof e.target.classList != 'undefined' && e.target.classList.contains('modal-backdrop')) {
				e.preventDefault();
				e.target.parentNode.classList.remove('show');
			}

			if (typeof e.target.classList != 'undefined' && e.target.classList.contains('modal-close')) {
				e.preventDefault();
				e.target.parentNode.parentNode.parentNode.classList.remove('show');
			}
		});
	}
}

const Sync = {
	close: function () {
		$('#sync-modal').classList.remove('show');
	},

	init: function () {
		Modal.init();

		$('#app-sync').addEventListener('click', e => {
			e.preventDefault();
			$('#sync-modal').classList.add('show');
		});

		$('#sync-modal-title').innerHTML = 'Debug and demo mode';

		$('#sync-modal-body').innerHTML = `
			<div id='sync-tab-debug'>
				<p class='note-danger'>Export and import functionality deprecated.</p>
				<p class='note-danger'>WARNING: Using any of the buttons below will DELETE ALL YOUR ACCOUNTS!</p>
				<p><button class='button-danger' id='sync-debug-clear'>Delete all accounts</button></p>
				<p><button class='button-danger' id='sync-debug-demo'>Delete all and enable demo mode</button></p>
			</div>
		`;

		$('#sync-tab-debug').style.display = 'block';

		$('#sync-debug-clear').addEventListener('click', e => {
			e.preventDefault();
			if (confirm("Do you really want to clear ALL DATA?")) {
				LS.del('accounts');
				App.render();
				Sync.close();
			}
		});

		$('#sync-debug-demo').addEventListener('click', e => {
			e.preventDefault();
			if (confirm("Do you really want to clear ALL DATA?")) {
				LS.del('accounts');

				const demoList = [];

				const randomToken = (length = 5) => {
					const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('');

					return (new Array(length))
						.fill(null)
						.map(() => letters[Math.floor(Math.random() * letters.length)])
						.join('');
				};

				websiteList().forEach(site => {
					const title = site.title.substring(0, 1).toLocaleUpperCase() +
						site.title.substring(1);

					demoList.push({
						title: title,
						secret: randomToken(10),
						account: "username@example.org"
					});
				});

				demoList.push({
					title: "Some Unsopported Application",
					secret: "BBBBB",
					account: "unsupported@example.org"
				})

				const demo = JSON.stringify(demoList);

				LS.set('accounts', demo);
				App.render();
				Sync.close();
			}
		});
	}
}

const NewEntry = {
	close: function () {
		$('#add-modal').classList.remove('show');
		$('#add-new-form').reset();
	},

	init: function () {
		Modal.init();

		$('#add-modal-body').innerHTML = `
			<form id='add-new-form'>
				<div class='form-field'>
					<label for='add-new-input-title'>Title</label>
					<div class='form-input'>
						<input type='text' name='title'  id='add-new-input-title' />
					</div>
				</div>

				<div class='form-field'>
					<label for='add-new-input-account'>Accont Name or E-mail</label>
					<div class='form-input'>
						<input type='text' name='account' id='add-new-input-account' />
					</div>
				</div>

				<div class='form-field'>
					<label for='add-new-input-secret'>Secret</label>
					<div class='form-input'>
						<input type='text' name='secret' id='add-new-input-secret' />
					</div>
				</div>

				<div class='form-field'>
					<button type='submit'>Save</button>
				</div>
			</form>
		`;

		$('#app-newentry').addEventListener('click', e => {
			e.preventDefault();
			$('#add-modal').classList.add('show');
		});

		$('#add-modal').querySelector('.modal-close').addEventListener('click', e => {
			this.close();
		});

		$('#add-new-form').addEventListener('submit', e => {
			e.preventDefault();
			const entries = new FormData(e.target);

			let Item = {
				title: false,
				secret: false,
				account: false
			};

			for (let entry of entries.entries()) {
				const key = entry[0];

				if (typeof Item[key] !== 'undefined') {
					let value = entry[1];

					if (key === 'secret') {
						value = value.replace(/\s+/, '').toUpperCase();
					}

					Item[key] = value;
				}
			}

			let isOkay = true;
			Object.keys(Item).forEach(param => {
				if (Item[param] === false || Item[param] === '') isOkay = false;
			});

			if (!isOkay) {
				Message.show("All fields are required!", 2000);
			} else {
				App.secrets.push(Item);
				LS.set('accounts', JSON.stringify(App.secrets));
				App.render();
				NewEntry.close();
				Message.show("Entry saved", 2000);
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', e => {
	Message.init();
	Sync.init();
	NewEntry.init();
	App.render();
});

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('service-worker.js').then(reg => {
		console.log('[worker]', 'CLIENT: service worker registration complete.');

		reg.addEventListener('updatefound', () => {
			const installingWorker = reg.installing;

			installingWorker.addEventListener('statechange', () => {
				switch (installingWorker.state) {
					case 'installed':
						if (navigator.serviceWorker.controller) {
							Message.show("🔄 App update available, please reload page");
							console.info('[worker]', 'new or updated content is available');
						} else {
							console.info('[worker]', 'content is now available offline');
						}
						break;

					case 'waiting':
						console.log('[worker]', 'waiting state');
						break;
					case 'redundant':
						console.error('[worker]', 'the installing service worker became redundant');
						break;
				}
			});
		});
	}, _ => {
		console.log('[ServiceWorker]', 'CLIENT: service worker registration failure.');
	});
} else {
	console.error('[ServiceWorker]', 'CLIENT: service worker is not supported.');
}
