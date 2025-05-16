import { DIRECTION } from './enum/direction';
import { COLUMN_REQUIREMENT, COLUMN_REQUIREMENT_TYPE } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import { ColumnLayoutInterface } from './interface/column';

import { Err } from './common/error';
import { stringToJSON } from './common/vars';
import { PositionalTextRules } from './rules';

export abstract class PositionalTextColumnsBuilder extends PositionalTextRules {
    // #region column layout definitions
    _captureStringValuesLikeDoc(matches_: string[], value: string): any[] {
        const matches = [...matches_];

        // key, type(size)#, defaultValue?, fill?', position
        const hasKeyAt0 = /,\s*([XA9N])\s*\(/.test(value) ? 1 : 0;
        const changePosition = !hasKeyAt0 ? 1 : 0;
        const target = matches[hasKeyAt0];

        // key, type(size)#, defaultValue, fill, position
        const [type_, size] = target
            .toUpperCase()
            .match(/([XA9N])\s*\(\s*([0-9]+)\s*\)([*?!.])?/)
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

        if (!/([XA9N])\s*\(\s*[0-9]+\s*\)/i.test(value)) {
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
    // #endregion

    // #region build
    _buildColumnLayout(key: string, value: any, previousColumn = null): ColumnLayoutInterface {
        const buildMethod = typeof value === 'string' ? '_buildColumnByString' : '_buildColumnByObject';
        const column = this[buildMethod](key, value, previousColumn);

        return column;
    }

    _buildColumnByObject(key: string, value: any, previousColumn = null): ColumnLayoutInterface {
        const item: ColumnLayoutInterface = { ...value };
        if (!item.key && isNaN(Number(key))) item.key = key;

        return this._prepareColumnLayout(item, previousColumn);
    }

    _buildColumnByString(columnKey: string, columnOption: string, previousColumn = null): ColumnLayoutInterface {
        // if (!isNaN(Number(lineKey)) && !/\(/.test(value)) {
        // if (isNumber(Number(lineKey)) && !/\(/.test(value)) {
        if (!this._checkKeyIntoColumnString(columnOption, columnKey)) {
            console.log(`columnKey: ${columnKey}`);
            console.log(`columnOption: ${columnOption}`);

            throw new Err('Invalid key. Key cannot be a number if key is not present into column description.', ERROR_CODE.COLUMN_KEY_INVALID);
        }

        const matches = this._captureStringValues(columnOption);

        if (matches?.length < 2) {
            throw new Err("Invalid column data. Required fields are: direction/type and size.'", ERROR_CODE.COLUMN_DATA_MISSING);
        }

        const [direction, size, defaultValue, fill, position, key, required] = matches;
        return this._prepareColumnLayout(
            {
                key: key || columnKey,
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

    _prepareColumnLayout(columnLayout: Partial<ColumnLayoutInterface>, previousColumn = null): ColumnLayoutInterface {
        this._validateColumnLayoutEntryInterface(columnLayout);

        const direction: DIRECTION = DIRECTION[columnLayout.direction.toUpperCase()];
        this._checkDirection(direction);

        const size = +columnLayout.size;
        const position = this._defineColumnLayoutStartPosition(columnLayout.position, previousColumn);
        const defaultValue = columnLayout.defaultValue || '';
        const fill = columnLayout.fill || this._defineDefaultFillByDirection(direction);
        const required = (columnLayout.required || COLUMN_REQUIREMENT.IGNORED) as COLUMN_REQUIREMENT_TYPE;

        const convertedLayout: ColumnLayoutInterface = {
            key: columnLayout.key,
            direction,
            position: position,
            size: size,
            end: this._calcEndPosition(position, size),
            fill,
            required,
            ...this._prepareDefaultValue(defaultValue),
        };
        this._validateColumnLayoutInterface(convertedLayout);

        return convertedLayout;
    }

    _prepareDefaultValue(defaultValue: string): any {
        const _defaultValue = 'defaultValue=' + (defaultValue || '');
        const result = stringToJSON({ input: _defaultValue });

        return {
            defaultValue: result.defaultValue,
            // replaceValues: omit(result, 'defaultValue'),
        };
    }

    _prepareColumnValue(value_: string, config: ColumnLayoutInterface) {
        // to string
        let value = value_;

        // default is applied when config.required is ignored or optional
        if (!value) value = config.defaultValue;

        // fill
        const padMethod = this._definePadMethod(config.direction);
        value = value[padMethod](config.size, config.fill);

        if (value.length > config.size) {
            value = value.substring(0, config.size);
        }

        return value;
    }
    // #endregion
}
