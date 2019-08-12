"use strict";

export default class Storage {
	constructor(prefix = '') {
		this.prefix = prefix + '_';
	}

	get(key) {
		return localStorage.getItem(this.prefix + key);
	}

	set(key, val) {
		return localStorage.setItem(this.prefix + key, val);
	}

	del(key) {
		return localStorage.removeItem(this.prefix + key);
	}
}
