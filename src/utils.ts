import * as crypto from 'node:crypto';


export type NormalizerStrType = 'id' | 'trim' | 'alphanumeric' | 'custom';

export function getNormalizer (type: NormalizerStrType) {
	switch (type) {
		case 'id': return (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
		case 'trim': return (str: string) => str.trim();
		case 'alphanumeric': return (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');
		case 'custom': return null;
		default: throw new Error('Missing normalizer');
	}
}


export function generateIv () {
	return crypto.randomBytes(16).toString('base64');
}

export function generateKeysAsymm (passphrase: string) {
	const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: { type: 'spki', format: 'pem' },
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem',
			cipher: 'aes-256-cbc',
			passphrase
		}
	});
	return { readKey: privateKey, writeKey: publicKey };
}

export function generateKeySym () {
	return crypto.randomBytes(32).toString('base64');
}



export function encryptAsymm (string: string, key: string) {
	const buffer = Buffer.from(string);
	return crypto.publicEncrypt(key, buffer).toString('base64');
}

export function decryptAsymm (string: string, key: string, passphrase: string) {
	const buffer = Buffer.from(string, 'base64');
	return crypto.privateDecrypt({ key, passphrase }, buffer).toString('utf8');
}


export function encryptSym (string: string, key: string, iv: string) {
	const bufKey = Buffer.from(key, 'base64');
	const bufIv = Buffer.from(iv, 'base64');
	const cipher = crypto.createCipheriv('aes-256-cbc', bufKey, bufIv);
	return Buffer.concat([cipher.update(string), cipher.final()]).toString('base64');
}

export function decryptSym (string: string, key: string, iv: string) {
	const buffer = Buffer.from(string, 'base64');
	const bufKey = Buffer.from(key, 'base64');
	const bufIv = Buffer.from(iv, 'base64');
	const cipher = crypto.createDecipheriv('aes-256-cbc', bufKey, bufIv);
	return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('utf8');
}


export function encrypt (text: string, keyAsymm: string, iv: string) {
	const keySym = generateKeySym();
	const encryptedSym = encryptSym(text, keySym, iv);
	return JSON.stringify({ content: encryptedSym, key: encryptAsymm(keySym, keyAsymm) });
}

export function decrypt (text: string, keyAsymm: string, passphrase: string, iv: string) {
	const { key: encryptedKeySym, content: encryptedSym } = JSON.parse(text);
	const keySym = decryptAsymm(encryptedKeySym, keyAsymm, passphrase);
	return decryptSym(encryptedSym, keySym, iv);
}
