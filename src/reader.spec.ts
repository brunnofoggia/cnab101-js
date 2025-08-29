import { CnabReader } from './reader';
import { ColumnLayoutInterface, ColumnsLayoutInterface } from './interface/column';
import { ERROR_CODE } from './enum/error';

import '../test/common/jest.test';
import { itau_header_arquivo_json, itau_header_arquivo_line, itau240 } from '../test/layout-240.test';
import { banese240, banese_header_arquivo_json, banese_header_arquivo_line } from '../test/layout-banese-240.test';

import { DIRECTION } from './enum/direction';

const columnsLayout = {
    0: { direction: DIRECTION.LEFT, position: 1, end: 3, key: 'first' },
    1: { direction: DIRECTION.LEFT, position: 4, end: 6, key: 'second' },
    2: { direction: DIRECTION.LEFT, position: 7, end: 10, key: 'third' },
};

describe('CnabReader', () => {
    let cnabReader: CnabReader;

    beforeEach(() => {
        cnabReader = new CnabReader();
    });

    describe('readColumn', () => {
        it('should correctly extract a substring based on column layout configuration', () => {
            expect.assertions(3);
            const line = '1234567890';
            const results = ['123', '456', '7890'];

            for (const index in columnsLayout) {
                const columnLayout = columnsLayout[+index] as ColumnLayoutInterface;
                const result = cnabReader.readColumn(line, columnLayout as ColumnLayoutInterface);
                expect(result).toBe(results[+index]);
            }
        });
    });

    describe('_readLine', () => {
        it('should correctly parse a line based on the columns layout', () => {
            const line = '1234567890';
            // jest.spyOn(cnabReader, 'readColumn').mockImplementation((line, config) => line.substring(config.position - 1, config.end));

            const result = cnabReader['_readLine'](line, columnsLayout as any);

            expect(result).toEqual({
                first: '123',
                second: '456',
                third: '7890',
            });
        });
    });

    describe('_readLineWithLayout', () => {
        it('should correctly parse a line using the provided columns layout', () => {
            const line = '1234567890';
            const result = cnabReader._readLine(line, columnsLayout as any);
            expect(result).toEqual({
                first: '123',
                second: '456',
                third: '7890',
            });
        });
    });

    describe('_readLineWithKeys', () => {
        it('should correctly parse a line using the provided lineKey and segmentKey', () => {
            const line = '1234567890';
            const lineKey = 'lineKey';
            const segmentKey = 'segmentKey';
            const layout = {
                lines: {},
                size: null,
            };
            layout.lines[lineKey] = { segments: {} };
            layout.lines[lineKey].segments[segmentKey] = { layout: columnsLayout };
            cnabReader.layout = layout;

            const result = cnabReader.readLineWithKeys(line, lineKey, segmentKey);

            expect(result.json).toEqual({
                first: '123',
                second: '456',
                third: '7890',
            });
        });
    });

    describe('readLineById', () => {
        it('should correctly read a line and return the parsed JSON (itau240)', () => {
            expect.assertions(4);

            const line = itau_header_arquivo_line;
            const layoutInput = itau240;
            cnabReader.initialize(layoutInput);

            const result = cnabReader.readLineById(line);
            expect(result).toHaveProperty('json');

            expect(result.lineId).toBe('0');
            expect(result.lineKey).toBe('header_arquivo');

            expect(result.json).toStrictEqual(itau_header_arquivo_json);
        });

        it('should correctly read a line and return the parsed JSON (banese240)', () => {
            expect.assertions(4);

            const layoutInput = banese240;
            cnabReader.initialize(layoutInput);

            const result = cnabReader.readLineById(banese_header_arquivo_line);
            expect(result).toHaveProperty('json');

            expect(result.lineId).toBe('0');
            expect(result.lineKey).toBe('header_arquivo');

            expect(result.json).toStrictEqual(banese_header_arquivo_json);
        });

        it('should throw an error if the line ID is NOT LOCATED', () => {
            const line = 'some random line';
            const layoutInput = itau240;
            cnabReader.initialize(layoutInput);

            expect(() => cnabReader.readLineById(line)).toThrowCode(ERROR_CODE.ID_LINE_NOT_FOUND);
        });

        it('should throw an error if the line is incomplete', () => {
            const line = '00some incomplete line with ids first';
            const layoutInput = itau240;
            cnabReader.initialize(layoutInput);

            expect(() => cnabReader.readLineById(line)).toThrowCode(ERROR_CODE.LINE_LENGTH_INVALID);
        });
    });
});
