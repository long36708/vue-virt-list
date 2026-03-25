<template>
  <div class="virt-list-container">
    <!-- 操作栏 -->
    <div class="actions-bar">
      <button @click="scrollToTop">Scroll to Top</button>
      <button @click="scrollToBottom">Scroll to Bottom</button>
      <button @click="scrollToRandom">Scroll to Random</button>
      <button @click="refresh">Refresh</button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <span>Total Items: {{ list.length }}</span>
      <span>Render Range: {{ renderRange.begin }} - {{ renderRange.end }}</span>
      <span>Scroll Offset: {{ scrollOffset }}px</span>
    </div>

    <!-- VirtList 组件 -->
    <div class="virt-list-wrapper">
      <VirtList
        ref="virtListRef"
        :list="list"
        itemKey="id"
        :minSize="50"
        :buffer="5"
        :fixed="false"
        @scroll="handleScroll"
        @toTop="handleToTop"
        @toBottom="handleToBottom"
        @rangeUpdate="handleRangeUpdate"
      >
        <!-- Header 插槽 -->
        <template #header>
          <div class="list-header">
            <h3>Virtual List Header</h3>
            <p>This is the header slot content</p>
          </div>
        </template>

        <!-- 默认插槽（列表项） -->
        <template #default="{ itemData, index }">
          <div class="list-item">
            <div class="item-id">#{{ itemData.id }}</div>
            <div class="item-content">
              <div class="item-title">{{ itemData.title }}</div>
              <div class="item-description">{{ itemData.description }}</div>
            </div>
            <div class="item-actions">
              <button @click.stop="handleEdit(itemData)">Edit</button>
              <button @click.stop="handleDelete(itemData.id)" class="danger">Delete</button>
            </div>
          </div>
        </template>

        <!-- Footer 插槽 -->
        <template #footer>
          <div class="list-footer">
            <p>End of list - Total {{ list.length }} items</p>
          </div>
        </template>

        <!-- Sticky Header 插槽 -->
        <template #sticky-header>
          <div class="sticky-header">
            <span>Sticky Header</span>
          </div>
        </template>

        <!-- Empty 插槽 -->
        <template #empty>
          <div class="empty-state">
            <p>No items available</p>
          </div>
        </template>
      </VirtList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed, nextTick, onMounted } from 'vue';
import type { Ref } from 'vue';
import { VirtList } from 'vue-virt-list';

// ============ 数据定义 ============
interface ListItem {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// 使用 shallowRef 以获得更好的性能
const list: Ref<ListItem[]> = shallowRef([]);

// VirtList 引用
const virtListRef = ref<InstanceType<typeof VirtList>>();

// ============ 响应式数据 ============
const scrollOffset = ref(0);
const renderRange = ref({ begin: 0, end: 0 });

// ============ 初始化数据 ============
const generateData = (count: number, startId = 0): ListItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Item ${startId + i}`,
    description: `This is the description for item ${startId + i}`,
    createdAt: new Date().toLocaleString(),
  }));
};

const initData = () => {
  list.value = generateData(1000);
};

// ============ 滚动控制方法 ============
const scrollToTop = () => {
  virtListRef.value?.scrollToTop();
};

const scrollToBottom = () => {
  virtListRef.value?.scrollToBottom();
};

const scrollToRandom = () => {
  const randomIndex = Math.floor(Math.random() * list.value.length);
  virtListRef.value?.scrollToIndex(randomIndex);
};

const scrollToOffset = (offset: number) => {
  virtListRef.value?.scrollToOffset(offset);
};

// ============ 数据操作方法 ============
const refresh = () => {
  // 重新生成数据
  list.value = generateData(1000);
  // 使用 shallowRef 后需要手动更新
  nextTick(() => {
    virtListRef.value?.forceUpdate();
  });
};

const addItems = (count: number = 10) => {
  const newItems = generateData(count, list.value.length);
  list.value = [...list.value, ...newItems];
  nextTick(() => {
    virtListRef.value?.forceUpdate();
  });
};

const deleteItem = (id: number) => {
  const index = list.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    list.value.splice(index, 1);
    nextTick(() => {
      virtListRef.value?.forceUpdate();
    });
  }
};

const updateItem = (id: number) => {
  const item = list.value.find((item) => item.id === id);
  if (item) {
    item.title = `Updated Item ${id}`;
    item.description = `Updated at ${new Date().toLocaleString()}`;
  }
};

// ============ 事件处理 ============
const handleScroll = (e: Event) => {
  const offset = virtListRef.value?.getOffset() || 0;
  scrollOffset.value = offset;
};

const handleToTop = (firstItem: any) => {
  console.log('Scrolled to top:', firstItem);
};

const handleToBottom = (lastItem: any) => {
  console.log('Scrolled to bottom:', lastItem);
  // 可以在这里触发加载更多
  addItems(10);
  nextTick(() => {
    // 保持滚动位置在底部附近
    virtListRef.value?.scrollToBottom();
  });
};

const handleRangeUpdate = (inViewBegin: number, inViewEnd: number) => {
  renderRange.value = {
    begin: inViewBegin,
    end: inViewEnd,
  };
};

const handleEdit = (item: ListItem) => {
  console.log('Edit item:', item);
  // 实现编辑逻辑
};

const handleDelete = (id: number) => {
  if (confirm(`Are you sure you want to delete item ${id}?`)) {
    deleteItem(id);
  }
};

// ============ 生命周期 ============
onMounted(() => {
  initData();
  console.log('VirtList mounted');
});

// ============ 暴露给父组件 ============
defineExpose({
  scrollToTop,
  scrollToBottom,
  scrollToRandom,
  refresh,
  addItems,
  deleteItem,
  updateItem,
});
</script>

<style scoped>
.virt-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 操作栏 */
.actions-bar {
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.actions-bar button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions-bar button:hover {
  background: #40a9ff;
}

/* 统计栏 */
.stats-bar {
  padding: 8px 10px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #666;
}

/* VirtList 容器 */
.virt-list-wrapper {
  flex: 1;
  overflow: hidden;
}

/* Header */
.list-header {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.list-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.list-header p {
  margin: 0;
  color: #666;
}

/* Sticky Header */
.sticky-header {
  padding: 10px 15px;
  background: #1890ff;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  font-weight: bold;
}

/* 列表项 */
.list-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  gap: 15px;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f9f9f9;
}

.item-id {
  width: 60px;
  font-weight: bold;
  color: #999;
  font-size: 12px;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-description {
  font-size: 13px;
  color: #666;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.item-actions button {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.item-actions button:hover {
  background: #40a9ff;
}

.item-actions button.danger {
  background: #ff4d4f;
}

.item-actions button.danger:hover {
  background: #ff7875;
}

/* Footer */
.list-footer {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
  color: #666;
}

/* Empty State */
.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 响应式 */
@media (max-width: 768px) {
  .item-id {
    width: 40px;
  }

  .item-description {
    display: none;
  }
}
</style>
