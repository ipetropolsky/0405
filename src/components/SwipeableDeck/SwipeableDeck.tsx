import React from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { INITIAL_DECK } from '@/data/initialDeck';

import BackgroundDeck from '@/components/SwipeableDeck/BackgroundDeck';
import EmptyDeckState from '@/components/SwipeableDeck/EmptyDeckState';
import FlippableCard from '@/components/SwipeableDeck/FlippableCard';
import {
    ACTION_MESSAGES,
    APPEAR_ANIMATION_DURATION,
    CARD_RETURN_SPRING,
    DECK_OFFSET,
    DECK_SCALE,
    DISAPPEAR_ANIMATION_DURATION,
    SIDE_OPPONENT,
} from '@/components/SwipeableDeck/constants';
import { createParamsMap, getDirection, getSwipeExit, randomCardParams } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

function SwipeableDeck() {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [message, setMessage] = React.useState('');
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));

    const currentCard = deck[0] ?? null;
    const backgroundCards = React.useMemo(() => deck.slice(1, 5), [deck]);
    const currentCardId = currentCard?.id ?? null;

    const currentParams = currentCardId ? paramsRef.current[currentCardId] : undefined;
    const [currentSideState, setCurrentSideState] = React.useState({
        cardId: currentCardId,
        side: currentParams?.cardSide ?? 'front',
    });
    const cardX = useMotionValue(0);
    const cardY = useMotionValue(0);
    const cardOffset = useMotionValue(DECK_OFFSET);
    const cardScale = useMotionValue(DECK_SCALE);
    const cardOpacity = useMotionValue(1);
    const cardBaseRotate = useMotionValue(currentParams?.rotationDeg ?? 0);
    const mainCardRotate = useTransform(() => cardBaseRotate.get() + cardX.get() / 30);
    const currentSide =
        currentSideState.cardId === currentCardId ? currentSideState.side : (currentParams?.cardSide ?? 'front');
    const dragOffsetRef = React.useRef({ x: 0, y: 0 });
    const dragDirectionRef = React.useRef('');

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

        setCurrentSideState({
            cardId: currentCardId,
            side: params.cardSide,
        });
        setMessage('');
        dragOffsetRef.current = { x: 0, y: 0 };
        dragDirectionRef.current = '';

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

    const handleFlip = React.useCallback(() => {
        if (!currentCard || isAnimatingOut) {
            return;
        }

        setCurrentSideState({
            cardId: currentCardId,
            side: SIDE_OPPONENT[currentSide],
        });
    }, [currentCard, currentCardId, currentSide, isAnimatingOut]);

    const handleSwipeComplete = React.useCallback(
        (_direction: 'left' | 'right' | 'up' | 'down') => {
            if (!currentCard) {
                return;
            }

            const rest = deck.slice(1);

            setDeck(rest);
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
            const nextMessage = direction ? ACTION_MESSAGES[direction] : '';

            dragOffsetRef.current = { x, y };

            if (dragDirectionRef.current !== nextMessage) {
                dragDirectionRef.current = nextMessage;
                setMessage(nextMessage);
            }
        },
        [isAnimatingOut]
    );

    const handleDragEnd = React.useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (!currentCard || isAnimatingOut) {
                return;
            }

            const x = info.offset.x;
            const y = info.offset.y;
            const direction = getDirection(x, y);

            if (!direction) {
                dragOffsetRef.current = { x: 0, y: 0 };
                dragDirectionRef.current = '';
                setMessage('');
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
            setMessage('');
            dragOffsetRef.current = { x: 0, y: 0 };
            dragDirectionRef.current = '';
            const opacityAnimation = animate(cardOpacity, 0, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });
            animate(cardX, exit.x, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });
            animate(cardY, exit.y, {
                duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
            });

            window.setTimeout(() => {
                opacityAnimation.stop();
                handleSwipeComplete(direction);
                setIsAnimatingOut(false);
            }, DISAPPEAR_ANIMATION_DURATION);
        },
        [cardOpacity, cardX, cardY, currentCard, handleSwipeComplete, isAnimatingOut]
    );

    if (!currentCard) {
        return (
            <div className={styles.screen}>
                <EmptyDeckState />
            </div>
        );
    }

    return (
        <div className={styles.screen}>
            <div className={styles.stage}>
                <BackgroundDeck cards={backgroundCards} deckLength={deck.length} paramsMap={paramsRef.current} />

                <motion.div
                    className={styles.cardWrapper}
                    style={{
                        zIndex: deck.length,
                        cursor: isAnimatingOut ? 'default' : 'grab',
                        x: cardX,
                        y: cardY,
                    }}
                    drag={!isAnimatingOut}
                    dragElastic={0.08}
                    dragMomentum={false}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onClick={(event) => {
                        if (Math.abs(dragOffsetRef.current.x) > 6 || Math.abs(dragOffsetRef.current.y) > 6) {
                            return;
                        }

                        const target = event.target as HTMLElement;

                        if (target.closest('[data-no-flip="true"]')) {
                            return;
                        }

                        handleFlip();
                    }}
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
                        <div className={styles.message}>
                            <div className={styles.messageText}>{message}</div>
                        </div>

                        <FlippableCard card={currentCard} side={currentSide} isMainCard />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default SwipeableDeck;
