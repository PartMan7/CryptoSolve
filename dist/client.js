"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const utils_1 = require("utils");
class Hunt {
    constructor(huntJSON, normalizeOverride) {
        var _a;
        const { d: data, k: startReadKey, i: iv, n: normalizeStr } = JSON.parse(huntJSON);
        const normalizer = (_a = (0, utils_1.getNormalizer)(normalizeStr)) !== null && _a !== void 0 ? _a : normalizeOverride;
        if (!normalizer)
            throw new Error('Missing normalizer!');
        this._normalizer = normalizer;
        const firstTerm = JSON.parse((0, utils_1.decrypt)(data.shift(), startReadKey, normalizer('init'), iv));
        this.length = data.length;
        this._data = data;
        this._current = Object.assign(Object.assign({}, firstTerm), { hasK: true });
        this._iv = iv;
        this.questions = [firstTerm.q];
        this.answers = [];
    }
    guess(ans) {
        const ansId = this._normalizer(ans);
        if (!this._current.hasK)
            throw new Error('Fully solved!');
        try {
            const next = this._data[0];
            const element = JSON.parse((0, utils_1.decrypt)(next, this._current.k, ansId, this._iv));
            this._data.shift();
            this._current = Object.assign(Object.assign({}, element), { hasK: Boolean(element.k) });
            this.answers.push(this._current.a);
            if (this._current.hasK === true)
                this.questions.push(this._current.q);
            else if (this._current.o)
                this.success = this._current.o;
            return true;
        }
        catch (_a) {
            return false;
        }
    }
}
function createClient(huntJSON, normalize) {
    try {
        return new Hunt(huntJSON, normalize);
    }
    catch (_a) {
        throw new Error('Invalid input!');
    }
}
exports.createClient = createClient;
