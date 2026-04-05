import { normalizeSpaces } from '@/utils/cardText';

import styles from '@/components/SwipeableDeck/HighlightedExample.module.less';

interface HighlightedExampleProps {
    example: string;
}

function HighlightedExample({ example }: HighlightedExampleProps) {
    const parts = normalizeSpaces(example).split(/(<hl>|<\/hl>)/);
    const nodes = [];
    let isHighlighted = false;

    for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];

        if (part === '<hl>') {
            isHighlighted = true;
            continue;
        }

        if (part === '</hl>') {
            isHighlighted = false;
            continue;
        }

        if (!part) {
            continue;
        }

        nodes.push(
            <span key={`${part}-${index}`} className={isHighlighted ? styles.highlight : styles.part}>
                {part}
            </span>
        );
    }

    return <div className={styles.container}>{nodes}</div>;
}

export default HighlightedExample;
