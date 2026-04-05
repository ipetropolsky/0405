import React, { type CSSProperties } from 'react';

import type { CardData, CardSide, SwipeDirection } from '@/types/cards';
import { normalizeSpaces } from '@/utils/cardText';

import { getCardTranslation } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/CardFace.module.less';

interface CardFaceProps {
    card: CardData;
    tone: CardSide;
    revealedDirection?: SwipeDirection | null;
}

interface PhraseBlockProps {
    text: string;
    className?: string;
    reservedLines?: number;
}

const phraseSplitRegExp = /(?<=-)| +/g;

const getEstimatedLinesCount = (text: string) => {
    const normalizedText = normalizeSpaces(text);

    if (!normalizedText) {
        return 1;
    }

    const parts = normalizedText.split(phraseSplitRegExp).filter(Boolean);
    const longestPartLength = parts.reduce((maxLength, part) => Math.max(maxLength, part.length), 0);
    const compactLength = normalizedText.replace(/[ \u00a0]/g, '').length;

    if (parts.length === 1 && longestPartLength <= 12) {
        return 1;
    }

    if ((parts.length === 1 && longestPartLength <= 20) || (parts.length <= 3 && compactLength <= 22)) {
        return 2;
    }

    return 3;
};

const getPhraseSizeClassName = (text: string) => {
    const parts = text.split(phraseSplitRegExp).filter(Boolean);
    const longestPartLength = parts.reduce((maxLength, part) => Math.max(maxLength, part.length), 0);

    if (longestPartLength >= 14) {
        return styles.extraCompactPhraseText;
    }

    if (longestPartLength >= 9) {
        return styles.compactPhraseText;
    }

    return '';
};

function PhraseBlock({ text, className = '', reservedLines = 1 }: PhraseBlockProps) {
    const normalizedText = React.useMemo(() => normalizeSpaces(text), [text]);
    const style = { '--reserved-lines': reservedLines } as CSSProperties;

    return (
        <div
            className={[styles.phraseText, getPhraseSizeClassName(normalizedText), className].filter(Boolean).join(' ')}
            style={style}
        >
            <span className={styles.phraseTextInner}>{normalizedText}</span>
        </div>
    );
}

function CardFace({ card, tone, revealedDirection = null }: CardFaceProps) {
    const content = getCardTranslation(card, tone);
    const className = [styles.side, tone === 'front' ? styles.frontSide : styles.backSide].join(' ');
    const hiddenWord = revealedDirection ? normalizeSpaces(content.options[revealedDirection]) : '…';
    const phraseStart = content.phraseStart ? normalizeSpaces(content.phraseStart) : null;
    const phraseEnd = content.phraseEnd ? normalizeSpaces(content.phraseEnd) : null;
    const optionValues = [
        content.options.left,
        content.options.right,
        content.options.up,
        content.options.down,
    ] as const;
    const variantReservedLines = Math.max(
        1,
        ...optionValues.map((option) => getEstimatedLinesCount(option)),
        getEstimatedLinesCount(hiddenWord)
    );

    return (
        <div className={className}>
            <div className={styles.content}>
                <div className={styles.phraseLayout}>
                    {phraseStart ? (
                        <div className={styles.segment}>
                            <PhraseBlock text={phraseStart} />
                        </div>
                    ) : null}

                    <div className={`${styles.segment} ${styles.centerBlock}`}>
                        <PhraseBlock
                            text={hiddenWord}
                            className={styles.variantWord}
                            reservedLines={variantReservedLines}
                        />
                        <div className={styles.posText}>({content.pos})</div>
                    </div>

                    {phraseEnd ? (
                        <div className={styles.segment}>
                            <PhraseBlock text={phraseEnd} />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CardFace;
