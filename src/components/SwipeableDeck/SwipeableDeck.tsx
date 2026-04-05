import React from 'react';
import { motion, type PanInfo } from 'framer-motion';

import { INITIAL_DECK } from '@/data/initialDeck';

import EmptyDeckState from '@/components/SwipeableDeck/EmptyDeckState';
import FlippableCard from '@/components/SwipeableDeck/FlippableCard';
import {
    ACTION_MESSAGES,
    APPEAR_ANIMATION_DURATION,
    DEFAULT_CARD_PARAMS,
    DECK_OFFSET,
    DECK_SCALE,
    DISAPPEAR_ANIMATION_DURATION,
    SIDE_OPPONENT,
} from '@/components/SwipeableDeck/constants';
import { clamp, createParamsMap, getDirection, getSwipeExit, randomCardParams } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

interface ExitState {
    active: boolean;
    x: number;
    y: number;
    rotate: number;
}

const createIdleExitState = (rotationDeg: number): ExitState => ({
    active: false,
    x: 0,
    y: 0,
    rotate: rotationDeg,
});

function SwipeableDeck() {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [message, setMessage] = React.useState('');
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
    const paramsRef = React.useRef(createParamsMap(INITIAL_DECK));

    const currentCard = deck[0] ?? null;
    const nextCard = deck[1] ?? null;
    const currentCardId = currentCard?.id ?? null;
    const nextCardId = nextCard?.id ?? null;

    const currentParams = currentCardId
        ? (paramsRef.current[currentCardId] ?? DEFAULT_CARD_PARAMS)
        : DEFAULT_CARD_PARAMS;
    const nextParams = nextCardId ? (paramsRef.current[nextCardId] ?? DEFAULT_CARD_PARAMS) : DEFAULT_CARD_PARAMS;

    const [currentSide, setCurrentSide] = React.useState(currentParams.cardSide);
    const [drag, setDrag] = React.useState({ x: 0, y: 0 });
    const [exitState, setExitState] = React.useState(createIdleExitState(currentParams.rotationDeg));

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

    React.useEffect(() => {
        if (!currentCardId) {
            return;
        }

        const params = paramsRef.current[currentCardId] ?? DEFAULT_CARD_PARAMS;

        setCurrentSide(params.cardSide);
        setDrag({ x: 0, y: 0 });
        setExitState(createIdleExitState(params.rotationDeg));
        setMessage('');
    }, [currentCardId]);

    const handleFlip = React.useCallback(() => {
        if (!currentCard || isAnimatingOut) {
            return;
        }

        setCurrentSide((previousSide) => SIDE_OPPONENT[previousSide]);
    }, [currentCard, isAnimatingOut]);

    const handleSwipeComplete = React.useCallback(
        (direction: 'left' | 'right' | 'up' | 'down') => {
            if (!currentCard) {
                return;
            }

            const movedCard = currentCard;
            const rest = deck.slice(1);

            if (direction === 'left') {
                paramsRef.current[movedCard.id] = randomCardParams();
                setDeck([...rest, movedCard]);
                return;
            }

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

            setDrag({ x, y });
            setMessage(direction ? ACTION_MESSAGES[direction] : '');
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
                setDrag({ x: 0, y: 0 });
                setMessage('');
                return;
            }

            const exit = getSwipeExit(direction);

            setIsAnimatingOut(true);
            setExitState({
                active: true,
                x: exit.x,
                y: exit.y,
                rotate: exit.rotate,
            });
            setMessage('');
            setDrag({ x: 0, y: 0 });

            window.setTimeout(() => {
                handleSwipeComplete(direction);
                setIsAnimatingOut(false);
            }, DISAPPEAR_ANIMATION_DURATION);
        },
        [currentCard, handleSwipeComplete, isAnimatingOut]
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
                {deck.slice(0, 5).map((card, index) => {
                    const params = paramsRef.current[card.id] ?? DEFAULT_CARD_PARAMS;
                    const isMainCard = index === 0;

                    if (!isMainCard) {
                        return (
                            <motion.div
                                key={`${index}:${card.id}`}
                                className={styles.cardWrapper}
                                style={{
                                    zIndex: deck.length - index,
                                    pointerEvents: 'none',
                                }}
                                initial={{
                                    y: DECK_OFFSET,
                                    scale: DECK_SCALE,
                                    rotate: params.rotationDeg,
                                    opacity: 1 - 0.1 * (index - 1),
                                }}
                                animate={{
                                    y: DECK_OFFSET,
                                    scale: DECK_SCALE,
                                    rotate: params.rotationDeg,
                                    opacity: clamp(1 - 0.1 * (index - 1), 0.55, 1),
                                }}
                                transition={{
                                    duration: APPEAR_ANIMATION_DURATION / 1000,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <FlippableCard card={card} side={params.cardSide} isMainCard={false} />
                            </motion.div>
                        );
                    }

                    const liveRotate = currentParams.rotationDeg + drag.x / 30;
                    const liveRotateY = drag.x / 5;
                    const liveRotateX = -drag.y / 10;

                    return (
                        <motion.div
                            key={`${index}:${card.id}`}
                            className={styles.cardWrapper}
                            style={{
                                zIndex: deck.length - index,
                                cursor: isAnimatingOut ? 'default' : 'grab',
                            }}
                            drag={!isAnimatingOut}
                            dragElastic={0.08}
                            dragMomentum={false}
                            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                            onClick={(event) => {
                                if (Math.abs(drag.x) > 6 || Math.abs(drag.y) > 6) {
                                    return;
                                }

                                const target = event.target as HTMLElement;

                                if (target.closest('[data-no-flip="true"]')) {
                                    return;
                                }

                                handleFlip();
                            }}
                            initial={{
                                y: DECK_OFFSET,
                                scale: DECK_SCALE,
                                rotate: nextParams.rotationDeg,
                                opacity: 1,
                            }}
                            animate={
                                exitState.active
                                    ? {
                                          x: exitState.x,
                                          y: exitState.y,
                                          rotate: exitState.rotate,
                                          opacity: 0,
                                          scale: 1,
                                      }
                                    : {
                                          x: drag.x,
                                          y: drag.y,
                                          scale: 1,
                                          rotate: liveRotate,
                                          opacity: 1,
                                      }
                            }
                            transition={
                                exitState.active
                                    ? {
                                          duration: DISAPPEAR_ANIMATION_DURATION / 1000,
                                          ease: [0.22, 1, 0.36, 1],
                                      }
                                    : {
                                          type: 'spring',
                                          stiffness: 380,
                                          damping: 28,
                                          mass: 0.8,
                                      }
                            }
                        >
                            <div
                                className={styles.card3dShell}
                                style={{
                                    transform: `perspective(1200px) rotateX(${liveRotateX}deg) rotateY(${liveRotateY}deg)`,
                                }}
                            >
                                <div className={styles.message}>
                                    <div className={styles.messageText}>{message}</div>
                                </div>

                                <FlippableCard card={card} side={currentSide} isMainCard />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default SwipeableDeck;
