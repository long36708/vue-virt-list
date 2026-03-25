# vue-virt-list 常见用例代码示例

## 1. 基础 VirtList 示例

### 1.1 最简用法

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
import { ref } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = ref([{ id: 0, text: 'text' }]);
</script>
```

### 1.2 大数据量列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <div class="stats">
      <span>Total: {{ list.length }}</span>
      <span>Render: {{ reactiveData?.renderBegin }} - {{ reactiveData?.renderEnd }}</span>
    </div>
    
    <VirtList
      ref="virtListRef"
      :list="list"
      itemKey="id"
      :minSize="50"
      :buffer="10"
    >
      <template #default="{ itemData, index }">
        <div class="list-item">
          <div class="item-id">#{{ itemData.id }}</div>
          <div class="item-content">{{ itemData.text }}</div>
          <div class="item-time">{{ itemData.time }}</div>
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
    time: new Date().toLocaleString(),
  }))
);

const virtListRef = ref<InstanceType<typeof VirtList>>();

const reactiveData = computed(() => {
  return virtListRef.value?.getReactiveData();
});
</script>

<style scoped>
.stats {
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  gap: 20px;
}

.list-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-id {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.item-content {
  flex: 1;
}

.item-time {
  color: #999;
  font-size: 12px;
}
</style>
```

### 1.3 固定高度列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      :list="list"
      itemKey="id"
      :minSize="60"
      :fixed="true"
    >
      <template #default="{ itemData }">
        <div class="fixed-item">
          {{ itemData.text }}
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Fixed Height Item ${i}`,
  }))
);
</script>

<style scoped>
.fixed-item {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
</style>
```

### 1.4 带插槽的列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      :list="list"
      itemKey="id"
      :minSize="50"
    >
      <template #header>
        <div class="list-header">
          <h2>Header Section</h2>
          <p>This is a header slot content</p>
        </div>
      </template>

      <template #default="{ itemData, index }">
        <div class="list-item">
          {{ index }}: {{ itemData.text }}
        </div>
      </template>

      <template #footer>
        <div class="list-footer">
          <p>Total Items: {{ list.length }}</p>
        </div>
      </template>

      <template #sticky-header>
        <div class="sticky-header">
          Sticky Header
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
  }))
);
</script>

<style scoped>
.list-header {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
}

.list-footer {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
}

.sticky-header {
  padding: 10px 15px;
  background: #1890ff;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}
</style>
```

## 2. 无限滚动示例

### 2.1 滚动到底部加载更多

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      ref="virtListRef"
      :list="list"
      itemKey="id"
      :minSize="50"
      :scrollDistance="200"
      @toBottom="loadMore"
    >
      <template #default="{ itemData, index }">
        <div class="list-item">
          <span class="index">{{ index + 1 }}</span>
          <span>{{ itemData.text }}</span>
        </div>
      </template>
      
      <template #footer>
        <div v-if="isLoading" class="loading">
          Loading...
        </div>
        <div v-else-if="noMoreData" class="no-more">
          No more data
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, nextTick } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef<any[]>([]);
const isLoading = ref(false);
const noMoreData = ref(false);
const currentPage = ref(1);
const virtListRef = ref<InstanceType<typeof VirtList>>();

const fetchData = async (page: number) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const data = Array.from({ length: 20 }, (_, i) => ({
        id: (page - 1) * 20 + i,
        text: `Page ${page} Item ${i + 1}`,
      }));
      resolve(data);
    }, 500);
  });
};

const loadMore = async () => {
  if (isLoading.value || noMoreData.value) return;
  
  isLoading.value = true;
  
  try {
    const newData = await fetchData(currentPage.value);
    
    if (newData.length === 0) {
      noMoreData.value = true;
    } else {
      list.value = [...list.value, ...newData];
      currentPage.value++;
      
      await nextTick();
      virtListRef.value?.forceUpdate();
    }
  } finally {
    isLoading.value = false;
  }
};

// 初始加载
loadMore();
</script>

<style scoped>
.list-item {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.index {
  font-weight: bold;
  color: #666;
  min-width: 50px;
}

.loading, .no-more {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
```

### 2.2 双向无限滚动（上下都加载）

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      ref="virtListRef"
      :list="list"
      itemKey="id"
      :minSize="50"
      :scrollDistance="200"
      @toTop="loadPrevious"
      @toBottom="loadNext"
    >
      <template #default="{ itemData }">
        <div class="list-item">
          {{ itemData.text }}
        </div>
      </template>
      
      <template #header>
        <div v-if="isLoadingPrevious" class="loading">
          Loading previous...
        </div>
      </template>
      
      <template #footer>
        <div v-if="isLoadingNext" class="loading">
          Loading next...
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, nextTick } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef<any[]>([]);
const isLoadingPrevious = ref(false);
const isLoadingNext = ref(false);
const currentPage = ref(1);
const virtListRef = ref<InstanceType<typeof VirtList>>();

