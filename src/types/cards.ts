export type CardSide = 'front' | 'back';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface CardFaceContent {
    word: string;
    example: string;
}

export interface CardData {
    id: string;
    pos: string;
    sides: Record<CardSide, CardFaceContent>;
}

export interface PrecalculatedParams {
    cardSide: CardSide;
    rotationDeg: number;
}
