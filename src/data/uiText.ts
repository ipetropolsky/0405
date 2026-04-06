import { makeNBSP } from '@/utils/cardText';

const rawUiText = {
    front: {
        check: 'Проверить',
        retry: 'Вызов принят!',
        checking: 'Идёт проверка результата…',
        emptyResult: 'Тут ничего нет',
        success: 'Правильно! Активируй свой доступ в кабинете на z.ai',
        error1: 'Почти получилось :)',
        error2: 'Попробуй ещё, подарок ждёт!',
    },
    back: {
        check: 'Proveri',
        retry: 'Izazov prihvaćen!',
        checking: 'Proveravamo rezultat…',
        emptyResult: 'Ovde nema ničega',
        success: 'Tačno! Aktiviraj svoj pristup u kabinetu na z.ai',
        error1: 'Zamalo :)',
        error2: 'Pokušaj ponovo, poklon te čeka!',
    },
} as const;

const normalizeUiText = <T extends Record<string, Record<string, string>>>(textMap: T): T =>
    Object.fromEntries(
        Object.entries(textMap).map(([locale, localeText]) => [
            locale,
            Object.fromEntries(Object.entries(localeText).map(([key, value]) => [key, makeNBSP(value)])),
        ])
    ) as T;

export const UI_TEXT = normalizeUiText(rawUiText);