const fetchData = async (page: number) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const data = Array.from({ length: 20 }, (_, i) => ({
        id: page * 1000 + i,
        text: `Page ${page} Item ${i + 1}`,
      }));
      resolve(data);
    }, 500);
  });
};

const loadPrevious = async () => {
  if (isLoadingPrevious.value || currentPage.value <= 1) return;
  
  isLoadingPrevious.value = true;
  const newPage = currentPage.value - 1;
  
  try {
    const newData = await fetchData(newPage);
    list.value = [...newData, ...list.value];
    currentPage.value = newPage;
    
    await nextTick();
    // 滚动到之前的位置
    const currentOffset = virtListRef.value?.getOffset() || 0;
    const addedHeight = newData.reduce((sum, item) => sum + 50, 0);
    virtListRef.value?.scrollToOffset(currentOffset + addedHeight);
    virtListRef.value?.forceUpdate();
  } finally {
    isLoadingPrevious.value = false;
  }
};

const loadNext = async () => {
  if (isLoadingNext.value) return;
  
  isLoadingNext.value = true;
  const newPage = currentPage.value + 1;
  
  try {
    const newData = await fetchData(newPage);
    list.value = [...list.value, ...newData];
    currentPage.value = newPage;
    
    await nextTick();
    virtListRef.value?.forceUpdate();
  } finally {
    isLoadingNext.value = false;
  }
};

// 初始加载
fetchData(1).then((data) => {
  list.value = data;
});
</script>
```

## 3. VirtTree 示例

### 3.1 基础树

```vue
<template>
  <div style="width: 400px; height: 600px">
    <VirtTree
      :list="treeData"
      itemKey="id"
      expandable
      defaultExpandAll
    >
      <template #default="{ node }">
        <div class="tree-node">
          {{ node.title }}
        </div>
      </template>
    </VirtTree>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtTree } from 'vue-virt-list';

