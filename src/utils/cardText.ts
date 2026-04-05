const spacesRegExp = /\s+/g;
export const splitWordsRegExp = /(?<=-)| +/g;

const makeNBSPRegExp = /(?<=(^|\s)\S{1,3})\s+(?=\S+)/g;
const removeLongNBSPRegExp = /\u00a0(?=(<[^>]+>)?\S{10,}(<\/[^>]+>)?(\s|\u00a0|$))/g;

export const makeNBSP = (text: string) => text.replace(makeNBSPRegExp, '\u00a0');

export const removeLongNBSP = (text: string) => text.replace(removeLongNBSPRegExp, ' ');

export const normalizeSpaces = (text: string, ignoreLongWords = false) => {
    const textWithNBSP = makeNBSP(text.replace(spacesRegExp, ' ').trim());
    return ignoreLongWords ? removeLongNBSP(textWithNBSP) : textWithNBSP;
};

export const estimateLinesCount = (normalizedText: string) => {
    if (!normalizedText) {
        return 1;
    }

    const words = normalizedText.split(splitWordsRegExp).filter(Boolean);
    const maxWordLength = words.reduce((max, word) => Math.max(max, word.length), 0);
    const numberOfWords = words.length;
    const numberOfChars = normalizedText.length - (words.length - 1);

    if (numberOfWords === 1 && maxWordLength <= 22) {
        return 1;
    }

    if ((numberOfWords === 1 && maxWordLength <= 30) || (numberOfChars <= 32 && numberOfWords <= 3)) {
        return 2;
    }

    return 3;
};

const joinWords = (words: string[]) =>
    words.reduce((result, word, index) => {
        if (index === 0) {
            return word;
        }

        return result.endsWith('-') ? `${result}${word}` : `${result} ${word}`;
    }, '');

export const splitTextToLines = (normalizedText: string, linesCount = estimateLinesCount(normalizedText)) => {
    const words = normalizedText.split(splitWordsRegExp).filter(Boolean);

    if (!words.length) {
        return [''];
    }

    if (linesCount <= 1 || words.length === 1) {
        return [normalizedText];
    }

    const lines: string[] = [];
    let startIndex = 0;

    while (lines.length < linesCount - 1 && startIndex < words.length) {
        const remainingLines = linesCount - lines.length;
        const maxEndIndex = words.length - (remainingLines - 1);
        const remainingTextLength = joinWords(words.slice(startIndex)).length;
        const targetLength = remainingTextLength / remainingLines;

        let bestEndIndex = startIndex + 1;
        let bestDiff = Number.POSITIVE_INFINITY;

        for (let endIndex = startIndex + 1; endIndex <= maxEndIndex; endIndex += 1) {
            const lineText = joinWords(words.slice(startIndex, endIndex));
            const diff = Math.abs(lineText.length - targetLength);

            if (diff <= bestDiff) {
                bestDiff = diff;
                bestEndIndex = endIndex;
            }

            if (lineText.length >= targetLength && diff > bestDiff) {
                break;
            }
        }

        lines.push(joinWords(words.slice(startIndex, bestEndIndex)));
        startIndex = bestEndIndex;
    }

    lines.push(joinWords(words.slice(startIndex)));

    return lines.filter(Boolean);
};
