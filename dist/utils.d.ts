export type NormalizerStrType = 'id' | 'trim' | 'alphanumeric' | 'custom';
export declare function getNormalizer(type: NormalizerStrType): (str: string) => string;
export declare function generateIv(): string;
export declare function generateKeysAsymm(passphrase: string): {
    readKey: string;
    writeKey: string;
};
export declare function generateKeySym(): string;
export declare function encryptAsymm(string: string, key: string): string;
export declare function decryptAsymm(string: string, key: string, passphrase: string): string;
export declare function encryptSym(string: string, key: string, iv: string): string;
export declare function decryptSym(string: string, key: string, iv: string): string;
export declare function encrypt(text: string, keyAsymm: string, iv: string): string;
export declare function decrypt(text: string, keyAsymm: string, passphrase: string, iv: string): string;
