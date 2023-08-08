const { expect } = require('chai');

const { Utils: {
	encrypt,
	encryptSym,
	encryptAsymm,
	decrypt,
	decryptSym,
	decryptAsymm,
	generateIv,
	generateKeySym,
	generateKeysAsymm
}, createServer, createClient } = require('index');


let huntJSON;

describe('Utils', function () {
	this.timeout(5_000);

	it('should be able to generate an iv', () => {
		const iv = generateIv();
		expect(iv).to.be.a('string');
	});
	it('should be able to generate a symmetric key', () => {
		const key = generateKeySym();
		expect(key).to.be.a('string');
	});
	it('should be able to perform symmetric encryption and decryption', () => {
		const iv = generateIv();
		const key = generateKeySym();
		const textToEncrypt = 'test string';
		expect(decryptSym(encryptSym(textToEncrypt, key, iv), key, iv)).to.equal(textToEncrypt);
	});

	it('should be able to generate asymmetric keys', () => {
		const { readKey, writeKey } = generateKeysAsymm('passphrase');
		expect(readKey).to.be.a('string');
		expect(writeKey).to.be.a('string');
	});
	it('should be able to perform asymmetric encryption and decryption', () => {
		const { readKey, writeKey } = generateKeysAsymm('passphrase');
		const textToEncrypt = 'test string';
		expect(decryptAsymm(encryptAsymm(textToEncrypt, writeKey), readKey, 'passphrase')).to.equal(textToEncrypt);
	});

	it('should be able to perform the custom encryption and decryption', () => {
		const iv = generateIv();
		const { readKey, writeKey } = generateKeysAsymm('passphrase');
		const textToEncrypt = 'test string';
		expect(decrypt(encrypt(textToEncrypt, writeKey, iv), readKey, 'passphrase', iv)).to.equal(textToEncrypt);
	});
});

describe('Server', function () {
	this.timeout(10_000);
	const hunt = [['Question 1', 'Answer 1'], ['Question 2', 'Answer 2'], ['Question 3', 'Answer 3']];

	it('should be able to generate the string', () => {
		huntJSON = createServer(hunt, 'secret_token');
		expect(huntJSON).to.be.a('string');
	});
});

describe('Client', () => {
	let Hunt;
	function log (...args) {
		return console.log('      ', ...args);
	}

	it('should be able to instantiate the client', () => {
		Hunt = createClient(huntJSON);
		log('Question:', Hunt.questions[0]);
	});
	it('should have the right length', () => {
		expect(Hunt.length).to.equal(3);
	});
	it('should not have the success token yet', () => {
		expect(Hunt.success).to.equal(undefined);
	});

	it('should handle incorrect guesses', () => {
		expect(Hunt.guess('Answer 2')).to.equal(false);
	});
	it('should handle correct guesses', () => {
		expect(Hunt.guess('Answer 1')).to.equal(true);
		log('Question:', Hunt.questions[1]);
		log('Answer:', Hunt.answers[0]);
	});
	it('should handle non-normalized guesses', () => {
		expect(Hunt.guess('answer 2!')).to.equal(true);
		log('Answer:', Hunt.answers[1]);
		log('Question:', Hunt.questions[2]);
	});
	it('should resolve the hunt ending correctly', () => {
		expect(Hunt.guess('Answer 3')).to.equal(true);
		log('Answer:', Hunt.answers[2]);
	});
	it('should block guesses after the hunt ends', () => {
		try {
			Hunt.guess('Answer... 4?');
		} catch {
			return;
		}
		throw new Error('Hunt was not blocked');
	});
	it('should record the success token', () => {
		expect(Hunt.success).to.equal('secret_token');
	});
});
