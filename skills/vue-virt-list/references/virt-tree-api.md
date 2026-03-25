# VirtTree API 完整文档

## 核心属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| list | 树数据 | `TreeData` | - |
| itemKey | 树节点的唯一标识字段 | `string \| number` | `'key'` |
| selectable | 是否可选择 | `boolean` | `false` |
| selectMultiple | 是否多选 | `boolean` | `false` |
| expandable | 是否可展开 | `boolean` | `false` |
| checkable | 是否显示复选框 | `boolean` | `false` |
| checkStrictly | 父子节点是否不关联 | `boolean` | `false` |
| draggable | 是否可拖拽 | `boolean` | `false` |
| load-node | 懒加载子节点函数 | `(node) => Promise` | - |
| fieldNames | 自定义字段映射 | `TreeFieldNames` | - |
| defaultExpandAll | 是否默认展开所有 | `boolean` | `false` |
| defaultExpandedKeys | 默认展开的节点 key 集合 | `TreeNodeKey[]` | - |
| defaultSelectedKeys | 默认选中的节点 key 集合 | `TreeNodeKey[]` | - |
| defaultCheckedKeys | 默认勾选的节点 key 集合 | `TreeNodeKey[]` | - |
| expandedKeys | （受控）展开的节点 key 集合 | `TreeNodeKey[]` | - |
| selectedKeys | （受控）选中的节点 key 集合 | `TreeNodeKey[]` | - |
| checkedKeys | （受控）勾选的节点 key 集合 | `TreeNodeKey[]` | - |
| minHeight | 最小高度 | `number` | `20` |
| itemGap | 节点间距 | `number` | `0` |
| buffer | buffer 个数 | `number` | `0` |
| showLine | 是否显示连接线 | `boolean` | `false` |

## 字段映射配置

### TreeFieldNames

```typescript
interface TreeFieldNames {
  key?: string;           // 节点唯一标识字段，默认 'key'
  title?: string;         // 节点标题字段，默认 'title'
  children?: string;      // 子节点字段，默认 'children'
  disableSelect?: string; // 禁用选择字段，默认 'disableSelect'
  disableCheckbox?: string; // 禁用复选框字段，默认 'disableCheckbox'
  disableDragIn?: string; // 禁用拖入字段，默认 'disableDragIn'
  disableDragOut?: string; // 禁用拖出字段，默认 'disableDragOut'
}
```

### 使用示例

```typescript
const customFieldNames = {
  key: 'id',
  title: 'name',
  children: 'items',
};

<VirtTree
  :list="treeData"
  :fieldNames="customFieldNames"
/>
```

## 数据结构

### TreeNode

```typescript
interface TreeNode<T = TreeNodeData> {
  key: TreeNodeKey;        // 节点唯一标识
  level: number;          // 层级（从 0 开始）
  title?: string;         // 节点标题
  isLeaf?: boolean;       // 是否为叶子节点
  isLast?: boolean;       // 是否为同级最后一个节点
  parent?: TreeNode;      // 父节点引用
  children?: TreeNode[];  // 子节点
  disableSelect?: boolean; // 是否禁用选择
  disableCheckbox?: boolean; // 是否禁用复选框
  searchedIndex?: number; // 搜索索引
  data: T;                // 原始数据
  isLoaded?: boolean;     // 是否已加载子节点（懒加载）
  isLoading?: boolean;   // 是否正在加载子节点
}
```

## 插槽

### default
自定义节点内容。

**作用域参数**：
```typescript
{
  node: TreeNode;  // 当前节点数据
  index: number;   // 当前索引
}
```

**示例**：
```vue
<template #default="{ node, index }">
  <div class="custom-node">
    {{ node.title }}
  </div>
</template>
```

### icon
自定义展开/折叠图标。

**作用域参数**：
```typescript
{
  node: TreeNode;
  expanded: boolean;
}
```

### title
自定义节点标题内容。

**作用域参数**：
```typescript
{
  node: TreeNode;
  index: number;
}
```

### content
自定义节点内容（不包含图标、标题等）。

**作用域参数**：
```typescript
{
  node: TreeNode;
  index: number;
}
```

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 节点选中事件 | `(selectedKeys: TreeNodeKey[], { node, selected }: { node: TreeNode, selected: boolean })` |
| check | 复选框勾选事件 | `(checkedKeys: TreeNodeKey[], info: { checked: boolean, node: TreeNode, checkedNodes: TreeNode[] })` |
| expand | 节点展开/折叠事件 | `(expandedKeys: TreeNodeKey[], { node, expanded }: { node: TreeNode, expanded: boolean })` |
| dragstart | 拖拽开始 | `(event, node)` |
| dragenter | 拖拽进入 | `(event, node)` |
| dragover | 拖拽经过 | `(event, node)` |
| dragleave | 拖拽离开 | `(event, node)` |
| drop | 拖拽放置 | `(event, node)` |
| dragend | 拖拽结束 | `(event, node)` |

