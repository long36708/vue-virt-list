<template>
  <div class="main">
    <!-- operate -->
    <div class="button-group">
      <button class="demo-btn" @click="addMoreData">Add More Data</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="clearAll">Clear All</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="moveAllToTarget">Move All to Target</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="moveAllToSource">Move All to Source</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="toggleCustomFilter">
        {{ useCustomFilter ? 'Use Default Filter' : 'Use Custom Filter' }}
      </button>
    </div>

    <!-- render stats -->
    <div style="padding: 10px 0">
      <span>Total: {{ dataSource.length }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Target: {{ targetKeys.length }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Selected: {{ selectedKeys.length }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Source: {{ sourceList.length }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Filter: {{ useCustomFilter ? 'Custom' : 'Default' }} </span>
    </div>

    <!-- demo -->
    <div class="demo-transfer">
      <VirtListTransfer
        v-model:targetKeys="targetKeys"
        v-model:selectedKeys="selectedKeys"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['→', '←']"
        :showSearch="true"
        :showSelectAll="true"
        :filterOption="useCustomFilter ? customFilter : undefined"
        :searchPlaceholder="'搜索标题、描述或ID'"
        :notFoundContent="'没有找到匹配的数据'"
        :itemHeight="50"
        :buffer="10"
        :listStyle="customListStyle"
        :itemStyle="customItemStyle"
        :headerStyle="customHeaderStyle"
        @change="handleChange"
        @selectChange="handleSelectChange"
        @search="handleSearch"
      />
    </div>

    <!-- status info -->
    <div class="status-info">
      <h4>高级功能演示</h4>
      <p><strong>目标列表 Keys:</strong> {{ targetKeys.join(', ') || '无' }}</p>
      <p><strong>选中 Keys:</strong> {{ selectedKeys.join(', ') || '无' }}</p>
      <p><strong>源列表数量:</strong> {{ sourceList.length }}</p>
      <p><strong>目标列表数量:</strong> {{ targetKeys.length }}</p>
      <p><strong>过滤模式:</strong> {{ useCustomFilter ? '自定义过滤（支持标题、描述、ID搜索）' : '默认过滤（仅标题搜索）' }}</p>
      <p><strong>自定义样式:</strong> 列表项根据索引显示不同背景色，禁用项显示红色边框</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { VirtListTransfer } from 'vue-virt-list';
import type { TransferItem } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/transfer.css';

// 状态控制
const useCustomFilter = ref(true);

// 数据
const dataSource = ref<TransferItem[]>([]);
const targetKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

// 计算属性
const sourceList = computed(() => {
  return dataSource.value.filter(item => !targetKeys.value.includes(item.key));
});

// 生成测试数据
const generateData = (count: number, startIndex: number = 0): TransferItem[] => {
  const data: TransferItem[] = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    data.push({
      key: `item-${index}`,
      title: `选项 ${index + 1}`,
      description: `这是选项 ${index + 1} 的详细描述信息，包含更多内容`,
      disabled: index % 15 === 0, // 每15个禁用一个
      category: index % 3 === 0 ? 'A类' : index % 3 === 1 ? 'B类' : 'C类',
      priority: index % 5 === 0 ? '高' : index % 5 === 1 ? '中' : '低',
    });
  }
  return data;
};

onBeforeMount(() => {
  dataSource.value = generateData(50);
  targetKeys.value = ['item-1', 'item-3', 'item-5'];
});

// 自定义过滤函数
const customFilter = (inputValue: string, item: TransferItem): boolean => {
  const searchValue = inputValue.toLowerCase();
  return (
    item.title.toLowerCase().includes(searchValue) ||
    item.description?.toLowerCase().includes(searchValue) ||
    item.key.toLowerCase().includes(searchValue) ||
    item.category?.toLowerCase().includes(searchValue) ||
    item.priority?.toLowerCase().includes(searchValue)
  );
};

// 自定义样式
const customListStyle = {
  height: '300px',
  border: '2px solid #1890ff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const customItemStyle = (item: TransferItem, index: number) => ({
  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
  borderLeft: item.disabled ? '4px solid #ff4d4f' : '4px solid #52c41a',
  borderRadius: '4px',
  margin: '2px 0',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#e6f7ff',
    transform: 'translateX(4px)',
  },
});

const customHeaderStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '6px 6px 0 0',
};

// 事件处理
const handleChange = (newTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => {
  console.log('数据移动:', {
    newTargetKeys,
    direction,
    moveKeys,
  });
  // 更新目标列表
  targetKeys.value = newTargetKeys;
};

const handleSelectChange = (selectedKeys: string[], info: {
  sourceSelectedKeys: string[];
  targetSelectedKeys: string[];
}) => {
  console.log('选择变化:', {
    selectedKeys,
    info,
  });
};

const handleSearch = (direction: 'left' | 'right', value: string) => {
  console.log('搜索:', {
    direction,
    value,
  });
};

// 操作函数
const addMoreData = () => {
  const newData = generateData(20, dataSource.value.length);
  dataSource.value = [...dataSource.value, ...newData];
};

const clearAll = () => {
  targetKeys.value = [];
  selectedKeys.value = [];
};

const moveAllToTarget = () => {
  const allKeys = dataSource.value.map(item => item.key);
  targetKeys.value = [...targetKeys.value, ...allKeys.filter(key => !targetKeys.value.includes(key))];
};

const moveAllToSource = () => {
  targetKeys.value = [];
};

const toggleCustomFilter = () => {
  useCustomFilter.value = !useCustomFilter.value;
};
</script>

<style lang="scss" scoped>
.demo-transfer {
  background-color: var(--vp-sidebar-bg-color);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.status-info {
  background-color: var(--vp-sidebar-bg-color);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;

  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    color: var(--vp-c-text-1);
  }

  p {
    margin: 8px 0;
    font-size: 14px;
    color: var(--vp-c-text-2);

    strong {
      color: var(--vp-c-text-1);
    }
  }
}

.button-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--vp-c-bg-soft);
    border-color: var(--vp-c-brand);
  }

  &:active {
    background-color: var(--vp-c-bg-mute);
  }
}
</style> 