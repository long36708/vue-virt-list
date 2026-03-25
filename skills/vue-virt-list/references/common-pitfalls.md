# vue-virt-list 常见问题和解决方案

## 问题 1：滚动行为异常

### 症状
- 滚动时出现跳动
- 无法滚动到正确位置
- 滚动条位置与显示内容不匹配

### 原因
`itemKey` 不唯一

### 解决方案
确保每个项目都有唯一的 `itemKey`。

**错误示例**：
```vue
<template>
  <VirtList
    :list="list"
    itemKey="name"  <!-- ❌ name 可能重复 -->
    :minSize="50"
  >
</template>

<script setup>
const list = ref([
  { name: 'Item 1' },
  { name: 'Item 2' },
  { name: 'Item 1' },  <!-- 重复的 name -->
]);
</script>
```

**正确示例**：
```vue
<template>
  <VirtList
    :list="list"
    itemKey="id"  <!-- ✅ 唯一标识 -->
    :minSize="50"
  >
</template>

<script setup>
const list = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 1' },  <!-- 不同的 id -->
]);
</script>
```

**最佳实践**：
```typescript
// 如果数据没有唯一标识，生成一个
const list = data.map((item, index) => ({
  ...item,
  _uniqueId: `${item.type}-${index}-${Date.now()}`,
}));
```

---

## 问题 2：快速滚动时白屏

### 症状
- 快速滚动时出现空白区域
- 新内容加载延迟

### 原因
`buffer` 设置过小

### 解决方案
增加 `buffer` 或单独设置 `bufferTop` 和 `bufferBottom`。

```vue
<template>
  <VirtList
    :list="list"
    itemKey="id"
    :minSize="50"
    :buffer="10"  <!-- ✅ 增加 buffer -->
  >
</template>
```

或者：
```vue
<template>
  <VirtList
    :list="list"
    itemKey="id"
    :minSize="50"
    :bufferTop="8"
    :bufferBottom="12"  <!-- ✅ 不对称 buffer -->
  >
</template>
```

**调优建议**：
- 正常滚动：`buffer: 0`（默认）
- 快速滚动：`buffer: 5-10`
- 极快滚动：`buffer: 15-20`

---

## 问题 3：列表更新后内容不显示

### 症状
- 使用 `shallowRef` 后，数据变化但视图不更新
- 添加/删除数据后列表无反应

### 原因
`shallowRef` 不会深度响应式变化，需要手动触发更新

### 解决方案
调用 `forceUpdate()` 方法。

```vue
<template>
  <VirtList
    ref="virtListRef"
    :list="list"
    itemKey="id"
    :minSize="50"
  >
  </VirtList>
  
  <button @click="addItems">Add Items</button>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef([...]);
const virtListRef = ref<InstanceType<typeof VirtList>>();

const addItems = () => {
  const newItems = Array.from({ length: 100 }, (_, i) => ({
    id: list.value.length + i,
    text: `Item ${list.value.length + i}`,
  }));
  
  list.value = list.value.concat(newItems);
  
  // ✅ 必须调用 forceUpdate
  virtListRef.value?.forceUpdate();
};
</script>
```

---

## 问题 4：Vue 2 和 Vue 3 响应式差异

### 症状
- Vue 2 中修改数组不更新
- Vue 3 中修改数组不更新
- 受控组件状态不同步

### Vue 2 问题

**错误示例**：
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
    updateList() {
      this.list = newData;  // ❌ 直接赋值不触发响应式
    },
    updateExpanded() {
      this.expandedKeys = ['node-1'];  // ❌ 直接赋值不触发响应式
    }
  }
};
</script>
```

**正确示例**：
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
    updateList() {
      // ✅ 使用数组方法
      this.list.push(...newData);
      // 或
      this.list.splice(0, this.list.length, ...newData);
    },
    updateExpanded() {
      // ✅ 使用数组方法
      this.expandedKeys.push('node-1');
      this.expandedKeys.splice(0, 1);
    }
  }
};
</script>
```

### Vue 3 问题

