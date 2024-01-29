import { COLUMN_DIRECTION_FILL, DIRECTION } from './enum/direction';
import { COLUMN_REQUIREMENT, COLUMN_REQUIREMENT_TYPE, COLUMN_TYPE_DIRECTION, COLUMN_TYPE_KEY } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import { ColumnLayoutInterface } from './interface/column';
import { LayoutInputInterface, LayoutInterface } from './interface/layout';
import { LayoutPropertyInputInterface, LayoutPropertyInterface, SegmentInputInterface } from './interface/line';

import { Err } from './common/error';

export class Cnab {
    config: LayoutInputInterface;
    layout: LayoutInterface;

    initialize(config: any): void {
        this._setConfig(config);
        this._buildLayout();
    }

    _setConfig(config: any): void {
        this.config = config;
        this.layout = {
            size: this.config.size || 0,
            lines: {},
        };
    }

    _checkValidObject(obj: any): boolean {
        return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
    }

    checkValidArray(obj: any): boolean {
        return Array.isArray(obj) && obj.length > 0;
    }

    checkLayout(): void {
        if (!this._checkValidObject(this.layout) || !this._checkValidObject(this.layout.lines)) {
            throw new Err('Invalid layout or forgot to build layout.', ERROR_CODE.LAYOUT_INVALID);
        }
    }

    _buildLayout(): void {
        const lines = this._buildLayoutLines(this.config.lines);
        this.layout.lines = lines;
    }

    _buildLayoutLines(layoutLines) {
        if (!this._checkValidObject(layoutLines)) {
            throw new Err('Invalid layout lines. Lines must be an object with content.', ERROR_CODE.LAYOUT_LINES_INVALID);
        }

        const layoutConfig: any = {};
        for (const index in layoutLines) {
            const item_ = layoutLines[index];
            layoutConfig[index] = this._buildLine(item_);
        }

        return layoutConfig;
    }

    _buildLine(line) {
        if (Array.isArray(line)) line = { layout: line };

        const lineOptions: any = {};
        if (line?.layout) lineOptions.layout = this._buildLineLayout(line.layout);
        if (line?.segments) {
            lineOptions.segments = this._buildSegments(line.segments);
        }

        return lineOptions;
    }

    _buildSegments(segments_) {
        const segments = {};
        for (const index in segments_) {
            const segment_: SegmentInputInterface = segments_[index];
            const lineLayout: ColumnLayoutInterface[] = this._buildLineLayout(segment_.layout);

            segments[index] = { layout: lineLayout };
        }

        return segments;
    }

    _buildLineLayout(layout_: LayoutPropertyInputInterface): ColumnLayoutInterface[] {
        if (!this._checkValidObject(layout_) && !this.checkValidArray(layout_)) {
            throw new Err('Invalid line layout. Line layout must be a non-empty array or an object.', ERROR_CODE.LAYOUT_LINE_INVALID);
        }

        const lineLayout: ColumnLayoutInterface[] = [];
        let previousColumn: ColumnLayoutInterface;
        for (const index in layout_) {
            const column = layout_[index];
            const columnLayout: ColumnLayoutInterface = this._buildColumnLayout(index + '', column, previousColumn);

            lineLayout.push(columnLayout);
            previousColumn = { ...columnLayout };
        }

        lineLayout.sort((a, b) => a.position - b.position);

        this._checkLineLayout(lineLayout);
        return lineLayout;
    }

    _buildColumnLayout(key: string, value: any, previousColumn = null): ColumnLayoutInterface {
        let column: ColumnLayoutInterface;

        if (typeof value === 'string') {
            column = this._buildColumnByString(key, value, previousColumn);
        } else {
            column = this._buildColumnByObject(key, value, previousColumn);
        }

        return column;
    }

    _buildColumnByObject(key: string, value: any, previousColumn = null): ColumnLayoutInterface {
        const item: ColumnLayoutInterface = { ...value };

        if (!item.key && isNaN(Number(key))) {
            item.key = key;
        }

        return this._prepareColumnLayout(item, previousColumn);
    }

    _defineType(type: string) {
        return COLUMN_TYPE_KEY[(type + '').toUpperCase()];
    }

    _checkType(type: any) {
        if (type === undefined) {
            throw new Err(
                `Invalid type: "${type}". Type must be one of the following: ${Object.keys(COLUMN_TYPE_KEY)}.`,
                ERROR_CODE.COLUMN_TYPE_INVALID,
            );
        }
    }

