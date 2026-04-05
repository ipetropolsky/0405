export type CardSide = 'front' | 'back';
export type CardLocale = 'ru' | 'sr';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface CardTranslation {
    pos: string;
    phraseStart?: string;
    phraseEnd?: string;
    hiddenAfter?: string;
    options: Record<SwipeDirection, string>;
}

export interface CardData {
    id: string;
    ru: CardTranslation;
    sr: CardTranslation;
}

export interface PrecalculatedParams {
    cardSide: CardSide;
    rotationDeg: number;
}
