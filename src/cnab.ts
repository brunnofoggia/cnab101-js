import { ERROR_CODE } from './enum/error';

import { IdentificationConfigInterface, LayoutInputInterface } from './interface/layout';
import { LayoutPropertyInterface, LineLayoutInterface, LinesLayoutInputInterface } from './interface/line';

import { Err } from './common/error';
import { PositionalText } from './positionaltext';
import { ColumnLayoutInterface } from './interface/column';

export class Cnab extends PositionalText {
    // #region identification
    defaultLineIdentification: IdentificationConfigInterface = [0, 1];
    defaultSegmentIdentification: IdentificationConfigInterface = [1, 1];

    locateIdentificationField(lineLayout: LayoutPropertyInterface): undefined | ColumnLayoutInterface {
        return lineLayout.find((column: ColumnLayoutInterface) => {
            return column.key === '_id_line';
        });
    }

    validateLineLayout(lineOptions: LineLayoutInterface, config: Partial<LayoutInputInterface>): void {
        super.validateLineLayout(lineOptions, config);
        if (this.isAutoIdentificationActivated(config) && lineOptions.layout) {
            const idConfig = this.locateIdentificationField(lineOptions.layout);
            if (!idConfig) {
                throw new Err(`Invalid line layout. Identification field not found.`, ERROR_CODE.ID_FIELD_NOT_FOUND);
            }
        }
    }

    checkIdentification(idConfig: IdentificationConfigInterface): boolean {
        return Array.isArray(idConfig) && idConfig.length === 2;
    }

    validateIdentification(idConfig: IdentificationConfigInterface) {
        if (!this.checkIdentification(idConfig)) {
            throw new Err(`Invalid id definition. Must be an Array with 2 items (start and length)`, ERROR_CODE.ID_POSITION_CONFIG_INVALID);
        }
    }

    _checkLayoutItemId(item: any): boolean {
        const itemId = item.id;
        if (!itemId) {
            return false;
        }

        return true;
    }

    _validateLayoutItemId(item: LinesLayoutInputInterface): void {
        if (!this._checkLayoutItemId(item)) {
            throw new Err('Invalid line id. Line id cannot be empty.', ERROR_CODE.LAYOUT_LINE_INVALID);
        }
    }

    _validateLayoutItem(item: LinesLayoutInputInterface, config: Partial<LayoutInputInterface>): void {
        if (this.isAutoIdentificationActivated(config)) {
            this._validateLayoutItemId(item);
        }
        super._validateLayoutItem(item, config);
    }

    isAutoIdentificationActivated(layoutConfig: Partial<LayoutInputInterface>): boolean {
        return !!layoutConfig?.autoIdentification;
    }

    getLineIdentificationOrDefault(idConfig: IdentificationConfigInterface): IdentificationConfigInterface {
        if (this.checkIdentification(idConfig)) return idConfig;
        const layoutConfig = this.layout;
        if (!this.isAutoIdentificationActivated(layoutConfig)) return null;
        return [...this.defaultLineIdentification] as IdentificationConfigInterface;
    }

    getSegmentIdentificationOrDefault(idConfig: IdentificationConfigInterface): IdentificationConfigInterface {
        if (this.checkIdentification(idConfig)) return idConfig;
        const layoutConfig = this.layout;
        if (!this.isAutoIdentificationActivated(layoutConfig)) return null;
        return [...this.defaultSegmentIdentification] as IdentificationConfigInterface;
    }

    defineKeyById(id: string, layoutItems) {
        for (const itemKey in layoutItems) {
            const itemConfig: LineLayoutInterface = layoutItems[itemKey];

            if (itemConfig.id + '' === id) {
                return { itemKey, itemConfig };
            }
        }
        throw new Err(`No matching layout key/config found for ID: "${id}"`, ERROR_CODE.ID_NOT_FOUND);
    }
    // #endregion
}
