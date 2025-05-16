import { omit, pick } from 'lodash';

import { PositionalTextColumnsBuilder } from './builder';

import {
    LayoutPropertyInputInterface,
    LayoutPropertyInterface,
    LineGenericInputInterface,
    LineLayoutInterface,
    LinesLayoutInputInterface,
    SegmentInputInterface,
} from './interface/line';
import { ColumnLayoutInterface } from './interface/column';
import { LayoutInputInterface, LayoutInterface } from './interface/layout';

import { Err } from './common/error';
import { ERROR_CODE } from './enum/error';

export class PositionalText extends PositionalTextColumnsBuilder {
    config: LayoutInputInterface;
    layout: LayoutInterface;

    initialize(config: Partial<LayoutInputInterface>): void {
        this._setConfig(config);
        this._buildLayout();
    }

    _setConfig(config: any): void {
        this.config = config;
        this.config.size = this.config.size || 0;

        this.layout = {
            ...omit(this.config, 'lines'),
            lines: {},
        };
    }

    _buildLayout(): void {
        const lines = this._buildLayoutLines(this.config.lines, omit(this.layout, 'lines'));
        this.layout.lines = lines;
    }

    _buildLayoutLines(layoutLines: LinesLayoutInputInterface, config: Partial<LayoutInputInterface>) {
        if (!this._checkValidObject(layoutLines)) {
            throw new Err('Invalid layout lines. Lines must be an object with content.', ERROR_CODE.LAYOUT_LINES_INVALID);
        }

        const layoutConfig: any = {};
        for (const index in layoutLines) {
            const item_ = layoutLines[index];

            try {
                layoutConfig[index] = this._buildLine(item_, config);
            } catch (error) {
                error.message = `Error building line "${index}": ${error.message}`;
                throw error;
            }
        }

        return layoutConfig;
    }

    _validateLayoutItem(item: LinesLayoutInputInterface, config: Partial<LayoutInputInterface>): void {}

    _buildLayoutItem(item, config: Partial<LayoutInputInterface>) {
        const options: any = { ...pick(item, 'id') };
        if (item?.layout) options.layout = this._buildLineLayout(item, this.layout) as ColumnLayoutInterface[];

        this._validateLayoutItem(options, config);
        return options;
    }

    _buildLine(line, config: Partial<LayoutInputInterface>) {
        if (Array.isArray(line)) line = { layout: line };

        const lineOptions = this._buildLayoutItem(line, config);
        if (line?.segments) {
            lineOptions.segments = this._buildSegments(line.segments, config);
        }

        this.validateLineLayout(lineOptions, config);
        return lineOptions;
    }

    validateLineLayout(lineOptions: LineLayoutInterface, config: Partial<LayoutInputInterface>): void {}

    _buildSegments(segments_, config: Partial<LayoutInputInterface>) {
        const segments = {};
        for (const index in segments_) {
            const segment_: SegmentInputInterface = segments_[index];
            const segment = this._buildLayoutItem(segment_, config);

            this.validateLineLayout(segment, config);
            segments[index] = segment;
        }

        return segments;
    }

    _prepareLineLayout(layout_: LayoutPropertyInputInterface, config: Partial<LayoutInputInterface>) {
        return layout_;
    }

    _buildLineLayout(lineConfig: LineGenericInputInterface, config: Partial<LayoutInputInterface>): ColumnLayoutInterface[] {
        const layout_: LayoutPropertyInputInterface = lineConfig.layout;
        if (!this._checkValidObject(layout_) && !this.checkValidArray(layout_)) {
            throw new Err('Invalid line layout. Line layout must be a non-empty array or an object.', ERROR_CODE.LAYOUT_LINE_INVALID);
        }

        const layout = this._prepareLineLayout(layout_, config);
        const lineLayout: ColumnLayoutInterface[] = [];
        let previousColumn: ColumnLayoutInterface;
        for (const index in layout) {
            const column = layout[index];
            const columnLayout: ColumnLayoutInterface = this._buildColumnLayout(index + '', column, previousColumn);

            lineLayout.push(columnLayout);
            previousColumn = { ...columnLayout };
        }

        lineLayout.sort((a, b) => a.position - b.position);

        this._checkLineLayout(lineLayout, config);
        return lineLayout;
    }

    getLineLayout(lineKey: string, segmentKey = ''): LayoutPropertyInterface {
        const lineConfig = !segmentKey ? this.layout.lines[lineKey] : this.layout.lines[lineKey].segments[segmentKey];
        return lineConfig?.layout;
    }
}
