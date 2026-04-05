import type { CardData } from '@/types/cards';

export const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        pos: 'сущ.',
        phraseStart: 'Дорогой',
        options: {
            left: 'Кирилл',
            right: 'друг',
            up: 'коллега',
            down: 'Пух',
        },
        hiddenAfter: '!',
        phraseEnd: undefined,
    },
    {
        id: '2',
        pos: 'прил.',
        phraseStart: 'В этот',
        options: {
            left: 'прекрасный',
            right: 'солнечный',
            up: 'унылый',
            down: 'здабедательный',
        },
        phraseEnd: 'день',
    },
    {
        id: '3',
        pos: 'гл.',
        phraseStart: 'спешим',
        options: {
            left: 'уведомить',
            right: 'поздравить',
            up: 'поблагодарить',
            down: 'ошарашить',
        },
        phraseEnd: 'тебя',
    },
    {
        id: '4',
        pos: 'сущ.',
        phraseStart: 'с долгожданным',
        options: {
            left: 'Днём Рождение',
            right: 'Днём Рождения',
            up: 'Днём Рожденья',
            down: 'Днём Варенья',
        },
        phraseEnd: undefined,
    },
    {
        id: '5',
        pos: 'гл.',
        phraseStart: 'и',
        options: {
            left: 'подарить',
            right: 'пожелать',
            up: 'передать',
            down: 'вручить',
        },
        phraseEnd: 'тебе',
    },
    {
        id: '6',
        pos: 'прил.',
        phraseStart: 'этот',
        options: {
            left: 'скромный',
            right: 'скучный',
            up: 'полезный',
            down: 'суровый',
        },
        hiddenAfter: ',',
    },
    {
        id: '7',
        pos: 'прил.',
        phraseStart: 'но очень',
        options: {
            left: 'скромный',
            right: 'скучный',
            up: 'полезный',
            down: 'суровый',
        },
        phraseEnd: 'подарок',
        hiddenAfter: '!',
    },
    {
        id: '8',
        pos: 'сущ.',
        phraseStart: undefined,
        options: {
            left: 'Вот этот шнурок',
            right: 'Бутылку бургундского',
            up: 'Подписку на z.ai',
            down: 'Промо-код на пиццу',
        },
        hiddenAfter: '!',
        phraseEnd: undefined,
    },
];
