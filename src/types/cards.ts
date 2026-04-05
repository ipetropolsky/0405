export type CardSide = 'front' | 'back';
export type CardLocale = 'ru' | 'sr';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface CardOptionMap {
    left: string;
    right: string;
    up: string;
    down: string;
}

export interface CardTranslation {
    pos: string;
    phraseStart?: string;
    phraseEnd?: string;
    hiddenAfter?: string;
    options: CardOptionMap;
}

export interface CardData {
    id: string;
    optionIds: CardOptionMap;
    ru: CardTranslation;
    sr: CardTranslation;
}

export interface PrecalculatedParams {
    cardSide: CardSide;
    rotationDeg: number;
}
