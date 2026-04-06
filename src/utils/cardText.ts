const spacesRegExp = /\s+/g;

const makeNBSPRegExp = /(?<=(^|\s)\S{1,3})\s+(?=\S+)/g;

export const makeNBSP = (text: string) => text.replace(makeNBSPRegExp, '\u00a0');

export const normalizeSpaces = (text: string) => makeNBSP(text.replace(spacesRegExp, ' ').trim());
