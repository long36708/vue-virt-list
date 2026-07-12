<template>
  <div class="grid-layout-container">
    <!-- 操作栏 -->
    <div class="actions-bar">
      <label>
        Columns:
        <input
          type="number"
          v-model.number="gridItems"
          min="1"
          max="6"
          @change="handleGridItemsChange"
        />
      </label>
      <button @click="scrollToTop">Scroll to Top</button>
      <button @click="scrollToBottom">Scroll to Bottom</button>
      <button @click="scrollToRandom">Scroll to Random</button>
      <button @click="refresh">Refresh</button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <span>Total Items: {{ list.length }}</span>
      <span>Columns: {{ gridItems }}</span>
      <span>Render Range: {{ renderRange.begin }} - {{ renderRange.end }}</span>
    </div>

    <!-- VirtGrid 组件 -->
    <div class="virt-grid-wrapper">
      <VirtGrid
        ref="virtGridRef"
        :list="list"
        :gridItems="gridItems"
        :minSize="150"
        :fixed="true"
        :buffer="5"
        @scroll="handleScroll"
        @toBottom="handleToBottom"
        @rangeUpdate="handleRangeUpdate"
      >
        <!-- Header 插槽 -->
        <template #header>
          <div class="grid-header">
            <h3>Virtual Grid Layout</h3>
            <p>{{ gridItems }} columns layout</p>
          </div>
        </template>

        <!-- 默认插槽（网格项） -->
        <template #default="{ itemData, index, rowIndex }">
          <div class="grid-item" :class="getItemClass(index)">
            <div class="item-icon">{{ itemData.icon }}</div>
            <div class="item-content">
              <div class="item-title">{{ itemData.title }}</div>
              <div class="item-description">{{ itemData.description }}</div>
              <div class="item-meta">
                <span class="item-index">#{{ index }}</span>
                <span class="item-row">Row: {{ rowIndex }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button @click.stop="handleView(itemData)" class="primary">View</button>
              <button @click.stop="handleEdit(itemData)">Edit</button>
              <button @click.stop="handleDelete(itemData.id)" class="danger">Delete</button>
            </div>
          </div>
        </template>

        <!-- Footer 插槽 -->
        <template #footer>
          <div class="grid-footer">
            <p>Total: {{ list.length }} items displayed</p>
          </div>
        </template>

        <!-- Empty 插槽 -->
        <template #empty>
          <div class="empty-state">
            <p>No items available</p>
          </div>
        </template>
      </VirtGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue';
import type { Ref } from 'vue';
import { VirtGrid } from 'vue-virt-list';

// ============ 类型定义 ============
interface GridItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

// ============ 响应式数据 ============
const list: Ref<GridItem[]> = shallowRef([]);
const gridItems = ref(3);
const renderRange = ref({ begin: 0, end: 0 });
const scrollOffset = ref(0);

const virtGridRef = ref<InstanceType<typeof VirtGrid>>();

// ============ 图标池 ============
const icons = ['📦', '📁', '📄', '📊', '📈', '📉', '📋', '📌', '📍', '🔖'];

// ============ 分类池 ============
const categories = ['Documents', 'Images', 'Videos', 'Music', 'Others'];

// ============ 初始化数据 ============
const generateData = (count: number, startId = 0): GridItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Item ${startId + i}`,
    description: `Description for item ${startId + i}`,
    icon: icons[Math.floor(Math.random() * icons.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
};

const initData = () => {
  list.value = generateData(1000);
};

// ============ 滚动控制方法 ============
const scrollToTop = () => {
  virtGridRef.value?.scrollToTop();
};

const scrollToBottom = () => {
  virtGridRef.value?.scrollToBottom();
};

const scrollToRandom = () => {
  const randomIndex = Math.floor(Math.random() * list.value.length);
  virtGridRef.value?.scrollToIndex(randomIndex);
};

// ============ 数据操作方法 ============
const refresh = () => {
  list.value = generateData(1000);
};

const addItems = (count: number = 10) => {
  const newItems = generateData(count, list.value.length);
  list.value = [...list.value, ...newItems];
};

const deleteItem = (id: number) => {
  const index = list.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    list.value.splice(index, 1);
  }
};

// ============ 事件处理 ============
const handleGridItemsChange = () => {
  // VirtGrid 会自动处理 gridItems 变化
  console.log('Grid items changed to:', gridItems.value);
};

const handleScroll = (e: Event) => {
  // 滚动事件处理
};

const handleToBottom = (lastItem: any) => {
  console.log('Scrolled to bottom');
  // 可以在这里触发加载更多
  addItems(10);
};

const handleRangeUpdate = (inViewBegin: number, inViewEnd: number) => {
  renderRange.value = {
    begin: inViewBegin,
    end: inViewEnd,
  };
};

const handleView = (item: GridItem) => {
  console.log('View item:', item);
  alert(`Viewing: ${item.title}\n\nCategory: ${item.category}\nDescription: ${item.description}`);
};

const handleEdit = (item: GridItem) => {
  console.log('Edit item:', item);
  alert(`Edit: ${item.title}`);
};

const handleDelete = (id: number) => {
  if (confirm(`Are you sure you want to delete item ${id}?`)) {
    deleteItem(id);
  }
};

// ============ 工具方法 ============
const getItemClass = (index: number) => {
  return {
    'item-first': index % gridItems.value === 0,
    'item-last': (index + 1) % gridItems.value === 0,
  };
};

// ============ 生命周期 ============
onMounted(() => {
  initData();
  console.log('VirtGrid mounted');
});

// ============ 暴露给父组件 ============
defineExpose({
  scrollToTop,
  scrollToBottom,
  scrollToRandom,
  refresh,
  addItems,
  deleteItem,
});
</script>

<style scoped>
.grid-layout-container {
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
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.actions-bar label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.actions-bar input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.actions-bar button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
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

/* VirtGrid 容器 */
.virt-grid-wrapper {
  flex: 1;
  overflow: hidden;
}

/* Header */
.grid-header {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.grid-header h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.grid-header p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

/* Grid Item */
.grid-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  margin: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #1890ff;
}

.item-icon {
  font-size: 32px;
  text-align: center;
  margin-bottom: 10px;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.item-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.item-actions button {
  flex: 1;
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.2s;
}

.item-actions button:hover {
  background: #40a9ff;
}

.item-actions button.primary {
  background: #52c41a;
}

.item-actions button.primary:hover {
  background: #73d13d;
}

.item-actions button.danger {
  background: #ff4d4f;
}

.item-actions button.danger:hover {
  background: #ff7875;
}

/* Footer */
.grid-footer {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
  color: #666;
  font-size: 13px;
}

/* Empty State */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.empty-state p {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-item {
    min-height: 180px;
  }
}

@media (max-width: 768px) {
  .actions-bar {
    justify-content: center;
  }

  .stats-bar {
    flex-wrap: wrap;
  }

  .item-actions {
    flex-direction: column;
  }

  .grid-item {
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  .actions-bar {
    gap: 10px;
  }

  .actions-bar label {
    width: 100%;
    justify-content: center;
  }

  .item-description {
    -webkit-line-clamp: 1;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .grid-item {
    background: #1f1f1f;
    border-color: #333;
    color: #e0e0e0;
  }

  .grid-item:hover {
    border-color: #40a9ff;
  }

  .item-title {
    color: #e0e0e0;
  }

  .item-description {
    color: #999;
  }

  .item-meta {
    border-top-color: #333;
  }

  .item-actions {
    border-top-color: #333;
  }
}
</style>