const treeData = shallowRef([
  {
    id: '1',
    title: 'Node 1',
    children: [
      {
        id: '1-1',
        title: 'Node 1-1',
      },
      {
        id: '1-2',
        title: 'Node 1-2',
        children: [
          { id: '1-2-1', title: 'Node 1-2-1' },
          { id: '1-2-2', title: 'Node 1-2-2' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Node 2',
    children: [
      { id: '2-1', title: 'Node 2-1' },
      { id: '2-2', title: 'Node 2-2' },
    ],
  },
]);
</script>

<style scoped>
.tree-node {
  padding: 5px 10px;
}
</style>
```

### 3.2 可选树（Selectable）

```vue
<template>
  <div style="width: 400px; height: 600px">
    <VirtTree
      ref="virtTreeRef"
      :list="treeData"
      itemKey="id"
      selectable
      selectMultiple
      v-model:selectedKeys="selectedKeys"
      @select="handleSelect"
    >
      <template #default="{ node }">
        <div class="tree-node">
          {{ node.title }}
        </div>
      </template>
    </VirtTree>
    
    <div class="selected-info">
      <h3>Selected Keys:</h3>
      <p>{{ selectedKeys.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';

const treeData = shallowRef([...]);
const selectedKeys = ref<string[]>([]);
const virtTreeRef = ref<InstanceType<typeof VirtTree>>();

const handleSelect = (keys: string[], info: any) => {
  console.log('Selected:', keys, info);
};
</script>
```

### 3.3 带复选框的树

```vue
<template>
  <div style="width: 400px; height: 600px">
    <VirtTree
      ref="virtTreeRef"
      :list="treeData"
      itemKey="id"
      expandable
      checkable
      v-model:checkedKeys="checkedKeys"
      @check="handleCheck"
    >
      <template #default="{ node }">
        <div class="tree-node">
          {{ node.title }}
        </div>
      </template>
    </VirtTree>
    
    <div class="checked-info">
      <h3>Checked Keys:</h3>
      <p>{{ checkedKeys.join(', ') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';

const treeData = shallowRef([...]);
const checkedKeys = ref<string[]>([]);
const virtTreeRef = ref<InstanceType<typeof VirtTree>>();

const handleCheck = (keys: string[], info: any) => {
  console.log('Checked:', keys, info);
};
</script>
```

### 3.4 懒加载树

```vue
<template>
  <div style="width: 400px; height: 600px">
    <VirtTree
      ref="virtTreeRef"
      :list="treeData"
      itemKey="id"
      expandable
      :load-node="loadNode"
    >
      <template #default="{ node }">
        <div class="tree-node">
          {{ node.title }}
          <span v-if="node.isLoading" class="loading">Loading...</span>
        </div>
      </template>
    </VirtTree>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';

const treeData = shallowRef([
  {
    id: 'root',
    title: 'Root Node',
    isLeaf: false,
  }
]);

const loadNode = async (node: any): Promise<any[]> => {
  // 模拟异步加载
  return new Promise((resolve) => {
    setTimeout(() => {
      const children = Array.from({ length: 10 }, (_, i) => ({
        id: `${node.key}-${i}`,
        title: `Child ${i + 1} of ${node.key}`,
        isLeaf: Math.random() > 0.5,
      }));
      resolve(children);
    }, 500);
  });
};
</script>

<style scoped>
.loading {
  color: #1890ff;
  margin-left: 10px;
}
</style>
```

## 4. VirtGrid 示例

### 4.1 基础网格

```vue
<template>
  <div style="width: 1000px; height: 600px">
    <VirtGrid
      :list="list"
      :gridItems="4"
      :minSize="100"
    >
      <template #default="{ itemData, index }">
        <div class="grid-item">
          <div class="item-index">{{ index }}</div>
          <div class="item-title">{{ itemData.title }}</div>
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtGrid } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
  }))
);
</script>

<style scoped>
.grid-item {
  padding: 10px;
  margin: 5px;
  border: 1px solid #ddd;
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-index {
  font-weight: bold;
  color: #666;
}

.item-title {
  color: #333;
}
</style>
```

### 4.2 响应式网格

```vue
<template>
  <div style="width: 100%; height: 600px">
    <div class="controls">
      <label>
        Columns:
        <input type="number" v-model.number="gridItems" min="1" max="6" />
      </label>
      <button @click="scrollToRandom">Scroll to Random</button>
    </div>
    
    <VirtGrid
      ref="virtGridRef"
      :list="list"
      :gridItems="gridItems"
      :minSize="120"
    >
      <template #default="{ itemData, index }">
        <div class="grid-item">
          <div class="item-image">{{ itemData.icon }}</div>
          <div class="item-title">{{ itemData.title }}</div>
        </div>
      </template>
    </VirtGrid>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtGrid } from 'vue-virt-list';

const gridItems = ref(3);
const list = shallowRef(
  Array.from({ length: 500 }, (_, i) => ({
    id: i,
    title: `Card ${i}`,
    icon: '📦',
  }))
);
const virtGridRef = ref<InstanceType<typeof VirtGrid>>();

const scrollToRandom = () => {
  const randomIndex = Math.floor(Math.random() * list.value.length);
  virtGridRef.value?.scrollToIndex(randomIndex);
};
</script>

<style scoped>
.controls {
  padding: 10px;
  background: #f0f0f0;
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.grid-item {
  padding: 15px;
  margin: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.item-image {
  font-size: 32px;
}

.item-title {
  font-weight: bold;
  color: #333;
}
</style>
```

## 5. 高级用例

### 5.1 可编辑列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      :list="list"
      itemKey="id"
      :minSize="80"
    >
      <template #default="{ itemData }">
        <div class="editable-item">
          <input
            v-model="itemData.text"
            @blur="handleEdit(itemData)"
          />
          <button @click="deleteItem(itemData.id)">Delete</button>
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
  }))
);

const handleEdit = (item: any) => {
  console.log('Edit item:', item);
  // 调用 API 保存
};

const deleteItem = (id: number) => {
  const index = list.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    list.value.splice(index, 1);
    // 注意：shallowRef 下需要 forceUpdate
  }
};
</script>
```

### 5.2 搜索过滤列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <div class="search-box">
      <input
        v-model="searchKeyword"
        placeholder="Search..."
        @input="handleSearch"
      />
      <span>Found: {{ filteredList.length }} / {{ list.length }}</span>
    </div>
    
    <VirtList
      :list="filteredList"
      itemKey="id"
      :minSize="50"
    >
      <template #default="{ itemData }">
        <div class="list-item">
          {{ itemData.text }}
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Searchable Item ${i} - ${String.fromCharCode(65 + (i % 26))}`,
  }))
);

const searchKeyword = ref('');

const filteredList = computed(() => {
  if (!searchKeyword.value) {
    return list.value;
  }
  return list.value.filter((item) =>
    item.text.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const handleSearch = () => {
  // 搜索逻辑在 computed 中自动处理
};
</script>
```

### 5.3 拖拽排序列表

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      :list="list"
      itemKey="id"
      :minSize="60"
    >
      <template #default="{ itemData, index }">
        <div
          class="draggable-item"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover.prevent
          @drop="handleDrop(index)"
        >
          <span class="drag-handle">⋮⋮</span>
          <span class="item-text">{{ itemData.text }}</span>
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Draggable Item ${i}`,
  }))
);

const dragStartIndex = ref(-1);

const handleDragStart = (index: number) => {
  dragStartIndex.value = index;
};

const handleDrop = (dropIndex: number) => {
  if (dragStartIndex.value === -1 || dragStartIndex.value === dropIndex) {
    return;
  }
  
  const draggedItem = list.value[dragStartIndex.value];
  list.value.splice(dragStartIndex.value, 1);
  list.value.splice(dropIndex, 0, draggedItem);
  
  dragStartIndex.value = -1;
};
</script>

<style scoped>
.draggable-item {
  padding: 10px 15px;
  background: white;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: move;
}

.drag-handle {
  color: #999;
  cursor: grab;
  font-size: 16px;
}

.draggable-item:hover {
  background: #f9f9f9;
}
</style>
```

### 5.4 虚拟滚动表格

```vue
<template>
  <div style="width: 100%; height: 600px">
    <VirtList
      :list="list"
      itemKey="id"
      :minSize="50"
    >
      <template #header>
        <div class="table-header">
          <div class="header-cell" style="width: 80px">ID</div>
          <div class="header-cell" style="flex: 1">Name</div>
          <div class="header-cell" style="width: 150px">Email</div>
          <div class="header-cell" style="width: 100px">Action</div>
        </div>
      </template>

      <template #default="{ itemData }">
        <div class="table-row">
          <div class="table-cell" style="width: 80px">{{ itemData.id }}</div>
          <div class="table-cell" style="flex: 1">{{ itemData.name }}</div>
          <div class="table-cell" style="width: 150px">{{ itemData.email }}</div>
          <div class="table-cell" style="width: 100px">
            <button @click="editItem(itemData)">Edit</button>
          </div>
        </div>
      </template>
    </VirtList>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { VirtList } from 'vue-virt-list';

const list = shallowRef(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }))
);

const editItem = (item: any) => {
  console.log('Edit:', item);
};
</script>

<style scoped>
.table-header, .table-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.table-header {
  background: #f0f0f0;
  font-weight: bold;
}

.header-cell, .table-cell {
  padding: 10px;
  text-align: left;
}

.table-row:hover {
  background: #f9f9f9;
}
</style>
```

## 6. 完整组件示例

### 6.1 完整的聊天列表

```vue
<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Chat List</h2>
      <div class="stats">
        <span>Total: {{ messages.length }}</span>
      </div>
    </div>
    
    <VirtList
      ref="virtListRef"
      :list="messages"
      itemKey="id"
      :minSize="80"
      :buffer="10"
      @toBottom="loadMore"
    >
      <template #header>
        <div class="load-previous">
          <button @click="loadPrevious" v-if="hasPrevious">
            Load Previous Messages
          </button>
        </div>
      </template>

      <template #default="{ itemData }">
        <div class="message-item" :class="{ own: itemData.isOwn }">
          <div class="message-avatar">
            {{ itemData.sender.charAt(0) }}
          </div>
          <div class="message-content">
            <div class="message-sender">{{ itemData.sender }}</div>
            <div class="message-text">{{ itemData.text }}</div>
            <div class="message-time">{{ itemData.time }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div v-if="isLoading" class="loading">Loading...</div>
      </template>
    </VirtList>
    
    <div class="chat-input">
      <input
        v-model="newMessage"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, nextTick } from 'vue';
import { VirtList } from 'vue-virt-list';

const messages = shallowRef<any[]>([]);
const isLoading = ref(false);
const newMessage = ref('');
const hasPrevious = ref(true);
const virtListRef = ref<InstanceType<typeof VirtList>>();

// 模拟初始数据
const generateMessages = (count: number, startId = 0) => {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    sender: i % 2 === 0 ? 'User' : 'Bot',
    text: `Message ${startId + i}`,
    time: new Date().toLocaleTimeString(),
    isOwn: i % 2 === 0,
  }));
};

// 加载消息
const loadMessages = async (count: number) => {
  isLoading.value = true;
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve(generateMessages(count, messages.value.length));
    }, 500);
  });
};

// 加载更多
const loadMore = async () => {
  const newMessages = await loadMessages(20);
  messages.value = [...messages.value, ...newMessages];
  await nextTick();
  virtListRef.value?.forceUpdate();
  isLoading.value = false;
};

// 加载之前
const loadPrevious = async () => {
  const newMessages = generateMessages(20, -20);
  messages.value = [...newMessages, ...messages.value];
  await nextTick();
  const currentOffset = virtListRef.value?.getOffset() || 0;
  const addedHeight = newMessages.length * 80;
  virtListRef.value?.scrollToOffset(currentOffset + addedHeight);
  virtListRef.value?.forceUpdate();
};

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  
  const message = {
    id: Date.now(),
    sender: 'You',
    text: newMessage.value,
    time: new Date().toLocaleTimeString(),
    isOwn: true,
  };
  
  messages.value = [...messages.value, message];
  newMessage.value = '';
  
  nextTick(() => {
    virtListRef.value?.scrollToBottom();
    virtListRef.value?.forceUpdate();
  });
};

// 初始化
loadMessages(50).then((data) => {
  messages.value = data;
  nextTick(() => {
    virtListRef.value?.scrollToBottom();
  });
});
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
}

.chat-header {
  padding: 15px;
  background: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.chat-header h2 {
  margin: 0 0 10px 0;
}

.stats {
  color: #666;
  font-size: 14px;
}

.load-previous {
  padding: 10px;
  text-align: center;
}

.message-item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.message-item.own {
  flex-direction: row-reverse;
  background: #f0f7ff;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.message-content {
  flex: 1;
}

.message-sender {
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
}

.message-text {
  color: #333;
  line-height: 1.4;
}

.message-time {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-input button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #40a9ff;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
```

## 总结

以上示例涵盖了 vue-virt-list 的主要使用场景：

1. **基础列表**：简单到复杂的列表实现
2. **无限滚动**：单向和双向无限滚动
3. **树形组件**：各种树形配置和功能
4. **网格布局**：基础和响应式网格
5. **高级功能**：编辑、搜索、拖拽、表格等
6. **完整组件**：实际业务场景的完整实现

根据实际需求选择合适的示例进行参考和修改。
