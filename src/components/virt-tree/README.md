# `virt-tree` 组件设计文档（简化版）

## 一、组件概述

`virt-tree` 是一个基于 Vue 的虚拟滚动树形组件，旨在高效渲染大型树形结构数据。

它结合了 **虚拟滚动** 和 **树形结构**的特性，实现高性能的层级数据展示与交互。

---

## 二、核心功能

### 1. 虚拟滚动（Virtual Scrolling）

- **目的**：仅渲染当前可视区域内的节点，减少 DOM 数量。
- **实现**：
    - 使用 `virt-list` 实现垂直方向上的虚拟滚动。
    - 支持固定高度或动态计算每个节点的高度。
    - 自动监听容器尺寸变化并更新可视区域范围。

### 2. 树形结构支持

- **嵌套层级**：支持无限层级展开/收起操作。
- **节点状态**：包括展开、选中、禁用、焦点等。
- **图标与缩进**：通过缩进和箭头图标清晰展示层级关系。

### 3. 可选功能模块

- **复选框（Checkable）**：支持多选、半选状态。
- **可选择（Selectable）**：点击节点触发选中。
- **拖拽排序（Draggable）**：支持节点拖拽排序。
- **过滤搜索（Filtering）**：支持按关键字过滤显示节点。
- **聚焦（Focus）**：支持键盘导航与聚焦高亮。
- **粘性头部/尾部（Sticky Header/Footer）**：支持固定位置内容。

---

## 三、技术架构

### 1. 基础组件结构

```
VirtTree
├── VirtList (虚拟滚动)
│   └── VirtTreeNode (单个树节点)
└── Tree Core Logic (useXXX 系列组合函数)
```

### 2. 主要文件说明

| 文件名                                                                                                               | 功能                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [VirtTree.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx)         | 根组件，负责接收 props 并调用 [useTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617) 初始化树结构，使用 [VirtList](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-list/index.js#L571-L831) 渲染可视节点。                                                                                    |
| [VirtTreeNode.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx) | 单个节点组件，处理点击、展开、勾选等交互行为。                                                                                                                                                                                                                                                                                                                          |
| [useTree.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts)             | 核心逻辑，构建树结构、管理节点状态、提供 API。                                                                                                                                                                                                                                                                                                                        |
| [useCheck.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts)           | 处理复选框逻辑，如全选、半选、父子联动。                                                                                                                                                                                                                                                                                                                             |
| [useSelect.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts)         | 处理节点选中状态。                                                                                                                                                                                                                                                                                                                                        |
| [useExpand.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts)         | 控制节点展开/收起状态。                                                                                                                                                                                                                                                                                                                                     |
| [useDrag.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts)             | 支持节点拖拽排序。                                                                                                                                                                                                                                                                                                                                        |
| [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/real-list/type.ts)                   | 定义类型，如 [TreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L4-L16), [TreeProps](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L247-L247), [TreeEmits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L60-L115) 等。 |

---

## 四、API 设计

### 1. Props

```ts
interface TreeProps {
    // 树数据源
    treeData: TreeNode[];
    // 字段映射
    fieldNames?: TreeFieldNames;
    // 是否可勾选
    checkable?: boolean;
    // 是否可选择
    selectable?: boolean;
    // 是否可拖拽
    draggable?: boolean;
    // 展开图标是否隐藏
    hiddenExpandIcon?: boolean;
    // 节点最小高度
    minSize?: number;
    // 是否固定高度
    fixed?: boolean;
    // 缩进像素
    indent?: number;
    // 图标大小
    iconSize?: number;
    // 显示连接线
    showLine?: boolean;
    // 初始展开的 key 列表
    defaultExpandedKeys?: TreeNodeKey[];
    // 初始选中的 key 列表
    checkedKeys?: TreeNodeKey[];
}
```

### 2. Events

```ts
const TreeEmits = {
    clickExpandIcon: (node: TreeNode) => true,
    clickNodeContent: (node: TreeNode) => true,
    clickCheckbox: (node: TreeNode) => true,
    dragstart: (e: Event) => true,
    scroll: (e: Event) => e,
    toTop: (firstItem: any) => firstItem,
    toBottom: (lastItem: any) => lastItem,
};
```

### 3. Slots

| 插槽名                             | 用途          |
|---------------------------------|-------------|
| `default`                       | 自定义整个节点渲染模板 |
| `content`                       | 自定义节点内容     |
| `icon`                          | 自定义展开图标     |
| `checkbox`                      | 自定义复选框样式    |
| `stickyHeader` / `stickyFooter` | 固定在顶部/底部的内容 |

---

## 五、性能优化策略

### 1. 虚拟滚动

- **按需渲染**：只渲染当前可视区域内的节点，极大减少 DOM 节点数量。
- **动态高度计算**：根据实际节点高度调整滚动区域占位尺寸。

### 2. 数据扁平化

- 将原始树结构扁平化为一维数组，便于快速访问和渲染。

### 3. ResizeObserver 监听

- 监听每个节点的实际高度变化，自动更新布局。

### 4. 防抖/节流

- 对高频事件（如滚动、窗口变化）进行防抖或节流处理。

---

## 六、样式系统

- **CSS Variables**：使用 CSS 变量统一控制主题色、字体、间距等样式。
- **Dark Mode 支持**：通过 `.dark` 类切换暗色模式。
- **自定义类名**：支持传入 `class` 或 `style` 自定义节点外观。

---

## 七、示例代码

```vue

<template>
  <VirtTree
      :tree-data="treeData"
      checkable
      selectable
      show-line
      @click-node-content="handleClick"
      @click-checkbox="handleCheck"
  >
    <template #content="{ node }">
      {{ node.title }}
    </template>
  </VirtTree>
</template>

<script setup>
  import {VirtTree} from 'virt-tree';

  const treeData = [
    {
      title: 'Parent 1',
      key: '1',
      children: [
        {title: 'Child 1', key: '1-1'},
        {title: 'Child 2', key: '1-2'}
      ]
    }
  ];
</script>
```

---

## 八、后续扩展建议

- 支持异步加载子节点（懒加载）。
- 支持键盘快捷键导航（上下、空格选中等）。
- 支持右键菜单、复制路径等功能。

---

## 九、总结

`virt-tree` 是一个高性能、可定制化的树形组件，适用于需要展示大量层级数据的场景。

其结合虚拟滚动与树形结构的优势，使得即使面对成百上千条数据也能保持流畅体验。

# [useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409) 设计文档

## 一、模块概述

[useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409) 是 `virt-tree` 组件中用于管理节点复选框状态的核心逻辑模块。它负责处理树形结构中节点的 **全选**、**取消全选**、**勾选/取消勾选单个节点**、**父子联动选择** 等功能，并维护组件内部的响应式状态。

---

## 二、核心能力

### 1. 复选框状态管理
- 支持 **受控模式** 和 **非受控模式**
- 支持 **父子节点联动**
- 支持 **半选状态（indeterminate）**
- 提供 API 获取当前已选节点和半选节点信息

### 2. 响应式更新机制
- 使用 Vue 的 `shallowRef` + `triggerRef` 实现高性能响应式更新
- 区分外部传入 [checkedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L198-L200) 与内部状态变更，避免冲突

### 3. 树状结构联动
- 自底向上同步父节点状态
- 支持严格模式（父子不联动）

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/real-list/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  isLast?: boolean;
  parent?: TreeNode;
  children?: TreeNode[];
  disableSelect?: boolean;
  disableCheckbox?: boolean;
  data: T;
}
```


### 2. 状态存储

| 变量名             | 类型               | 描述                     |
|------------------|--------------------|--------------------------|
| [checkedKeysSet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L45-L45)   | `shallowRef<Set>`    | 当前被选中的节点 key 集合     |
| [indeterminateKeysSet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L46-L46) | `shallowRef<Set>`    | 当前处于半选状态的节点 key 集合 |

---

## 四、主要函数说明

### 1. 初始化方法 [useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409)

```ts
const useCheck = ({
  props,
  treeInfo,
  emits,
  getTreeNode,
}: {
  props: TreeProps;
  treeInfo: ShallowReactive<TreeInfo | undefined>;
  emits: SetupContext<typeof TreeEmits>['emit'];
  getTreeNode: (key: TreeNodeKey) => TreeNode | undefined;
}) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 树组件的配置属性，如 [checkable](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L194-L197)、[checkedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L198-L200)
- [treeInfo](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L273-L279): 树结构信息，包含所有节点及层级关系
- [emits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L96-L96): 事件发射器，用于触发 `UPDATE_CHECKED_KEYS`、`NODE_CHECK` 等事件
- [getTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289): 通过 key 获取节点对象的方法

---

### 2. 主要方法列表

| 方法名              | 功能描述                                                                 |
|-------------------|------------------------------------------------------------------------|
| [setCheckedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L59-L78)     | 根据 `props.checkedKeys` 设置初始选中状态，并清空旧状态                           |
| [updateCheckedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L88-L161)  | 更新整个树的选中状态（包括父节点），从叶子节点向上遍历判断是否全选或半选                |
| [_toggleCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L173-L212)     | 切换某个节点及其子节点的选中状态（递归操作）                                     |
| [toggleCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L214-L219)      | 用户点击复选框时调用，切换节点选中状态并触发事件                                    |
| [afterNodeCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L289-L305)      | 节点状态变化后触发 `NODE_CHECK` 和 `NODE_CHECK_CHANGE` 事件                         |
| [checkAll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L315-L331)           | 全选或取消全选所有可选节点                                                     |
| [checkNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L343-L362)          | 手动设置指定节点为选中或未选中状态                                              |
| [getChecked](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L229-L258)         | 获取当前所有选中的节点 key 和 data                                             |
| [getHalfChecked](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L259-L278)     | 获取当前所有半选的节点 key 和 data                                             |

---

## 五、关键实现逻辑

### 1. 状态初始化与控制权切换

- 如果用户传入了 [checkedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L198-L200)，则进入 **非受控模式**，由外部驱动状态。
- 如果未传入，则进入 **受控模式**，由组件内部维护状态，并通过 `triggerRef` 触发更新。

```ts
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
  { immediate: true }
);
```


### 2. 子节点状态变化后自动更新父节点

