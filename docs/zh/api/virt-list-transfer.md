# VirtListTransfer API

## Props

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

## Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 数据移动事件 | `(targetKeys: string[], direction: 'left' \| 'right', moveKeys: string[])` |
| selectChange | 选择变化事件 | `(selectedKeys: string[], info: { sourceSelectedKeys: string[], targetSelectedKeys: string[] })` |
| search | 搜索事件 | `(direction: 'left' \| 'right', value: string)` |
| scroll | 滚动事件 | `(direction: 'left' \| 'right', event: Event)` |

## Types

```typescript
interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}
```

## 示例

### 基础用法

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :titles="['源列表', '目标列表']"
    :operations="['>', '<']"
    :listStyle="{ height: '300px' }"
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
];

const targetKeys = ref(['1']);
const selectedKeys = ref([]);

const handleChange = (newTargetKeys, direction, moveKeys) => {
  console.log('数据移动:', { newTargetKeys, direction, moveKeys });
};

const handleSelectChange = (selectedKeys, info) => {
  console.log('选择变化:', { selectedKeys, info });
};
</script>
```

### 带搜索功能

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
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
    :dataSource="dataSource"
    :showSearch="true"
    :filterOption="customFilter"
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