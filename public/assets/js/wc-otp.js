/**
 * WebCrypto TOTP generator.
 *
 * Based on:
 * * https://github.com/jiangts/JS-OTP
 * * https://github.com/diafygi/webcrypto-examples/
 */

(() => {
	class TOTP {
		constructor(expiry = 30, length = 6) {
			this.expiry = expiry;
			this.length = length;

			if (this.length > 8 || this.length < 6) {
				throw "Error: invalid code length";
			}
		}

		dec2hex(s) {
			return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
		}

		hex2dec(s) {
			return parseInt(s, 16);
		}

		base32toArray(base32) {
			const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
			const hex = [];
			let bits = [];

			let i = 0;
			while (i < base32.length) {
				let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
				val = val === -1 ? 0 : val;
				bits.push(this.padLeft(val.toString(2), 5, "0"));
				i++;
			}

			i = 0;
			bits = bits.join('');
			while (i + 4 <= bits.length) {
				const chunk = bits.substr(i, 4);
				hex.push(parseInt(chunk, 2).toString(16));
				i += 4;
			}

			return hex;
		}

		base32tohex(base32) {
			return this.base32toArray(base32).join('');
		}

		padLeft(str, len, pad) {
			return str.padStart(len, pad);
		}

		buffer2hex(buf) {
			return Array.prototype.map.call(new Uint8Array(buf), s => {
				return ("00" + s.toString(16)).slice(-2);
			}).join("");
		}

		hex2buffer(hex) {
			return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
				return parseInt(h, 16);
			}));
		}

		async wcImportKey(key) {
			const encKey = this.hex2buffer(key);

			return await window.crypto.subtle.importKey(
				"raw",
				encKey,
				{
					name: "HMAC",
					hash: { name: "SHA-1" }
				},
				false,
				["sign"]
			);
		}

		async wcSign(data, cKey) {
			const encData = this.hex2buffer(data);
			return await window.crypto.subtle.sign(
				{
					name: "HMAC",
				},
				cKey,
				encData
			);
		}

		async getOtp(secret, now = new Date().getTime()) {
			const epoch = Math.round(now / 1000.0);
			const wcTime = this.padLeft(this.dec2hex(Math.floor(epoch / this.expiry)), 16, "0");
			const wcKey = await this.wcImportKey(this.base32tohex(secret));
			const wcHmac = await this.wcSign(wcTime, wcKey);
			const wcHmacHex = this.buffer2hex(wcHmac);
			const offset = this.hex2dec(wcHmacHex.substring(wcHmacHex.length - 1));

			let otp = (this.hex2dec(wcHmacHex.substr(offset * 2, 8)) & this.hex2dec("7fffffff")) + "";
			if (otp.length > this.length) {
				otp = otp.substr(otp.length - this.length, this.length);
			} else {
				otp = this.padLeft(otp, this.length, "0");
			}

			return otp;
		}

	};

	window.TOTPGenerator = TOTP;
})();
