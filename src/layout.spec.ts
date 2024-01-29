import { CnabWriter } from './writer';
import { ERROR_CODE } from './enum/error';
import { COLUMN_REQUIREMENT } from './enum/columnType';

import '../test/common/jest.test';

import { itau240 } from '../test/layout-240.test';
import { cnab500 } from '../test/layout-500.test';

describe('CNAB', () => {
    let cnab;

    beforeEach(() => {
        cnab = new CnabWriter();
    });

    describe('capture string values', () => {
        it('should capture string values from format 1 (a)', () => {
            const result = cnab._captureStringValues('LEFT, 10');
            expect(result).toEqual(['LEFT', '10', undefined, undefined, undefined, undefined, undefined]);
        });

        it('should capture string values from format 1 (b)', () => {
            const result = cnab._captureStringValues('LEFT*,10, 0," ",9');
            expect(result).toEqual(['LEFT', '10', '0', ' ', '9', undefined, '*']);
        });

        it('should capture string values from format 2 (a)', () => {
            const result = cnab._captureStringValues('X(10)?');
            expect(result).toEqual(['LEFT', '10', undefined, undefined, undefined, undefined, '?']);
        });

        it('should capture string values from format 2 (b)', () => {
            const result = cnab._captureStringValues('9(3), "341"');
            expect(result).toEqual(['RIGHT', '3', '341', undefined, undefined, undefined, undefined]);
        });

        it('should capture string values from format 2 (c)', () => {
            const result = cnab._captureStringValues('banco, 9(3)!, "341", 0, 7');
            expect(result).toEqual(['RIGHT', '3', '341', '0', '7', 'banco', '!']);
        });
    });

    //_buildColumnByString
    describe('_buildColumnByString', () => {
        it('should build column correctly', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8)');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: ' ',
                defaultValue: '',
                required: COLUMN_REQUIREMENT.IGNORED,
            });
        });

        it('should build column correctly with all parameters', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8), " ", X');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: 'X',
                defaultValue: ' ',
                required: COLUMN_REQUIREMENT.IGNORED,
            });
        });

        it('should build column with requirement IGNORED', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8)., " ", X');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: 'X',
                defaultValue: ' ',
                required: COLUMN_REQUIREMENT.IGNORED,
            });
        });

        it('should build column with requirement OPTIONAL', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8)?, " ", X');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: 'X',
                defaultValue: ' ',
                required: COLUMN_REQUIREMENT.OPTIONAL,
            });
        });

        it('should build column with requirement REQUIRED', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8)*, " ", X');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: 'X',
                defaultValue: ' ',
                required: COLUMN_REQUIREMENT.REQUIRED,
            });
        });

        it('should build column with requirement STRICT', () => {
            expect.assertions(1);

            const result = cnab._buildColumnByString('brancos', 'X(8)!, " ", X');
            expect(result).toEqual({
                key: 'brancos',
                direction: 'LEFT',
                position: 1,
                size: 8,
                end: 8,
                fill: 'X',
                defaultValue: ' ',
                required: COLUMN_REQUIREMENT.STRICT,
            });
        });

        it('should throw error: invalid direction', () => {
            expect(() => cnab._buildColumnByString('brancos', 'D, 1, "", "", 118')).toThrowCode(ERROR_CODE.COLUMN_DIRECTION_INVALID);
        });
    });

    describe('buildLayout', () => {
        it('should build the layout correctly cnab240', () => {
            expect.assertions(4);

            expect(() => cnab.initialize(itau240)).not.toThrow();
            expect(cnab.initialize(itau240)).toBeUndefined();
            expect(cnab.layout.size).toBe(itau240.size);
            expect(cnab.layout.lines.header.layout).toEqual(expect.arrayContaining([expect.any(Object)]));
        });

        it('should build the layout correctly cnab500', () => {
            expect.assertions(5);

            expect(() => cnab.initialize(cnab500)).not.toThrow();
            expect(cnab.initialize(cnab500)).toBeUndefined();
            expect(cnab.layout.size).toBe(cnab500.size);
            expect(cnab.layout.lines.header.layout).toEqual(expect.arrayContaining([expect.any(Object)]));
            expect(cnab.layout.lines.detalhes.segments.tipo_1.layout).toEqual(expect.arrayContaining([expect.any(Object)]));
        });
    });

    describe('validations', () => {
        it('should throw error: invalid direction', () => {
            expect(() => cnab._buildColumnByString('brancos', 'D, 1, "", "", 118')).toThrowCode(ERROR_CODE.COLUMN_DIRECTION_INVALID);
        });

        describe('CNAB Itau 240', () => {
            it('should check line', () => {
                cnab.initialize(itau240);

                const result = cnab._checkLineLayout(cnab.getLineLayout('header'));
                expect(result).toBe(true);
            });
        });
    });
});
