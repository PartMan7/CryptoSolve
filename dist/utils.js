"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.decryptSym = exports.encryptSym = exports.decryptAsymm = exports.encryptAsymm = exports.generateKeySym = exports.generateKeysAsymm = exports.generateIv = exports.getNormalizer = void 0;
const crypto = require("node:crypto");
function getNormalizer(type) {
    switch (type) {
        case 'id': return (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        case 'trim': return (str) => str.trim();
        case 'alphanumeric': return (str) => str.replace(/[^a-zA-Z0-9]/g, '');
        case 'custom': return null;
        default: throw new Error('Missing normalizer');
    }
}
exports.getNormalizer = getNormalizer;
function generateIv() {
    return crypto.randomBytes(16).toString('base64');
}
exports.generateIv = generateIv;
function generateKeysAsymm(passphrase) {
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
exports.generateKeysAsymm = generateKeysAsymm;
function generateKeySym() {
    return crypto.randomBytes(32).toString('base64');
}
exports.generateKeySym = generateKeySym;
function encryptAsymm(string, key) {
    const buffer = Buffer.from(string);
    return crypto.publicEncrypt(key, buffer).toString('base64');
}
exports.encryptAsymm = encryptAsymm;
function decryptAsymm(string, key, passphrase) {
    const buffer = Buffer.from(string, 'base64');
    return crypto.privateDecrypt({ key, passphrase }, buffer).toString('utf8');
}
exports.decryptAsymm = decryptAsymm;
function encryptSym(string, key, iv) {
    const bufKey = Buffer.from(key, 'base64');
    const bufIv = Buffer.from(iv, 'base64');
    const cipher = crypto.createCipheriv('aes-256-cbc', bufKey, bufIv);
    return Buffer.concat([cipher.update(string), cipher.final()]).toString('base64');
}
exports.encryptSym = encryptSym;
function decryptSym(string, key, iv) {
    const buffer = Buffer.from(string, 'base64');
    const bufKey = Buffer.from(key, 'base64');
    const bufIv = Buffer.from(iv, 'base64');
    const cipher = crypto.createDecipheriv('aes-256-cbc', bufKey, bufIv);
    return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('utf8');
}
exports.decryptSym = decryptSym;
function encrypt(text, keyAsymm, iv) {
    const keySym = generateKeySym();
    const encryptedSym = encryptSym(text, keySym, iv);
    return JSON.stringify({ content: encryptedSym, key: encryptAsymm(keySym, keyAsymm) });
}
exports.encrypt = encrypt;
function decrypt(text, keyAsymm, passphrase, iv) {
    const { key: encryptedKeySym, content: encryptedSym } = JSON.parse(text);
    const keySym = decryptAsymm(encryptedKeySym, keyAsymm, passphrase);
    return decryptSym(encryptedSym, keySym, iv);
}
exports.decrypt = decrypt;
