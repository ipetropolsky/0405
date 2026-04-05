import React from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { INITIAL_DECK } from '@/data/initialDeck';
import type { CardData, SwipeDirection } from '@/types/cards';

import BackgroundDeck from '@/components/SwipeableDeck/BackgroundDeck';
import CardFace from '@/components/SwipeableDeck/CardFace';
import {
    APPEAR_ANIMATION_DURATION,
    CARD_RETURN_SPRING,
    DECK_OFFSET,
    DECK_SCALE,
    DISAPPEAR_ANIMATION_DURATION,
} from '@/components/SwipeableDeck/constants';
import { createParamsMap, getDirection, getSwipeExit, randomCardParams } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

const buildChosenText = (card: CardData, direction: SwipeDirection): string => {
    const segment = [card.phraseStart, card.options[direction], card.phraseEnd].filter(Boolean).join(' ');

    if (!segment) {
        return '';
    }

    return `${segment}${card.hiddenAfter ?? ''}`;
};

function SwipeableDeck() {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [chosenText, setChosenText] = React.useState('');
    const [revealedVariant, setRevealedVariant] = React.useState<string | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));

    const currentCard = deck[0] ?? null;
    const backgroundCards = React.useMemo(() => deck.slice(1, 5), [deck]);
    const currentCardId = currentCard?.id ?? null;
    const currentParams = currentCardId ? paramsRef.current[currentCardId] : undefined;

    const cardX = useMotionValue(0);
    const cardY = useMotionValue(0);
    const cardOffset = useMotionValue(DECK_OFFSET);
    const cardScale = useMotionValue(DECK_SCALE);
    const cardOpacity = useMotionValue(1);
    const cardBaseRotate = useMotionValue(currentParams?.rotationDeg ?? 0);
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

        setRevealedVariant(null);
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

            const nextSegment = buildChosenText(currentCard, direction);

            setChosenText((previousText) => [previousText, nextSegment].filter(Boolean).join(' '));
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
                setRevealedVariant(direction ? (currentCard?.options[direction] ?? null) : null);
            }
        },
        [currentCard, isAnimatingOut]
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
                setRevealedVariant(null);
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
                setRevealedVariant(null);
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
                    <div className={styles.finishedSummaryText}>{chosenText || 'Колода закончилась.'}</div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.screen}>
            <div className={styles.deckLayout}>
                <div className={styles.summaryPanel}>
                    <div className={styles.summaryText}>{chosenText || '\u00A0'}</div>
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
                        >
                            <CardFace
                                card={currentCard}
                                tone={currentParams?.cardSide ?? 'front'}
                                revealedVariant={revealedVariant}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default SwipeableDeck;
