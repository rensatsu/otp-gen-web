; (() => {
	"use strict";

	const TOTPRemaining = _ => {
		const epoch = Math.round(new Date().getTime() / 1000.0);
		return 30 - (epoch % 30);
	}

	const TOTP = secret => {
		try {
			const totpGenerator = new jsOTP.totp();
			return totpGenerator.getOtp(secret);
		} catch (e) {
			return 'N/A';
		}
	}

	this.TOTP = TOTP;
	this.TOTPRemaining = TOTPRemaining;
})();
