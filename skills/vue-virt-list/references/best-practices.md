# vue-virt-list 性能优化和最佳实践

## 核心原则

### 1. 大数据集使用 shallowRef

对于大数据量，必须使用 `shallowRef` 替代 `ref` 以避免深度响应式开销。

**错误示例**：
```typescript
// ❌ 不要这样
const list = ref(Array.from({ length: 100000 }, (_, i) => ({ id: i })));
```

**正确示例**：
```typescript
// ✅ 应该这样
import { shallowRef } from 'vue';
const list = shallowRef(Array.from({ length: 100000 }, (_, i) => ({ id: i })));
```

**为什么**：
- `ref` 会对整个数组进行深度响应式处理，在大数据量下造成严重性能问题
- `shallowRef` 只对数组本身进行响应式，不处理数组元素
- 减少内存占用和初始化时间

### 2. 列表长度变化时调用 forceUpdate()

使用 `shallowRef` 后，当列表长度变化时需要手动触发更新。

```typescript
const list = shallowRef([...]);
const virtListRef = ref();

// 添加数据
const addData = (newItems: any[]) => {
  list.value = list.value.concat(newItems);
  // ✅ 必须调用 forceUpdate
  virtListRef.value?.forceUpdate();
};

// 删除数据
const removeData = (index: number) => {
  list.value.splice(index, 1);
  // ✅ 必须调用 forceUpdate
  virtListRef.value?.forceUpdate();
};
```

### 3. 分离渲染层和交互层

复杂组件应该拆分为轻量级渲染组件和独立交互组件。

**错误示例**（复杂 DOM 在列表中）：
```vue
<template>
  <VirtList :list="list" itemKey="id" :minSize="100">
    <template #default="{ itemData }">
      <div class="complex-item">
        <div class="header">{{ itemData.title }}</div>
        <div class="content">{{ itemData.content }}</div>
        <div class="footer">
          <button @click="handleEdit(itemData)">Edit</button>
          <button @click="handleDelete(itemData.id)">Delete</button>
          <button @click="handleShare(itemData)">Share</button>
          <DropdownMenu>
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </template>
  </VirtList>
</template>
```

**正确示例**（拆分组件）：
```vue
<!-- ListItem.vue - 轻量级渲染组件 -->
<script setup lang="ts">
const props = defineProps<{
  itemData: any;
  index: number;
}>();

const emit = defineEmits<{
  edit: [item: any];
  delete: [id: number];
}>();
</script>

<template>
  <div class="simple-item">
    <div class="title">{{ itemData.title }}</div>
    <div class="content">{{ itemData.content }}</div>
    <!-- 交互按钮放在外部 -->
  </div>
</template>

<!-- Parent.vue -->
<template>
  <VirtList :list="list" itemKey="id" :minSize="50">
    <template #default="{ itemData, index }">
      <ListItem
        :itemData="itemData"
        :index="index"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>
  </VirtList>
</template>
```

## VirtList 性能优化

### 固定高度模式

如果所有项目高度一致，使用 `fixed: true` 可以显著提升性能。

```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="60"
  :fixed="true"
>
  <template #default="{ itemData }">
    <div class="fixed-height-item">{{ itemData.text }}</div>
  </template>
</VirtList>

<style scoped>
.fixed-height-item {
  height: 60px;  /* 固定高度 */
  display: flex;
  align-items: center;
}
</style>
```

**优势**：
- 避免实时计算每个项目的高度
- 滚动时无需重新计算布局
- 渲染速度更快

### 调整 Buffer 设置

根据滚动速度调整 buffer 设置。

**快速滚动场景**（增加 buffer）：
```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  :buffer="15"
>
```

**正常滚动**（默认即可）：
```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
>
```

**性能敏感场景**（减少 buffer）：
```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  :buffer="2"
  :bufferTop="3"
  :bufferBottom="3"
>
```

### 优化 itemStyle 和 itemClass

避免在 `itemStyle` 和 `itemClass` 中使用函数形式，因为每次渲染都会执行。

**推荐**：
```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  itemStyle="padding: 10px; border-bottom: 1px solid #eee;"
  itemClass="list-item"
>
```

