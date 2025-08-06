# VirtListTransfer API

## Props

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| dataSource | Data source | `TransferItem[]` | `[]` |
| targetKeys | Target list keys | `string[]` | `[]` |
| selectedKeys | Selected keys | `string[]` | `[]` |
| titles | Title array, [source title, target title] | `string[]` | `['Source', 'Target']` |
| operations | Operation button text array, [right move text, left move text] | `string[]` | `['>', '<']` |
| showSearch | Whether to show search box | `boolean` | `false` |
| showSelectAll | Whether to show select all function | `boolean` | `true` |
| filterOption | Custom filter function | `(inputValue: string, item: TransferItem) => boolean` | - |
| searchPlaceholder | Search box placeholder | `string` | `'Search'` |
| notFoundContent | Content when no data | `string` | `'No Data'` |
| itemHeight | List item height | `number` | `32` |
| itemGap | List item gap | `number` | `0` |
| buffer | Buffer size | `number` | `5` |
| listStyle | List style | `StyleType \| (() => StyleType)` | - |
| listClass | List class name | `ClassType \| (() => ClassType)` | - |
| itemStyle | List item style | `StyleType \| ((item, index) => StyleType)` | - |
| itemClass | List item class name | `ClassType \| ((item, index) => ClassType)` | - |
| headerStyle | Header style | `StyleType \| (() => StyleType)` | - |
| headerClass | Header class name | `ClassType \| (() => ClassType)` | - |
| footerStyle | Footer style | `StyleType \| (() => StyleType)` | - |
| footerClass | Footer class name | `ClassType \| (() => ClassType)` | - |
| disabled | Whether to disable | `boolean` | `false` |
| oneWay | Whether to enable one-way mode (only move right) | `boolean` | `false` |
| pagination | Pagination configuration | `boolean \| Record<string, any>` | `false` |
| showSize | Whether to show size information | `boolean` | `false` |
| size | Component size | `'small' \| 'default' \| 'large'` | `'default'` |

## Events

| Event | Description | Parameters |
| --- | --- | --- |
| change | Data move event | `(targetKeys: string[], direction: 'left' \| 'right', moveKeys: string[])` |
| selectChange | Selection change event | `(selectedKeys: string[], info: { sourceSelectedKeys: string[], targetSelectedKeys: string[] })` |
| search | Search event | `(direction: 'left' \| 'right', value: string)` |
| scroll | Scroll event | `(direction: 'left' \| 'right', event: Event)` |

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

## Examples

### Basic Usage

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    v-model:selectedKeys="selectedKeys"
    :dataSource="dataSource"
    :titles="['Source', 'Target']"
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
  { key: '1', title: 'Option 1', description: 'Description 1' },
  { key: '2', title: 'Option 2', description: 'Description 2' },
];

const targetKeys = ref(['1']);
const selectedKeys = ref([]);

const handleChange = (newTargetKeys, direction, moveKeys) => {
  console.log('Data moved:', { newTargetKeys, direction, moveKeys });
};

const handleSelectChange = (selectedKeys, info) => {
  console.log('Selection changed:', { selectedKeys, info });
};
</script>
```

### With Search

```vue
<template>
  <VirtListTransfer
    v-model:targetKeys="targetKeys"
    :dataSource="dataSource"
    :showSearch="true"
    searchPlaceholder="Enter search keywords"
    @search="handleSearch"
  />
</template>
```

### Custom Filter

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

### One-way Mode

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

### Custom Styles

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