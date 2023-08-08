import type { NormalizerStrType } from 'utils';
import { decrypt, getNormalizer } from 'utils';

class Hunt {
	questions: string[];
	answers: string[];
	length: number;
	success?: string;

	private _normalizer: (str: string) => string;
	private _iv: string;
	private _data: string[];
	private _current: { a: string, o?: string, hasK: false } | { q: string, k: string, a?: string, hasK: true };

	constructor (huntJSON: string, normalizeOverride?: (ans: string) => string) {
		const {
			d: data,
			k: startReadKey,
			i: iv,
			n: normalizeStr
		}: {
			d: string[];
			k: string;
			i: string;
			n: NormalizerStrType;
		} = JSON.parse(huntJSON);
		const normalizer = getNormalizer(normalizeStr) ?? normalizeOverride;
		if (!normalizer) throw new Error('Missing normalizer!');
		this._normalizer = normalizer;
		const firstTerm = JSON.parse(decrypt(data.shift(), startReadKey, normalizer('init'), iv));
		this.length = data.length;
		this._data = data;
		this._current = { ...firstTerm, hasK: true };
		this._iv = iv;
		this.questions = [firstTerm.q];
		this.answers = [];
	}
	guess (ans: string): boolean {
		const ansId = this._normalizer(ans);
		if (!this._current.hasK) throw new Error('Fully solved!');
		try {
			const next = this._data[0];
			const element = JSON.parse(decrypt(next, this._current.k, ansId, this._iv));
			this._data.shift();
			this._current = { ...element, hasK: Boolean(element.k) };
			this.answers.push(this._current.a);
			if (this._current.hasK === true) this.questions.push(this._current.q);
			else if (this._current.o) this.success = this._current.o;
			return true;
		} catch {
			return false;
		}
	}
}

export function createClient (huntJSON: string, normalize?: (ans: string) => string) {
	try {
		return new Hunt(huntJSON, normalize);
	} catch {
		throw new Error('Invalid input!');
	}
}