    _defineDirectionByType(type: COLUMN_TYPE_DIRECTION) {
        return COLUMN_TYPE_DIRECTION[type];
    }

    _checkDirection(direction: any) {
        if (direction === undefined) {
            throw new Err(
                `Invalid direction: "${direction}". Type must be one of the following: ${Object.keys(DIRECTION)}.`,
                ERROR_CODE.COLUMN_DIRECTION_INVALID,
            );
        }
    }

    _checkTypeAndSize(value: string) {
        if (!/([X9])\s*\(\s*(\d+)\s*\)/.test(value)) {
            throw new Err(
                `Invalid type(size). Value must be a string with the following format: 'type(size). input: ${value}`,
                ERROR_CODE.COLUMN_TYPE_SIZE_INVALID,
            );
        }
    }

    _captureStringValuesLikeDoc(matches_: string[], value: string): any[] {
        const matches = [...matches_];

        // key, type(size)#, defaultValue?, fill?', position
        const hasKeyAt0 = /,\s*([X9])\s*\(/.test(value) ? 1 : 0;
        const changePosition = !hasKeyAt0 ? 1 : 0;
        const target = matches[hasKeyAt0];

        // key, type(size)#, defaultValue, fill, position
        const [type_, size] = target
            .toUpperCase()
            .match(/([X9])\s*\(\s*([0-9]+)\s*\)([*?!.])?/)
            .slice(1);

        // set type
        const type = this._defineType(type_);
        this._checkType(type);

        // set key
        matches[5] = hasKeyAt0 ? matches[0] : undefined;
        // set requirement
        matches[6] = this._captureRequired(target);

        // set direction
        matches[0] = this._defineDirectionByType(type);

        // position to be defined later
        matches[4] = matches[4 - changePosition] || undefined;

        // reorder defaultValue and fill
        // fill
        matches[3] = matches[3 - changePosition];
        // defaultValue
        matches[2] = matches[2 - changePosition];

        // set size
        matches[1] = size;

        return matches;
    }

    _captureStringValues(value: string): any[] {
        // direction, size, defaultValue, fill, position
        const matches = value.split(',').map((v) => v.trim().replace(/"/g, ''));
        if (!/([X9])\s*\(\s*[0-9]+\s*\)/.test(value)) {
            matches[5] = undefined;
            matches[6] = this._captureRequired(matches[0]);
            // clean required from direction
            matches[0] = matches[0].replace(/([*?!.])$/, '');
            return matches;
        }

        return this._captureStringValuesLikeDoc(matches, value);
    }

    _captureRequired(value: string): string {
        const matches = value.match(/^.+([*?!.])$/);
        return matches?.length ? matches[1] || undefined : undefined;
    }

    _checkKeyIntoColumnString(value, lineKey) {
        const isNumber = !isNaN(Number(lineKey));
        return !/\(/.test(value) || (isNumber && /,\s*([X9])\s*\(/.test(value)) || (!isNumber && /^\s*([X9])\s*\(/.test(value));
        // return isNaN(Number(lineKey)) || (!isNaN(Number(lineKey)) && /[,]\s*\w\(/.test(value));
    }

    _buildColumnByString(lineKey: string, value: any, previousColumn = null): ColumnLayoutInterface {
        // if (!isNaN(Number(lineKey)) && !/\(/.test(value)) {
        // if (isNumber(Number(lineKey)) && !/\(/.test(value)) {
        if (!this._checkKeyIntoColumnString(value, lineKey)) {
            throw new Err('Invalid key. Key cannot be a number if key is not present into column description.', ERROR_CODE.COLUMN_KEY_INVALID);
        }

        const matches = this._captureStringValues(value);

        if (matches?.length < 2) {
            throw new Err("Invalid column data. Required fields are: direction/type and size.'", ERROR_CODE.COLUMN_DATA_MISSING);
        }

        const [direction, size, defaultValue, fill, position, key, required] = matches;
        return this._prepareColumnLayout(
            {
                key: key || lineKey,
                direction,
                size,
                position,
                defaultValue,
                fill,
                required,
            },
            previousColumn,
        );
    }

    _isValidColumnLayoutEntryInterface(obj: Partial<ColumnLayoutInterface>): boolean {
        return !!obj.key && !!obj.direction && !!obj.size; // && !!(obj.position + '') && obj.fill !== '';
    }

    _isValidColumnLayoutInterface(obj: Partial<ColumnLayoutInterface>): boolean {
        return !!obj.key && !!obj.direction && !!obj.size && !isNaN(obj.position); // && obj.fill !== '';
    }

    _defineDefaultFillByDirection(direction: DIRECTION) {
        return COLUMN_DIRECTION_FILL[direction];
    }

    _defineColumnPosition(position_: any, previousColumn = null): number {
        let position = position_;
        if (typeof position_ === 'undefined') {
            position = !previousColumn ? 1 : this._calcEndPositionByColumn(previousColumn) + 1;
        }

        return +position;
    }

    _prepareColumnLayout(columnLayout: Partial<ColumnLayoutInterface>, previousColumn = null): ColumnLayoutInterface {
        if (!this._isValidColumnLayoutEntryInterface(columnLayout)) {
            // console.log(columnLayout);
            throw new Err(
                'Invalid column layout entry. Column layout must be define required properties: key, direction and size.',
                ERROR_CODE.COLUMN_LAYOUT_ENTRY_INVALID,
            );
        }

        const direction: DIRECTION = DIRECTION[columnLayout.direction.toUpperCase()];
        this._checkDirection(direction);

        const size = +columnLayout.size;
        const position = this._defineColumnPosition(columnLayout.position, previousColumn);
        const defaultValue = columnLayout.defaultValue || '';
        const fill = columnLayout.fill || this._defineDefaultFillByDirection(direction);
        const required = (columnLayout.required || COLUMN_REQUIREMENT.IGNORED) as COLUMN_REQUIREMENT_TYPE;

        const convertedLayout: ColumnLayoutInterface = {
            key: columnLayout.key,
            direction,
            position: position,
            size: size,
            end: this._calcEndPosition(position, size),
            defaultValue,
            fill,
            required,
        };

        if (!this._isValidColumnLayoutInterface(convertedLayout)) {
            // console.log('problem found ', convertedLayout);
            throw new Err(
                'Invalid column config. Column layout must be an object with the following properties: { key, direction, size, defaultValue?, fill?, position? }.',
                ERROR_CODE.COLUMN_CONFIG_INVALID,
            );
        }

        return convertedLayout;
    }

    _calcEndPosition(position: number, size: number): number {
        return position + size - 1;
    }

    _calcEndPositionByColumn(column: ColumnLayoutInterface): number {
        return this._calcEndPosition(column.position, column.size);
    }

    _checkLineLayout(lineLayout: ColumnLayoutInterface[]): boolean {
        return this._checkLineLength(lineLayout) && this._checkLinePositions(lineLayout);
    }

    _checkLineLength(lineLayout: ColumnLayoutInterface[]): boolean {
        const firstColumn = lineLayout[0];
        const lastColumn = lineLayout[lineLayout.length - 1];
        const end = lastColumn.end || this._calcEndPositionByColumn(lastColumn);
        const endComparison = firstColumn.position === 0 ? end + 1 : end;

        if (endComparison !== this.layout.size) {
            throw new Err(
                `Invalid line length. The last column (${end}) does not reach the end of the layout (${this.layout.size}).`,
                ERROR_CODE.LINE_LENGTH_INVALID,
            );
        }

        return true;
    }

    _checkLinePositions(lineLayout: ColumnLayoutInterface[]): boolean {
        for (let i = 1; i < lineLayout.length; i++) {
            const previousColumn = lineLayout[i - 1];
            const currentColumn = lineLayout[i];
            const previousEnd = previousColumn.end || this._calcEndPositionByColumn(previousColumn);
            const endComparison = previousEnd + 1;

            if (endComparison !== currentColumn.position) {
                // console.log(previousColumn, currentColumn);
                throw new Err(
                    'Invalid column positions. The end of the previous column is not one number less than the position of the current column.',
                    ERROR_CODE.COLUMN_POSITION_INVALID,
                );
            }
        }

        return true;
    }

    getLineLayout(lineKey: string, segmentKey = ''): LayoutPropertyInterface {
        const lineConfig = !segmentKey ? this.layout.lines[lineKey] : this.layout.lines[lineKey].segments[segmentKey];
        return lineConfig?.layout;
    }
}