**不推荐**：
```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  :itemStyle="(item, index) => ({
    padding: '10px',
    background: index % 2 === 0 ? '#fff' : '#f9f9f9',
  })"
  :itemClass="(item, index) => index % 2 === 0 ? 'even' : 'odd'"
>
```

## VirtTree 性能优化

### 避免默认展开所有节点

在大数据量下避免使用 `defaultExpandAll`。

```vue
<!-- ❌ 大数据量下避免 -->
<VirtTree
  :list="hugeTreeData"
  :defaultExpandAll="true"
/>

<!-- ✅ 按需展开 -->
<VirtTree
  :list="hugeTreeData"
  :defaultExpandedKeys="['node-1', 'node-2']"
/>
```

**原因**：
- 默认展开所有节点会导致大量 DOM 同时渲染
- 展开操作在大数据量下会卡顿（30w 节点需 9s 左右）

### 复选框优化

在超大数据量下谨慎使用复选框。

**性能参考**：
- 30w 节点：内存占用 ~500MB，勾选耗时 3s
- 3w 节点：内存占用 ~230MB，勾选耗时 1-2s
- 1w 节点：内存占用 ~200MB，勾选耗时 1s

**优化建议**：
```vue
<!-- ❌ 超大数据量避免全选 -->
<VirtTree
  :list="hugeTreeData"
  checkable
/>

<!-- ✅ 只在需要时使用复选框 -->
<VirtTree
  :list="mediumTreeData"
  checkable
  :checkStrictly="true"  <!-- 使用严格模式减少关联计算 -->
/>
```

### 懒加载优化

使用懒加载减少初始渲染负担。

```vue
<template>
  <VirtTree
    :list="treeData"
    :load-node="loadNode"
    expandable
  />
</template>

<script setup lang="ts">
const treeData = shallowRef([
  {
    key: 'root',
    title: 'Root',
    isLeaf: false,  // 标记为非叶子节点
  }
]);

const loadNode = async (node: any) => {
  // 只在需要时加载子节点
  if (node.isLoaded) return [];
  
  const children = await fetchChildren(node.key);
  
  // 标记已加载
  return children.map(child => ({
    ...child,
    isLeaf: !child.hasMore,  // 提前标记叶子节点
  }));
};
</script>
```

## VirtGrid 性能优化

### 合理设置 gridItems

根据屏幕宽度和内容合理设置每行列数。

```typescript
import { ref, onMounted, onUnmounted } from 'vue';

const gridItems = ref(3);

const updateGridItems = () => {
  const width = window.innerWidth;
  if (width > 1200) {
    gridItems.value = 4;
  } else if (width > 800) {
    gridItems.value = 3;
  } else {
    gridItems.value = 2;
  }
};

onMounted(() => {
  updateGridItems();
  window.addEventListener('resize', updateGridItems);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateGridItems);
});
```

### 固定行高

```vue
<VirtGrid
  :list="list"
  :gridItems="3"
  :minSize="100"
  :fixed="true"
>
  <template #default="{ itemData }">
    <div class="grid-item" style="height: 100px;">
      {{ itemData.name }}
    </div>
  </template>
</VirtGrid>
```

## 内存管理

### 及时清理不需要的数据

```typescript
// ❌ 不好的做法
let allData = [];
onMounted(async () => {
  allData = await fetchAllData();  // 加载所有数据
});

// ✅ 好的做法
onMounted(async () => {
  list.value = await fetchInitialData();  // 只加载初始数据
});

const loadMore = async () => {
  const moreData = await fetchMoreData(currentPage.value);
  list.value = list.value.concat(moreData);
};
```

### 使用分页或无限滚动

避免一次性加载所有数据。

```vue
<template>
  <VirtList
    ref="virtListRef"
    :list="list"
    itemKey="id"
    :minSize="50"
    @toBottom="handleToBottom"
  >
    <template #default="{ itemData }">
      <ListItem :itemData="itemData" />
    </template>
  </VirtList>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef([]);
const currentPage = ref(1);
const isLoading = ref(false);
const virtListRef = ref<InstanceType<typeof VirtList>>();

const handleToBottom = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  const newData = await fetchData(currentPage.value);
  list.value = list.value.concat(newData);
  currentPage.value++;
  isLoading.value = false;
  
  virtListRef.value?.forceUpdate();
};
</script>
```

