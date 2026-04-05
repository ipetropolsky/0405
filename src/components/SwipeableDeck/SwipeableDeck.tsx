import React from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { CORRECT_OPTION_IDS, INITIAL_DECK, SUCCESS_TEXT } from '@/data/initialDeck';
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
const CONFETTI_PIECES = [...Array(18).keys()];

const UI_TEXT = {
    front: {
        check: 'Проверить',
        retry: 'Вызов принят!',
        checking: 'Идёт проверка результата…',
        fallback: 'Колода закончилась.',
        error: 'Почти получилось :) Попробуй ещё, подарок ждёт!',
    },
    back: {
        check: 'Proveri',
        retry: 'Pokušaj ponovo',
        checking: 'Proveravamo rezultat…',
        fallback: 'Špil je završen.',
        error: 'Skoro dobro. Pogrešni delovi su označeni crvenom.',
    },
} as const;

function SwipeableDeck() {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [completedChoices, setCompletedChoices] = React.useState<CompletedChoice[]>([]);
    const [currentSide, setCurrentSide] = React.useState<CardSide>('front');
    const [revealedDirection, setRevealedDirection] = React.useState<SwipeDirection | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const [finalStatus, setFinalStatus] = React.useState<FinalStatus>('idle');
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));
    const cardsById = React.useMemo(() => Object.fromEntries(INITIAL_DECK.map((card) => [card.id, card])), []);
    const checkingTimeoutRef = React.useRef<number | null>(null);

    const currentCard = deck[0] ?? null;
    const backgroundCards = React.useMemo(() => deck.slice(1, 5), [deck]);
    const currentCardId = currentCard?.id ?? null;
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
    const isCorrectResult = React.useMemo(
        () =>
            completedChoices.length === CORRECT_OPTION_IDS.length &&
            completedChoices.every((choice, index) => choice.optionId === CORRECT_OPTION_IDS[index]),
        [completedChoices]
    );
    const incorrectIndices = React.useMemo(
        () =>
            completedSegments.reduce<number[]>((indices, segment, index) => {
                if (segment.optionId !== CORRECT_OPTION_IDS[index]) {
                    indices.push(index);
                }

                return indices;
            }, []),
        [completedSegments]
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
                    {finalStatus === 'success' ? (
                        <div className={styles.confettiOverlay} aria-hidden="true">
                            {[0, 1, 2].map((burstIndex) => (
                                <div
                                    key={burstIndex}
                                    className={styles.confettiBurst}
                                    style={{ animationDelay: `${burstIndex * 0.8}s` }}
                                >
                                    {CONFETTI_PIECES.map((pieceIndex) => (
                                        <span
                                            key={`${burstIndex}:${pieceIndex}`}
                                            className={styles.confettiPiece}
                                            style={
                                                {
                                                    '--confetti-x': `${(pieceIndex - 8.5) * 12}px`,
                                                    '--confetti-y': `${120 + (pieceIndex % 5) * 26}px`,
                                                    '--confetti-rotate': `${pieceIndex * 21}deg`,
                                                    '--confetti-delay': `${pieceIndex * 0.03}s`,
                                                } as React.CSSProperties
                                            }
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : null}

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
                            <span>{uiText.fallback}</span>
                        )}
                    </div>

                    {finalStatus === 'checking' ? (
                        <div className={styles.checkingState}>
                            <span className={styles.loader} aria-hidden="true" />
                            <span className={styles.checkingText}>{uiText.checking}</span>
                        </div>
                    ) : null}

                    {finalStatus === 'success' ? <div className={styles.successText}>{SUCCESS_TEXT}</div> : null}

                    {finalStatus === 'error' ? <div className={styles.errorText}>{uiText.error}</div> : null}

                    <button
                        className={styles.resultButton}
                        type="button"
                        onClick={handleCheckResult}
                        disabled={finalStatus === 'checking' || finalStatus === 'success'}
                    >
                        {finalStatus === 'error' ? uiText.retry : uiText.check}
                    </button>
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
                    <BackgroundDeck
                        cards={backgroundCards}
                        deckLength={deck.length}
                        paramsMap={paramsRef.current}
                        side={currentSide}
                    />

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
