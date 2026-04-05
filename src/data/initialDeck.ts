import type { CardData } from '@/types/cards';

export const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        pos: 'существительное',
        sides: {
            front: {
                word: 'окно',
                example: 'Я открыл <hl>окно</hl>, потому что в комнате было душно.',
            },
            back: {
                word: 'окно',
                example: 'На <hl>окне</hl> стоит маленькое растение.',
            },
        },
    },
    {
        id: '2',
        pos: 'глагол',
        sides: {
            front: {
                word: 'одолжить',
                example: 'Можно мне <hl>одолжить</hl> твою книгу до завтра?',
            },
            back: {
                word: 'одолжить',
                example: 'Он часто просит <hl>одолжить</hl> ему инструменты.',
            },
        },
    },
    {
        id: '3',
        pos: 'прилагательное',
        sides: {
            front: {
                word: 'тихий',
                example: 'Это очень <hl>тихая</hl> улица по вечерам.',
            },
            back: {
                word: 'тихий',
                example: 'Сегодня пёс на удивление <hl>тихий</hl>.',
            },
        },
    },
    {
        id: '4',
        pos: 'существительное',
        sides: {
            front: {
                word: 'чек',
                example: 'Сохрани <hl>чек</hl>, если вдруг что-то не будет работать.',
            },
            back: {
                word: 'чек',
                example: 'Я выбросил <hl>чек</hl>, как только вышел из магазина.',
            },
        },
    },
    {
        id: '5',
        pos: 'глагол',
        sides: {
            front: {
                word: 'заметить',
                example: 'Я не сразу смог <hl>заметить</hl> эту ошибку.',
            },
            back: {
                word: 'заметить',
                example: 'Трудно не <hl>заметить</hl> этот новый знак.',
            },
        },
    },
];
