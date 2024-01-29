import { LinesLayoutInputInterface, LinesLayoutInterface } from './line';

export interface LayoutInputInterface {
    size: number;
    lines: LinesLayoutInputInterface;
}
export interface LayoutInterface {
    size: number;
    lines: LinesLayoutInterface;
}
