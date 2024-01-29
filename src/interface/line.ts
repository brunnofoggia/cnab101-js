import { ColumnLayoutInterface, ColumnsLayoutInputInterface } from './column';

export interface LinesLayoutInputInterface {
    [key: string]: LineLayoutInputInterface;
}
export interface LinesLayoutInterface {
    [key: string]: LineLayoutInterface;
}

export type LayoutPropertyInputInterface = string[] | ColumnsLayoutInputInterface | ColumnLayoutInterface[];
export type LayoutPropertyInterface = ColumnLayoutInterface[];

export interface LineGenericInputInterface {
    layout?: LayoutPropertyInputInterface;
}
export interface LineGenericInterface {
    layout?: LayoutPropertyInterface;
}

export interface LineLayoutInputInterface extends LineGenericInputInterface {
    segments?: SegmentsInputInterface;
}
export interface LineLayoutInterface extends LineGenericInterface {
    segments?: SegmentsInterface;
}

export interface SegmentsInputInterface {
    [key: string]: Pick<LineGenericInputInterface, 'layout'>;
}
export interface SegmentsInterface {
    [key: string]: Pick<LineGenericInterface, 'layout'>;
}

export type SegmentInputInterface = LineGenericInputInterface;
export type SegmentInterface = LineGenericInterface;
