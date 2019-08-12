"use strict";
import WCTOTP from './wc-totp.js';

export const TOTPRemaining = _ => {
	const epoch = Math.round(new Date().getTime() / 1000.0);
	return 30 - (epoch % 30);
}

export const TOTP = async (secret) => {
	try {
		const totpGenerator = new WCTOTP();
		return await totpGenerator.getOtp(secret);
	} catch (e) {
		console.warn(e);
		return 'N/A';
	}
}
