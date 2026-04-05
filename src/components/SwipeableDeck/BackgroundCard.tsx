import React from 'react';
import { motion } from 'framer-motion';

import type { CardData, CardSide, PrecalculatedParams } from '@/types/cards';

import CardFace from '@/components/SwipeableDeck/CardFace';
import { APPEAR_ANIMATION_DURATION, DECK_OFFSET, DECK_SCALE } from '@/components/SwipeableDeck/constants';
import { clamp } from '@/components/SwipeableDeck/utils';

import styles from '@/components/SwipeableDeck/SwipeableDeck.module.less';

interface BackgroundCardProps {
    card: CardData;
    deckLength: number;
    index: number;
    params: PrecalculatedParams;
    side: CardSide;
}

function BackgroundCard({ card, deckLength, index, params, side }: BackgroundCardProps) {
    return (
        <motion.div
            className={styles.cardWrapper}
            style={{
                zIndex: deckLength - index,
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
            <CardFace card={card} tone={side} />
        </motion.div>
    );
}

export default React.memo(BackgroundCard);
