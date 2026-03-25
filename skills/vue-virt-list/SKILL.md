---
name: vue-virt-list
description: vue-virt-list 虚拟列表组件库使用指南。包含 VirtList、VirtTree、VirtGrid、RealList 组件的完整 API 文档、性能优化最佳实践、常见问题解决方案、实用代码示例和完整可用的模板文件。即使没有源码，也能快速上手使用该组件库。
---

# Vue Virt List 组件库使用指南

本指南提供 vue-virt-list 虚拟滚动列表库的全面使用说明，即使在没有源码的情况下，也能快速上手并高效使用该组件库。

## 🎯 目的

Vue Virt List 通过仅渲染视口中可见的项目，实现大数据集（可达数百万条）的高效渲染。本指南提供：

- **完整的 API 文档**：所有组件的属性、方法、事件和插槽
- **性能优化策略**：针对不同场景的优化方案
- **常见问题解决方案**：快速排查和修复问题
- **实用代码示例**：涵盖各种实际使用场景
- **完整可用的模板**：直接复制使用的完整组件代码

## 🚀 快速开始

### 1. 安装

```bash
npm install vue-virt-list -S
```

### 2. 基础使用（Composition API）

```vue
<template>
  <div style="width: 500px; height: 400px">
    <VirtList itemKey="id" :list="list" :minSize="20">
      <template #default="{ itemData, index }">
        <div>{{ index }} - {{ itemData.id }} - {{ itemData.text }}</div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { VirtList } from 'vue-virt-list';

// 大数据集建议使用 shallowRef
const list = shallowRef([{ id: 0, text: 'text' }]);
</script>
```

### 3. 使用完整模板

查看 `assets/templates/` 目录下的完整模板文件：
- `basic-virt-list.vue` - 基础虚拟列表完整实现
- `lazy-tree.vue` - 懒加载树完整实现
- `grid-layout.vue` - 网格布局完整实现

## 📚 核心资源

### 📖 参考资料（完整文档）

| 文档 | 内容 |
|------|------|
| `references/virt-list-api.md` | VirtList 完整 API 文档，包含所有属性、方法、事件、插槽 |
| `references/virt-tree-api.md` | VirtTree 完整 API 文档，包含懒加载、选择、复选等功能 |
| `references/virt-grid-api.md` | VirtGrid 完整 API 文档，网格布局配置和使用 |
| `references/best-practices.md` | 性能优化和最佳实践，针对不同场景的优化方案 |
| `references/common-pitfalls.md` | 常见问题和解决方案，14+ 实际问题案例 |
| `references/examples.md` | 实用代码示例，涵盖 6 大类场景的 20+ 示例 |

### 🎨 模板资源（可复制使用）

| 模板 | 用途 |
|------|------|
| `assets/templates/basic-virt-list.vue` | 完整的虚拟列表实现，包含滚动控制、数据操作、事件处理 |
| `assets/templates/lazy-tree.vue` | 完整的懒加载树实现，包含搜索、选择、复选框等功能 |
| `assets/templates/grid-layout.vue` | 完整的网格布局实现，响应式列数、卡片样式、交互功能 |

## 🔑 核心概念

### 虚拟滚动原理

只渲染视口中的可见项目，大幅提升性能。

**关键参数**：
- `itemKey`：**必须唯一**，确保正确滚动行为
- `minSize`：预估项目尺寸，计算可视区域能容纳的项目数
- `buffer`：视口外额外渲染的项目，减少快速滚动时的白屏

### 组件对比

| 组件 | 用途 | 适用场景 |
|------|------|----------|
| **VirtList** | 基础虚拟列表 | 大数据量列表、无限滚动、聊天记录 |
| **VirtTree** | 虚拟树 | 文件树、组织架构、分类导航 |
| **VirtGrid** | 虚拟网格 | 图片库、卡片布局、商品展示 |
| **RealList** | 非虚拟列表 | 小数据量（< 1000）简单列表 |

## ⚡ 关键最佳实践

### 1. 大数据集必须使用 shallowRef

```typescript
// ✅ 正确 - 使用 shallowRef
import { shallowRef } from 'vue';
const list = shallowRef(generateLargeData(100000));

// ❌ 错误 - 使用 ref 会导致性能问题
import { ref } from 'vue';
const list = ref(generateLargeData(100000));
```

**原因**：
- `ref` 对整个数组进行深度响应式处理，在大数据量下造成严重性能问题
- `shallowRef` 只对数组本身响应式，不处理数组元素，大幅减少内存和计算

### 2. 列表长度变化后调用 forceUpdate()

```typescript
const list = shallowRef([]);
const virtListRef = ref();

const addData = (newItems) => {
  list.value = list.value.concat(newItems);
  // ✅ 必须调用 forceUpdate
  virtListRef.value?.forceUpdate();
};
```

### 3. 固定高度使用 fixed 模式

```vue
<!-- ✅ 性能更好 -->
<VirtList :list="list" itemKey="id" :minSize="60" :fixed="true">
```

**优势**：
- 避免实时计算每个项目的高度
- 滚动时无需重新计算布局
- 渲染速度更快

