import { COLUMN_DIRECTION_FILL, COLUMN_DIRECTION_PAD_METHOD, DIRECTION } from './enum/direction';
import { COLUMN_TYPE_DIRECTION, COLUMN_TYPE_KEY } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import { LayoutInputInterface } from './interface/layout';
import { ColumnLayoutInterface } from './interface/column';

import { Err } from './common/error';

export abstract class PositionalTextRules {
    getLayoutSizeFromConfig(config: Partial<LayoutInputInterface>): number {
        return config.size;
    }

    // #region validations
    _checkValidObject(obj: any): boolean {
        return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
    }

    checkValidArray(obj: any): boolean {
        return Array.isArray(obj) && obj.length > 0;
    }

    validateLayout(layout): void {
        if (!this._checkValidObject(layout) || !this._checkValidObject(layout.lines)) {
            throw new Err('Invalid layout or forgot to build layout.', ERROR_CODE.LAYOUT_INVALID);
        }
    }

    _checkType(type: any) {
        if (type === undefined) {
            throw new Err(
                `Invalid type: "${type}". Type must be one of the following: ${Object.keys(COLUMN_TYPE_KEY)}.`,
                ERROR_CODE.COLUMN_TYPE_INVALID,
            );
        }
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

    _checkKeyIntoColumnString(columnOption, columnKey) {
        const isNumber = !isNaN(Number(columnKey));
        return (
            !/\(/.test(columnOption) || (isNumber && /,\s*([XA9N])\s*\(/.test(columnOption)) || (!isNumber && /^\s*([XA9N])\s*\(/.test(columnOption))
        );
        // return isNaN(Number(lineKey)) || (!isNaN(Number(lineKey)) && /[,]\s*\w\(/.test(value));
    }

    _isValidColumnLayoutEntryInterface(obj: Partial<ColumnLayoutInterface>): boolean {
        return !!obj.key && !!obj.direction && !!obj.size; // && !!(obj.position + '') && obj.fill !== '';
    }

    _validateColumnLayoutEntryInterface(columnLayout: Partial<ColumnLayoutInterface>) {
        if (!this._isValidColumnLayoutEntryInterface(columnLayout)) {
            // console.log(columnLayout);
            throw new Err(
                'Invalid column layout entry. Column layout must be define required properties: key, direction and size.',
                ERROR_CODE.COLUMN_LAYOUT_ENTRY_INVALID,
            );
        }
    }

    _isValidColumnLayoutInterface(obj: Partial<ColumnLayoutInterface>): boolean {
        return !!obj.key && !!obj.direction && !!obj.size && !isNaN(obj.position); // && obj.fill !== '';
    }

    _validateColumnLayoutInterface(columnLayout: Partial<ColumnLayoutInterface>) {
        if (!this._isValidColumnLayoutInterface(columnLayout)) {
            // console.log('problem found ', convertedLayout);
            throw new Err(
                'Invalid column config. Column layout must be an object with the following properties: { key, direction, size, defaultValue?, fill?, position? }.',
                ERROR_CODE.COLUMN_CONFIG_INVALID,
            );
        }
    }

    _checkLineLayout(lineLayout: ColumnLayoutInterface[], config): boolean {
        return this._checkLineLength(lineLayout, config) && this._checkLinePositions(lineLayout);
    }

    _checkLineLength(lineLayout: ColumnLayoutInterface[], config): boolean {
        const firstColumn = lineLayout[0];
        const lastColumn = lineLayout[lineLayout.length - 1];
        const end = lastColumn.end || this._calcEndPositionByColumn(lastColumn);
        const endComparison = firstColumn.position === 0 ? end + 1 : end;

        if (endComparison !== this.getLayoutSizeFromConfig(config)) {
            throw new Err(
                `Invalid line length. The last column (${end}) does not match with the end of layout (${config.size}).`,
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
    // #endregion

    // #region definitions
    _defineType(type: string) {
        return COLUMN_TYPE_KEY[(type + '').toUpperCase()];
    }

    _defineDirectionByType(type: COLUMN_TYPE_DIRECTION) {
        return COLUMN_TYPE_DIRECTION[type];
    }

    _defineDefaultFillByDirection(direction: DIRECTION) {
        return COLUMN_DIRECTION_FILL[direction];
    }

    _defineColumnLayoutStartPosition(position_: any, previousColumn = null): number {
        let position = position_;
        if (typeof position_ === 'undefined') {
            position = !previousColumn ? 1 : this._calcEndPositionByColumn(previousColumn) + 1;
        }

        return +position;
    }

    _defineColumnReadStartPosition(position: number): number {
        return +position - 1;
    }

    _calcEndPosition(position: number, size: number): number {
        return position + size - 1;
    }

    _calcEndPositionByColumn(column: ColumnLayoutInterface): number {
        return this._calcEndPosition(column.position, column.size);
    }

    _definePadMethod(direction: DIRECTION) {
        return COLUMN_DIRECTION_PAD_METHOD[direction];
    }
    // #endregion
}
