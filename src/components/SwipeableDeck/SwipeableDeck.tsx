import React from 'react';
import confetti from 'canvas-confetti';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { CORRECT_OPTION_IDS_BASE64, INITIAL_DECK } from '@/data/initialDeck';
import { UI_TEXT } from '@/data/uiText';
import type { CardSide, SwipeDirection } from '@/types/cards';

import BackgroundDeck from '@/components/SwipeableDeck/BackgroundDeck';
import FlippableCard from '@/components/SwipeableDeck/FlippableCard';
import {
    APPEAR_ANIMATION_DURATION,
    CARD_RETURN_SPRING,
    DECK_OFFSET,
    DECK_SCALE,
    DISAPPEAR_ANIMATION_DURATION,
    FLIP_ANIMATION_DURATION,
    SIDE_OPPONENT,
} from '@/components/SwipeableDeck/constants';
import {
    buildChosenText,
    createParamsMap,
    getDirection,
    getSwipeExit,
    randomCardParams,
} from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

interface CompletedChoice {
    cardId: string;
    direction: SwipeDirection;
    optionId: string;
}

type FinalStatus = 'idle' | 'checking' | 'success' | 'error';

interface CompletedSegment {
    optionId: string;
    text: string;
}

const CHECKING_DELAY_MS = 3000;
const CONFETTI_BURST_DELAYS = [0, 650, 1300] as const;

const encodeOptionIds = (optionIds: readonly string[]): string => window.btoa(optionIds.join('|'));

const decodeOptionIds = (encodedOptionIds: string): string[] => {
    const decoded = window.atob(encodedOptionIds);

    return decoded ? decoded.split('|') : [];
};

const getDirectionByOptionId = (cardId: string, optionId: string): SwipeDirection => {
    const card = INITIAL_DECK.find((deckCard) => deckCard.id === cardId);

    if (!card) {
        throw new Error(`Card ${cardId} not found`);
    }

    const direction = (Object.entries(card.optionIds).find(([, value]) => value === optionId)?.[0] ??
        null) as SwipeDirection | null;

    if (!direction) {
        throw new Error(`Option ${optionId} not found for card ${cardId}`);
    }

    return direction;
};

const createCompletedChoices = (optionIds: readonly string[]): CompletedChoice[] =>
    optionIds.map((optionId) => {
        const [cardId] = optionId.split('.');
        const direction = getDirectionByOptionId(cardId, optionId);

        return {
            cardId,
            direction,
            optionId,
        };
    });

const getBubuPreset = (): { deck: typeof INITIAL_DECK; completedChoices: CompletedChoice[] } | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const bubu = new URLSearchParams(window.location.search).get('bubu');

    if (bubu === 'true') {
        const correctOptionIds = decodeOptionIds(CORRECT_OPTION_IDS_BASE64);

        return {
            deck: [],
            completedChoices: createCompletedChoices(correctOptionIds),
        };
    }

    if (bubu === 'false') {
        const correctOptionIds = decodeOptionIds(CORRECT_OPTION_IDS_BASE64);

        return {
            deck: [],
            completedChoices: createCompletedChoices([...correctOptionIds.slice(0, -1), '8.4']),
        };
    }

    return null;
};

