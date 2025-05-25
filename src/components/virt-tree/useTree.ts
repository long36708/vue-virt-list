import {
  computed,
  nextTick,
  ref,
  shallowReactive,
  watch,
  type ExtractPropTypes,
  type PropType,
  type SetupContext,
} from 'vue-demi';
import { VirtList } from '../virt-list';
import type {
  TreeNode,
  TreeInfo,
  TreeNodeData,
  TreeData,
  TreeNodeKey,
  TreeFieldNames,
  IScrollParams,
} from './type';
import { useCheck } from './useCheck';
import { useFilter } from './useFilter';
import { useSelect } from './useSelect';
import { useFocus } from './useFocus';
import { useExpand } from './useExpand';
import { useDrag } from './useDrag';
import { isBoolean } from '../../utils';

const defaultFiledNames: Required<TreeFieldNames> = {
  key: 'key',
  title: 'title',
  children: 'children',
  disableSelect: 'disableSelect',
  disableCheckbox: 'disableCheckbox',
  disableDragIn: 'disableDragIn',
  disableDragOut: 'disableDragOut',
};
// emits
export const TREE_SCROLL = 'scroll';
export const TREE_TO_TOP = 'toTop';
export const TREE_TO_BOTTOM = 'toBottom';
export const TREE_ITEM_RESIZE = 'itemResize';
export const TREE_RANGE_UPDATE = 'rangeUpdate';

export const NODE_CLICK = 'click';

export const NODE_EXPAND = 'expand';
export const UPDATE_EXPANDED_KEYS = 'update:expandedKeys';

export const NODE_SELECT = 'select';
export const UPDATE_SELECTED_KEYS = 'update:selectedKeys';

export const NODE_CHECK = 'check';
export const NODE_CHECK_CHANGE = 'check-change';
export const UPDATE_CHECKED_KEYS = 'update:checkedKeys';

export const DRAGSTART = 'dragstart';
export const DRAGEND = 'dragend';

export const TreeEmits = {
  [TREE_SCROLL]: (e: Event) => e,
  [TREE_TO_TOP]: (firstItem: any) => firstItem,
  [TREE_TO_BOTTOM]: (lastItem: any) => lastItem,
  [TREE_ITEM_RESIZE]: (id: string, newSize: number) => true,
  [TREE_RANGE_UPDATE]: (inViewBegin: number, inViewEnd: number) => true,

  [NODE_CLICK]: (data: TreeNodeData, node: TreeNode, e: MouseEvent) =>
    data && node && e,

  [NODE_EXPAND]: (
    expandKeys: Array<string | number>,
    data: {
      node?: TreeNode;
      expanded: boolean;
      expandedNodes: TreeNodeData[];
    },
  ) => expandKeys && data,
  [UPDATE_EXPANDED_KEYS]: (expandedKeys: TreeNodeKey[]) => expandedKeys,

  [NODE_SELECT]: (
    selectedKeys: TreeNodeKey[],
    data: {
      node: TreeNode;
      selected: boolean;
      selectedKeys: TreeNodeKey[];
      selectedNodes: TreeNodeData[];
    },
  ) => selectedKeys && data,
  [UPDATE_SELECTED_KEYS]: (selectedKeys: TreeNodeKey[]) => selectedKeys,

  [NODE_CHECK]: (
    checkedKeys: TreeNodeKey[],
    data: {
      node: TreeNode;
      checked: boolean;
      checkedKeys: TreeNodeKey[];
      checkedNodes: TreeNodeData[];
      halfCheckedKeys: TreeNodeKey[];
      halfCheckedNodes: TreeNodeData[];
    },
  ) => checkedKeys && data,

  [NODE_CHECK_CHANGE]: (data: TreeNodeData, checked: boolean) =>
    data && isBoolean(checked),
  [UPDATE_CHECKED_KEYS]: (checkedKeys: TreeNodeKey[]) => checkedKeys,

  [DRAGSTART]: (data: { sourceNode: TreeNodeData }) => data,
  [DRAGEND]: (data?: {
    node: TreeNode;
    // undefined 的时候表示进入第一个
    prevNode: TreeNode | undefined;
    // undefined 的时候表示根级别
    parentNode: TreeNode | undefined;
  }) => data,
};

