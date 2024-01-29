import { DIRECTION } from '../enum/direction';
import { COLUMN_REQUIREMENT_TYPE } from '../enum/columnType';

export interface ColumnsLayoutInputInterface {
    [key: number]: string | ColumnLayoutInterface;
}

export interface ColumnsLayoutInterface {
    [key: number]: ColumnLayoutInterface;
}

export interface ColumnLayoutInterface {
    key: string;
    direction: DIRECTION;
    position: number;
    size: number;
    end: number;
    fill: string;
    defaultValue: string;
    required: COLUMN_REQUIREMENT_TYPE;
}
