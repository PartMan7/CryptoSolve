import type { NormalizerStrType as NormalizerType } from 'utils';
import { encrypt, generateKeysAsymm, generateIv, getNormalizer } from 'utils';

type Normalizer = NormalizerType | ((str: string) => string);

export function createShareable (pairs: [string, string][], output?: string, normalize: Normalizer = 'id') {
	const normalizer = typeof normalize === 'function' ? normalize : getNormalizer(normalize);
	const nStr = typeof normalize === 'function' ? 'custom' : normalize;

	const data = [];
	const iv = generateIv();
	const { readKey: startReadKey, writeKey: startWriteKey } = generateKeysAsymm(normalizer('init'));
	const writeKeys = [startWriteKey];

	pairs.forEach(([q, a], i) => {
		const aId = normalizer(a);
		const { readKey, writeKey } = generateKeysAsymm(aId);
		writeKeys.push(writeKey);
		const dataToEncrypt: { q: string, k: string, a?: string } = { q, k: readKey };
		if (pairs[i - 1]) dataToEncrypt.a = pairs[i - 1][1];
		data.push(encrypt(JSON.stringify(dataToEncrypt), writeKeys.at(-2), iv));
	});

	const finalTerm: { a: string, o?: string } = { a: pairs.at(-1)[1] };
	if (output) finalTerm.o = output;
	data.push(encrypt(JSON.stringify(finalTerm), writeKeys.at(-1), iv));

	const hunt = { d: data, k: startReadKey, i: iv, n: nStr };
	const huntJSON = JSON.stringify(hunt);

	return huntJSON;
}
