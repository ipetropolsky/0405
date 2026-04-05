import type { CardData } from '@/types/cards';

export const CORRECT_OPTION_IDS_BASE64 = 'MS4yfDIuMnwzLjJ8NC40fDUuMXw2LjJ8Ny40fDguMw==';

export const SUCCESS_TEXT = 'Правильно! Активируй свой доступ в кабинете GoWords на z.ai';

export const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        optionIds: {
            left: '1.1',
            right: '1.2',
            up: '1.3',
            down: '1.4',
        },
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
        optionIds: {
            left: '2.1',
            right: '2.2',
            up: '2.3',
            down: '2.4',
        },
        ru: {
            pos: 'прил.',
            phraseStart: 'В этот',
            options: {
                left: 'прекрасный',
                right: 'солнечный',
                up: 'унылый',
                down: 'воскресный',
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
        optionIds: {
            left: '3.1',
            right: '3.2',
            up: '3.3',
            down: '3.4',
        },
        ru: {
            pos: 'гл.',
            phraseStart: 'спешим',
            options: {
                left: 'подставить',
                right: 'поздравить',
                up: 'уведомить',
                down: 'исправить',
            },
            phraseEnd: 'тебя',
        },
        sr: {
            pos: 'gl.',
            phraseStart: 'žurimo da te',
            options: {
                left: 'sapletemo',
                right: 'obradujemo',
                up: 'obavestimo',
                down: 'ispravimo',
            },
        },
    },
    {
        id: '4',
        optionIds: {
            left: '4.1',
            right: '4.2',
            up: '4.3',
            down: '4.4',
        },
        ru: {
            pos: 'сущ.',
            phraseStart: 'с',
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
        optionIds: {
            left: '5.1',
            right: '5.2',
            up: '5.3',
            down: '5.4',
        },
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
        optionIds: {
            left: '6.1',
            right: '6.2',
            up: '6.3',
            down: '6.4',
        },
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
        optionIds: {
            left: '7.1',
            right: '7.2',
            up: '7.3',
            down: '7.4',
        },
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
        optionIds: {
            left: '8.1',
            right: '8.2',
            up: '8.3',
            down: '8.4',
        },
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
