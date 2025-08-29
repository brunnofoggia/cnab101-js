import { size } from 'lodash';

import { Cnab } from './cnab';

import { ColumnLayoutInterface, ColumnsLayoutInterface } from './interface/column';
import { IdentificationConfigInterface } from './interface/layout';
import { LineGenericInterface, LineLayoutInterface } from './interface/line';

import { ERROR_CODE } from './enum/error';
import { Err } from './common/error';

export class CnabReader extends Cnab {
    // #region Readers
    readColumn(line: string, config: ColumnLayoutInterface) {
        const start = this._defineColumnReadStartPosition(config.position);
        const value = line.substring(start, config.end);
        return this._prepareColumnValue(value, config);
    }

    // readColumn(line: string, config: ColumnLayoutInterface) {
    //     // this.validateColumnLayout(config);
    //     return this._readColumn(line, config);
    // }

    _readLine(line: string, columnsLayout: ColumnsLayoutInterface) {
        const json = {};

        let lastColumnEnd: number = 0;

        // let start = 0;
        for (const index in columnsLayout) {
            const columnLayout = columnsLayout[index];
            // const end = start + columnLayout.size;
            // const value = line.substring(start, end);
            json[columnLayout.key] = this.readColumn(line, columnLayout);
            // start = end;
            lastColumnEnd = columnLayout.end;
        }

        if (line.length < lastColumnEnd) {
            throw new Err(`Line is incomplete. Line length: ${line.length}. Length expected ${lastColumnEnd}`, ERROR_CODE.LINE_LENGTH_INVALID);
        }

        return json;
    }

    readLineWithKeys(line: string, lineKey: string, segmentKey = '') {
        const columnsLayout = this.getLineLayout(lineKey, segmentKey);
        if (!size(columnsLayout))
            throw new Err(`Columns layout not found for line: "${lineKey}" and segment: "${segmentKey}"`, ERROR_CODE.COLUMN_LAYOUT_NOT_FOUND);

        const lineConfig = this.layout.lines[lineKey];
        const segmentConfig = segmentKey ? lineConfig?.segments?.[segmentKey] : null;
        const layoutConfig = segmentConfig?.layout || lineConfig.layout;
        return { lineKey, lineConfig, segmentKey, segmentConfig, layoutConfig, json: this._readLine(line, columnsLayout) };
    }

    readLineById(line: string) {
        const { lineId, lineKey, lineConfig, segmentId, segmentKey, segmentConfig, layoutConfig } = this.defineLineAndSegmentLayoutById(line);

        const json = this._readLine(line, layoutConfig);
        return { lineId, lineKey, lineConfig, segmentId, segmentKey, segmentConfig, layoutConfig, json };
    }

    readLine(json, lineKey = '', segmentKey = '') {
        if (!lineKey && this.isAutoIdentificationActivated(this.layout)) {
            return this.readLineById(json);
        }

        return this.readLineWithKeys(json, lineKey, segmentKey);
    }
    // #endregion

    // #region Identification
    findIdentification(line: string, idConfig: IdentificationConfigInterface) {
        let idFound = null;
        this.validateIdentification(idConfig);

        const [start, length] = idConfig;
        const end = start + length;
        idFound = line.substring(start, end);

        return idFound;
    }

    defineLineLayoutById(line: string): { lineId: string; lineKey: string; lineConfig: LineLayoutInterface } {
        const idConfig = this.getLineIdentificationOrDefault(this.layout.idLine);
        const lineId = this.findIdentification(line, idConfig);

        const lineData = this.defineKeyById(lineId, this.layout.lines);
        this.checkLineLayout(lineId, lineData?.itemConfig);
        const { itemKey: lineKey, itemConfig: lineConfig } = lineData;

        return { lineId, lineKey, lineConfig };
    }

    defineSegmentLayoutById(line: string, lineConfig): { segmentId: string; segmentKey: string; segmentConfig: LineGenericInterface } {
        let segmentId, segmentKey, segmentConfig;
        if (lineConfig.segments) {
            const idConfig = this.getSegmentIdentificationOrDefault(lineConfig.idSegment || this.layout.idSegment);
            const segmentId = this.findIdentification(line, idConfig);

            const segmentData = this.defineKeyById(segmentId, lineConfig.segments);
            this.checkSegmentLayout(segmentId, segmentData?.itemConfig);
            segmentKey = segmentData.itemKey;
            segmentConfig = segmentData.itemConfig;
        }

        return { segmentId, segmentKey, segmentConfig };
    }

    defineLineAndSegmentLayoutById(line: string) {
        const { lineId, lineKey, lineConfig } = this.defineLineLayoutById(line);
        const { segmentId, segmentKey, segmentConfig } = this.defineSegmentLayoutById(line, lineConfig);

        let layoutConfig = lineConfig.layout;
        if (size(lineConfig.segments)) {
            layoutConfig = segmentConfig.layout;
        }

        return { lineId, lineKey, lineConfig, segmentId, segmentKey, segmentConfig, layoutConfig };
    }
    // #endregion
}