```ts
const updateCheckedKeys = () => {
  const { maxLevel, levelNodesMap } = treeInfo;
  const checkedKeySet = checkedKeysSet.value;
  const indeterminateKeySet = new Set<TreeNodeKey>();

  for (let level = maxLevel - 1; level >= 1; level--) {
    const nodes = levelNodesMap.get(level);
    if (!nodes) continue;

    nodes.forEach((node) => {
      const children = node.children;
      if (!children || !children.length) return;

      let allChecked = true;
      let hasChecked = false;

      for (const child of children) {
        const key = child.key;
        if (child.disableCheckbox) continue;

        if (checkedKeySet.has(key)) {
          hasChecked = true;
        } else if (indeterminateKeySet.has(key)) {
          allChecked = false;
          hasChecked = true;
          break;
        } else {
          allChecked = false;
        }
      }

      if (allChecked && !node.disableCheckbox) {
        checkedKeySet.add(node.key);
      } else if (hasChecked && !node.disableCheckbox) {
        indeterminateKeySet.add(node.key);
        checkedKeySet.delete(node.key);
      } else {
        checkedKeySet.delete(node.key);
        indeterminateKeySet.delete(node.key);
      }
    });
  }

  indeterminateKeysSet.value = indeterminateKeySet;
  if (innerMode) triggerRef(checkedKeysSet);
  triggerRef(indeterminateKeysSet);
  emits(UPDATE_CHECKED_KEYS, [...checkedKeysSet.value]);
};
```


### 3. 勾选/取消勾选节点

```ts
const _toggleCheckbox = (node: TreeNode, isChecked: boolean) => {
  if (node.disableCheckbox) return;

  const checkedKeySet = checkedKeysSet.value;

  const toggle = (node: TreeNode, checked: boolean) => {
    checkedKeySet[checked ? 'add' : 'delete'](node.key);

    if (!props.checkedStrictly && node.children) {
      node.children.forEach(child => {
        if (!child.disableCheckbox) {
          toggle(child, checked);
        }
      });
    }
  };

  toggle(node, isChecked);

  if (props.checkedStrictly) {
    if (innerMode) triggerRef(checkedKeysSet);
  } else {
    updateCheckedKeys();
  }

  afterNodeCheck(node, !checkedKeySet.has(node.key));
};
```


---

## 六、事件系统

| 事件名            | 触发时机                             | 参数类型                                |
|----------------|------------------------------------|---------------------------------------|
| `UPDATE_CHECKED_KEYS` | 选中 keys 发生变化时                  | `(keys: TreeNodeKey[]) => void`         |
| `NODE_CHECK`        | 节点选中状态发生变化时                  | `(checkedKeys: TreeNodeKey[], info)`     |
| `NODE_CHECK_CHANGE` | 单个节点的选中状态发生改变时              | `(nodeData: TreeNodeData, checked: boolean)` |

---

## 七、API 暴露

```ts
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
```


这些方法可以被 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 或其他组合函数引用并使用，例如：

```ts
const {
  hasChecked,
  toggleCheckbox,
  checkAll,
} = useCheck({ props, treeInfo, emits, getTreeNode });
```


---

## 八、性能优化策略

- 使用 `Set` 存储 keys，提升查找效率
- 使用 `shallowRef` + `triggerRef` 控制响应式更新范围
- 在 [checkAll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L315-L331) 中避免重复创建新数组
- 对大规模数据进行防抖/节流处理（注释中标明可能优化方向）

---

## 九、未来扩展建议

- ✅ 异步加载支持：允许在展开懒加载节点后再进行勾选
- ✅ 权限过滤：根据 [disableCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L34-L34) 过滤不可选节点
- 🔄 性能优化：对 `Array.from(checkedKeysSet)` 的频繁转换做缓存处理
- 📈 提供 `getCheckedCount()` 获取当前选中数量

---

## 十、总结

[useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409) 是一个高度封装且灵活的树形结构复选框管理模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控）
- ✅ 支持父子联动和半选状态
- ✅ 保持良好的性能表现

它是构建高效、可扩展的虚拟滚动树形组件的关键模块之一。


# isLeaf?: boolean; isLast?: boolean; 有何区别？

在树形结构中，[isLeaf](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L8-L8) 和 [isLast](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L9-L9) 是两个用于描述节点特性的布尔属性，它们的用途和含义有明显区别：

---

### ✅ `isLeaf?: boolean`

#### 含义：
- 表示当前节点是否为**叶子节点（leaf node）**
- **叶子节点**指的是没有子节点的节点

#### 使用场景：
- 通常用于判断该节点是否可以展开/折叠
- 在 UI 上决定是否显示“展开图标”
- 在复选框逻辑中影响父子联动选择

#### 示例：
```text
{
  key: '1',
  title: 'Parent Node',
  isLeaf: false,
  children: [
    {
      key: '1-1',
      title: 'Leaf Node',
      isLeaf: true, // 没有 children，是叶子节点
    }
  ]
}
```


---

### ✅ `isLast?: boolean`

#### 含义：
- 表示当前节点在其父节点的子节点列表中是否是**最后一个节点**
- 主要用于样式或布局控制，如连接线绘制、缩进等视觉效果

#### 使用场景：
- 控制树连接线的显示方式（例如最后一条子节点不画竖线）
- 样式渲染时区分层级末尾节点

#### 示例：
```text
{
  key: '1',
  title: 'Parent Node',
  children: [
    { key: '1-1', title: 'First Child', isLast: false },
    { key: '1-2', title: 'Second Child', isLast: true }, // 最后一个子节点
  ]
}
```


---

## 🧠 总结对比表

| 属性       | 类型     | 含义                                 | 是否影响UI表现        | 是否参与数据逻辑 |
|------------|----------|--------------------------------------|------------------------|------------------|
| [isLeaf](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L8-L8)   | 布尔值   | 当前节点是否是叶子节点（无子节点）     | ✅ 是（展开图标、勾选逻辑） | ✅ 是             |
| [isLast](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L9-L9)   | 布尔值   | 当前节点是否是其父节点下的最后一个子节点 | ✅ 是（连接线、缩进样式） | ❌ 否             |

---

## 📌 实际应用举例（来自你提供的项目）

在 [VirtTreeNode.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L135-L147) 中可以看到如下代码片段：

```tsx
'virt-tree-node-indent-block-line-vertical--half':
  showLine && index === node.level - 2 && !!node.isLast && !isExpanded
```


这段代码表示：
- 如果启用了连接线 ([showLine](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L153-L156))
- 并且当前是倒数第二个缩进块 (`index === node.level - 2`)
- 且当前节点是最后一个子节点 (`node.isLast === true`)
- 且当前节点未展开 (`!isExpanded`)
- 则使用“半条线”样式来优化连接线显示

---

## ✅ 推荐命名建议

如果你希望更清晰表达语义，也可以考虑改名为：

```text
isLeaf -> hasChildren (取反：!hasChildren)
isLast -> isLastChild
```


这样在某些业务逻辑中可读性更强。

---

## 📎 结论

| 场景               | 使用属性     | 说明                             |
|--------------------|--------------|----------------------------------|
| 判断是否可展开     | [isLeaf](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L8-L8)     | 叶子节点不可展开                 |
| 显示连接线样式     | [isLast](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L9-L9)     | 控制最后一项子节点的连线样式     |
| 节点状态更新       | [isLeaf](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L8-L8)     | 影响复选框父子联动               |
| 缩进布局优化       | [isLast](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L9-L9)     | 控制层级缩进视觉效果             |

这两个属性配合使用，可以实现高度定制化的树形结构渲染。


# [useDrag](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L18-L586) 设计文档

[useDrag](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L18-L586) 是一个用于实现树形组件中节点拖拽功能的 Vue Composition API 模块。它提供了完整的拖拽交互逻辑，包括：

- 节点拖拽开始
- 拖拽过程中的位置判断与视觉反馈
- 拖拽结束时的数据更新与事件触发
- 自动滚动支持
- 父子节点展开/折叠控制

---

## 一、模块概述

### 📌 功能定位

[useDrag](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L18-L586) 的核心职责是：

- **提供拖拽交互能力**：通过监听鼠标事件实现拖拽行为。
- **管理拖拽状态**：如当前被拖拽节点、目标插入位置、层级变化等。
- **生成 UI 反馈**：如克隆节点、拖拽线、占位框等。
- **数据联动**：在拖拽结束后更新树结构，并触发相关事件。

---

## 二、输入参数说明

```ts
export const useDrag = ({
  props,
  virtListRef,
  dragging,
  getTreeNode,
  hasExpanded,
  expandNode,
  emits,
}: {
  props: TreeProps;
  virtListRef: ShallowRef<typeof VirtList | null>;
  dragging: Ref<boolean>;
  getTreeNode: (key: TreeNodeKey) => TreeNode | undefined;
  hasExpanded: (node: TreeNode) => boolean;
  expandNode: (key: TreeNodeKey | TreeNodeKey[], expanded: boolean) => void;
  emits: SetupContext<typeof TreeEmits>['emit'];
}) => { ... }
```


| 参数名         | 类型                         | 描述                                                                 |
|---------------|------------------------------|----------------------------------------------------------------------|
| [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95)       | [TreeProps](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L247-L247)                  | 树组件配置信息，包含 [indent](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L132-L135), [dragClass](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L221-L224), [dragGhostClass](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L225-L228) 等        |
| [virtListRef](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L255-L255) | `ShallowRef<typeof VirtList>` | 虚拟滚动列表引用，用于获取 DOM 元素和触发滚动                        |
| [dragging](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L254-L254)    | `Ref<boolean>`               | 响应式变量，表示是否正在拖拽                                         |
| [getTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289) | `(key: TreeNodeKey) => TreeNode | undefined` | 通过 key 获取节点对象的方法                                           |
| [hasExpanded](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L34-L34) | `(node: TreeNode) => boolean` | 判断节点是否已展开                                                   |
| [expandNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L138-L192)  | `(key: TreeNodeKey, expanded: boolean) => void` | 控制节点展开/收起                                                    |
| [emits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L96-L96)       | `SetupContext['emit']`       | 用于触发 [dragstart](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L135-L175) 和 `dragend` 事件                              |

---

## 三、内部状态管理

### ✅ 鼠标坐标与位置状态

| 变量名             | 类型         | 描述                     |
|------------------|--------------|--------------------------|
| `startX`, `startY` | `number`     | 鼠标按下初始位置            |
| `initialX`, `initialY` | `number`     | 拖拽元素初始偏移值           |
| `mouseX`, `mouseY` | `number`     | 当前鼠标坐标                |
| `placement`        | `'center' \| 'top' \| 'bottom' \| ''` | 当前拖拽到目标节点的哪个区域      |
| `lastPlacement`    | 同上         | 上一次的位置，用于比较是否变化   |

### ✅ 拖拽相关 DOM 引用

| 变量名              | 类型                 | 描述                             |
|-------------------|----------------------|----------------------------------|
| `sourceTreeItem`    | `HTMLElement | null` | 被拖拽的原始节点 DOM 元素         |
| `cloneTreeItem`     | `HTMLElement | null` | 拖拽过程中显示的克隆节点           |
| `hoverTreeItem`     | `HTMLElement | null` | 当前鼠标悬停的目标节点 DOM 元素     |
| `prevTreeItem`      | `HTMLElement | null` | 目标节点的前一个兄弟节点            |
| `nextTreeItem`      | `HTMLElement | null` | 目标节点的下一个兄弟节点            |
| `scrollElement`     | `HTMLElement | null` | 滚动容器，用于自动滚动支持          |

