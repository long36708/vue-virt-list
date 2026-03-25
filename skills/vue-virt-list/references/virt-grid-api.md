# VirtGrid API 完整文档

VirtGrid 是基于 VirtList 构建的虚拟网格布局组件，支持将列表项以网格形式展示。

## 核心属性

| 参数 | 说明 | 类型 | 默认值 | 必需 |
|------|------|------|--------|------|
| list | 数据源 | `Array` | - | ✅ 是 |
| gridItems | 每行显示的列数 | `Number` | `2` | - |
| itemKey | 项目的唯一标识（内部自动生成，无需手动设置） | - | - | - |
| itemStyle | 行容器样式 | `String` | `''` | - |

### 继承自 VirtList 的属性

VirtGrid 继承了 VirtList 的所有属性，但以下属性会被内部覆盖：
- `itemKey`: 固定为 `_id`（内部生成）
- `itemStyle`: 默认设置为 `display: flex; min-width: min-content;`

可用的继承属性包括：
- `minSize`: 最小行高度
- `buffer`: buffer 数量
- `bufferTop`: 顶部 buffer
- `bufferBottom`: 底部 buffer
- `fixed`: 是否固定高度
- `scrollDistance`: 滚动阈值
- `start`: 起始渲染下标
- `offset`: 起始渲染顶部高度
- `listStyle`: 列表容器样式
- `listClass`: 列表容器类名
- `headerClass/headerStyle`: header 插槽样式
- `footerClass/footerStyle`: footer 插槽样式
- `stickyHeaderClass/stickyHeaderStyle`: sticky header 插槽样式
- `stickyFooterClass/stickyFooterStyle`: sticky footer 插槽样式

## 插槽

### default
默认插槽，用于渲染每个网格项。

**作用域参数**：
```typescript
{
  itemData: any;      // 当前项的数据
  index: number;      // 当前项在整个列表中的索引
  rowIndex: number;   // 当前项所在行的索引
}
```

**示例**：
```vue
<template #default="{ itemData, index, rowIndex }">
  <div class="grid-item">
    {{ index }}: {{ itemData.name }}
  </div>
</template>
```

### 继承的插槽

VirtGrid 支持所有 VirtList 的插槽：
- `header`: 顶部插槽
- `footer`: 底部插槽
- `sticky-header`: 顶部悬浮插槽
- `sticky-footer`: 底部悬浮插槽
- `empty`: 空数据插槽

## 事件

VirtGrid 支持所有 VirtList 的事件：

| 事件名 | 说明 | 参数 |
|--------|------|------|
| scroll | 滚动的回调 | `event: Event` |
| toTop | 触顶的回调 | 列表中第一项（行数据） |
| toBottom | 触底的回调 | 列表中最后一项（行数据） |
| itemResize | Item 尺寸发生变化 | `{ id: string, newSize: number }` |
| rangeUpdate | 可视区范围变更 | `{ inViewBegin: number, inViewEnd: number }` |

## 暴露方法

### scrollToIndex(index)
滚动到指定索引位置（原始列表索引）。

**参数**：
- `index: number` - 原始列表中的项目索引

```typescript
virtGridRef.value?.scrollToIndex(100);
```

### scrollIntoView(index)
如果目标索引不在可视范围内，滚动到该位置。

**参数**：
- `index: number` - 原始列表中的项目索引

```typescript
virtGridRef.value?.scrollIntoView(100);
```

### scrollToTop()
滚动到列表顶部。

```typescript
virtGridRef.value?.scrollToTop();
```

### scrollToBottom()
滚动到列表底部。

```typescript
virtGridRef.value?.scrollToBottom();
```

### scrollToOffset(px)
滚动到指定像素位置。

**参数**：
- `px: number` - 像素值

```typescript
virtGridRef.value?.scrollToOffset(500);
```

### forceUpdate()
强制更新网格。在 `gridItems` 变化后会自动调用。

```typescript
virtGridRef.value?.forceUpdate();
```

### updateList()
手动更新列表布局（当数据变化时自动调用）。

```typescript
virtGridRef.value?.updateList();
```

## 工作原理

VirtGrid 内部将原始列表转换为行结构：

```typescript
// 原始数据（10项）
const originalList = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  // ...
];

// gridItems = 3 时，内部转换为：
const gridList = [
  {
    _id: 0,
    children: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ]
  },
  {
    _id: 1,
    children: [
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' },
      { id: 6, name: 'Item 6' },
    ]
  },
  // ...
];
```

## 使用示例

### 基础用法

```vue
<template>
  <div style="width: 800px; height: 600px">
    <VirtGrid
      :list="list"
      :gridItems="3"
      :minSize="100"
    >
      <template #default="{ itemData, index, rowIndex }">
        <div class="grid-item">
          {{ index }} - {{ itemData.name }}
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { VirtGrid } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))
);
</script>

<style scoped>
.grid-item {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 2px;
  flex: 1;
}
</style>
```

