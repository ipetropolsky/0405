import type { CardData } from '@/types/cards';

export const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        ru: {
            pos: 'сущ.',
            phraseStart: 'Дорогой',
            options: {
                left: 'Кирилл',
                right: 'друг',
                up: 'коллега',
                down: 'Пух',
            },
            hiddenAfter: '!',
        },
        sr: {
            pos: 'imen.',
            phraseStart: 'Dragi',
            options: {
                left: 'Kirile',
                right: 'prijatelju',
                up: 'kolega',
                down: 'Puše',
            },
            hiddenAfter: '!',
        },
    },
    {
        id: '2',
        ru: {
            pos: 'прил.',
            phraseStart: 'В этот',
            options: {
                left: 'прекрасный',
                right: 'солнечный',
                up: 'унылый',
                down: 'знаменательный',
            },
            phraseEnd: 'день',
        },
        sr: {
            pos: 'prid.',
            phraseStart: 'Na ovaj',
            options: {
                left: 'divan',
                right: 'sunčan',
                up: 'tmuran',
                down: 'značajan',
            },
            phraseEnd: 'dan',
        },
    },
    {
        id: '3',
        ru: {
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
        sr: {
            pos: 'gl.',
            phraseStart: 'žurimo da te',
            options: {
                left: 'obavestimo',
                right: 'čestitamo',
                up: 'zahvalimo',
                down: 'šokiramo',
            },
        },
    },
    {
        id: '4',
        ru: {
            pos: 'сущ.',
            phraseStart: 'с долгожданным',
            options: {
                left: 'Днём Рождение',
                right: 'Днём Рождения',
                up: 'Днём Рожденья',
                down: 'Днём Варенья',
            },
        },
        sr: {
            pos: 'imen.',
            phraseStart: 'sa dugo očekivanim',
            options: {
                left: 'rođendanjem',
                right: 'rođendanom',
                up: 'danom rođenja',
                down: 'danom džema',
            },
        },
    },
    {
        id: '5',
        ru: {
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
        sr: {
            pos: 'gl.',
            phraseStart: 'i',
            options: {
                left: 'poklonimo',
                right: 'poželimo',
                up: 'predamo',
                down: 'uručimo',
            },
            phraseEnd: 'ti',
        },
    },
    {
        id: '6',
        ru: {
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
        sr: {
            pos: 'prid.',
            phraseStart: 'ovaj',
            options: {
                left: 'skroman',
                right: 'dosadan',
                up: 'koristan',
                down: 'surov',
            },
            hiddenAfter: ',',
        },
    },
    {
        id: '7',
        ru: {
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
        sr: {
            pos: 'prid.',
            phraseStart: 'ali vrlo',
            options: {
                left: 'skroman',
                right: 'dosadan',
                up: 'koristan',
                down: 'surov',
            },
            phraseEnd: 'poklon',
            hiddenAfter: '!',
        },
    },
    {
        id: '8',
        ru: {
            pos: 'сущ.',
            options: {
                left: 'Вот этот шнурок',
                right: 'Бутылку бургундского',
                up: 'Подписку на z.ai',
                down: 'Промо-код на пиццу',
            },
            hiddenAfter: '!',
        },
        sr: {
            pos: 'imen.',
            options: {
                left: 'Ovu pertlu',
                right: 'Flašu burgundca',
                up: 'Pretplatu na z.ai',
                down: 'Promo-kod za picu',
            },
            hiddenAfter: '!',
        },
    },
];
