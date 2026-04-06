import React, { type CSSProperties } from 'react';

import type { CardData, CardSide, SwipeDirection } from '@/types/cards';
import { normalizeSpaces } from '@/utils/cardText';

import { CARD_TEXT_START_OFFSET_PERCENT } from '@/components/SwipeableDeck/constants';
import { getCardTranslation } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/CardFace.module.less';

interface CardFaceProps {
    card: CardData;
    tone: CardSide;
    revealedDirection?: SwipeDirection | null;
}

interface AutoSizedTextBlockProps {
    text: string;
    textsToFit: readonly string[];
    className?: string;
    maxFontSize: number;
    minFontSize: number;
    reserveMaxHeight?: boolean;
}

interface TextMeasurement {
    fontSize: number;
    lines: 1 | 2;
    reservedHeight: number;
}

interface MeasurementsState {
    maxReservedHeight: number | null;
    byText: Record<string, TextMeasurement>;
}

function AutoSizedTextBlock({
    text,
    textsToFit,
    className = '',
    maxFontSize,
    minFontSize,
    reserveMaxHeight = false,
}: AutoSizedTextBlockProps) {
    const normalizedText = React.useMemo(() => normalizeSpaces(text), [text]);
    const normalizedTextsToFit = React.useMemo(() => textsToFit.map((item) => normalizeSpaces(item)), [textsToFit]);
    const normalizedTextsSignature = React.useMemo(() => normalizedTextsToFit.join('\u241f'), [normalizedTextsToFit]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const measureRootRef = React.useRef<HTMLDivElement>(null);
    const textRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const textInnerRefs = React.useRef<Array<HTMLSpanElement | null>>([]);
    const [measurementsState, setMeasurementsState] = React.useState<MeasurementsState>({
        maxReservedHeight: null,
        byText: {},
    });
    const [isMeasured, setIsMeasured] = React.useState(false);

    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const measureRoot = measureRootRef.current;

        if (!container || !measureRoot) {
            return undefined;
        }

        textRefs.current.length = normalizedTextsToFit.length;
        textInnerRefs.current.length = normalizedTextsToFit.length;

        const getLineHeight = (item: HTMLDivElement) => {
            const computedLineHeight = Number.parseFloat(window.getComputedStyle(item).lineHeight);
            return Number.isFinite(computedLineHeight) ? computedLineHeight : maxFontSize;
        };

        const measureText = (item: HTMLDivElement, itemInner: HTMLSpanElement) => {
            let lineHeight = getLineHeight(item);
            let bestMeasurement: TextMeasurement = {
                fontSize: minFontSize,
                lines: 2,
                reservedHeight: lineHeight * 2,
            };

            for (let candidateFontSize = maxFontSize; candidateFontSize >= minFontSize; candidateFontSize -= 1) {
                item.style.fontSize = `${candidateFontSize}px`;
                lineHeight = getLineHeight(item);
                const itemHeight = Math.max(itemInner.offsetHeight, itemInner.scrollHeight);
                const itemWidth = Math.max(itemInner.offsetWidth, itemInner.scrollWidth);
                const estimatedLines = Math.max(1, Math.round(itemHeight / lineHeight)) as 1 | 2 | 3;
                const lines = estimatedLines <= 1 ? 1 : 2;
                const fits = estimatedLines <= 2 && itemWidth <= item.clientWidth + 0.5;

                if (fits) {
                    bestMeasurement = {
                        fontSize: candidateFontSize,
                        lines,
                        reservedHeight: lineHeight * lines,
                    };
                    break;
                }
            }

            item.style.fontSize = `${bestMeasurement.fontSize}px`;

            return bestMeasurement;
        };

        const updateFontSize = () => {
            const containerWidth = container.clientWidth;

            if (!containerWidth) {
                return;
            }

            measureRoot.style.width = `${containerWidth}px`;
            const measurements = normalizedTextsToFit.reduce((map, item, index) => {
                const element = textRefs.current[index];
                const elementInner = textInnerRefs.current[index];

                if (!element || !elementInner) {
                    return map;
                }

                map.set(item, measureText(element, elementInner));

                return map;
            }, new Map<string, TextMeasurement>());
            const fallbackReservedHeight = getLineHeight(measureRoot);
            const byText = Object.fromEntries(measurements.entries());
            const maxReservedHeight = measurements.size
                ? Math.max(...[...measurements.values()].map((measurement) => measurement.reservedHeight))
                : fallbackReservedHeight;

            setMeasurementsState((previousState) => {
                const nextState = {
                    byText,
                    maxReservedHeight,
                };

                if (
                    previousState.maxReservedHeight === nextState.maxReservedHeight &&
                    JSON.stringify(previousState.byText) === JSON.stringify(nextState.byText)
                ) {
                    return previousState;
                }

                return nextState;
            });
            setIsMeasured(true);
        };

        updateFontSize();
        return undefined;
    }, [maxFontSize, minFontSize, normalizedTextsSignature, normalizedTextsToFit]);

    const currentMeasurement = measurementsState.byText[normalizedText] ?? {
        fontSize: maxFontSize,
        lines: 1 as const,
        reservedHeight: measurementsState.maxReservedHeight ?? maxFontSize,
    };
    const reservedHeight = reserveMaxHeight
        ? (measurementsState.maxReservedHeight ?? currentMeasurement.reservedHeight)
        : currentMeasurement.reservedHeight;

    const style = {
        '--reserved-height': reservedHeight ? `${reservedHeight}px` : undefined,
        fontSize: `${currentMeasurement.fontSize}px`,
        visibility: isMeasured ? 'visible' : 'hidden',
    } as CSSProperties;

    return (
        <div ref={containerRef} className={styles.autoSizedTextBlock}>
            <div
                className={[styles.phraseTextBase, styles.phraseText, className].filter(Boolean).join(' ')}
                style={style}
            >
                <span className={styles.phraseTextInner}>{normalizedText}</span>
            </div>

            <div
                ref={measureRootRef}
                className={[styles.phraseTextBase, styles.textMeasureRoot].filter(Boolean).join(' ')}
                aria-hidden="true"
            >
                {normalizedTextsToFit.map((item, index) => (
                    <div
                        key={`${item}:${index}`}
                        ref={(element) => {
                            textRefs.current[index] = element;
                        }}
                        className={styles.textMeasureItem}
                    >
                        <span
                            ref={(element) => {
                                textInnerRefs.current[index] = element;
                            }}
                            className={styles.textMeasureItemInner}
                        >
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CardFace({ card, tone, revealedDirection = null }: CardFaceProps) {
    const content = getCardTranslation(card, tone);
    const className = [styles.side, tone === 'front' ? styles.frontSide : styles.backSide].join(' ');
    const hiddenWord = revealedDirection ? content.options[revealedDirection] : '…';
    const phraseStart = content.phraseStart ?? null;
    const phraseEnd = content.phraseEnd ?? null;
    const phraseStartValues = React.useMemo(() => (phraseStart ? [phraseStart] : []), [phraseStart]);
    const phraseEndValues = React.useMemo(() => (phraseEnd ? [phraseEnd] : []), [phraseEnd]);
    const optionValues = React.useMemo(
        () => [content.options.left, content.options.right, content.options.up, content.options.down] as const,
        [content.options.down, content.options.left, content.options.right, content.options.up]
    );
    const contentStyle = {
        '--card-text-start-offset': `${CARD_TEXT_START_OFFSET_PERCENT}%`,
    } as CSSProperties;

    return (
        <div className={className}>
            <div className={styles.content} style={contentStyle}>
                <div className={styles.topOffset} aria-hidden="true" />
                <div className={styles.phraseLayout}>
                    {phraseStart ? (
                        <div className={styles.segment}>
                            <AutoSizedTextBlock
                                text={phraseStart}
                                textsToFit={phraseStartValues}
                                maxFontSize={36}
                                minFontSize={20}
                            />
                        </div>
                    ) : null}

                    <div className={`${styles.segment} ${styles.centerBlock}`}>
                        <AutoSizedTextBlock
                            text={hiddenWord}
                            textsToFit={optionValues}
                            className={styles.variantWord}
                            maxFontSize={36}
                            minFontSize={20}
                            reserveMaxHeight
                        />
                        <div className={styles.posText}>({content.pos})</div>
                    </div>

                    {phraseEnd ? (
                        <div className={styles.segment}>
                            <AutoSizedTextBlock
                                text={phraseEnd}
                                textsToFit={phraseEndValues}
                                maxFontSize={36}
                                minFontSize={20}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CardFace;