### 4. 分离渲染层和交互层

```vue
<!-- ❌ 复杂 DOM 在列表中 -->
<template #default="{ itemData }">
  <div class="complex-item">
    <!-- 复杂的嵌套结构 -->
    <div class="wrapper">
      <div class="header">...</div>
      <div class="content">
        <p>...</p>
        <div class="actions">
          <button>Edit</button>
          <button>Delete</button>
          <DropdownMenu>...</DropdownMenu>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- ✅ 简化 DOM，拆分组件 -->
<template #default="{ itemData }">
  <ListItem :itemData="itemData" @edit="handleEdit" @delete="handleDelete" />
</template>
```

## 🎯 何时使用本指南

在以下情况使用本指南：

### 学习阶段
- ✅ 第一次使用 vue-virt-list
- ✅ 不了解某个组件的 API
- ✅ 需要查看完整的属性和方法说明
- ✅ 想了解最佳实践和性能优化

### 开发阶段
- ✅ 实现特定功能（懒加载、无限滚动、拖拽等）
- ✅ 遇到性能问题需要优化
- ✅ 遇到滚动、渲染、数据更新等问题
- ✅ 需要参考实际代码示例

### 问题排查
- ✅ 滚动行为异常
- ✅ 数据更新不显示
- ✅ 性能卡顿
- ✅ 响应式不生效
- ✅ 浏览器兼容性问题

## 📋 快速参考

### VirtList 核心属性

| 属性 | 必需 | 说明 |
|------|------|------|
| `list` | ✅ | 数据源 |
| `itemKey` | ✅ | 项目唯一标识 |
| `minSize` | ✅ | 最小尺寸（用于计算可视区域） |
| `buffer` | - | buffer 数量（减少白屏） |
| `fixed` | - | 是否固定高度（提升性能） |

### VirtList 核心方法

```typescript
// 通过 ref 调用
virtListRef.value?.scrollToIndex(100);    // 滚动到指定索引
virtListRef.value?.scrollToTop();         // 滚动到顶部
virtListRef.value?.scrollToBottom();      // 滚动到底部
virtListRef.value?.forceUpdate();         // 强制更新（shallowRef 后必需）
virtListRef.value?.getOffset();           // 获取滚动距离
```

### VirtTree 核心功能

```vue
<VirtTree
  :list="treeData"
  expandable        <!-- 可展开 -->
  selectable        <!-- 可选择 -->
  checkable         <!-- 可勾选 -->
  :load-node="loadNode"  <!-- 懒加载 -->
  v-model:checkedKeys="checkedKeys"  <!-- 受控复选框 -->
>
</VirtTree>
```

### VirtGrid 核心配置

```vue
<VirtGrid
  :list="list"
  :gridItems="3"   <!-- 每行 3 列 -->
  :minSize="150"   <!-- 每行最小高度 -->
>
  <template #default="{ itemData, index, rowIndex }">
    <!-- 自定义网格项 -->
  </template>
</VirtGrid>
```

## 🛠️ 常见问题速查

### 问题 1：滚动行为异常
**症状**：滚动时跳动、无法滚动到正确位置
**原因**：`itemKey` 不唯一
**解决**：确保每个项目有唯一的 `itemKey`

### 问题 2：快速滚动时白屏
**症状**：快速滚动出现空白区域
**原因**：`buffer` 设置过小
**解决**：增加 `buffer`，例如 `:buffer="10"`

### 问题 3：列表更新后不显示
**症状**：数据变化但视图不更新
**原因**：使用 `shallowRef` 后未调用 `forceUpdate()`
**解决**：更新数据后调用 `virtListRef.value?.forceUpdate()`

### 问题 4：大数据量性能问题
**症状**：渲染卡顿、内存占用高
**原因**：未使用 `shallowRef` 或 DOM 结构复杂
**解决**：
1. 使用 `shallowRef`
2. 使用 `fixed: true` 固定高度
3. 简化 DOM 结构
4. 分页或无限滚动加载

### 问题 5：Vue 2 vs Vue 3 响应式差异
**症状**：数组修改不生效
**原因**：Vue 2 和 Vue 3 的响应式机制不同
**解决**：
- Vue 2：使用 `splice()`、`push()` 等数组方法
- Vue 3：创建新数组触发响应式

更多问题请查看 `references/common-pitfalls.md`

## 🎨 样式定制

### VirtTree CSS 变量

```css
.virt-tree-item {
  /* 文本颜色 */
  --virt-tree-color-text: #1f2329;
  --virt-tree-color-text-selected: #1456f0;

  /* 节点背景 */
  --virt-tree-color-node-bg: #fff;
  --virt-tree-color-node-bg-selected: #f0f4ff;
  --virt-tree-color-node-bg-hover: #1f232914;

  /* 复选框 */
  --virt-tree-color-checkbox-bg-checked: #1890ff;
  --virt-tree-color-checkbox-border-checked: #1890ff;
}
```

### 导入 Tree 样式

```typescript
import 'vue-virt-list/lib/assets/tree.css';
```

## 📊 性能参考

