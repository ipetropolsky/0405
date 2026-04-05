import React from 'react';
import { motion } from 'framer-motion';

type CardSide = 'front' | 'back';
type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface CardFaceContent {
    word: string;
    example: string;
}

interface CardData {
    id: string;
    pos: string;
    sides: Record<CardSide, CardFaceContent>;
}

interface PrecalculatedParams {
    cardSide: CardSide;
    rotationDeg: number;
}

const DEFAULT_CARD_PARAMS: PrecalculatedParams = {
    cardSide: 'front',
    rotationDeg: 0,
};

const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        pos: 'imenica',
        sides: {
            front: {
                word: 'window',
                example: 'Otvorio je <hl>prozor</hl> jer je bilo zagušljivo.',
            },
            back: {
                word: 'prozor',
                example: 'Na <hl>prozoru</hl> stoji mala biljka.',
            },
        },
    },
    {
        id: '2',
        pos: 'glagol',
        sides: {
            front: {
                word: 'to borrow',
                example: 'Mogu li da <hl>pozajmim</hl> tvoju knjigu do sutra?',
            },
            back: {
                word: 'pozajmiti',
                example: 'On često <hl>pozajmi</hl> alat od komšije.',
            },
        },
    },
    {
        id: '3',
        pos: 'pridev',
        sides: {
            front: {
                word: 'quiet',
                example: 'Ovo je baš <hl>mirna</hl> ulica uveče.',
            },
            back: {
                word: 'miran',
                example: 'Pas je danas neobično <hl>miran</hl>.',
            },
        },
    },
    {
        id: '4',
        pos: 'imenica',
        sides: {
            front: {
                word: 'receipt',
                example: 'Sačuvaj <hl>račun</hl> ako nešto ne bude radilo.',
            },
            back: {
                word: 'račun',
                example: 'Bacio sam <hl>račun</hl> čim sam izašao iz radnje.',
            },
        },
    },
    {
        id: '5',
        pos: 'glagol',
        sides: {
            front: {
                word: 'to notice',
                example: 'Nisam odmah <hl>primetio</hl> tu grešku.',
            },
            back: {
                word: 'primetiti',
                example: 'Teško je ne <hl>primetiti</hl> taj novi znak.',
            },
        },
    },
];

const DECK_SCALE = 0.8;
const DECK_OFFSET = 35;
const MAX_ROTATION_ANGLE_DEG = 10;
const APPEAR_ANIMATION_DURATION = 500;
const DISAPPEAR_ANIMATION_DURATION = 500;
const FLIP_ANIMATION_DURATION = 300;

const SAFE_ZONE_RADIUS_X = 50;
const SAFE_ZONE_RADIUS_Y = 40;
const ADDITIONAL_BOTTOM_RADIUS = 20;

const CARD_WIDTH = 300;
const CARD_HEIGHT = 500;

const ACTION_MESSAGES: Record<SwipeDirection, string> = {
    right: 'Знаю',
    left: 'Повторить',
    up: 'Знаю отлично',
    down: 'Удалить',
};

const SIDE_OPPONENT: Record<CardSide, CardSide> = {
    front: 'back',
    back: 'front',
};

const styles: Record<string, React.CSSProperties> = {
    screen: {
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        overflow: 'hidden',
        padding: '24px 16px',
        boxSizing: 'border-box',
        touchAction: 'none',
        userSelect: 'none',
    },
    stage: {
        position: 'relative',
        width: 'min(92vw, 360px)',
        height: 'min(calc(92vw * 1.6667), 600px)',
        maxWidth: `${CARD_WIDTH}px`,
        maxHeight: `${CARD_HEIGHT}px`,
        minWidth: '280px',
        minHeight: '466px',
    },
    cardWrapper: {
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
    },
    card3dShell: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
    },
    flipScene: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
    },
    flipFace: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
    },
    flipFaceFront: {
        transform: 'rotateY(0deg)',
    },
    flipFaceBack: {
        transform: 'rotateY(180deg)',
    },
    cardSide: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '25px',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    frontSide: {
        background: 'linear-gradient(180deg, #4461f2 0%, #3047c8 100%)',
        color: '#ffffff',
    },
    backSide: {
        background: 'linear-gradient(180deg, #00a896 0%, #0b7a6c 100%)',
        color: '#ffffff',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
        padding: '0 16px',
        boxSizing: 'border-box',
    },
    badge: {
        fontSize: '13px',
        lineHeight: 1,
        fontStyle: 'italic',
        opacity: 0.92,
        padding: '8px 10px',
        borderRadius: '999px',
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(8px)',
    },
    cardContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    topHalf: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
    },
    bottomHalf: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: '16px',
    },
    footer: {
        height: '60px',
    },
    cardTitle: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 20px',
        boxSizing: 'border-box',
    },
    cardTitleText: {
        fontSize: 'clamp(30px, 8vw, 36px)',
        textTransform: 'uppercase',
        fontWeight: 800,
        textAlign: 'center',
        lineHeight: 1.04,
        marginTop: 'auto',
        letterSpacing: '0.03em',
        textWrap: 'balance',
    },
    posText: {
        fontSize: '14px',
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.95,
        padding: '0 20px',
        boxSizing: 'border-box',
    },
    message: {
        position: 'absolute',
        left: 0,
        top: '40px',
        right: 0,
        height: '50px',
        zIndex: 100,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: '24px',
        lineHeight: '50px',
        textAlign: 'center',
        fontWeight: 700,
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    },
    bottomBlock: {
        padding: '0 20px',
        boxSizing: 'border-box',
    },
    exampleTextContainer: {
        display: 'block',
        textAlign: 'center',
        fontSize: '18px',
        lineHeight: 1.45,
    },
    exampleText: {
        fontSize: '18px',
        textAlign: 'center',
    },
    highlightedText: {
        fontSize: '18px',
        fontWeight: 800,
        textAlign: 'center',
    },
    hintText: {
        padding: '0 20px',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontSize: '13px',
        lineHeight: 1.35,
        opacity: 0.86,
    },
    emptyState: {
        maxWidth: '360px',
        textAlign: 'center',
        fontSize: '18px',
        lineHeight: 1.5,
        color: '#1f2937',
    },
};

