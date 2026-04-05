import type { CardData, PrecalculatedParams, SwipeDirection } from '@/types/cards';

import {
    ADDITIONAL_BOTTOM_RADIUS,
    MAX_ROTATION_ANGLE_DEG,
    SAFE_ZONE_RADIUS_X,
    SAFE_ZONE_RADIUS_Y,
} from '@/components/SwipeableDeck/constants';

export const randomCardParams = (): PrecalculatedParams => ({
    cardSide: Math.random() > 0.5 ? 'front' : 'back',
    rotationDeg: (Math.random() - 0.5) * MAX_ROTATION_ANGLE_DEG,
});

export const createParamsMap = (deck: CardData[]): Record<string, PrecalculatedParams> =>
    Object.fromEntries(deck.map((card) => [card.id, randomCardParams()])) as Record<string, PrecalculatedParams>;

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const getDirection = (x: number, y: number): SwipeDirection | null => {
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

export const getSwipeExit = (direction: SwipeDirection): { x: number; y: number; rotate: number } => {
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
