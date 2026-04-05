import React from 'react';

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
}

const phraseSplitRegExp = /(?<=-)| +/g;

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

function PhraseBlock({ text, className = '' }: PhraseBlockProps) {
    const normalizedText = React.useMemo(() => normalizeSpaces(text), [text]);

    return (
        <div
            className={[styles.phraseText, getPhraseSizeClassName(normalizedText), className].filter(Boolean).join(' ')}
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
                        <PhraseBlock text={hiddenWord} className={styles.variantWord} />
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
