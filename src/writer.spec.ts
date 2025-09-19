import { CnabWriter } from './writer';
import { DIRECTION } from './enum/direction';
import { ColumnLayoutInterface } from './interface/column';
import { IdentificationConfigInterface, LayoutInputInterface } from './interface/layout';
import { COLUMN_REQUIREMENT } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import '../test/common/jest.test';
import { cloneDeep, pick } from 'lodash';

const threeColumnsLayout: Partial<LayoutInputInterface> = {
    size: 20,
    lines: {
        X: {
            layout: [
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
    },
};

const threeColumnsLayoutWithId: Partial<LayoutInputInterface> = {
    idLine: [0, 1],
    idSegment: [1, 1],
    autoIdentification: true,
    size: threeColumnsLayout.size + 1,
    lines: {
        X: {
            id: '9',
            layout: {
                _id_line: 'X(1)',
                column1: 'X(5)',
                column2: 'X(7)',
                column3: '9(8)',
            },
        },
    },
};

const threeColumnsLayoutWithIdAnotherPosition: Partial<LayoutInputInterface> = {
    idLine: [5, 1],
    autoIdentification: threeColumnsLayoutWithId.autoIdentification,
    size: threeColumnsLayoutWithId.size,
    lines: cloneDeep(threeColumnsLayoutWithId.lines),
};

threeColumnsLayoutWithIdAnotherPosition.lines.X.layout = {
    column1: 'X(5)',
    _id_line: 'X(1)',
    column2: 'X(7)',
    column3: '9(8)',
};

const threeColumnsJson = {
    column1: '123',
    column2: '4567',
    column3: '89012',
};

const threeLineResult = '123  4567   00089012';
const threeLineResultWithId = `${threeColumnsLayoutWithId.lines.X.id}123  4567   00089012`;
const threeLineResultWithIdAnotherPosition = `123  ${threeColumnsLayoutWithId.lines.X.id}4567   00089012`;

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
            const result = cnabWriter._writeLine(threeColumnsJson, threeColumnsLayout.lines.X.layout as never);
            expect(result).toBe(threeLineResult);
        });

        it('should throw an error when columnLayout is undefined', () => {
            expect.assertions(1);
            expect(() => cnabWriter._writeLine(threeColumnsJson, undefined)).toThrowCode(ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);
        });
    });

    describe('writeLineWithKeys', () => {
        it('should not throw an error when lineId is not present on layout', () => {
            expect.assertions(1);

            const cnabWriter = new CnabWriter();
            expect(() => cnabWriter.initialize(threeColumnsLayout)).not.toThrow();
        });

        it('should write a line correctly', () => {
            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayout);
            const result = cnabWriter.writeLineWithKeys(threeColumnsJson, 'X');
            expect(result).toBe(threeLineResult);
        });

        it('should throw an error when columnLayout couldnt be found', () => {
            expect.assertions(1);
            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayout);
            expect(() => cnabWriter.writeLineWithKeys(threeColumnsJson, 'XXX')).toThrowCode(ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);
        });
    });

    describe('writeLineById', () => {
        it('should throw an error when lineId is not present on layout', () => {
            expect.assertions(1);

            const lineId = threeColumnsLayoutWithId.lines.X.id;
            delete threeColumnsLayoutWithId.lines.X.id;

            const cnabWriter = new CnabWriter();
            expect(() => cnabWriter.initialize(threeColumnsLayoutWithId)).toThrowCode(ERROR_CODE.LAYOUT_LINE_INVALID);
            threeColumnsLayoutWithId.lines.X.id = lineId;
        });

        it('should throw an error when lineId is not present on data', () => {
            expect.assertions(1);
            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayoutWithId);
            expect(() => cnabWriter.writeLineById(threeColumnsJson)).toThrowCode(ERROR_CODE.ID_LINE_MISSING);
        });

        it('should write a line correctly', () => {
            const json: any = cloneDeep(threeColumnsJson);
            json._id_line = '9';

            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayoutWithId);
            const result = cnabWriter.writeLineById(json);
            expect(result).toBe(threeLineResultWithId);
        });

        it('should write a line correctly with id in another position', () => {
            const idLine = [...threeColumnsLayoutWithId.idLine] as IdentificationConfigInterface;
            threeColumnsLayoutWithId.idLine = [8, 1];

            const json: any = cloneDeep(threeColumnsJson);
            json._id_line = threeColumnsLayoutWithId.lines.X.id;

            const cnabWriter = new CnabWriter();
            cnabWriter.initialize(threeColumnsLayoutWithIdAnotherPosition);
            const result = cnabWriter.writeLineById(json);
            expect(result).toBe(threeLineResultWithIdAnotherPosition);

            threeColumnsLayoutWithId.idLine = idLine;
        });

        it('should throw error when _id_line column is not specificed', () => {
            const _id_line = (threeColumnsLayoutWithId.lines.X.layout as any)._id_line;
            delete (threeColumnsLayoutWithId.lines.X.layout as any)._id_line;
            (threeColumnsLayoutWithId.lines.X.layout as any).columnZ = 'X(1)';
            const cnabWriter = new CnabWriter();
            expect(() => cnabWriter.initialize(threeColumnsLayoutWithId)).toThrowCode(ERROR_CODE.ID_FIELD_NOT_FOUND);

            (threeColumnsLayoutWithId.lines.X.layout as any)._id_line = _id_line;
            delete (threeColumnsLayoutWithId.lines.X.layout as any).columnZ;
        });
    });

    describe('prepareColumnValue', () => {
        it('should prepare a column value correctly', () => {
            const result = cnabWriter.prepareColumnValue('testValue', columnConfig);
            expect(result).toBe('testValue ');
        });
    });

    describe('getPadMethod', () => {
        it('should return the correct pad method for left direction', () => {
            const result = cnabWriter._definePadMethod(DIRECTION.LEFT);
            expect(result).toBe('padEnd');
        });

        it('should return the correct pad method for right direction', () => {
            const result = cnabWriter._definePadMethod(DIRECTION.RIGHT);
            expect(result).toBe('padStart');
        });
    });

    describe('checkValueInvalid', () => {
        it('should throw an error when value is undefined and required', () => {
            expect.assertions(3);
            const expectFn = (config) =>
                expect(() => cnabWriter._checkValueInvalid(undefined, config)).toThrowCode(ERROR_CODE.COLUMN_VALUE_UNDEFINED);

            let config;
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.OPTIONAL };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.REQUIRED };
            expectFn(config);
            config = { ...columnConfig, required: COLUMN_REQUIREMENT.STRICT };
            expectFn(config);
        });

        it('should throw an error when value is null and required', () => {
            expect.assertions(3);
            const expectFn = (config) => expect(() => cnabWriter._checkValueInvalid(null, config)).toThrowCode(ERROR_CODE.COLUMN_VALUE_NULL);

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
            expect(() => cnabWriter._checkValueInvalid(undefined, config)).not.toThrow();
        });

        it('should not throw an error when value is null and ignored', () => {
            const config = { ...columnConfig, required: COLUMN_REQUIREMENT.IGNORED };
            expect(() => cnabWriter._checkValueInvalid(null, config)).not.toThrow();
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
            const expectFn = (config) => expect(() => cnabWriter._checkValueFill(undefined, config)).not.toThrow();

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
            const expectFn = (config) => expect(() => cnabWriter._checkValueSize(undefined, config)).not.toThrow();

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
