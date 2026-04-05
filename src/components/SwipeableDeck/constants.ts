import type { CardSide, PrecalculatedParams, SwipeDirection } from '@/types/cards';

export const DEFAULT_CARD_PARAMS: PrecalculatedParams = {
    cardSide: 'front',
    rotationDeg: 0,
};

export const DECK_SCALE = 0.8;
export const DECK_OFFSET = 35;
export const MAX_ROTATION_ANGLE_DEG = 10;
export const APPEAR_ANIMATION_DURATION = 500;
export const DISAPPEAR_ANIMATION_DURATION = 500;
export const FLIP_ANIMATION_DURATION = 500;

export const SAFE_ZONE_RADIUS_X = 50;
export const SAFE_ZONE_RADIUS_Y = 40;
export const ADDITIONAL_BOTTOM_RADIUS = 20;

export const ACTION_MESSAGES: Record<SwipeDirection, string> = {
    right: 'Знаю',
    left: 'Повторить',
    up: 'Знаю отлично',
    down: 'Удалить',
};

export const SIDE_OPPONENT: Record<CardSide, CardSide> = {
    front: 'back',
    back: 'front',
};
