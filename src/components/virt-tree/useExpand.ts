import {
  nextTick,
  shallowRef,
  triggerRef,
  watch,
  type SetupContext,
  type ShallowRef,
  ref,
} from 'vue-demi';
import {
  UPDATE_EXPANDED_KEYS,
  NODE_EXPAND,
  type TreeEmits,
  type TreeProps,
} from './useTree';
import type { TreeNode, TreeNodeKey, TreeNodeData } from './type';
import type { VirtList } from '../virt-list';

export const useExpand = ({
  props,
  virtListRef,
  parentNodeKeys,
  getTreeNode,
  emits,
}: {
  props: TreeProps;
  virtListRef: ShallowRef<typeof VirtList | null>;
  parentNodeKeys: TreeNodeKey[];
  getTreeNode: (key: TreeNodeKey) => TreeNode | undefined;
  emits: SetupContext<typeof TreeEmits>['emit'];
}) => {
  let innerMode = false;

  const expandedKeysSet = shallowRef<Set<TreeNodeKey>>(new Set());
  const hasExpanded = (node: TreeNode) => expandedKeysSet.value.has(node.key);

  const setExpandedKeysMod = (expandedKeys: TreeNodeKey[]) => {
    expandedKeys.forEach((key) => {
      const node = getTreeNode(key);
      if (!node) return;
      expandParents(node);
    });
  };

  const setExpandedKeys = (keys: TreeNodeKey[] | undefined = undefined) => {
    if (props.defaultExpandAll) {
      // 存在性能问题，不建议使用此属性，可以使用 expandedKeys 替代
      expandedKeysSet.value = new Set(parentNodeKeys);
    } else if (keys !== undefined) {
      keys.forEach((key) => {
        const node = getTreeNode(key);
        if (!node) return;
        expandParents(node);
      });
    } else if (props.expandedKeys !== undefined) {
      // clear all expanded keys
      expandedKeysSet.value.clear();
      // 设置展开项的时候需要展开所有的父级
      props.expandedKeys.forEach((key) => {
        const node = getTreeNode(key);
        if (!node) return;
        expandParents(node);
      });
    }
    if (innerMode) {
      triggerRef(expandedKeysSet);
    }
    emits(UPDATE_EXPANDED_KEYS, [...expandedKeysSet.value]);
  };

  // 展开节点需要展开所有parent节点
  const expandParents = (node: TreeNode) => {
    if (!node.isLeaf) {
      expandedKeysSet.value.add(node.key);
    }
    if (!node?.parent) return;
    expandParents(node.parent);
  };

  const expandParentsMod = (node: TreeNode) => {
    const path: TreeNode[] = [];
    let current = node;
    if (!node.isLeaf) {
      expandedKeysSet.value.add(node.key);
    }
    while (current?.parent) {
      if (!current.isLeaf) {
        expandedKeysSet.value.add(current.key);
      }
      if (!expandedKeysSet.value.has(current.parent.key)) {
        path.push(current.parent);
      }
      current = current.parent;
    }

    if (path.length > 0) {
      path.forEach((parent) => {
        expandedKeysSet.value.add(parent.key);
      });
    }
  };

  const foldParents = (node: TreeNode) => {
    expandedKeysSet.value.delete(node.key);
    if (!node?.parent) return;
    foldParents(node.parent);
  };

  const expandAll = (expanded: boolean) => {
    expandedKeysSet.value = new Set(expanded ? parentNodeKeys : []);
    if (innerMode) {
      triggerRef(expandedKeysSet);
    }
    emits(UPDATE_EXPANDED_KEYS, [...expandedKeysSet.value]);

    const expandedNodes: TreeNodeData[] = [];
    expandedKeysSet.value.forEach((key) => {
      const node = getTreeNode(key);
      if (node) {
        expandedNodes.push(node.data);
      }
    });
    emits(NODE_EXPAND, expanded ? parentNodeKeys : [], {
      expanded: expanded,
      expandedNodes: expandedNodes,
    });
  };

  function expandNodeKey(node: TreeNode) {
    if (!node) return;
    const keySet = expandedKeysSet.value;

    // 将当前节点加入已展开节点集合
    keySet.add(node.key);
    // todo 触发 NODE_EXPAND 事件，传递节点数据和节点对象
    // emits(NODE_EXPAND, node.data, node);
  }

  const expandNode = (
    key: TreeNodeKey | TreeNodeKey[],
    expanded: boolean,
    foldAllNodes?: boolean,
  ) => {
    let target: TreeNodeKey[] | null = null;
    if (!Array.isArray(key)) {
      target = [key];
    } else {
      target = key;
    }
    target?.forEach((k) => {
      const node = getTreeNode(k);
      if (!node) return;
      if (expanded) {
        // expandParents(node); // 30w 需要13s
        expandParentsMod(node); // 30w 需要7s
        // expandNodeKey(node?.parent); // 30w 需要7s
        // 切换为折叠
      } else {
        if (node.isLeaf) {
          // 如果是叶子节点,需要折叠父节点
          if (!node?.parent) return;
          if (foldAllNodes) {
            // 折叠所有的父节点
            foldParents(node.parent);
          } else {
            // 折叠上一个父节点
            expandedKeysSet.value.delete(node.parent.key);
          }
        } else {
          expandedKeysSet.value.delete(node.key);
        }
      }
    });

    const expandedNodes: TreeNodeData[] = [];
    expandedKeysSet.value.forEach((key) => {
      const node = getTreeNode(key);
      if (node) {
        expandedNodes.push(node.data);
      }
    });

    emits(NODE_EXPAND, [...expandedKeysSet.value], {
      node: !Array.isArray(key) ? getTreeNode(key) : undefined,
      expanded: expanded,
      expandedNodes: expandedNodes,
    });

    if (innerMode) {
      triggerRef(expandedKeysSet);
    }
    emits(UPDATE_EXPANDED_KEYS, [...expandedKeysSet.value]);
  };

  /**
   * 切换树形结构中某个节点的展开/折叠状态
   * 如果 virtListRef.value 不存在或节点是叶子节点（isLeaf 为真），则直接返回，不处理；
   * 否则，通过 hasExpanded(node) 获取当前展开状态；
   * 调用 expandNode(node.key, !expanded) 切换该节点的展开状态。
   * @param node
   */
  const toggleExpand = (node: TreeNode) => {
    if (!virtListRef.value) return;
    if (node.isLeaf) return;
    const expanded = hasExpanded(node);
    expandNode(node.key, !expanded);
    // if (!expanded) {
    //   expandNodeKey(node);
    // } else {
    //   expandNode(node.key, !expanded);
    // }
  };

  watch(
    () => props.expandedKeys,
    () => {
      if (props.expandedKeys !== undefined) {
        innerMode = false;
        expandedKeysSet.value = new Set(props.expandedKeys);
        triggerRef(expandedKeysSet);
      } else {
        innerMode = true;
      }
    },
    {
      immediate: true,
    },
  );

  return {
    hasExpanded,
    setExpandedKeys,
    toggleExpand,
    expandNode,
    expandAll,
  };
};