**错误示例**：
```vue
<script setup lang="ts">
const list = ref([]);
const expandedKeys = ref([]);

const updateList = () => {
  list.value.push(...newData);  // ❌ 在 shallowRef 下不触发
};

const updateExpanded = () => {
  expandedKeys.value.push('node-1');  // ❌ 直接修改不触发响应式
};
</script>
```

**正确示例**：
```vue
<script setup lang="ts">
const list = shallowRef([]);
const expandedKeys = ref<TreeNodeKey[]>([]);

const updateList = () => {
  // ✅ 创建新数组
  list.value = [...list.value, ...newData];
  // 或使用 forceUpdate
  list.value.push(...newData);
  virtListRef.value?.forceUpdate();
};

const updateExpanded = () => {
  // ✅ 创建新数组
  expandedKeys.value = [...expandedKeys.value, 'node-1'];
};
</script>
```

---

## 问题 5：大数据量时性能问题

### 症状
- 渲染 10 万+ 数据卡顿
- 滚动不流畅
- 内存占用过高

### 原因
1. 使用 `ref` 而非 `shallowRef`
2. DOM 结构过于复杂
3. 没有使用固定高度模式
4. buffer 设置不当

### 解决方案

#### 1. 使用 shallowRef

```typescript
// ❌ 错误
const list = ref(Array.from({ length: 100000 }, (_, i) => ({ id: i })));

// ✅ 正确
const list = shallowRef(Array.from({ length: 100000 }, (_, i) => ({ id: i })));
```

#### 2. 使用固定高度

```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="60"
  :fixed="true"  <!-- ✅ 固定高度 -->
>
```

#### 3. 简化 DOM 结构

```vue
<!-- ❌ 复杂 DOM -->
<template #default="{ itemData }">
  <div class="complex-item">
    <div class="wrapper">
      <div class="header">
        <span class="title">{{ itemData.title }}</span>
        <span class="date">{{ itemData.date }}</span>
      </div>
      <div class="body">
        <p>{{ itemData.content }}</p>
        <div class="actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      </div>
      <div class="footer">
        <div class="tags">
          <span v-for="tag in itemData.tags">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- ✅ 简化 DOM -->
<template #default="{ itemData }">
  <div class="simple-item">
    {{ itemData.title }} - {{ itemData.content }}
  </div>
</template>
```

#### 4. 分页或无限滚动

```typescript
// ❌ 一次性加载所有数据
onMounted(async () => {
  list.value = await fetchAllData();  // 加载 100 万条
});

// ✅ 分页加载
const loadMore = async () => {
  const newData = await fetchPage(currentPage.value, pageSize);
  list.value = list.value.concat(newData);
  virtListRef.value?.forceUpdate();
};
```

---

## 问题 6：VirtTree 大数据量展开卡顿

### 症状
- 展开节点时卡顿
- 折叠节点时卡顿
- 使用 `defaultExpandAll` 后无法操作

### 原因
- `defaultExpandAll` 导致大量 DOM 同时渲染
- 递归展开操作消耗性能

### 解决方案

#### 1. 避免使用 defaultExpandAll

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

#### 2. 使用懒加载

```typescript
const treeData = shallowRef([
  {
    key: 'root',
    title: 'Root',
    isLeaf: false,  // 标记非叶子节点
  }
]);

const loadNode = async (node: any) => {
  // 只在需要时加载子节点
  const children = await fetchChildren(node.key);
  return children;
};
```

#### 3. 分批展开

```typescript
const expandNodesInBatch = async (keys: TreeNodeKey[], batchSize = 10) => {
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    batch.forEach(key => {
      virtTreeRef.value?.expandNode(key);
    });
    await nextTick();  // 等待渲染完成
  }
};
```

---

## 问题 7：VirtGrid 布局错乱

### 症状
- 网格不对齐
- 列数不对
- 宽度不均匀

### 原因
- `gridItems` 设置错误
- 容器宽度不足
- item 宽度没有正确设置

### 解决方案

#### 1. 设置正确的 gridItems

```vue
<!-- ✅ 根据容器宽度设置 -->
<VirtGrid
  :list="list"
  :gridItems="3"  <!-- 3列 -->
  :minSize="100"
>
```

#### 2. 确保容器有固定宽度