| 数据量 | 内存占用 | 勾选耗时 | 备注 |
|--------|---------|---------|------|
| 1w 节点 | ~200MB | 1s | 流畅 |
| 3w 节点 | ~230MB | 1-2s | 流畅 |
| 30w 节点 | ~500MB | 3s | 滚动流畅，展开/折叠卡顿 |
| 100w 列表 | - | - | 受浏览器高度限制（约 38w） |

## 🔍 调试技巧

### 1. 监控渲染范围

```typescript
const reactiveData = computed(() => {
  return virtListRef.value?.getReactiveData();
});

watch(reactiveData, (data) => {
  console.log('Render Begin:', data?.renderBegin);
  console.log('Render End:', data?.renderEnd);
});
```

### 2. 监控滚动位置

```typescript
const handleScroll = (e: Event) => {
  const offset = virtListRef.value?.getOffset();
  console.log('Scroll Offset:', offset);
};
```

### 3. 获取尺寸信息

```typescript
const sizes = virtListRef.value?.sizesMap;
sizes?.forEach((size, key) => {
  console.log(`${key}: ${size}px`);
});
```

## 🎯 实用示例

查看 `references/examples.md` 获取以下场景的完整代码：

### VirtList 示例
- 最简用法
- 大数据量列表
- 固定高度列表
- 带插槽的列表
- 无限滚动（单向）
- 双向无限滚动
- 可编辑列表
- 搜索过滤列表
- 拖拽排序列表
- 虚拟滚动表格

### VirtTree 示例
- 基础树
- 可选树（Selectable）
- 带复选框的树
- 懒加载树
- 带搜索的树

### VirtGrid 示例
- 基础网格
- 响应式网格

### 高级示例
- 完整聊天列表组件

## 📝 检查清单

### 使用前检查
- [ ] 是否已安装 `vue-virt-list`
- [ ] 是否导入需要的组件
- [ ] 是否设置了唯一的 `itemKey`
- [ ] 是否设置了合理的 `minSize`

### 大数据量优化检查
- [ ] 是否使用 `shallowRef` 而非 `ref`
- [ ] 列表更新后是否调用 `forceUpdate()`
- [ ] 是否使用 `fixed: true` 固定高度
- [ ] DOM 结构是否足够简化
- [ ] 是否使用分页或无限滚动

### 问题排查检查
- [ ] `itemKey` 是否唯一
- [ ] 是否有 `buffer` 导致白屏
- [ ] 是否使用了 `forceUpdate()`
- [ ] Vue 2/3 响应式是否正确
- [ ] 是否有样式覆盖问题

## 🌐 官方资源

- **在线文档**：https://kolarorz.github.io/vue-virt-list/
- **GitHub**：https://github.com/kolarorz/vue-virt-list
- **NPM**：https://www.npmjs.com/package/vue-virt-list

## 💡 使用建议

1. **初次使用**：先查看快速开始，然后复制 `assets/templates/basic-virt-list.vue` 修改使用
2. **学习 API**：查看 `references/virt-list-api.md` 了解完整 API
3. **优化性能**：查看 `references/best-practices.md` 了解优化策略
4. **遇到问题**：查看 `references/common-pitfalls.md` 解决常见问题
5. **参考示例**：查看 `references/examples.md` 找到类似的实现

## 📖 文档结构说明

```
vue-virt-list/
├── SKILL.md                           # 本文件，使用指南入口
├── references/                        # 完整文档
│   ├── virt-list-api.md              # VirtList API 文档
│   ├── virt-tree-api.md              # VirtTree API 文档
│   ├── virt-grid-api.md              # VirtGrid API 文档
│   ├── best-practices.md             # 最佳实践和性能优化
│   ├── common-pitfalls.md            # 常见问题和解决方案
│   └── examples.md                   # 实用代码示例
└── assets/                            # 可复制使用的模板
    └── templates/
        ├── basic-virt-list.vue       # 基础虚拟列表模板
        ├── lazy-tree.vue             # 懒加载树模板
        └── grid-layout.vue           # 网格布局模板
```

## 🎓 学习路径

### 初级（入门）
1. 阅读"快速开始"部分
2. 复制并运行 `basic-virt-list.vue` 模板
3. 查看 `virt-list-api.md` 了解基础 API
4. 尝试修改模板，添加自定义功能

### 中级（进阶）
1. 阅读 `best-practices.md` 了解性能优化
2. 查看 `examples.md` 中的各种示例
3. 实现懒加载、无限滚动等功能
4. 学习 VirtTree 和 VirtGrid 的使用

### 高级（精通）
1. 深入研究 `common-pitfalls.md` 解决复杂问题
2. 实现自定义功能（拖拽、搜索、过滤等）
3. 优化性能，处理超大数据集
4. 贡献代码或报告问题

## 🔧 技术支持

如果遇到问题：
1. 首先查看 `references/common-pitfalls.md`
2. 查看官方文档和 GitHub Issues
3. 参考示例代码找到类似实现
4. 检查 checklist 逐项排查

---

**提示**：本指南包含了无需源码即可使用 vue-virt-list 的所有必要信息。所有代码示例和模板都可以直接复制使用，按需修改即可集成到项目中。
