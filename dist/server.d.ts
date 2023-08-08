import type { NormalizerStrType as NormalizerType } from './utils';
type Normalizer = NormalizerType | ((str: string) => string);
export declare function createShareable(pairs: [string, string][], output?: string, normalize?: Normalizer): string;
export {};
