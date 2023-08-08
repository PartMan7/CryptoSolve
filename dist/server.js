"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShareable = void 0;
const utils_1 = require("utils");
function createShareable(pairs, output, normalize = 'id') {
    const normalizer = typeof normalize === 'function' ? normalize : (0, utils_1.getNormalizer)(normalize);
    const nStr = typeof normalize === 'function' ? 'custom' : normalize;
    const data = [];
    const iv = (0, utils_1.generateIv)();
    const { readKey: startReadKey, writeKey: startWriteKey } = (0, utils_1.generateKeysAsymm)(normalizer('init'));
    const writeKeys = [startWriteKey];
    pairs.forEach(([q, a], i) => {
        const aId = normalizer(a);
        const { readKey, writeKey } = (0, utils_1.generateKeysAsymm)(aId);
        writeKeys.push(writeKey);
        const dataToEncrypt = { q, k: readKey };
        if (pairs[i - 1])
            dataToEncrypt.a = pairs[i - 1][1];
        data.push((0, utils_1.encrypt)(JSON.stringify(dataToEncrypt), writeKeys.at(-2), iv));
    });
    const finalTerm = { a: pairs.at(-1)[1] };
    if (output)
        finalTerm.o = output;
    data.push((0, utils_1.encrypt)(JSON.stringify(finalTerm), writeKeys.at(-1), iv));
    const hunt = { d: data, k: startReadKey, i: iv, n: nStr };
    const huntJSON = JSON.stringify(hunt);
    return huntJSON;
}
exports.createShareable = createShareable;
