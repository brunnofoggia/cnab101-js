import { ColumnLayoutInterface, ColumnsLayoutInputInterface } from './column';
import { IdentificationConfigInterface } from './layout';

export interface LinesLayoutInputInterface {
    [key: string]: LineLayoutInputInterface;
}
export interface LinesLayoutInterface {
    [key: string]: LineLayoutInterface;
}

export type LayoutPropertyInputInterface = ColumnsLayoutInputInterface | string[] | ColumnLayoutInterface[];
export type LayoutPropertyInterface = ColumnLayoutInterface[];

export interface LineGenericInputInterface {
    id?: string;
    idSegment?: IdentificationConfigInterface;
    layout?: LayoutPropertyInputInterface;
}
export interface LineGenericInterface {
    id?: string;
    idSegment?: IdentificationConfigInterface;
    layout?: LayoutPropertyInterface;
}

export interface LineLayoutInputInterface extends LineGenericInputInterface {
    segments?: SegmentsInputInterface;
}
export interface LineLayoutInterface extends LineGenericInterface {
    segments?: SegmentsInterface;
}

export interface SegmentsInputInterface {
    // [key: string]: Pick<LineGenericInputInterface, 'layout'> & { id?: string };
    [key: string]: LineGenericInputInterface;
}
export interface SegmentsInterface {
    [key: string]: LineGenericInterface;
}

export type SegmentInputInterface = LineGenericInputInterface;
export type SegmentInterface = LineGenericInterface;
