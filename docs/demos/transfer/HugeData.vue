<template>
  <div class="main">
    <!-- operate -->
    <div class="button-group">
      <button class="demo-btn" @click="generateSmallData">Small Data (1K)</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="generateMediumData">Medium Data (10K)</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="generateLargeData">Large Data (50K)</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="generateHugeData">Huge Data (100K)</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="clearData">Clear Data</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="togglePerformanceMode">
        {{ performanceMode ? 'Normal Mode' : 'Performance Mode' }}
      </button>
    </div>

    <!-- render stats -->
    <div style="padding: 10px 0">
      <span>Total: {{ dataSource.length.toLocaleString() }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Target: {{ targetKeys.length.toLocaleString() }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Selected: {{ selectedKeys.length.toLocaleString() }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Source: {{ sourceList.length.toLocaleString() }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Mode: {{ performanceMode ? 'Performance' : 'Normal' }} </span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>Buffer: {{ performanceMode ? '20' : '5' }} </span>
    </div>

    <!-- performance info -->
    <div class="performance-info" v-if="performanceInfo">
      <p><strong>渲染性能:</strong> 基于虚拟滚动，只渲染可视区域内的项目</p>
      <p><strong>内存占用:</strong> 无论数据量多大，内存占用都保持稳定</p>
      <p><strong>滚动性能:</strong> 流畅滚动，无卡顿现象</p>
      <p><strong>搜索性能:</strong> 实时搜索，响应迅速</p>
    </div>

    <!-- demo -->
    <div class="demo-transfer">
      <VirtListTransfer
        v-model:targetKeys="targetKeys"
        v-model:selectedKeys="selectedKeys"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        :showSearch="true"
        :showSelectAll="true"
        :searchPlaceholder="'在大量数据中搜索...'"
        :notFoundContent="'没有找到匹配的数据'"
        :itemHeight="40"
        :buffer="performanceMode ? 20 : 5"
        :listStyle="transferListStyle"
        @change="handleChange"
        @selectChange="handleSelectChange"
        @search="handleSearch"
      />
    </div>

    <!-- status info -->
    <div class="status-info">
      <h4>大数据量性能演示</h4>
      <p><strong>数据总量:</strong> {{ dataSource.length.toLocaleString() }} 条</p>
      <p><strong>目标列表:</strong> {{ targetKeys.length.toLocaleString() }} 条</p>
      <p><strong>源列表:</strong> {{ sourceList.length.toLocaleString() }} 条</p>
      <p><strong>选中项目:</strong> {{ selectedKeys.length.toLocaleString() }} 条</p>
      <p><strong>性能模式:</strong> {{ performanceMode ? '开启（缓冲区20）' : '关闭（缓冲区5）' }}</p>
      <p><strong>虚拟滚动:</strong> 只渲染可视区域内的项目，性能优异</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { VirtListTransfer } from 'vue-virt-list';
import type { TransferItem } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/transfer.css';

// 状态控制
const performanceMode = ref(false);
const performanceInfo = ref(true);

// 数据
const dataSource = ref<TransferItem[]>([]);
const targetKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

// 计算属性
const sourceList = computed(() => {
  return dataSource.value.filter(item => !targetKeys.value.includes(item.key));
});

// 生成测试数据
const generateData = (count: number): TransferItem[] => {
  const data: TransferItem[] = [];
  const categories = ['技术', '产品', '设计', '运营', '市场', '销售', '客服', '财务'];
  const priorities = ['高', '中', '低'];
  
  for (let i = 0; i < count; i++) {
    data.push({
      key: `item-${i}`,
      title: `项目 ${i + 1}`,
      description: `这是第 ${i + 1} 个项目的详细描述信息，包含项目的基本信息和状态`,
      disabled: i % 100 === 0, // 每100个禁用一个
      category: categories[i % categories.length],
      priority: priorities[i % priorities.length],
      id: i + 1,
      createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return data;
};

onBeforeMount(() => {
  // 初始加载小量数据
  dataSource.value = generateData(1000);
  targetKeys.value = ['item-1', 'item-3', 'item-5'];
});

// 自定义样式
const transferListStyle = {
  height: '300px',
  border: '2px solid #1890ff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

// 事件处理
const handleChange = (newTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => {
  console.log('数据移动:', {
    newTargetKeys: newTargetKeys.length,
    direction,
    moveKeys: moveKeys.length,
  });
  // 更新目标列表
  targetKeys.value = newTargetKeys;
};

const handleSelectChange = (selectedKeys: string[], info: {
  sourceSelectedKeys: string[];
  targetSelectedKeys: string[];
}) => {
  console.log('选择变化:', {
    selectedKeys: selectedKeys.length,
    info: {
      sourceSelectedKeys: info.sourceSelectedKeys.length,
      targetSelectedKeys: info.targetSelectedKeys.length,
    },
  });
};

const handleSearch = (direction: 'left' | 'right', value: string) => {
  console.log('搜索:', {
    direction,
    value,
    dataLength: dataSource.value.length,
  });
};

// 操作函数
const generateSmallData = () => {
  performanceInfo.value = false;
  dataSource.value = generateData(1000);
  targetKeys.value = [];
  selectedKeys.value = [];
};

const generateMediumData = () => {
  performanceInfo.value = false;
  dataSource.value = generateData(10000);
  targetKeys.value = [];
  selectedKeys.value = [];
};

const generateLargeData = () => {
  performanceInfo.value = false;
  dataSource.value = generateData(50000);
  targetKeys.value = [];
  selectedKeys.value = [];
};

const generateHugeData = () => {
  performanceInfo.value = false;
  dataSource.value = generateData(100000);
  targetKeys.value = [];
  selectedKeys.value = [];
};

const clearData = () => {
  dataSource.value = [];
  targetKeys.value = [];
  selectedKeys.value = [];
};

const togglePerformanceMode = () => {
  performanceMode.value = !performanceMode.value;
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

.performance-info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 12px;
  margin: 16px 0;

  p {
    margin: 4px 0;
    font-size: 14px;
    color: #1890ff;

    strong {
      color: #0050b3;
    }
  }
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