### 响应式列数

```vue
<template>
  <div>
    <select v-model="gridItems">
      <option :value="2">2 列</option>
      <option :value="3">3 列</option>
      <option :value="4">4 列</option>
    </select>

    <VirtGrid
      ref="virtGridRef"
      :list="list"
      :gridItems="gridItems"
      :minSize="100"
    >
      <template #default="{ itemData, index }">
        <div class="grid-item">
          {{ itemData.name }}
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { VirtGrid } from 'vue-virt-list';

const gridItems = ref(3);
const list = shallowRef([...]);
</script>
```

### 带固定高度的网格

```vue
<template>
  <div style="width: 800px; height: 600px">
    <VirtGrid
      :list="list"
      :gridItems="4"
      :minSize="120"
      :fixed="true"
      :buffer="5"
    >
      <template #default="{ itemData, index }">
        <div class="fixed-grid-item">
          {{ itemData.name }}
        </div>
      </template>
    </VirtGrid>
  </div>
</template>
```

### 带头部和底部

```vue
<template>
  <div style="width: 800px; height: 600px">
    <VirtGrid
      :list="list"
      :gridItems="3"
      :minSize="100"
    >
      <template #header>
        <div class="grid-header">
          Grid Header
        </div>
      </template>

      <template #default="{ itemData, index }">
        <div class="grid-item">
          {{ itemData.name }}
        </div>
      </template>

      <template #footer>
        <div class="grid-footer">
          Grid Footer
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<style scoped>
.grid-header, .grid-footer {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
  font-weight: bold;
}
</style>
```

### 滚动到指定项目

```vue
<template>
  <div>
    <button @click="scrollToItem(500)">Scroll to Item 500</button>
    <button @click="scrollToItem(0)">Scroll to Top</button>
    <button @click="scrollToItem(list.length - 1)">Scroll to Bottom</button>

    <VirtGrid
      ref="virtGridRef"
      :list="list"
      :gridItems="3"
      :minSize="100"
    >
      <template #default="{ itemData, index }">
        <div class="grid-item">
          {{ index }}: {{ itemData.name }}
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { VirtGrid } from 'vue-virt-list';

const virtGridRef = ref<InstanceType<typeof VirtGrid> | null>(null);
const list = shallowRef(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }))
);

const scrollToItem = (index: number) => {
  virtGridRef.value?.scrollToIndex(index);
};
</script>
```

### 大数据网格

```vue
<template>
  <div style="width: 1200px; height: 800px">
    <VirtGrid
      ref="virtGridRef"
      :list="list"
      :gridItems="4"
      :minSize="80"
      :buffer="10"
    >
      <template #default="{ itemData, index }">
        <div class="data-grid-item">
          <div class="item-id">{{ itemData.id }}</div>
          <div class="item-name">{{ itemData.name }}</div>
          <div class="item-value">{{ itemData.value }}</div>
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtGrid } from 'vue-virt-list';

// 生成大数据集
const list = shallowRef(
  Array.from({ length: 50000 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
  }))
);
</script>

<style scoped>
.data-grid-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #ddd;
  background: #fff;
  height: 100%;
  box-sizing: border-box;
}

.item-id {
  font-weight: bold;
  color: #666;
}

.item-name {
  margin: 5px 0;
}

.item-value {
  color: #1890ff;
}
</style>
```

## 性能优化建议

### 使用 shallowRef

```typescript
// ✅ 推荐
const list = shallowRef([...]);

// ❌ 避免（大数据集）
const list = ref([...]);
```

### 固定高度模式

```vue
<VirtGrid
  :list="list"
  :gridItems="3"
  :minSize="120"
  :fixed="true"  <!-- 固定高度提升性能 -->
>
```

### 调整 Buffer

```vue
<VirtGrid
  :list="list"
  :gridItems="3"
  :minSize="100"
  :buffer="10"  <!-- 增加buffer减少白屏 -->
>
```

## 注意事项

1. **itemKey 自动生成**：VirtGrid 内部使用 `_id` 作为行标识，不需要手动设置 itemKey

2. **gridItems 变化**：当 `gridItems` 变化时，组件会自动调整布局并尝试滚动到之前的位置

3. **行与列索引**：
   - `index` 是在整个原始列表中的索引
   - `rowIndex` 是当前行的索引

4. **样式布局**：
   - 每行使用 `display: flex` 布局
   - 网格项使用 `flex: 1` 均分宽度
   - 可通过自定义样式调整

5. **大数据限制**：与 VirtList 相同，受浏览器高度限制约 38 万条原始数据

## TypeScript 类型

```typescript
import type { VirtListProps } from 'vue-virt-list';

// VirtGrid 的 Props
interface VirtGridProps {
  list: any[];
  gridItems: number;
  itemStyle?: string;
}

// 继承 VirtList 的其他属性
// gridItems 变化时会自动处理布局更新
```