## 渲染优化

### 避免复杂的计算属性

在列表项中避免使用复杂的计算属性。

```vue
<!-- ❌ 避免 -->
<template #default="{ itemData }">
  <div>
    {{ computedValue.value }}  <!-- 复杂计算 -->
    {{ expensiveFormat(itemData) }}  <!-- 每次渲染都计算 -->
  </div>
</template>

<!-- ✅ 推荐 -->
<template #default="{ itemData }">
  <div>
    {{ itemData.formattedValue }}  <!-- 预先计算好的值 -->
    {{ itemData.displayText }}  <!-- 简单值 -->
  </div>
</template>
```

### 使用 v-once 静态内容

对于不变的静态内容使用 `v-once`。

```vue
<template #default="{ itemData }">
  <div class="item">
    <span v-once>{{ itemData.staticLabel }}</span>
    {{ itemData.dynamicContent }}
  </div>
</template>
```

## 滚动性能优化

### 使用 scrollDistance 提前触发加载

```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  :scrollDistance="200"
  @toBottom="handleToBottom"
>
  <!-- 在距离底部 200px 时就触发加载 -->
</template>
```

### 防抖处理滚动事件

```typescript
import { debounce } from 'lodash-es';

const handleScroll = debounce((e: Event) => {
  // 处理滚动事件
}, 100);

<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  @scroll="handleScroll"
>
```

## Vue 2 vs Vue 3 最佳实践

### Vue 2

```vue
<script>
export default {
  data() {
    return {
      list: [],
      expandedKeys: [],
    };
  },
  methods: {
    // ✅ 使用数组方法触发响应式
    addData(newData) {
      this.list.push(...newData);
    },
    removeData(index) {
      this.list.splice(index, 1);
    },
    updateExpanded(key) {
      this.expandedKeys.push(key);
    }
  }
};
</script>
```

### Vue 3

```vue
<script setup lang="ts">
import { shallowRef, ref } from 'vue';

// ✅ 使用 shallowRef
const list = shallowRef([]);
const expandedKeys = ref<TreeNodeKey[]>([]);

// ✅ 创建新数组触发响应式
const addData = (newData: any[]) => {
  list.value = [...list.value, ...newData];
};

const updateExpanded = (key: TreeNodeKey) => {
  expandedKeys.value = [...expandedKeys.value, key];
};
</script>
```

## 调试和性能监控

### 使用 reactiveData 监控渲染状态

```typescript
const reactiveData = computed(() => {
  return virtListRef.value?.getReactiveData();
});

watch(reactiveData, (data) => {
  console.log('Render range:', data.renderBegin, data.renderEnd);
  console.log('Visible items:', data.inViewBegin, data.inViewEnd);
});
```

### 性能分析

```typescript
import { performance } from 'perf_hooks';

const loadLargeData = () => {
  const start = performance.now();
  
  list.value = generateLargeData(100000);
  
  const end = performance.now();
  console.log(`Load time: ${end - start}ms`);
};
```

## 总结

### 必须遵守

1. ✅ 大数据集使用 `shallowRef`
2. ✅ 列表长度变化后调用 `forceUpdate()`
3. ✅ `itemKey` 必须唯一
4. ✅ 固定高度使用 `fixed: true`
5. ✅ 分离渲染层和交互层

### 应该避免

1. ❌ 不要在 `itemStyle/itemClass` 中使用复杂函数
2. ❌ 不要在大数据量下使用 `defaultExpandAll`
3. ❌ 不要一次性加载所有数据
4. ❌ 不要在列表项中使用复杂计算
5. ❌ 不要频繁修改列表项内容

### 性能参考值

| 场景 | 推荐配置 |
|------|---------|
| 小数据 (< 1000) | `ref`, `fixed: false`, 默认 buffer |
| 中等数据 (1000-10000) | `shallowRef`, `fixed: false`, `buffer: 5` |
| 大数据 (10000-100000) | `shallowRef`, `fixed: true`, `buffer: 10` |
| 超大数据 (> 100000) | `shallowRef`, `fixed: true`, 分页加载 |
