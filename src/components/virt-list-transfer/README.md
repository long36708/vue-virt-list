# VirtListTransfer 穿梭框组件

基于 `virt-list` 组件开发的高性能穿梭框组件，支持大量数据的虚拟滚动。

## 特性

- 🚀 **高性能**: 基于虚拟滚动，支持大量数据渲染
- 🎯 **功能完整**: 支持搜索、全选、自定义过滤等功能
- 🎨 **可定制**: 支持自定义样式、尺寸、操作按钮等
- 📱 **响应式**: 支持移动端适配
- ♿ **无障碍**: 支持键盘操作和屏幕阅读器

## 安装

```bash
npm install vue-virt-list
```

## 基础用法

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :titles="['源列表', '目标列表']"
    :operations="['>', '<']"
    @change="handleChange"
    @selectChange="handleSelectChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { VirtListTransfer } from 'vue-virt-list';

const dataSource = [
  { key: '1', title: '选项 1', description: '描述 1' },
  { key: '2', title: '选项 2', description: '描述 2' },
  // ... 更多数据
];

const targetKeys = ref(['1', '3']);
const selectedKeys = ref([]);

const handleChange = (newTargetKeys, direction, moveKeys) => {
  console.log('数据移动:', { newTargetKeys, direction, moveKeys });
};

const handleSelectChange = (selectedKeys, info) => {
  console.log('选择变化:', { selectedKeys, info });
};
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 数据源 | `TransferItem[]` | `[]` |
| targetKeys | 目标列表的 key 数组 | `string[]` | `[]` |
| selectedKeys | 选中的 key 数组 | `string[]` | `[]` |
| titles | 标题数组，[源列表标题, 目标列表标题] | `string[]` | `['Source', 'Target']` |
| operations | 操作按钮文本数组，[向右移动按钮文本, 向左移动按钮文本] | `string[]` | `['>', '<']` |
| showSearch | 是否显示搜索框 | `boolean` | `false` |
| showSelectAll | 是否显示全选功能 | `boolean` | `true` |
| filterOption | 自定义过滤函数 | `(inputValue: string, item: TransferItem) => boolean` | - |
| searchPlaceholder | 搜索框占位符 | `string` | `'Search'` |
| notFoundContent | 无数据时显示的内容 | `string` | `'No Data'` |
| itemHeight | 列表项高度 | `number` | `32` |
| itemGap | 列表项间距 | `number` | `0` |
| buffer | 缓冲区大小 | `number` | `5` |
| listStyle | 列表样式 | `StyleType \| (() => StyleType)` | - |
| listClass | 列表类名 | `ClassType \| (() => ClassType)` | - |
| itemStyle | 列表项样式 | `StyleType \| ((item, index) => StyleType)` | - |
| itemClass | 列表项类名 | `ClassType \| ((item, index) => ClassType)` | - |
| headerStyle | 头部样式 | `StyleType \| (() => StyleType)` | - |
| headerClass | 头部类名 | `ClassType \| (() => ClassType)` | - |
| footerStyle | 底部样式 | `StyleType \| (() => StyleType)` | - |
| footerClass | 底部类名 | `ClassType \| (() => ClassType)` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| oneWay | 是否单向移动（只能向右移动） | `boolean` | `false` |
| pagination | 分页配置 | `boolean \| Record<string, any>` | `false` |
| showSize | 是否显示尺寸信息 | `boolean` | `false` |
| size | 组件尺寸 | `'small' \| 'default' \| 'large'` | `'default'` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 数据移动事件 | `(targetKeys: string[], direction: 'left' \| 'right', moveKeys: string[])` |
| selectChange | 选择变化事件 | `(selectedKeys: string[], info: { sourceSelectedKeys: string[], targetSelectedKeys: string[] })` |
| search | 搜索事件 | `(direction: 'left' \| 'right', value: string)` |
| scroll | 滚动事件 | `(direction: 'left' \| 'right', event: Event)` |

### Types

```typescript
interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}
```

## 高级用法

### 带搜索功能

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :showSearch="true"
    searchPlaceholder="请输入搜索关键词"
    @search="handleSearch"
  />
</template>
```

### 自定义过滤

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :showSearch="true"
    :filterOption="customFilter"
    searchPlaceholder="自定义过滤搜索"
  />
</template>

<script setup>
const customFilter = (inputValue, item) => {
  return item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
         item.description?.toLowerCase().includes(inputValue.toLowerCase()) ||
         item.key.toLowerCase().includes(inputValue.toLowerCase());
};
</script>
```

### 单向移动

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :oneWay="true"
    :operations="['>', '']"
  />
</template>
```

### 自定义样式

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :listStyle="{ height: '400px' }"
    :itemStyle="customItemStyle"
    :headerStyle="{ backgroundColor: '#f0f0f0' }"
  />
</template>

<script setup>
const customItemStyle = (item, index) => ({
  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
  borderLeft: item.disabled ? '3px solid #ff4d4f' : '3px solid #52c41a',
});
</script>
```

### 不同尺寸

```vue
<template>
  <!-- 小尺寸 -->
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="dataSource"
    size="small"
  />
  
  <!-- 大尺寸 -->
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="dataSource"
    size="large"
  />
</template>
```

## 性能优化

### 大数据量处理

组件基于虚拟滚动技术，可以高效处理大量数据：

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="largeDataSource" // 支持数万条数据
    :itemHeight="32"
    :buffer="10"
  />
</template>
```

### 自定义缓冲区

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="dataSource"
    :buffer="20" // 增加缓冲区大小，提升滚动性能
  />
</template>
```

## 样式定制

### CSS 变量

```css
:root {
  --virt-transfer-border-color: #d9d9d9;
  --virt-transfer-background-color: #fff;
  --virt-transfer-hover-color: #f5f5f5;
  --virt-transfer-selected-color: #e6f7ff;
  --virt-transfer-disabled-color: #f5f5f5;
  --virt-transfer-text-color: #262626;
  --virt-transfer-secondary-text-color: #999;
}
```

### 自定义类名

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="dataSource"
    listClass="custom-transfer-list"
    itemClass="custom-transfer-item"
    headerClass="custom-transfer-header"
  />
</template>

<style>
.custom-transfer-list {
  border: 2px solid #1890ff;
  border-radius: 8px;
}

.custom-transfer-item {
  border-radius: 4px;
  margin: 2px 0;
}

.custom-transfer-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
```

## 注意事项

1. **数据格式**: 确保 `dataSource` 中的每个项目都有唯一的 `key` 属性
2. **性能考虑**: 对于超大数据量（>10万条），建议使用分页或懒加载
3. **样式兼容**: 组件使用 CSS Grid 和 Flexbox，确保目标浏览器支持
4. **无障碍**: 组件支持键盘导航，按 Tab 键可以在不同元素间切换

## 常见问题

### Q: 如何处理动态数据更新？

A: 组件会自动响应 `dataSource` 和 `targetKeys` 的变化，无需手动处理。

### Q: 如何实现自定义的列表项渲染？

A: 可以通过 `itemStyle` 和 `itemClass` 属性来自定义样式，或者修改组件的 `renderItem` 方法。

### Q: 如何禁用某些项目？

A: 在 `dataSource` 中设置项目的 `disabled` 属性为 `true`。

### Q: 如何获取当前选中的项目？

A: 监听 `selectChange` 事件，或者直接使用 `selectedKeys` 响应式数据。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础的穿梭框功能
- 支持搜索和全选
- 支持自定义样式和尺寸 