const normalizeSpaces = (value: string): string => value.replace(/\s+/g, ' ').trim();

const renderHighlightedExample = (example: string): React.ReactNode[] => {
    const parts = normalizeSpaces(example).split(/(<hl>|<\/hl>)/);
    const nodes: React.ReactNode[] = [];
    let isHighlighted = false;

    for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];

        if (part === '<hl>') {
            isHighlighted = true;
            continue;
        }

        if (part === '</hl>') {
            isHighlighted = false;
            continue;
        }

        if (!part) {
            continue;
        }

        nodes.push(
            <span key={`${part}-${i}`} style={isHighlighted ? styles.highlightedText : styles.exampleText}>
                {part}
            </span>
        );
    }

    return nodes;
};

const randomCardParams = (): PrecalculatedParams => ({
    cardSide: Math.random() > 0.5 ? 'front' : 'back',
    rotationDeg: (Math.random() - 0.5) * MAX_ROTATION_ANGLE_DEG,
});

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getDirection = (x: number, y: number): SwipeDirection | null => {
    const isInSafeZone =
        Math.abs(x) <= SAFE_ZONE_RADIUS_X &&
        y >= -SAFE_ZONE_RADIUS_Y &&
        y <= SAFE_ZONE_RADIUS_Y + ADDITIONAL_BOTTOM_RADIUS;

    if (isInSafeZone) {
        return null;
    }

    if (Math.abs(x) > Math.abs(y)) {
        if (x > SAFE_ZONE_RADIUS_X) {
            return 'right';
        }

        if (x < -SAFE_ZONE_RADIUS_X) {
            return 'left';
        }

        return null;
    }

    if (y > SAFE_ZONE_RADIUS_Y + ADDITIONAL_BOTTOM_RADIUS) {
        return 'down';
    }

    if (y < -SAFE_ZONE_RADIUS_Y) {
        return 'up';
    }

    return null;
};

const getSwipeExit = (direction: SwipeDirection): { x: number; y: number; rotate: number } => {
    switch (direction) {
        case 'right':
            return { x: 520, y: 0, rotate: 16 };
        case 'left':
            return { x: -520, y: 0, rotate: -16 };
        case 'up':
            return { x: 0, y: -760, rotate: -8 };
        case 'down':
            return { x: 0, y: 760, rotate: 8 };
        default:
            return { x: 0, y: 0, rotate: 0 };
    }
};

