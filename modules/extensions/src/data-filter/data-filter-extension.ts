// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {LayerExtension} from '@deck.gl/core';
import {shaderModule, shaderModule64} from './shader-module';
import * as aggregator from './aggregator';
import {readPixelsToArray, clear} from '@luma.gl/core';
import GL from '@luma.gl/constants';

import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';

const defaultProps = {
  getFilterValue: {type: 'accessor', value: 0},
  getFilterCategory: {type: 'accessor', value: 0},
  onFilteredItemsChange: {type: 'function', value: null, optional: true},

  filterEnabled: true,
  filterRange: [-1, 1],
  filterSoftRange: null,
  filterCategoryList: [],
  filterTransformSize: true,
  filterTransformColor: true
};

export type DataFilterExtensionProps<DataT = any> = {
  /**
   * Accessor to retrieve the value for each object that it will be filtered by.
   * Returns either a number (if `filterSize: 1`) or an array of numbers.
   */
  getFilterValue?: Accessor<DataT, number | number[]>;
  /**
   * Accessor to retrieve the category for each object that it will be filtered by.
   * Returns either a number (if `filterSize: 1`) or an array of numbers.
   */
  getFilterCategory?: Accessor<DataT, number | number[]>;
  /**
   * Enable/disable the data filter. If the data filter is disabled, all objects are rendered.
   * @default true
   */
  filterEnabled?: boolean;
  /**
   * The [min, max] bounds which defines whether an object should be rendered.
   * If an object's filtered value is within the bounds, the object will be rendered; otherwise it will be hidden.
   * @default [-1, 1]
   */
  filterRange?: [number, number] | [number, number][];
  /**
   * If specified, objects will be faded in/out instead of abruptly shown/hidden.
   * When the filtered value is outside of the bounds defined by `filterSoftRange` but still within the bounds defined by `filterRange`, the object will be rendered as "faded."
   * @default null
   */
  filterSoftRange?: [number, number] | [number, number][] | null;
  /**
   * When an object is "faded", manipulate its size so that it appears smaller or thinner. Only works if `filterSoftRange` is specified.
   * @default true
   */
  filterTransformSize?: boolean;
  /**
   * When an object is "faded", manipulate its opacity so that it appears more translucent. Only works if `filterSoftRange` is specified.
   * @default true
   */
  filterTransformColor?: boolean;
  /**
   * The categories which define whether an object should be rendered.
   * @default []
   */
  filterCategoryList: [number, number] | [number, number][];
  /**
   * Only called if the `countItems` option is enabled.
   */
  onFilteredItemsChange?: (evt: {
    /** The id of the source layer. */
    id: string;
    /** The number of data objects that pass the filter. */
    count: number;
  }) => void;
};

type DataFilterExtensionOptions = {
  /**
   * The size of the category filter (number of columns to filter by). The category filter can show/hide data based on 1-4 properties of each object.
   * @default 1
   */
  categorySize: number;
  /**
   * The size of the filter (number of columns to filter by). The data filter can show/hide data based on 1-4 numeric properties of each object.
   * @default 1
   */
  filterSize: number;
  /**
   * Use 64-bit precision instead of 32-bit.
   * @default false
   */
  fp64: boolean;
  /**
   * If `true`, reports the number of filtered objects with the `onFilteredItemsChange` callback.
   * @default `false`.
   */
  countItems: boolean;
};

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

