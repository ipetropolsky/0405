const spacesRegExp = /\s+/g;

const makeNBSPRegExp = /(?<=(^|\s)\S{1,3})\s+(?=\S+)/g;
const removeLongNBSPRegExp = /\u00a0(?=(<[^>]+>)?\S{10,}(<\/[^>]+>)?(\s|\u00a0|$))/g;

export const makeNBSP = (text: string) => text.replace(makeNBSPRegExp, '\u00a0');

export const removeLongNBSP = (text: string) => text.replace(removeLongNBSPRegExp, ' ');

export const normalizeSpaces = (text: string, ignoreLongWords = false) => {
    const textWithNBSP = makeNBSP(text.replace(spacesRegExp, ' ').trim());
    return ignoreLongWords ? removeLongNBSP(textWithNBSP) : textWithNBSP;
};
