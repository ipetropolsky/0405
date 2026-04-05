import styles from './SwipeableDeck.module.less';

function EmptyDeckState() {
    return (
        <div className={styles.emptyState}>
            Колода закончилась. Человечество выжило зря, но хотя бы карточки кончились.
        </div>
    );
}

export default EmptyDeckState;
