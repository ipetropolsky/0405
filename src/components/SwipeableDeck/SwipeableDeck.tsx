import React from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { INITIAL_DECK } from '@/data/initialDeck';
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
}

function SwipeableDeck() {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [completedChoices, setCompletedChoices] = React.useState<CompletedChoice[]>([]);
    const [currentSide, setCurrentSide] = React.useState<CardSide>('front');
    const [revealedDirection, setRevealedDirection] = React.useState<SwipeDirection | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));
    const cardsById = React.useMemo(() => Object.fromEntries(INITIAL_DECK.map((card) => [card.id, card])), []);

    const currentCard = deck[0] ?? null;
    const backgroundCards = React.useMemo(() => deck.slice(1, 5), [deck]);
    const currentCardId = currentCard?.id ?? null;
    const chosenText = React.useMemo(
        () =>
            completedChoices
                .map((choice) => {
                    const card = cardsById[choice.cardId];
                    return card ? buildChosenText(card, choice.direction, currentSide) : '';
                })
                .filter(Boolean)
                .join(' '),
        [cardsById, completedChoices, currentSide]
    );

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

            setCompletedChoices((previousChoices) => [...previousChoices, { cardId: currentCard.id, direction }]);
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

    if (!currentCard) {
        return (
            <div className={styles.screen}>
                <motion.div
                    className={styles.finishedSummary}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: [0.18, 0.89, 0.32, 1.15] }}
                >
                    <div className={styles.finishedSummaryText}>
                        {chosenText || (currentSide === 'front' ? 'Колода закончилась.' : 'Špil je završen.')}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.screen}>
            <div className={styles.deckLayout}>
                <div className={styles.summaryPanel}>
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={currentSide}
                            className={styles.summaryTextLayer}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: FLIP_ANIMATION_DURATION / 1000,
                                ease: [0.455, 0.03, 0.515, 0.955],
                            }}
                        >
                            <div className={styles.summaryText}>{chosenText || '\u00A0'}</div>
                        </motion.div>
                    </AnimatePresence>
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
