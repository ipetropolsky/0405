import React from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

import type { CardData, CardSide, SwipeDirection } from '@/types/cards';

import CardFace from '@/components/SwipeableDeck/CardFace';
import { FLIP_ANIMATION_DURATION } from '@/components/SwipeableDeck/constants';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

interface FlippableCardProps {
    card: CardData;
    side: CardSide;
    revealedDirection?: SwipeDirection | null;
}

const SIDE_INDEX: Record<CardSide, number> = {
    front: 0,
    back: 1,
};

function FlippableCard({ card, side, revealedDirection = null }: FlippableCardProps) {
    const sideIndex = SIDE_INDEX[side];
    const rotation = useMotionValue(sideIndex);
    const shadow = useMotionValue(1);
    const frontRotate = useTransform(rotation, [0, 1], [0, 180]);
    const backRotate = useTransform(rotation, [0, 1], [180, 360]);
    const frontOpacity = useTransform(rotation, (value) => (value <= 0.5 ? 1 : 0));
    const backOpacity = useTransform(rotation, (value) => (value > 0.5 ? 1 : 0));
    const shadowScaleX = useTransform(shadow, [0, 1], [0, 1]);
    const previousCardIdRef = React.useRef(card.id);
    const previousSideRef = React.useRef(sideIndex);

    React.useEffect(() => {
        const isNewCard = previousCardIdRef.current !== card.id;
        const didSideChange = previousSideRef.current !== sideIndex;

        previousCardIdRef.current = card.id;
        previousSideRef.current = sideIndex;

        if (isNewCard) {
            rotation.jump(sideIndex);
            shadow.jump(1);
            return undefined;
        }

        if (!didSideChange) {
            return undefined;
        }

        const rotationAnimation = animate(rotation, sideIndex, {
            duration: FLIP_ANIMATION_DURATION / 1000,
            ease: [0.455, 0.03, 0.515, 0.955],
        });
        const shadowOut = animate(shadow, 0, {
            duration: FLIP_ANIMATION_DURATION / 2000,
            ease: 'easeIn',
        });
        let shadowIn: ReturnType<typeof animate> | null = null;
        const shadowTimeout = window.setTimeout(() => {
            shadowIn = animate(shadow, 1, {
                duration: FLIP_ANIMATION_DURATION / 2000,
                ease: 'easeOut',
            });
        }, FLIP_ANIMATION_DURATION / 2);

        return () => {
            rotationAnimation.stop();
            shadowOut.stop();
            shadowIn?.stop();
            window.clearTimeout(shadowTimeout);
        };
    }, [card.id, rotation, shadow, sideIndex]);

    return (
        <div className={styles.flipScene}>
            <motion.div
                className={styles.shadowLayer}
                style={{
                    scaleX: shadowScaleX,
                    opacity: shadow,
                }}
            />

            <motion.div
                className={`${styles.flipFace} ${styles.flipFaceFront}`}
                style={{
                    rotateY: frontRotate,
                    opacity: frontOpacity,
                }}
            >
                <CardFace card={card} tone="front" revealedDirection={revealedDirection} />
            </motion.div>

            <motion.div
                className={`${styles.flipFace} ${styles.flipFaceBack}`}
                style={{
                    rotateY: backRotate,
                    opacity: backOpacity,
                }}
            >
                <CardFace card={card} tone="back" revealedDirection={revealedDirection} />
            </motion.div>
        </div>
    );
}

export default React.memo(FlippableCard);
