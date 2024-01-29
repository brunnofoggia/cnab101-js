import { map, omit, pick } from 'lodash';

import { Cnab } from './cnab';
import { ERROR_CODE } from './enum/error';

import {
    generateMockLines,
    mockLayout,
    mockLayoutConfig,
    mockColumnA0,
    mockColumnA1,
    omitColumnFields,
    columnString1,
    columnString2,
    columnString3,
    columnString4,
    columnString5,
    mockColumnAX,
    columnString3b,
    columnString6,
    mockColumnAY,
    abcdLayout,
    abcdLayout2,
    omitColumnFields2,
} from '../test/cnab.test';

import '../test/common/jest.test';

describe('CNAB', () => {
    let cnab;

    beforeEach(() => {
        cnab = new Cnab();
        cnab._setConfig(mockLayout);
    });

    describe('setConfig', () => {
        it('should set the configuration correctly', () => {
            expect(cnab.config).toBe(mockLayout);
        });
    });

    describe('buildLayout', () => {
        it('should throw an error if lines are invalid', () => {
            let invalidConfig: any = { ...omit(mockLayout, 'lines') };
            cnab._setConfig(invalidConfig);
            expect(() => cnab._buildLayout()).toThrowCode(ERROR_CODE.LAYOUT_LINES_INVALID);

            invalidConfig = { ...omit(mockLayout, 'lines'), lines: null };
            cnab._setConfig(invalidConfig);
            expect(() => cnab._buildLayout()).toThrowCode(ERROR_CODE.LAYOUT_LINES_INVALID);
        });

        it('should build the layout correctly', () => {
            cnab._buildLayout();
            expect(cnab.layout.size).toBe(mockLayout.size);
            expect(cnab.layout.lines.A.layout).toEqual(expect.arrayContaining([expect.any(Object)]));
        });

        it('should build layout with string format from position 0', () => {
            const stringConfig = {
                size: 100,
                lines: {
                    X: {
                        layout: abcdLayout,
                    },
                },
            };

            cnab._setConfig(stringConfig);
            cnab._buildLayout();

            const config = map(cnab.layout.lines['X'].layout, (o) => omit(o, omitColumnFields2));
            expect(config).toEqual(generateMockLines(100, 10));
        });

        it('should build layout with string format from position 1', () => {
            const stringConfig = {
                size: 100,
                lines: {
                    X: {
                        layout: abcdLayout2,
                    },
                },
            };

            cnab._setConfig(stringConfig);
            cnab._buildLayout();

            const config = map(cnab.layout.lines['X'].layout, (o) => omit(o, omitColumnFields2));
            expect(config).toEqual(generateMockLines(100, 10, 1));
        });
    });

    describe('validations', () => {
        it('should validate column layout interface', () => {
            const result = cnab._isValidColumnLayoutInterface(mockColumnA0);
            expect(result).toBe(true);
        });

        it('should check line', () => {
            cnab._buildLayout();
            const result = cnab._checkLineLayout(mockLayoutConfig.A);
            expect(result).toBe(true);
        });

        it('should check line length', () => {
            cnab._buildLayout();
            const result = cnab._checkLineLength(mockLayoutConfig.A);
            expect(result).toBe(true);
        });

        it('should check line positions', () => {
            cnab._buildLayout();
            const result = cnab._checkLinePositions(mockLayoutConfig.A);
            expect(result).toBe(true);
        });

        it('should get line layout', () => {
            cnab._buildLayout();

            const line = cnab.getLineLayout('A');
            const columns = map(line, (o) => omit(o, omitColumnFields));

            expect(columns).toEqual(mockLayoutConfig.A);
        });
    });

    describe('builders', () => {
        it('should build line column by object', () => {
            const result = cnab._buildColumnByObject(mockColumnA0.key, mockColumnA0);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA0);
        });

        it('should build line column with columnKey by string: ' + columnString1, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA0.key, columnString1);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA0);
            expect(result.fill).toBe(' ');
        });

        it('should build line column with columnKey by string: ' + columnString2, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA0.key, columnString2);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA0);
            expect(result.fill).toBe(' ');
        });

        it('should build line column with columnKey by string: ' + columnString3, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA0.key, columnString3);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnAX);

            expect(result.fill).toBe(' ');
        });

        it('should build line column without columnKey by string: ' + columnString3b, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString('0', columnString3b);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnAX);

            expect(result.fill).toBe(' ');
        });

        it('should build column with columnKey by string: ' + columnString4, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA1.key, columnString4);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA1);
            expect(result.fill).toBe('0');
        });

        it('should build column with columnKey by string: ' + columnString5, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA1.key, columnString5);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA1);
            expect(result.fill).toBe('0');
        });

        it('should build line column without columnKey by string: ' + columnString6, () => {
            expect.assertions(2);

            const result = cnab._buildColumnByString(mockColumnA1.key, columnString6);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnAY);
            expect(result.fill).toBe('0');
        });

        it('should prepare column layout', () => {
            const result = cnab._prepareColumnLayout(mockColumnA0);
            expect(omit(result, ...omitColumnFields)).toEqual(mockColumnA0);
        });

        it('should define default value as empty', () => {
            const result = cnab._prepareColumnLayout(mockColumnA0);
            expect(pick(result, 'defaultValue')).toEqual({ defaultValue: '' });
        });

        it('should define default value as 999', () => {
            const defaultValue = '999';
            const mockColumnX = { ...mockColumnA0 } as any;
            mockColumnX.defaultValue = defaultValue;

            const result = cnab._prepareColumnLayout(mockColumnX);
            expect(pick(result, 'defaultValue')).toEqual({ defaultValue });
        });
    });
});