export const customFieldNames = {
  list: {
    type: Array as PropType<TreeData>,
    required: true,
    default: () => [],
  },
  minSize: {
    type: Number,
    default: 32,
  },
  // 是否为固定高
  fixed: {
    type: Boolean,
    default: false,
  },
  indent: {
    type: Number,
    default: 16,
  },
  iconSize: {
    type: Number,
    default: 16,
  },
  itemGap: {
    type: Number,
    default: 0,
  },
  buffer: {
    type: Number,
    default: 2,
  },
  itemClass: {
    type: [String, Array, Object],
    default: '',
  },

  showLine: {
    type: Boolean,
    default: false,
  },

  fieldNames: {
    type: Object as PropType<TreeFieldNames>,
    default: () => ({}),
  },

  filterMethod: {
    type: Function as PropType<(query: string, node: TreeNode) => boolean>,
  },

  // expand
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  expandedKeys: {
    type: Array as PropType<TreeNodeKey[]>,
  },
  expandOnClickNode: {
    type: Boolean,
    default: false,
  },

  // selectable
  selectable: {
    type: Boolean,
    default: false,
  },
  selectMultiple: {
    type: Boolean,
    default: false,
  },
  selectedKeys: {
    type: Array as PropType<TreeNodeKey[]>,
  },

  // checkable
  checkable: {
    type: Boolean,
    default: false,
  },
  checkedKeys: {
    type: Array as PropType<TreeNodeKey[]>,
  },
  // 当checkable为true时，节点的复选状态是否影响其父节点和子节点
  checkedStrictly: {
    type: Boolean,
    default: false,
  },
  checkOnClickNode: {
    type: Boolean,
    default: false,
  },

  // focus
  focusedKeys: {
    type: Array as PropType<TreeNodeKey[]>,
    default: () => [],
  },

  draggable: {
    type: Boolean,
    default: false,
  },
  dragClass: {
    type: String,
    default: '',
  },
  dragGhostClass: {
    type: String,
    default: '',
  },
  dragoverPlacement: {
    type: Array as PropType<number[]>,
    default: () => [33, 66],
  },
  // 待确定的功能
  // beforeDrag: {
  //   type: Function as PropType<
  //     (data: {
  //       placement: 'top' | 'bottom' | 'center';
  //       node: TreeNode;
  //       prevNode: TreeNode;
  //       parentNode: TreeNode;
  //     }) => boolean
  //   >,
  //   default: () => true,
  // },
  loadNode: {
    type: Function as PropType<(node: TreeNodeData) => Promise<TreeNodeData>>,
  },
};

export type TreeProps = ExtractPropTypes<typeof customFieldNames>;

