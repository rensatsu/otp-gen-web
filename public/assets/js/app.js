; (() => {
	"use strict";

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

	const Sites = [
		{
			title: 'cloudflare',
			image: 'cloudflare.svg'
		},
		{
			title: 'digitalocean',
			image: 'digitalocean.svg'
		},
		{
			title: 'discord',
			image: 'discord.svg'
		},
		{
			title: 'dropbox',
			image: 'dropbox.svg'
		},
		{
			title: 'facebook',
			image: 'facebook.svg',
			match: ['fb']
		},
		{
			title: 'github',
			image: 'github.svg'
		},
		{
			title: 'google',
			image: 'google.svg'
		},
		{
			title: 'microsoft',
			image: 'microsoft.svg',
			match: ['live']
		},
		{
			title: 'teamviewer',
			image: 'teamviewer.svg'
		},
		{
			title: 'vk',
			image: 'vk.svg'
		},
		{
			title: 'vultr',
			image: 'vultr.svg'
		},
		{
			title: 'arena',
			image: 'arenanet.svg',
			match: ['guildwars', 'guild wars']
		},
		{
			title: 'bitbucket',
			image: 'bitbucket.svg',
			match: ['bitbucket', 'atlassian']
		},
		{
			title: 'twitter',
			image: 'twitter.svg'
		},
		{
			title: 'aws',
			image: 'aws.svg',
			match: ['amazon web', 'amazon aws']
		},
		{
			title: 'reddit',
			image: 'reddit.svg'
		},
		{
			title: 'rencloud',
			image: 'rencloud.svg'
		},
		{
			title: 'reporturi',
			image: 'reporturi.svg',
			match: ['report-uri', 'report uri']
		},
		{
			title: 'namecheap',
			image: 'namecheap.svg'
		},
		{
			title: 'gitlab',
			image: 'gitlab.svg'
		}
	];

	const getImageForItem = item => {
		for (let i in Sites) {
			const site = Sites[i];
			if (item.title.toLowerCase().indexOf(site.title) !== -1)
				return `assets/img/sites/${site.image}`;

			if (item.account.toLowerCase().indexOf(site.title) !== -1)
				return `assets/img/sites/${site.image}`;

			if (typeof site.match != 'undefined') {
				for (let m in site.match) {
					const match = site.match[m];

					if (item.title.toLowerCase().indexOf(match) !== -1)
						return `assets/img/sites/${site.image}`;

					if (item.account.toLowerCase().indexOf(match) !== -1)
						return `assets/img/sites/${site.image}`;
				}
			}
		};

		return "assets/img/icon/icon.svg";
	}

	const Message = {
		hideTimer: false,

		init: _ => {
			$('#message').addEventListener('click', e => {
				e.preventDefault();
				Message.hide();
			});
		},

		hide: _ => {
			$('#message').classList.remove('show');

			if (this.hideTimer) {
				clearTimeout(this.hideTimer);
			}
		},

		show: (text, duration = 4000) => {
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
		console.log('copying', text);
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

	document.addEventListener('click', e => {
		const cardElem = hasClassInPath('card', e.path);

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

			if (confirm("Do you really want to delete this account?")) {
				App.secrets.splice(e.target.dataset.delete, 1);
				LS.set('accounts', JSON.stringify(App.secrets));
				App.render();

				if (cardElem) {
					cardElem.classList.remove('active');
				}
			}

			return true;
		}

		if (cardElem) {
			e.preventDefault();

			if (typeof e.target.dataset.cancel !== 'undefined') {
				cardElem.classList.remove('active');
			}

			if (!hasClassInPath('card-actions', e.path)) {
				document.querySelectorAll('#app .card.active').forEach(elem => {
					elem.classList.remove('active');
				});

				cardElem.classList.toggle('active');
			} else {
				cardElem.classList.remove('active');
			}
		}
	});

	const IconFont = {
		init: _ => {
			document.querySelectorAll('[data-icon]').forEach(elem => {
				const icon = elem.dataset.icon;
				delete elem.dataset.icon;
				elem.classList.add('icon-js');

				const img = document.createElement('img');
				img.src = `assets/img/${icon}.svg`;
				elem.appendChild(img);
			});
		}
	}

	const App = {
		refreshTimer: false,
		secrets: [],
		cardElements: [],

		templates: {
			card: `
				<div class='card-image'>
					<img src='%icon%' alt='%title%' />
				</div>

				<div class='card-content'>
					<h2>%title%</h2>
					<p class='class-subtext'>%account%</p>
					<p class='card-token'><span data-copy='' data-otp='%token%' data-otp-inner='true'>%token-show%</span></p>
				</div>
				
				<div class='card-actions'>
					<button type='button' data-copy='' data-otp='%token%'>Copy</button>
					<button type='button' class='button-danger' data-delete='%id%'>Delete</button>
					<button type='button' data-cancel='cancel'>Cancel</button>
				</div>
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

				this.secrets.forEach((item, id) => {
					const card = document.createElement('div');
					card.classList.add('card');
					card.dataset.secret = item.secret;
					const token = TOTP(item.secret);
					const image = getImageForItem(item);

					card.innerHTML = this.templates.card
						.replace(/%id%/g, id)
						.replace(/%icon%/g, image)
						.replace(/%title%/g, item.title)
						.replace(/%account%/g, item.account)
						.replace(/%token%/g, token)
						.replace(/%token-show%/g, token.replace(/(\d{3})(.*)/g, "$1 $2"));
					$('#app').appendChild(card);
					this.cardElements.push(card);
				});

				this.setRemaining();

				if (this.refreshTimer) {
					// clearRequestInterval(this.refreshTimer);
					clearInterval(this.refreshTimer);
				}

				// requestInterval(_ => {
				setInterval(_ => {
					this.refreshTimer = this.setRemaining();
				}, 1000);
			} else {
				$('#app').innerHTML = this.templates.empty;
			}

			IconFont.init();
		},

		setRemaining: function () {
			const remain = TOTPRemaining();
			$('#app-timer').style.width = (remain * 100 / 30) + '%';

			if (remain === 30) {
				this.refresh();
			}
		},

		refresh: function () {
			this.cardElements.forEach(card => {
				const token = TOTP(card.dataset.secret);
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
		initComplete: false,

		init: function () {
			if (!this.initComplete) {
				this.initComplete = true;

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
	}

	const Sync = {
		initFinished: false,

		setMode: function (mode) {
			if (!this.initFinished) {
				Message.show('Socket.IO is not loaded yet, please try again later');
				return;
			}

			if (mode === 'export') {
				$('#sync-tab-import').style.display = 'none';
				$('#sync-tab-export').style.display = 'block';
				$('#sync-tab-debug').style.display = 'none';

				$('#sync-modal-title').innerHTML = 'Data export';

				$('#sync-tab-export-code').innerHTML = '...';
				$('#sync-tab-export-status').innerHTML = '';

				this.Export.initiate();
			} else if (mode === 'import') {
				$('#sync-tab-export').style.display = 'none';
				$('#sync-tab-import').style.display = 'block';
				$('#sync-tab-debug').style.display = 'none';

				$('#sync-modal-title').innerHTML = 'Data import';

				$('#sync-tab-import-status').innerHTML = '';
				$('#sync-tab-import-code').removeAttribute('disabled');
				$('#sync-tab-import-code').value = '';
				$('#sync-tab-import-code').focus();
			} else {
				$('#sync-tab-export').style.display = 'none';
				$('#sync-tab-import').style.display = 'none';
				$('#sync-tab-debug').style.display = 'block';

				$('#sync-modal-title').innerHTML = 'Debug';
			}
		},

		Export: {
			roomId: false,
			socket: false,

			initiate: function () {
				this.socket = io('https://otp.rencloud.xyz/');

				this.socket.on('connect', _ => {
					this.socket.emit('get-room', {}, data => {
						console.log('[Socket.IO]', 'get-room', data);
						this.roomId = data;
						$('#sync-tab-export-code').innerHTML = data.replace('sync_', '');
					});
				});

				this.socket.on('device-connected', data => {
					console.log('[Socket.IO]', 'device-connected', (data));
					if (data.room == this.roomId && data.clients >= 2) {
						this.startVerification();
					}
				});
			},

			startVerification: function () {
				const verification = ("00" + Math.floor(Math.random() * 100)).substr(-2);
				this.socket.emit('send-verification', verification);

				this.socket.on('handle-verification', data => {
					console.log('[Socket.IO]', 'handle-verification', data);
					// let response = confirm(`Is your other device shows the code <b>${data.code}</b>?`);
					$('#sync-tab-export-status').innerHTML = `
						<div class='sync-prompt'>
							Is your other device shows the code <b>${data.code}</b>?
							<div>
								<button class='sync-prompt-button' data-response='yes'>Yes</button>
								<button class='sync-prompt-button' data-response='no'>No</button>
							</div>
						</div>
					`;

					$('#sync-tab-export-status .sync-prompt-button').forEach(item => {
						item.addEventListener('click', e => {
							if (e.target.dataset.response !== 'yes') {
								$('#sync-tab-export-status').innerHTML = 'Sync cancelled';
								$('#sync-tab-export-code').innerHTML = '----';
								this.socket.emit('disconnect');
								this.socket.disconnect();
							} else {
								$('#sync-tab-export-status').innerHTML = 'Sending data';
								const secrets = JSON.stringify(App.getSecrets());

								this.socket.emit('data-export', secrets, data => {
									$('#sync-tab-export-status').innerHTML = 'Sync completed';
									this.socket.emit('disconnect');
									this.socket.disconnect();
								});
							}
						});
					});
				});

				this.socket.on('device-disconnected', (data) => {
					console.log('[Socket.IO]', 'device-disconnected', data);
					$('#sync-tab-export-status').innerHTML = `Remote device disconnected.`;
				});
			}
		},

		Import: {
			socket: false,

			openRoom: function (room) {
				this.socket = io();

				this.socket.on('connect', _ => {
					this.socket.emit('check-room', { room: 'sync_' + room }, data => {
						console.log('[Socket.IO]', 'check-room', data);
						if (!data.accepted) {
							$('#sync-tab-import-status').innerHTML = 'Incorrect code';
							$('#sync-tab-import-code').removeAttribute('disabled');
							$('#sync-tab-import-code').value = '';
							$('#sync-tab-import-code').focus();
							this.socket.emit('disconnect');
							this.socket.disconnect();
						} else {
							$('#sync-tab-import-status').innerHTML = 'Connected, waiting';
						}
					});
				});

				this.socket.on('handle-verification', data => {
					console.log('[Socket.IO]', 'handle-verification', data);
					$('#sync-tab-import-status').innerHTML = `Verification code: <b>${data.code}</b>.`;
				});

				this.socket.on('device-disconnected', data => {
					console.log('[Socket.IO]', 'device-disconnected', data);
					$('#sync-tab-import-status').innerHTML = `Remote device disconnected.`;
					$('#sync-tab-import-code').removeAttribute('disabled');
					$('#sync-tab-import-code').value = '';
					$('#sync-tab-import-code').focus();
					this.socket.emit('disconnect');
					this.socket.disconnect();
				});

				this.socket.on('data-import', data => {
					LS.set('accounts', data.data);
					App.render();
					Sync.close();
					Message.show('Synchronization completed');
					$('#sync-tab-import-status').innerHTML = `Got data`;
				});
			}
		},

		close: function () {
			$('#sync-modal').classList.remove('show');

			if (this.Export.socket) {
				this.Export.socket.disconnect();
				this.Export.socket = false;
			}
		},

		init: function () {
			Modal.init();

			$('#app-sync').addEventListener('click', e => {
				e.preventDefault();
				$('#sync-modal').classList.add('show');
				this.setMode(App.secrets.length === 0 ? 'import' : 'export');
			});

			$('#sync-modal-title').innerHTML = 'Synchronization';

			$('#sync-modal-body').innerHTML = `
				<div>
					<button class='sync-tab' data-tab='import'>Import</button>
					<button class='sync-tab' data-tab='export'>Export</button>
					<button class='sync-tab' data-tab='debug'>Debug</button>
				</div>

				<div id='sync-tab-export'>
					<p>Please, enter the following code on the device, where you want to copy your data to:</p>
					<div id='sync-tab-export-code'>...</div>
					<p id='sync-tab-export-status'></p>
				</div>

				<div id='sync-tab-import'>
					<p>Please, enter the code from another device:</p>
					<p class='note'>Note: All existing accounts will be deleted</p>
					<div>
						<input type='number' id='sync-tab-import-code' maxlength='4' />
					</div>
					<p id='sync-tab-import-status'></p>
				</div>

				<div id='sync-tab-debug'>
					<p><button class='button-danger' id='sync-debug-clear'>Clear all secrets</button></p>
					<p><button class='button-danger' id='sync-debug-demo'>Clear -> Demo mode</button></p>
				</div>
			`;

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
					const demo = JSON.stringify([{
						"title": "Dropbox",
						"secret": "AAAAA",
						"account": "test"
					},
					{
						"title": "Some Unsopported Application",
						"secret": "BBBBB",
						"account": "unsupported@gmail.com"
					}]);
					LS.set('accounts', demo);
					App.render();
					Sync.close();
				}
			});

			$('.sync-tab').forEach(item => {
				item.addEventListener('click', e => {
					e.preventDefault();
					this.setMode(e.target.dataset.tab);
				});
			});

			$('#sync-tab-import-code').addEventListener('keyup', e => {
				if (e.target.value.length === 4) {
					e.target.disabled = 'disabled';
					this.Import.openRoom(e.target.value);
				}
			});

			$('#sync-tab-import-code').addEventListener('keypress', e => {
				if (isNaN(parseInt(e.key))) {
					e.preventDefault();
				}

				$('#sync-tab-import-status').innerHTML = '';
			});

			const ioTag = document.createElement('script');
			ioTag.src = 'assets/js/socket.io.min.js';
			ioTag.async = true;
			ioTag.addEventListener('load', _ => {
				this.initFinished = true;
			});

			document.body.appendChild(ioTag);
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
		console.log('[ServiceWorker]', 'CLIENT: service worker registration in progress.');
		navigator.serviceWorker.register('sw.js').then(_ => {
			// Message.show('App can now be used in offline', 2000);
			console.log('[ServiceWorker]', 'CLIENT: service worker registration complete.');
		}, _ => {
			console.log('[ServiceWorker]', 'CLIENT: service worker registration failure.');
		});
	} else {
		console.error('[ServiceWorker]', 'CLIENT: service worker is not supported.');
	}
})();
