为了实现 `virt-tree` 组件的懒加载功能，我们需要在不一次性加载全部数据的前提下，按需请求和渲染子节点。以下是详细的实现思路与步骤：

---

## 一、核心目标

- **支持懒加载**：仅在用户展开某个父节点时才加载其子节点。
- **兼容虚拟滚动**：确保懒加载逻辑与现有的虚拟滚动机制无缝结合。
- **保持用户体验流畅**：避免加载过程中出现空白或卡顿。

---

## 二、关键改动点

### 1. 数据结构扩展（[type.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L4-L16)）

```ts
interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;
  level: number;
  title?: string;
  isLeaf?: boolean;
  isLast?: boolean;
  parent?: TreeNode;
  children?: TreeNode[]; // 初始为空数组
  disableSelect?: boolean;
  disableCheckbox?: boolean;
  data: T;
  isLoaded?: boolean; // 是否已加载过子节点
  isLoading?: boolean; // 是否正在加载子节点
}
```


新增字段：
- `isLoaded`: 标记该节点是否已经加载过子节点。
- `isLoading`: 显示加载状态（可选），用于 UI 上展示加载动画。

---

### 2. 新增懒加载回调函数（[useTree.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useTree.ts#L249-L617)）

```ts
const useTree = (props: TreeProps, emits: SetupContext<typeof TreeEmits>['emit']) => {
  const loadMore = async (node: TreeNode) => {
    if (node.isLeaf || node.isLoaded || node.isLoading) return;

    node.isLoading = true;

    try {
      const children = await props.loadMore(node); // 用户传入的异步加载函数
      node.children = children.map(child => ({
        ...child,
        level: node.level + 1,
        parent: node,
        isLeaf: !child.children?.length,
        isLoaded: false,
        isLoading: false,
      }));

      node.isLoaded = true;
    } catch (e) {
      console.error('Failed to load children:', e);
    } finally {
      node.isLoading = false;
    }

    updateVisibleNodes();
  };
};
```


#### 参数说明：
- `loadMore(node: TreeNode): Promise<TreeNode[]>`：由用户传入的异步加载函数，负责根据当前节点获取子节点数据。

---

### 3. 在点击展开图标时触发懒加载（[VirtTreeNode.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTreeNode.tsx#L135-L147)）

```tsx
const handleExpandIconClick = () => {
  if (!node.isLeaf && !node.isLoaded && props.loadMore) {
    loadMore(node).then(() => {
      toggleExpanded(node.key);
    });
  } else {
    toggleExpanded(node.key);
  }
};
```


- 如果节点未加载且有 `loadMore` 方法，则先调用加载函数再展开。
- 否则直接切换展开/收起状态。

---

### 4. 暴露 `loadMore` 属性给组件外部使用（[VirtTree.tsx](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/VirtTree.tsx)）

```ts
export interface TreeProps extends BaseListProps<TreeNodeData> {
  treeData: TreeNode[];
  fieldNames?: TreeFieldNames;
  checkable?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  hiddenExpandIcon?: boolean;
  minSize?: number;
  fixed?: boolean;
  indent?: number;
  iconSize?: number;
  showLine?: boolean;
  defaultExpandedKeys?: TreeNodeKey[];
  checkedKeys?: TreeNodeKey[];
  loadMore?: (node: TreeNode) => Promise<TreeNode[]>; // 新增
}
```


---

## 三、UI 支持（可选）

可以在节点上显示加载状态：

```tsx
{node.isLoading ? (
  <span class="loading-indicator">Loading...</span>
) : (
  <span class="expand-icon">{isExpanded ? '▼' : '▶'}</span>
)}
```


同时可以添加 CSS 动画增强体验：

```css
.loading-indicator::after {
  content: '.';
  animation: dots 1s steps(5, end) infinite;
}

@keyframes dots {
  0%, 100% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}
```


---

## 四、使用示例

