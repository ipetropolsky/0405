import type { CardData, CardSide } from '@/types/cards';
import { normalizeSpaces } from '@/utils/cardText';

import HighlightedExample from '@/components/SwipeableDeck/HighlightedExample';

import styles from '@/components/SwipeableDeck/CardFace.module.less';

interface CardFaceProps {
    card: CardData;
    side: CardSide;
    isMainCard: boolean;
}

function CardFace({ card, side, isMainCard }: CardFaceProps) {
    const content = card.sides[side];
    const className = [styles.side, side === 'front' ? styles.frontSide : styles.backSide].join(' ');

    return (
        <div className={className}>
            <div className={styles.header}>
                <div className={styles.badge}>{card.pos}</div>
            </div>

            <div className={styles.content}>
                <div className={styles.topHalf}>
                    <div className={styles.title}>
                        <div className={styles.titleText}>{normalizeSpaces(content.word)}</div>
                    </div>
                </div>

                <div className={styles.bottomHalf}>
                    <div className={styles.posText}>({card.pos})</div>

                    <div className={styles.bottomBlock}>
                        <HighlightedExample example={content.example} />
                    </div>

                    {isMainCard ? (
                        <div className={styles.hintText}>
                            Нажми, чтобы перевернуть. Свайпни влево / вправо / вверх / вниз.
                        </div>
                    ) : null}
                </div>
            </div>

            <div className={styles.footer} />
        </div>
    );
}

export default CardFace;