function SwipeableDeck() {
    const bubuPreset = React.useMemo(() => getBubuPreset(), []);
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));
    const [deck, setDeck] = React.useState(() => bubuPreset?.deck ?? INITIAL_DECK);
    const [completedChoices, setCompletedChoices] = React.useState<CompletedChoice[]>(
        () => bubuPreset?.completedChoices ?? []
    );
    const [currentSide, setCurrentSide] = React.useState<CardSide>(
        () => paramsRef.current[INITIAL_DECK[0]?.id]?.cardSide ?? 'front'
    );
    const [revealedDirection, setRevealedDirection] = React.useState<SwipeDirection | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const [finalStatus, setFinalStatus] = React.useState<FinalStatus>('idle');
    const cardsById = React.useMemo(() => Object.fromEntries(INITIAL_DECK.map((card) => [card.id, card])), []);
    const checkingTimeoutRef = React.useRef<number | null>(null);

    const currentCard = deck[0] ?? null;
    const backgroundCards = React.useMemo(() => deck.slice(1, 5), [deck]);
    const currentCardId = currentCard?.id ?? null;
    const correctOptionIds = React.useMemo(() => decodeOptionIds(CORRECT_OPTION_IDS_BASE64), []);
    const completedSegmentsBySide = React.useMemo<Record<CardSide, CompletedSegment[]>>(
        () => ({
            front: completedChoices
                .map((choice) => {
                    const card = cardsById[choice.cardId];
                    return card
                        ? {
                              optionId: choice.optionId,
                              text: buildChosenText(card, choice.direction, 'front'),
                          }
                        : null;
                })
                .filter((segment): segment is CompletedSegment => Boolean(segment?.text)),
            back: completedChoices
                .map((choice) => {
                    const card = cardsById[choice.cardId];
                    return card
                        ? {
                              optionId: choice.optionId,
                              text: buildChosenText(card, choice.direction, 'back'),
                          }
                        : null;
                })
                .filter((segment): segment is CompletedSegment => Boolean(segment?.text)),
        }),
        [cardsById, completedChoices]
    );
    const completedSegments = completedSegmentsBySide[currentSide];
    const chosenTextBySide = React.useMemo<Record<CardSide, string>>(
        () => ({
            front: completedSegmentsBySide.front.map((segment) => segment.text).join(' '),
            back: completedSegmentsBySide.back.map((segment) => segment.text).join(' '),
        }),
        [completedSegmentsBySide]
    );
    const completedOptionIdsBase64 = React.useMemo(
        () => encodeOptionIds(completedChoices.map((choice) => choice.optionId)),
        [completedChoices]
    );
    const isCorrectResult = React.useMemo(
        () => completedOptionIdsBase64 === CORRECT_OPTION_IDS_BASE64,
        [completedOptionIdsBase64]
    );
    const incorrectIndices = React.useMemo(
        () =>
            completedSegments.reduce<number[]>((indices, segment, index) => {
                if (segment.optionId !== correctOptionIds[index]) {
                    indices.push(index);
                }

                return indices;
            }, []),
        [completedSegments, correctOptionIds]
    );
    const shouldHideLastSegment = React.useMemo(() => {
        const lastIndex = completedSegments.length - 1;

        if (lastIndex < 0) {
            return false;
        }

        return incorrectIndices.some((incorrectIndex) => incorrectIndex < lastIndex);
    }, [completedSegments.length, incorrectIndices]);
    const visibleCompletedSegments = React.useMemo(
        () => (shouldHideLastSegment ? completedSegments.slice(0, -1) : completedSegments),
        [completedSegments, shouldHideLastSegment]
    );
    const uiText = UI_TEXT[currentSide];

    const cardX = useMotionValue(0);
    const cardY = useMotionValue(0);
    const cardOffset = useMotionValue(DECK_OFFSET);
    const cardScale = useMotionValue(DECK_SCALE);
    const cardOpacity = useMotionValue(1);
    const cardBaseRotate = useMotionValue(currentCardId ? (paramsRef.current[currentCardId]?.rotationDeg ?? 0) : 0);
    const mainCardRotate = useTransform(() => cardBaseRotate.get() + cardX.get() / 30);
    const dragOffsetRef = React.useRef({ x: 0, y: 0 });
    const dragDirectionRef = React.useRef<SwipeDirection | null>(null);

    React.useEffect(() => {
        return () => {
            if (checkingTimeoutRef.current !== null) {
                window.clearTimeout(checkingTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (finalStatus !== 'success') {
            return undefined;
        }

        const rand = (min: number, max: number) => Math.random() * (max - min) + min;
        const jitter = () => (Math.random() - 0.5) * 0.03;
        const particleCount = 28;
        const centerX = 0.5;
        const centerY = 0.42;
        const defaults = {
            startVelocity: 34,
            ticks: 96,
            scalar: 2.85,
            zIndex: 2200,
            disableForReducedMotion: true,
        };
        const timeouts = CONFETTI_BURST_DELAYS.map((delay) =>
            window.setTimeout(() => {
                void confetti({
                    ...defaults,
                    particleCount,
                    spread: rand(60, 85),
                    angle: rand(30, 70),
                    origin: {
                        x: Math.max(0, centerX - 0.25 + jitter()),
                        y: Math.max(0, centerY + jitter()),
                    },
                });

                void confetti({
                    ...defaults,
                    particleCount,
                    spread: rand(60, 85),
                    angle: rand(110, 150),
                    origin: {
                        x: Math.min(1, centerX + 0.25 + jitter()),
                        y: Math.max(0, centerY + jitter()),
                    },
                });
            }, delay)
        );

        return () => {
            timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
        };
    }, [finalStatus]);

    React.useEffect(() => {
        for (const card of deck) {
            if (!paramsRef.current[card.id]) {
                paramsRef.current[card.id] = randomCardParams();
            }
        }

        const existing = new Set(deck.map((card) => card.id));

        for (const key of Object.keys(paramsRef.current)) {
            if (!existing.has(key)) {
                delete paramsRef.current[key];
            }
        }
    }, [deck]);

    React.useLayoutEffect(() => {
        if (!currentCardId) {
            return undefined;
        }

        const params = paramsRef.current[currentCardId];

        if (!params) {
            return undefined;
        }

        setRevealedDirection(null);
        dragOffsetRef.current = { x: 0, y: 0 };
        dragDirectionRef.current = null;

        cardX.set(0);
        cardY.set(0);
        cardOffset.set(DECK_OFFSET);
        cardScale.set(DECK_SCALE);
        cardBaseRotate.set(params.rotationDeg);
        cardOpacity.set(1);
        setCurrentSide(params.cardSide);

        const appearanceOptions = {
            duration: APPEAR_ANIMATION_DURATION / 1000,
            ease: [0.18, 0.89, 0.32, 1.28] as [number, number, number, number],
        };

        let rotateAnimation: ReturnType<typeof animate> | null = null;
        let scaleAnimation: ReturnType<typeof animate> | null = null;
        let offsetAnimation: ReturnType<typeof animate> | null = null;
        const frameId = window.requestAnimationFrame(() => {
            rotateAnimation = animate(cardBaseRotate, 0, appearanceOptions);
            scaleAnimation = animate(cardScale, 1, appearanceOptions);
            offsetAnimation = animate(cardOffset, 0, appearanceOptions);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            rotateAnimation?.stop();
            scaleAnimation?.stop();
            offsetAnimation?.stop();
        };
    }, [cardBaseRotate, cardOffset, cardOpacity, cardScale, cardX, cardY, currentCardId]);

    const handleSwipeComplete = React.useCallback(
        (direction: SwipeDirection) => {
            if (!currentCard) {
                return;
            }

            const nextCard = deck[1];

            if (nextCard) {
                const nextParams = paramsRef.current[nextCard.id];

                if (nextParams) {
                    setCurrentSide(nextParams.cardSide);
                }
            }

            setCompletedChoices((previousChoices) => [
                ...previousChoices,
                {
                    cardId: currentCard.id,
                    direction,
                    optionId: currentCard.optionIds[direction],
                },
            ]);
            setDeck(deck.slice(1));
        },
        [currentCard, deck]
    );

    const handleDrag = React.useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (isAnimatingOut) {
                return;
            }

            const x = info.offset.x;
            const y = info.offset.y;
            const direction = getDirection(x, y);

            dragOffsetRef.current = { x, y };

            if (dragDirectionRef.current !== direction) {
                dragDirectionRef.current = direction;
                setRevealedDirection(direction);
            }
        },
        [isAnimatingOut]
    );

    const handleDragEnd = React.useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (!currentCard) {
                return;
            }

            if (isAnimatingOut) {
                return;
            }

            const direction = getDirection(info.offset.x, info.offset.y);

            if (!direction) {
                dragOffsetRef.current = { x: 0, y: 0 };
                dragDirectionRef.current = null;
                setRevealedDirection(null);
                animate(cardX, 0, {
                    ...CARD_RETURN_SPRING,
                });
                animate(cardY, 0, {
                    ...CARD_RETURN_SPRING,
                });
                return;
            }

            const exit = getSwipeExit(direction);

            setIsAnimatingOut(true);
            dragOffsetRef.current = { x: 0, y: 0 };
            dragDirectionRef.current = direction;
            const opacityAnimation = animate(cardOpacity, 0, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });
            const xAnimation = animate(cardX, exit.x, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });
            const yAnimation = animate(cardY, exit.y, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });

            void Promise.all([xAnimation, yAnimation, opacityAnimation]).then(() => {
                cardX.set(0);
                cardY.set(0);
                cardOpacity.set(0);
                setRevealedDirection(null);
                handleSwipeComplete(direction);
                window.requestAnimationFrame(() => {
                    setIsAnimatingOut(false);
                });
            });
        },
        [cardOpacity, cardX, cardY, currentCard, handleSwipeComplete, isAnimatingOut]
    );

    const handleCheckResult = React.useCallback(() => {
        if (finalStatus === 'error') {
            window.location.reload();
            return;
        }

        if (finalStatus !== 'idle') {
            return;
        }

        setFinalStatus('checking');
        checkingTimeoutRef.current = window.setTimeout(() => {
            setFinalStatus(isCorrectResult ? 'success' : 'error');
            checkingTimeoutRef.current = null;
        }, CHECKING_DELAY_MS);
    }, [finalStatus, isCorrectResult]);

    if (!currentCard) {
        return (
            <div className={styles.screen}>
                <motion.div
                    className={[
                        styles.finishedSummary,
                        finalStatus === 'error' ? styles.finishedSummaryError : '',
                        finalStatus === 'success' ? styles.finishedSummarySuccessBuzz : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: [0.18, 0.89, 0.32, 1.15] }}
                >
                    <div className={styles.finishedSummaryText}>
                        {visibleCompletedSegments.length ? (
                            visibleCompletedSegments.map((segment, index) => {
                                const isIncorrect = finalStatus === 'error' && incorrectIndices.includes(index);

                                return (
                                    <React.Fragment key={`${segment.optionId}:${index}`}>
                                        {index > 0 ? ' ' : null}
                                        <span className={isIncorrect ? styles.incorrectSegment : undefined}>
                                            {segment.text}
                                        </span>
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <span>{uiText.emptyResult}</span>
                        )}
                    </div>

                    <button
                        className={styles.resultButton}
                        type="button"
                        onClick={handleCheckResult}
                        disabled={finalStatus === 'checking' || finalStatus === 'success'}
                    >
                        {finalStatus === 'error' ? uiText.retry : uiText.check}
                    </button>

                    {finalStatus === 'checking' ? (
                        <div className={styles.checkingState}>
                            <span className={styles.loader} aria-hidden="true" />
                            <span className={styles.checkingText}>{uiText.checking}</span>
                        </div>
                    ) : null}

                    {finalStatus === 'success' ? <div className={styles.successText}>{uiText.success}</div> : null}

                    {finalStatus === 'error' ? (
                        <div className={styles.errorText}>
                            <div>{uiText.error1}</div>
                            <div>{uiText.error2}</div>
                        </div>
                    ) : null}
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.screen}>
            <div className={styles.deckLayout}>
                <div className={styles.summaryPanel}>
                    <motion.div
                        className={styles.summaryTextLayer}
                        animate={{ opacity: currentSide === 'front' ? 1 : 0 }}
                        transition={{
                            duration: FLIP_ANIMATION_DURATION / 1000,
                            ease: [0.455, 0.03, 0.515, 0.955],
                        }}
                    >
                        <div className={styles.summaryText}>{chosenTextBySide.front || '\u00A0'}</div>
                    </motion.div>

                    <motion.div
                        className={styles.summaryTextLayer}
                        animate={{ opacity: currentSide === 'back' ? 1 : 0 }}
                        transition={{
                            duration: FLIP_ANIMATION_DURATION / 1000,
                            ease: [0.455, 0.03, 0.515, 0.955],
                        }}
                    >
                        <div className={styles.summaryText}>{chosenTextBySide.back || '\u00A0'}</div>
                    </motion.div>
                </div>

                <div className={styles.stage}>
                    <BackgroundDeck cards={backgroundCards} deckLength={deck.length} paramsMap={paramsRef.current} />

                    <motion.div
                        className={styles.cardWrapper}
                        style={{
                            zIndex: deck.length,
                            cursor: isAnimatingOut ? 'default' : 'grab',
                            pointerEvents: isAnimatingOut ? 'none' : 'auto',
                            x: cardX,
                            y: cardY,
                        }}
                        drag={!isAnimatingOut}
                        dragElastic={0.08}
                        dragMomentum={false}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                    >
                        <motion.div
                            className={styles.card3dShell}
                            style={{
                                y: cardOffset,
                                scale: cardScale,
                                rotate: mainCardRotate,
                                opacity: cardOpacity,
                            }}
                            onTap={() => {
                                if (isAnimatingOut) {
                                    return;
                                }

                                setCurrentSide((previousSide) => SIDE_OPPONENT[previousSide]);
                            }}
                        >
                            <FlippableCard
                                card={currentCard}
                                side={currentSide}
                                revealedDirection={revealedDirection}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default SwipeableDeck;