```vue
<template>
  <VirtTree
    :tree-data="treeData"
    :load-more="loadMore"
    @click-node-content="handleClick"
  />
</template>

<script setup>
import { VirtTree } from 'virt-tree';

const treeData = [
  {
    title: 'Lazy Parent',
    key: 'lazy-1',
    isLeaf: false,
    children: [],
  },
];

const loadMore = async (node) => {
  // 模拟异步请求
  const response = await fetch(`/api/tree/children?parentId=${node.key}`);
  const children = await response.json();

  return children.map(child => ({
    title: child.name,
    key: child.id,
    isLeaf: !child.hasChildren,
  }));
};
</script>
```


---

## 五、性能优化建议

| 优化点 | 描述 |
|--------|------|
| ✅ 防止重复加载 | 若 `isLoaded === true`，不再调用 `loadMore` |
| 🔄 加载失败重试机制 | 可添加“重试”按钮或自动重试逻辑 |
| 🔁 节点回收策略 | 对于长时间未展开的节点，可清空其 `children` 释放内存 |
| 📈 缓存机制 | 可缓存已加载过的节点路径，提升二次访问速度 |

---

## 六、总结

通过以下关键步骤即可为 `virt-tree` 添加懒加载能力：

1. 扩展 `TreeNode` 类型，增加 `isLoaded` 和 `isLoading` 字段；
2. 在 `useTree` 中实现 `loadMore` 异步加载方法；
3. 在点击展开图标时触发加载；
4. 提供 `loadMore` prop 给组件使用者；
5. （可选）添加 UI 加载指示器提升用户体验；
6. 增加防重复加载、缓存等优化策略。

最终效果如下图所示（假设节点首次展开时触发网络请求加载子节点）：

```
Lazy Parent [▶]
└── Loading...
```


加载完成后变为：

```
Lazy Parent [▼]
├── Child 1
├── Child 2
└── Child 3
```

# 上述修改后是否会影响复选框选中的逻辑

在 `virt-tree` 组件中引入 **懒加载** 功能后，是否会影响复选框的选中逻辑，取决于具体实现方式和设计决策。以下是对该问题的详细分析：

---

## ✅ 结论

> **默认情况下，懒加载不会影响复选框的选中逻辑**，但需要合理设计数据结构与状态管理机制。

---

## 一、为什么懒加载本身不影响复选框逻辑？

### 1. 复选框状态存储是基于 [key](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L5-L5)
- 在 [useCheck.ts](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts) 中，复选框的状态（如 [checkedKeysSet](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L45-L45)）是通过节点的 [key](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L5-L5) 来维护的。
- 即使子节点尚未加载，只要其父节点存在，并且其 key 是已知的，就可以进行勾选操作。