```vue
<div style="width: 1200px; height: 600px">
  <VirtGrid
    :list="list"
    :gridItems="3"
    :minSize="100"
  >
    <template #default="{ itemData }">
      <div class="grid-item">
        {{ itemData.name }}
      </div>
    </template>
  </VirtGrid>
</div>

<style scoped>
.grid-item {
  flex: 1;  <!-- 均分宽度 -->
  margin: 2px;
  padding: 10px;
}
</style>
```

#### 3. 响应式 gridItems

```typescript
const gridItems = ref(3);

const updateGridItems = () => {
  const width = window.innerWidth;
  gridItems.value = Math.floor(width / 300);  // 每300px一列
};

onMounted(() => {
  updateGridItems();
  window.addEventListener('resize', updateGridItems);
});
```

---

## 问题 8：样式不生效

### 症状
- `itemStyle` 和 `itemClass` 不生效
- 样式被覆盖

### 原因
- 优先级问题
- 作用域问题
- 函数形式使用不当

### 解决方案

#### 1. 提高样式优先级

```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  itemStyle="padding: 10px !important; border-bottom: 1px solid #eee;"
  itemClass="list-item"
>
```

#### 2. 使用全局样式

```css
/* styles.css */
.virt-list-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
```

```vue
<VirtList
  :list="list"
  itemKey="id"
  :minSize="50"
  itemClass="virt-list-item"
>
```

#### 3. 深度选择器

```vue
<style scoped>
:deep(.virt-list-item) {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
</style>
```

---

## 问题 9：横向滚动不工作

### 症状
- 设置 `horizontal: true` 后仍垂直滚动
- 内容显示异常

### 解决方案

确保容器和内容都支持横向滚动。

```vue
<div style="width: 100%; height: 200px;">
  <VirtList
    :list="list"
    itemKey="id"
    :minSize="200"
    :horizontal="true"
  >
    <template #default="{ itemData }">
      <div class="horizontal-item" style="width: 200px;">
        {{ itemData.name }}
      </div>
    </template>
  </VirtList>
</div>

<style scoped>
.horizontal-item {
  min-width: 200px;  /* 确保固定宽度 */
  display: inline-block;
}
</style>
```

---

## 问题 10：内存泄漏

### 症状
- 长时间使用后页面变慢
- 内存持续增长

### 原因
- 事件监听器未清理
- 定时器未清理
- 大数据未释放

### 解决方案

#### 1. 清理事件监听器

```typescript
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);  // ✅ 清理
});
```

#### 2. 清理定时器

```typescript
let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  intervalId = setInterval(() => {
    // 定时任务
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);  // ✅ 清理
});
```

#### 3. 清理数据

```typescript
onUnmounted(() => {
  list.value = [];  // ✅ 清空数据
  sizesMap.clear();  // ✅ 清空尺寸缓存
});
```

---

## 问题 11：VirtTree 懒加载失效

### 症状
- 点击展开图标没有反应
- 子节点不显示

### 原因
- 没有标记 `isLeaf`
- `load-node` 函数返回格式错误
- 没有返回 Promise

### 解决方案

```typescript
// ✅ 正确的懒加载实现
const treeData = shallowRef([
  {
    key: 'parent',
    title: 'Parent',
    isLeaf: false,  // 标记为非叶子节点
  }
]);

const loadNode = async (node: any): Promise<any[]> => {
  // ✅ 返回 Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      const children = [
        {
          key: `${node.key}-1`,
          title: 'Child 1',
          isLeaf: true,  // 标记为叶子节点
        },
        {
          key: `${node.key}-2`,
          title: 'Child 2',
          isLeaf: false,  // 还可以继续展开
        }
      ];
      resolve(children);
    }, 500);
  });
};
```

---

## 问题 12：滚动位置丢失

### 症状
- 更新列表后滚动位置重置
- 切换标签页后滚动位置丢失

### 解决方案

#### 1. 保存滚动位置

```typescript
const savedScrollPosition = ref(0);

const saveScrollPosition = () => {
  savedScrollPosition.value = virtListRef.value?.getOffset() || 0;
};

const restoreScrollPosition = () => {
  nextTick(() => {
    virtListRef.value?.scrollToOffset(savedScrollPosition.value);
  });
};

watch(list, () => {
  saveScrollPosition();
  nextTick(() => {
    restoreScrollPosition();
  });
});
```