### ✅ 数据模型引用

| 变量名            | 类型                   | 描述                           |
|-----------------|------------------------|-------------------------------|
| `sourceNode`     | `TreeNode | undefined` | 被拖拽的源节点                  |
| `parentNode`     | `TreeNode | undefined` | 拖拽插入的目标父节点              |
| `prevNode`       | `TreeNode | undefined` | 拖拽插入的目标前一个节点            |
| `nextNode`       | `TreeNode | undefined` | 拖拽插入的目标后一个节点            |

### ✅ 定时器引用

| 变量名                | 类型                | 描述                             |
|---------------------|---------------------|----------------------------------|
| `sourceExpandTimer`   | `NodeJS.Timeout`    | 被拖拽节点展开/收起定时器         |
| `hoverExpandTimer`    | `NodeJS.Timeout`    | 悬浮节点自动展开定时器             |
| `autoScrollTimer`     | `NodeJS.Timeout`    | 自动滚动定时器                    |

---

## 四、关键函数说明

### 1. [onDragstart(event: MouseEvent)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L106-L127)

#### ⚙️ 功能：
- 初始化拖拽操作
- 注册全局事件监听器（mousemove / mouseup / scroll）

#### 🔁 关键流程：
1. 查找被拖拽的 `.virt-tree-item` 元素
2. 设置 `clientElementRect` 和 `scrollElement`
3. 绑定 `mousemove`, `mouseup`, `keydown`, [scroll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-list/type.ts#L64-L64) 事件

---

### 2. [dragstart()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L135-L175)

#### ⚙️ 功能：
- 创建拖拽克隆节点并添加样式类
- 触发 `DRAGSTART` 事件
- 如果节点已展开，则延迟收起

#### 🔁 关键流程：
1. 获取被拖拽节点的 [nodeKey](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L139-L139)
2. 调用 [getTreeNode(nodeKey)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289) 获取节点对象
3. 创建克隆节点 `cloneTreeItem` 并设置样式
4. 将克隆节点插入到 `body` 中

---

### 3. [dragProcess()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L226-L453)

#### ⚙️ 功能：
- 实时处理拖拽过程中的交互逻辑
- 更新插入位置、层级、连接线样式
- 处理自动展开逻辑

#### 🔁 关键流程：
1. 获取当前鼠标位置下的节点 `hoverTreeItem`
2. 计算鼠标相对于该节点顶部的比例，决定插入位置（top / center / bottom）
3. 根据插入位置更新 [dragLine](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L99-L99) 或 [dragBox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L96-L96) 的显示
4. 如果插入到中间（center），则尝试自动展开目标节点

---

### 4. [autoScroll()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L178-L224)

#### ⚙️ 功能：
- 在鼠标接近视口边缘时自动滚动容器

#### 🔁 关键逻辑：
- 根据鼠标 Y 坐标计算滚动速度
- 使用 `setInterval` 进行持续滚动
- 滚动方向由鼠标距离上下边界远近决定

---

### 5. [onMousemove(event: any)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L455-L473)

#### ⚙️ 功能：
- 拖拽过程中实时更新克隆节点位置
- 调用 [dragProcess()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L226-L453) 执行拖拽逻辑
- 触发 [autoScroll()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L178-L224) 实现自动滚动

---

### 6. [onMouseup()](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L475-L574)

#### ⚙️ 功能：
- 结束拖拽操作
- 清除所有定时器和 DOM 元素
- 触发 `DRAGEND` 事件，传递最终拖拽结果

---

### 7. [onKeydown(event: KeyboardEvent)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L575-L581)

#### ⚙️ 功能：
- 支持 ESC 键取消拖拽操作

---

## 五、UI 反馈机制

### ✅ 拖拽克隆节点

```ts
const cloneTreeItem = sourceTreeItem.cloneNode(true) as HTMLElement;
cloneTreeItem.classList.add('virt-tree-item--ghost');
document.body.append(cloneTreeItem);
```


- **用途**：提供视觉反馈，让用户知道当前正在拖拽哪个节点
- **样式类**：`.virt-tree-item--ghost`

---

### ✅ 拖拽占位框（[dragBox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L96-L96)）

```ts
dragBox.classList.add('virt-tree-drag-box');
hoverTreeItem?.appendChild(dragBox);
```


- **用途**：当拖拽至节点中心时，显示一个半透明的占位框
- **适用场景**：将节点拖入某个父节点作为其子节点

---

### ✅ 拖拽连接线（[dragLine](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L99-L99) + [levelArrow](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L103-L103)）

```ts
dragLine.classList.add('virt-tree-drag-line');
levelArrow.classList.add('virt-tree-drag-line-arrow');
```


- **用途**：当拖拽至节点上方或下方时，显示一条竖线用于指示插入位置
- **层级箭头**：根据目标层级动态调整颜色和背景色

---

## 六、事件系统

### 📣 事件定义（来自 [useTree.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts)）

```ts
const TreeEmits = {
  dragstart: (e: Event) => true,
  dragend: (info: DragEndInfo) => true,
};
```


| 事件名     | 参数类型       | 触发时机                          |
|------------|----------------|-----------------------------------|
| [dragstart](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L135-L175) | `{ sourceNode }` | 用户开始拖拽时                       |
| `dragend`   | `DragEndInfo`  | 拖拽结束时，携带插入位置信息         |

### 🧾 `DragEndInfo` 接口定义

```ts
interface DragEndInfo {
  node: TreeNode; // 被拖拽的节点
  prevNode?: TreeNode; // 插入的前一个节点
  parentNode?: TreeNode; // 插入的目标父节点
}
```


---

## 七、性能优化策略

### ✅ DOM 操作优化
- 仅在必要时更新 DOM，避免频繁重绘重排
- 使用 `hasStyleTreeItem` 缓存上次设置了样式的节点，便于清理

### ✅ 防抖与节流
- 对自动展开 (`hoverExpand`)、自动滚动 ([autoScroll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L178-L224)) 使用 `setTimeout` / `setInterval` 控制频率

### ✅ 减少重复计算
- 使用 `lastHoverTreeItem` 缓存上一个悬浮节点，减少不必要的 DOM 查询

---

## 八、扩展性设计

### 🔄 可插拔接口建议
- 提供 `beforeDrag` 钩子，允许用户自定义是否允许拖拽
- 提供 `onDrop` 回调，用于外部更新树结构数据

### 🎨 样式定制
- 支持传入 [dragClass](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L221-L224) 和 [dragGhostClass](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L225-L228)，自定义拖拽样式

---

## 九、完整调用示例

```text
const {
  onDragstart,
} = useDrag({
  props,
  virtListRef,
  dragging,
  getTreeNode,
  hasExpanded,
  expandNode,
  emits,
});

// 在 VirtTreeNode 上绑定拖拽事件
<div
  class="virt-tree-item"
  draggable
  @dragstart="onDragstart"
>
  {{ node.title }}
</div>
```


---

## 十、未来扩展建议

| 方向           | 描述                                                         |
|----------------|--------------------------------------------------------------|
| 拖拽排序算法优化 | 支持复杂嵌套结构的精确排序                                     |
| 拖拽限制       | 支持 [disableDragIn](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L35-L35), [disableDragOut](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L36-L36) 控制拖拽行为             |
| 拖拽动画       | 添加过渡动画提升用户体验                                        |
| 移动端适配     | 补充对 TouchEvent 的支持                                       |
| 拖拽热区识别   | 更智能地识别目标节点，防止误判                                   |

---

## 十一、总结

[useDrag](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L18-L586) 是 `virt-tree` 组件中实现节点拖拽的核心模块，其特点如下：

| 特性           | 描述                                                       |
|----------------|------------------------------------------------------------|
| **交互友好**     | 提供克隆节点、拖拽线、占位框等视觉反馈，增强用户体验               |
| **响应式架构**   | 使用 `ref` 和 `shallowRef` 管理状态，保证响应式更新流畅           |
| **高性能**       | 通过缓存、防抖、节流等方式优化性能                            |
| **可扩展性强**   | 支持自定义样式、钩子函数、事件回调，便于二次开发                  |

它是构建一个完整虚拟滚动树组件的关键部分之一，为用户提供了一个直观、高效的拖拽体验。

# [useExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts) 设计文档

## 一、模块概述

[useExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts) 是 `virt-tree` 组件中用于管理节点展开/收起状态的核心逻辑模块。它负责处理树形结构中节点的 **展开**、**收起**、**展开所有**、**收起所有** 等功能，并维护组件内部的响应式状态。

---

## 二、核心能力

### 1. 节点展开状态管理
- 支持 **受控模式** 和 **非受控模式**
- 提供 API 获取当前已展开的节点信息
- 自动展开所有父节点（路径展开）

### 2. 响应式更新机制
- 使用 Vue 的 `shallowRef` + `triggerRef` 实现高性能响应式更新
- 区分外部传入 [expandedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L172-L174) 与内部状态变更，避免冲突

### 3. 树状结构联动
- 支持展开/收起单个节点及其所有子节点
- 支持展开/收起所有节点

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  isLast?: boolean;
  parent?: TreeNode;
  children?: TreeNode[];
  disableSelect?: boolean;
  disableCheckbox?: boolean;
  data: T;
}
```


### 2. 状态存储

| 变量名              | 类型               | 描述                     |
|------------------|--------------------|--------------------------|
| [expandedKeysSet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L18-L18) | `shallowRef<Set>` | 当前被展开的节点 key 集合 |

---

## 四、主要函数说明

### 1. 初始化方法 [useExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts)

```ts
const useExpand = ({
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
}) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 树组件的配置属性，如 [defaultExpandAll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L170-L173)、[expandedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L174-L176)
- [virtListRef](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L255-L255): 虚拟滚动列表引用，用于触发滚动
- [parentNodeKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L256-L256): 所有非叶子节点的 key 列表
- [getTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289): 通过 key 获取节点对象的方法
- [emits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L96-L96): 事件发射器，用于触发 `UPDATE_EXPANDED_KEYS`、`NODE_EXPAND` 等事件

---

### 2. 主要方法列表

| 方法名             | 功能描述                                                                 |
|------------------|------------------------------------------------------------------------|
| [setExpandedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L34-L53)       | 设置初始展开状态，包括自动展开所有父节点                                         |
| [expandParents](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L65-L74)        | 展开指定节点的所有父节点                                                      |
| [expandParentsMod](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L76-L92)     | 改进版的 [expandParents](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L71-L77)，性能更优                                             |
| [foldParents](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L94-L100)         | 收起指定节点的所有父节点                                                      |
| [expandNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L121-L158)       | 控制单个节点的展开/收起状态                                                   |
| [toggleExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L180-L189)      | 切换某个节点的展开/收起状态                                                   |
| [expandAll](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L159-L177)         | 全部展开或全部收起所有可展开节点                                               |