export const useTree = (
  props: TreeProps,
  emits: SetupContext<typeof TreeEmits>['emit'],
) => {
  // 维护一个 dragging 状态
  const dragging = ref(false);
  const virtListRef = ref<typeof VirtList | null>(null);
  const renderKey = ref(0);

  const mergeFieldNames = {
    ...defaultFiledNames,
    ...props.fieldNames,
  };
  const getKey = (node: TreeNodeData) =>
    !node ? '' : node[mergeFieldNames.key];
  const getTitle = (node: TreeNodeData) =>
    !node ? '' : node[mergeFieldNames.title];
  const getChildren = (node: TreeNodeData) =>
    !node ? [] : node[mergeFieldNames.children];
  const getDisableSelect = (node: TreeNodeData) =>
    !node ? '' : node[mergeFieldNames.disableSelect];
  const getDisableCheckbox = (node: TreeNodeData) =>
    !node ? '' : node[mergeFieldNames.disableCheckbox];

  const treeInfo = shallowReactive<TreeInfo>({
    treeNodesMap: new Map(),
    levelNodesMap: new Map(),
    maxLevel: 1,
    treeNodes: [],
    allNodeKeys: [],
  });
  const parentNodeKeys: TreeNodeKey[] = [];

  function setTreeNode(key: TreeNodeKey, value: TreeNode) {
    // 因为无法判定用户使用number or string作为key，所以这里统一转成string处理
    return treeInfo.treeNodesMap.set(String(key), value);
  }

  function getTreeNode(key: TreeNodeKey) {
    return treeInfo.treeNodesMap.get(String(key));
  }

  function generateTreeNode(
    rawNode: TreeNodeData,
    parent?: TreeNode,
    level: number = 1,
  ) {
    const key = getKey(rawNode);
    const title = getTitle(rawNode);
    const children = getChildren(rawNode);
    const disableSelect = getDisableSelect(rawNode);
    const disableCheckbox = getDisableCheckbox(rawNode);
    let node: TreeNode = {
      data: rawNode,
      key,
      parent,
      level,
      title,
      disableSelect,
      disableCheckbox,
      isLeaf: !!rawNode.isLeaf,
      // isLeaf: !children || children.length === 0,
      // isLast: index === nodes.length,
    };
    return node;
  }

  const setTreeData = (list: TreeData) => {
    const levelNodesMap = new Map<TreeNodeKey, TreeNode[]>();

    let maxLevel = 1;
    const flat = (nodes: TreeData, level: number = 1, parent?: TreeNode) => {
      const currNodes: TreeNode[] = [];
      let index = 0;
      for (const rawNode of nodes) {
        index++;
        const key = getKey(rawNode);
        const children = getChildren(rawNode);
        let node: TreeNode = generateTreeNode(rawNode, parent, level);

        // todo
        if (props.loadNode) {
          node = {
            ...node,
            isLoaded: node.isLoaded ?? false,
            isLoading: false,
            isLeaf: node.isLeaf ?? false,
            isLast: index === nodes.length,
          };
        } else {
          node = {
            ...node,
            isLeaf: !children || children.length === 0,
            isLast: index === nodes.length,
          };
        }
        if (children && children.length) {
          node.children = flat(children, level + 1, node);
          parentNodeKeys.push(node.key);
        }
        currNodes.push(node);
        setTreeNode(key, node);
        treeInfo.allNodeKeys.push(key);
        if (level > maxLevel) {
          maxLevel = level;
        }
        const levelInfo = levelNodesMap.get(level);
        if (levelInfo) {
          levelInfo.push(node);
          continue;
        }
        levelNodesMap.set(level, [node]);
      }
      return currNodes;
    };
    treeInfo.treeNodes = flat(list);
    treeInfo.levelNodesMap = levelNodesMap;
    treeInfo.maxLevel = maxLevel;

    // return {
    //   treeNodes,
    //   treeNodesMap,
    //   levelNodesMap,
    //   maxLevel,
    //   allNodeKeys,
    // };
  };

  const scrollToTarget = (key: TreeNodeKey, isTop: boolean = true) => {
    const currIndex = renderList.value.findIndex((l) => l.key === key);
    // 若展开节点不在可视区域内，将对应节点滚动到可视区域
    if (currIndex < 0) {
      // 若滚动目标元素不在当前数据列表中，需要展开当前节点
      expandNode(key, true);
    }
    nextTick(() => {
      // 重新查找位置并滚动
      const newIndex = renderList.value.findIndex((l) => l.key === key);

      if (isTop) {
        virtListRef.value?.scrollToIndex(newIndex);
        return;
      }
      virtListRef.value?.scrollIntoView(newIndex);
    });
  };

  const scrollToBottom = () => {
    virtListRef.value?.scrollToBottom();
  };

  const scrollToTop = () => {
    virtListRef.value?.scrollToTop();
  };

  const scrollTo = (scroll: IScrollParams) => {
    const { key, align, offset } = scroll;
    if (offset && offset >= 0) {
      // 只滚动到指定位置
      virtListRef.value?.scrollToOffset(offset);
      return;
    }
    // 滚动指定元素，需要滚动目标的 key
    if (!key) return;
    if (align && align === 'top') {
      scrollToTarget(key, true);
    } else {
      scrollToTarget(key, false);
    }
  };

  const {
    hasChecked,
    hasIndeterminate,
    setCheckedKeys,
    toggleCheckbox,
    checkAll,
    checkNode,
    getCheckedKeys,
  } = useCheck({
    props,
    treeInfo,
    getTreeNode,
    emits,
  });

  const { doFilter, hiddenNodeKeySet, isForceHiddenExpandIcon } = useFilter({
    props,
    treeInfo,
    virtListRef,
  });

  const { hasSelected, toggleSelect, selectNode, selectAll } = useSelect({
    props,
    treeInfo,
    emits,
    getTreeNode,
  });

  const { hasExpanded, setExpandedKeys, toggleExpand, expandAll, expandNode } =
    useExpand({
      props,
      virtListRef,
      parentNodeKeys,
      getTreeNode,
      emits,
    });

  const { hasFocused } = useFocus({ props });

  const { onDragstart } = useDrag({
    props,
    virtListRef,
    dragging,
    getTreeNode,
    hasExpanded,
    expandNode,
    emits,
  });

  const onClickExpandIcon = (node: TreeNode) => {
    if (dragging.value) return;
    if (!node.isLeaf && !node.isLoaded && props.loadNode) {
      loadMore(node).then(() => {
        toggleExpand(node);
      });
    } else {
      toggleExpand(node);
    }
  };
  const onClickCheckbox = (node: TreeNode, e: Event) => {
    if (dragging.value) return;
    toggleCheckbox(node);
  };
  const onClickNodeContent = (node: TreeNode) => {
    if (dragging.value) return;
    // 如果支持选中节点，且非禁用时，才允许选中
    if (props.selectable && !node.disableSelect) {
      toggleSelect(node);
    } else if (
      props.checkable &&
      !node.disableCheckbox &&
      props.checkOnClickNode
    ) {
      toggleCheckbox(node);
    } else if (props.expandOnClickNode) {
      toggleExpand(node);
    }
  };
  const filter = (query: string) => {
    const keys = doFilter(query);
    if (keys) {
      expandNode([...keys], true);
    }
  };

  // 实际渲染的节点
  /**
   * 根据树形结构数据生成需要渲染的扁平节点列表，并支持隐藏某些节点和虚拟滚动更新
   * 具体逻辑如下：
   * 过滤隐藏节点：通过 hiddenNodeKeys 过滤掉不需要显示的节点。
   * 深度优先遍历树结构：使用栈实现非递归后序遍历（从右到左），确保层级顺序正确。
   * 仅收集可见节点：只将未被隐藏的节点加入 flattenNodes。
   * 触发虚拟列表更新：调用 virtListRef.value?.forceUpdate() 强制刷新虚拟列表组件。
   */
  const renderList = computed(() => {
    // 获取隐藏节点的键集合
    const hiddenNodeKeys = hiddenNodeKeySet.value;
    // 从树信息中获取树节点，如果没有则默认为空数组
    const nodes = (treeInfo && treeInfo.treeNodes) || [];
    // 初始化一个扁平化的节点数组
    const flattenNodes: TreeNode[] = [];
    // 定义一个遍历函数，用于将树形结构的节点扁平化
    function traverse() {
      const stack: TreeNode[] = [];
      // 将所有节点按逆序压入栈中，以便从根节点开始遍历
      for (let i = nodes.length - 1; i >= 0; --i) {
        stack.push(nodes[i]);
      }
      // 当栈不为空时，继续遍历
      while (stack.length) {
        // 弹出栈顶节点
        const node = stack.pop();
        if (!node) continue;
        // 如果节点的键不在隐藏集合中，则将其加入扁平化数组
        if (!hiddenNodeKeys.has(node.key)) {
          flattenNodes.push(node);
        }
        // 如果节点已展开且有子节点，则将子节点按逆序压入栈中
        if (hasExpanded(node)) {
          const children = node.children;
          if (children) {
            const length = children.length;
            for (let i = length - 1; i >= 0; --i) {
              stack.push(children[i]);
            }
          }
        }
      }
    }
    // 调用遍历函数
    traverse();
    // 每次需要调用VirtList的更新（因为可能出现length不变的情况）
    virtListRef.value?.forceUpdate();
    return flattenNodes;
  });

  const onScroll = (e: Event) => {
    emits(TREE_SCROLL, e);
  };

  function onToTop(firstItem: any) {
    emits(TREE_TO_TOP, firstItem);
  }

  function onToBottom(lastItem: any) {
    emits(TREE_TO_BOTTOM, lastItem);
  }

  function onItemResize(id: string, newSize: number) {
    emits(TREE_ITEM_RESIZE, id, newSize);
  }

  function onRangeUpdate(inViewBegin: number, inViewEnd: number) {
    emits(TREE_RANGE_UPDATE, inViewBegin, inViewEnd);
  }

  function forceUpdate() {
    renderKey.value += 1;
  }

  const loadMore = async (node: TreeNode) => {
    if (node.isLeaf || node.isLoaded || node.isLoading) return;

    node.isLoading = true;

    try {
      // 刷新视图
      virtListRef.value?.forceUpdate();
      const children = await props?.loadNode?.(node); // 用户传入的异步加载函数
      if (!children || children.length === 0) {
        node.isLeaf = true;
        virtListRef.value?.forceUpdate();
        return;
      }
      node.children = children.map((child: TreeNodeData, index: number) => {
        const childNode = generateTreeNode(child, node, node.level + 1);
        parentNodeKeys.push(childNode.key);
        return {
          ...childNode,
          // isLeaf: !!child.isLeaf,
          isLoaded: false,
          isLoading: false,
          isLast: index === children.length,
        };
      });

      node.isLoaded = true;
    } catch (e) {
      console.error('Failed to load children:', e);
    } finally {
      node.isLoading = false;
    }
    // forceUpdate();
    const rawData = node.data;
    const key = getKey(rawData);
    setTreeNode(key, node);
    treeInfo.allNodeKeys.push(key);
    // 刷新层级
    let level = node.level;
    let { maxLevel, levelNodesMap } = treeInfo;
    if (level > maxLevel) {
      maxLevel = level;
    }
    const levelInfo = levelNodesMap.get(level);
    if (levelInfo) {
      levelInfo.push(node);
    }
    levelNodesMap.set(level, [node]);
    treeInfo.levelNodesMap = levelNodesMap;
    treeInfo.maxLevel = maxLevel;

    // 刷新视图
    virtListRef.value?.forceUpdate();
    // 刷新勾选项
    checkNode(key, hasChecked(node));
  };

  watch(
    () => renderKey.value,
    () => {
      setTreeData(props.list);
      setExpandedKeys();
      setCheckedKeys();
      if (!virtListRef.value) return;
      virtListRef.value.forceUpdate();
    },
  );

  watch(
    () => props.list.length,
    () => {
      forceUpdate();
    },
    {
      immediate: true,
    },
  );

  return {
    virtListRef,
    treeInfo,

    dragging,

    renderList,

    filter,
    isForceHiddenExpandIcon,
    setTreeData,

    getTreeNode,
    scrollToBottom,
    scrollToTarget,
    scrollToTop,
    scrollTo,
    forceUpdate,

    // expand
    hasExpanded,
    toggleExpand,
    expandAll,
    expandNode,
    setExpandedKeys,

    // select
    hasSelected,
    selectNode,
    selectAll,

    // check
    hasChecked,
    hasIndeterminate,
    checkAll,
    checkNode,
    getCheckedKeys,

    // focus
    hasFocused,

    onDragstart,
    onClickExpandIcon,
    onClickNodeContent,
    onClickCheckbox,

    // 透传event
    onScroll,
    onToTop,
    onToBottom,
    onItemResize,
    onRangeUpdate,
  };
};
