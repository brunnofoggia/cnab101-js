import { CnabWriter } from './writer';
import { DIRECTION } from './enum/direction';
import { ColumnLayoutInterface } from './interface/column';
import { COLUMN_REQUIREMENT } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import '../test/common/jest.test';

const threeColumnsLayout = {
    size: 20,
    lines: {
        X: [
            {
                key: 'column1',
                direction: DIRECTION.LEFT,
                position: 0,
                size: 5,
                end: 0, // irrelevant for write purposes
                fill: ' ',
                defaultValue: '',
                required: COLUMN_REQUIREMENT.IGNORED,
            },
            {
                key: 'column2',
                direction: DIRECTION.LEFT,
                position: 5,
                size: 7,
                end: 0,
                fill: ' ',
                defaultValue: '',
                required: COLUMN_REQUIREMENT.IGNORED,
            },
            {
                key: 'column3',
                direction: DIRECTION.RIGHT,
                position: 12,
                size: 8,
                end: 0,
                fill: '0',
                defaultValue: '',
                required: COLUMN_REQUIREMENT.IGNORED,
            },
        ],
    },
};

const threeColumnsJson = {
    column1: '123',
    column2: '4567',
    column3: '89012',
};

const threeLineResult = '123  4567   00089012';

describe('CnabWriter', () => {
    let cnabWriter: CnabWriter;
    let columnConfig: ColumnLayoutInterface;

    beforeEach(() => {
        cnabWriter = new CnabWriter();
        columnConfig = {
            key: 'testKey',
            direction: DIRECTION.LEFT,
            position: 0,
            size: 10,
            end: 10,
            fill: ' ',
            defaultValue: 'default',
            required: COLUMN_REQUIREMENT.IGNORED,
        };
    });

    describe('writeColumn', () => {
        it('should write a column correctly', () => {
            const result = cnabWriter.writeColumn('testValue', columnConfig);
            expect(result).toBe('testValue ');
        });
        it('should substring a column value', () => {
            const result = cnabWriter.writeColumn('testValue01234', columnConfig);
            expect(result).toBe('testValue0');
        });
    });

    describe('_writeLine', () => {
        it('should write a line correctly', () => {
            const result = cnabWriter._writeLine(threeColumnsJson, threeColumnsLayout.lines.X);
            expect(result).toBe(threeLineResult);
        });

        it('should throw an error when columnLayout is undefined', () => {
            expect.assertions(1);
            expect(() => cnabWriter._writeLine(threeColumnsJson, undefined)).toThrowCode(ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);
        });
    });

    describe('writeLine', () => {
        it('should write a line correctly', () => {
            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayout);
            const result = cnabWriter.writeLine(threeColumnsJson, 'X');
            expect(result).toBe(threeLineResult);
        });

        it('should throw an error when columnLayout couldnt be found', () => {
            expect.assertions(1);
            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayout);
            expect(() => cnabWriter.writeLine(threeColumnsJson, 'XXX')).toThrowCode(ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);
        });
    });

    describe('prepareColumnValue', () => {
        it('should prepare a column value correctly', () => {
            const result = cnabWriter._prepareColumnValue('testValue', columnConfig);
            expect(result).toBe('testValue ');
        });
    });

    describe('getPadMethod', () => {
        it('should return the correct pad method for left direction', () => {
            const result = cnabWriter._getPadMethod(DIRECTION.LEFT);
            expect(result).toBe('padEnd');
        });

        it('should return the correct pad method for right direction', () => {
            const result = cnabWriter._getPadMethod(DIRECTION.RIGHT);
            expect(result).toBe('padStart');
        });
    });

    describe('checkValueUndefined', () => {
        it('should throw an error when value is undefined and required', () => {
            expect.assertions(3);
            const expectFn = (config) =>
                expect(() => cnabWriter._checkValueUndefined(undefined, config)).toThrowCode(ERROR_CODE.COLUMN_VALUE_UNDEFINED);

            let config;
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.OPTIONAL };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.REQUIRED };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.STRICT };
            expectFn(config);
        });

        it('should not throw an error when value is undefined and ignored', () => {
            const config = { ...columnConfig, required: COLUMN_REQUIREMENT.IGNORED };
            expect(() => cnabWriter._checkValueUndefined(undefined, config)).not.toThrowError();
        });
    });

    describe('checkValueFill', () => {
        it('should throw an error when value is undefined and required', () => {
            expect.assertions(2);
            const expectFn = (config) => expect(() => cnabWriter._checkValueFill('', config)).toThrowCode(ERROR_CODE.COLUMN_VALUE_EMPTY);

            let config;
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.REQUIRED };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.STRICT };
            expectFn(config);
        });

        it('should not throw an error when value is undefined and ignored', () => {
            expect.assertions(2);
            const expectFn = (config) => expect(() => cnabWriter._checkValueFill(undefined, config)).not.toThrowError();

            let config;
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.IGNORED };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.OPTIONAL };
            expectFn(config);
        });
    });

    describe('checkValueSize', () => {
        it('should throw an error when value is undefined and required', () => {
            expect.assertions(1);
            const expectFn = (config) =>
                expect(() => cnabWriter._checkValueSize(''.padStart(999, ' '), config)).toThrowCode(ERROR_CODE.COLUMN_VALUE_BIGGER_SIZE);

            const config = { ...columnConfig, required: COLUMN_REQUIREMENT.STRICT };
            expectFn(config);
        });

        it('should not throw an error when value is undefined and ignored', () => {
            expect.assertions(3);
            const expectFn = (config) => expect(() => cnabWriter._checkValueSize(undefined, config)).not.toThrowError();

            let config;
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.IGNORED };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.OPTIONAL };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.REQUIRED };
            expectFn(config);
        });
    });
});
