import React from 'react';

import type { CardData, CardSide, SwipeDirection } from '@/types/cards';
import { estimateLinesCount, normalizeSpaces, splitTextToLines } from '@/utils/cardText';

import { getCardTranslation } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/CardFace.module.less';

interface CardFaceProps {
    card: CardData;
    tone: CardSide;
    revealedDirection?: SwipeDirection | null;
}

interface FittedPhraseBlockProps {
    text: string;
    maxFontSize: number;
    minFontSize: number;
    widthRatio: number;
    className?: string;
}

const getLongestLine = (lines: string[]) =>
    lines.reduce((longestLine, line) => (line.length > longestLine.length ? line : longestLine), lines[0] ?? '');

function FittedPhraseBlock({ text, maxFontSize, minFontSize, widthRatio, className = '' }: FittedPhraseBlockProps) {
    const normalizedText = React.useMemo(() => normalizeSpaces(text), [text]);
    const lines = React.useMemo(
        () => splitTextToLines(normalizedText, estimateLinesCount(normalizedText)),
        [normalizedText]
    );
    const longestLine = React.useMemo(() => getLongestLine(lines), [lines]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRef = React.useRef<HTMLSpanElement>(null);
    const [fontSize, setFontSize] = React.useState(maxFontSize);

    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;

        if (!container || !measure) {
            return undefined;
        }

        const updateFontSize = () => {
            const containerWidth = container.clientWidth;
            const measuredWidth = measure.getBoundingClientRect().width;

            if (!containerWidth || !measuredWidth) {
                setFontSize(maxFontSize);
                return;
            }

            const targetWidth = containerWidth * widthRatio;
            const nextFontSize = Math.max(
                minFontSize,
                Math.min(maxFontSize, (targetWidth / measuredWidth) * maxFontSize)
            );

            setFontSize((previousSize) => (Math.abs(previousSize - nextFontSize) < 0.5 ? previousSize : nextFontSize));
        };

        updateFontSize();

        const resizeObserver = new ResizeObserver(updateFontSize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [longestLine, maxFontSize, minFontSize, widthRatio]);

    return (
        <div ref={containerRef} className={styles.fittedTextContainer}>
            <span
                ref={measureRef}
                className={[styles.phraseText, className, styles.measureText].filter(Boolean).join(' ')}
                style={{ fontSize: `${maxFontSize}px` }}
            >
                {longestLine}
            </span>

            <div
                className={[styles.phraseText, className].filter(Boolean).join(' ')}
                style={{ fontSize: `${fontSize}px` }}
            >
                {lines.map((line, index) => (
                    <span key={`${line}:${index}`} className={styles.fittedLine}>
                        {line}
                    </span>
                ))}
            </div>
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
                            <FittedPhraseBlock text={phraseStart} maxFontSize={36} minFontSize={18} widthRatio={0.92} />
                        </div>
                    ) : null}

                    <div className={`${styles.segment} ${styles.centerBlock}`}>
                        <FittedPhraseBlock
                            text={hiddenWord}
                            maxFontSize={42}
                            minFontSize={22}
                            widthRatio={0.8}
                            className={styles.variantWord}
                        />
                        <div className={styles.posText}>({content.pos})</div>
                    </div>

                    {phraseEnd ? (
                        <div className={styles.segment}>
                            <FittedPhraseBlock text={phraseEnd} maxFontSize={36} minFontSize={18} widthRatio={0.92} />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CardFace;
