import {
  nextTick,
  shallowRef,
  triggerRef,
  watch,
  type SetupContext,
  type ShallowReactive,
} from 'vue-demi';
import {
  NODE_CHECK,
  NODE_CHECK_CHANGE,
  UPDATE_CHECKED_KEYS,
  type TreeEmits,
  type TreeProps,
} from './useTree';
import type { TreeInfo, TreeNode, TreeNodeKey, TreeNodeData } from './type';

export const useCheck = ({
  props,
  treeInfo,
  emits,
  getTreeNode,
}: {
  props: TreeProps;
  treeInfo: ShallowReactive<TreeInfo | undefined>;
  emits: SetupContext<typeof TreeEmits>['emit'];
  getTreeNode: (key: TreeNodeKey) => TreeNode | undefined;
}) => {
  /**
   * 标识当前是否是由组件内部触发的选中状态更新的变量
   * innerMode 主要用于管理组件内部与外部对 checkedKeys 的控制权切换，
   * 并确保在受控模式下能够正确地进行响应式更新。
   *
   * 它的作用主要体现在以下几点：
   * 1. 控制 checkedKeysSet 的更新方式：
   * 当 props.checkedKeys 被外部传入时（即非受控模式），innerMode 会被设置为 false，此时 checkedKeysSet 直接由外部值驱动。
   * 当 props.checkedKeys 为 undefined 时（即受控模式），innerMode 会被设置为 true，表示选中状态由组件内部维护。
   * 2. 决定是否手动触发响应式更新：
   * 在 Vue 中，使用 shallowRef 创建的响应式引用需要通过 triggerRef 手动触发更新。
   * 当 innerMode 为 true 时，在修改 checkedKeysSet 或 indeterminateKeysSet 后会调用 triggerRef 来确保视图更新。
   * 3. 区分外部和内部的状态变更：
   * 在某些方法（如 setCheckedKeys 和 updateCheckedKeys）中，会根据 innerMode 的值来判断是否需要触发额外的更新逻辑。
   */
  let innerMode = false;

  const checkedKeysSet = shallowRef<Set<TreeNodeKey>>(new Set());
  const indeterminateKeysSet = shallowRef<Set<TreeNodeKey>>(new Set());

  const hasChecked = (node: TreeNode) => checkedKeysSet.value.has(node.key);
  const hasIndeterminate = (node: TreeNode) =>
    indeterminateKeysSet.value.has(node.key);

  /**
   * 根据 props.checkedKeys 设置当前选中和部分选中状态的节点
   * 清空当前选中（checkedKeysSet）与部分选中（indeterminateKeysSet）集合；
   * 若配置允许勾选且传入了 checkedKeys，则遍历这些 key，获取对应节点并确保其被选中；
   * 若为内部模式，触发响应式更新；
   * 最后通过 emits 抛出更新后的选中 key 列表。
   */
  const setCheckedKeys = () => {
    checkedKeysSet.value.clear();
    indeterminateKeysSet.value.clear();

    if (props.checkable && props.checkedKeys) {
      for (const key of props.checkedKeys) {
        const node = getTreeNode(key);
        if (!node) return;
        if (node && !hasChecked(node)) {
          _toggleCheckbox(node, true);
        }
      }
    }
    if (innerMode) {
      triggerRef(checkedKeysSet);
    }
    // todo 如果checkedKeysSet.value非常大，频繁展开成数组可能带来性能损耗。
    // 可以保留原结构，除非下游组件强制要求是普通数组
    emits(UPDATE_CHECKED_KEYS, [...checkedKeysSet.value]);
  };

  /**
   * 更新树形结构中节点的选中状态（全选、部分选中、未选中）
   * 主要逻辑如下：
   * 从最底层向上遍历节点，判断父节点是否应被全选或半选；
   * 若子节点全部被选中且父节点不禁用复选框，则父节点也被标记为选中；
   * 若存在子节点被选中但不全选，则父节点标记为“半选”状态；
   * 最后更新选中与半选的 key 集合并触发响应式更新和事件通知。
   */
  const updateCheckedKeys = () => {
    // 如果树形结构不是可选择模式，则不执行任何操作
    if (!treeInfo || !props.checkable || !props.checkedStrictly) return;
    // 从treeInfo对象中解构出最大层级和层级节点映射
    const { maxLevel, levelNodesMap } = treeInfo;
    // 获取当前选中节点的键集合
    const checkedKeySet = checkedKeysSet.value;

    // 初始化一个集合，用于存储半选中状态的节点键
    const indeterminateKeySet = new Set<TreeNodeKey>();

    // 从倒数第二层开始，向上遍历每一层的节点,直到第一层
    for (let level = maxLevel - 1; level >= 1; level--) {
      const nodes = levelNodesMap.get(level);
      // 如果当前层没有节点，则跳过当前层
      if (!nodes) continue;
      nodes.forEach((node) => {
        const children = node.children;

        // 如果当前节点有子节点，则进一步处理
        if (children) {
          // 判断是否所有子节点都被选中
          let allChecked = true;
          // 判断是否存在至少一个子节点被选中
          let hasChecked = false;
          for (const childNode of children) {
            const key = childNode.key;
            const checkboxDisabled = childNode.disableCheckbox;
            // 如果子节点的复选框被禁用，则跳过当前子节点
            if (checkboxDisabled) {
              continue;
            } else if (checkedKeySet.has(key)) {
              // 如果子节点被选中，则标记为已选中
              hasChecked = true;
            } else if (indeterminateKeySet.has(key)) {
              // 如果子节点为半选中状态，则父节点不能全选，并标记为已选中
              allChecked = false;
              hasChecked = true;
              break;
            } else {
              // 如果子节点未被选中，则父节点不能全选
              allChecked = false;
            }
          }

          // 根据子节点的选中状态，更新父节点的选中状态
          // 如果所有子节点都已选中，则将当前节点加入选中集合
          if (allChecked && !node.disableCheckbox) {
            checkedKeySet.add(node.key);
            // 如果有子节点被选中但不是全部，则将当前节点设为半选状态
          } else if (hasChecked && !node.disableCheckbox) {
            indeterminateKeySet.add(node.key);
            checkedKeySet.delete(node.key);
            // 如果没有任何子节点被选中，则从选中集合和半选集合中移除当前节点
          } else {
            checkedKeySet.delete(node.key);
            indeterminateKeySet.delete(node.key);
          }
        }
      });
    }
    // 更新半选中状态的节点键集合
    indeterminateKeysSet.value = indeterminateKeySet;

    // 如果是内部模式，则触发选中节点键集合的更新
    if (innerMode) {
      triggerRef(checkedKeysSet);
    }
    // 触发半选中节点键集合的更新
    triggerRef(indeterminateKeysSet);

    // 发送更新事件，包含新的选中节点键集合
    emits(UPDATE_CHECKED_KEYS, [...checkedKeysSet.value]);
  };

  /**
   * 切换树形结构中节点的选中状态，并更新相关子节点的选中状态。
   * 功能解释如下：
   * 如果节点禁用复选框，则直接返回不处理。
   * 定义 toggle 函数，用于递归添加或删除节点的 key 到选中集合 checkedKeySet 中。
   * 若存在子节点且未启用 checkedStrictly 模式，则递归切换所有未禁用的子节点。
   * 根据是否启用 checkedStrictly 模式决定触发更新选中状态的方式。
   * @param node 当前操作的树节点
   * @param isChecked 新的复选框状态，表示是否选中
   */
  const _toggleCheckbox = (node: TreeNode, isChecked: boolean) => {
    // 如果节点禁用了复选框，则不执行任何操作
    if (node.disableCheckbox) return;
    // 获取当前选中项的键值集合
    const checkedKeySet = checkedKeysSet.value;

    /**
     * 递归切换节点及其子节点的选中状态
     * @param node 当前操作的树节点
     * @param checked 是否选中
     */
    const toggle = (node: TreeNode, checked: boolean) => {
      // 更新当前节点的选中状态
      checkedKeySet[checked ? 'add' : 'delete'](node.key);

      const children = node.children;
      // 如果当前节点有子节点且不启用严格检查模式，则递归更新子节点的选中状态
      if (!props.checkedStrictly && children) {
        children.forEach((childNode) => {
          // 如果子节点未禁用复选框，则更新其选中状态
          if (!childNode.disableCheckbox) {
            toggle(childNode, checked);
          }
        });
      }
    };

    // 调用toggle函数更新节点及其子节点的选中状态
    toggle(node, isChecked);
    // 如果启用严格检查模式
    if (props.checkedStrictly) {
      // 如果在内部模式下，则触发对选中项键值集合的更新
      if (innerMode) {
        triggerRef(checkedKeysSet);
      }
    } else {
      // 否则，更新选中项的键值集合
      updateCheckedKeys();
    }
  };

  const toggleCheckbox = (node: TreeNode) => {
    const checked = hasChecked(node);
    _toggleCheckbox(node, !checked);
    emits(UPDATE_CHECKED_KEYS, Array.from(checkedKeysSet.value));
    afterNodeCheck(node, !checked);
  };

  /**
   * 获取选中的节点信息
   * 该函数根据当前选中的节点集合，返回包含选中节点的关键字和节点数据的对象
   * 如果设置了leafOnly参数为true，则只返回叶节点的信息
   *
   * @param leafOnly 可选参数，默认为false如果为true，只考虑叶节点
   * @returns 返回一个对象，包含选中的节点关键字数组和节点数据数组
   */
  const getChecked = (
    leafOnly = false,
  ): {
    checkedKeys: TreeNodeKey[];
    checkedNodes: TreeNodeData[];
  } => {
    // 初始化选中的节点数据数组
    const checkedNodes: TreeNodeData[] = [];
    // 初始化选中的节点关键字数组
    const keys: TreeNodeKey[] = [];

    // 当树节点为可选中状态时，遍历选中的节点集合
    if (treeInfo && props.checkable) {
      checkedKeysSet.value.forEach((key) => {
        // 根据节点关键字获取节点实例
        const node = getTreeNode(key);
        // 如果节点存在，并且满足条件（不是叶节点或leafOnly为true且节点为叶节点），则添加到选中的节点集合中
        if (node && (!leafOnly || (leafOnly && node.isLeaf))) {
          keys.push(key);
          checkedNodes.push(node.data);
        }
      });
    }

    // 返回包含选中节点关键字和节点数据的对象
    return {
      checkedKeys: keys,
      checkedNodes,
    };
  };
  const getHalfChecked = (): {
    halfCheckedKeys: TreeNodeKey[];
    halfCheckedNodes: TreeNodeData[];
  } => {
    const halfCheckedNodes: TreeNodeData[] = [];
    const halfCheckedKeys: TreeNodeKey[] = [];
    if (props.checkable) {
      indeterminateKeysSet.value.forEach((key) => {
        const node = getTreeNode(key);
        if (node) {
          halfCheckedKeys.push(key);
          halfCheckedNodes.push(node.data);
        }
      });
    }
    return {
      halfCheckedNodes,
      halfCheckedKeys,
    };
  };

  /**
   * 在树形结构节点被勾选后，触发事件并传递相关状态信息
   * 功能如下：
   * 获取当前所有已选中和半选中的节点及 key；
   * 通过 emits 触发 NODE_CHECK 事件；
   * 传递当前节点、是否选中状态以及所有选中/半选中数据作为参数。
   * @param node 被勾选或取消勾选的树节点
   * @param checked 节点的勾选状态，可以是 true（勾选）或 false（未勾选）
   */
  const afterNodeCheck = (node: TreeNode, checked: boolean) => {
    // 获取当前完全勾选的节点和它们的键值
    const { checkedNodes, checkedKeys } = getChecked();
    // 获取当前半勾选的节点和它们的键值
    const { halfCheckedNodes, halfCheckedKeys } = getHalfChecked();
    // 触发节点勾选事件，传递节点数据、完全勾选的节点和半勾选的节点信息
    emits(NODE_CHECK, checkedKeys, {
      node,
      checked,
      checkedKeys,
      checkedNodes,
      halfCheckedKeys,
      halfCheckedNodes,
    });
    // feat: 触发节点勾选状态变化事件，传递节点数据和勾选状态
    emits(NODE_CHECK_CHANGE, node.data, checked);
  };

  /**
   * 全选或取消全选树形结构中的节点复选框
   * 逻辑如下：
   * 取消全选：若 checked 为 false，清空已选和半选状态的 key 集合。
   * 全选：若 checked 为 true，筛选所有未禁用的节点 key 并设置为已选。
   * 触发更新：在特定模式下手动触发响应式更新，并通过事件向外传递当前选中的 key 数组。
   * @param checked
   */
  const checkAll = (checked: boolean) => {
    if (!checked) {
      checkedKeysSet.value.clear();
      indeterminateKeysSet.value.clear();
    } else {
      const checkedKeys = treeInfo.allNodeKeys.filter((key) => {
        const node = getTreeNode(key);
        if (!node) return false;
        return !node.disableCheckbox;
      });
      checkedKeysSet.value = new Set(checkedKeys || []);
    }
    if (innerMode) {
      triggerRef(checkedKeysSet);
    }
    emits(UPDATE_CHECKED_KEYS, Array.from(checkedKeysSet.value));
  };

  /**
   * 设置一个或多个树节点的选中状态
   * 功能解释如下：
   * 参数处理：接收节点键 key（可以是单个或数组）和布尔值 checked。
   * 统一格式：将 key 转为数组形式以便统一处理。
   * 遍历设置：对每个 key，获取对应节点并调用 _toggleCheckbox 设置选中状态。
   * 触发更新：最后通过 emits 触发 UPDATE_CHECKED_KEYS 事件，通知外部当前已选中的 key 列表。
   * @param key 单个节点 key 或一组节点 key 的数组
   * @param checked 布尔值，表示是否要选中这些节点（true 为选中，false 为取消选中）。
   */
  const checkNode = (key: TreeNodeKey | TreeNodeKey[], checked: boolean) => {
    // 确保树结构数据存在且显示复选框
    if (!treeInfo || !props.checkable) {
      return;
    }
    // 用于统一处理传入的 key 参数
    let target: TreeNodeKey[] | null = null;
    if (!Array.isArray(key)) {
      target = [key];
    } else {
      target = key;
    }
    target?.forEach((k) => {
      const node = getTreeNode(k);
      if (!node) return;
      // todo
      _toggleCheckbox(node, checked);
    });
    emits(UPDATE_CHECKED_KEYS, Array.from(checkedKeysSet.value));
  };

  const getCheckedKeys = (leafOnly = false): TreeNodeKey[] => {
    return getChecked(leafOnly).checkedKeys;
  };

  const getCheckedNodes = (leafOnly = false): TreeNodeData[] => {
    return getChecked(leafOnly).checkedNodes;
  };

  const getHalfCheckedKeys = (): TreeNodeKey[] => {
    return getHalfChecked().halfCheckedKeys;
  };

  const getHalfCheckedNodes = (): TreeNodeData[] => {
    return getHalfChecked().halfCheckedNodes;
  };

  watch(
    () => props.checkedKeys,
    () => {
      if (props.checkedKeys !== undefined) {
        innerMode = false;
        checkedKeysSet.value = new Set(props.checkedKeys);
        triggerRef(checkedKeysSet);
      } else {
        innerMode = true;
      }
    },
    {
      immediate: true,
    },
  );

  return {
    setCheckedKeys,
    hasChecked,
    hasIndeterminate,
    updateCheckedKeys,
    toggleCheckbox,
    checkAll,
    checkNode,
    getCheckedKeys,
    getCheckedNodes,
    getHalfCheckedKeys,
    getHalfCheckedNodes,
  };
};