/** Adds GPU-based data filtering functionalities to layers. It allows the layer to show/hide objects based on user-defined properties. */
export default class DataFilterExtension extends LayerExtension<DataFilterExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'DataFilterExtension';

  constructor({
    categorySize = 1,
    filterSize = 1,
    fp64 = false,
    countItems = false
  }: Partial<DataFilterExtensionOptions> = {}) {
    if (!DATA_TYPE_FROM_SIZE[categorySize]) {
      throw new Error('categorySize out of range');
    }
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }

    super({categorySize, filterSize, fp64, countItems});
  }

  getShaders(this: Layer<DataFilterExtensionProps>, extension: this): any {
    const {categorySize, filterSize, fp64} = extension.opts;

    return {
      modules: [fp64 ? shaderModule64 : shaderModule],
      defines: {
        DATACATEGORY_TYPE: DATA_TYPE_FROM_SIZE[categorySize],
        DATACATEGORY_CHANNELS: categorySize,
        DATAFILTER_TYPE: DATA_TYPE_FROM_SIZE[filterSize],
        DATAFILTER_DOUBLE: Boolean(fp64)
      }
    };
  }

  initializeState(this: Layer<DataFilterExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    const {categorySize, filterSize, fp64} = extension.opts;

    if (attributeManager) {
      attributeManager.add({
        filterValues: {
          size: filterSize,
          type: fp64 ? GL.DOUBLE : GL.FLOAT,
          accessor: 'getFilterValue',
          shaderAttributes: {
            filterValues: {
              divisor: 0
            },
            instanceFilterValues: {
              divisor: 1
            }
          }
        },
        filterCategories: {
          size: categorySize,
          type: GL.FLOAT,
          accessor: 'getFilterCategory',
          transform:
            categorySize === 1
              ? extension._getCategoryKey
              : // TODO independent keys
                d => d.map(x => extension._getCategoryKey.bind(this)(x)),
          shaderAttributes: {
            filterCategories: {
              divisor: 0
            },
            instanceFilterCategories: {
              divisor: 1
            }
          }
        }
      });
    }

    const {gl} = this.context;
    if (attributeManager && extension.opts.countItems) {
      const useFloatTarget = aggregator.supportsFloatTarget(gl);
      // This attribute is needed for variable-width data, e.g. Path, SolidPolygon, Text
      // The vertex shader checks if a vertex has the same "index" as the previous vertex
      // so that we only write one count cross multiple vertices of the same object
      attributeManager.add({
        filterIndices: {
          size: useFloatTarget ? 1 : 2,
          vertexOffset: 1,
          type: GL.UNSIGNED_BYTE,
          normalized: true,
          accessor: (object, {index}) => {
            const i = object && object.__source ? object.__source.index : index;
            return useFloatTarget ? (i + 1) % 255 : [(i + 1) % 255, Math.floor(i / 255) % 255];
          },
          shaderAttributes: {
            filterPrevIndices: {
              vertexOffset: 0
            },
            filterIndices: {
              vertexOffset: 1
            }
          }
        }
      });

      const filterFBO = aggregator.getFramebuffer(gl, useFloatTarget);
      const filterModel = aggregator.getModel(
        gl,
        extension.getShaders.call(this, extension),
        useFloatTarget
      );
      this.setState({filterFBO, filterModel});
    }
  }

  updateState(
    this: Layer<DataFilterExtensionProps>,
    {props, oldProps}: UpdateParameters<Layer<DataFilterExtensionProps>>
  ) {
    if (this.state.filterModel) {
      const attributeManager = this.getAttributeManager();
      const filterNeedsUpdate =
        // attributeManager must be defined for filterModel to be set
        attributeManager!.attributes.filterValues.needsUpdate() ||
        attributeManager!.attributes.filterCategories.needsUpdate() ||
        props.filterEnabled !== oldProps.filterEnabled ||
        props.filterRange !== oldProps.filterRange ||
        props.filterSoftRange !== oldProps.filterSoftRange ||
        props.filterCategoryList !== oldProps.filterCategoryList;
      if (filterNeedsUpdate) {
        this.setState({filterNeedsUpdate});
      }
    }
  }

  draw(this: Layer<DataFilterExtensionProps>, params: any, extension: this) {
    const {filterFBO, filterModel, filterNeedsUpdate} = this.state;
    const {onFilteredItemsChange} = this.props;
    if (filterNeedsUpdate && onFilteredItemsChange && filterModel) {
      const {
        attributes: {filterValues, filterCategories, filterIndices}
      } = this.getAttributeManager()!;
      filterModel.setVertexCount(this.getNumInstances());

      const {gl} = this.context;
      clear(gl, {framebuffer: filterFBO, color: [0, 0, 0, 0]});

      filterModel
        .updateModuleSettings(params.moduleParameters)
        .setAttributes({
          ...filterValues.getShaderAttributes(),
          ...filterCategories.getShaderAttributes(),
          ...(filterIndices && filterIndices.getShaderAttributes())
        })
        .draw({
          framebuffer: filterFBO,
          parameters: {
            ...aggregator.parameters,
            viewport: [0, 0, filterFBO.width, filterFBO.height]
          }
        });
      const color = readPixelsToArray(filterFBO);
      let count = 0;
      for (let i = 0; i < color.length; i++) {
        count += color[i];
      }
      onFilteredItemsChange({id: this.id, count});

      this.state.filterNeedsUpdate = false;
    }

    // Split 128 bit integer over 4 32 bit integers
    const {categorySize} = extension.opts;
    const {filterCategoryList} = this.props;
    const categoryBitMask = new Uint32Array([0, 0, 0, 0]);
    const categoryFilters = (
      categorySize === 1 ? [filterCategoryList] : filterCategoryList
    ) as any[][];
    const maxCategories = categorySize === 1 ? 128 : categorySize === 2 ? 64 : 32;
    for (let c = 0; c < categoryFilters.length; c++) {
      const categoryFilter = categoryFilters[c];
      for (const category of categoryFilter) {
        const key = extension._getCategoryKey.bind(this)(category); // value 0-127
        const channel = c * (maxCategories / 32) + Math.floor(key / 32);
        categoryBitMask[channel] += Math.pow(2, key % 32); // 1 << key fails for key > 30
      }
    }
    params.uniforms.filter_categoryBitMask = categoryBitMask;
  }

  finalizeState(this: Layer<DataFilterExtensionProps>) {
    const {filterFBO, filterModel} = this.state;
    if (filterFBO) {
      filterFBO.color.delete();
      filterFBO.delete();
      filterModel.delete();
    }
  }

  // TODO should be per-channel
  _getCategoryKey(this: Layer<DataFilterExtensionProps>, category) {
    if (!this.state.categoryMap) {
      this.setState({categoryMap: {}});
    }
    const {categoryMap} = this.state;
    if (!(category in categoryMap)) {
      categoryMap[category] = Object.keys(categoryMap).length;
      // console.log(`${this.constructor.layerName}: ${category} -> ${categoryMap[category]}`);
    }
    return categoryMap[category];
  }
}
