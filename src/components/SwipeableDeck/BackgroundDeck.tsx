import React from 'react';

import type { CardData, PrecalculatedParams } from '@/types/cards';

import BackgroundCard from '@/components/SwipeableDeck/BackgroundCard';

interface BackgroundDeckProps {
    cards: CardData[];
    deckLength: number;
    paramsMap: Record<string, PrecalculatedParams>;
}

function BackgroundDeck({ cards, deckLength, paramsMap }: BackgroundDeckProps) {
    return cards.map((card, index) => {
        const params = paramsMap[card.id];

        if (!params) {
            return null;
        }

        return (
            <BackgroundCard
                key={`${index + 1}:${card.id}`}
                card={card}
                deckLength={deckLength}
                index={index + 1}
                params={params}
            />
        );
    });
}

export default React.memo(BackgroundDeck);
