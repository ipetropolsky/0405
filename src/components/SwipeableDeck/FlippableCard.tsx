import { motion } from 'framer-motion';

import type { CardData, CardSide } from '@/types/cards';

import CardFace from '@/components/SwipeableDeck/CardFace';
import { FLIP_ANIMATION_DURATION } from '@/components/SwipeableDeck/constants';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

interface FlippableCardProps {
    card: CardData;
    side: CardSide;
    isMainCard: boolean;
}

function FlippableCard({ card, side, isMainCard }: FlippableCardProps) {
    const isFrontVisible = side === 'front';

    return (
        <motion.div
            className={styles.flipScene}
            animate={{ rotateY: isFrontVisible ? 0 : 180 }}
            transition={{
                duration: FLIP_ANIMATION_DURATION / 1000,
                ease: [0.455, 0.03, 0.515, 0.955],
            }}
        >
            <motion.div
                className={styles.shadowLayer}
                animate={{
                    scaleX: [1, 0, 1],
                    opacity: [1, 0, 1],
                }}
                transition={{
                    duration: FLIP_ANIMATION_DURATION / 1000,
                    times: [0, 0.5, 1],
                    ease: ['easeIn', 'easeOut'],
                }}
            />

            <div className={`${styles.flipFace} ${styles.flipFaceFront}`}>
                <CardFace card={card} side="front" isMainCard={isMainCard} />
            </div>

            <div className={`${styles.flipFace} ${styles.flipFaceBack}`}>
                <CardFace card={card} side="back" isMainCard={isMainCard} />
            </div>
        </motion.div>
    );
}

export default FlippableCard;