---

## 五、关键实现逻辑

### 1. 状态初始化与控制权切换

- 如果用户传入了 [expandedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L174-L176)，则进入 **非受控模式**，由外部驱动状态。
- 如果未传入，则进入 **受控模式**，由组件内部维护状态，并通过 `triggerRef` 触发更新。

```ts
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
  { immediate: true }
);
```


### 2. 展开/收起节点时自动更新父节点

```ts
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
```


### 3. 切换单个节点的展开/收起状态

```ts
const toggleExpand = (node: TreeNode) => {
  if (!virtListRef.value) return;
  if (node.isLeaf) return;
  const expanded = hasExpanded(node);
  expandNode(node.key, !expanded);
  emits(NODE_EXPAND, [...expandedKeysSet.value], {
    node: node,
    expanded: !expanded,
    expandedNodes: expandedNodes,
  });
};
```


---

## 六、事件系统

| 事件名            | 触发时机                             | 参数类型                                |
|----------------|------------------------------------|---------------------------------------|
| `UPDATE_EXPANDED_KEYS` | 展开 keys 发生变化时                  | `(keys: TreeNodeKey[]) => void`         |
| `NODE_EXPAND`        | 节点展开状态发生变化时                  | `(keys: TreeNodeKey[], info)`            |

---

## 七、API 暴露

```ts
return {
  hasExpanded,
  setExpandedKeys,
  toggleExpand,
  expandNode,
  expandAll,
};
```


这些方法可以被 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 或其他组合函数引用并使用，例如：

```ts
const {
  hasExpanded,
  toggleExpand,
  expandAll,
} = useExpand({ props, virtListRef, parentNodeKeys, getTreeNode, emits });
```


---

## 八、性能优化策略

- 使用 `Set` 存储 keys，提升查找效率
- 使用 `shallowRef` + `triggerRef` 控制响应式更新范围
- 对大规模数据进行防抖/节流处理（注释中标明可能优化方向）

---

## 九、未来扩展建议

- ✅ 异步加载支持：允许在展开懒加载节点后再进行展开操作
- 🔄 性能优化：对 `Array.from(expandedKeysSet)` 的频繁转换做缓存处理
- 📈 提供 `getExpandedCount()` 获取当前展开数量

---

## 十、总结

[useExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts) 是一个高度封装且灵活的树形结构展开管理模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控）
- ✅ 支持父子联动和路径展开
- ✅ 保持良好的性能表现

它是构建高效、可扩展的虚拟滚动树形组件的关键模块之一。

# [useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts) 设计文档

---

## 一、模块概述

[useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts) 是 `virt-tree` 组件中用于实现树形结构**节点过滤与可视控制**的核心逻辑模块。它负责根据用户输入的查询条件动态隐藏/显示节点，并更新展开图标状态，以提升用户体验和界面清晰度。

该模块支持自定义过滤函数，允许开发者灵活控制节点是否应被展示，并自动处理父子节点之间的可见性联动逻辑。

---

## 二、核心能力

### ✅ 支持关键词过滤
- 提供 [doFilter(query: string)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L32-L93) 方法，支持按关键字进行模糊匹配。
- 支持通过 `props.filterMethod` 自定义过滤规则。

### ✅ 节点可见性管理
- 使用 `Set<TreeNodeKey>` 管理被隐藏的节点和隐藏展开图标的节点。
- 根据过滤结果递归判断父子节点是否应被隐藏。

### ✅ 展开图标控制
- 对于没有子节点可见的父节点，自动隐藏其展开图标（避免无意义的交互）。

### ✅ 滚动到顶部
- 过滤完成后调用 `virtListRef.value?.scrollToTop()` 实现自动滚动至顶部。

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  parent?: TreeNode;
  children?: TreeNode[];
  disableSelect?: boolean;
  disableCheckbox?: boolean;
  data: T;
  searchedIndex?: number; // 新增字段，记录关键字匹配位置
}
```


### 2. 状态存储

| 变量名                  | 类型             | 描述                           |
|-----------------------|------------------|--------------------------------|
| [hiddenNodeKeySet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L9-L9)         | `shallowRef<Set>` | 存储当前被隐藏的节点 key 集合     |
| [hiddenExpandIconKeySet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L10-L10)   | `shallowRef<Set>` | 存储需要强制隐藏展开图标的节点 key 集合 |

---

## 四、主要函数说明

### 1. 初始化方法 [useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts)

```ts
const useFilter = ({
  props,
  treeInfo,
  virtListRef,
}: {
  props: TreeProps;
  treeInfo: ShallowReactive<TreeInfo | undefined>;
  virtListRef: ShallowRef<typeof VirtList | null>;
}) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 树组件的配置属性，如 [filterMethod](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L184-L187)
- [treeInfo](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L273-L279): 树结构信息，包含所有节点及层级关系
- [virtListRef](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L255-L255): 引用虚拟滚动列表实例，用于触发滚动行为

---

### 2. 主要方法列表

| 方法名                      | 功能描述                                                                 |
|---------------------------|------------------------------------------------------------------------|
| [doFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L16-L73)       | 执行过滤操作，更新隐藏节点集合与展开图标集合，并触发视图更新                     |
| [isForceHiddenExpandIcon](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L84-L86) | 判断某个节点是否应该强制隐藏展开图标                                           |

---

## 五、关键实现逻辑

### 1. 过滤执行逻辑

```ts
function doFilter(query: string) {
  if (!filterable.value) return;

  const expandKeySet = new Set<TreeNodeKey>();
  const hiddenKeys = hiddenNodeKeySet.value;
  const hiddenExpandIconKeys = hiddenExpandIconKeySet.value;
  const family: TreeNode[] = [];
  const nodes = treeInfo.treeNodes || [];

  hiddenKeys.clear();

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      const searchedIndex =
        query === '' ? -1 : node.title?.toLowerCase().indexOf(query.toLowerCase());
      node.searchedIndex = searchedIndex;

      family.push(node);
      if (filter?.(query, node)) {
        family.forEach((member) => {
          if (!member.isLeaf) {
            expandKeySet.add(member.key);
          }
        });
      } else if (node.isLeaf) {
        hiddenKeys.add(node.key);
      }

      const children = node.children;
      if (children) {
        traverse(children);
      }

      if (!node.isLeaf) {
        if (!expandKeySet.has(node.key)) {
          hiddenKeys.add(node.key);
        } else if (children) {
          let allHidden = true;
          for (const childNode of children) {
            if (!hiddenKeys.has(childNode.key)) {
              allHidden = false;
              break;
            }
          }
          if (allHidden) {
            hiddenExpandIconKeys.add(node.key);
          } else {
            hiddenExpandIconKeys.delete(node.key);
          }
        }
      }

      family.pop();
    });
  }

  traverse(nodes);

  triggerRef(hiddenNodeKeySet);
  triggerRef(hiddenExpandIconKeySet);
  virtListRef.value?.scrollToTop();

  return expandKeySet;
}
```


#### 步骤解析：
1. **初始化过滤器**
  - 如果未提供 `filterMethod`，直接返回不处理。
2. **清空旧状态**
  - 清除上一次的隐藏节点集合。
3. **遍历树结构**
  - 使用 `family` 数组记录当前遍历路径上的所有祖先节点。
  - 若当前节点匹配查询条件，则将其所有祖先节点加入 `expandKeySet`，确保路径可展开。
  - 若为叶子节点且未匹配，则标记为隐藏。
4. **更新父节点隐藏状态**
  - 若某父节点的所有子节点均被隐藏，则该父节点也应被隐藏展开图标。
5. **触发更新**
  - 通过 `triggerRef` 更新响应式引用，通知视图刷新。
  - 滚动至顶部，使用户聚焦于新搜索结果。

---

## 六、API 暴露

```ts
return {
  hiddenExpandIconKeySet,
  hiddenNodeKeySet,
  doFilter,
  isForceHiddenExpandIcon,
};
```


这些方法可以被 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 或其他组合函数引用并使用：

```ts
const {
  doFilter,
  isForceHiddenExpandIcon,
} = useFilter({ props, treeInfo, virtListRef });
```


---

## 七、性能优化策略

- 使用 `Set` 存储 keys，提升查找效率
- 使用 `shallowRef` + `triggerRef` 控制响应式更新范围
- 避免重复创建新数组，复用已有集合
- 在大规模数据时对 [traverse](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L43-L87) 做节流或分批处理（注释中标明可能优化方向）

---

## 八、未来扩展建议

- ✅ 支持异步加载后继续过滤
- ✅ 支持高亮匹配文字
- ✅ 支持多条件组合过滤（AND/OR）
- 🔄 性能优化：对 `Array.from(hiddenNodeKeySet)` 的频繁转换做缓存处理

---

## 九、总结

[useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts) 是一个高度封装且灵活的树形结构过滤模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控）
- ✅ 支持父子联动和视觉反馈
- ✅ 保持良好的性能表现

它是构建高效、可扩展的虚拟滚动树形组件的关键模块之一。

# [useFocus](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFocus.ts#L4-L23) 设计文档

---

## 一、模块概述

[useFocus](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFocus.ts#L4-L23) 是 `virt-tree` 组件中用于管理**节点聚焦状态**的核心逻辑模块。它负责处理树形结构中节点的 **焦点控制** 和 **聚焦状态同步**，支持受控与非受控模式，并提供便捷的 API 查询当前节点是否处于聚焦状态。

该模块设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控）
- ✅ 保持良好的性能表现
- ✅ 易于集成到组合式函数体系中

---

## 二、核心能力

### ✅ 支持聚焦状态管理
- 使用 `Set<TreeNodeKey>` 存储当前聚焦的节点 key 集合。
- 提供方法判断某个节点是否已聚焦。

### ✅ 受控与非受控模式切换
- 若用户传入了 `props.focusedKeys`，则进入 **受控模式**，由外部驱动状态。
- 否则进入 **非受控模式**，由组件内部维护状态。

### ✅ 响应式更新机制
- 使用 Vue 的 `shallowRef` + `triggerRef` 实现高性能响应式更新。
- 对 props 中的 [focusedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L212-L215) 进行监听，自动同步内部状态。

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  parent?: TreeNode;
  children?: TreeNode[];
  disableSelect?: boolean;
  disableCheckbox?: boolean;
  data: T;
}
```


### 2. 状态存储

| 变量名           | 类型             | 描述                     |
|----------------|------------------|--------------------------|
| focusedKeysSet | `shallowRef<Set>` | 当前被聚焦的节点 key 集合 |

---

## 四、主要函数说明

### 1. 初始化方法 [useFocus](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFocus.ts#L4-L23)

```ts
const useFocus = ({ props }: { props: TreeProps }) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 树组件的配置属性，如 [focusedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L204-L206)

