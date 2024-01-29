import { ColumnLayoutInterface } from '../src/interface/column';
import { DIRECTION } from '../src/enum/direction';
import { COLUMN_REQUIREMENT } from 'enum/columnType';

export const abcdLayout = {
    a: 'LEFT, 10, , , 0',
    b: 'LEFT, 10',
    c: 'LEFT, 10',
    d: 'LEFT, 10',
    e: 'LEFT, 10',
    p: 'LEFT, 10',
    g: 'LEFT, 10',
    h: 'LEFT, 10',
    i: 'LEFT, 10',
    j: 'LEFT, 10',
};

export const abcdLayout2 = {
    ...abcdLayout,
    a: 'LEFT, 10',
};

// Mocks de segmentos que seguem do índice 0 e cada segmento começa uma posição acima do 'end' do anterior
export const mockLayoutConfig = {
    // linha 1
    A: [
        { key: 'field1', direction: 'LEFT', position: 0, size: 3 },
        { key: 'field2', direction: 'RIGHT', position: 3, size: 2 },
        { key: 'field3', direction: 'LEFT', position: 5, size: 7 },
    ],
};

export const mockColumnA0 = mockLayoutConfig.A[0];
export const mockColumnA1 = mockLayoutConfig.A[1];

export const mockColumnAX: any = { ...mockLayoutConfig.A[0] };
mockColumnAX.position = 1;

export const mockColumnAY: any = { ...mockLayoutConfig.A[1] };
mockColumnAY.position = 1;
// mockColumnAY.fill = '0';

export const columnString1 = 'LEFT, 3, , , 0';
export const columnString2 = 'L, 3, , , 0';
export const columnString3 = 'X(3)';
export const columnString3b = [mockColumnA0.key, columnString3].join(',');
export const columnString4 = 'RIGHT,2, , , 3';
export const columnString5 = 'R,2, , , 3';
export const columnString6 = '9(2)';

// Configuração que inclui os segmentos mockados
export const mockLayout = {
    size: 12,
    lines: mockLayoutConfig,
};

export const omitColumnFields = ['end', 'defaultValue', 'fill', 'required'];
export const omitColumnFields2 = ['end', 'defaultValue', 'fill'];

export const keyLetters = ['a', 'b', 'c', 'd', 'e', 'p', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];

export function generateMockLines(layoutSize: number, segmentSize: number, position = 0): Partial<ColumnLayoutInterface>[] {
    const config: Partial<ColumnLayoutInterface>[] = [];
    let c = 0;

    while (position < layoutSize) {
        const end = position + segmentSize - 1;

        config.push({
            key: `${keyLetters[c]}`,
            direction: DIRECTION.LEFT,
            position: position,
            size: segmentSize,
            required: COLUMN_REQUIREMENT.IGNORED,
        });

        position = end + 1;
        c++;
    }

    return config;
}
