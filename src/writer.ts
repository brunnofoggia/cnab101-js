import { size } from 'lodash';

import { Cnab } from './cnab';

import { ColumnLayoutInterface, ColumnsLayoutInterface } from './interface/column';

import { COLUMN_DIRECTION_PAD_METHOD, DIRECTION } from './enum/direction';
import { COLUMN_REQUIREMENT } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

import { Err } from './common/error';

export class CnabWriter extends Cnab {
    writeColumn(value_: string, config: ColumnLayoutInterface) {
        const value = this._prepareColumnValue(value_, config);
        return value;
    }

    _writeLine(json, columnsLayout: ColumnsLayoutInterface) {
        if (!size(columnsLayout)) throw new Err(`Columns layout is undefined`, ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);
        let lineText = '';

        for (const index in columnsLayout) {
            const columnLayout = columnsLayout[index];
            const value = json[columnLayout.key];
            try {
                lineText += this.writeColumn(value, columnLayout);
            } catch (error) {
                throw new Err(`Problem found when writing a line. Message: ${error.message}. Json: ${JSON.stringify(json)}`, error.code);
            }
        }

        return lineText;
    }

    writeLine(json, lineKey: string, segmentKey = '') {
        const columnsLayout = this.getLineLayout(lineKey, segmentKey);
        if (!size(columnsLayout))
            throw new Err(`Columns layout not found for line: "${lineKey}" and segment: "${segmentKey}"`, ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);

        return this._writeLine(json, columnsLayout);
    }

    _prepareColumnValue(value_: string, config: ColumnLayoutInterface) {
        // check undefined
        this._checkValueUndefined(value_, config);
        // to string
        let value = value_ === undefined ? '' : value_ + '';
        // check fill
        this._checkValueFill(value, config);
        // check length
        this._checkValueSize(value, config);

        // default is applied when config.required is ignored or optional
        if (!value) value = config.defaultValue;

        // fill
        const padMethod = this._getPadMethod(config.direction);
        value = value[padMethod](config.size, config.fill);

        if (value.length > config.size) {
            value = value.substring(0, config.size);
        }

        return value;
    }

    _checkValueUndefined(value: any, config: ColumnLayoutInterface) {
        if (config.required === COLUMN_REQUIREMENT.IGNORED) return;
        if (value === undefined) {
            throw new Err(`Value for column "${config.key}" is undefined`, ERROR_CODE.COLUMN_VALUE_UNDEFINED);
        }
    }

    _checkValueFill(value: string, config: ColumnLayoutInterface) {
        if (config.required === COLUMN_REQUIREMENT.IGNORED || config.required === COLUMN_REQUIREMENT.OPTIONAL) return;
        if (!value || !value.length) {
            throw new Err(`Value for column "${config.key}" is present but should not be empty`, ERROR_CODE.COLUMN_VALUE_EMPTY);
        }
    }

    _checkValueSize(value: string, config: ColumnLayoutInterface) {
        if (config.required !== COLUMN_REQUIREMENT.STRICT) return;
        if (value.length > config.size) {
            throw new Err(
                `Value "${value}" for column "${config.key}" is bigger than column size (${config.size})`,
                ERROR_CODE.COLUMN_VALUE_BIGGER_SIZE,
            );
        }
    }

    _getPadMethod(direction: DIRECTION) {
        return COLUMN_DIRECTION_PAD_METHOD[direction];
    }
}
