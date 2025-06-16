import { LinesLayoutInputInterface, LinesLayoutInterface } from './line';

export interface IdentificationConfigInterface extends Array<number> {
    0: number;
    1: number;
    // length: 2;
}

export interface LayoutGenericInterface {
    size: number;
    autoIdentification?: boolean | number;
    sizeWithIdentification?: number;
    idLine?: IdentificationConfigInterface;
    idSegment?: IdentificationConfigInterface;
}

export interface LayoutInputInterface extends LayoutGenericInterface {
    lines: LinesLayoutInputInterface;
}
export interface LayoutInterface extends LayoutGenericInterface {
    lines: LinesLayoutInterface;
}
