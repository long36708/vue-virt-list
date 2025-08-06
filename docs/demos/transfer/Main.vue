<template>
  <div class="main">
    <!-- operate -->
    <div class="button-group">
      <button class="demo-btn" @click="resetData">Reset Data</button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="toggleSearch">
        {{ showSearch ? 'Hide Search' : 'Show Search' }}
      </button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="toggleSelectAll">
        {{ showSelectAll ? 'Hide Select All' : 'Show Select All' }}
      </button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="toggleOneWay">
        {{ oneWay ? 'Disable One Way' : 'Enable One Way' }}
      </button>
      <span>&nbsp;</span>
      <button class="demo-btn" @click="toggleDisabled">
        {{ disabled ? 'Enable' : 'Disable' }}
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
    </div>

    <!-- demo -->
    <div class="demo-transfer">
      <VirtListTransfer
        v-model:targetKeys="targetKeys"
        v-model:selectedKeys="selectedKeys"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        :showSearch="showSearch"
        :showSelectAll="showSelectAll"
        :oneWay="oneWay"
        :disabled="disabled"
        :searchPlaceholder="'请输入搜索关键词'"
        :notFoundContent="'没有数据'"
        :itemHeight="40"
        :buffer="5"
        :listStyle="{ height: '300px' }"
        @change="handleChange"
        @selectChange="handleSelectChange"
        @search="handleSearch"
        @scroll="handleScroll"
      />
    </div>

    <!-- status info -->
    <div class="status-info">
      <h4>当前状态</h4>
      <p><strong>目标列表 Keys:</strong> {{ targetKeys.join(', ') || '无' }}</p>
      <p><strong>选中 Keys:</strong> {{ selectedKeys.join(', ') || '无' }}</p>
      <p><strong>源列表数量:</strong> {{ sourceList.length }}</p>
      <p><strong>目标列表数量:</strong> {{ targetKeys.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { VirtListTransfer } from 'vue-virt-list';
import type { TransferItem } from 'vue-virt-list';
// import 'vue-virt-list/lib/assets/transfer.css';

// 状态控制
const showSearch = ref(true);
const showSelectAll = ref(true);
const oneWay = ref(false);
const disabled = ref(false);

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
  for (let i = 0; i < count; i++) {
    data.push({
      key: `item-${i}`,
      title: `选项 ${i + 1}`,
      description: `这是选项 ${i + 1} 的描述信息`,
      disabled: i % 10 === 0, // 每10个禁用一个
    });
  }
  return data;
};

onBeforeMount(() => {
  dataSource.value = generateData(100);
  targetKeys.value = ['item-1', 'item-3', 'item-5'];
});

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

const handleScroll = (direction: 'left' | 'right', event: Event) => {
  console.log('滚动:', {
    direction,
    event,
  });
};

// 操作函数
const resetData = () => {
  dataSource.value = generateData(100);
  targetKeys.value = ['item-1', 'item-3', 'item-5'];
  selectedKeys.value = [];
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

const toggleSelectAll = () => {
  showSelectAll.value = !showSelectAll.value;
};

const toggleOneWay = () => {
  oneWay.value = !oneWay.value;
};

const toggleDisabled = () => {
  disabled.value = !disabled.value;
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