#### 2. 使用 scrollToIndex

```typescript
const updateListAndKeepPosition = async (newData: any[]) => {
  const currentOffset = virtListRef.value?.getOffset() || 0;
  list.value = newData;
  await nextTick();
  virtListRef.value?.scrollToOffset(currentOffset);
};
```

---

## 问题 13：类型错误

### 症状
- TypeScript 报错
- 类型推断不正确

### 解决方案

#### 1. 正确的泛型类型

```typescript
interface ItemData {
  id: number;
  name: string;
  value: number;
}

const list = shallowRef<ItemData[]>([]);
```

#### 2. 正确的 ref 类型

```typescript
import type { VirtList } from 'vue-virt-list';

const virtListRef = ref<InstanceType<typeof VirtList>>();
```

#### 3. 正确的事件类型

```typescript
const handleScroll = (e: Event) => {
  console.log(e.target);
};

const handleToBottom = (item: any) => {
  console.log(item);
};
```

---

## 问题 14：浏览器高度限制

### 症状
- 数据超过约 38 万条后无法继续滚动
- 滚动条到达顶部或底部

### 原因
浏览器对元素高度有限制（约 33,554,400px）

### 解决方案

#### 1. 使用分页

```typescript
const pageSize = 10000;
const currentPage = ref(1);

const loadData = async (page: number) => {
  const data = await fetchData(page, pageSize);
  list.value = data;
};
```

#### 2. 使用 deletedList2Top

```typescript
const loadMore = async () => {
  if (list.value.length > 300000) {
    const removed = list.value.slice(0, 100000);
    virtListRef.value?.deletedList2Top(removed);
  }
  
  const newData = await fetchMoreData();
  list.value = list.value.concat(newData);
};
```

---

## 调试技巧

### 1. 使用 reactiveData

```typescript
const reactiveData = computed(() => {
  return virtListRef.value?.getReactiveData();
});

watch(reactiveData, (data) => {
  console.log('Render Begin:', data?.renderBegin);
  console.log('Render End:', data?.renderEnd);
  console.log('In View Begin:', data?.inViewBegin);
  console.log('In View End:', data?.inViewEnd);
});
```

### 2. 使用 slotSize

```typescript
const slotSize = computed(() => {
  return virtListRef.value?.slotSize;
});

watch(slotSize, (size) => {
  console.log('Client Size:', size?.clientSize);
  console.log('Header Size:', size?.headerSize);
  console.log('Footer Size:', size?.footerSize);
});
```

### 3. 使用 sizesMap

```typescript
const logSizes = () => {
  const sizes = virtListRef.value?.sizesMap;
  sizes?.forEach((size, key) => {
    console.log(`${key}: ${size}px`);
  });
};
```

### 4. 性能监控

```typescript
import { performance } from 'perf_hooks';

const measurePerformance = () => {
  const start = performance.now();
  
  // 执行操作
  list.value = generateLargeData(100000);
  
  const end = performance.now();
  console.log(`Execution time: ${end - start}ms`);
};
```

---

## 总结

### 最常见的问题

1. ✅ `itemKey` 不唯一 → 使用唯一标识
2. ✅ 白屏问题 → 增加 buffer
3. ✅ 不更新 → 调用 `forceUpdate()`
4. ✅ 性能问题 → 使用 `shallowRef` 和固定高度
5. ✅ 响应式差异 → Vue 2/3 使用正确的数组操作

### 调试流程

1. 检查 `itemKey` 是否唯一
2. 检查是否使用 `shallowRef`
3. 检查列表更新后是否调用 `forceUpdate()`
4. 检查 `buffer` 设置是否合理
5. 检查 DOM 结构是否过于复杂
6. 使用 `reactiveData` 监控渲染状态

### 性能优化检查清单

- [ ] 使用 `shallowRef`
- [ ] 列表更新后调用 `forceUpdate()`
- [ ] 大数据使用固定高度 `fixed: true`
- [ ] 简化 DOM 结构
- [ ] 合理设置 buffer
- [ ] 使用分页或无限滚动
- [ ] 避免复杂计算
- [ ] 及时清理事件监听器和定时器