## 暴露方法

### expandAll()
展开所有节点。

```typescript
virtTreeRef.value?.expandAll();
```

### expandNode(key)
展开指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.expandNode('node-1');
```

### collapseAll()
折叠所有节点。

```typescript
virtTreeRef.value?.collapseAll();
```

### collapseNode(key)
折叠指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.collapseNode('node-1');
```

### selectAll()
选中所有节点（多选模式下）。

```typescript
virtTreeRef.value?.selectAll();
```

### selectNode(key)
选中指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.selectNode('node-1');
```

### unselectNode(key)
取消选中指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.unselectNode('node-1');
```

### checkAll()
勾选所有节点。

```typescript
virtTreeRef.value?.checkAll();
```

### checkNode(key)
勾选指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.checkNode('node-1');
```

### uncheckNode(key)
取消勾选指定节点。

**参数**：
- `key: TreeNodeKey` - 节点 key

```typescript
virtTreeRef.value?.uncheckNode('node-1');
```

### getCheckedInfo()
获取选中的节点信息。

**返回值**：
```typescript
{
  checkedKeys: TreeNodeKey[];
  checkedNodes: TreeNode[];
  halfCheckedKeys: TreeNodeKey[];
  halfCheckedNodes: TreeNode[];
}
```

```typescript
const info = virtTreeRef.value?.getCheckedInfo();
console.log(info.checkedKeys);
```

### getTreeInfo()
获取树的完整信息。

**返回值**：
```typescript
{
  treeNodesMap: Map<TreeNodeKey, TreeNode>;
  treeNodes: TreeNode[];
  levelNodesMap: Map<TreeNodeKey, TreeNode[]>;
  maxLevel: number;
  allNodeKeys: TreeNodeKey[];
}
```

```typescript
const treeInfo = virtTreeRef.value?.getTreeInfo();
```

### setExpandedKeys(keys)
设置展开的节点集合。

**参数**：
- `keys: TreeNodeKey[]` - 节点 key 数组

```typescript
virtTreeRef.value?.setExpandedKeys(['node-1', 'node-2']);
```

### setSelectedKeys(keys)
设置选中的节点集合。

**参数**：
- `keys: TreeNodeKey[]` - 节点 key 数组

```typescript
virtTreeRef.value?.setSelectedKeys(['node-1']);
```

### setCheckedKeys(keys)
设置勾选的节点集合。

**参数**：
- `keys: TreeNodeKey[]` - 节点 key 数组

```typescript
virtTreeRef.value?.setCheckedKeys(['node-1', 'node-2']);
```

### scroll(key, align, offset)
滚动到指定节点。

**参数**：
```typescript
{
  key?: TreeNodeKey;    // 节点 key
  align?: 'view' | 'top'; // 对齐方式
  offset?: number;     // 偏移量
}
```

```typescript
virtTreeRef.value?.scroll({
  key: 'node-1',
  align: 'view',
  offset: 10
});
```

### filter(keyword)
过滤树节点。

**参数**：
- `keyword: string` - 搜索关键词

```typescript
virtTreeRef.value?.filter('test');
```

### clearFilter()
清除过滤状态。

```typescript
virtTreeRef.value?.clearFilter();
```

## 懒加载使用

### 基础用法

```vue
<template>
  <VirtTree
    :list="treeData"
    :load-node="loadNode"
    selectable
    expandable
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const treeData = ref([
  {
    key: 'lazy-1',
    title: 'Lazy Parent',
    isLeaf: false,
  }
]);

const loadNode = async (node: any): Promise<any[]> => {
  // 模拟异步请求
  const children = [];
  for (let i = 0; i < 100; i++) {
    children.push({
      key: `${node.key}-${i}`,
      title: `Child ${i}`,
      isLeaf: true,
    });
  }
  
  // 可以返回 Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(children);
    }, 500);
  });
};
</script>
```

### 提前标记叶子节点

如果某些节点确定没有子节点，可以在数据中标记 `isLeaf: true`，这样就不会显示展开图标。

```typescript
const treeData = [
  {
    key: 'leaf-node',
    title: 'Leaf Node',
    isLeaf: true, // 不会显示展开图标
  }
];
```

## Vue 2 vs Vue 3 使用差异

### 受控模式

**Vue 2**：
```vue
<template>
  <VirtTree
    :list="treeData"
    :expandedKeys.sync="expandedKeys"
    :checkedKeys.sync="checkedKeys"
    checkable
    expandable
  />
