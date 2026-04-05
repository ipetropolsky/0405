import type { CardData } from '@/types/cards';

export const INITIAL_DECK: CardData[] = [
    {
        id: '1',
        pos: 'imenica',
        sides: {
            front: {
                word: 'window',
                example: 'Otvorio je <hl>prozor</hl> jer je bilo zagušljivo.',
            },
            back: {
                word: 'prozor',
                example: 'Na <hl>prozoru</hl> stoji mala biljka.',
            },
        },
    },
    {
        id: '2',
        pos: 'glagol',
        sides: {
            front: {
                word: 'to borrow',
                example: 'Mogu li da <hl>pozajmim</hl> tvoju knjigu do sutra?',
            },
            back: {
                word: 'pozajmiti',
                example: 'On često <hl>pozajmi</hl> alat od komšije.',
            },
        },
    },
    {
        id: '3',
        pos: 'pridev',
        sides: {
            front: {
                word: 'quiet',
                example: 'Ovo je baš <hl>mirna</hl> ulica uveče.',
            },
            back: {
                word: 'miran',
                example: 'Pas je danas neobično <hl>miran</hl>.',
            },
        },
    },
    {
        id: '4',
        pos: 'imenica',
        sides: {
            front: {
                word: 'receipt',
                example: 'Sačuvaj <hl>račun</hl> ako nešto ne bude radilo.',
            },
            back: {
                word: 'račun',
                example: 'Bacio sam <hl>račun</hl> čim sam izašao iz radnje.',
            },
        },
    },
    {
        id: '5',
        pos: 'glagol',
        sides: {
            front: {
                word: 'to notice',
                example: 'Nisam odmah <hl>primetio</hl> tu grešku.',
            },
            back: {
                word: 'primetiti',
                example: 'Teško je ne <hl>primetiti</hl> taj novi znak.',
            },
        },
    },
];
