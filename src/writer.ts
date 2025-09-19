import { size } from 'lodash';

import { Cnab } from './cnab';
import { Err } from './common/error';

import { ColumnLayoutInterface, ColumnsLayoutInterface } from './interface/column';
import { LayoutPropertyInterface, LineLayoutInterface } from './interface/line';

import { COLUMN_REQUIREMENT } from './enum/columnType';
import { ERROR_CODE } from './enum/error';

export class CnabWriter extends Cnab {
    writeColumn(value_: string, config: ColumnLayoutInterface) {
        const value = this.prepareColumnValue(value_, config);
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

    writeLineWithKeys(json, lineKey: string, segmentKey = '') {
        const columnsLayout = this.getLineLayout(lineKey, segmentKey);
        if (!size(columnsLayout))
            throw new Err(`Columns layout not found for line: "${lineKey}" and segment: "${segmentKey}"`, ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);

        return this._writeLine(json, columnsLayout);
    }

    writeLineById(json) {
        const { layoutConfig: columnsLayout, lineKey, segmentKey } = this.defineLineAndSegmentLayoutById(json);
        if (!size(columnsLayout))
            throw new Err(`Columns layout not found for line: "${lineKey}" and segment: "${segmentKey}"`, ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);

        return this._writeLine(json, columnsLayout);
    }

    writeLine(json, lineKey = '', segmentKey = '') {
        if ((!lineKey && !segmentKey) || this.isAutoIdentificationActivated(this.layout)) {
            return this.writeLineById(json);
        }

        return this.writeLineWithKeys(json, lineKey, segmentKey);
    }

    prepareColumnValue(value_: string, config: ColumnLayoutInterface) {
        // check undefined
        this._checkValueInvalid(value_, config);
        // to string
        const value = value_ === undefined || value_ === null ? '' : value_ + '';
        // check fill
        this._checkValueFill(value, config);
        // check length
        this._checkValueSize(value, config);

        return this._prepareColumnValue(value, config);
    }

    _checkValueInvalid(value: any, config: ColumnLayoutInterface) {
        if (config.required === COLUMN_REQUIREMENT.IGNORED) return;
        if (value === undefined) {
            throw new Err(`Value for column "${config.key}" is undefined`, ERROR_CODE.COLUMN_VALUE_UNDEFINED);
        }
        if (value === null) {
            throw new Err(`Value for column "${config.key}" is NULL`, ERROR_CODE.COLUMN_VALUE_NULL);
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

    // #region Identification
    defineLineLayoutById(json: any) {
        const lineId = json['_id_line'];
        if (!lineId) throw new Err(`Line id is missing`, ERROR_CODE.ID_LINE_MISSING);

        const lineData = this.defineKeyById(lineId, this.layout.lines);
        this.checkLineLayout(lineId, lineData?.itemConfig);
        const { itemKey: lineKey, itemConfig: lineConfig } = lineData;

        return { lineId, lineKey, lineConfig };
    }

    defineSegmentLayoutById(json: any, lineConfig: LineLayoutInterface) {
        let segmentId, segmentKey, segmentConfig;
        if (lineConfig.segments) {
            segmentId = json._id_segment || null;
            if (!segmentId) throw new Err(`Segment id is missing`, ERROR_CODE.ID_SEGMENT_MISSING);

            const segmentData = this.defineKeyById(segmentId, lineConfig.segments);
            this.checkSegmentLayout(segmentId, segmentData?.itemConfig);
            segmentKey = segmentData.itemKey;
            segmentConfig = segmentData.itemConfig;
        }

        return { segmentKey, segmentConfig };
    }

    defineLineAndSegmentLayoutById(json: any) {
        const { lineId, lineKey, lineConfig } = this.defineLineLayoutById(json);
        let segmentKey = null,
            segmentConfig = null;

        let layoutConfig: LayoutPropertyInterface = lineConfig.layout;
        if (size(lineConfig.segments)) {
            const segmentData = this.defineSegmentLayoutById(json, lineConfig);
            segmentKey = segmentData.segmentKey;
            segmentConfig = segmentData.segmentConfig;

            layoutConfig = segmentConfig.layout;
        }

        return { lineId, lineKey, lineConfig, segmentKey, segmentConfig, layoutConfig };
    }
    // #endregion
}