---

### 2. 主要方法列表

| 方法名       | 功能描述                         |
|------------|--------------------------------|
| hasFocused | 判断某个节点是否处于聚焦状态         |

---

## 五、关键实现逻辑

### 1. 聚焦状态初始化与控制权切换

- 如果用户传入了 [focusedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L204-L206)，则进入 **受控模式**，由外部驱动状态。
- 如果未传入，则进入 **非受控模式**，由组件内部维护状态。

```ts
watch(
  () => props.focusedKeys,
  (keys) => {
    focusedKeysSet.value = new Set(keys);
    triggerRef(focusedKeysSet);
  },
  {
    immediate: true,
  },
);
```


---

## 六、API 暴露

```ts
return {
  hasFocused,
};
```


这些方法可以被 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 或其他组合函数引用并使用，例如：

```ts
const {
  hasFocused,
} = useFocus({ props });
```


---

## 七、未来扩展建议

- ✅ 支持键盘导航聚焦（上下键、Tab 键等）
- ✅ 支持聚焦时触发事件（如 `focus`, `blur`）
- ✅ 支持聚焦节点滚动到可视区域（结合 [scrollIntoView](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-list/index.js#L152-L177)）
- 🔄 性能优化：对 `Array.from(focusedKeysSet)` 的频繁转换做缓存处理

---

## 八、总结

[useFocus](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFocus.ts#L4-L23) 是一个轻量级但功能完整的树形结构聚焦状态管理模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控）
- ✅ 保持良好的性能表现

它是构建高效、可交互的虚拟滚动树形组件的重要组成部分之一。


# [useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L4-L127) 设计文档

---

## 一、模块概述

[useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L4-L127) 是 `virt-tree` 组件中用于管理**节点选中状态**的核心逻辑模块。它负责处理树形结构中节点的 **单选/多选** 操作，支持受控与非受控模式，并提供便捷的 API 查询当前节点是否处于选中状态。

该模块设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（单选/多选）
- ✅ 保持良好的性能表现
- ✅ 易于集成到组合式函数体系中

---

## 二、核心能力

### ✅ 支持选中状态管理
- 使用 `Set<TreeNodeKey>` 存储当前选中的节点 key 集合。
- 提供方法判断某个节点是否已选中。
- 支持单选和多选模式切换（通过 [selectMultiple](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L185-L188) 控制）。

### ✅ 受控与非受控模式切换
- 若用户传入了 `props.selectedKeys`，则进入 **受控模式**，由外部驱动状态。
- 否则进入 **非受控模式**，由组件内部维护状态。

### ✅ 响应式更新机制
- 使用 Vue 的 `shallowRef` + `triggerRef` 实现高性能响应式更新。
- 对 props 中的 [selectedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L190-L193) 进行监听，自动同步内部状态。

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  parent?: TreeNode;
  children?: TreeNode[];
  disableSelect?: boolean;
  data: T;
}
```


### 2. 状态存储

| 变量名            | 类型             | 描述                     |
|-----------------|------------------|--------------------------|
| selectedKeysSet  | `shallowRef<Set>` | 当前被选中的节点 key 集合 |

---

## 四、主要函数说明

### 1. 初始化方法 [useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L4-L127)

```ts
const useSelect = ({
  props,
  treeInfo,
  emits,
  getTreeNode,
}: {
  props: TreeProps;
  treeInfo: ShallowReactive<TreeInfo | undefined>;
  emits: SetupContext<typeof TreeEmits>['emit'];
  getTreeNode: (key: TreeNodeKey) => TreeNode | undefined;
}) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 树组件的配置属性，如 [selectedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L190-L193)
- [treeInfo](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L273-L279): 树结构信息，包含所有节点及层级关系
- [emits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L96-L96): 事件发射器，用于触发 `UPDATE_SELECTED_KEYS` 和 `NODE_SELECT` 事件
- [getTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289): 通过 key 获取节点对象的方法

---

### 2. 主要方法列表

| 方法名         | 功能描述                         |
|--------------|--------------------------------|
| hasSelected  | 判断某个节点是否处于选中状态       |
| toggleSelect | 切换某个节点的选中状态（单个操作） |
| selectNode   | 手动设置指定节点为选中或未选中状态 |
| selectAll    | 全选或取消全选所有可选节点         |
| getSelected  | 获取当前所有选中的节点 key 和 data |

---

## 五、关键实现逻辑

### 1. 选中状态初始化与控制权切换

- 如果用户传入了 [selectedKeys](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L190-L193)，则进入 **受控模式**，由外部驱动状态。
- 如果未传入，则进入 **非受控模式**，由组件内部维护状态。

```ts
watch(
  () => props.selectedKeys,
  (keys) => {
    if (props.selectedKeys !== undefined) {
      innerMode = false;
      selectedKeysSet.value = new Set(keys);
      triggerRef(selectedKeysSet);
    } else {
      innerMode = true;
    }
  },
  {
    immediate: true,
  },
);
```


---

### 2. 切换单个节点的选中状态

```ts
const toggleSelect = (node: TreeNode) => {
  if (node.disableSelect) return;

  const selected = hasSelected(node);

  if (selected) {
    selectedKeysSet.value.delete(node.key);
  } else {
    if (!props.selectMultiple) {
      selectedKeysSet.value.clear();
    }
    selectedKeysSet.value.add(node.key);
  }

  if (innerMode) {
    triggerRef(selectedKeysSet);
  }

  afterNodeSelect(node, !selected);
};
```


- 如果节点被禁用选择（`disableSelect === true`），则直接返回不处理。
- 如果是多选模式（`selectMultiple === true`），则允许同时选中多个节点。
- 如果是单选模式，则清空之前的选中项，只保留当前节点。

---

### 3. 手动设置节点选中状态

```ts
const selectNode = (key: TreeNodeKey | TreeNodeKey[], selected: boolean) => {
  if (Array.isArray(key)) {
    key.forEach((k) => {
      if (selected) {
        selectedKeysSet.value.add(k);
      } else {
        selectedKeysSet.value.delete(k);
      }
    });
  } else {
    if (selected) {
      selectedKeysSet.value.add(key);
    } else {
      selectedKeysSet.value.delete(key);
    }
  }

  emits(UPDATE_SELECTED_KEYS, [...selectedKeysSet.value]);
};
```


- 支持传入单个 key 或 key 数组进行批量操作。
- 设置完成后会触发 `UPDATE_SELECTED_KEYS` 事件通知外部状态变化。

---

### 4. 全选/取消全选

```ts
const selectAll = (selected: boolean) => {
  let selectKeys: TreeNodeKey[] = [];
  if (selected) {
    selectKeys = treeInfo.allNodeKeys.filter((key) => {
      const node = getTreeNode(key);
      if (!node) return false;
      return !node.disableSelect;
    });
    selectedKeysSet.value = new Set(selectKeys);
  } else {
    selectKeys = [];
    selectedKeysSet.value.clear();
  }

  if (innerMode) {
    triggerRef(selectedKeysSet);
  }

  emits(UPDATE_SELECTED_KEYS, selectKeys);
};
```


- 支持一键全选或取消全选所有可选节点。
- 自动过滤掉不可选中的节点（`disableSelect === true`）。

---

### 5. 获取当前选中状态

```ts
const getSelected = () => {
  const selectedKeys = Array.from(selectedKeysSet.value);
  const selectedNodes: TreeNodeData[] = [];

  if (props.selectable) {
    selectedKeys.forEach((key) => {
      const node = getTreeNode(key);
      if (node) {
        selectedNodes.push(node.data);
      }
    });
  }

  return {
    selectedKeys,
    selectedNodes,
  };
};
```


- 返回当前所有选中的节点 key 和对应的原始数据。
- 可用于组件外部获取当前选中项进行后续操作。

---

### 6. 选中后触发事件

```ts
const afterNodeSelect = (node: TreeNode, selected: boolean) => {
  const { selectedKeys, selectedNodes } = getSelected();
  emits(UPDATE_SELECTED_KEYS, selectedKeys);
  emits(NODE_SELECT, selectedKeys, {
    node,
    selected,
    selectedKeys,
    selectedNodes,
  });
};
```


- 在节点状态发生变化时，触发 `UPDATE_SELECTED_KEYS` 和 `NODE_SELECT` 事件。
- 传递完整的选中 key 列表和当前节点信息，便于外部订阅并做进一步处理。

---

## 六、API 暴露

```ts
return {
  hasSelected,
  toggleSelect,

  selectNode,
  selectAll,
};
```


这些方法可以被 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 或其他组合函数引用并使用，例如：

```ts
const {
  hasSelected,
  toggleSelect,
  selectAll,
} = useSelect({ props, treeInfo, emits, getTreeNode });
```


---

## 七、事件系统

| 事件名                | 触发时机                             | 参数类型                                |
|--------------------|------------------------------------|---------------------------------------|
| `UPDATE_SELECTED_KEYS` | 选中 keys 发生变化时                  | `(keys: TreeNodeKey[]) => void`         |
| `NODE_SELECT`         | 节点选中状态发生变化时                  | `(selectedKeys: TreeNodeKey[], info)`     |

---

## 八、未来扩展建议

- ✅ 支持键盘导航选中（上下键、空格选中等）
- ✅ 支持范围选择（Shift 多选）
- 🔄 性能优化：对 `Array.from(selectedKeysSet)` 的频繁转换做缓存处理
- 📈 提供 `getSelectedCount()` 获取当前选中数量

---

## 九、总结

[useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L4-L127) 是一个轻量级但功能完整的树形结构选中状态管理模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控，单选/多选）
- ✅ 保持良好的性能表现

它是构建高效、可交互的虚拟滚动树形组件的重要组成部分之一。

# [useTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617) 设计文档

## 一、模块概述

[useTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617) 是 `virt-tree` 组件中用于构建和管理树形结构的核心逻辑模块。它负责将原始的扁平或嵌套数据转换为层级结构，并提供对节点状态（如展开、选中、勾选等）的统一管理。

该模块是组合式函数架构的一部分，与 [useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409)、[useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L4-L127) 等模块协同工作，共同支撑整个树组件的功能体系。

---

## 二、核心能力

### ✅ 树结构构建
- 支持从任意深度嵌套的 JSON 数据中生成完整的树形结构。
- 自动计算层级（level）、是否为叶子节点（isLeaf）、是否为最后一个子节点（isLast）。
- 提供 [getTreeNode(key)](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L287-L289) 方法快速访问指定节点。

### ✅ 渲染控制
- 结合虚拟滚动组件 [VirtList](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-list/index.js#L571-L831) 实现高性能渲染。
- 支持根据展开/折叠状态动态更新可视区域内的节点列表。
- 支持隐藏被过滤或未展开的节点。

### ✅ 节点操作
- 支持展开/折叠单个或全部节点。
- 支持滚动到指定节点（支持顶部/中间定位）。
- 提供点击事件处理：展开图标、复选框、节点内容点击。

### ✅ 插件化扩展
- 通过 [useCheck](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L17-L409), [useSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts#L16-L140), [useExpand](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts#L18-L236), [useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L16-L105), [useFocus](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFocus.ts#L4-L23), [useDrag](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L18-L586) 模块实现功能解耦。
- 各模块只关注自身职责，降低耦合度，便于维护和扩展。

---

## 三、数据结构定义

### 1. 类型定义（来自 [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts)）

```ts
export type TreeNodeKey = string | number;
export type TreeNodeData = Record<string, any>;

export interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;         // 唯一标识符
  level: number;            // 所在层级
  title?: string;           // 显示标题
  isLeaf?: boolean;         // 是否为叶子节点
  isLast?: boolean;         // 是否为其父节点下的最后一个子节点
  parent?: TreeNode;        // 父节点引用
  children?: TreeNode[];    // 子节点数组
  disableSelect?: boolean;  // 是否禁用选择
  disableCheckbox?: boolean; // 是否禁用复选框
  data: T;                  // 原始数据对象
}
```


### 2. 树信息存储（`treeInfo`）

| 字段名           | 类型             | 描述                           |
|----------------|------------------|------------------------------|
| treeNodesMap   | Map<TreeNodeKey, TreeNode> | 所有节点的映射表                   |
| levelNodesMap  | Map<number, TreeNode[]>     | 按层级组织的节点列表                 |
| maxLevel       | number           | 最大层级                         |
| treeNodes      | TreeNode[]       | 根节点集合                       |
| allNodeKeys    | TreeNodeKey[]    | 所有节点的 key 列表                |

---

## 四、主要函数说明

### 1. 初始化方法 [useTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617)

```ts
const useTree = (
  props: TreeProps,
  emits: SetupContext<typeof TreeEmits>['emit'],
) => { ... }
```


#### 参数说明：
- [props](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L95-L95): 组件配置项，包含树数据源、字段映射、是否可选、是否可拖拽等
- [emits](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L96-L96): 事件发射器，用于触发各种交互事件（如 scroll、select、check 等）

---

### 2. 主要方法列表

| 方法名              | 功能描述                                                                 |
|-------------------|------------------------------------------------------------------------|
| setTreeData        | 构建树结构，递归解析原始数据并生成 [treeNodesMap](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L29-L29) 和 [levelNodesMap](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L31-L31)          |
| getTreeNode        | 获取指定 key 的节点对象                                                     |
| scrollToTarget     | 将指定 key 的节点滚动到可视区域（支持 align 控制位置）                          |
| scrollToBottom     | 滚动到底部                                                           |
| scrollToTop        | 滚动到顶部                                                           |
| scrollTo           | 滚动到指定位置（支持 key 或 offset）                                       |
| onClickExpandIcon  | 展开/折叠图标的点击事件处理                                                   |
| onClickCheckbox    | 复选框点击事件处理                                                         |
| onClickNodeContent | 节点内容点击事件处理                                                       |
| filter             | 过滤节点（结合 [useFilter](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useFilter.ts#L16-L105) 实现）                                           |
| forceUpdate        | 强制刷新树结构和虚拟列表                                                      |

---

## 五、关键实现逻辑

### 1. 构建树结构 `setTreeData`

```ts
function setTreeData(list: TreeData) {
  const levelNodesMap = new Map();
  let maxLevel = 1;

  const flat = (nodes: TreeData, level: number = 1, parent?: TreeNode) => {
    const currNodes: TreeNode[] = [];
    let index = 0;
    for (const rawNode of nodes) {
      index++;
      const key = getKey(rawNode);
      const title = getTitle(rawNode);
      const children = getChildren(rawNode);
      const node: TreeNode = {
        data: rawNode,
        key,
        parent,
        level,
        title,
        disableSelect: getDisableSelect(rawNode),
        disableCheckbox: getDisableCheckbox(rawNode),
        isLeaf: !children || children.length === 0,
        isLast: index === nodes.length,
      };

      if (children && children.length) {
        node.children = flat(children, level + 1, node);
        parentNodeKeys.push(node.key);
      }

      currNodes.push(node);
      setTreeNode(key, node);
      treeInfo.allNodeKeys.push(key);

      if (level > maxLevel) maxLevel = level;

      const levelInfo = levelNodesMap.get(level);
      if (levelInfo) {
        levelInfo.push(node);
      } else {
        levelNodesMap.set(level, [node]);
      }
    }
    return currNodes;
  };

  treeInfo.treeNodes = flat(list);
  treeInfo.levelNodesMap = levelNodesMap;
  treeInfo.maxLevel = maxLevel;
}
```


- 使用递归方式遍历所有节点，自动生成 `level`、`isLeaf`、`isLast` 等属性。
- 构建 `treeNodesMap` 用于快速查找节点。
- 构建 `levelNodesMap` 用于按层级操作节点。

---

### 2. 渲染节点列表 `renderList`

```ts
const renderList = computed(() => {
  const hiddenNodeKeys = hiddenNodeKeySet.value;
  const nodes = (treeInfo && treeInfo.treeNodes) || [];
  const flattenNodes: TreeNode[] = [];

  function traverse() {
    const stack: TreeNode[] = [];
    for (let i = nodes.length - 1; i >= 0; --i) {
      stack.push(nodes[i]);
    }

    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (!hiddenNodeKeys.has(node.key)) {
        flattenNodes.push(node);
      }
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

  traverse();
  virtListRef.value?.forceUpdate();

  return flattenNodes;
});
```


- 使用栈实现非递归后序遍历（确保层级顺序正确）
- 支持根据 `hiddenNodeKeySet` 隐藏某些节点
- 只渲染当前可见的节点（已展开且未被过滤）

---

### 3. 滚动到指定节点 `scrollToTarget`

```ts
const scrollToTarget = (key: TreeNodeKey, isTop: boolean = true) => {
  const currIndex = renderList.value.findIndex((l) => l.key === key);
  if (currIndex < 0) {
    expandNode(key, true);
  }
  nextTick(() => {
    const newIndex = renderList.value.findIndex((l) => l.key === key);
    if (isTop) {
      virtListRef.value?.scrollToIndex(newIndex);
    } else {
      virtListRef.value?.scrollIntoView(newIndex);
    }
  });
};
```


- 如果目标节点不在当前渲染列表中，则先展开该节点
- 使用 `nextTick` 确保 DOM 更新后再进行滚动操作

---

### 4. 事件绑定

```ts
const onClickExpandIcon = (node: TreeNode) => {
  if (dragging.value) return;
  toggleExpand(node);
};

const onClickCheckbox = (node: TreeNode, e: Event) => {
  if (dragging.value) return;
  toggleCheckbox(node);
};

const onClickNodeContent = (node: TreeNode) => {
  if (dragging.value) return;
  if (props.selectable && !node.disableSelect) {
    toggleSelect(node);
  } else if (props.checkable && !node.disableCheckbox && props.checkOnClickNode) {
    toggleCheckbox(node);
  } else if (props.expandOnClickNode) {
    toggleExpand(node);
  }
};
```


- 区分不同交互行为（展开、勾选、选中）
- 支持配置项控制行为（如 `checkOnClickNode`）

---

## 六、事件系统

| 事件名            | 触发时机                             | 参数类型                                |
|----------------|------------------------------------|---------------------------------------|
| `scroll`        | 滚动时触发                            | `(e: Event) => void`                  |
| `toTop`        | 滚动到顶部时触发                        | `(firstItem: any) => void`             |
| `toBottom`      | 滚动到底部时触发                        | `(lastItem: any) => void`               |
| `itemResize`    | 节点高度变化时触发                      | `(id: string, newSize: number) => void` |
| `rangeUpdate`   | 可视区域变化时触发                      | `(inViewBegin: number, inViewEnd: number) => void` |
| `click`         | 节点内容点击时触发                      | `(data: TreeNodeData, node: TreeNode, e: MouseEvent) => void` |
| `expand`        | 节点展开/折叠时触发                     | `(expandKeys: Array<string | number>, info) => void` |
| `update:expandedKeys` | 更新展开节点 keys 时触发                  | `(expandedKeys: TreeNodeKey[]) => void` |
| `select`        | 节点选中状态变化时触发                    | `(selectedKeys: TreeNodeKey[], info) => void` |
| `update:selectedKeys` | 更新选中节点 keys 时触发                  | `(selectedKeys: TreeNodeKey[]) => void` |
| `check`         | 节点勾选状态变化时触发                    | `(checkedKeys: TreeNodeKey[], info) => void` |
| `check-change`  | 单个节点勾选状态变化时触发                  | `(data: TreeNodeData, checked: boolean) => void` |
| `update:checkedKeys` | 更新勾选节点 keys 时触发                  | `(checkedKeys: TreeNodeKey[]) => void` |
| `dragstart`     | 拖拽开始时触发                         | `(sourceNode: TreeNodeData) => void`     |
| `dragend`       | 拖拽结束时触发                         | `(node: TreeNode, prevNode?, parentNode?) => void` |

---

## 七、API 暴露

```ts
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
```


这些方法可以被 `VirtTree` 或其他组合函数引用并使用：

```ts
const {
  hasExpanded,
  toggleExpand,
  expandAll,
} = useTree(props, emits);
```


---

## 八、性能优化策略

- ✅ **使用 Map 快速查找**：通过 `treeNodesMap` 快速获取节点对象
- ✅ **虚拟滚动配合懒加载**：仅渲染可视区域内的节点，减少 DOM 数量
- ✅ **防抖/节流处理高频事件**：如 resize、filter、scroll 等
- ✅ **shallowReactive 减少响应式开销**：避免深层监听不必要的属性

---

## 九、未来扩展建议

- ✅ **异步加载支持**：允许在展开懒加载节点后再请求子节点数据
- ✅ **权限控制**：根据 `disableSelect` / `disableCheckbox` 过滤不可操作节点
- 🔄 **优化 renderList 性能**：对 `Array.from(renderList)` 的频繁转换做缓存
- 📈 **提供快捷 API 获取统计信息**：如 `getNodeCount()`、`getExpandedCount()`、`getCheckedCount()`

---

## 十、总结

`useTree` 是 `virt-tree` 组件中最核心的树结构管理模块，其设计目标是：

- ✅ 提供清晰的 API 接口
- ✅ 支持多种使用场景（受控/非受控，展开/收起，选中/勾选）
- ✅ 高性能渲染大型树形结构
- ✅ 易于集成和扩展

它是构建高效、可交互、可定制化的虚拟滚动树形组件的关键模块之一。


# [VirtTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-tree/VirtTreeNode.js#L78-L242) 组件设计文档

## 一、组件概述

[VirtTreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-tree/VirtTreeNode.js#L78-L242) 是 `virt-tree` 虚拟滚动树形组件中的**单个节点组件**，负责渲染一个树形结构中的具体节点，并处理与其相关的交互行为（如点击展开/收起、勾选、拖拽等）。

它作为 [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx) 的子组件存在，由虚拟滚动器 [VirtList](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-list/index.tsx) 渲染并管理生命周期。

---

## 二、核心功能

### ✅ 1. 树节点渲染
- 支持缩进展示层级关系
- 支持图标、复选框、内容区域的自定义渲染
- 支持连接线样式（可选）

### ✅ 2. 交互支持
- 点击展开/收起（折叠图标）
- 点击复选框（支持父子联动）
- 点击节点内容区域触发选择事件
- 拖拽排序支持（可配置）

### ✅ 3. 状态控制
- 当前是否展开 ([isExpanded](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L153-L153))
- 是否被选中 ([isSelected](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L54-L57))
- 是否被勾选 ([isChecked](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L67-L70))
- 半选状态 ([isIndeterminate](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L71-L74))
- 是否禁用勾选 ([disableCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L34-L34))
- 是否可拖拽 ([draggable](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L217-L220))

---

## 三、属性说明（Props）

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|-------|------|
| [node](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L9-L13) | [TreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L4-L16) | `{}` | 当前节点数据对象，包含层级信息、标题、key 等 |
| [minSize](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L123-L126) | `number` | `32` | 节点最小高度 |
| [fixed](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L128-L131) | `boolean` | `false` | 是否固定高度 |
| [showLine](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L153-L156) | `boolean` | `false` | 是否显示连接线 |
| [indent](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L132-L135) | `number` | `16` | 缩进像素数，用于层级展示 |
| [iconSize](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L136-L139) | `number` | `16` | 展开图标的大小 |
| [itemGap](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L140-L143) | `number` | `0` | 节点与上下元素之间的间距 |
| [hiddenExpandIcon](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L40-L43) | `boolean` | `false` | 是否隐藏展开图标 |
| [isExpanded](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L153-L153) | `boolean` | `false` | 当前节点是否已展开 |
| [selectable](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L181-L184) | `boolean` | `false` | 是否可选中 |
| [isSelected](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L54-L57) | `boolean` | `false` | 是否已被选中 |
| [disableSelect](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L33-L33) | `boolean` | `false` | 是否禁用选中功能 |
| [checkable](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L194-L197) | `boolean` | `false` | 是否可勾选 |
| [isChecked](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L67-L70) | `boolean` | `false` | 是否已被勾选 |
| [isIndeterminate](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L71-L74) | `boolean` | `false` | 是否为半选状态 |
| [disableCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L34-L34) | `boolean` | `false` | 是否禁用复选框 |
| [isFocused](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L80-L83) | `boolean` | `false` | 是否获得焦点 |
| [draggable](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L217-L220) | `boolean` | `false` | 是否可拖拽 |

---

## 四、事件说明（Events）

| 事件名 | 参数类型 | 触发时机 |
|--------|----------|----------|
| `clickExpandIcon` | `(node: TreeNode)` | 点击展开图标时触发 |
| `clickNodeContent` | `(node: TreeNode)` | 点击节点内容时触发 |
| `clickCheckbox` | `(node: TreeNode)` | 点击复选框时触发 |
| [dragstart](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts#L135-L175) | `(e: Event)` | 开始拖拽时触发 |

---

## 五、插槽（Slots）

| 插槽名 | 参数 | 描述 |
|--------|------|------|
| `default` | `(node: TreeNode, data: any, isExpanded: boolean)` | 自定义整个节点渲染模板 |
| `icon` | `(node: TreeNode, isExpanded: boolean)` | 自定义展开图标渲染 |
| `checkbox` | - | 自定义复选框样式（暂未直接暴露） |
| `content` | `(node: TreeNode)` | 自定义节点内容渲染 |

---

## 六、UI 结构与样式系统

### 1. 基本结构

```html
<div class="virt-tree-node">
  <!-- 缩进块 -->
  <div class="virt-tree-node-indent">...</div>
  <!-- 图标 -->
  <div class="virt-tree-icon-wrapper">...</div>
  <!-- 复选框 -->
  <div class="virt-tree-checkbox-wrapper">...</div>
  <!-- 内容 -->
  <div class="virt-tree-node-content">...</div>
</div>
```


### 2. 样式类名

| 类名 | 含义 |
|------|------|
| `.virt-tree-node` | 节点根容器 |
| `.virt-tree-node--selected` / `.is-selected` | 当前节点是否被选中 |
| `.virt-tree-node--focused` / `.is-focused` | 当前节点是否获得焦点 |
| `.virt-tree-node--disabled` / `.is-disabled` | 当前节点是否被禁用 |
| `.virt-tree-node-indent-block` | 缩进块，用于层级表示 |
| `.virt-tree-node-indent-block-line-vertical` | 竖直连接线 |
| `.virt-tree-node-indent-block-line-horizontal` | 横向连接线 |
| `.virt-tree-node-indent-block-line-vertical--half` | 半条竖线，用于最后一个子节点 |
| `.virt-tree-icon-wrapper` / `.is-expanded` | 图标容器及展开状态 |
| `.virt-tree-checkbox` / `.is-checked` / `.is-indeterminate` / `.is-disabled` | 复选框样式及状态 |
| `.virt-tree-node-content` / `.is-fixed-height` | 节点内容区及固定高度样式 |

---

## 七、关键实现逻辑

### 1. 缩进与层级表示

通过 `node.level` 和 [indent](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L132-L135) 计算缩进块数量和宽度，构建清晰的层级结构。例如：

```ts
for (let index = 0; index <= node.level - 2; index++) {
  test.push(
    _h('div', {
      class: {
        'virt-tree-node-indent-block': true,
        'virt-tree-node-indent-block-line-vertical': showLine,
        'virt-tree-node-indent-block-line-horizontal': showLine && index === node.level - 2,
        'virt-tree-node-indent-block-line-vertical--half': showLine && index === node.level - 2 && !!node.isLast && !isExpanded,
      },
      style: {
        width: `${indent}px`,
        height: itemGap > 0 ? `calc(100% + ${itemGap}px)` : `100%`,
        transform: `translateY(-${itemGap / 2}px)`,
      },
    })
  );
}
```


### 2. 图标与展开逻辑

默认提供 SVG 箭头图标，支持自定义渲染：

```tsx
const defaultIcon = _h(...);
const slotIcon = getSlot(this, 'icon') ? getSlot(this, 'icon')?.(node, isExpanded) : defaultIcon;
```


点击图标时会触发 `clickExpandIcon` 事件，通知父组件更新展开状态。

### 3. 复选框逻辑

根据 `checkable` 控制是否显示复选框，使用以下状态控制：
- `isChecked`: 是否已选中
- `isIndeterminate`: 是否半选
- `disableCheckbox`: 是否禁用

```tsx
const slotCheckbox = checkable
  ? _h('div', {
      class: {
        'virt-tree-checkbox': true,
        'is-checked': isChecked,
        'is-indeterminate': isIndeterminate,
        'is-disabled': disableCheckbox,
      },
      on: { click: onClickCheckbox }
    })
  : null;
```


### 4. 内容与交互

内容部分支持自定义插槽或默认显示 `node.title`，并绑定点击事件以触发 `clickNodeContent` 事件。

```tsx
const slotContent = _h('div', {
  class: {
    'virt-tree-node-content': true,
    'is-fixed': fixed,
  },
  on: { click: onClickNodeContent },
}, [
  getSlot(this, 'content') ? getSlot(this, 'content')?.(node) : node.title
]);
```


---

## 八、性能优化策略

### ✅ 使用 `shallowRef` 控制响应式范围
- 只在必要时触发更新，避免频繁重绘

### ✅ 虚拟滚动兼容性优化
- 与 [VirtList](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-list/index.tsx) 高度配合，仅渲染可视区域内的节点

### ✅ ResizeObserver 监听
- 对动态高度节点进行监听，确保布局正确

---

## 九、API 设计

### 1. Props API

```ts
export const treeNodeProps = {
  node: {
    type: Object as PropType<TreeNode>,
    required: true,
  },
  minSize: { type: Number, default: 32 },
  fixed: { type: Boolean, default: false },
  showLine: { type: Boolean, default: false },
  indent: { type: Number, default: 16 },
  iconSize: { type: Number, default: 16 },
  itemGap: { type: Number, default: 0 },
  hiddenExpandIcon: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  disableSelect: { type: Boolean, default: false },
  checkable: { type: Boolean, default: false },
  isChecked: { type: Boolean, default: false },
  isIndeterminate: { type: Boolean, default: false },
  disableCheckbox: { type: Boolean, default: false },
  isFocused: { type: Boolean, default: false },
  draggable: { type: Boolean, default: false },
};
```


### 2. Events API

```ts
emits: ['clickExpandIcon', 'clickNodeContent', 'clickCheckbox', 'dragstart']
```


---

## 十、扩展建议

### ✅ 支持异步加载
- 在 `node.isLeaf === false` 且未加载子节点时，允许点击后懒加载

### ✅ 键盘导航支持
- 支持键盘方向键切换节点
- 支持回车键触发选中或展开

### ✅ 动画过渡
- 添加展开/收起动画
- 添加勾选/取消勾选动画

### ✅ 拖拽反馈增强
- 提供拖拽过程中的视觉反馈
- 支持拖拽放置位置高亮提示

---

## 十一、总结

`VirtTreeNode` 是 `virt-tree` 组件中最小的 UI 单位，承载了 **节点渲染、交互、状态管理、样式控制** 等多重职责。

其设计目标是：
- ✅ 高度可定制化：支持插槽自定义渲染
- ✅ 高性能：与虚拟滚动无缝衔接，减少 DOM 操作
- ✅ 状态清晰：支持选中、勾选、展开等多种状态
- ✅ 样式灵活：支持连接线、缩进、图标等视觉表现

它是构建高效、可扩展、用户友好的树形组件的核心单元之一。


# [VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 组件设计文档

## 一、组件概述

[VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 是一个基于 Vue 的虚拟滚动树形组件，旨在高效渲染大型树形结构数据。

它结合了 **虚拟滚动** 和 **树形结构** 的特性，实现高性能的层级数据展示与交互。

---

## 二、核心功能

### ✅ 1. 虚拟滚动（Virtual Scrolling）

- **目的**：仅渲染当前可视区域内的节点，减少 DOM 数量。
- **实现**：
  - 使用 `virt-list` 实现垂直方向上的虚拟滚动。
  - 支持固定高度或动态计算每个节点的高度。
  - 自动监听容器尺寸变化并更新可视区域范围。

### ✅ 2. 树形结构支持

- **嵌套层级**：支持无限层级展开/收起操作。
- **节点状态**：包括展开、选中、禁用、焦点等。
- **图标与缩进**：通过缩进和箭头图标清晰展示层级关系。

### ✅ 3. 可选功能模块

| 功能 | 描述 |
|------|------|
| 复选框（Checkable） | 支持多选、半选状态。 |
| 可选择（Selectable） | 点击节点触发选中。 |
| 拖拽排序（Draggable） | 支持节点拖拽排序。 |
| 过滤搜索（Filtering） | 支持按关键字过滤显示节点。 |
| 聚焦（Focus） | 支持键盘导航与聚焦高亮。 |
| 粘性头部/尾部（Sticky Header/Footer） | 支持固定位置内容。 |

---

## 三、技术架构

### 1. 基础组件结构

```
VirtTree
├── VirtList (虚拟滚动)
│   └── VirtTreeNode (单个树节点)
└── Tree Core Logic (useXXX 系列组合函数)
```


### 2. 主要文件说明

| 文件名 | 功能 |
|--------|------|
| [VirtTree.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx) | 根组件，负责接收 props 并调用 [useTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617) 初始化树结构，使用 [VirtList](file:///Users/longmo/WebstormProjects/vue-virt-list/lib/components/virt-list/index.js#L571-L831) 渲染可视节点。 |
| [VirtTreeNode.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx) | 单个节点组件，处理点击、展开、勾选等交互行为。 |
| [useTree.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts) | 核心逻辑，构建树结构、管理节点状态、提供 API。 |
| [useCheck.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts) | 处理复选框逻辑，如全选、半选、父子联动。 |
| [useSelect.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useSelect.ts) | 处理节点选中状态。 |
| [useExpand.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useExpand.ts) | 控制节点展开/收起状态。 |
| [useDrag.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useDrag.ts) | 支持节点拖拽排序。 |
| [type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts) | 定义类型，如 [TreeNode](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L4-L16), [TreeProps](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L247-L247) 等。 |

---

## 四、API 设计

### 1. Props

```ts
interface TreeProps {
    // 树数据源
    treeData: TreeNode[];
    // 字段映射
    fieldNames?: TreeFieldNames;
    // 是否可勾选
    checkable?: boolean;
    // 是否可选择
    selectable?: boolean;
    // 是否可拖拽
    draggable?: boolean;
    // 展开图标是否隐藏
    hiddenExpandIcon?: boolean;
    // 节点最小高度
    minSize?: number;
    // 是否固定高度
    fixed?: boolean;
    // 缩进像素
    indent?: number;
    // 图标大小
    iconSize?: number;
    // 显示连接线
    showLine?: boolean;
    // 初始展开的 key 列表
    defaultExpandedKeys?: TreeNodeKey[];
    // 初始选中的 key 列表
    checkedKeys?: TreeNodeKey[];
}
```


### 2. Events

```ts
const TreeEmits = {
    clickExpandIcon: (node: TreeNode) => true,
    clickNodeContent: (node: TreeNode) => true,
    clickCheckbox: (node: TreeNode) => true,
    dragstart: (e: Event) => true,
    scroll: (e: Event) => e,
    toTop: (firstItem: any) => firstItem,
    toBottom: (lastItem: any) => lastItem,
};
```


### 3. Slots

| 插槽名                             | 用途          |
|----------------------------------|-------------|
| `default`                        | 自定义整个节点渲染模板 |
| `content`                        | 自定义节点内容     |
| `icon`                           | 自定义展开图标     |
| `checkbox`                       | 自定义复选框样式    |
| `stickyHeader` / `stickyFooter`  | 固定在顶部/底部的内容 |

---

## 五、性能优化策略

### ✅ 1. 虚拟滚动

- **按需渲染**：只渲染当前可视区域内的节点，极大减少 DOM 节点数量。
- **动态高度计算**：根据实际节点高度调整滚动区域占位尺寸。

### ✅ 2. 数据扁平化

- 将原始树结构扁平化为一维数组，便于快速访问和渲染。

### ✅ 3. ResizeObserver 监听

- 监听每个节点的实际高度变化，自动更新布局。

### ✅ 4. 防抖/节流

- 对高频事件（如滚动、窗口变化）进行防抖或节流处理。

---

## 六、样式系统

- **CSS Variables**：使用 CSS 变量统一控制主题色、字体、间距等样式。
- **Dark Mode 支持**：通过 `.dark` 类切换暗色模式。
- **自定义类名**：支持传入 `class` 或 `style` 自定义节点外观。

---

## 七、示例代码

```vue
<template>
  <VirtTree
      :tree-data="treeData"
      checkable
      selectable
      show-line
      @click-node-content="handleClick"
      @click-checkbox="handleCheck"
  >
    <template #content="{ node }">
      {{ node.title }}
    </template>
  </VirtTree>
</template>

<script setup>
import { VirtTree } from 'virt-tree';

const treeData = [
  {
    title: 'Parent 1',
    key: '1',
    children: [
      { title: 'Child 1', key: '1-1' },
      { title: 'Child 2', key: '1-2' }
    ]
  }
];
</script>
```


---

## 八、关键实现细节

### 1. 节点渲染逻辑

#### 📌 使用 `VirtList` 渲染虚拟滚动：

```tsx
<h2Slot
  VirtList
  list={renderList}
  itemKey="key"
  minSize={minSize}
  fixed={fixed}
  itemGap={itemGap}
  buffer={buffer}
  itemClass="virt-tree-item"
  onScroll={onScroll}
  onToTop={onToTop}
  onToBottom={onToBottom}
  onItemResize={onItemResize}
  onRangeUpdate={onRangeUpdate}
>
  <template #default="{ itemData, index }">
    <VirtTreeNode
        node={itemData}
        minSize={minSize}
        fixed={fixed}
        indent={indent}
        iconSize={iconSize}
        showLine={showLine}
        itemGap={itemGap}
        hiddenExpandIcon={isForceHiddenExpandIcon(itemData)}
        isExpanded={hasExpanded(itemData)}
        selectable={selectable}
        isSelected={hasSelected(itemData)}
        disableSelect={itemData.disableSelect}
        checkable={checkable}
        isChecked={hasChecked(itemData)}
        isIndeterminate={hasIndeterminate(itemData)}
        disableCheckbox={itemData.disableCheckbox}
        isFocused={hasFocused(itemData)}
        draggable={draggable}
        onClickExpandIcon={() => onClickExpandIcon(itemData)}
        onClickNodeContent={() => onClickNodeContent(itemData)}
        onClickCheckbox={() => onClickCheckbox(itemData)}
        onDragstart={(e) => onDragstart(e, itemData)}
    />
  </template>
</h2Slot>
```


### 2. 树结构构建

#### 🧱 构建方式：

- 使用 `useTree` 函数从 `props.treeData` 中构建完整的树状结构。
- 扁平化所有节点以便于查找和渲染。
- 维护节点层级信息（level）、父节点引用、子节点列表等。

```ts
const useTree = (props: TreeProps, emits: EmitFunction<TreeNode>) => {
  const treeInfo = buildTree(props.treeData);
  return {
    treeInfo,
    renderList: computed(() => filterVisibleNodes(treeInfo)),
    hasExpanded,
    isForceHiddenExpandIcon,
    ...
  };
};
```


### 3. 节点状态管理

#### 🧠 使用多个组合函数管理不同状态：

- `useCheck`：处理复选框状态及父子联动。
- `useSelect`：管理节点选中状态。
- `useExpand`：控制节点展开/收起。
- `useDrag`：支持节点拖拽排序。

---

## 九、UI 结构与样式系统

### 1. 基本结构

```html
<div class="virt-tree">
  <!-- 虚拟滚动器 -->
  <VirtList :list="renderList" :minSize="minSize" ...>
    <!-- 单个树节点 -->
    <VirtTreeNode v-for="node in renderList" :key="node.key" ...>
      <!-- 缩进块 -->
      <div class="virt-tree-node-indent">...</div>
      <!-- 展开图标 -->
      <div class="virt-tree-icon-wrapper">...</div>
      <!-- 复选框 -->
      <div class="virt-tree-checkbox-wrapper">...</div>
      <!-- 内容区域 -->
      <div class="virt-tree-node-content">...</div>
    </VirtTreeNode>
  </VirtList>
</div>
```


### 2. 样式类名

| 类名 | 含义 |
|------|------|
| `.virt-tree` | 根容器 |
| `.virt-tree__client` | 滚动容器 |
| `.virt-tree-node` | 节点根容器 |
| `.virt-tree-node--selected` / `.is-selected` | 当前节点是否被选中 |
| `.virt-tree-node--focused` / `.is-focused` | 当前节点是否获得焦点 |
| `.virt-tree-node--disabled` / `.is-disabled` | 当前节点是否被禁用 |
| `.virt-tree-node-indent-block` | 缩进块，用于层级表示 |
| `.virt-tree-node-indent-block-line-vertical` | 竖直连接线 |
| `.virt-tree-node-indent-block-line-horizontal` | 横向连接线 |
| `.virt-tree-node-indent-block-line-vertical--half` | 半条竖线，用于最后一个子节点 |
| `.virt-tree-icon-wrapper` / `.is-expanded` | 图标容器及展开状态 |
| `.virt-tree-checkbox` / `.is-checked` / `.is-indeterminate` / `.is-disabled` | 复选框样式及状态 |
| `.virt-tree-node-content` / `.is-fixed-height` | 节点内容区及固定高度样式 |

---

## 十、扩展建议

- ✅ **异步加载子节点**：支持懒加载子节点，避免一次性加载全部数据。
- ✅ **键盘导航支持**：支持上下键切换节点，空格键选中节点。
- ✅ **右键菜单支持**：支持复制路径、删除节点等功能。
- ✅ **动画过渡**：添加展开/收起、勾选/取消勾选等动画效果。

---

## 十一、总结

[VirtTree](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx#L12-L155) 是一个高性能、可定制化的树形组件，适用于需要展示大量层级数据的场景。

其结合虚拟滚动与树形结构的优势，使得即使面对成百上千条数据也能保持流畅体验。

主要优势包括：

- ✅ 高性能渲染：仅渲染可视区域内节点，减少 DOM 操作。
- ✅ 丰富的交互：支持选中、勾选、拖拽等多种用户交互。
- ✅ 状态管理：清晰的响应式状态维护，支持父子联动、半选等复杂逻辑。
- ✅ 样式灵活：支持连接线、缩进、图标等视觉表现。
- ✅ 可扩展性强：支持插槽、异步加载、键盘导航等高级功能。

它是构建企业级管理系统、资源管理器、组织架构图等 UI 的理想选择。