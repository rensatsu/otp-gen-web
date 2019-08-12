"use strict";
const WCTOTP = require('./wc-totp.js');

const TOTPRemaining = _ => {
	const epoch = Math.round(new Date().getTime() / 1000.0);
	return 30 - (epoch % 30);
}

const TOTP = async (secret) => {
	try {
		const totpGenerator = new WCTOTP();
		return await totpGenerator.getOtp(secret);
	} catch (e) {
		console.warn(e);
		return 'N/A';
	}
}

module.exports = {
	TOTP,
	TOTPRemaining
};
