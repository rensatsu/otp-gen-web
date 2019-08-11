; (async () => {
	"use strict";

	const TOTPRemaining = _ => {
		const epoch = Math.round(new Date().getTime() / 1000.0);
		return 30 - (epoch % 30);
	}

	const TOTP = async (secret) => {
		try {
			const totpGenerator = new TOTPGenerator();
			return await totpGenerator.getOtp(secret);
		} catch (e) {
			console.warn(e);
			return 'N/A';
		}
	}

	this.TOTP = TOTP;
	this.TOTPRemaining = TOTPRemaining;
})();