const WebSwipeableDeck: React.FC = () => {
    const [deck, setDeck] = React.useState(INITIAL_DECK);
    const [message, setMessage] = React.useState('');
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

    const paramsRef = React.useRef(Object.fromEntries(INITIAL_DECK.map((card) => [card.id, randomCardParams()])));

    const currentCard = deck[0] ?? null;
    const nextCard = deck[1] ?? null;

    const currentParams = currentCard
        ? (paramsRef.current[currentCard.id] ?? DEFAULT_CARD_PARAMS)
        : DEFAULT_CARD_PARAMS;
    const nextParams = nextCard ? (paramsRef.current[nextCard.id] ?? DEFAULT_CARD_PARAMS) : DEFAULT_CARD_PARAMS;

    const [currentSide, setCurrentSide] = React.useState<CardSide>(currentParams.cardSide);
    const [drag, setDrag] = React.useState({ x: 0, y: 0 });
    const [exitState, setExitState] = React.useState<{
        active: boolean;
        x: number;
        y: number;
        rotate: number;
    }>({
        active: false,
        x: 0,
        y: 0,
        rotate: currentParams.rotationDeg,
    });

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
        if (!currentCard) {
            return;
        }

        const params = paramsRef.current[currentCard.id] ?? DEFAULT_CARD_PARAMS;

        setCurrentSide(params.cardSide);
        setDrag({ x: 0, y: 0 });
        setExitState({
            active: false,
            x: 0,
            y: 0,
            rotate: params.rotationDeg,
        });
        setMessage('');
    }, [currentCard, currentCard.id]);

    const handleFlip = React.useCallback(() => {
        if (!currentCard || isAnimatingOut) {
            return;
        }

        setCurrentSide((prev) => SIDE_OPPONENT[prev]);
    }, [currentCard, isAnimatingOut]);

    const handleSwipeComplete = React.useCallback(
        (direction: SwipeDirection) => {
            if (!currentCard) {
                return;
            }

            const movedCard = currentCard;
            const rest = deck.slice(1);

            if (direction === 'left') {
                const refreshedParams = randomCardParams();
                paramsRef.current[movedCard.id] = refreshedParams;
                setDeck([...rest, movedCard]);
                return;
            }

            setDeck(rest);
        },
        [currentCard, deck]
    );

    const handleDrag = React.useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
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
        (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
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

    const renderCardSide = React.useCallback((card: CardData, side: CardSide, isMainCard: boolean): React.ReactNode => {
        const content = card.sides[side];

        return (
            <div
                style={{
                    ...styles.cardSide,
                    ...(side === 'front' ? styles.frontSide : styles.backSide),
                }}
            >
                <div style={styles.header}>
                    <div style={styles.badge}>{card.pos}</div>
                </div>

                <div style={styles.cardContent}>
                    <div style={styles.topHalf}>
                        <div style={styles.cardTitle}>
                            <div style={styles.cardTitleText}>{normalizeSpaces(content.word)}</div>
                        </div>
                    </div>

                    <div style={styles.bottomHalf}>
                        <div style={styles.posText}>({card.pos})</div>

                        <div style={styles.bottomBlock}>
                            <div style={styles.exampleTextContainer}>{renderHighlightedExample(content.example)}</div>
                        </div>

                        {isMainCard ? (
                            <div style={styles.hintText}>
                                Нажми, чтобы перевернуть. Свайпни влево / вправо / вверх / вниз.
                            </div>
                        ) : null}
                    </div>
                </div>

                <div style={styles.footer} />
            </div>
        );
    }, []);

    const renderFlippableCard = React.useCallback(
        (card: CardData, side: CardSide, isMainCard: boolean): React.ReactNode => {
            const isFrontVisible = side === 'front';

            return (
                <motion.div
                    style={styles.flipScene}
                    animate={{ rotateY: isFrontVisible ? 0 : 180 }}
                    transition={{
                        duration: FLIP_ANIMATION_DURATION / 1000,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <div style={{ ...styles.flipFace, ...styles.flipFaceFront }}>
                        {renderCardSide(card, 'front', isMainCard)}
                    </div>

                    <div style={{ ...styles.flipFace, ...styles.flipFaceBack }}>
                        {renderCardSide(card, 'back', isMainCard)}
                    </div>
                </motion.div>
            );
        },
        [renderCardSide]
    );

    if (!currentCard) {
        return (
            <div style={styles.screen}>
                <div style={styles.emptyState}>
                    Колода закончилась. Человечество выжило зря, но хотя бы карточки кончились.
                </div>
            </div>
        );
    }

    return (
        <div style={styles.screen}>
            <div style={styles.stage}>
                {deck.slice(0, 5).map((card, index) => {
                    const params = paramsRef.current[card.id] ?? DEFAULT_CARD_PARAMS;
                    const isMainCard = index === 0;

                    if (!isMainCard) {
                        return (
                            <motion.div
                                key={`${index}:${card.id}`}
                                style={{
                                    ...styles.cardWrapper,
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
                                {renderFlippableCard(card, params.cardSide, false)}
                            </motion.div>
                        );
                    }

                    const liveRotate = currentParams.rotationDeg + drag.x / 30;
                    const liveRotateY = drag.x / 5;
                    const liveRotateX = -drag.y / 10;

                    return (
                        <motion.div
                            key={`${index}:${card.id}`}
                            style={{
                                ...styles.cardWrapper,
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
                                style={{
                                    ...styles.card3dShell,
                                    transform: `perspective(1200px) rotateX(${liveRotateX}deg) rotateY(${liveRotateY}deg)`,
                                }}
                            >
                                <div style={styles.message}>
                                    <div style={styles.messageText}>{message}</div>
                                </div>

                                {renderFlippableCard(card, currentSide, true)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default WebSwipeableDeck;
