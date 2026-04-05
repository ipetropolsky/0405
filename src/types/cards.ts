export type CardSide = 'front' | 'back';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface CardData {
    id: string;
    pos: string;
    phraseStart?: string;
    phraseEnd?: string;
    hiddenAfter?: string;
    options: Record<SwipeDirection, string>;
}

export interface PrecalculatedParams {
    cardSide: CardSide;
    rotationDeg: number;
}
