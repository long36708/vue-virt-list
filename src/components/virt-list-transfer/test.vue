<template>
  <div class="test-container">
    <h2>VirtListTransfer 测试</h2>
    
    <div class="test-info">
      <p>数据源数量: {{ dataSource.length }}</p>
      <p>目标列表数量: {{ targetKeys.length }}</p>
      <p>源列表数量: {{ sourceList.length }}</p>
    </div>

    <VirtListTransfer
      v-model:targetKeys="targetKeys"
      v-model:selectedKeys="selectedKeys"
      :dataSource="dataSource"
      :titles="['源列表', '目标列表']"
      :operations="['>', '<']"
      :showSearch="true"
      :showSelectAll="true"
      @change="handleChange"
      @selectChange="handleSelectChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VirtListTransfer } from 'vue-virt-list';
import type { TransferItem } from 'vue-virt-list';
import './transfer.css';

// 生成测试数据
const generateData = (): TransferItem[] => {
  const data: TransferItem[] = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      key: `item-${i}`,
      title: `选项 ${i + 1}`,
      description: `描述 ${i + 1}`,
      disabled: i % 5 === 0,
    });
  }
  return data;
};

const dataSource = ref<TransferItem[]>(generateData());
const targetKeys = ref<string[]>(['item-1', 'item-3']);
const selectedKeys = ref<string[]>([]);

const sourceList = computed(() => {
  return dataSource.value.filter(item => !targetKeys.value.includes(item.key));
});

const handleChange = (newTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => {
  console.log('数据移动:', { newTargetKeys, direction, moveKeys });
};

const handleSelectChange = (selectedKeys: string[], info: {
  sourceSelectedKeys: string[];
  targetSelectedKeys: string[];
}) => {
  console.log('选择变化:', { selectedKeys, info });
};
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-info {
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.test-info p {
  margin: 5px 0;
  font-size: 14px;
}
</style> 