### 2. 父子联动更新逻辑是基于层级关系
- 父节点的勾选状态是由其所有子节点的状态决定的。
- 如果某个子节点未加载，它就不会出现在 [children](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/type.ts#L11-L11) 列表中，也不会参与勾选状态的计算。

### 3. 勾选行为可以异步处理
- 当用户勾选一个未加载的节点时，组件可以先记录其 key，等实际数据加载后再同步状态。

---

## 二、可能受影响的场景及解决方案

| 场景 | 是否影响勾选逻辑 | 说明 | 解决方案 |
|------|------------------|------|----------|
| 用户勾选一个尚未加载的子节点 | ✅ 可能影响 | 若直接触发 [_toggleCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L173-L212) 而子节点不存在，则无法递归设置子节点状态 | 添加判断：若未加载，则只标记当前节点为勾选，延迟更新子节点状态 |
| 某个节点被勾选后，展开时才加载子节点 | ✅ 需要同步状态 | 子节点加载完成后应继承父节点的勾选状态 | 加载完子节点后调用 `updateCheckedKeys()` 同步父子状态 |
| 全选操作时部分节点未加载 | ✅ 需要控制范围 | 若某些节点未加载，全选是否应包含这些节点？ | 提供配置项：`checkUnloadedNodes?: boolean` 控制是否勾选未加载节点 |
| 异步加载失败或取消加载 | ⚠️ 可能导致状态不一致 | 若加载失败，已勾选的 key 如何处理？ | 提供错误回调并允许重试机制，或自动移除无效 key |

---

## 三、建议的设计优化

### ✅ 1. 支持“预勾选”未加载节点

```ts
const _toggleCheckbox = (node: TreeNode, isChecked: boolean) => {
  if (node.disableCheckbox) return;

  const checkedKeySet = checkedKeysSet.value;

  // 如果节点未加载，仅记录当前节点状态，不处理子节点
  if (!node.isLoaded && !props.checkedStrictly) {
    checkedKeySet[isChecked ? 'add' : 'delete'](node.key);
    return;
  }

  // 正常处理子节点
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

  updateCheckedKeys();
};
```


### ✅ 2. 加载子节点后自动同步状态

```ts
const loadMore = async (node: TreeNode) => {
  node.isLoading = true;

  try {
    const children = await props.loadMore(node);
    node.children = children.map(child => ({
      ...child,
      level: node.level + 1,
      parent: node,
      isLeaf: !child.children?.length,
      isLoaded: false,
      isLoading: false,
    }));

    node.isLoaded = true;

    // 如果当前节点已被勾选，自动同步子节点状态
    if (checkedKeysSet.value.has(node.key)) {
      node.children.forEach(child => {
        checkedKeysSet.value.add(child.key);
      });
    }
  } catch (e) {
    console.error('Failed to load children:', e);
  } finally {
    node.isLoading = false;
  }

  updateVisibleNodes();
};
```


### ✅ 3. 提供配置项控制未加载节点是否可勾选

```ts
interface TreeProps extends BaseListProps<TreeNodeData> {
  checkable?: boolean;
  checkedKeys?: TreeNodeKey[];
  loadMore?: (node: TreeNode) => Promise<TreeNode[]>;
  checkUnloadedNodes?: boolean; // 新增配置项
}
```


使用示例：

```ts
const _toggleCheckbox = (node: TreeNode, isChecked: boolean) => {
  if (node.disableCheckbox) return;

  const checkedKeySet = checkedKeysSet.value;

  if (!node.isLoaded && !props.checkUnloadedNodes) {
    // 不允许勾选未加载节点
    return;
  }

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
  updateCheckedKeys();
};
```


---

## 四、测试建议

### ✅ 测试点：
1. **勾选一个未加载的节点**
    - 是否允许勾选？
    - 是否仅勾选当前节点而不影响子节点？
2. **展开该节点后，子节点是否继承勾选状态？**
3. **全选时是否包括未加载节点？**
4. **加载失败后，是否清除相关 key？**

---

## 五、总结

| 影响点 | 是否影响勾选逻辑 | 建议做法 |
|--------|------------------|------------|
| 节点未加载时能否勾选 | ✅ 可控 | 提供 `checkUnloadedNodes` 配置 |
| 加载后是否继承状态 | ✅ 是 | 在 `loadMore` 后调用 `updateCheckedKeys()` |
| 加载失败如何处理 | ⚠️ 是 | 清除相关 key 或提供重试机制 |
| 全选是否包含未加载节点 | ✅ 可控 | 提供 `checkAllUnloaded` 配置 |

---

## 📌 示例代码片段（优化后的 [_toggleCheckbox](file:///Users/longmo/WebstormProjects/vue-virt-list/src/components/virt-tree/useCheck.ts#L173-L212)）

```ts
const _toggleCheckbox = (node: TreeNode, isChecked: boolean) => {
  if (node.disableCheckbox) return;

  const checkedKeySet = checkedKeysSet.value;

  // 如果不允许勾选未加载节点
  if (!node.isLoaded && !props.checkUnloadedNodes) {
    return;
  }

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

## ✅ 总结结论

> **懒加载功能本身不会破坏复选框的选中逻辑，关键在于如何设计数据结构和状态同步策略。**

通过以下方式可以确保懒加载与复选框共存时逻辑清晰、状态一致：

- ✅ 使用 `isLoaded` 字段标记节点是否已加载；
- ✅ 提供 `checkUnloadedNodes` 配置控制是否允许勾选未加载节点；
- ✅ 在节点加载完成后自动同步勾选状态；
- ✅ 对异常情况（如加载失败）做容错处理；

这样可以在保持良好用户体验的同时，实现高性能、支持懒加载的树形复选框组件。