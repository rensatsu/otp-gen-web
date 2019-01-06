; (() => {
	"use strict";

	const dec2hex = s => (s < 15.5 ? '0' : '') + Math.round(s).toString(16);

	const hex2dec = s => parseInt(s, 16);

	const base32tohex = base32 => {
		const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
		let bits = "";
		let hex = "";

		for (let i = 0; i < base32.length; i++) {
			const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
			bits += leftpad(val.toString(2), 5, '0');
		}

		for (let i = 0; i + 4 <= bits.length; i += 4) {
			const chunk = bits.substr(i, 4);
			hex = hex + parseInt(chunk, 2).toString(16);
		}
		return hex;
	}

	const leftpad = (str, len, pad) => {
		if ('padStart' in String.prototype) {
			return str.padStart(len, pad);
		} else {
			const padLength = len - str.length;
			return padLength > 0 ? pad.repeat(padLength) + str : str;
		}
	}

	const TOTPRemaining = _ => {
		const epoch = Math.round(new Date().getTime() / 1000.0);
		return 30 - (epoch % 30);
	}

	const TOTP = secret => {
		const epoch = Math.round(new Date().getTime() / 1000.0);
		const time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
		let otp = '';

		try {
			const key = base32tohex(secret.replace(/\s+/, '').toUpperCase());

			const shaObj = new jsSHA("SHA-1", "HEX");
			shaObj.setHMACKey(key, "HEX");
			shaObj.update(time);

			const hmac = shaObj.getHMAC("HEX");
			const offset = hex2dec(hmac.substring(hmac.length - 1));

			otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
			otp = (otp).substr(otp.length - 6, 6);
		} catch (e) {
			otp = 'N/A';
		}

		return otp;
	}

	const timer = _ => {
		const epoch = Math.round(new Date().getTime() / 1000.0);
		const countDown = 30 - (epoch % 30);
		if (epoch % 30 == 0) updateOtp();
	}

	this.TOTP = TOTP;
	this.TOTPRemaining = TOTPRemaining;
})();
