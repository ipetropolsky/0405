import type { CardData, CardSide } from '@/types/cards';
import { normalizeSpaces } from '@/utils/cardText';

import styles from '@/components/SwipeableDeck/CardFace.module.less';

interface CardFaceProps {
    card: CardData;
    tone: CardSide;
    revealedVariant?: string | null;
}

const getLongestWordLength = (value: string): number =>
    value
        .split(/\s+/)
        .filter(Boolean)
        .reduce((maxLength, word) => {
            const normalizedWord = word.replace(/[^\p{L}\p{N}-]/gu, '');
            return Math.max(maxLength, normalizedWord.length);
        }, 0);

const getPhraseSizeClassName = (value: string): string => {
    const longestWordLength = getLongestWordLength(value);

    if (longestWordLength > 12) {
        return styles.extraCompactPhraseText;
    }

    if (longestWordLength > 8) {
        return styles.compactPhraseText;
    }

    return '';
};

function CardFace({ card, tone, revealedVariant = null }: CardFaceProps) {
    const className = [styles.side, tone === 'front' ? styles.frontSide : styles.backSide].join(' ');
    const hiddenWord = revealedVariant ? normalizeSpaces(revealedVariant) : '…';
    const phraseStart = card.phraseStart ? normalizeSpaces(card.phraseStart) : null;
    const phraseEnd = card.phraseEnd ? normalizeSpaces(card.phraseEnd) : null;
    const variantSizeClassName = revealedVariant ? getPhraseSizeClassName(hiddenWord) : '';
    const phraseStartClassName = phraseStart
        ? [styles.phraseText, getPhraseSizeClassName(phraseStart)].filter(Boolean).join(' ')
        : '';
    const phraseEndClassName = phraseEnd
        ? [styles.phraseText, getPhraseSizeClassName(phraseEnd)].filter(Boolean).join(' ')
        : '';
    const variantClassName = [styles.phraseText, variantSizeClassName].filter(Boolean).join(' ');

    return (
        <div className={className}>
            <div className={styles.content}>
                <div className={styles.phraseLayout}>
                    {phraseStart ? (
                        <div className={styles.segment}>
                            <div className={phraseStartClassName}>{phraseStart}</div>
                        </div>
                    ) : null}

                    <div className={`${styles.segment} ${styles.centerBlock}`}>
                        <div className={variantClassName}>{hiddenWord}</div>
                        <div className={styles.posText}>({card.pos})</div>
                    </div>

                    {phraseEnd ? (
                        <div className={styles.segment}>
                            <div className={phraseEndClassName}>{phraseEnd}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CardFace;
