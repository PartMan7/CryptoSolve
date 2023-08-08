declare class Hunt {
    questions: string[];
    answers: string[];
    length: number;
    success?: string;
    private _normalizer;
    private _iv;
    private _data;
    private _current;
    constructor(huntJSON: string, normalizeOverride?: (ans: string) => string);
    guess(ans: string): boolean;
}
export declare function createClient(huntJSON: string, normalize?: (ans: string) => string): Hunt;
export {};
