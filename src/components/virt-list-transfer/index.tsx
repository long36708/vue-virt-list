/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isVue2,
  defineComponent,
  ref,
  computed,
  watch,
  nextTick,
  type VNode,
  type SetupContext,
} from 'vue-demi';
import { VirtList } from '../virt-list/index';
import type { TransferProps, TransferItem, TransferEmit } from './type';
import { _h, getSlot, mergeStyles, debounce } from '../../utils';
import './transfer.css';

const defaultProps = {
  dataSource: () => [],
  targetKeys: () => [],
  selectedKeys: () => [],
  titles: () => ['Source', 'Target'],
  operations: () => ['>', '<'],
  showSearch: false,
  showSelectAll: true,
  filterOption: undefined,
  searchPlaceholder: 'Search',
  notFoundContent: 'No Data',
  itemHeight: 32,
  itemGap: 0,
  buffer: 5,
  listStyle: '',
  listClass: '',
  itemStyle: '',
  itemClass: '',
  headerStyle: '',
  headerClass: '',
  footerStyle: '',
  footerClass: '',
  disabled: false,
  oneWay: false,
  pagination: false,
  showSize: false,
  size: 'default',
};

export default defineComponent({
  name: 'VirtListTransfer',
  components: {
    VirtList,
  },
  props: {
    dataSource: {
      type: Array,
      default: () => [],
    },
    targetKeys: {
      type: Array,
      default: () => [],
    },
    selectedKeys: {
      type: Array,
      default: () => [],
    },
    titles: {
      type: Array,
      default: () => ['Source', 'Target'],
    },
    operations: {
      type: Array,
      default: () => ['>', '<'],
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    showSelectAll: {
      type: Boolean,
      default: true,
    },
    filterOption: {
      type: Function,
      default: undefined,
    },
    searchPlaceholder: {
      type: String,
      default: 'Search',
    },
    notFoundContent: {
      type: String,
      default: 'No Data',
    },
    itemHeight: {
      type: Number,
      default: 32,
    },
    itemGap: {
      type: Number,
      default: 0,
    },
    buffer: {
      type: Number,
      default: 5,
    },
    listStyle: {
      type: [String, Object],
      default: '',
    },
    listClass: {
      type: [String, Array, Object],
      default: '',
    },
    itemStyle: {
      type: [String, Object, Function],
      default: '',
    },
    itemClass: {
      type: [String, Array, Object, Function],
      default: '',
    },
    headerStyle: {
      type: [String, Object],
      default: '',
    },
    headerClass: {
      type: [String, Array, Object],
      default: '',
    },
    footerStyle: {
      type: [String, Object],
      default: '',
    },
    footerClass: {
      type: [String, Array, Object],
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    oneWay: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: [Boolean, Object],
      default: false,
    },
    showSize: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'default',
    },
  },
  emits: [
    'change',
    'selectChange',
    'search',
    'scroll',
    'update:targetKeys',
    'update:selectedKeys',
  ],
  setup(props: TransferProps, context: SetupContext) {
    const sourceSearchValue = ref('');
    const targetSearchValue = ref('');
    const sourceSelectedKeys = ref<string[]>([]);
    const targetSelectedKeys = ref<string[]>([]);

    // 用于强制更新视图的标记
    const sourceUpdateKey = ref(0);
    const targetUpdateKey = ref(0);

    // 计算源列表和目标列表
    const sourceList = computed(() => {
      return props.dataSource.filter((item: TransferItem) => !props.targetKeys.includes(item.key));
    });

    const targetList = computed(() => {
      return props.dataSource.filter((item: TransferItem) => props.targetKeys.includes(item.key));
    });

    // 过滤后的列表
    const filteredSourceList = computed(() => {
      if (!sourceSearchValue.value) return sourceList.value;
      
      return sourceList.value.filter((item: TransferItem) => {
        if (props.filterOption) {
          return props.filterOption(sourceSearchValue.value, item);
        }
        return item.title.toLowerCase().includes(sourceSearchValue.value.toLowerCase());
      });
    });

    const filteredTargetList = computed(() => {
      if (!targetSearchValue.value) return targetList.value;
      
      return targetList.value.filter((item: TransferItem) => {
        if (props.filterOption) {
          return props.filterOption(targetSearchValue.value, item);
        }
        return item.title.toLowerCase().includes(targetSearchValue.value.toLowerCase());
      });
    });

    // 全选状态
    const sourceAllSelected = computed(() => {
      const selectedKeys = sourceSelectedKeys.value;
      // 只考虑未禁用的项目
      const filteredKeys = filteredSourceList.value
        .filter((item: TransferItem) => !item.disabled)
        .map((item: TransferItem) => item.key);
      return filteredKeys.length > 0 && filteredKeys.every((key: string) => selectedKeys.includes(key));
    });

    const targetAllSelected = computed(() => {
      const selectedKeys = targetSelectedKeys.value;
      // 只考虑未禁用的项目
      const filteredKeys = filteredTargetList.value
        .filter((item: TransferItem) => !item.disabled)
        .map((item: TransferItem) => item.key);
      return filteredKeys.length > 0 && filteredKeys.every((key: string) => selectedKeys.includes(key));
    });

    // 部分选中状态
    const sourcePartSelected = computed(() => {
      const selectedKeys = sourceSelectedKeys.value;
      // 只考虑未禁用的项目
      const filteredKeys = filteredSourceList.value
        .filter((item: TransferItem) => !item.disabled)
        .map((item: TransferItem) => item.key);
      return filteredKeys.some((key: string) => selectedKeys.includes(key)) && !sourceAllSelected.value;
    });

    const targetPartSelected = computed(() => {
      const selectedKeys = targetSelectedKeys.value;
      // 只考虑未禁用的项目
      const filteredKeys = filteredTargetList.value
        .filter((item: TransferItem) => !item.disabled)
        .map((item: TransferItem) => item.key);
      return filteredKeys.some((key: string) => selectedKeys.includes(key)) && !targetAllSelected.value;
    });

    // 监听外部 selectedKeys 变化
    watch(() => props.selectedKeys, (newKeys) => {
      sourceSelectedKeys.value = newKeys.filter(key => 
        sourceList.value.some(item => item.key === key)
      );
      targetSelectedKeys.value = newKeys.filter(key => 
        targetList.value.some(item => item.key === key)
      );
    }, { immediate: true });

    // 处理选择变化
    const handleSelectChange = (direction: 'left' | 'right', selectedKeys: string[]) => {
      if (direction === 'left') {
        sourceSelectedKeys.value = selectedKeys;
      } else {
        targetSelectedKeys.value = selectedKeys;
      }

      const allSelectedKeys = [...sourceSelectedKeys.value, ...targetSelectedKeys.value];
      // 发出v-model更新事件
      context.emit('update:selectedKeys', allSelectedKeys);
      context.emit('selectChange', allSelectedKeys, {
        sourceSelectedKeys: sourceSelectedKeys.value,
        targetSelectedKeys: targetSelectedKeys.value,
      });
    };

    // 处理全选
    const handleSelectAll = (direction: 'left' | 'right', selected: boolean) => {
      const list = direction === 'left' ? filteredSourceList.value : filteredTargetList.value;
      // 只选择未禁用的项目
      const keys = list.filter(item => !item.disabled).map(item => item.key);
      
      if (direction === 'left') {
        sourceSelectedKeys.value = selected ? keys : [];
      } else {
        targetSelectedKeys.value = selected ? keys : [];
      }

      const allSelectedKeys = [...sourceSelectedKeys.value, ...targetSelectedKeys.value];
      // 发出v-model更新事件
      context.emit('update:selectedKeys', allSelectedKeys);
      context.emit('selectChange', allSelectedKeys, {
        sourceSelectedKeys: sourceSelectedKeys.value,
        targetSelectedKeys: targetSelectedKeys.value,
      });
    };

    // 处理移动
    const handleMove = (direction: 'left' | 'right') => {
      const selectedKeys = direction === 'left' ? targetSelectedKeys.value : sourceSelectedKeys.value;
      
      if (selectedKeys.length === 0) return;

      // 获取可以移动的键（排除禁用项）
      const moveableKeys = selectedKeys.filter(key => {
        const items = direction === 'left' ? targetList.value : sourceList.value;
        const item = items.find(item => item.key === key);
        return item && !item.disabled;
      });

      if (moveableKeys.length === 0) return;

      const newTargetKeys = direction === 'left' 
        ? props.targetKeys.filter(key => !moveableKeys.includes(key))
        : [...props.targetKeys, ...moveableKeys];

      // 清空对应方向的选中状态
      if (direction === 'left') {
        targetSelectedKeys.value = [];
      } else {
        sourceSelectedKeys.value = [];
      }

      // 发出v-model更新事件
      context.emit('update:targetKeys', newTargetKeys);
      context.emit('change', newTargetKeys, direction, moveableKeys);
    };

    // 处理搜索
    const handleSearch = (direction: 'left' | 'right', value: string) => {
      if (direction === 'left') {
        sourceSearchValue.value = value;
        // 增加更新标记，强制视图刷新
        sourceUpdateKey.value += 1;
      } else {
        targetSearchValue.value = value;
        // 增加更新标记，强制视图刷新
        targetUpdateKey.value += 1;
      }
      context.emit('search', direction, value);
    };

    // 创建防抖版本的搜索函数，实现输入后自动搜索
    const debouncedHandleSearch = debounce(handleSearch, 300);

    // 渲染列表项
    const renderItem = (item: TransferItem, index: number) => {
      if (!item) return null;
      
      const isSelected = (direction: 'left' | 'right') => {
        const selectedKeys = direction === 'left' ? sourceSelectedKeys.value : targetSelectedKeys.value;
        return selectedKeys.includes(item.key);
      };

      const handleItemClick = (direction: 'left' | 'right') => {
        if (props.disabled || item.disabled) return;

        const selectedKeys = direction === 'left' ? sourceSelectedKeys.value : targetSelectedKeys.value;
        const newSelectedKeys = isSelected(direction) 
          ? selectedKeys.filter(key => key !== item.key)
          : [...selectedKeys, item.key];

        handleSelectChange(direction, newSelectedKeys);
      };

      return _h('div', {
        class: [
          'virt-transfer-item',
          {
            'virt-transfer-item-selected': isSelected('left') || isSelected('right'),
            'virt-transfer-item-disabled': item.disabled,
          },
          typeof props.itemClass === 'function' ? props.itemClass(item, index) : props.itemClass,
        ],
        style: mergeStyles(
          {
            height: `${props.itemHeight}px`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.2s',
          },
          typeof props.itemStyle === 'function' ? props.itemStyle(item, index) : props.itemStyle,
        ),
        onClick: () => handleItemClick('left'),
      }, [
        _h('input', {
          type: 'checkbox',
          checked: isSelected('left') || isSelected('right'),
          disabled: item.disabled,
          onChange: (e: Event) => {
            const target = e.target as HTMLInputElement;
            const direction = isSelected('left') ? 'left' : 'right';
            const selectedKeys = direction === 'left' ? sourceSelectedKeys.value : targetSelectedKeys.value;
            const newSelectedKeys = target.checked
              ? [...selectedKeys, item.key]
              : selectedKeys.filter(key => key !== item.key);
            handleSelectChange(direction, newSelectedKeys);
          },
          style: {
            marginRight: '8px',
          },
        }),
        _h('span', {
          class: 'virt-transfer-item-title',
          style: {
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }, item.title),
        item.description && _h('span', {
          class: 'virt-transfer-item-description',
          style: {
            fontSize: '12px',
            color: '#999',
            marginLeft: '8px',
          },
        }, item.description),
      ]);
    };

    // 渲染头部
    const renderHeader = (direction: 'left' | 'right') => {
      const list = direction === 'left' ? filteredSourceList.value : filteredTargetList.value;
      const selectedKeys = direction === 'left' ? sourceSelectedKeys.value : targetSelectedKeys.value;
      const allSelected = direction === 'left' ? sourceAllSelected.value : targetAllSelected.value;
      const partSelected = direction === 'left' ? sourcePartSelected.value : targetPartSelected.value;
      const title = props.titles[direction === 'left' ? 0 : 1];

      return _h('div', {
        class: [
          'virt-transfer-header',
          typeof props.headerClass === 'function' ? props.headerClass() : props.headerClass,
        ],
        style: mergeStyles(
          {
            padding: '8px 12px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          typeof props.headerStyle === 'function' ? props.headerStyle() : props.headerStyle,
        ),
      }, [
        _h('span', {
          class: 'virt-transfer-header-title',
          style: {
            fontWeight: 500,
          },
        }, title),
        props.showSelectAll && _h('div', {
          class: 'virt-transfer-header-select-all',
        }, [
          _h('input', {
            type: 'checkbox',
            checked: allSelected,
            indeterminate: partSelected,
            onChange: (e: Event) => {
              const target = e.target as HTMLInputElement;
              handleSelectAll(direction, target.checked);
            },
            style: {
              marginRight: '4px',
            },
          }),
          _h('span', {
            style: {
              fontSize: '12px',
              color: '#666',
            },
          }, `Selected ${selectedKeys.length}/${list.length}`),
        ]),
      ]);
    };

    // 渲染搜索框
    const renderSearch = (direction: 'left' | 'right') => {
      if (!props.showSearch) return null;

      const searchValue = direction === 'left' ? sourceSearchValue.value : targetSearchValue.value;

      return _h('div', {
        class: 'virt-transfer-search',
        style: {
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0',
        },
      }, [
        _h('input', {
          type: 'text',
          placeholder: props.searchPlaceholder,
          value: searchValue,
          onChange: (e: Event) => {
            const target = e.target as HTMLInputElement;
            debouncedHandleSearch(direction, target.value);
          },
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              handleSearch(direction, target.value);
            }
          },
          style: {
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '12px',
          },
        }),
      ]);
    };

    // 渲染操作按钮
    const renderOperations = () => {
      const canMoveRight = sourceSelectedKeys.value.length > 0 && !props.disabled;
      const canMoveLeft = targetSelectedKeys.value.length > 0 && !props.disabled && !props.oneWay;

      return _h('div', {
        class: 'virt-transfer-operations',
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 8px',
        },
      }, [
        _h('button', {
          class: [
            'virt-transfer-operation-btn',
            {
              'virt-transfer-operation-btn-disabled': !canMoveRight,
            },
          ],
          disabled: !canMoveRight,
          onClick: () => handleMove('right'),
          style: {
            marginBottom: '8px',
            padding: '4px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: canMoveRight ? '#fff' : '#f5f5f5',
            cursor: canMoveRight ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          },
        }, props.operations[0]),
        !props.oneWay && _h('button', {
          class: [
            'virt-transfer-operation-btn',
            {
              'virt-transfer-operation-btn-disabled': !canMoveLeft,
            },
          ],
          disabled: !canMoveLeft,
          onClick: () => handleMove('left'),
          style: {
            padding: '4px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: canMoveLeft ? '#fff' : '#f5f5f5',
            cursor: canMoveLeft ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          },
        }, props.operations[1]),
      ]);
    };

    // 渲染列表
    const renderList = (direction: 'left' | 'right') => {
      const list = direction === 'left' ? filteredSourceList.value : filteredTargetList.value;
      const selectedKeys = direction === 'left' ? sourceSelectedKeys.value : targetSelectedKeys.value;

      // 当列表为空时，直接显示无数据提示
      if (list.length === 0) {
        return _h('div', {
          style: {
            height: '250px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            overflow: 'hidden',
          },
        }, props.notFoundContent);
      }

      return _h(VirtList, {
        // 添加key属性，当搜索时强制组件重新渲染
        key: direction === 'left' ? `source-${sourceUpdateKey.value}` : `target-${targetUpdateKey.value}`,
        list,
        itemKey: 'key',
        minSize: props.itemHeight,
        itemGap: props.itemGap,
        buffer: props.buffer,
        headerClass: typeof props.headerClass === 'function' ? props.headerClass() : props.headerClass,
        headerStyle: typeof props.headerStyle === 'function' ? props.headerStyle() : props.headerStyle,
        footerClass: typeof props.footerClass === 'function' ? props.footerClass() : props.footerClass,
        footerStyle: typeof props.footerStyle === 'function' ? props.footerStyle() : props.footerStyle,
        stickyHeaderClass: typeof props.headerClass === 'function' ? props.headerClass() : props.headerClass,
        stickyHeaderStyle: mergeStyles(
          {
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          },
          typeof props.headerStyle === 'function' ? props.headerStyle() : props.headerStyle,
        ),
        stickyFooterClass: '',
        stickyFooterStyle: '',
        listStyle: mergeStyles(
          {
            height: '250px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          },
          typeof props.listStyle === 'function' ? props.listStyle() : props.listStyle,
        ),
        listClass: typeof props.listClass === 'function' ? props.listClass() : props.listClass,
        onScroll: (e: Event) => {
          context.emit('scroll', direction, e);
        },
      }, {
        stickyHeader: () => renderHeader(direction),
        default: ({ itemData, index }: { itemData: TransferItem; index: number }) => renderItem(itemData, index),
      });
    };

    return () => _h('div', {
      class: [
        'virt-transfer',
        `virt-transfer-${props.size}`,
        {
          'virt-transfer-disabled': props.disabled,
        },
      ],
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      },
    }, [
      // 左侧列表
      _h('div', {
        class: 'virt-transfer-list',
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }, [
        renderSearch('left'),
        _h('div', {
          style: {
            flex: 1,
            overflow: 'hidden',
          },
        }, [
          renderList('left'),
        ]),
      ]),
      
      // 操作按钮
      renderOperations(),
      
      // 右侧列表
      _h('div', {
        class: 'virt-transfer-list',
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }, [
        renderSearch('right'),
        _h('div', {
          style: {
            flex: 1,
            overflow: 'hidden',
          },
        }, [
          renderList('right'),
        ]),
      ]),
    ]);
  },
});