</template>

<script>
export default {
  data() {
    return {
      treeData: [...],
      expandedKeys: [],
      checkedKeys: [],
    };
  },
  methods: {
    // 使用数组方法修改以触发响应式
    updateExpanded() {
      this.expandedKeys.push('node-1');
      // 或使用 splice
      this.expandedKeys.splice(0, 1);
    }
  }
};
</script>
```

**Vue 3**：
```vue
<template>
  <VirtTree
    :list="treeData"
    v-model:expandedKeys="expandedKeys"
    v-model:checkedKeys="checkedKeys"
    checkable
    expandable
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const treeData = ref([...]);
const expandedKeys = ref<TreeNodeKey[]>([]);
const checkedKeys = ref<TreeNodeKey[]>([]);

// 必须创建新数组以触发响应式
const updateExpanded = () => {
  expandedKeys.value = [...expandedKeys.value, 'node-1'];
};
</script>
```

## CSS 变量自定义

### 默认主题

```css
.virt-tree-item {
  /* 拖拽线颜色 */
  --virt-tree-color-drag-line: #4c88ff;
  --virt-tree-color-drag-box: rgb(76, 136, 255, 0.1);
  --virt-tree-color-drag-line-disabled: rgb(76, 136, 255, 0.4);

  /* 文本颜色 */
  --virt-tree-color-text: #1f2329;
  --virt-tree-color-text-disabled: #a8abb2;
  --virt-tree-color-text-selected: #1456f0;

  /* 节点背景 */
  --virt-tree-color-node-bg: #fff;
  --virt-tree-color-node-bg-hover: #1f232914;
  --virt-tree-color-node-bg-disabled: transparent;
  --virt-tree-color-node-bg-selected: #f0f4ff;

  /* 图标颜色 */
  --virt-tree-color-icon: #2b2f36;
  --virt-tree-color-icon-bg-hover: #1f23291a;

  /* 连接线颜色 */
  --virt-tree-line-color: #cacdd1;

  /* 复选框颜色 */
  --virt-tree-color-checkbox-bg: #fff;
  --virt-tree-color-checkbox-bg-indeterminate: #1890ff;
  --virt-tree-color-checkbox-bg-checked: #1890ff;
  --virt-tree-color-checkbox-bg-disabled: rgba(255, 255, 255, 0.3);
  --virt-tree-color-checkbox-border: rgb(190, 192, 198);
  --virt-tree-color-checkbox-border-checked: #1890ff;
  --virt-tree-color-checkbox-border-indeterminate: #1890ff;

  /* 图标间距和拖拽线距离 */
  --virt-tree-switcher-icon-margin-right: 4px;
  --virt-tree-drag-line-gap: 4px;
}
```

### 暗色主题

```css
html.dark .virt-tree-item {
  --virt-tree-color-text: #f9f9f9;
  --virt-tree-color-text-disabled: rgba(255, 255, 255, 0.3);
  --virt-tree-color-text-selected: #4c88ff;
  --virt-tree-color-node-bg: #1b1b1f;
  --virt-tree-color-node-bg-hover: #2e3238;
  --virt-tree-color-node-bg-selected: #152340;
  --virt-tree-color-icon: #f9f9f9;
  --virt-tree-color-icon-bg-hover: #ebebeb1a;
  --virt-tree-line-color: #35393f;
}
```

## 样式导入

```typescript
import 'vue-virt-list/lib/assets/tree.css';
```

## TypeScript 类型定义

```typescript
export type TreeNodeData = Record<string, any>;
export type TreeNodeKey = string | number;
export type TreeData = TreeNodeData[];

export interface TreeFieldNames {
  key?: string;
  title?: string;
  children?: string;
  disableSelect?: string;
  disableCheckbox?: string;
  disableDragIn?: string;
  disableDragOut?: string;
}

export interface CheckedInfo {
  checkedKeys: TreeNodeKey[];
  checkedNodes: TreeData;
  halfCheckedKeys: TreeNodeKey[];
  halfCheckedNodes: TreeData;
}

export interface IScrollParams {
  key?: TreeNodeKey;
  align?: 'view' | 'top';
  offset?: number;
}
```
